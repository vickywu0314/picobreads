// SEO: site address, keywords and descriptions used by metadata, robots.txt, sitemap.xml and llms.txt.

/** Public address of the site (no trailing slash). Set NEXT_PUBLIC_SITE_URL when deploying. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pd.scentby.cn').replace(/\/+$/, '')

export const SEO = {
  name: 'Pipixel',
  title: 'Pipixel 拼豆图纸生成器 · 照片一键变拼豆图纸 | Photo to Bead Pattern Maker',
  description:
    '免费在线拼豆图纸生成器：上传照片，一键生成带 MARD 色号的拼豆图纸和用豆清单，迷你豆 / 标准豆、多种尺寸可选，还能在线拼。Free online fuse bead (Perler / Hama / Artkal) pattern maker: turn a photo into a bead pattern with color codes and a bead list.',
  keywords: [
    // 中文
    '拼豆',
    '拼豆图纸',
    '拼豆图纸生成器',
    '拼豆图纸在线生成',
    '免费拼豆图纸',
    '照片转拼豆',
    '照片生成拼豆图纸',
    '拼豆图案',
    '拼豆色号',
    'MARD 拼豆',
    'MARD 色卡',
    '迷你豆',
    '2.6mm 拼豆',
    '5mm 拼豆',
    '拼豆底板',
    '在线拼豆',
    '像素画',
    '像素风',
    '熨烫拼豆',
    '宠物拼豆',
    'DIY 拼豆',
    '定制拼豆',
    // English
    'bead pattern maker',
    'fuse bead pattern',
    'perler bead pattern generator',
    'photo to perler beads',
    'photo to bead pattern',
    'hama beads pattern',
    'artkal beads pattern',
    'mini beads 2.6mm',
    'pixel art beads',
    'bead color chart',
    'custom bead pattern',
  ],
}

/** Crawlers explicitly welcome (search engines and AI assistants / answer engines). */
export const ALLOWED_BOTS = [
  // Search engines
  'Googlebot',
  'Bingbot',
  'Baiduspider',
  'Sogou web spider',
  '360Spider',
  'YisouSpider',
  'Bytespider',
  'YandexBot',
  'DuckDuckBot',
  'Applebot',
  // AI assistants, AI search and training crawlers
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
  'Amazonbot',
  'cohere-ai',
  'MistralAI-User',
  'DeepSeekBot',
  'ChatGLM-Spider',
  'Kimi-Bot',
]

/** Public pages listed in sitemap.xml (paths with the trailing slash the static export uses). */
export const SITEMAP_PATHS = [
  { path: '/', priority: 1 },
  { path: '/create/', priority: 0.9 },
  { path: '/lab/', priority: 0.4 },
]

/** Pages that are personal or only make sense mid-flow: not indexed. */
export const NOINDEX_PATHS = ['/login/', '/workbench/', '/bead/', '/lightbox/', '/create/settings/', '/create/product/']
