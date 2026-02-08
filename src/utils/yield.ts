/**
 * Yields control back to the main thread to prevent UI freezing
 * Use this between heavy operations
 */
export default async function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
