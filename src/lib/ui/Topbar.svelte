<script>
    import { Trash, StackMinus, FadersHorizontal } from "phosphor-svelte";
    import Icon from "./Icon.svelte";
    import { getFolderStats } from "$lib/utils/getFolderSize";
    import { onMount } from "svelte";

    let { items = 0 } = $props()

    let stats = $state({ count: 0, formattedSize: '0 Bytes' });

    onMount( async()=>{
        stats = await getFolderStats()
    })

</script>

<div class="topbar align-items-center flex-horiz gap-xs" data-tauri-drag-region>
    <button class="hover flex-horiz gap-xms">
        <h4 class="text-grey">{`${stats.count} items, ${stats.formattedSize}`}</h4>
        <Icon icon={Trash} size='lg' variant='grey' />
    </button>
    <button class="hover">
        <Icon icon={StackMinus} size='lg' variant='grey' />
    </button>
    <button class="hover">
        <Icon icon={FadersHorizontal} size='lg' variant='grey' />
    </button>
</div>


<style>

    .topbar {
        justify-content: flex-end;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        padding: 0 var(--md)
    }

    h4.text-grey {
        padding-left: var(--xxs);
    }

</style>