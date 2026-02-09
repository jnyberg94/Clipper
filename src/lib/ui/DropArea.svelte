<script>
    import Icon from "./Icon.svelte";
    import { FileArrowUp } from "phosphor-svelte";
    import { getCurrentWebview } from '@tauri-apps/api/webview';
    import { onMount } from "svelte";
    import { invoke } from "@tauri-apps/api/core";

    let { onFolderSelect } = $props()

    let isDragging = $state(false);

    onMount(()=>{
		// Set up Tauri drag-drop listener
		let unlisten;
		const setupDragDrop = async () => {
			unlisten = await getCurrentWebview().onDragDropEvent(async (event) => {
				if (event.payload.type === 'over') {
					isDragging = true;
				} else if (event.payload.type === 'leave' || event.payload.type === 'cancel') {
					isDragging = false;
				} else if (event.payload.type === 'drop') {
					isDragging = false;
					const paths = event.payload.paths;

					if (paths && paths.length > 0) {
                        console.log('paths', paths)
						try {
							await invoke('focus_window');
                            await onFolderSelect(paths[0])
						} catch (error) {
							console.error('Failed to focus window:', error);
						}
					}
				}
			});
		};
		setupDragDrop();

		return () => {
			if (unlisten) unlisten();
		};
    })

</script>

<div class:dragging={isDragging} class="drop-area flex-vert just-cont-center align-items-center gap-sm">
    <div class:dragging={isDragging} class="drop-card padding-sm">
        <Icon icon={FileArrowUp} size="xxl" variant="blue" />
    </div>

    <h4>
        <button onclick={()=> onFolderSelect()}><span class="underline bold text-active">Choose folder</span></button>
        <span class="text-grey">Or</span>
        <span class="text-grey bold">Drag and drop</span>
    </h4>

</div>

<style>
    .drop-area {
        width: 100%;
        height: 200px;
        background-color: var(--bg-active);
        border-width: 1px;
        border-style: dashed;
        border-color: var(--active);
        border-radius: 20px;
    }

    .drop-card {
        background-color: var(--bg-dark-active);
        width: min-content;
        border-radius: var(--sm);
    }

    .drop-area.dragging {
        border: 1px var(--success) dashed;
        background-color: var(--bg-success);
    }

    .drop-card.dragging {
        background-color: var(--bg-dark-success);
    }
</style>
