@echo off
chcp 65001 >nul
echo ========================================
echo ClassErrorBook GitHub 推送工具
echo ========================================
echo.

:: 检查是否在项目根目录
if not exist "package.json" (
    echo 错误：请在classerrorbook项目根目录运行此脚本
    pause
    exit /b 1
)

:: 检查Git是否初始化
git status >nul 2>&1
if errorlevel 1 (
    echo 错误：当前目录不是Git仓库
    echo 请先运行: git init
    echo 然后运行: git remote add origin https://github.com/Jason4zh/classerrorbook.git
    pause
    exit /b 1
)

echo 步骤1: 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo npm install 失败!
    pause
    exit /b 1
)

echo.
echo 步骤2: 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo npm run build 失败!
    pause
    exit /b 1
)
echo 构建成功!
echo.

echo 步骤3: 添加到Git...
git add .
if %errorlevel% neq 0 (
    echo git add 失败!
    pause
    exit /b 1
)

echo.
echo 步骤4: 提交更改...
set /p commit_msg="请输入提交信息 (留空使用默认信息): "
if "%commit_msg%"=="" (
    set commit_msg="Auto deploy: project update"
)
git commit -m %commit_msg%
if %errorlevel% neq 0 (
    echo ⚠️  git commit 失败，可能没有更改或已经提交
)

echo.
echo 步骤5: 推送到main分支...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ git push 失败
    pause
    exit /b 1
)
echo ✅ 成功推送到 classerrorbook/main

echo.
echo 步骤6: 部署到GitHub Pages...
npx gh-pages -d build
if %errorlevel% neq 0 (
    echo ❌ 部署到gh-pages失败
    pause
    exit /b 1
)
echo ✅ 成功部署到 classerrorbook/gh-pages

echo.
echo ========================================
echo 🎉 推送完成!
echo ✅ 代码已推送到 classerrorbook/main
echo ✅ 网站已部署到 classerrorbook/gh-pages
echo.
echo 🌐 网站地址: https://jason4zh.github.io/classerrorbook/
echo ========================================
pause