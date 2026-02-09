<script>
	import Topbar from "$lib/ui/Topbar.svelte";
	import Bottombar from "$lib/ui/Bottombar.svelte";
	import DropArea from "$lib/ui/DropArea.svelte";
	import AnalyzeItem from "$lib/ui/AnalyzeItem.svelte";
	import ProgressItem from "$lib/ui/ProgressItem.svelte";
	import { sortFilesEngine } from "$lib/processors/sortFilesEngine";
	import { relocateFiles } from "$lib/utils/relocateFiles";
	import { open } from "@tauri-apps/plugin-dialog";
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import { onMount } from "svelte";
	import { requestNotificationPermission } from "$lib/utils/notification";
	import { showNotification } from "$lib/utils/notification";
	import { event } from "@tauri-apps/api";

	let isAnalyzing = $state(false);
	let isProcessing = $state(false);
	let files = $state(null);
	let currentFile = $state({ name: "", progress: 0 });
	let queueProgress = $state({
		currentFile: 0,
		totalFiles: 0,
		fileName: "",
		fileProgress: 0,
		overallProgress: 0,
		estimatedRemainingSeconds: 0,
		processingSpeed: 0,
	});

	onMount(async () => {
		await requestNotificationPermission();

		const unlisten = listen("queue-progress", (event) => {
			queueProgress = event.payload;
		});

		return () => {
			unlisten.then((fn) => fn());
		};
	});

	async function handleFolderSelect(folder) {
		if (!folder) {
			const selected = await open({
				multiple: false,
				directory: true,
			});
			if (!selected) return;

			folder = selected;
		}

		isAnalyzing = true;
		const filesToConvert = await sortFilesEngine(folder);

		files = await relocateFiles(filesToConvert.toProcess);

		queueProgress = {
			currentFile: 0,
			totalFiles: 0,
			fileName: "",
			fileProgress: 0,
			overallProgress: 0,
			estimatedRemainingSeconds: 0,
			processingSpeed: 0,
		};

		isAnalyzing = false;
		isProcessing = true;

		const result = await invoke("process_video_queue", {
			toProcess: files,
			outputDir: folder,
		});

		await showNotification(
			"Clipper Processing Complete!",
			`Successfully processed ${files.length} files`,
		);
	}

	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}


	function getItemProgress(index) {
        const currentIndex = queueProgress.currentFile - 1;

        if (index < currentIndex) {
            return 100;
        } else if (index === currentIndex) {
            return queueProgress.fileProgress;
        } else {
            return 0;
        }
    }
</script>

<Topbar />

<div class="inner-content margin-sm">
	<DropArea onFolderSelect={handleFolderSelect} />
	<div class="item-container">
		<AnalyzeItem {isAnalyzing} />
		{#each files as file, index (file.name)}
			<ProgressItem
				fileName={file.name}
				progress={getItemProgress(index)}
			/>
		{/each}
	</div>
</div>

<Bottombar
	currentProcessed={queueProgress.currentFile}
	totalProcessed={queueProgress.totalFiles}
	{isProcessing}
	time={queueProgress.estimatedRemainingSeconds * 1000}
	processingSpeed={queueProgress.processingSpeed}
/>

<style>
	.inner-content {
		margin-top: var(--xxl);
	}

	.item-container {
		margin: var(--lg) var(--sm);
	}
</style>
