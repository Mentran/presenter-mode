# GitHub 发布指南

## 准备工作清单

### ✅ 已完成
- [x] 核心功能完整（presenter.html, src/）
- [x] 中文文档（README.md, CONTRIBUTING.md）
- [x] 截图素材（docs/）
- [x] 示例文件（slides.html, notes.md）
- [x] 测试脚本（npm test）
- [x] MIT 许可证
- [x] Skill 定义和安装脚本

### 📝 发布前必做

#### 1. 更新 package.json 个人信息

打开 `package.json`，替换这两处：

```json
"author": "你的名字 <你的邮箱@example.com>",
"repository": {
  "url": "https://github.com/你的GitHub用户名/presenter-mode.git"
}
```

#### 2. 提交所有改动

```bash
git add -A
git status  # 检查待提交文件
git commit -m "准备发布到 GitHub"
```

## 在 GitHub 上创建仓库

### 方法 1：通过网页创建（推荐）

1. **登录 GitHub**：打开 https://github.com

2. **创建新仓库**：
   - 点击右上角 `+` → `New repository`
   - 仓库名：`presenter-mode`
   - 描述：`HTML 幻灯片的零构建演讲者视图`
   - 可见性：`Public`（公开）或 `Private`（私有）
   - **不要**勾选 "Add a README file"（已有 README）
   - **不要**勾选 "Add .gitignore"（已有 .gitignore）
   - **不要**选择 License（已有 LICENSE）
   - 点击 `Create repository`

3. **记录仓库 URL**：
   创建后页面会显示类似这样的 URL：
   ```
   https://github.com/你的用户名/presenter-mode.git
   ```

### 方法 2：通过命令行创建（需要 GitHub CLI）

```bash
# 安装 GitHub CLI（如果还没有）
brew install gh

# 登录
gh auth login

# 创建仓库
gh repo create presenter-mode --public --source=. --remote=origin --push
```

## 推送到 GitHub

### 如果用方法 1（网页创建）

在项目目录执行：

```bash
cd /Users/vitamin/Desktop/vibecoding/projects/presenter-mode

# 添加远程仓库（替换你的用户名）
git remote add origin https://github.com/你的用户名/presenter-mode.git

# 推送到 GitHub
git push -u origin main
```

如果遇到 "main" 分支不存在的问题：

```bash
# 重命名当前分支为 main
git branch -M main

# 再推送
git push -u origin main
```

### 如果用方法 2（GitHub CLI）

CLI 会自动推送，无需额外操作。

## 验证发布

推送成功后：

1. **访问仓库页面**：`https://github.com/你的用户名/presenter-mode`

2. **检查 README 显示**：
   - 截图正常显示
   - 链接可点击
   - 表格和代码块格式正确

3. **检查文件结构**：
   - 所有核心文件已上传
   - `测试/` 目录未上传（在 .gitignore 中）

## 可选：启用 GitHub Pages

如果想要在线演示：

1. **仓库设置** → **Pages**
2. **Source**: 选择 `main` 分支，`/ (root)` 目录
3. 点击 **Save**
4. 等待几分钟，访问：
   ```
   https://你的用户名.github.io/presenter-mode/presenter.html
   ```

5. **更新 README**，在顶部添加演示链接：
   ```markdown
   [📺 在线演示](https://你的用户名.github.io/presenter-mode/presenter.html)
   ```

## 发布后维护

### 日常更新流程

```bash
# 修改代码
git add -A
git commit -m "描述你的改动"
git push
```

### 同步 Skill 资源

每次修改核心文件后：

```bash
cp presenter.html skill/add-presenter-mode/assets/presenter-mode/
cp -r src skill/add-presenter-mode/assets/presenter-mode/
git add skill/
git commit -m "同步 skill 资源"
git push
```

## 常见问题

### Q: 推送时提示 "Permission denied"

**A:** 检查 SSH key 或使用 HTTPS 并输入 GitHub 密码/token。

HTTPS URL 格式：
```
https://github.com/你的用户名/presenter-mode.git
```

生成 SSH key：
```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
cat ~/.ssh/id_ed25519.pub  # 复制输出
# 在 GitHub Settings → SSH Keys 添加
```

### Q: 推送时提示 "Repository not found"

**A:** 检查：
1. 仓库名拼写是否正确
2. 用户名是否正确
3. 仓库是否已创建

### Q: 截图在 GitHub 上不显示

**A:** 检查：
1. 图片路径是否正确（`docs/screenshot-xxx.png`）
2. 图片是否已提交（`git status` 查看）
3. 使用相对路径，不要用绝对路径

### Q: 想修改已推送的 commit message

**A:** 只修改最后一次提交：
```bash
git commit --amend -m "新的消息"
git push --force
```

⚠️ 不要在别人已经拉取的分支上使用 `--force`。

## 下一步

发布成功后可以考虑：

- ✅ 添加 GitHub Actions CI 自动测试
- ✅ 创建 issue 模板方便用户反馈
- ✅ 添加项目标签（Topics）提高可发现性
- ✅ 在 README 添加徽章（License、Stars 等）
- ✅ 撰写详细的 Release Notes

祝发布顺利！🚀
