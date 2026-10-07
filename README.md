# 三视频质量盲评网站

参考 [GeoT2V video labeling](https://github.com/Sosekie/geot2v-video-labeling) 的静态标注流程，重新实现三视频对比。无构建步骤、无后端依赖。每组各有三段视频和独立 prompt，标注者选出质量最佳的一段或选择无法区分。

## 本地运行

在此文件夹运行 `python3 -m http.server 8080`，打开 http://localhost:8080 。不要直接双击 HTML（浏览器会限制 JS 模块）。

## 添加实际内容

1. 将 MP4 文件放入 `videos/`。推荐浏览器兼容的 H.264 编码。
2. 编辑 `study-config.js`：每个 group 有三个视频，每个视频包含 `id`、`src`、`prompt` 和可选的 `method`。当前配置为占位示例，需要提供对应视频才能播放。
3. `src` 使用 `videos/example.mp4` 等相对路径，或可直接访问的 HTTPS 视频地址。相对路径兼容任意 GitHub 仓库名。
4. 研究内容变化时递增 `version`；每组和组内视频的 `id` 保持唯一。

组顺序和组内视频顺序在开始时随机生成，刷新后保持。界面隐藏 method，导出结果包含真实视频 id、method、prompt、展示顺序、答案、备注和作答时间。prompt 本身如果包含模型名称，会破坏盲评，请在配置时去掉。

## 上传到新 GitHub 仓库

将此文件夹的**内容**作为新仓库根目录上传（包括 `.nojekyll`），在 GitHub 的 Settings → Pages 中选择从 `main` 分支的 `/ (root)` 发布。页面地址为 `https://用户名.github.io/仓库名/`。不需要 npm 或数据库。

也可以在 Pages 设置中选择 GitHub Actions，使用附带的 `.github/workflows/pages.yml` 发布。两种方式选择一种即可。此工作流仅适用于本文件夹作为新仓库根目录的情况。

如果保留在当前仓库内，可以直接访问 `/video-comparison/` 路径，但当前仓库原有的 Vite 构建不会自动复制这个目录。

## 收集结果

标注者填写姓名或匿名编号，完成后下载 JSON 或 CSV，再交给研究者。支持部分进度导出、修改答案、刷新续评和复制 JSON。导出会保存当前已选择的答案。CSV 每个视频一行，包含所在组的获胜视频 id；三个视频均不获胜时需检查 winner_video_id 是否为 `tie` 或空值。

**结果仅保存在当前浏览器，不会自动上传到 GitHub 或研究者服务器。** GitHub Pages 上此版本使用文件导出收集。如果需要集中收集，需要另配兼容此三视频结果格式的后端；当前仓库的 pairwise API 格式不能直接使用。

不要将标注者结果文件提交到公开仓库。重新开始前先导出需要保留的结果。清除浏览器数据会清除本地进度。
# video_comparison
