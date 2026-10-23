# 再也的小站

个人博客与小游戏网站，使用 HTML、CSS 和原生 JavaScript，无需前端构建。提交到 GitHub 后由 GitHub Pages 发布。

**网站：[dunyujian.cc.cd](https://dunyujian.cc.cd/)** · **仓库：[DunYujian/myproject](https://github.com/DunYujian/myproject)**

## 目录

```text
myproject/
├── index.html              首页
├── about.html              关于与联系邮箱
├── games.html              游戏选择页
├── 404.html                错误页
├── posts/                  文章页面与文章列表
├── games/                  每个游戏各自的页面、脚本和样式
├── test/                   独立测试页
├── music/                  MP3、歌单和音乐上传说明
├── assets/
│   ├── css/                公共样式
│   ├── js/                 公共交互与组件
│   ├── fonts/              字体及授权文件
│   ├── images/             文章图片，按文章分目录
│   └── downloads/          教程数据、配置示例和下载包
├── scripts/                内容维护脚本
├── docs/                   发布、写作与功能说明
├── CNAME                   自定义域名
├── .nojekyll               GitHub Pages 静态发布标记
└── .gitignore              本地资料与临时文件忽略规则
```

## 常用操作

| 要做什么 | 入口 |
| --- | --- |
| 预览与发布网站 | [发布说明](docs/deployment.md) |
| 新增文章或导入微信文章 | [内容维护](docs/content.md) · [文章目录](posts/README.md) |
| 上传或整理 MP3 | [音乐说明](music/README.md) |
| 调整主题、评论、侧栏、统计和游鱼 | [功能说明](docs/features.md) |
| 修改小游戏 | [游戏目录](games/README.md) |
| 添加测试内容 | [测试页说明](test/README.md) |
| 运行维护脚本 | [脚本说明](scripts/README.md) |
| 查找字体、图片、教程附件 | [资源目录](assets/README.md) |

## 本地预览

在仓库根目录运行以下命令（需要已安装 Python），然后打开 [http://localhost:8000](http://localhost:8000)：

```powershell
python -m http.server 8000
```

网站提供浅色、深色、胭脂粉主题，支持文章交叉分类、评论、音乐连续播放、农历日历、时钟和访问统计。详细配置见 [文档目录](docs/README.md)。

## 文件放置约定

- 音乐统一上传到 `music/`，不要放在仓库根目录；上传后运行 `python scripts/update_music.py` 更新歌单。
- 文章放在 `posts/`，配图放在 `assets/images/<文章名>/`，下载材料放在 `assets/downloads/<专题名>/`。
- 每个游戏独立放在 `games/<游戏名>/`；网站的公共样式与脚本放在 `assets/`。
- `CNAME`、`.nojekyll` 和根页面保留位置，以兼容现有发布方式和网址。
- 本地 `wxgzh/`、`头像/`、SSH 日志与开发缓存不上传；仓库中的图片、字体授权、音乐及教程附件正常保留。
