# 部署到自己的服务器（例：新加坡）

网站是纯静态的（`next build` 的静态导出），照片转图纸在用户浏览器里运行，服务器只需要把文件发出去，不用装 Node 运行环境。

## 1. 在本机或 CI 上构建

```bash
corepack enable
pnpm install
pnpm build          # 产物在 apps/web/out/
```

## 2. 上传到服务器

```bash
rsync -az --delete apps/web/out/ user@你的服务器:/var/www/picobreads/
```

## 3. Nginx 配置

```nginx
server {
    listen 80;
    server_name 你的域名;
    root /var/www/picobreads;

    # 静态导出的页面是 /路径/index.html
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # 带 hash 的静态资源（JS、CSS、字体）可以长期缓存
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    error_page 404 /404.html;
}
```

HTTPS：`certbot --nginx -d 你的域名`（Let's Encrypt，免费，自动续期）。

## 以后更新

在服务器上执行一条命令（拉最新代码 → 构建 → 成功后才替换线上文件，构建失败不影响线上）：

```bash
~/picobreads/scripts/deploy.sh
```

## 自动部署（GitHub Actions，推荐国内服务器使用）

国内服务器经常连不上 GitHub。`.github/workflows/deploy-server.yml` 在 GitHub 上构建，再用 SSH 把网站传到服务器，服务器不需要访问 GitHub。每次推送到 main 自动部署，也可以在 GitHub 的 Actions 页手动运行「Deploy to server」。

一次性配置：

1. 服务器上生成一把只用于部署的密钥，并允许它登录：
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C github-deploy
   cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
   cat ~/.ssh/github_deploy
   ```
   最后一条输出的整段私钥（含 BEGIN / END 两行）就是下面的 `DEPLOY_SSH_KEY`。复制后可以删掉服务器上的私钥文件：`rm ~/.ssh/github_deploy`。
2. 让部署用户能写网站目录（不用 sudo）：
   ```bash
   sudo mkdir -p /var/www/picobreads /var/www/picobreads.staging && sudo chown -R ubuntu:ubuntu /var/www/picobreads /var/www/picobreads.staging
   ```
3. GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret，添加 `DEPLOY_HOST`（服务器 IP）、`DEPLOY_USER`（`ubuntu`）、`DEPLOY_SSH_KEY`（上面的私钥）。
4. 云服务器防火墙要放行 22 端口（SSH），默认一般已放行。

## 4. 国内访问要注意

- 网站本身已不依赖任何境外第三方服务（字体随网站一起部署，不走 Google Fonts），所以国内能打开、速度取决于服务器到国内的线路。新加坡到国内一般可用，晚高峰可能变慢；线路好坏看服务商（有 CN2 等优化线路的会好很多）。上线前在国内不同运营商（电信 / 联通 / 移动）各测一次。
- **ICP 备案**：服务器在境外不需要、也不能做备案。已在国内服务商备案的域名解析到境外服务器，备案的接入商可能在核查时认为「网站不在接入商服务器上」而注销备案。这个域名如果以后还要用在国内服务器（比如微信小程序的后端），先和备案接入商确认，或者另用一个域名指向新加坡服务器。
- 以后接 Shopify（登录、结账）的那部分页面在 Shopify 的服务器上，国内访问是否顺畅要另外实测。

## 后端 API（账号、草稿、分享链接）—— 一次性配置

网站页面仍是静态文件；登录注册、草稿同步、分享链接由一个小的 Node 服务提供（`apps/api`，数据存在 SQLite 文件里），
Nginx 把 `/api/` 转给它。GitHub Actions 每次部署会把打包好的 `server.js` 传到 `/opt/beadspark-api/` 并重启服务；
下面这些只需要在服务器上做一次。

1. **装 Node 22.13 以上**（用到 Node 自带的 SQLite）：
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs && node -v
   ```
   （国内连 NodeSource 慢的话，用腾讯云镜像：`https://mirrors.cloud.tencent.com/nodejs-release/` 下载 v22 的 linux-x64 包解压到 `/usr/local`，确保 `/usr/bin/node` 能用。）
2. **目录**：
   ```bash
   sudo mkdir -p /opt/beadspark-api /var/lib/beadspark /etc/beadspark
   sudo chown ubuntu:ubuntu /opt/beadspark-api /var/lib/beadspark
   ```
3. **配置文件（含密钥，只放在服务器上）**：把仓库里 `apps/api/.env.example` 的内容复制到 `/etc/beadspark/api.env`，填好后：
   ```bash
   sudo chown root:ubuntu /etc/beadspark/api.env && sudo chmod 640 /etc/beadspark/api.env
   ```
   - `SITE_URL`：网站地址，例如 `https://pd.scentby.cn`（还没域名时先填 `http://49.233.85.32`；只有 https 地址才能用第三方登录）。
   - 发验证码邮件：`SMTP_USER` 填发件的 QQ 邮箱地址，`SMTP_PASS` 填 QQ 邮箱「设置 → 账户 → POP3/SMTP 服务」生成的**授权码**（不是 QQ 密码）。换 Gmail：`SMTP_HOST=smtp.gmail.com`，`SMTP_PASS` 用 Google「应用专用密码」。
   - 第三方登录：每个平台填好两三项即可，没填的按钮会显示「即将开放」。回调地址见下表。
4. **systemd 服务**（仓库里 `deploy/beadspark-api.service`）：
   ```bash
   sudo cp deploy/beadspark-api.service /etc/systemd/system/   # 或把文件内容粘贴进去
   sudo systemctl daemon-reload && sudo systemctl enable --now beadspark-api
   sudo journalctl -u beadspark-api -n 20      # 看到 "BeadSpark API on http://127.0.0.1:8787 …" 就是启动成功
   ```
5. **让部署用户能重启服务**（GitHub Actions 每次部署后要重启 API）：
   ```bash
   echo 'ubuntu ALL=(root) NOPASSWD: /usr/bin/systemctl restart beadspark-api' | sudo tee /etc/sudoers.d/beadspark-api && sudo chmod 440 /etc/sudoers.d/beadspark-api
   ```
6. **Nginx**：把仓库里 `deploy/nginx-api.conf` 的 `location /api/ { … }` 加到网站的 `server { }` 里，然后 `sudo nginx -t && sudo systemctl reload nginx`。
7. 第一次可以在 GitHub 的 Actions 页手动运行一次「Deploy to server」，把 `server.js` 传上去。检查：`curl http://127.0.0.1:8787/api/health` 和 `curl http://你的域名/api/health` 都返回 `{"ok":true}`。
8. **备份**：数据库就是 `/var/lib/beadspark/beadspark.db` 一个文件，建议在腾讯云控制台给磁盘开定时快照，或每天 `sqlite3 … ".backup …"` 拷一份。

### 第三方登录的回调地址（在各平台后台填写）

把 `https://pd.scentby.cn` 换成你的正式域名（必须是 https）：

| 平台 | 在哪里创建 | 回调 / 重定向地址 | 填到 api.env |
|---|---|---|---|
| Google | Google Cloud Console → API 和服务 → 凭据 → OAuth 客户端 ID（Web 应用） | `https://pd.scentby.cn/api/auth/google/callback` | `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET` |
| 微信 | 微信开放平台 → 管理中心 → 网站应用（需企业认证，审核通过后才能用） | 授权回调域填 `pd.scentby.cn`（只填域名） | `WECHAT_APP_ID`、`WECHAT_APP_SECRET` |
| Apple | Apple Developer → Identifiers → Services IDs（开启 Sign in with Apple）+ Keys（Sign in with Apple 的 .p8 密钥） | Return URL：`https://pd.scentby.cn/api/auth/apple/callback`，Domain：`pd.scentby.cn` | `APPLE_CLIENT_ID`（Services ID）、`APPLE_TEAM_ID`、`APPLE_KEY_ID`、`APPLE_PRIVATE_KEY`（.p8 内容，换行写成 `\n`） |
| Facebook | Meta for Developers → 创建应用 → Facebook 登录 → 设置 | 有效 OAuth 跳转 URI：`https://pd.scentby.cn/api/auth/facebook/callback` | `FACEBOOK_APP_ID`、`FACEBOOK_APP_SECRET` |

改完 `api.env` 后 `sudo systemctl restart beadspark-api` 生效。
