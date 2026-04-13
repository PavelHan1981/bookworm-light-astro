@echo off
chcp 65001 >nul
echo.
echo 🚀 启动自动部署...
echo.

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 执行自动部署脚本
node auto-deploy.mjs

REM 暂停查看结果
echo.
pause
