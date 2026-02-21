<script>
    import { Trash, StackMinus, FadersHorizontal } from "phosphor-svelte";
    import Icon from "./Icon.svelte";
    import { getFolderStats } from "$lib/utils/getFolderStats";
    import { folderStats } from "$lib/stores/folderStats";
    import { onMount } from "svelte";
    import { deleteTmpFolder } from "$lib/utils/deleteTmpFolder";
    import Menu from "./Menu.svelte";
    import { invoke } from "@tauri-apps/api/core";
    import { show } from "@tauri-apps/api/app";

    let { resetQueue } = $props();

    let showMenu = $state(false);
    let menuComponent = $state(null);

    function handleOuterClick(e) {
        if (!e.target.closest(".relative")) {
            menuComponent?.saveRules();
            showMenu = false;
        }
    }

    async function handleDelete() {
        await deleteTmpFolder();
        await folderStats.refresh();
    }

    async function cancelProcessing() {
        await invoke("cancel_processing");
        resetQueue();
    }

    onMount(() => {
        folderStats.refresh();
    });
</script>

<svelte:window onclick={handleOuterClick} />

<div class="topbar flex-horiz gap-xs relative align-items-center" data-tauri-drag-region>
    <div class="flex-horiz gap-xs absolute traffic-light-cont">
        <div class="traffic-light"></div>
        <div class="traffic-light"></div>
        <div class="traffic-light"></div>
    </div>

        <button onclick={handleDelete} class="hover flex-horiz gap-xms">
            <h4 class="text-grey">
                {`${$folderStats.count} items, ${$folderStats.formattedSize}`}
            </h4>
            <Icon icon={Trash} size="lg" variant="grey" />
        </button>
        <button onclick={cancelProcessing} class="hover">
            <Icon icon={StackMinus} size="lg" variant="grey" />
        </button>
        <div class="relative">
            <button
                onclick={() => (showMenu = !showMenu)}
                class:active={showMenu}
                class="hover"
            >
                <Icon icon={FadersHorizontal} size="lg" variant="grey" />
            </button>
            {#if showMenu}
                <Menu bind:this={menuComponent} />
            {/if}
        </div>

</div>

<style>

    .traffic-light-cont {
        top: 18px;
        left: 24.6px;
    }

    .traffic-light {
        width: 12px;
        height: 12px;
        background-color: var(--stroke);
        border-radius: 50%;
    }

    .topbar {
        justify-content: flex-end;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        padding: 0 var(--md);
    }

    .active {
        background-color: var(--bg-3);
    }

    h4.text-grey {
        padding-left: var(--xxs);
    }
</style>
