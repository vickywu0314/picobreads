# 当前进度（交接用）

> 新开会话时：先读根目录 `CLAUDE.md`（产品说明），再读本文件和 `docs/versions.md`（v1.1 的页面与规则），就能接着做。
> 更新于 2026-11-03。

## 版本

- **v1.0**（`/`）：Cordelia Morrow 网站结构，冻结不动。
- **v1.1 Pipixel**（`/v1-1/`）：所有新开发都在这里。页面清单、图纸规则见 `docs/versions.md`。
- 两个版本共用图纸引擎 `packages/pattern-engine`、在线拼 / 灯箱 / 实验室组件（`components/bead/BeadEditor.tsx`、`components/LightboxView.tsx`、`components/LabView.tsx`，用 `v11` 参数切换样式和链接）。

## v1.1 已定的规则（摘要，详见 versions.md）

- 豆子：MARD 264 色全色（含特殊系列）；用户选迷你豆 2.6 mm（52×52 钉分区）或标准豆 5 mm（29×29 钉分区）。
- 尺寸：1 / 4 / 9 个分区三档，按图片细节推荐「能 1 块做清楚就 1 块」（`recommendBoards` + `gridLoss` + `chooseBoards`）。显示的底板数按标配 27×27 cm 底板算（`V11_BOARD_CM`）。
- 默认去掉纯色背景、自动裁掉空白边。
- 流程 4 步：上传、裁剪、定制（三张效果图 + 大图预览 + 参数）、购买形式。
- 免费图纸：登录后下载 zip（总览、材料清单、每个分区一张、每格印色号）。测试期不发邮件。
- 材料包 / 成品：标「即将开放」，不显示价格，下单按钮置灰。确认页、购物袋、结账页已去掉（旧地址跳转）。
- 在线拼：v1.1 有存草稿；手机端单独布局（大图纸 + 底部色块条 +「更多」）。
- 「我的工作台」：草稿列表；右上角用户菜单（我的工作台 / 退出）。
- v1.1 不出现「原型」字样。

## 登录与数据（重要：都还是假的）

- 登录是测试版：任意邮箱 + 任意 6 位数字。登录状态、草稿都只存在浏览器本地（zustand persist，key `picobreads-v1`），不跨设备。
- 「登录后才能下载」只是界面拦截，没有服务端校验。
- 还没有任何后端。

## 部署

| 位置 | 地址 | 说明 |
|---|---|---|
| Vercel | 项目根目录 `apps/web` | 推送 main 自动部署（Vercel 自己的 GitHub 集成） |
| 北京腾讯云轻量服务器 | `http://49.233.85.32/v1-1/` | Ubuntu 26.04，Nginx 站点 `/etc/nginx/sites-available/picobreads`（默认站点，`server_name _`），网站目录 `/var/www/picobreads`。推送 main 由 GitHub Actions（`.github/workflows/deploy-server.yml`）在 GitHub 上构建后 SSH 上传；仓库 Secrets：`DEPLOY_HOST` `DEPLOY_USER` `DEPLOY_SSH_KEY`。服务器连 GitHub 不稳定，不要依赖服务器上 `git pull` |
| 新加坡服务器 | — | 上面有 tuoyuan.ai 等其他网站。pd.scentby.cn 站点已停用（配置还在 sites-available），不要动其他站点 |

部署细节、Nginx 配置、手动部署脚本：`docs/deploy-server.md`、`scripts/deploy.sh`。

## 进行中 / 待用户提供

1. **腾讯云接入备案**：域名 `scentby.cn`（阿里云已备案），正在腾讯云办接入备案。通过后：`pd.scentby.cn` 的 A 记录指向 `49.233.85.32`，Nginx 的 `server_name` 改成域名，`certbot --nginx -d pd.scentby.cn` 配 HTTPS。
2. **国内版 / 国外版**：用户准备分两个版本上。建议先做国内版（待用户确认），顺序：H5 网站上线 → 手机号 + 短信验证码登录 + 轻量后端（用户、草稿）→ 微信小程序（复用图纸引擎）→ 小程序内下单 + 微信支付（需企业或个体户主体、商户号、订单发货信息上传）。国外版之后做：北美站 + Shopify 登录 / 结账（Shopify 在国内不稳定，只用于国外版）。
3. **需要用户确认 / 提供**：是否先做国内版；营业执照（公司或个体户）；价格；Pipixel 品牌名；首页设计稿原始 PNG；其他页面设计稿；四种熨烫的实拍图（可选）；标准豆 5 mm 的标配底板尺寸（现在按 27 cm ≈ 54 钉显示，58×58 会显示成 4 块，待定）。
4. **已知小问题**：熨烫实验室（`/v1-1/lab/`）里的品牌选择还是 v1.0 的四个品牌，没改成 MARD 264。

## 开发约定（摘自之前的协作）

- 直接推 `main`；不开 PR，除非用户要求。
- 中文回复；产品决策先问用户，技术细节自己判断。
- 改完跑 `pnpm test`、`pnpm typecheck`、`pnpm build`，并用 Playwright（`require('playwright')`，Chromium 已预装）在手机 / 平板尺寸下实际点一遍。
- 不提交任何密钥（服务器私钥、部署私钥只放在用户电脑和 GitHub Secrets）。
