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
	import { folderStats } from "$lib/stores/folderStats";
	import { getItemProgress } from "$lib/utils/getItemProgress";
	import { createFileStructure } from "$lib/processors/createFileStructure";

	//tauri imports
	import { event } from "@tauri-apps/api";
	import { open } from "@tauri-apps/plugin-dialog";
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import { create } from "@tauri-apps/plugin-fs";
    import SuccessMessage from "$lib/ui/SuccessMessage.svelte";

	let successComponent = $state(null)
	let isAnalyzing = $state(false);
	let isProcessing = $state(false);
	let currentFile = $state({ name: "", progress: 0 });
	let uiFiles = $state({ folders: [], toProcess: [] });
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

		try {
			await invoke("process_video_queue", {
				toProcess: rustFiles,
				//outputDir: folder,
			});

			await showNotification(
				"Clipper Processing Complete!",
				`Successfully processed ${rustFiles.length} files`,
			);
		} catch (err) {
			if (err != " Cancelled by user") {
				console.error(err);
			}
		}

		resetQueue()

		successComponent?.processingComplete()
	}

	function resetQueue() {
		queueProgress = {
			currentFile: 0,
			totalFiles: 0,
			fileName: "",
			fileProgress: 0,
			overallProgress: 0,
			estimatedRemainingSeconds: 0,
			processingSpeed: 0,
		};

		uiFiles = { folders: [], toProcess: [] };

		isProcessing = false;

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

<Topbar {resetQueue} />

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
						isExpanded={folder.toProcess.some(
							(f) =>
								f.globalIndex === queueProgress.currentFile - 1,
						)}
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
	currentProcessed={(queueProgress.currentFile - 1)}
	totalProcessed={queueProgress.totalFiles}
	{isProcessing}
	time={queueProgress.estimatedRemainingSeconds * 1000}
	processingSpeed={queueProgress.processingSpeed}
/>

<SuccessMessage bind:this={successComponent} />

<style>
	.inner-content {
		margin-top: var(--xxl);
	}

	.item-container {
		margin: var(--lg) var(--sm);
	}
</style>
