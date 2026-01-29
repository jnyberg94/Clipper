<script>
    let { icon, label } = $props();

</script>

<button class="link flex-horiz gap-xs">
    <div class="icon-wrapper">
        {@render icon()}
    </div>
    <span>{label}</span>
</button>

<style>
</style>
