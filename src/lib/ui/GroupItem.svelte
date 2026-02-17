<script>
    import { CaretRight } from "phosphor-svelte";
    import Icon from "./Icon.svelte";
    import ProgressItem from "./ProgressItem.svelte";
    import { getItemProgress } from "$lib/utils/getItemProgress";

    let { folderName, itemsInGroup, isExpanded, children } = $props();

    let expanded = $state(false);
</script>

<div class="group-item flex-vert gap-xs">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        onclick={() => (expanded = !expanded)}
        class="group-item flex-horiz align-items-center gap-xs"
    >
        <div class:expanded class="rotate">
            <Icon icon={CaretRight} variant="grey" size="md" />
        </div>

        <h3 class="text-grey">{folderName}</h3>
        <div class="num-chip">
            <h5 class="text-grey">{itemsInGroup}</h5>
        </div>
    </div>

    <div class:expanded class="flex-vert overflow-hidden">
        <div class="content">
            {@render children()}
        </div>
    </div>
</div>

<style>
    /* arrow rotation */
    .rotate {
        width: 18px;
        transform: rotate(0);
        transform-origin: center;
        transition: transform 0.4s ease-out;
    }

    .rotate.expanded {
        transform: rotate(90deg);
    }

    /* container heights */
    .content {
        min-height: 0;
    }

    .overflow-hidden {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.4s ease-out;
    }

    .overflow-hidden.expanded {
        grid-template-rows: 1fr;
    }

    .num-chip {
        padding: 2px 5px;
        background-color: var(--bg-4);
        border-radius: 100%;
    }
</style>
