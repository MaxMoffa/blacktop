<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { HTMLAttributes } from 'svelte/elements'

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLHeadingElement> & { ref?: HTMLHeadingElement | null } = $props()
</script>

<h2
  bind:this={ref}
  data-slot="card-title"
  class={cn('text-3xl font-bold tracking-tight text-white', className)}
  {...restProps}
>
  {@render children?.()}
</h2>
