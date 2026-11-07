# 再也的云盘

站主通过 Cloudflare Access 登录，在管理页上传、列出、下载和删除文件。Worker 将文件写到私有 R2 桶，为每个文件生成独立的随机下载链接。任何拿到链接的人都可以下载该文件，也能转发链接。删除文件会使原链接失效。每次上传一个文件，单个文件上限为 50 MiB。

## 部署

1. 在 Cloudflare 账号中启用 R2 和 Zero Trust。用已安装 Node.js 的终端运行 `npx wrangler login`。在本目录执行 `npx wrangler r2 bucket create zaiye-drive-files`，保持桶的公开访问关闭。
2. 将 `wrangler.example.toml` 复制为 `wrangler.toml`。如果桶名不同，更新 `bucket_name`。执行 `npx wrangler deploy`，记录部署输出的 HTTPS 地址。运行 `npx wrangler secret put OWNER_EMAIL` 并输入允许管理云盘的邮箱。
3. 在 Zero Trust 的 **Access → Applications** 添加自托管应用，应用域名用刚部署的 Worker 地址，保护 `/admin/` 和 `/admin/*`。策略使用 **Allow → Include → Emails**，仅允许与 `OWNER_EMAIL` 相同的邮箱。登录方式可选择邮件一次性验证码（One-time PIN）。将 Access 的保护范围限定在管理路径，`/d/` 留给分享下载。Worker 也会检查 Access 验证后的邮箱。
4. 打开 Worker 的 `/admin/`，用站主邮箱登录并上传一个测试文件。用无痕窗口访问复制的链接并核对文件内容。确认未登录无法列出、上传或删除文件。删除测试文件后，验证原链接返回 404。
5. 验证通过后，在小站的 `tools/drive/index.html` 提供指向 Worker `/admin/` 的管理入口，并移除 `tools/index.html` 上的「待启用」标记。

参考 [Cloudflare Access 与 Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)、[Access 应用路径](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/)及 [R2 存储桶配置](https://developers.cloudflare.com/r2/buckets/create-buckets/)。
