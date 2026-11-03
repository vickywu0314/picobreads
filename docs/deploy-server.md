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
