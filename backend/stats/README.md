# 自有访问统计

Cloudflare Worker 接收浏览事件，D1 保存数据。访客数按浏览器本地随机标识去重，不等同于真实人数。统计不会迁入不蒜子的历史数字；新数据库从零开始。接口只接受配置好的站点 Origin，Origin 校验不等于身份验证，公开计数仍可能受自动请求影响。Worker 不保存 IP、账号或 URL 查询参数。

## 部署

1. 本机安装 Node.js，并执行 npx wrangler login 登录自己的 Cloudflare 账号。
2. 在本目录执行 npx wrangler d1 create zaiye-site-stats，复制 wrangler.example.toml 为 wrangler.toml，填入数据库 ID。
3. 执行 npx wrangler d1 migrations apply zaiye-site-stats --remote，再执行 npx wrangler deploy。
4. 将 Worker 的 HTTPS 地址填入 assets/js/stats.js 中的 endpoint，并更新 HTML 中 stats.js 的版本参数，提交到 GitHub Pages。
5. 用线上首页和一篇文章验证浏览量增长及访客数去重。未填 endpoint 前，网站仍使用不蒜子。

本地 wrangler.toml 不提交。CORS 允许域名与网站地址需一致。不要把 API 密钥提交到仓库。
