import { QueryClient } from "@tanstack/react-query"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const CLOUDINARY_REGEX = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      refetchOnWindowFocus: true,
      gcTime: 5 * 60 * 1000,
    },
  },
})

function isCloudinaryUrl(url: string): boolean {
  return CLOUDINARY_REGEX.test(url)
}

export function getOptimizedImageUrl(
  url: string | undefined | null,
  width: number,
  height?: number,
): string | undefined {
  if (!url) return undefined

  const match = url.match(CLOUDINARY_REGEX)
  if (!match) return url

  const base = match[1]
  const rest = url.slice(base.length)
  const h = height ?? width
  const transform = `w_${width},h_${h},c_fill,q_auto,f_auto,e_auto_enhance:enhance-colors_true`
  return `${base}${transform}/${rest}`
}

export function getBlurPlaceholderUrl(
  url: string | undefined | null,
): string | undefined {
  if (!url) return undefined
  if (!isCloudinaryUrl(url)) return undefined

  const match = url.match(CLOUDINARY_REGEX)
  if (!match) return undefined

  const base = match[1]
  const rest = url.slice(base.length)
  return `${base}w_20,e_blur:1000,q_auto,f_webp/${rest}`
}




