<script>
    import { loadRules } from "$lib/utils/loadRules";
    import Toggle from "./SettingItems/Toggle.svelte";
    import MultiAdd from "./SettingItems/MultiAdd.svelte";
    import SliderSelection from "./SettingItems/SliderSelection.svelte";

    let clearTmpToggle = $state(false)


</script>

    <div class="menu flex-vert gap-md">
        <div class="flex-horiz align-items-center just-cont-space-btw">
            <h4>Clear tmp on next run</h4>
            <Toggle bind:value={clearTmpToggle} />
        </div>

       <SliderSelection />

        <div class="flex-vert gap-xxs">
            <h5 class="text-grey">Permantly skip files named:</h5>
            <MultiAdd />
        </div>

    </div>


<style>

    .menu {
        position: absolute;
        height: 160px;
        width: 260px;
        padding: 10px;
        border-radius: var(--sm);
        border: 1px var(--stroke) solid;
        right: 0;
        top: 0;
        background-color: var(--bg-1);
    }


</style>