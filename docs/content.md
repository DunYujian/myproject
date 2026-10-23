# 文章与素材维护

[返回仓库首页](../README.md) · [文档目录](README.md)

## 写一篇新文章

1. 复制 `posts/welcome.html`，重命名为 `posts/你的标题.html`（建议用英文短横线，如 `reading-2026.html`）。
2. 改这几处：
   - `<title>`、`<meta name="description">`，以及存在的 canonical / Open Graph 链接
   - `<span class="kicker">` 显示文字、分类 meta 和 `.post-categories` 链接
   - `<h1>` 标题、`<time datetime="...">` 日期、阅读时间
   - `<div class="prose">` 里的正文
   - 文末的标签，以及上一篇 / 下一篇
3. 把文章加进两个网页列表，并维护 [文章目录](../posts/README.md)：
   - `posts/index.html` 的 `<ul class="post-list">` 里复制一个 `<li>`
   - `index.html` 首页「最近文章」的 `.recent-list` 里复制一个 `<li>`

正文可用的样式（见示例文章）：`<h2>` `<h3>`、`<p>`、`<ul>`/`<ol>`、`<blockquote>`、
`<pre data-lang="js"><code>` 代码块（会自动显示语言角标）、`<table>`、`<figure>` + `<figcaption>`、`<hr>`。

## 微信文章存档

已迁入 `posts/lanqiao-hal-key-click.html`，原文《3、蓝桥杯嵌入式—HAL库-按键单击》，发布日期保留为 2024-03-03。
正文的 10 张图片已存入 `assets/images/wechat-key-click/`，代码、表格与原文出处均已保留，评论沿用 Utterances。
`wxgzh` 中第 1、2 篇目前只有资源目录，缺少文章 HTML，尚未导入。原始下载资料保留在本地，不随此次发布上传。

## Codex + Origin 教程资料

科研绘图教程位于 `posts/codex-origin-paper-figures.html`，配套 CSV、配置示例、提示词和下载包位于 `assets/downloads/codex-origin/`。`python scripts/create_origin_tutorial_assets.py` 可重建教学数据及 Matplotlib 样式示意图；这不是 Origin 运行测试，不会安装 MCP 或修改本机 Codex 配置。


## 目录与分类检查

文章 HTML 保留在 `posts/`；文章图片放在 `assets/images/<文章名>/`，下载数据放在 `assets/downloads/<专题名>/`。移动附件时检查原文引用。

新增文章后，更新 `posts/index.html` 的总数、各分类数量及对应条目的 `data-categories`，并与文章页的分类保持一致。侧栏的信息会从文章列表读取。

复制文章时，保留评论区及共享脚本；使用新文章自己的标题、日期、简介和 URL，避免继承旧文章的分享信息。
