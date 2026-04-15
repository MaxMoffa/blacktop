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
  data-slot="card"
  class={cn(
    'rounded-2xl border border-white/[0.08] bg-white/[0.04] text-card-foreground shadow-2xl backdrop-blur-sm',
    className
  )}
  {...restProps}
>
  {@render children?.()}
</div>
