# 炖鱼尖的博客

一个**零依赖**的静态博客框架：纯 HTML + CSS + JavaScript，没有构建步骤、没有 npm、没有框架。
改完文件直接提交，GitHub Pages 就会更新。

## 目录结构

```
.
├── index.html              # 首页：Hero + 最新文章 + 简介
├── about.html              # 关于页：头像、简介、经历时间线
├── 404.html                # 404 页（GitHub Pages 会自动使用）
├── posts/
│   ├── index.html          # 文章列表
│   ├── welcome.html        # 示例文章：长文（含代码块 / 表格）
│   ├── essay-writing.html  # 示例文章：短文（含引用 / 列表）
│   └── toolkit.html        # 示例文章：清单体（含表格）
├── assets/
│   ├── css/style.css       # 全站样式（含暗色模式、响应式、打印样式）
│   ├── js/main.js          # 主题切换、移动端菜单、导航高亮
│   ├── favicon.svg         # 站点图标
│   └── avatar.svg          # 头像占位图
├── .nojekyll               # 告诉 GitHub Pages 不要跑 Jekyll
└── README.md
```

## 本地预览

不用装任何东西，任选一种：

```powershell
# Python（本机已装）
python -m http.server 8000
# 然后浏览器打开 http://localhost:8000
```

直接双击 `index.html` 也能看，但用服务器预览更接近线上效果。

## 写一篇新文章

1. 复制 `posts/welcome.html`，重命名为 `posts/你的标题.html`（建议用英文短横线，如 `reading-2026.html`）。
2. 改这几处：
   - `<title>` 和 `<meta name="description">`
   - `<span class="kicker">` 分类文字
   - `<h1>` 标题、`<time datetime="...">` 日期、阅读时间
   - `<div class="prose">` 里的正文
   - 文末的标签，以及上一篇 / 下一篇
3. 把文章加进两个列表：
   - `posts/index.html` 的 `<ul class="post-list">` 里复制一个 `<li>`
   - `index.html` 首页「最新文章」的 `.grid` 里复制一张 `.card`

正文可用的样式（见示例文章）：`<h2>` `<h3>`、`<p>`、`<ul>`/`<ol>`、`<blockquote>`、
`<pre data-lang="js"><code>` 代码块（会自动显示语言角标）、`<table>`、`<figure>` + `<figcaption>`、`<hr>`。

## 修改站点信息

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名「炖鱼尖的博客」 | 每个页面里 `.brand` 的文字，以及 `<title>` |
| 品牌图标里的字母 | `.brand__mark` 里的 `M` |
| 首页大标题 / 副标题 | `index.html` 的 `.hero` |
| 头像 | 替换 `assets/avatar.svg`，或改 `about.html` 里 `img.avatar` 的 `src` |
| 邮箱 / GitHub 链接 | 搜索 `you@example.com` 和 `href="#"` |
| 配色 | `style.css` 开头的 `:root` 变量（`--accent` 是主色） |
| 暗色模式配色 | `[data-theme="dark"]` 那一组变量 |

主题切换会记住你的选择（存在 `localStorage`），没选过时跟随系统设置。颜色全部集中在 CSS 变量里，改一处全站生效。

## 部署到 GitHub Pages

```
Settings → Pages → Build and deployment
  Source: Deploy from a branch
  Branch: main  /  (root)
```

站点地址：**https://zxhtta.cc.cd/**。

仓库根目录的 `CNAME` 文件保存自定义域名 `zxhtta.cc.cd`。
在仓库 Settings → Pages 中确认 Custom domain 为 `zxhtta.cc.cd`，并启用 Enforce HTTPS。

域名 DNS 使用以下四条 A 记录（当前已配置）：

| 类型 | 主机记录（以 zxhtta.cc.cd 为 DNS 区域） | 目标 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

DNS 和证书变更可能需要最多 24 小时生效。配置说明见 [GitHub 官方文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。

**路径说明**：自定义域名将网站部署在 `/` 根目录。
普通页面使用相对链接；`404.html` 使用 `/assets/...`、`/posts/...` 等根路径，确保访问任意层级的错误地址时仍能加载样式并返回首页。
更换域名时同步修改 `CNAME` 和 `index.html` 的 canonical、og:url。

## 文章评论（Utterances）

文章页已接入 [Utterances](https://utteranc.es/)，评论公开存储在 `DunYujian/myproject` 的 Issues 中。

首次启用：

1. 保持仓库为公开仓库，并开启 Settings → General → Features → Issues。
2. 安装 [Utterances GitHub App](https://github.com/apps/utterances/installations/new)，选择 **Only select repositories**，只授权 `myproject`。
3. 打开文章页面，登录 GitHub 发表评论；首次评论会自动创建对应的 Issue。

每篇文章以 `pathname` 关联独立评论，更改文章标题或域名不会改变关联；更改文章路径会对应新的讨论。
`assets/js/comments.js` 负责加载评论，并使其跟随站点的明暗主题切换。
复制现有文章创建新文章时，保留 `.post-comments` 区块和 `comments.js` 引用即可。
页面不需要配置 GitHub Token、Client Secret 或自建数据库。访客登录授权由 Utterances 处理。
如果评论无法加载，可使用评论区的 GitHub Issues 链接；若提示未安装应用，请检查 App 对 `myproject` 的授权。

## 下一步可以加什么

- 标签归档页：新建 `tags.html`，用 JS 扫描文章列表生成
- RSS：手写一个 `feed.xml`，注意日期用 RFC 822 格式
- 全文搜索：把文章标题和摘要写成 `search.json`，用 JS 做客户端搜索
- 文章内目录（TOC）：JS 扫描 `.prose h2, h3` 生成侧边栏

## 说明

- 没有构建步骤：不需要 node、npm、打包工具
- 字体用系统字体，不依赖 CDN，国内访问也不会卡在字体加载上
- 已做基础可访问性：跳过导航链接、`aria-current`、键盘焦点样式、`prefers-reduced-motion`
- 已做打印样式：打印时只留正文
