/** Local inference only: configuration must not enable arbitrary outbound requests. */
export function localEndpoint(value: string): string {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "Model endpoint must be a local HTTP(S) URL without credentials or query parameters",
    );
  }
  return url.href;
}
