export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const u = searchParams.get('u');

  if (!u) return new Response('Not found', { status: 404 });

  let target;
  try {
    target = b64urlDecode(u);
  } catch (e) {
    return new Response('Bad request', { status: 400 });
  }

  if (!/^https:\/\//.test(target)) {
    return new Response('Bad request', { status: 400 });
  }

  const upstream = await fetch(target);
  if (!upstream.ok) return new Response('Not found', { status: 404 });

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}
