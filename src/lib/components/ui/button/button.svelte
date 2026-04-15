<script lang="ts" module>
  import { cn } from '$lib/utils.js'
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
  import { type VariantProps, tv } from 'tailwind-variants'

  export const buttonVariants = tv({
    base: 'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-transparent text-sm font-semibold tracking-wide transition-all duration-200 outline-none select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px',
    variants: {
      variant: {
        default:
          'bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-800/50 hover:brightness-110',
        outline:
          'bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-white/10 text-white/80 hover:text-white',
        destructive: 'bg-destructive/20 text-destructive-foreground hover:bg-destructive/30',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 gap-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 gap-2.5 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  })

  export type ButtonVariant = VariantProps<typeof buttonVariants>['variant']
  export type ButtonSize = VariantProps<typeof buttonVariants>['size']

  export type ButtonProps = HTMLButtonAttributes &
    HTMLAnchorAttributes & {
      variant?: ButtonVariant
      size?: ButtonSize
      class?: string | null | undefined
      href?: string
      ref?: HTMLElement | null
    }
</script>

<script lang="ts">
  let {
    class: className,
    variant = 'default',
    size = 'default',
    ref = $bindable(null),
    href = undefined,
    type = 'button',
    disabled,
    children,
    ...restProps
  }: ButtonProps = $props()
</script>

{#if href}
  <a
    bind:this={ref}
    class={cn(buttonVariants({ variant, size }), className)}
    href={disabled ? undefined : href}
    aria-disabled={disabled}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
