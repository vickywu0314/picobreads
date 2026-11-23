# BeadSpark 当前进度（交接用）

> **新开会话先读这一份**，再按需要看 `docs/versions.md`（网站页面和图纸规则）、`apps/miniprogram/README.md`（小程序）、`docs/deploy-server.md`（服务器）。
> 根目录 `CLAUDE.md` 是最早的产品说明（北美独立站 + Shopify 的设想），**很多地方已经和现状不一样，以本文件为准**。
> 更新于 2026-11-23。

## 一句话现状

BeadSpark（原名 Pipixel / Cordelia Morrow）：上传照片 → 生成拼豆图纸 → 在线拼 → 分享 / 买材料包或成品。
现在有三块：**网站**、**后端 API**、**微信小程序**。小程序功能写完了，正在走上线流程：**等小程序备案 + 体验版测试，然后提交审核**。

| | 位置 | 状态 |
|---|---|---|
| 网站 | `apps/web`（Next.js 静态导出） | 已上线 https://beadspark.top |
| 后端 API | `apps/api`（Node + Hono + SQLite） | 已上线，Nginx 转发 `/api/` |
| 微信小程序 | `apps/miniprogram`（原生 + TypeScript） | 开发版真机测过支付；**体验版还没测，未提审** |
| 图纸引擎 | `packages/pattern-engine` | 三端共用 |
| v1.0 旧站 | `archive/v1.0/` | 归档，不构建 |

## 接下来要做的（按顺序）

**用户在做 / 要做（小程序后台 mp.weixin.qq.com）**
- [ ] **小程序备案**（未备案，耗时最长，没它不能发布）
- [ ] 基础信息：名称、头像（`apps/miniprogram/avatar.png`）、介绍（文案已给过）
- [ ] 服务类目：主营选「商家自营」下贴近拼豆 / 手工 / 玩具的子类目，再加一个「工具」类
- [x] 服务器域名：request / downloadFile 合法域名 = `https://beadspark.top`（用户说已配）
- [ ] 用户隐私保护指引（提交审核流程里填）：选中的照片、相册仅写入、收货地址、微信昵称
- [ ] 绑定客服微信号（订单页「联系客服」按钮才有人接）
- [ ] 可选：注册快递100 企业版，`set-shop.sh` 里填 customer / key，订单页才有物流时间线

**上传体验版并测试（只能用户在微信开发者工具里点 Upload，Claude 做不了）**
1. `git pull` → 开发者工具「编译」→ Upload（版本 1.0.0）→ 后台「版本管理」选为体验版 → 手机扫码，**不开调试模式**
2. 测：自动登录 → 上传照片 → 定制 → 在线拼 → 分享 / 保存海报 → 下单支付 → 后台发货 → 退款 → 改昵称
3. 备案通过后提交审核；被打回就把驳回原因发给 Claude

## 哪些验证过，哪些没有（重要）

- ✅ 测试：图纸引擎 47 个、后端 29 个、小程序 4 个，全部通过（`pnpm test`）
- ✅ 真机（开发版，当时连 IP + 调试模式）：登录、下单、**微信支付真实扣款成功**、订单显示
- ✅ 本地浏览器跑过：网站登录注册 / 分享、订单后台（列表、拣货清单、标记发货）
- ⚠️ **没验证过**：
  - 小程序走 `https://beadspark.top`（改成域名后还没人在手机上跑过，体验版是第一次）
  - 后台「全额退款」（真实微信退款接口）
  - 发货通知 `upload_shipping_info`、物流查询（快递100）、昵称内容安全检测 —— 参数按记忆写的，只用模拟数据测过，真实环境可能要调
  - 小程序「保存图纸到相册」「保存分享海报」的真机效果
- Claude 的运行环境**访问不了服务器**（49.233.85.32 / beadspark.top 被网络策略挡住），线上情况只能靠用户反馈和 GitHub Actions 日志

## 服务器和部署

- 北京腾讯云轻量 `49.233.85.32`，Ubuntu，用户 `ubuntu`，用户本机用 `beijing.pem` 登录（`ssh -i beijing.pem ubuntu@49.233.85.32`）
- 域名 **beadspark.top**（已备案），https 证书是 certbot 的 Let's Encrypt，自动续期。配了 https 后 **用 IP 访问网站会 404**，都用域名
- 防火墙（轻量服务器控制台 → 实例 → 防火墙）：22、80、443 已放行
- 推送 `main` → GitHub Actions（`.github/workflows/deploy-server.yml`）构建 + 测试 → SSH 上传：
  网站到 `/var/www/picobreads`，后端 `server.js` 到 `/opt/beadspark-api` 并重启，`deploy/` 脚本到 `~/beadspark-deploy/`。
  SSH 偶尔被断开，已加自动重试。**推送后去 Actions 页确认是绿色对勾再让用户测**
- 后端：systemd 服务 `beadspark-api`，监听 127.0.0.1:8787，配置和所有密钥在 `/etc/beadspark/api.env`（**密钥只在服务器，不进仓库**），数据库 `/var/lib/beadspark/beadspark.db`（还没设备份，建议开磁盘快照）
- 看日志：`sudo journalctl -u beadspark-api -n 50 --no-pager`
- 服务器上的一键脚本（都在 `~/beadspark-deploy/`，`sudo bash` 运行，可重复跑，回车 = 不改）：
  - `setup-api.sh`：装 Node、建服务、Nginx `/api/`、网站地址、发信邮箱
  - `setup-https.sh`：域名 + https 证书
  - `set-wxmp.sh`：小程序 AppID / AppSecret
  - `set-shop.sh`：微信支付商户资料、价格、订单通知邮箱、快递100、生成后台口令（跑完会显示后台网址和口令）
- Vercel 上还有一份网站（没有后端，登录 / 分享不可用），可以不管

## 已经配好的（服务器 `api.env` 里）

- 网站地址 `https://beadspark.top`；发验证码邮件用 QQ 邮箱 `37009036@qq.com`（发到 Gmail 会进垃圾箱；想改善要用自己域名发信，如腾讯云邮件推送）
- 小程序 AppID `wxad095cfa10de6ecd` + AppSecret
- 微信支付：商户号、APIv3 密钥、证书序列号、私钥 `/etc/beadspark/apiclient_key.pem`、通知地址 `https://beadspark.top/api/pay/wechat/notify`
- 价格（元，包邮）：材料包 80 / 180 / 280，成品 100 / 230 / 350。三档按图纸大小：小 = 1 个分区（迷你豆 52×52 或标准豆 29×29 以内），中 = 2～4 个分区，大 = 更多
- 订单后台：`https://beadspark.top/admin/`，口令 = `ADMIN_TOKEN`（重跑 `set-shop.sh` 会显示）
- 没配：谷歌 / 微信网站应用 / Apple / Facebook 登录（代码写好了，各平台建应用后把 ID、密钥填进 `api.env` 即可，回调地址表在 `docs/deploy-server.md`）；快递100

## 微信小程序（`apps/miniprogram`，详见该目录 README）

流程：首页上传照片（选比例裁剪）→ **定制**（迷你豆 / 标准豆、去背景、裁空白边；四张效果图：1 / 4 / 9 块板 + 像素风，自动推荐）→ 下一步 → **购买形式**（免费图纸 / 材料包 / 成品）→ 在线拼 → 拼完页（买成品 → 分享 → 先不了）。

- 页面：`index` 首页、`create` 定制、`product` 购买形式、`bead` 在线拼、`done` 拼完、`order` 订单详情、`mine` 我的、`share` 分享页
- 登录：打开即静默微信登录；和网站同一套账号（unionid 互通需两边绑同一开放平台）
- 在线拼：立体钉板；选颜色后点 / 划放豆（靠近格子中心才放），没选颜色时拖动 = 移动画布，工具条「放豆 | 移动」「－ ＋ 全图」；撤销上一步；放过豆自动存到账号
- 我的：订单；作品分「拼好的 / 拼到一半的」，可继续拼、买材料包、买成品、分享、删除
- 购买：选形式 → 微信地址簿选地址 → 微信支付 → 订单页；未付款可继续支付 / 取消（110 分钟自动取消）；发货后显示快递公司、运单号、物流时间线（配了快递100 才有）
- 分享：发好友（卡片）、朋友圈（右上角菜单）、保存海报（带小程序码）
- 后端地址 `API_BASE = https://beadspark.top`（开发版也用它）

**踩过的坑（改小程序前先看）**
- 小程序运行的是 `.js`：改了 `miniprogram/` 下的 `.ts` 或图纸引擎后，要跑 `pnpm --filter miniprogram build` 并把生成的 `.js` 一起提交（不依赖开发者工具的 TS 编译）
- 开发者工具会自己改 `project.config.json`，用户 `git pull` 前要先 `git checkout -- apps/miniprogram/project.config.json`
- **画布（canvas）会盖住叠在上面的元素，页面返回后还会错位**：所以静态图一律用 `utils/png.ts` 生成 PNG 给 `<image>` 显示；只有在线拼的钉板是 canvas，按钮都放在画布外面；保存图纸 / 海报用的隐藏 canvas 只在生成时 `wx:if` 出来
- 查节点用 `utils/draw.ts` 的 `queryNode`（`wx.createSelectorQuery().in(page)` 在用户的基础库上会被忽略）；重画用 `setTimeout`，不用 `canvas.requestAnimationFrame`
- 原生 `<button>` 有固定宽度和 margin，样式里已重置；`wx.cropImage` 在模拟器不可用，失败时改为按比例居中裁
- 用户看不到 Claude 这边的运行结果，也没法让 Claude 跑小程序：每次改完说明「没在开发者工具里跑过」，让用户发 Console 截图

## 网站（`apps/web`，详见 `docs/versions.md`）

- 页面：`/` 首页、`/create/` 上传裁剪、`/create/settings/` 定制、`/create/product/` 购买形式（材料包 / 成品蒙灰「即将开放」，**网站上不能下单，购买只在小程序**）、`/bead/` 在线拼、`/lightbox/`、`/lab/`、`/login/`、`/workbench/`、`/s/?id=` 分享页、`/admin/` 订单后台；`/v1-1/...` 旧地址自动跳转
- 登录：邮箱 + 密码（邮箱验证码注册 / 找回）；第三方登录按钮在，未配置显示灰色
- 风格：暖白底、粉色大卡片、细棕色描边、Nunito 圆体；logo 是粉底白拼豆 + 黄色星光
- SEO：关键词、robots.txt（允许搜索引擎和 AI 爬虫）、sitemap.xml、llms.txt、ai.txt 都有；还没到百度 / Google / Bing 提交 sitemap

## 后端接口一览（`apps/api/src/app.ts`）

- 账号：`/api/auth/email/*`（发码、注册、登录、重设）、`/api/auth/me`、`/logout`、`/profile`（昵称过微信内容检测）、`/api/auth/:provider/start|callback`、`/api/auth/wxmp/login`
- 草稿 `/api/designs`，分享 `/api/shares`，小程序码 `/api/wxmp/qrcode/:id`
- 商店：`/api/shop`（开卖情况 + 价格）、`/api/orders`（下单、列表、详情、`/pay`、`/cancel`、`/tracking`）、`/api/pay/wechat/notify`
- 订单后台：`/api/admin/orders`（列表、详情、`/ship`、`/refund`），请求头 `x-admin-token`
- 会话：网站用 Cookie，小程序用 `Authorization: Bearer`

## 还没做 / 以后可以做

- 部分退款；订单后台的更多功能（搜索、导出）
- 小程序：图片内容安全检测（现在只检昵称文字，审核若要求再加）、分区图纸下载、灯箱模式、熨烫效果、拼豆笔 / 镊子动画；大图在旧手机上生成要几秒
- 网站上购买（要接微信 H5 / Native 支付或别的支付方式）
- 第三方登录接通；发信换成自己域名；数据库备份
- 效果图现在是纯色方格，没有「熨烫后」的圆角和豆孔质感（小程序）

## 和用户协作的约定

- 中文回复，说人话：用户不是程序员，命令要给完整的、能直接复制的，一条一个代码块
- 直接推 `main`，不开 PR；提交说明用中文
- 产品决策和价格先问用户，不要编；密钥不进仓库、不让用户发在聊天里（用户的账号不是完全私人的）
- 每次改完都要说清楚：测了什么、没测什么
