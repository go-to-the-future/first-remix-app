import { useTransition, useActionData, redirect, Form, LoaderFunction, useLoaderData} from "remix";
import { getPost } from "~/post";
import type { ActionFunction } from "remix";
import { createPost } from "~/post";
import invariant from "tiny-invariant";
import React from "react";

export let action: ActionFunction = async ({ request }) => {
  await new Promise(res => setTimeout(res, 1000));
  let formData = await request.formData();

  let title = formData.get("title");
  let slug = formData.get("slug");
  let markdown = formData.get("markdown");

  let errors: Record<string, boolean> = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");
  await createPost({ title, slug, markdown });

  return redirect("/admin");
};

export let loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

export default function PutSlug() {
  let post = useLoaderData();
  let errors = useActionData();
  let transition = useTransition();

  return (
    <>
      <h1>Edit Post : {post.slug}</h1>
      <Form method="post">
        <p>
          <label>
            Post Title: {errors?.title && <em>Title is required</em>}
            <input type="text" name="title"  defaultValue={post.title}/>
          </label>
        </p>
        <input type="hidden" name="slug" value={post.slug}/>
        <p>
          <label htmlFor="markdown">Markdown:</label> {errors?.markdown && <em>Markdown is required</em>}
          <br />
          <textarea rows={20} name="markdown" defaultValue={post.body}/>
        </p>
        <p>
          <button type="submit">
          {transition.submission
            ? "Editing.."
            : "Edit Post"}
          </button>
        </p>
      </Form>
    </>
  );
}