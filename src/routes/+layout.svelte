<script>
    import "./app.css";
    import { IconContext } from "phosphor-svelte";

    let { children } = $props();
</script>

<div class="border-wrapper border">
    <IconContext
        values={{
            color: "#808080",
            size: "16px",
            weight: "regular",
        }}
    />
    {@render children()}
</div>

<style>

    .border-wrapper {
        position: relative;
        border-radius: var(--lg);
        background-color: var(--bg-1);
        height: 100%;
    }
</style>
