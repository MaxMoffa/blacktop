<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { HTMLAttributes } from 'svelte/elements'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & { ref?: HTMLDivElement | null } = $props()
</script>

<div
  bind:this={ref}
  data-slot="card-content"
  class={cn('px-8 py-4', className)}
  {...restProps}
>
  {@render children?.()}
</div>
