export function logError(e: unknown): string {
  let message: string;

  if (typeof e === "string") {
    message = e;
  } else if (e instanceof Error) {
    message = e.message;
  } else {
    message = `Unknown error happened: ${JSON.stringify(e)}`;
  }

  console.error(message);
  return message;
}
