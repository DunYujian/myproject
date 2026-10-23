# 本地预览与发布

[返回仓库首页](../README.md) · [文档目录](README.md)

## 本地预览

在仓库根目录运行（需本机安装 Python）：

```powershell
python -m http.server 8000
```

浏览器打开 [http://localhost:8000](http://localhost:8000)。使用 HTTP 服务预览，文章列表请求、歌单、站内连续播放与资源路径更接近线上行为。

## GitHub Pages

仓库为 `DunYujian/myproject`，静态页面从 `main` 分支的根目录发布。仓库设置中使用：

```text
Settings → Pages → Build and deployment
Source: Deploy from a branch
Branch: main / (root)
```

当前自定义域名以根目录 [CNAME](../CNAME) 为准：`dunyujian.cc.cd`。网站地址为 [https://dunyujian.cc.cd/](https://dunyujian.cc.cd/)。

`CNAME` 和 `.nojekyll` 需要留在根目录。更改域名时，还应核对 Pages 设置、DNS 解析及页面 canonical / Open Graph 链接；不要只改 README。

DNS 与证书配置参考 [GitHub 官方自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。README 里的域名不能替代 DNS 控制台配置。

## 页面路径约定

首页、关于、游戏选择页和 404 页面保留原有路径。文章放在 `posts/`，各个游戏放在 `games/<游戏名>/`，测试页放在 `test/`。

普通页面使用相对链接；`404.html` 使用 `/assets/...`、`/posts/...` 等根路径，避免错误地址的目录深度影响资源加载。

移动资源时需要同时调整引用；文章改名还会影响 Utterances 按 pathname 关联的讨论和按页面地址累计的阅读数。

## 提交前检查

- 音乐上传到 `music/` 并更新歌单。
- 检查本地页面链接、图片、脚本和下载文件。
- 用桌面和手机宽度预览改动过的页面。
- 只提交网站文件；本地原稿、日志和虚拟环境由 `.gitignore` 排除。

推送后可在 GitHub Actions 查看 Pages 发布状态。
