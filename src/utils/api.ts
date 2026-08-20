/**
 * API Utility helper for Wortschatz Meister Mobile
 * Handles resolving absolute endpoints when running inside native wrappers (Capacitor/Cordova)
 */

export function getApiUrl(path: string): string {
  if (typeof window === "undefined") return path;

  // Detect if running inside a native mobile wrapper (Capacitor, file protocol, or custom schema)
  const isNative = 
    window.location.protocol.startsWith("capacitor") || 
    window.location.protocol.startsWith("chrome-extension") || 
    window.location.protocol === "file:" ||
    (window as any).Capacitor;

  const liveServerUrl = "https://ais-pre-5xqunli24ylajxkdjjkuow-10777203316.europe-west3.run.app";
  
  const base = isNative ? liveServerUrl : "";
  return `${base}${path}`;
}
