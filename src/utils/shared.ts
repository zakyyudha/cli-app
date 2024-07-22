export function handleError (err: Error) {
  console.error(`ERROR: ${err.message}`, err.stack);
  process.exit(1);
}
