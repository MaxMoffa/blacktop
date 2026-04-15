import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { HTMLAttributes } from 'svelte/elements'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null
  children?: import('svelte').Snippet
}

export type WithClass<T = HTMLAttributes<HTMLElement>> = T & {
  class?: string | null | undefined
}
