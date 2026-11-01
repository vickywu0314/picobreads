import type { v11En } from './v11-en'

export const v11Zh: typeof v11En = {
  nav: { home: '首页', plaza: '拼豆广场', community: '拼豆社区', signIn: '登录', signOut: '退出登录', language: '语言', bag: '购物袋', menu: '菜单' },
  comingSoon: '即将开放',
  hero: {
    tag: '免费在线拼豆图纸生成器',
    title1: '把照片',
    title2pre: '拼成',
    title2: '一颗颗豆',
    body: '毛孩子、家人、旅行里的小瞬间，一键变成带色号的拼豆图纸。',
    cta: '上传照片，开始拼',
    check1: '自动统计色号',
    check2: '多种尺寸可选',
    photoToPattern: ['你的照片', '你的图纸'],
    list: (colors: number, beads: number) => `用豆清单 · ${colors} 色 · ${beads.toLocaleString('zh-CN')} 颗`,
    beads: (n: number) => `${n.toLocaleString('zh-CN')}颗`,
    more: (n: number) => `还有 ${n} 色，查看完整清单`,
    colors: (n: number) => `${n} 色`,
  },
  features: [
    { title: '先看效果', body: '拼之前就能预览' },
    { title: '尺寸心里有数', body: '对比成品大小' },
    { title: '色号一键统计', body: '备料不踩坑' },
  ],
  picks: {
    title1: '没灵感？',
    title2: '挑一个开拼',
    body: '点开就能看到完整图纸和色号清单',
    more: '去拼豆广场',
    names: { 'tabby-cat': '橘猫团团', caishen: '招财进宝', coffee: '早安咖啡' },
    stats: (w: number, h: number, colors: number, beads: number) => `${w}×${h} · ${colors} 色 · ${beads.toLocaleString('zh-CN')} 颗`,
  },
  steps: {
    title1: '三步，',
    title2: '从照片到成品',
    items: [
      { title: '选一张照片', body: '主体清楚、背景简单，效果最好。' },
      { title: '调成你要的尺寸', body: '' },
      { title: '按清单开拼', body: '逐色号备料，一颗不多一颗不少。' },
    ],
  },
  banner: { title: '下一个作品，就在你的相册里', body: '免费使用，无需下载', cta: '立即生成图纸' },
  footer: { rights: (y: number, name: string) => `© ${y} ${name}. All rights reserved.` },
  sample: '示例',
}
