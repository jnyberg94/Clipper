<script>
    import './app.css';
    import Sidebar from "$lib/ui/Sidebar.svelte";
    import { IconContext } from "phosphor-svelte";

    let { children } = $props();
</script>

<div class="layout">
    <div class="drag-area" data-tauri-drag-region></div>
    <Sidebar />

    <div class="content-wrapper">
        <div class="content">
            <IconContext
                values={{
                    color: "#808080",
                    size: "16px",
                    weight: "regular",
                }}
            >
                {@render children()}
            </IconContext>
        </div>
    </div>
</div>

<style>
    .layout {
        position: relative;
        display: grid;
        grid-template-columns: 232px 1fr;
        transition: grid-template-columns 1s var(--transition);
        overflow-x: hidden;
        background-color: var(--bg-2);
        width: 100%;
    }

    .content-wrapper {
        position: relative;
        grid-column-start: 2;
        height: calc(100vh - var(--xs));
        border: var(--stroke-thin);
        border-top-left-radius: var(--md);
        overflow: hidden;
        width: 100%;
        background-color: var(--bg-1);
        margin-top: var(--xs);
        margin-right: var(--outer-margin);
    }

    .content {
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        width: 100%;
    }

    .drag-area {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
    }
</style>
