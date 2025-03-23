import { Ai } from "@cloudflare/ai";
import { ActionFunctionArgs } from "@remix-run/cloudflare";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const delta = formData.get("delta");
    const imageB64 = formData.get("image_b64");

    if (typeof delta !== "string" || typeof imageB64 !== "string") {
      return new Response("Missing delta prompt or image data", { status: 400 });
    }

    // Remove base64 prefix if present
    const base64Data = imageB64.replace(/^data:image\/\w+;base64,/, "");
    const binaryImage = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const ai = new Ai(context.env.AI);

    const result = await ai.run("@cf/runwayml/stable-diffusion-v1-5-img2img", {
      prompt: delta,
      image: [...binaryImage],
      strength: 0.75,
      num_steps: 20, // Max allowed by Cloudflare
    });

    return new Response(result, {
      headers: { "Content-Type": "image/png" },
    });
  } catch (err: any) {
    console.error("img2img error:", err);
    return new Response(`Error generating delta image: ${err.message}`, { status: 500 });
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
