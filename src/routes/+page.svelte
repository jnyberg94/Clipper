<script>
	//UI imports
	import Topbar from "$lib/ui/Topbar.svelte";
	import Bottombar from "$lib/ui/Bottombar.svelte";
	import DropArea from "$lib/ui/DropArea.svelte";
	import AnalyzeItem from "$lib/ui/AnalyzeItem.svelte";
	import ProgressItem from "$lib/ui/ProgressItem.svelte";
	import GroupItem from "$lib/ui/GroupItem.svelte";

	//logic imports
	import { sortFilesEngine } from "$lib/processors/sortFilesEngine";
	import { relocateFiles } from "$lib/utils/relocateFiles";
	import { onMount } from "svelte";
	import { requestNotificationPermission } from "$lib/utils/notification";
	import { showNotification } from "$lib/utils/notification";
	import { flattenEverything } from "$lib/utils/flattenEverything";
	import { folderStats } from "$lib/stores/folderStats";
	import { getItemProgress } from "$lib/utils/getItemProgress";
	import { createFileStructure } from "$lib/utils/createFileStructure";
	// import { resetQueue }

	//tauri imports
	import { event } from "@tauri-apps/api";
	import { open } from "@tauri-apps/plugin-dialog";
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import { create } from "@tauri-apps/plugin-fs";

	let isAnalyzing = $state(false);
	let isProcessing = $state(false);
	let currentFile = $state({ name: "", progress: 0 });
	let uiFiles = $state({ folders: [], toProcess: [] });

	// ======= TMP start

	// const uiFiles = {
	// 	folders: [
	// 		{
	// 			name: "Test Folder",
	// 			originalPath: "/Users/kolejain/Files/Design kits/Test Folder",
	// 			path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Test Folder",
	// 			folders: [],
	// 			toProcess: [
	// 				{
	// 					globalIndex: 0,
	// 					name: "Demo1 copy.mov",
	// 					originalPath:
	// 						"/Users/kolejain/Files/Design kits/Test Folder/Demo1 copy.mov",
	// 					path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Test Folder/Demo1 copy.mov",
	// 					fps: 55.66265060240964,
	// 					targetFps: 60,
	// 					reason: "Variable framerate recording",
	// 				},
	// 				{
	// 					globalIndex: 1,
	// 					name: "Demo2.mov",
	// 					originalPath:
	// 						"/Users/kolejain/Files/Design kits/Test Folder/Demo2.mov",
	// 					path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Test Folder/Demo2.mov",
	// 					fps: 58.2,
	// 					targetFps: 60,
	// 					reason: "Variable framerate recording",
	// 				},
	// 			],
	// 		},
	// 		{
	// 			name: "Another Folder",
	// 			originalPath:
	// 				"/Users/kolejain/Files/Design kits/Another Folder",
	// 			path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Another Folder",
	// 			folders: [],
	// 			toProcess: [
	// 				{
	// 					globalIndex: 3,
	// 					name: "Demo3.mov",
	// 					originalPath:
	// 						"/Users/kolejain/Files/Design kits/Another Folder/Demo3.mov",
	// 					path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Another Folder/Demo3.mov",
	// 					fps: 59.94,
	// 					targetFps: 60,
	// 					reason: "Variable framerate recording",
	// 				},
	// 			],
	// 		},
	// 	],
	// 	toProcess: [
	// 		{
	// 			globalIndex: 4,
	// 			name: "Demo6.mov",
	// 			originalPath: "/Users/kolejain/Files/Design kits/Demo6.mov",
	// 			path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Demo6.mov",
	// 			fps: 56.319702602230485,
	// 			targetFps: 60,
	// 			reason: "Variable framerate recording",
	// 		},
	// 		{
	// 			globalIndex: 5,
	// 			name: "Demo1.mov",
	// 			originalPath: "/Users/kolejain/Files/Design kits/Demo1.mov",
	// 			path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Demo1.mov",
	// 			fps: 55.66265060240964,
	// 			targetFps: 60,
	// 			reason: "Variable framerate recording",
	// 		},
	// 		{
	// 			globalIndex: 6,
	// 			name: "Demo4.mov",
	// 			originalPath: "/Users/kolejain/Files/Design kits/Demo4.mov",
	// 			path: "/Users/kolejain/Library/Application Support/com.kolejain.clipper/tmp/Demo4.mov",
	// 			fps: 57.8,
	// 			targetFps: 60,
	// 			reason: "Variable framerate recording",
	// 		},
	// 	],
	// };

	// ======== TMP end

	let rustFiles = $state([]);
	let queueProgress = $state({
		currentFile: 0,
		totalFiles: 0,
		fileName: "",
		fileProgress: 0,
		overallProgress: 0,
		estimatedRemainingSeconds: 0,
		processingSpeed: 0,
	});

	$effect(()=>{
		console.log('queueProgress', queueProgress)
	})

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
		const files = await relocateFiles(filesToConvert);
		folderStats.refresh();

		const struct = createFileStructure(files.folders, files.toProcess);
		uiFiles = struct.uiFiles;
		rustFiles = struct.rustFiles;

		isAnalyzing = false;

		isProcessing = true;

		const result = await invoke("process_video_queue", {
			toProcess: rustFiles,
			outputDir: folder,
		});

		isProcessing = false;

		await showNotification(
			"Clipper Processing Complete!",
			`Successfully processed ${rustFiles.length} files`,
		);
	}

	onMount(async () => {
		await requestNotificationPermission();
		const unlisten = listen("queue-progress", (event) => {
			queueProgress = event.payload;
		});
		return () => {
			unlisten.then((fn) => fn());
		};
	});
</script>

<Topbar />

<div class="inner-content margin-sm">
	<DropArea onFolderSelect={handleFolderSelect} />
	<div class="item-container">
		<AnalyzeItem {isAnalyzing} />
		<div class="flex-vert gap-xs">
			<div class="flex-vert gap-xs">
				{#each uiFiles?.folders as folder (folder.name)}
					<GroupItem
						folderName={folder.name}
						itemsInGroup={folder.toProcess.length}
					>
						{#snippet children()}
							{#each folder.toProcess as file (file.name)}
								<ProgressItem
									fileName={file.name}
									progress={getItemProgress(
										file.globalIndex,
										queueProgress.currentFile,
										queueProgress.fileProgress,
									)}
									isNested={true}
								/>
							{/each}
						{/snippet}
					</GroupItem>
				{/each}
			</div>

			<div class="flex-vert">
				{#each uiFiles?.toProcess as file, index (file.name)}
					<ProgressItem
						fileName={file.name}
						progress={getItemProgress(
							file.globalIndex,
							queueProgress.currentFile,
							queueProgress.fileProgress,
						)}
					/>
				{/each}
			</div>
		</div>
	</div>
</div>

<Bottombar
	currentProcessed={queueProgress.currentFile}
	totalProcessed={queueProgress.totalFiles}
	{isProcessing}
	time={queueProgress.estimatedRemainingSeconds * 1000}
	processingSpeed={queueProgress.processingSpeed}
/>

<!-- {#each rustFiles as item}
			{#if item.type === "folder"}
				<GroupItem folderName={item.name} itemsInGroup={item.count} />
			{:else}
				<ProgressItem
					fileName={item.data.name}
					progress={getItemProgress(
						item.globalIndex,
						queueProgress.currentFile,
						queueProgress.fileProgress,
					)}
				/>
			{/if}
		{/each} -->

<style>
	.inner-content {
		margin-top: var(--xxl);
	}

	.item-container {
		margin: var(--lg) var(--sm);
	}
</style>
