<script>
    import { Trash, StackMinus, FadersHorizontal } from "phosphor-svelte";
    import Icon from "./Icon.svelte";
    import { getFolderStats } from "$lib/utils/getFolderStats";
    import { folderStats } from "$lib/stores/folderStats";
    import { onMount } from "svelte";
    import { deleteTmpFolder } from "$lib/utils/deleteTmpFolder";
    import Menu from "./Menu.svelte";

    async function handleDelete() {
        await deleteTmpFolder();
        await folderStats.refresh();
    }

    onMount(() => {
        folderStats.refresh();
    });
</script>

<div class="topbar align-items-center flex-horiz gap-xs" data-tauri-drag-region>
    <button onclick={handleDelete} class="hover flex-horiz gap-xms">
        <h4 class="text-grey">
            {`${$folderStats.count} items, ${$folderStats.formattedSize}`}
        </h4>
        <Icon icon={Trash} size="lg" variant="grey" />
    </button>
    <button class="hover">
        <Icon icon={StackMinus} size="lg" variant="grey" />
    </button>
    <div class="relative">
        <button class="hover">
            <Icon icon={FadersHorizontal} size="lg" variant="grey" />
        </button>
        <!-- <Menu /> -->
    </div>
</div>

<style>
    .topbar {
        justify-content: flex-end;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        padding: 0 var(--md);
    }

    h4.text-grey {
        padding-left: var(--xxs);
    }
</style>
