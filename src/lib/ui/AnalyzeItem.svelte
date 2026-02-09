<script>
    import { FolderOpen } from "phosphor-svelte";
    import Icon from "./Icon.svelte";

    let { isAnalyzing = false } = $props()

</script>

{#if isAnalyzing}
<div class="item-container flex-horiz gap-xs align-items-center">
    <Icon icon={FolderOpen} size='lg' variant='grey' />
    <h4 class="analyzing text-grey">Analyzing files...</h4>
</div>
{/if}


<style>
    .analyzing {
        background: linear-gradient(
            90deg,
            currentColor 0%,
            currentColor 30%,
            var(--bg-4) 50%,
            currentColor 70%,
            currentColor 100%
        );
        background-size: 200% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 4s linear infinite;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
</style>