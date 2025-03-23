export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const delta = formData.get("delta");
  const image = formData.get("image");
  
  console.log("Delta prompt:", delta);
  console.log("Image type:", image instanceof File ? image.type : typeof image);
  
  if (typeof delta !== "string" || !(image instanceof File)) {
    console.error("Missing delta prompt or image");
    return new Response("Missing delta prompt or image", { status: 400 });
  }
  
  try {
    // Convert image to base64 for the model
    const imageBuffer = await image.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);
    
    console.log("Image size:", imageBytes.length, "bytes");
    
    const generated = await context.env.AI.run(
      "@cf/runwayml/stable-diffusion-v1-5-img2img",
      {
        prompt: delta,
        image: imageBytes,
        strength: 0.75,
        // Add additional parameters if needed
        num_inference_steps: 30,  // You can adjust this
      }
    );
    
    console.log("Generation successful, response type:", typeof generated);
    
    // Return the generated image with proper headers
    return new Response(generated, {
      headers: { 
        "Content-Type": "image/png",
        "Cache-Control": "no-cache"
      },
    });
  } catch (err) {
    console.error("img2img generation failed", err);
    return new Response(`Error generating delta image: ${err.message}`, { status: 500 });
  }
};
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
