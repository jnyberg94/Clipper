<script>
    import Icon from "./Icon.svelte";
    import { Check, CheckCircle, X } from "phosphor-svelte";

    let { isVisible } = $props()

    export function processingComplete() {
        isVisible = true
        console.log('called', isVisible)
    }

</script>

<div class:visible={isVisible} class="success-message absolute flex-horiz align-items-center just-cont-space-btw padding-xs">
    <Icon icon={CheckCircle} variant='green' size='lg' weight='fill' />
    <h4 class="text-white">Processing completed!</h4>
    <button onclick={()=> isVisible = false}>
        <Icon icon={X} variant='grey' size='sm' />
    </button>
</div>

<style>

    .success-message {
        width: 250px;
        background-color: var(--button);
        border-radius: 100px;
        bottom:-60px;
        left: 50%;
        transform: translateX(-50%);
        transition: bottom 1s ease-in-out;
    }

    .success-message.visible {
        bottom: var(--xms)
    }
</style>
