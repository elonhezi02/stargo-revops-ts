import { getDomain } from "tldts";
import type { Contact } from "../shared/contracts.js";
export const emailKey = (v?: string | null) => v?.trim().toLowerCase() || null;
export function linkedinKey(value?: string | null) {
  if (!value?.trim()) return null;
  const url = new URL(value);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    !["linkedin.com", "www.linkedin.com"].includes(
      url.hostname.toLowerCase(),
    ) ||
    !/^\/in\/[a-z0-9%_-]+\/?$/i.test(url.pathname)
  )
    throw new Error("Invalid LinkedIn profile URL");
  return `https://linkedin.com${url.pathname.toLowerCase().replace(/\/$/, "")}`;
}
export function domainKey(value?: string | null) {
  if (!value) return null;
  try {
    const domain = getDomain(
      new URL(value.includes("://") ? value : `https://${value}`).hostname,
    );
    return domain &&
      !new Set([
        "gmail.com",
        "outlook.com",
        "hotmail.com",
        "yahoo.com",
        "icloud.com",
        "proton.me",
        "protonmail.com",
        "live.com",
        "aol.com",
      ]).has(domain)
      ? domain
      : null;
  } catch {
    return null;
  }
}
export function match(
  contacts: Contact[],
  email?: string | null,
  linkedin?: string | null,
) {
  const e = emailKey(email),
    l = linkedinKey(linkedin);
  const matches = contacts.filter(
    (c) =>
      (e && emailKey(c.email) === e) ||
      (l && linkedinKey(c.linkedin_url) === l),
  );
  if (matches.length > 1) throw new Error("Conflicting person identifiers");
  return matches[0];
}
