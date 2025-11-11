# 班级错题共享库

一个简单实用的班级错题收集与共享平台，帮助同学们整理错题、交流学习经验，让错题真正成为进步的阶梯。

## 核心功能

- **错题上传**：支持按学科、题型分类，可填写题干、错误答案、正确答案及错误分析，还能上传错题图片
- **错题检索**：通过学科、题型筛选，或关键词搜索快速找到相关错题
- **题目管理**：支持修改已上传的题目内容，实时预览题目展示效果
- **AI审核功能**：自动检测上传内容，确保题目质量与合规性
- **账号系统**：使用邮箱验证码登录，记录提交人信息
- **共享协作**：所有错题公开可见，方便班级同学互相参考学习

## 怎么用

1. 首页可选择"上传错题"或"查找错题"
2. 上传错题时请尽量完整填写信息，帮助他人更好理解
3. 查找错题时可通过学科、题型筛选，或直接搜索题干关键词
4. 如需反馈建议，可通过页面中的GitHub Issues提交

## 技术支持

- 前端：React + React Router
- 后端：Supabase
- 部署：GitHub Pages

## 本地开发

### 第一步：环境准备

1. **安装必要的开发工具**
   - Node.js安装：访问 https://nodejs.cn/download/ ，获取长期支持版本
   - VSCode安装（可选）：访问 https://code.visualstudio.com/Download ，获取对应版本

2. **获取项目源代码**
   - 将仓库 https://github.com/Jason4zh/classerrorbook/tree/main 克隆至本地
   - 点击右上角Fork，然后点击Create fork创建自己的分支

### 第二步：后端服务配置

3. **创建Supabase项目**
   - 在 https://supabase.com 中点击"Start your project"
   - 选择"Continue With Github"使用GitHub账号登录
   - 登录后创建一个新的project，选择免费方案

4. **数据库初始化**
   - 在Supabase控制台点击左侧"SQL编辑器"
   - 输入以下SQL代码创建表和存储桶：

```sql
-- 创建 profiles 表（关闭 RLS）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 关闭 profiles 表的 RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 创建 question 表
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subject TEXT,
  type TEXT,
  content TEXT,
  eanswer TEXT,
  canswer TEXT,
  analysis TEXT,
  qimageurl TEXT,
  author TEXT,
  aimageurl TEXT,
  comments TEXT[],
  comments_authors TEXT[],
  deployed BOOLEAN DEFAULT FALSE,
  likes BIGINT DEFAULT 0,
  dislikes BIGINT DEFAULT 0
);

-- 启用 question 表的 RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 允许所有用户查看 questions
CREATE POLICY "允许所有用户查看问题" ON questions
  FOR SELECT USING (true);

-- 允许所有用户插入 questions
CREATE POLICY "允许所有用户插入问题" ON questions
  FOR INSERT WITH CHECK (true);

-- 允许所有用户更新 questions
CREATE POLICY "允许所有用户更新问题" ON questions
  FOR UPDATE USING (true);

-- 创建存储桶 questionimg
INSERT INTO storage.buckets (id, name, public) 
VALUES ('questionimg', 'questionimg', true)
ON CONFLICT (id) DO NOTHING;

-- 创建存储桶 answerimg
INSERT INTO storage.buckets (id, name, public) 
VALUES ('answerimg', 'answerimg', true)
ON CONFLICT (id) DO NOTHING;

-- 为 questionimg 存储桶设置 RLS 策略
CREATE POLICY "允许所有用户查看问题图片" ON storage.objects
  FOR SELECT USING (bucket_id = 'questionimg');

CREATE POLICY "允许所有用户上传问题图片" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'questionimg');

CREATE POLICY "允许所有用户更新问题图片" ON storage.objects
  FOR UPDATE USING (bucket_id = 'questionimg');

-- 为 answerimg 存储桶设置 RLS 策略
CREATE POLICY "允许所有用户查看答案图片" ON storage.objects
  FOR SELECT USING (bucket_id = 'answerimg');

CREATE POLICY "允许所有用户上传答案图片" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'answerimg');

CREATE POLICY "允许所有用户更新答案图片" ON storage.objects
  FOR UPDATE USING (bucket_id = 'answerimg');
```

5. **配置邮箱验证模板**
   - 左侧选择Authentication，选择Emails
   - 配置Confirm sign up 和 Magic link模板
   - 可自行配置模板内容，注意使用`{{.Token}}`而不是`{{.ConfirmationURL}}`
   - 推荐使用以下模板：

```html
<h2 style="margin:0 0 24px 0;font-size:20px;color:#2c3e50;font-weight:600;">班级错题共享库 - 登录验证码</h2>

<div style="background:#e8f5e8;border-left:4px solid #27ae60;border-radius:4px;padding:12px 16px;margin-bottom:16px;">
  <p style="margin:0;color:#2c3e50;font-size:14px;font-weight:500;">🎉 欢迎加入（或回到）班级错题共享库！by Jason4zh</p>
</div>

<div style="background:#f8f9fa;border-radius:6px;padding:16px;margin-bottom:24px;">
  <p style="margin:0 0 8px 0;color:#666;font-size:14px;">您的登录验证码为：</p>
  <p style="margin:0;font-size:24px;color:#2c3e50;letter-spacing:4px;font-family:monospace;font-weight:600;">{{ .Token }}</p>
  <p style="margin:12px 0 0 0;color:#999;font-size:13px;">验证码有效期为10分钟，请尽快使用</p>
</div>

<p style="line-height:1.6;color:#666;margin:0;">请在登录页面输入上方验证码完成身份验证</p>

<p style="margin:24px 0 0 0;font-size:14px;color:#999;">此验证码仅本人使用，请勿向他人泄露</p>
```

### 第三步：前端开发环境搭建

6. **安装项目依赖并启动开发服务器**
   - 打开Node.js的命令行终端（可前往左下角Windows栏寻找Node.js Command Prompt打开）
   - 切换至项目根目录（有关如何在终端中切换目录请自行查找相关资料）
   - 运行以下命令安装项目依赖：

```bash
npm install
```

> **注意**：如若遇到错误，大概率是网络环境问题，多次尝试即可

- 等待安装结束后，运行启动命令：

```bash
npm start
```

- 此时浏览器将自动显示页面，终端会显示实时服务器状况
- 请测试各项功能是否存在问题

7. **构建生产版本**
   - 如需构建生产环境版本，按Ctrl+C终止开发服务器
   - 运行构建命令：

```bash
npm run build
```

### 第四步：生产环境部署

8. **GitHub Pages主站配置**
   - 登录GitHub后，创建一个仓库名为"用户名.github.io"
   - 设置为public可见性
   - 为其添加一个index.html文件（如何构建主站可以自行搜索相关资料）
   - 部署好html后，点击Settings → Pages
   - 在branch处选择main分支，/ (root)目录，并点击保存
   - 此时GitHub Pages将开始构建网站，可以在Actions一栏查看构建进度
   - 构建完成后，在Pages设置页面会显示"Your site is live at xxx"字样，表示配置成功

9. **项目部署到GitHub Pages**
   - 打开刚刚克隆的classerrorbook仓库
   - 点击左上角main分支，在"Find or create a branch"输入框中输入分支名称（推荐使用gh-pages）
   - 设置完成后，切换到新建的gh-pages分支
   - 点击Add file → Upload files
   - 将build文件夹内的所有文件全选拖入上传框（注意：不要点击选择上传，直接拖拽文件）
   - 等待上传完成后点击Commit changes推送更改
   - 按照步骤8中的方法配置GitHub Pages，将部署分支改为gh-pages分支

10. **访问应用**
    - 部署完成后，通过访问"https://用户名.github.io/classerrorbook"即可开始使用班级错题共享库
    - 祝配置顺利！

## 说明

本项目为班级内部学习工具，数据公开可见，请不要上传无关信息。新功能持续开发中，欢迎提出使用建议~