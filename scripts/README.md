# 维护脚本

[返回仓库首页](../README.md)

从仓库根目录运行以下命令。脚本用于维护内容，网站发布与访客浏览不需要 Python 环境。

| 脚本 | 命令 | 依赖与输出 |
| --- | --- | --- |
| `update_music.py` | `python scripts/update_music.py` | 仅 Python 标准库；扫描 `music/` 并更新 `music/playlist.json` |
| `create_origin_tutorial_assets.py` | `python scripts/create_origin_tutorial_assets.py` | 需要 Matplotlib；生成 Origin 教程的 CSV、配置示例、提示词、样式示意和 ZIP |

## 更新歌单

把 MP3 放入 `music/` 后运行歌单脚本，将音频和 `playlist.json` 一起提交。不要把歌曲传到仓库根目录。

## 重建教程附件

如本地未安装 Matplotlib，可在自己的 Python 环境中安装：

```powershell
python -m pip install matplotlib
python scripts/create_origin_tutorial_assets.py
```

输出目录为 `assets/downloads/codex-origin/`。脚本会重建该教程的同名附件，图中使用人为构造的教学数据。

此脚本不会运行 Origin、安装 Origin MCP，也不会改动本机 Codex 配置。生成的 PNG/SVG 是 Matplotlib 样式示意，不是 Origin 截图。
