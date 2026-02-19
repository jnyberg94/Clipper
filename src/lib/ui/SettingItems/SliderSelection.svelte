<script>
    let { startValue = $bindable(), endValue = $bindable()} = $props()

    $effect(() => {
        if (startValue > endValue) startValue = endValue;
    });
</script>

<div class="slider-selection flex-horiz align-items-center just-cont-space-btw">
    <h4>Convert between</h4>
    <div class="flex-horiz align-items-center gap-xxs">
        <input
            bind:value={startValue}
            type="number"
            step="0.01"
            class="input border text-grey padding-xxs"
        />
        <h5 class="text-grey">to</h5>
        <input
            bind:value={endValue}
            type="number"
            step="0.01"
            class="input border text-grey padding-xxs"
        />
    </div>
</div>

<div class="range-slider-container">
    <input
        type="range"
        min="0"
        max="60"
        step="0.01"
        bind:value={startValue}
        class="range-input"
    />
    <input
        type="range"
        min="0"
        max="60"
        step="0.01"
        bind:value={endValue}
        class="range-input"
    />
    <div class="track"></div>
    <div
        class="range-fill"
        style:left="{(startValue / 60) * 100}%"
        style:right="{100 - (endValue / 60) * 100}%"
    ></div>
    <h5 class="text-grey left number">0</h5>
    <h5 class="text-grey right number">60</h5>
</div>

<style>
    .input {
        border-radius: var(--xms, 4px);
        font-size: 14px;
        width: var(--xxl, 80px);
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        appearance: none;
    }

    .range-slider-container {
        position: relative;
        height: var(--xs);
        width: 100%;
        display: flex;
        margin-bottom: var(--xs);
        flex-shrink: 0;
        align-items: center;
    }

    .range-input {
        position: absolute;
        width: 100%;
        pointer-events: none;
        appearance: none;
        background: none;
        z-index: 2;
        margin: 0;
    }

    .range-input::-webkit-slider-thumb {
        pointer-events: auto;
        appearance: none;
        width: var(--xxs);
        height: var(--sm);
        border-radius: 3px;
        background: var(--stroke-bright);
        cursor: pointer;
    }

    .track {
        position: absolute;
        width: 100%;
        height: 3px;
        background: var(--bg-4);
        border-radius: 3px;
        z-index: 0;
    }

    .range-fill {
        position: absolute;
        height: 3px;
        background: var(--active);
        border-radius: 3px;
        z-index: 1;
    }

    .number {
        position: absolute;
        top: var(--sm);
    }

    .left.number {
        left: 0;
    }

    .right.number {
        right: 0;
    }
</style>
