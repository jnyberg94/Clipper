use tauri::Emitter;
use regex::Regex;
use std::process::{Command, Stdio};
use std::io::{BufReader, BufRead};
use std::time::{Instant, Duration};
use std::path::PathBuf;
use std::fs;
use serde::Deserialize;
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};

// For drag and drop
#[tauri::command]
async fn focus_window(window: tauri::WebviewWindow) -> Result<(), String> {
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

struct ProcessingState {
    pub cancel_flag: Arc<AtomicBool>
}

#[tauri::command]
fn cancel_processing(state: tauri::State<ProcessingState>) {
    state.cancel_flag.store(true, Ordering::SeqCst)
}

struct QueueItem {
    path: PathBuf,
    output_path: PathBuf,
    name: String,
    duration: f64,
}

#[derive(Deserialize)]
struct VideoItem {
    path: PathBuf,
    output_path: PathBuf,
    name: String,
}

#[tauri::command]
async fn process_video_queue(
    app: tauri::AppHandle,
    state: tauri::State<'_, ProcessingState>,
    to_process: Vec<VideoItem>, 
    //output_dir: String
) -> Result<String, String> {
    println!("Starting video processing queue with {} items", to_process.len());
    
    //reset flag
    state.cancel_flag.store(false, Ordering::SeqCst);
    let cancel_flag = Arc::clone(&state.cancel_flag);
    
    let mut queue_items: Vec<QueueItem> = Vec::new();
    let mut total_queue_duration = 0.0;

    app.emit("queue-status", "Analyzing queue...").ok();

    for item in to_process {
        let input_path = PathBuf::from(&item.path);
        let duration = get_video_duration(&input_path).unwrap_or(0.0);
        
        total_queue_duration += duration;
        queue_items.push(QueueItem {
            path: input_path,
            output_path: item.output_path,
            name: item.name,
            duration,
        });
    }

    if total_queue_duration == 0.0 {
        return Err("Total queue duration is zero. Cannot process.".to_string());
    }

    let start_time = Instant::now();
    let mut accumulated_duration_finished = 0.0; 
    let mut last_emit = Instant::now(); 

    // 2. PROCESSING LOOP
    for (index, item) in queue_items.iter().enumerate() {
        if cancel_flag.load(Ordering::SeqCst) {
            return Err("Cancelled by user".to_string())
        }

        let current_file_index = index + 1;
        let total_files = queue_items.len();
        
        println!("[{}/{}] Processing: {} ({}s)", current_file_index, total_files, item.name, item.duration);
        
        let output_path = item.output_path.clone(); //PathBuf::from(&output_dir);
        //output_path.push(&item.name);

        if let Some(parent) = output_path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create directories: {}", e))?;
            }
        }

        let mut child = Command::new("ffmpeg")
            .arg("-i").arg(&item.path)
            .arg("-progress").arg("pipe:1")
            .arg("-r").arg("60")
            .arg("-c:v").arg("h264_videotoolbox")
            .arg("-b:v").arg("13M")
            .arg("-c:a").arg("copy")
            .arg("-y")
            .arg(&output_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to spawn FFmpeg: {}", e))?;

        if let Some(stdout) = child.stdout.take() {
            let reader = BufReader::new(stdout);
            let time_regex = Regex::new(r"out_time_ms=(\d+)").unwrap();
            
            for line in reader.lines() {

                if cancel_flag.load(Ordering::SeqCst) {
                    child.kill().ok();
                    return Err("Cancelled by user".to_string())
                }

                if let Ok(line) = line {
                    if let Some(caps) = time_regex.captures(&line) {
                        if let Some(time_match) = caps.get(1) {
                            if let Ok(time_us) = time_match.as_str().parse::<f64>() {
                                
                                let current_file_processed_seconds = time_us / 1_000_000.0;
                                
                                // 1. Calculate Total Work Done (Global)
                                let total_processed_seconds = accumulated_duration_finished + current_file_processed_seconds;
                                
                                // 2. Calculate Real Time Elapsed
                                let elapsed_real_seconds = start_time.elapsed().as_secs_f64();

                                // 3. Calculate Speed Factor (Video Seconds per Real Second)
                                // Avoid division by zero at the very start
                                let speed_factor = if elapsed_real_seconds > 0.1 {
                                    total_processed_seconds / elapsed_real_seconds
                                } else {
                                    0.0
                                };

                                // 4. Calculate ETA
                                let remaining_work_seconds = (total_queue_duration - total_processed_seconds).max(0.0);
                                
                                let eta_seconds = if speed_factor > 0.0 {
                                    (remaining_work_seconds / speed_factor) as u64
                                } else {
                                    0 // Calculating...
                                };

                                // 5. Throttle updates (e.g., every 500ms) to keep UI performant
                                if last_emit.elapsed() > Duration::from_millis(500) {
                                    // Calculate single file progress for the progress bar
                                    let file_progress = ((current_file_processed_seconds / item.duration) * 100.0).min(100.0);

                                    app.emit("queue-progress", serde_json::json!({
                                        "currentFile": current_file_index,
                                        "totalFiles": total_files,
                                        "fileName": item.name,
                                        "fileProgress": file_progress,
                                        "overallProgress": (total_processed_seconds / total_queue_duration * 100.0).min(100.0),
                                        "estimatedRemainingSeconds": eta_seconds,
                                        "processingSpeed": format!("{:.2}x", speed_factor) // Optional: Show user speed (e.g. 2.5x)
                                    })).ok();
                                    
                                    last_emit = Instant::now();
                                }
                            }
                        }
                    }
                }
            }
        }
        
        let status = child.wait().map_err(|e| format!("Wait failed: {}", e))?;
        if !status.success() {
            return Err(format!("FFmpeg failed on file: {}", item.name));
        }

        // Add this file's full duration to the accumulator for the next loop
        accumulated_duration_finished += item.duration;
    }
    
    // Final success event
    app.emit("queue-progress", serde_json::json!({
        "estimatedRemainingSeconds": 0,
        "overallProgress": 100.0
    })).ok();

    Ok("All files processed successfully".into())
}


fn get_video_duration(input_path: &PathBuf) -> Result<f64, String> {
    let output = Command::new("ffprobe")
        .arg("-v").arg("error")
        .arg("-show_entries").arg("format=duration")
        .arg("-of").arg("default=noprint_wrappers=1:nokey=1")
        .arg(input_path)
        .output()
        .map_err(|e| format!("Failed to get duration: {}", e))?;
    
    let duration_str = String::from_utf8_lossy(&output.stdout);
    duration_str.trim()
        .parse::<f64>()
        .map_err(|e| format!("Failed to parse duration: {}", e))
}



#[tauri::command]
fn get_video_fps(path: String) -> Result<f64, String> {

    let output = Command::new("ffprobe")
        .args([
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=avg_frame_rate",
            "-of", "default=noprint_wrappers=1:nokey=1",
            &path
        ])
        .output()
        .map_err(|e| e.to_string())?;

    let fps_string = String::from_utf8_lossy(&output.stdout);
    let fps_string = fps_string.trim();
    
    if let Some((num, den)) = fps_string.split_once('/') {
        let numerator: f64 = num.parse().map_err(|e| format!("Parse error: {}", e))?;
        let denominator: f64 = den.parse().map_err(|e| format!("Parse error: {}", e))?;
        Ok(numerator / denominator)
    } else {
        Err("Invalid FPS format".to_string())
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            process_video_queue,
            get_video_fps,
            focus_window,
            cancel_processing
            ])
        .manage(ProcessingState{
            cancel_flag: Arc::new(AtomicBool::new(false)),
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
