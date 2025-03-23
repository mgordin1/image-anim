import { ActionFunctionArgs } from "@remix-run/cloudflare";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const delta = formData.get("delta");
    const image_b64 = formData.get("image_b64");

    if (typeof delta !== "string" || typeof image_b64 !== "string") {
      return new Response("Missing delta prompt or base64 image", { status: 400 });
    }

    const base64Data = image_b64.replace(/^data:image\/png;base64,/, "");

    const response = await context.env.AI.run(
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
      {
        prompt: delta,
        image_b64: base64Data,
        strength: 0.8,
        num_steps: 20,
      }
    );

    return new Response(response, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("img2img generation failed:", err);
    return new Response(`Error generating delta image: ${err.message || "unknown error"}`, {
      status: 500,
    });
  }
};

export default function Img2Img() {
  return null;
}

/*
export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const delta = formData.get("delta");
  const image = formData.get("image");

  console.log("Delta prompt:", delta);
  console.log("Image:", image);

  if (typeof delta !== "string" || !(image instanceof File)) {
    console.error("Missing delta prompt or image");
    return new Response("Missing delta prompt or image", { status: 400 });
  }

  try {
    const imageBuffer = await image.arrayBuffer();

    const generated = await context.env.AI.run(
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
      {
        prompt: delta,
        image: new Uint8Array(imageBuffer),
        strength: 0.75, // You can tune this if needed
      }
    );

    return new Response(generated, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    console.error("img2img generation failed", err);
    return new Response("Error generating delta image", { status: 500 });
  }
};
*/
