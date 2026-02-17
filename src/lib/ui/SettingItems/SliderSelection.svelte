<script>

    let startValue = $state(0)
    let endValue = $state(60)

</script>

<div class="slider-selection flex-horiz align-items-center just-cont-space-btw">
    <h4>Convert between</h4>
    <div class="flex-horiz align-items-center gap-xxs">
        <input bind:value={startValue} type="text" class="input border">
        <h5 class="text-grey">to</h5>
        <input bind:value={endValue} type="text" class="input border">
    </div>
</div>

<style>

    .input {
        border-radius: var(--xms);
        font-size: 14px;
        width: var(--xl);
    }


</style>