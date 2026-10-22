"""Build the tutorial's clearly labelled synthetic data and style illustration."""
from pathlib import Path
import csv
import zipfile

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "assets" / "downloads" / "codex-origin"
DEST.mkdir(parents=True, exist_ok=True)
ROWS = [
    (0, 1.00, 1.00), (2, 1.10, 1.24), (4, 1.19, 1.56),
    (6, 1.27, 1.82), (8, 1.35, 2.03), (10, 1.41, 2.20), (12, 1.47, 2.31),
]
with (DEST / "demo.csv").open("w", encoding="utf-8", newline="") as handle:
    writer = csv.writer(handle)
    writer.writerow(["time_h", "control", "treatment"])
    writer.writerows(ROWS)

config = """# Example only: merge this table into your Codex config.toml.
# Create C:\\origin-paper\\.venv and install origin-mcp there first.
[mcp_servers.origin]
command = 'C:\\origin-paper\\.venv\\Scripts\\python.exe'
args = ['-m', 'origin_mcp']
cwd = 'C:\\origin-paper'
startup_timeout_sec = 30
tool_timeout_sec = 180

[mcp_servers.origin.env]
ORIGIN_MCP_ALLOWED_ROOTS = 'C:\\origin-paper'
"""
(DEST / "origin-mcp.toml").write_text(config, encoding="utf-8")
prompt = """请用已经连接的 Origin MCP 处理 C:\\origin-paper\\data\\demo.csv。
先读取表头与数据范围，报告列映射；这份数据是人为构造的教学数据。
以 time_h 为 X，control、treatment 为 Y，创建双系列点线图。
只绘制原始点和连接线，不做平滑、拟合，也不要添加误差棒或显著性标记。
成图尺寸 85 mm × 60 mm，白底、Arial 8.5 pt，线宽约 1.2 pt。
Control 用 #287C8E 圆点实线，Treatment 用 #C35A46 方点虚线。
X 轴为 Time (h)，Y 轴为 Signal (a.u.)，图例不要遮挡数据。
请根据实际工具 schema 和可用模板完成操作，不要猜测不存在的工具。
先生成预览检查裁切、图例和轴标题，再导出 output 中的新文件：
fig1.pdf（矢量）、fig1.png（600 dpi），以及可继续编辑的 Origin 项目。
如果导出工具不能直接设置 dpi，请换算物理尺寸对应的像素并说明实际设置。
保留原始 CSV，另存项目；同时记录采用的列映射、样式和导出路径。
"""
(DEST / "plot-prompt.txt").write_text(prompt, encoding="utf-8")
(DEST / "README.txt").write_text(
    "Codex + Origin tutorial materials, 2026-10-22.\n"
    "demo.csv is synthetic teaching data, not an experiment.\n"
    "Copy it to C:\\origin-paper\\data\\demo.csv.\n"
    "origin-mcp.toml is a configuration example, not an installer.\n"
    "Merge it with your existing Codex config; do not overwrite the whole file.\n"
    "style-preview.png/svg are Matplotlib illustrations, not Origin screenshots.\n"
    "Windows Origin/OriginPro GUI execution has not been tested here.\n",
    encoding="utf-8",
)
plt.rcParams.update({"font.family": "Arial", "font.size": 8.5, "axes.linewidth": .7,
                     "xtick.direction": "out", "ytick.direction": "out", "svg.fonttype": "none"})
fig, ax = plt.subplots(figsize=(85 / 25.4, 60 / 25.4), layout="constrained")
x, control, treatment = zip(*ROWS)
ax.plot(x, control, "o-", color="#287C8E", linewidth=1.2, markersize=3.5, label="Control")
ax.plot(x, treatment, "s--", color="#C35A46", linewidth=1.2, markersize=3.5, label="Treatment")
ax.set(xlabel="Time (h)", ylabel="Signal (a.u.)", xlim=(-.4, 12.4), ylim=(0, 2.8))
ax.set_xticks([0, 3, 6, 9, 12])
ax.spines[["top", "right"]].set_visible(False)
ax.tick_params(length=3, width=.7)
ax.legend(frameon=False, loc="upper left", fontsize=7.5, handlelength=2)
ax.text(.99, .02, "Illustrative data", transform=ax.transAxes, ha="right", va="bottom", fontsize=6.5, color="#666666")
fig.savefig(DEST / "style-preview.png", dpi=600, facecolor="white")
fig.savefig(DEST / "style-preview.svg", facecolor="white")
plt.close(fig)
with zipfile.ZipFile(DEST / "tutorial-materials.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for name in ["demo.csv", "origin-mcp.toml", "plot-prompt.txt", "README.txt"]:
        archive.write(DEST / name, name)
print("Built synthetic CSV, configuration, prompt, illustration, and download bundle.")
