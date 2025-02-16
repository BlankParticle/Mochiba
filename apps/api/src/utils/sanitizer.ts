import sanitize, { defaults } from "sanitize-html";

export const sanitizeFilename = (filename: string) => filename.replace(/[^a-zA-Z0-9-_.]/g, "_");

export const sanitizeEmail = (html: string) =>
  sanitize(html, {
    allowedTags: defaults.allowedTags.concat(["img", "style"]),
    allowVulnerableTags: true,
    allowedAttributes: false,
  });
