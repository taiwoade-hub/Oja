/**
 * Resolves local and remote asset paths against the application's base URL.
 * Ensures local images (like /products/...) resolve correctly whether hosted on
 * the local dev server (base: "/") or on a subpath like GitHub Pages (base: "/Oja/").
 */
export function resolveAssetUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Prevent double prefixing if base is "/Oja/" and path already starts with "Oja/" or "/Oja/"
  const baseNoSlashes = base.replace(/^\/+|\/+$/g, "");
  if (baseNoSlashes && (cleanPath.startsWith(baseNoSlashes) || path.startsWith(base))) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  return `${cleanBase}${cleanPath}`;
}

