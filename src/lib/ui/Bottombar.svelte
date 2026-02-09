<script>

    let { currentProcessed, totalProcessed, isProcessing, time, processingSpeed } = $props();


    function formatDuration(ms) {
        if (!ms && ms !== 0) return "Calculating...";
        
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes === 0) {
            return `${seconds}s`;
        }

        return `${minutes}m ${seconds}s`;
    }

</script>

<div class:visible={isProcessing} class="bottombar just-cont-center align-items-center flex-horiz gap-sm">
    <img class="width-md height-md" src="icons/active.svg" alt="green dot" />
    <h4>
        <span>{currentProcessed}</span>
        <span class="text-grey">{`of ${totalProcessed} processed`}</span>
    </h4>
    <h4 class="text-stroke-bright">|</h4>
    <h4>
        <span>{formatDuration(time)}</span>
        <span class="text-grey">remaining</span>
    </h4>
    <h4 class="text-stroke-bright">|</h4>
    <h4>
        <span>{processingSpeed}</span>
        <span class="text-grey">speed</span>
        
    </h4>
</div>

<style>
    .bottombar {
        position: absolute;
        bottom: -60px;
        background-color: var(--bg-3);
        height: 40px;
        width: calc(100% - 2 * var(--xms));
        margin: 0 var(--xms);
        border-radius: var(--xxs) var(--xxs) var(--lg) var(--lg);
        transition: bottom 1s ease-in-out;
    }

    .bottombar.visible {
        bottom: var(--xms)
    }
</style>
