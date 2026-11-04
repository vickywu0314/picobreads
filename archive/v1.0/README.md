# v1.0 归档（Cordelia Morrow）

2026-11-04 起 v1.1（Pipixel）搬到网站根路径，v1.0 不再构建、不再部署，代码挪到这里保存。

- `app/`：v1.0 的全部页面（原 `apps/web/src/app/` 下除 v1.1 以外的页面），以及当时的根 `layout.tsx`。
- `src/`：只有 v1.0 用到的组件和库（`components/`、`lib/`、`mock/`），以及原来的版本切换条 `PrototypeBanner.tsx`、`lib/flow.ts`。
- 和 v1.1 共用的代码（图纸引擎、在线拼 / 灯箱 / 熨烫实验室组件、`config/`、`i18n/` 等）仍在 `apps/web/src/`，里面 `v11={false}` 的 v1.0 分支暂时保留。
- 完整的 v1.0 版本也可以直接看提交 `a2f8ca3`（v1.0 定稿）或 `043a1e9`（归档前最后一次）。

这个目录不参与构建（不在 `apps/web` 里），想恢复时把文件挪回 `apps/web/src/` 对应位置即可。
