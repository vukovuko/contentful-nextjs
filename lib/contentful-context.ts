import { cookies } from 'next/headers';

/**
 * Helper functions for working with preview mode
 */

/**
 * Check if the current request is in preview mode
 */
export async function isPreviewMode(): Promise<boolean> {
  const cookieStore = await cookies();
  const previewCookie = cookieStore.get('__prerender_bypass');
  return previewCookie !== undefined && previewCookie.value === 'true';
}

/**
 * Get the preview flag for GraphQL queries
 * Can be used directly in component props or page data fetching
 */
export async function getPreviewFlag(): Promise<{ preview: boolean }> {
  const isPreview = await isPreviewMode();
  return { preview: isPreview };
}