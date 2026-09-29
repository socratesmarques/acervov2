import { z } from "zod";
// Keep this allowlist synchronized with frame-src in frontend/nginx.conf.
export const externalOrigins = new Set([
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  "https://player.vimeo.com",
  "https://redecanais.press",
]);
export const externalUrl = z.string().trim().max(4096).transform((value, ctx) => {
  try {
    const url = new URL(value);
    if (!externalOrigins.has(url.origin) || url.username || url.password)
      throw new Error();
    if (url.hostname.includes("youtube") && !/^\/embed\/[a-zA-Z0-9_-]+$/.test(url.pathname))
      throw new Error();
    if (url.hostname === "player.vimeo.com" && !/^\/video\/\d+$/.test(url.pathname))
      throw new Error();
    if (url.hostname === "redecanais.press" && url.pathname !== "/player3/server.php")
      throw new Error();
    return url.href;
  } catch {
    ctx.addIssue({ code: "custom", message: "Use a URL HTTPS de incorporação de YouTube, Vimeo ou redecanais.af. Cole somente o src do iframe, não o HTML." });
    return z.NEVER;
  }
});
