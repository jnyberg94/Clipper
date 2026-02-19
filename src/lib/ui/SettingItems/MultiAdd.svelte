<script>
  import { X } from "phosphor-svelte";

  let { chips = $bindable([]) } = $props();

  let inputValue = $state("");
  let inputElement = $state(null)

  function removeChip(index) {
    chips.splice(index, 1)
  }

  function handleKeyDown(e) {
    if(e.key === 'Enter') {
      chips.push(inputValue)
      inputValue = ""
    }

  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="multi-add padding-xms bg-2"
  onclick={() => inputElement?.focus()}
  role="button"
  tabindex="-1"
>
  <div class="chips-wrapper flex-horiz gap-xxs">
    {#each chips as chip, index (chip)}
      <div class="chip flex-horiz align-items-center gap-xxs">
        <h4 class="chip-label">{chip}</h4>
        <button
          type="button"
          class="chip-remove"
          onclick={(e) => {
            e.stopPropagation();
            removeChip(index);
          }}
          aria-label={`Remove ${chip}`}
        >
          ×
        </button>
      </div>
    {/each}

    <input
      bind:this={inputElement}
      bind:value={inputValue}
      type="text"
      class="input"
      onkeydown={handleKeyDown}
    />
  </div>
</div>

<style>
  .multi-add {
    border-radius: var(--xs);
  }

  .chip {
    background-color: var(--bg-warning);
    color: var(--warning);
  }

  .chip-remove {
    color: var(--warning)
  }

  .input {
    border: none;
    width: 100%
  }


</style>
