# 色卡数据（Palettes）

> TODO：以下颜色值是**社区实物取色的近似值，不是厂商官方色值**。上线前必须用实际供应商的豆子实测校对，并补上单颗重量（`weightG`）。

| 文件 | 品牌 / 系列 | 色数 | 说明 | 许可 |
|---|---|---|---|---|
| `perler.json` | Perler Midi 5mm | 103 | 北美零售最主流，品质稳定，**默认 / 推荐** | MIT（maxcleme/beadcolors） |
| `artkal-s.json` | Artkal S 系列 5mm | 199 | 色数最全，玩家与图纸网站常用；另有 2.6mm C 系列 | MIT（maxcleme/beadcolors） |
| `hama.json` | Hama Midi 5mm | 92 | 丹麦老牌，欧洲主流，品质口碑好 | MIT（maxcleme/beadcolors） |
| `mard-221.json` | MARD 5mm 221 色 | 221 | 国内拼豆 App / 供应链通用标准 | CC BY 4.0（MakeBead） |
| `mard-264.json` | MARD 264 色盒 | 264 | **v1.1 固定使用**。221 色 + 43 个 P/Q/R/T/Y 系列特殊色；色号按 MARD 264 色盒清单（craft-color-codes `data/sets/mard-kits.json`），颜色值来自 craft-color-codes `mard-291`。特殊系列没有厂商编号色卡，为三方数据比对值 | CC BY 4.0（MakeBead） |

- `specialty` 字段标记夜光 / 闪粉 / 荧光 / 珠光 / 透明等特殊豆，自动生成图纸时默认不使用。
- 色号与产品名归各厂商所有；本项目仅用于颜色匹配参考。

## 来源与署名

Color data: craft-color-codes by MakeBead (https://makebead.com)，npm 包 `craft-color-codes@1.0.0`。
数据许可：CC BY 4.0；其中 Perler / Artkal / Hama 的颜色值来自 maxcleme/beadcolors，沿用其 MIT 许可：

```
MIT License

Copyright (c) 2020 maxcleme

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
