import type { Joke } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

export function JokeDisplay({
  canDelete = true,
  isOwner,
  joke,
}: {
  canDelete?: boolean;
  isOwner: boolean;
  joke: Pick<Joke, "content" | "name" | "id">;
}) {
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <Link to=".">"{joke.name}" Permalink</Link>
        {joke.id ? (
          <Link to={`../${joke.id}.pdf`} reloadDocument>
            View as PDF
          </Link>
        ) : null}
      </div>
      {isOwner ? (
        <Form method="post">
          <button
            className="button"
            disabled={!canDelete}
            name="intent"
            type="submit"
            value="delete"
          >
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}
