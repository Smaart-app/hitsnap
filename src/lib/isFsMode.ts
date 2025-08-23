// src/lib/isFsMode.ts
export function isFsMode(): boolean {
  const v =
    (import.meta as any).env?.PUBLIC_BACKEND ??
    (typeof process !== 'undefined' ? (process as any).env?.PUBLIC_BACKEND : undefined) ??
    'fs';
  return String(v).toLowerCase() === 'fs';
}
