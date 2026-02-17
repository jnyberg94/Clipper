<script>
    import { CheckCircle } from "phosphor-svelte";
    import Icon from "./Icon.svelte";

    let { progress = 0, fileName, isNested } = $props();

    const size = 20;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    const offset = $derived(circumference - (progress / 100) * circumference);
    const center = size / 2;
    
    const isFinished = $derived(Math.round(progress) === 100);
</script>

<div class:nested={isNested} class="progress-item">
    <div class:nested={isNested} class="item-padding flex-horiz align-items-center gap-xs">
        {#if !isFinished}
        <svg width={size} height={size}>
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--bg-4)"
                stroke-width={strokeWidth}
            />
            <circle
                class="progress"
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--active)"
                stroke-width={strokeWidth}
                stroke-dasharray={circumference}
                stroke-dashoffset={offset}
                stroke-linecap="round"
            />
        </svg>
        {:else}
            <Icon icon={CheckCircle} weight='fill' variant='green' size='lg' />
        {/if}

        <h4 class:text-active={progress > 0 && progress < 100} class="text-grey">
            {fileName}
        </h4>
    </div>
</div>

<style>

    .progress-item.nested {
        padding-left: var(--xs)
    }

    .item-padding {
        padding: var(--xs) 0 var(--xs) 0;
    }

    .item-padding.nested {
        border-left: 1px solid var(--stroke);
        padding: var(--xs) 0 var(--xs) var(--md);
    }

    .progress {
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        transition: stroke-dashoffset 0.2s linear; 
    }
    
    .text-active {
        color: var(--text);
    }
</style>
