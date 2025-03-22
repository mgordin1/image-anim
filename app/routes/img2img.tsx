// app/routes/img2img.tsx
import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const delta = formData.get("delta");
  const image = formData.get("image");

  if (typeof delta !== "string" || !(image instanceof File)) {
    return new Response("Missing delta prompt or image", { status: 400 });
  }

  const imageBuffer = await image.arrayBuffer();

  const generated = await context.env.AI.run(
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    {
      prompt: delta,
      image: new Uint8Array(imageBuffer),
    }
  );

  return new Response(generated, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
