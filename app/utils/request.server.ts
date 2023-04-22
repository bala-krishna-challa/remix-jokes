import { json } from "@remix-run/node";

export const badRequest = <T>(data: T) => {
  return json(data, { status: 400 });
};
