<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { HTMLAttributes } from 'svelte/elements'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLParagraphElement> & { ref?: HTMLParagraphElement | null } = $props()
</script>

<p
  bind:this={ref}
  data-slot="card-description"
  class={cn('text-sm text-white/50 leading-relaxed', className)}
  {...restProps}
>
  {@render children?.()}
</p>
