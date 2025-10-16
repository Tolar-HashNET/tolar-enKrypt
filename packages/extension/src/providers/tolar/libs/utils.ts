export function logError(e: unknown): string {
  if(e === null) {
    return "";
  }

  let message: string;

  if (typeof e === "string") {
    message = e;
  } else if (typeof e === "object" && e.hasOwnProperty("message") && typeof e.message === "string") {
    message = e.message;
  } else {
    message = `Unknown error happened: ${JSON.stringify(e)}`;
  }

  console.error(message);
  return message;
}
