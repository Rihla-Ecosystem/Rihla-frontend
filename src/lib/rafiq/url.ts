import type { RafiqContextEnvelope, RafiqContext } from './types';

function base64UrlEncode(str: string): string {
  return btoa(encodeURIComponent(str))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (str.length % 4) {
    case 2:
      str += '==';
      break;
    case 3:
      str += '=';
      break;
  }
  return decodeURIComponent(atob(str));
}

export function buildRafiqUrl(context: RafiqContext, q?: string): string {
  const envelope: RafiqContextEnvelope = {
    context,
  };
  const encoded = base64UrlEncode(JSON.stringify(envelope));
  const params = new URLSearchParams();
  params.set('ctx', encoded);
  if (q) params.set('q', q);
  return `/app/rafiq?${params.toString()}`;
}

export function parseRafiqContext(searchParams: URLSearchParams): RafiqContextEnvelope | null {
  const encoded = searchParams.get('ctx');
  if (!encoded) return null;
  try {
    const json = base64UrlDecode(encoded);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      context: parsed.context ?? parsed,
      welcome: parsed.welcome,
      suggestions: parsed.suggestions,
    };
  } catch {
    return null;
  }
}

export function getInitialQuery(searchParams: URLSearchParams): string {
  return searchParams.get('q')?.trim() || '';
}