/**
 * Build signature string from object parameters
 * Sorts keys alphabetically and joins them in format: key=value&key=value
 */
export function buildSignatureString(
  params: Record<string, string | number>,
): string {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
}

