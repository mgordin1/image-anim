// app/routes/img2img.tsx
import { ActionFunctionArgs } from "@remix-run/cloudflare";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  console.log("[img2img] Endpoint hit");

  try {
    const formData = await request.formData();
    const delta = formData.get("delta");
    const image = formData.get("image");

    if (typeof delta !== "string" || !(image instanceof File)) {
      console.error("Missing delta prompt or image");
      return new Response("Missing delta prompt or image", { status: 400 });
    }

    if (image.size === 0) {
      console.error("Uploaded image is empty");
      return new Response("Uploaded image is empty", { status: 400 });
    }

    const imageBuffer = await image.arrayBuffer();
    const imageUint8 = new Uint8Array(imageBuffer);

    console.log("Image size:", imageUint8.length);
    console.log("Running model with prompt:", delta);

    const generated = await context.env.AI.run("@cf/runwayml/stable-diffusion-v1-5-img2img", {
      prompt: delta,
      image: imageUint8,
      strength: 0.75,
      num_inference_steps: 30,
    });

    console.log("Image generated successfully");

    return new Response(generated, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    console.error("img2img generation failed:", err);
    return new Response(`Error generating delta image: ${err.message || "Unknown error"}`, {
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
