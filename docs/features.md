# 站点功能与配置

[返回仓库首页](../README.md) · [文档目录](README.md)

## 修改站点信息

| 想改什么 | 改哪里 |
| --- | --- |
| 站点名「再也的小站」 | 每个页面里 `.brand` 的文字，以及 `<title>` |
| 头像 / 站点图标 | `assets/avatar.svg` / `assets/favicon.svg` |
| 作者名 / 简介 | `index.html` 的 `.home-intro` |
| 头像 | 替换 `assets/avatar.svg`，或改 `about.html` 里 `img.avatar` 的 `src` |
| 邮箱 / GitHub 链接 | `about.html` 中的 `mailto:zsh191983@gmail.com` 和各页的 GitHub 链接 |
| 配色 | `reading.css` 开头的 `:root` 变量（`--accent` 是主色） |
| 暗色模式配色 | `[data-theme="dark"]` 那一组变量 |

站点采用衬线字体和日期列表，提供雾白松绿、墨绿深色和胭脂粉三种主题。页头主题按钮依次切换，选择保存在本机；未选择时跟随系统浅深模式。
页面右上角可切换浅色、深色和胭脂粉三种主题；评论外框跟随配色，Utterances 内部使用对应的浅色或深色主题。

主题切换会记住你的选择（存在 `localStorage`），没选过时跟随系统设置。颜色全部集中在 CSS 变量里，改一处全站生效。

## 说明

- 没有构建步骤：不需要 node、npm、打包工具
- 艺术字体随网站本地托管，不依赖字体 CDN；文章正文保留系统字体。字体采用 font-display: swap，加载期间文字仍可阅读。
- 已做基础可访问性：跳过导航链接、`aria-current`、键盘焦点样式、`prefers-reduced-motion`
- 已做打印样式：打印时只留正文

## 文章评论（Utterances）

文章页已接入 [Utterances](https://utteranc.es/)，评论公开存储在 `DunYujian/myproject` 的 Issues 中。

首次启用：

1. 保持仓库为公开仓库，并开启 Settings → General → Features → Issues。
2. 安装 [Utterances GitHub App](https://github.com/apps/utterances/installations/new)，选择 **Only select repositories**，只授权 `myproject`。
3. 打开文章页面，登录 GitHub 发表评论；首次评论会自动创建对应的 Issue。

每篇文章以 `pathname` 关联独立评论，更改文章标题或域名不会改变关联；更改文章路径会对应新的讨论。
`assets/js/comments.js` 在评论区进入视口附近时加载官方客户端，也支持手动加载、12 秒慢连接提示与失败重试。没有 IntersectionObserver 的浏览器仍可点击按钮加载。
文章日期旁的「评论」链接可直接跳到评论区；收起/展开不会重新创建 iframe，当前页未提交的文字得以保留。离开文章后草稿不保留，重试加载也会重建评论区。
GitHub 备用入口按原有 pathname 键搜索当前文章的讨论，不更改已存在的文章关联，也不自动发表或创建 Issue。
主题切换通过官方消息接口同步；来自 iframe 的就绪消息会校验来源域名和窗口。页面切换前清理本地观察器、消息监听与超时任务。
样式位于 `assets/css/comments.css`。复制现有文章创建新文章时，保留 `.post-comments` 区块、`comments.js` 与 `comments.css` 引用。
页面不需要配置 GitHub Token、Client Secret 或自建数据库。访客登录授权由 Utterances 处理。
如果评论无法加载，可使用评论区的 GitHub Issues 链接；若提示未安装应用，请检查 App 对 `myproject` 的授权。

## 音乐播放器

各页左侧提供可展开的音乐播放器，默认不自动播放。MP3 放入根目录 `music/` 后提交到 `main` 即可被播放器识别。
上传音乐前运行 `python scripts/update_music.py` 更新备用歌单；详细用法见 [music/README.md](../music/README.md)。
播放器无需 Token，优先读取本站 `music/playlist.json`，在后台通过 GitHub API 发现新歌曲。
提供唱片动效、播放/暂停、进度拖动、音量/静音、上一首/下一首、可展开歌单，以及列表循环/单曲循环/随机播放。
歌曲、进度、音量和播放模式保存在本机。站内点击首页、文章、关于和游戏时，只更新正文并保留播放器，音乐可连续播放。首次打开、手动刷新、新标签页或外站跳转后需再次点击播放。
共享样式为 `assets/css/music.css`，逻辑为 `assets/js/music.js`，均无第三方依赖。系统设置减少动态效果时停用唱片旋转。

## 字体与交叉分类

博客界面优先匹配本机瘦金体，使用站酷小薇体作为未安装时的兼容字体；首页寄语使用志莽行书。
文章标题、正文与代码保留原字体。字体来源、OFL 许可和瘦金字体替换入口见 [assets/fonts/README.md](../assets/fonts/README.md)。

分类固定为：生活、学习、工作、小叙、闲谈、感悟。一篇文章可以属于多个分类。
文章列表支持多选交集：同时选择“学习”和“工作”时，只显示同时属于这两类的文章；点击“全部”清空筛选。
筛选会写入 URL，可复制分享，浏览器前进/后退也会恢复所选分类。没有交集时显示空状态，不会自动放宽条件。

新增或调整分类时，保持两处一致：

1. 文章页的 `<meta name="categories" content="学习,工作">` 和 `.post-categories` 分类链接。
2. `posts/index.html` 对应 `.post-item` 的 `data-categories="学习 工作"` 和分类标记。

首页的六个分类入口和文章页的分类链接会打开相应的筛选结果。原有技术标签继续保留。

## 线条游鱼动效

全站使用原生 Canvas 绘制少量线条鱼，缓慢摆尾游动，配色跟随浅色/深色/胭脂粉主题。
鱼在页面留白处更清晰，在正文区域降低透明度；装饰层不拦截鼠标、触摸或键盘操作。
导航栏的鱼形按钮可以暂停或开启动效，选择保存在本机。
鱼在边缘缓慢转向，不再突然从对侧出现；摆尾和鳍随游速轻微变化，正文边缘平滑淡出。窗口调整时保留位置比例，站内跳转后重新测量正文范围。
系统开启“减少动态效果”时关闭动画，后台标签页也会暂停；桌面最多 30 帧/秒、手机最多 24 帧/秒。手机缩小画布像素倍率和鱼的数量，低核心数设备也会减少鱼的数量。
样式与绘制逻辑分别位于 `assets/css/fish.css` 和 `assets/js/fish.js`，无额外依赖或图片请求。

## 网页小游戏

全站导航的“游戏”入口指向 `games.html`，包含三个纯前端小游戏：

- 贪吃蛇：方向键/WASD、手机滑动和方向按钮；空格暂停；三档速度；本机最高分；后台或切换游戏时暂停。
- 记忆翻牌：六对汉字卡片，统计尝试次数，支持重新洗牌和键盘操作。
- 剧情解谜《雨夜邮局》：三处场景、两道机关、两个结局，支持线索提示和本机存档。

游戏适配现有浅色/深色/胭脂粉主题。无需账号、数据库、外部脚本或游戏素材。
每个游戏的页面、脚本与样式分别放在 `games/snake/`、`games/memory/`、`games/story/`。
`games.html` 仅作为游戏选择页，`assets/css/games.css` 只用于该选择页。

## 浏览统计（不蒜子）

文章日期旁显示本页阅读次数；右侧网站详情显示浏览量（PV）与访客数（UV）。
统计由 [不蒜子](https://busuanzi.ibruce.info/) 提供，通过 `assets/js/stats.js` 异步加载官方脚本，不需要安装、账号或 Token。
计数在服务返回真实数据后显示；服务无法访问或被拦截时，侧栏显示「—」，文章阅读计数保持隐藏，不用本地数字或假数据代替。
本地 localhost、127.0.0.1 和直接打开的文件不会发送统计请求。

统计从接入后开始累计，无法补回历史访问；阅读次数不等于独立读者数，也不保证排除刷新或所有自动访问。
各篇文章按统计服务识别的页面地址计数，更改文章路径可能使统计分开。
新增文章时保留 `.post__meta` 中的 `busuanzi_container_page_pv`、侧栏统计元素和 `stats.js` 引用。

## 剧情解谜《雨夜邮局》

从游戏选择页进入“雨夜邮局”，或直接打开 `games/story/`；旧链接 `games.html#story` 会自动跳转。
短篇原创故事约 5–10 分钟：探索候信厅、旧值班室和渡口，收集物品，解开数字锁和图案锁，完成两个可切换的结局。
提供随身物品、线索手记、分阶段提示与重新开始；进度保存在本机 localStorage，刷新或切换游戏后可继续，不需要注册或联网存档。
浏览器禁止本地存储时仍可游玩，但不能保留刷新后的进度。

故事规则与存档检查位于 `games/story/engine.js`，界面与线稿位于 `games/story/game.js`，样式为 `games/story/style.css`。

## 左右侧栏小组件

所有页面使用 `.site-layout` 三栏布局：左侧音乐播放器，中间正文，右侧时钟、日历和网站详情。
桌面左侧播放器随滚动停留；较长的右侧组件随页面正常滚动。平板和手机将组件排列在正文下方，打印时隐藏侧栏。
共享样式为 `assets/css/widgets.css`，网站信息逻辑为 `assets/js/widgets.js`。
时钟与日历界面为 `assets/js/calendar.js`，按设备本地时间显示，精确到秒，跨午夜自动更新日期。隐藏页面时暂停刷新，回来后重新同步时间。
`assets/js/calendar-engine.js` 使用浏览器 [Intl 农历支持](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts) 生成农历日期、干支年和生肖，支持闰月识别。
日历支持月份切换、返回今天、点击日期和方向键选日，以及本月节日列表。收录常见公历节日、春节/元宵/端午/七夕/中秋/重阳/腊八等农历节日、除夕和母亲节/父亲节；不展示调休安排。
清明日期目前收录 2025—2028 年，依据[香港天文台公历与农历对照表](https://www.hko.gov.hk/tc/gts/time/conversion.htm)核对，后续年份需补充。浏览器不支持农历时仍显示公历、固定节日与时钟。
文章数、分类数和最近发表日期从 `posts/index.html` 读取，新增文章时无需手动修改侧栏数字。
音乐默认展开但不自动播放、不预下载音频；优先读取本站 `music/playlist.json`，后台检查 GitHub 新上传歌曲，接口不可用也不阻塞已有歌单。
新增页面时复制 `.site-layout` 结构及共享 CSS/JS 引用，并按页面所在层级调整相对路径。

## 站内连续播放与导航

`assets/js/navigation.js` 只拦截本站 HTML 页面链接，保留左右侧栏和音频节点，更新正文、标题、导航、页面样式及所需脚本。支持浏览器前进/后退、分类与页面锚点；邮件、外链、下载和新标签页沿用浏览器默认行为。
页面切换前触发 `site:before-navigate`，游戏与评论模块清理定时器和全局监听器；切换完成触发 `site:after-navigate`。统计在站内跳转后按新页面重新加载。
请求失败或遇到不支持的页面会退回普通整页跳转，此时音乐会中断。没有 JavaScript 时，原始静态页面及链接仍可直接访问。

## 下一步可以加什么

- 标签归档页：新建 `tags.html`，用 JS 扫描文章列表生成
- RSS：手写一个 `feed.xml`，注意日期用 RFC 822 格式
- 全文搜索：把文章标题和摘要写成 `search.json`，用 JS 做客户端搜索
- 文章内目录（TOC）：JS 扫描 `.prose h2, h3` 生成侧边栏
