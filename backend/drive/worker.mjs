import { adminPage } from './admin.mjs';

const MAX_BYTES = 50 * 1024 * 1024;
const ID = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const DOWNLOAD_PATH = new RegExp(`^/d/(${ID})$`);
const ADMIN_FILE_PATH = new RegExp(`^/admin/files/(${ID})$`);
const headers = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};

function error(status, message) {
  return Response.json({ error: message }, { status, headers });
}

function fileInfo(object) {
  return {
    id: object.key,
    name: object.customMetadata?.name || 'download',
    size: object.size,
    uploaded: object.uploaded.toISOString(),
  };
}

async function download(request, bucket, id) {
  const isHead = request.method === 'HEAD';
  const object = await (isHead ? bucket.head(id) : bucket.get(id));
  if (!object) return error(404, '文件不存在或分享链接已失效。');

  const name = encodeURIComponent(fileInfo(object).name)
    .replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16)}`);
  return new Response(isHead ? null : object.body, {
    headers: {
      ...headers,
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="download"; filename*=UTF-8''${name}`,
      'Content-Length': String(object.size),
    },
  });
}

async function upload(request, bucket) {
  const length = request.headers.get('Content-Length');
  if (length === null || !/^\d+$/.test(length)) return error(411, '上传请求缺少文件大小。');
  const size = Number(length);
  if (size > MAX_BYTES) return error(413, '单个文件最多 50 MiB。');

  let name;
  try {
    name = decodeURIComponent(request.headers.get('X-Filename') || '');
  } catch {
    return error(400, '文件名编码无效。');
  }
  if (!name.trim() || name.length > 255 || /[\u0000-\u001f\u007f/\\]/.test(name)) {
    return error(400, '文件名无效。');
  }
  if (size > 0 && !request.body) return error(400, '没有收到文件内容。');

  const id = crypto.randomUUID();
  const object = await bucket.put(id, request.body || new Uint8Array(), { customMetadata: { name } });
  return Response.json(fileInfo(object), { status: 201, headers });
}

async function admin(request, url, env, ctx) {
  const identity = await ctx.access?.getIdentity();
  if (!env.OWNER_EMAIL || identity?.email?.toLowerCase() !== env.OWNER_EMAIL.toLowerCase()) {
    return error(403, '请使用站主邮箱登录。');
  }

  const { pathname } = url;
  if (request.method === 'GET' && pathname === '/admin/') {
    const nonce = crypto.randomUUID();
    return new Response(adminPage(nonce), { headers: {
      ...headers,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`,
    } });
  }
  if (request.method === 'GET' && pathname === '/admin/files') {
    const cursor = url.searchParams.get('cursor') || undefined;
    const result = await env.FILES.list({ limit: 100, include: ['customMetadata'], cursor });
    return Response.json({ files: result.objects.map(fileInfo), cursor: result.cursor || null }, { headers });
  }

  if (request.method === 'POST' || request.method === 'DELETE') {
    if (request.headers.get('Origin') !== url.origin) return error(403, '请求来源无效。');
    if (request.method === 'POST' && pathname === '/admin/files') return upload(request, env.FILES);
    const file = ADMIN_FILE_PATH.exec(pathname);
    if (request.method === 'DELETE' && file) {
      await env.FILES.delete(file[1]);
      return new Response(null, { status: 204, headers });
    }
  }
  return error(404, '页面不存在。');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/admin/')) return await admin(request, url, env, ctx);
      const file = DOWNLOAD_PATH.exec(url.pathname);
      if (file && (request.method === 'GET' || request.method === 'HEAD')) {
        return await download(request, env.FILES, file[1]);
      }
      return error(404, '页面不存在。');
    } catch (cause) {
      console.error('Drive request failed', cause);
      return error(500, '云盘暂时无法处理请求。');
    }
  },
};
