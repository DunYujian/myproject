export function adminPage(nonce) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>云盘 · 再也的小站</title>
  <style>
    :root { color-scheme: light dark; --bg:#f4f7f5; --ink:#21392e; --muted:#50685b; --surface:#fff; --line:#c8d9ce; --accent:#315e49; --button:#fff; }
    @media (prefers-color-scheme:dark) { :root { --bg:#16211d; --ink:#e6f1e9; --muted:#adc1b4; --surface:#202f28; --line:#435b4d; --accent:#9bd0b1; --button:#16211d; } }
    * { box-sizing:border-box; }
    body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.6 system-ui,sans-serif; }
    main { max-width:45rem; margin:auto; padding:2rem 1rem 4rem; }
    a { color:var(--accent); }
    h1 { font-family:Georgia,"Songti SC",serif; font-size:clamp(2rem,5vw,3rem); margin:.65em 0 .1em; }
    h2 { font-size:1.25rem; margin:0 0 .6em; }
    p { margin:.4em 0 .7em; }
    section { margin-top:1.25rem; padding:clamp(.9rem,3vw,1.4rem); border:1px solid var(--line); border-radius:1rem; background:var(--surface); }
    form,.actions { display:flex; align-items:center; flex-wrap:wrap; gap:.5rem; }
    form label { flex-basis:100%; font-weight:600; }
    input,button,.actions a { padding:.4em .65em; border:1px solid var(--line); border-radius:.5rem; font:inherit; color:inherit; background:var(--surface); }
    input[type=file] { max-width:100%; min-width:0; }
    button { cursor:pointer; }
    button[type=submit] { color:var(--button); background:var(--accent); border-color:var(--accent); }
    button:disabled { cursor:default; opacity:.6; }
    ul { padding:0; list-style:none; }
    li { display:flex; flex-wrap:wrap; gap:.45rem 1rem; justify-content:space-between; align-items:center; border-top:1px solid var(--line); padding:.8rem 0; }
    li div { min-width:0; }
    li strong { display:block; overflow-wrap:anywhere; }
    small,.muted { color:var(--muted); }
    #share-box input { display:block; width:100%; margin:.4rem 0; }
  </style>
</head>
<body>
  <main>
    <a href="https://dunyujian.cc.cd/tools/">← 小站工具</a>
    <h1>再也的云盘</h1>
    <p class="muted">在这里管理文件。把链接发给别人，对方就能下载对应的文件。</p>
    <section aria-label="上传文件">
      <form id="upload">
        <label for="file">选择本地文件</label>
        <input type="file" id="file" required>
        <button type="submit">上传</button>
      </form>
      <small>每次上传一个文件，单个文件最多 50 MiB。</small>
    </section>
    <p id="status" role="status"></p>
    <section id="share-box" aria-label="分享文件" hidden>
      <label for="share">下载链接</label>
      <input id="share" readonly>
      <small>任何拿到链接的人都能下载。删除文件后链接失效。</small>
    </section>
    <section aria-labelledby="list-title">
      <h2 id="list-title">我的文件</h2>
      <button id="refresh" type="button">刷新列表</button>
      <p id="empty" class="muted" hidden>云盘里还没有文件。</p>
      <ul id="files"></ul>
      <button id="more" type="button" hidden>加载更多</button>
    </section>
  </main>
  <script nonce="${nonce}">
    const byId = id => document.getElementById(id);
    const status = byId('status');
    const form = byId('upload');
    const fileInput = byId('file');
    const files = byId('files');
    const more = byId('more');
    const share = byId('share');
    let cursor = null;
    let busy = false;

    async function api(path, options) {
      let response;
      try {
        response = await fetch('/admin/files' + path, { ...options, redirect: 'error' });
      } catch {
        throw new Error('连接中断或登录已过期，请刷新页面确认操作结果。');
      }
      if (response.status === 204) return;
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || '操作失败，请刷新页面后重试。');
      return body;
    }

    function button(label, onClick) {
      const item = document.createElement('button');
      item.type = 'button';
      item.textContent = label;
      item.addEventListener('click', onClick);
      return item;
    }

    function shareUrl(id) {
      return new URL('/d/' + id, location.origin).href;
    }

    function showShare(url) {
      byId('share-box').hidden = false;
      share.value = url;
    }

    async function copyLink(url) {
      showShare(url);
      try {
        await navigator.clipboard.writeText(url);
        status.textContent = '下载链接已复制。';
      } catch {
        share.focus();
        share.select();
        status.textContent = '请手动复制下载链接。';
      }
    }

    function showFile(file) {
      const item = document.createElement('li');
      const info = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = file.name;
      const details = document.createElement('small');
      const size = new Intl.NumberFormat('zh-CN', { style: 'unit', unit: 'byte' }).format(file.size);
      details.textContent = size + ' · ' + new Date(file.uploaded).toLocaleString();
      info.append(name, details);

      const url = shareUrl(file.id);
      const actions = document.createElement('div');
      actions.className = 'actions';
      const download = document.createElement('a');
      download.href = url;
      download.textContent = '下载';
      actions.append(download, button('复制链接', () => copyLink(url)), button('删除', () => {
        if (busy || !confirm('删除「' + file.name + '」？分享链接会同时失效。')) return;
        run('正在删除…', async () => {
          await api('/' + file.id, { method: 'DELETE' });
          item.remove();
          if (share.value === url) {
            share.value = '';
            byId('share-box').hidden = true;
          }
          updateEmptyState();
          status.textContent = '文件已删除。';
        });
      }));
      item.append(info, actions);
      files.append(item);
    }

    function updateEmptyState() {
      byId('empty').hidden = files.childElementCount > 0 || Boolean(cursor);
    }

    async function loadFiles(append = false) {
      const query = append && cursor ? '?cursor=' + encodeURIComponent(cursor) : '';
      const result = await api(query);
      if (!append) files.replaceChildren();
      result.files.forEach(showFile);
      cursor = result.cursor;
      more.hidden = !cursor;
      updateEmptyState();
    }

    async function run(message, action) {
      if (busy) return;
      busy = true;
      const controls = [fileInput, form.querySelector('button'), byId('refresh'), more];
      controls.forEach(control => { control.disabled = true; });
      status.textContent = message;
      try {
        await action();
      } catch (error) {
        status.textContent = error.message;
      } finally {
        controls.forEach(control => { control.disabled = false; });
        busy = false;
      }
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      const file = fileInput.files[0];
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) {
        status.textContent = '单个文件最多 50 MiB。';
        return;
      }
      run('正在上传…', async () => {
        const uploaded = await api('', { method: 'POST', body: file, headers: { 'X-Filename': encodeURIComponent(file.name) } });
        form.reset();
        showShare(shareUrl(uploaded.id));
        await loadFiles();
        status.textContent = '上传完成。';
      });
    });
    function refresh(append) {
      run('正在读取…', async () => {
        await loadFiles(append);
        status.textContent = '';
      });
    }
    byId('refresh').addEventListener('click', () => refresh(false));
    more.addEventListener('click', () => refresh(true));
    refresh(false);
  </script>
</body>
</html>`;
}
