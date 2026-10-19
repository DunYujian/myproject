# 独立网页游戏

| 游戏 | 页面 | 文件 |
| --- | --- | --- |
| 贪吃蛇 | `snake/index.html` | `engine.js`、`game.js`、`style.css` |
| 记忆翻牌 | `memory/index.html` | `game.js`、`style.css` |
| 雨夜邮局 | `story/index.html` | `engine.js`、`game.js`、`style.css` |

每个目录只加载本游戏的逻辑和样式。站点导航、主题、字体、游鱼、音乐和浏览统计沿用根目录 `assets/` 中的公共组件。
根目录 `games.html` 是游戏选择页，旧的 `#snake`、`#memory`、`#story` 链接会跳转到对应独立页面。
存档键保持不变，已保存的贪吃蛇最高分和雨夜邮局进度可以继续使用。
