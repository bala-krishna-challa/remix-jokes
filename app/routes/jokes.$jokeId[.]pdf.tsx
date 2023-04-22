import { LoaderArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { generateJokePDF } from "~/utils/download.joke.server";

export async function loader({ params }: LoaderArgs) {
  const joke = await db.joke.findFirst({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Joke not found.", {
      status: 404,
    });
  }

  const pdf = await generateJokePDF(joke);
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
