export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Only adjust the portfolio homepage; leave every other route untouched.
  if (url.pathname !== "/") {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok || !contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  return new HTMLRewriter()
    .on("#about .ab > img, #skills .ws > img, #contact .ct > img", {
      element(element) {
        const src = element.getAttribute("src") || "";

        // These embedded portrait bytes are WebP (RIFF), not PNG.
        if (src.startsWith("data:image/png;base64,UklGR")) {
          element.setAttribute(
            "src",
            src.replace(/^data:image\/png;base64,/, "data:image/webp;base64,")
          );
        }
      }
    })
    .on(".frame > img", {
      element(element) {
        // Keep the existing portrait in the final Hire Me frame visible.
        const currentStyle = element.getAttribute("style") || "";
        const visibilityFix = "display:block;max-width:100%;height:auto;visibility:visible;opacity:1";
        element.setAttribute(
          "style",
          currentStyle ? currentStyle + ";" + visibilityFix : visibilityFix
        );
      }
    })
    .transform(response);
}
