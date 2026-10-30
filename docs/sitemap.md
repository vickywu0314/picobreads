# 网站结构（Cordelia Morrow）

> 网址按原型实现；「Shopify」列说明正式版由谁负责。

```
Home 首页                                  /
Beads 拼豆                                 /beads
  ├─ 拼豆介绍与定制入口（三条路径 + 尺寸对照）  /beads
  ├─ 图案库                                /beads/patterns?theme=&size=&difficulty=
  │    └─ 图案详情 → 开始定制               /beads/patterns/detail?id=
  ├─ 上传自己的照片 → 开始定制              /create
  └─ 社区作品                              /beads/community
       ├─ 作品详情 → 做同款（作者授权时）    /beads/community/detail?id=
       └─ 申请精选（一期：发邮件给我们）     /beads/community/share
定制流程（6 步）
  ① 上传 ② 裁剪调整                         /create
  ③ 选择规格                               /create/settings
  ④ 查看预览（可保存到我的作品）             /create/preview
  ⑤ 选择购买形式（免费电子图纸 / 材料包 / 成品） /create/product
  ⑥ 确认：电子图纸填邮箱直接发送；材料包、成品加入购物袋  /create/confirm
Storybooks 定制绘本（Coming Soon + 上线通知）  /storybooks
账户
  ├─ 登录（邮箱验证码，无密码）            /account/login
  ├─ 我的定制作品                           /account?tab=designs
  ├─ 我的订单                               /account?tab=orders
  └─ 地址与账户设置                         /account?tab=settings
购物袋 → 结账 → 下单成功                     /cart → Shopify Checkout → /checkout/success
工具页：在线拼 /bead · 灯箱 /lightbox · 我的图纸 /pattern
页脚：About /about · FAQ /faq · Contact /contact · Shipping & Returns /shipping-returns · Privacy /privacy · Terms /terms
内部（上线前隐藏）：熨烫实验室 /lab · 后台 /admin
```

## 与 Shopify 的分工

| 部分 | 正式版 |
|---|---|
| 购物袋、结账、支付、税费、订单、发货通知 | Shopify（Storefront API 创建购物车，line item attributes 带 `pattern_id`、产品形式、档位、豆子尺寸、色卡；跳转 Shopify Checkout） |
| 登录（邮箱验证码，无密码）、我的订单、地址 | Shopify 新版客户账户（Customer Account API） |
| 产品与价格（材料包 / 成品 × 三档） | Shopify 商品与变体 |
| 免费电子图纸 | 不经过 Shopify 结账：收集邮箱后由我们的后端生成 PDF 并发邮件（邮箱可同步到 Shopify 客户 / 邮件营销） |
| 图案库内容 | Shopify metaobject，图纸由引擎生成 |
| 图纸生成、在线拼、灯箱、预览 | 自研（浏览器内） |
| 我的定制作品（保存 / 再编辑 / 再次购买） | 自研后端，关联 Shopify 客户 ID |
| 社区作品 | 一期写死固定案例；以后需要投稿审核时再做后端 |
| 绘本上线通知 | 收集邮箱（可同步到邮件营销服务） |
| 语言 | 网站 en-US / zh-CN；Shopify 结账页语言需在 Shopify 后台开启对应语言 |
