<script>
    import { getRules, setRules } from "$lib/utils/rulesActions";
    import Toggle from "./SettingItems/Toggle.svelte";
    import MultiAdd from "./SettingItems/MultiAdd.svelte";
    import SliderSelection from "./SettingItems/SliderSelection.svelte";
    import { onMount } from "svelte";

    let rules = $state({});

    export async function saveRules() {
        await setRules(rules);
    }
 
    onMount(async() => {
        rules = await getRules();
    });
</script>

<div class="menu flex-vert gap-md">
    {#if rules.settings}
        <div class="flex-horiz align-items-center just-cont-space-btw">
            <h4>Clear tmp on next run</h4>
            <Toggle bind:toggleState={rules.settings.autoClearTmp} />
        </div>

        <SliderSelection bind:startValue={rules.settings.videoProcessing.minFps} bind:endValue={rules.settings.videoProcessing.maxFps} />

        <div class="flex-vert gap-xxs">
            <h5 class="text-grey">Permantly skip files named:</h5>
            <MultiAdd bind:chips={rules.settings.permaSkip} />
        </div>
    {/if}
</div>

<style>
    .menu {
        position: absolute;
        height: auto;
        width: 260px;
        padding: 10px;
        border-radius: var(--sm);
        border: 1px var(--stroke) solid;
        right: calc(-1 * var(--xxs));
        top: var(--xl);
        background-color: var(--bg-1);
    }
</style>
