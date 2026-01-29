<script>
    import SidebarLink from "./SidebarLink.svelte";
    import Icon from "./Icon.svelte";
    import { Bank, ClockCounterClockwise } from "phosphor-svelte";

    const links = [
        {
            label: "Reconcile",
            icon: Bank,
        },
        {
            label: "History",
            icon: ClockCounterClockwise,
        },
    ];
</script>

<div class="sidebar">
    <div class="logo-cont flex-horiz gap-xxs">
        <img src="/icons/logo.svg" alt="logo" class="logo" />
        <h3 class="logo-text bold">Kole Jain</h3>
    </div>
    <div class="links-cont flex-vert gap-xs">
        {#each links as link}
             <SidebarLink label={link.label}>
                {#snippet icon()}
                    <Icon icon={link.icon} variant="black" size="sm" />
                {/snippet}
            </SidebarLink>
        {/each}
    </div>
</div>

<style>
</style>
