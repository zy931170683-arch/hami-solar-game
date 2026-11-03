# 追光之地 · 哈密光热站

版本 4.2.1。已处理 GitHub Pages 仓库子路径，解压后可直接上传，无需 npm 安装或构建。

## 上传与生成预览链接

1. 登录你要使用的 GitHub 账号，创建一个 Public 仓库，例如 hami-solar-game。免费账号使用公开仓库；有相应付费方案时也可按 GitHub 的支持范围使用私有仓库。
2. 解压 ZIP。进入 github-upload 文件夹，上传里面的所有文件和目录。不要只上传 ZIP，也不要把 github-upload 这一层作为仓库目录上传。
3. 在仓库页选择 Add file → Upload files，把 index.html、src、public 和其它文件一起拖入上传区，等待完成，再点 Commit changes。目录结构必须保留，文件不要改名。
4. 确认仓库根目录能直接看到 index.html，且 src 与 public 在它旁边。
5. 打开 Settings → Pages，Source 选择 Deploy from a branch；Branch 选择 main（或实际上传的分支），Folder 选择 /(root)，点击 Save。
6. 等待 GitHub 的 Pages 部署完成。Pages 设置页会显示网站链接，通常是 https://你的用户名.github.io/仓库名/ 。以设置页显示的地址为准。

第六章直达：在生成的链接末尾加 ?chapter=6，例如 https://你的用户名.github.io/hami-solar-game/?chapter=6 。

官方步骤：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 文件结构

index.html —— 网页入口，必须在仓库根目录
src/ —— 页面、交互与三维场景源码
public/ —— 图片、模型和本地 Three.js 依赖，必须完整上传
.nojekyll —— 作为普通静态文件发布
server.mjs、package.json —— 可选的本地预览工具，线上无需运行 Node

## 注意

- 如果 GitHub 提示上传数量限制，分批上传也可以，但必须保持原目录层级，直到所有文件提交完毕。
- 如果只出现 README，检查 Pages 分支、目录和 index.html 所在层级。
- 如果看到旧版页面，先等待 Pages 部署成功，再强制刷新。
- 解压后直接双击 index.html 不能正常运行。需要本地预览时，在此文件夹运行 node server.mjs，然后访问 http://127.0.0.1:4180/ 。
- 游戏进度保存在浏览器本地；换设备或换网址后可重新开始。
- 本包包含运行源码与素材；本地版本备份、开发截图、临时文件及原始 Blender 工程没有放入发布包。
