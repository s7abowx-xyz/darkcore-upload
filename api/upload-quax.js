export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') return json({ status: false, message: 'POST only' }, 405);

  try {
    const incoming = await request.formData();
    const file = incoming.get('file');
    if (!file) return json({ status: false, message: 'file is required' }, 400);

    const form = new FormData();
    form.append('file', file, file.name);

    const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form });
    const data = await res.json();
    const url = data && data.files && data.files[0] && data.files[0].url;

    if (!url) return json({ status: false, message: 'فشل الرفع إلى QuAx', raw: data }, 500);

    const origin = new URL(request.url).origin;
    return json({ status: true, creator: 'NovaCore', server: 'QuAx', url: origin + '/api/file?u=' + b64url(url) });

  } catch (e) {
    return json({ status: false, error: e.message }, 500);
  }
}

function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
