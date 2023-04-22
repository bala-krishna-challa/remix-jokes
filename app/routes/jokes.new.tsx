import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { JokeDisplay } from "~/components/joke";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "That joke's name is too short";
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const jokesterId = await requireUserId(request);
  const form = await request.formData();
  const name = form.get("name");
  const content = form.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    return badRequest({
      fields: null,
      fieldErrors: null,
      formError: "Form not submitted correctly",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };

  const fields = { name, content };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId },
  });

  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  if (navigation.formData) {
    const content = navigation.formData.get("content");
    const name = navigation.formData.get("name");
    if (
      typeof content === "string" &&
      typeof name === "string" &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return (
        <JokeDisplay
          canDelete={false}
          isOwner={true}
          joke={{ name, content, id: "" }}
        />
      );
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
              type="text"
              name="name"
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" id="name-error" role="alert">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
              name="content"
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
