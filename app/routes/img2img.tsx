import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { Buffer } from "buffer";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  console.log("img2img endpoint hit");

  try {
    const formData = await request.formData();
    const delta = formData.get("delta");
    const image = formData.get("image");

    console.log("Delta prompt:", delta);
    console.log("Image type:", image instanceof File ? image.type : typeof image);
    console.log("Image size:", image instanceof File ? `${image.size} bytes` : "N/A");

    if (typeof delta !== "string" || !(image instanceof File)) {
      console.error("Missing delta prompt or image");
      return new Response("Missing delta prompt or image", { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const generated = await context.env.AI.run(
      "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      {
        prompt: delta,
        image_b64: base64,
        width: 1024,
        height: 1024
      }
    );

    console.log("Delta image generated successfully");
    return new Response(generated, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch (err: any) {
    console.error("img2img generation failed", err);
    return new Response(`Error generating delta image: ${err.message || 'Unknown error'}`, {
      status: 500
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
