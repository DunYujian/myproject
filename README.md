# 再也的博客

一个**零依赖**的静态博客框架：纯 HTML + CSS + JavaScript，没有构建步骤、没有 npm、没有框架。
改完文件直接提交，GitHub Pages 就会更新。

## 目录结构

```
.
├── index.html              # 首页：作者简介 + 最近文章
├── about.html              # 关于页：头像、简介、经历时间线
├── 404.html                # 404 页（GitHub Pages 会自动使用）
├── posts/
│   ├── index.html          # 文章列表
│   ├── welcome.html        # 示例文章：长文（含代码块 / 表格）
│   ├── essay-writing.html  # 示例文章：短文（含引用 / 列表）
│   └── toolkit.html        # 示例文章：清单体（含表格）
├── assets/
│   ├── css/reading.css       # 全站样式（含暗色模式、响应式、打印样式）
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
   - `index.html` 首页「最近文章」的 `.recent-list` 里复制一个 `<li>`

正文可用的样式（见示例文章）：`<h2>` `<h3>`、`<p>`、`<ul>`/`<ol>`、`<blockquote>`、
`<pre data-lang="js"><code>` 代码块（会自动显示语言角标）、`<table>`、`<figure>` + `<figcaption>`、`<hr>`。

## 修改站点信息

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名「再也的博客」 | 每个页面里 `.brand` 的文字，以及 `<title>` |
| 头像 / 站点图标 | `assets/avatar.svg` / `assets/favicon.svg` |
| 作者名 / 简介 | `index.html` 的 `.home-intro` |
| 头像 | 替换 `assets/avatar.svg`，或改 `about.html` 里 `img.avatar` 的 `src` |
| 邮箱 / GitHub 链接 | 搜索 `you@example.com` 和 `href="#"` |
| 配色 | `reading.css` 开头的 `:root` 变量（`--accent` 是主色） |
| 暗色模式配色 | `[data-theme="dark"]` 那一组变量 |

站点采用窄栏、衬线字体和日期列表，浅色主题为雾白与松绿，深色主题为墨绿灰与浅绿。
页面右上角可切换两种主题，文章评论同步切换。

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
- 艺术字体随网站本地托管，不依赖字体 CDN；文章正文保留系统字体。字体采用 font-display: swap，加载期间文字仍可阅读。
- 已做基础可访问性：跳过导航链接、`aria-current`、键盘焦点样式、`prefers-reduced-motion`
- 已做打印样式：打印时只留正文

## 微信文章存档

已迁入 `posts/lanqiao-hal-key-click.html`，原文《3、蓝桥杯嵌入式—HAL库-按键单击》，发布日期保留为 2024-03-03。
正文的 10 张图片已存入 `assets/images/wechat-key-click/`，代码、表格与原文出处均已保留，评论沿用 Utterances。
`wxgzh` 中第 1、2 篇目前只有资源目录，缺少文章 HTML，尚未导入。原始下载资料保留在本地，不随此次发布上传。

## 音乐播放器

各页底部提供可展开的音乐播放器，默认不自动播放。MP3 放入根目录 `music/` 后提交到 `main` 即可被播放器识别。
上传音乐前运行 `python scripts/update_music.py` 更新备用歌单；详细用法见 [music/README.md](music/README.md)。
播放器无需 Token，优先读取本仓库的音乐目录；GitHub API 不可用时回退到 `music/playlist.json`。

## 字体与交叉分类

博客界面优先匹配本机瘦金体，使用站酷小薇体作为未安装时的兼容字体；首页寄语使用志莽行书。
文章标题、正文与代码保留原字体。字体来源、OFL 许可和瘦金字体替换入口见 [assets/fonts/README.md](assets/fonts/README.md)。

分类固定为：生活、学习、工作、小叙、闲谈、感悟。一篇文章可以属于多个分类。
文章列表支持多选交集：同时选择“学习”和“工作”时，只显示同时属于这两类的文章；点击“全部”清空筛选。
筛选会写入 URL，可复制分享，浏览器前进/后退也会恢复所选分类。没有交集时显示空状态，不会自动放宽条件。

新增或调整分类时，保持两处一致：

1. 文章页的 `<meta name="categories" content="学习,工作">` 和 `.post-categories` 分类链接。
2. `posts/index.html` 对应 `.post-item` 的 `data-categories="学习 工作"` 和分类标记。

首页的六个分类入口和文章页的分类链接会打开相应的筛选结果。原有技术标签继续保留。

## 线条游鱼动效

全站使用原生 Canvas 绘制少量线条鱼，缓慢摆尾游动，配色跟随浅色/深色主题。
鱼在页面留白处更清晰，在正文区域降低透明度；装饰层不拦截鼠标、触摸或键盘操作。
导航栏的鱼形按钮可以暂停或开启动效，选择保存在本机。
系统开启“减少动态效果”时关闭动画，后台标签页也会暂停；手机减少鱼的数量，绘制频率限制为每秒 30 帧。
样式与绘制逻辑分别位于 `assets/css/fish.css` 和 `assets/js/fish.js`，无额外依赖或图片请求。

## 网页小游戏

全站导航的“游戏”入口指向 `games.html`，包含三个纯前端小游戏：

- 贪吃蛇：方向键/WASD、手机滑动和方向按钮；空格暂停；三档速度；本机最高分；后台或切换游戏时暂停。
- 记忆翻牌：六对汉字卡片，统计尝试次数，支持重新洗牌和键盘操作。
- 剧情解谜《雨夜邮局》：三处场景、两道机关、两个结局，支持线索提示和本机存档。

游戏适配现有浅色/深色主题。无需账号、数据库、外部脚本或游戏素材。
每个游戏的页面、脚本与样式分别放在 `games/snake/`、`games/memory/`、`games/story/`。
`games.html` 仅作为游戏选择页，`assets/css/games.css` 只用于该选择页。

## 浏览统计（不蒜子）

文章日期旁显示本页阅读次数；全站页脚显示访问次数（PV）与访客数（UV）。
统计由 [不蒜子](https://busuanzi.ibruce.info/) 提供，通过 `assets/js/stats.js` 异步加载官方脚本，不需要安装、账号或 Token。
计数在服务返回真实数据后显示；服务无法访问或被拦截时保持隐藏，不用本地数字或假数据代替。
本地 localhost、127.0.0.1 和直接打开的文件不会发送统计请求。

统计从接入后开始累计，无法补回历史访问；阅读次数不等于独立读者数，也不保证排除刷新或所有自动访问。
各篇文章按统计服务识别的页面地址计数，更改文章路径可能使统计分开。
新增文章时保留 `.post__meta` 中的 `busuanzi_container_page_pv`、页脚统计元素和 `stats.js` 引用。

## 剧情解谜《雨夜邮局》

从游戏选择页进入“雨夜邮局”，或直接打开 `games/story/`；旧链接 `games.html#story` 会自动跳转。
短篇原创故事约 5–10 分钟：探索候信厅、旧值班室和渡口，收集物品，解开数字锁和图案锁，完成两个可切换的结局。
提供随身物品、线索手记、分阶段提示与重新开始；进度保存在本机 localStorage，刷新或切换游戏后可继续，不需要注册或联网存档。
浏览器禁止本地存储时仍可游玩，但不能保留刷新后的进度。

故事规则与存档检查位于 `games/story/engine.js`，界面与线稿位于 `games/story/game.js`，样式为 `games/story/style.css`。
