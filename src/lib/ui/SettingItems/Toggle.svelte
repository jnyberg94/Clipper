<script>
    
    let { toggleState = $bindable(true) } = $props()

    function handleToggle() {
        toggleState = !toggleState
    }

</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button onclick={handleToggle} class:active={toggleState} class="toggle flex-vert">
    <div class="circle"></div>
</button>

<style>
    .toggle {
        width: 28px;
        border-radius: var(--xxxl);
        padding: 1px;
        background-color: var(--stroke-bright);
    }

    .toggle.active {
        background-color: var(--active);
        align-items: flex-end;
    }

    .circle {
        height: 14px;
        width: 14px;
        background-color: var(--bg-1);
        border-radius: var(--xxxl);
    }


</style>