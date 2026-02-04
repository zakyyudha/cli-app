export function handleError(err: Error): void {
  console.error(`ERROR: ${err.message}`, err.stack);
  process.exit(1);
}
