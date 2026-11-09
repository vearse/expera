export const NEST_API_PREFIX = "/api/v1";

/** Build a versioned Nest URL from MODULES_API_BASE_URL (host root, no trailing slash). */
export function nestApiUrl(apiBase: string, path: string): string {
  const base = apiBase.replace(/\/$/, "");
  const normalized = base.endsWith(NEST_API_PREFIX) ? base : `${base}${NEST_API_PREFIX}`;
  const segment = path.replace(/^\//, "");
  return `${normalized}/${segment}`;
}
