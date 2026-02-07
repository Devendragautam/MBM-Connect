export function resolveImageUrl(path) {
  if (!path) return null;
  // if absolute URL, return as-is
  if (/^https?:\/\//i.test(path)) return path;
  // if path starts with /uploads or similar, prefix with API host
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (apiBase) {
    // if path already starts with /api, avoid duplicate
    if (path.startsWith('/')) return `${apiBase}${path}`;
    return `${apiBase}/${path}`;
  }
  // fallback to relative path
  return path;
}
