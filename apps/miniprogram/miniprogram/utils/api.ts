import { API_BASE } from './config'

export interface User {
  id: string
  email: string | null
  name: string
  avatarUrl?: string | null
  providers?: string[]
}

const TOKEN_KEY = 'bs-token'
const USER_KEY = 'bs-user'

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code)
  }
}

export const getToken = (): string => wx.getStorageSync(TOKEN_KEY) || ''
export const getUser = (): User | null => wx.getStorageSync(USER_KEY) || null

function saveSession(token: string, user: User) {
  wx.setStorageSync(TOKEN_KEY, token)
  wx.setStorageSync(USER_KEY, user)
}

export function clearSession() {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(USER_KEY)
}

/** Call the BeadSpark API (JSON in and out). Rejects with ApiError(code). */
export function api<T = any>(path: string, opts: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; data?: unknown } = {}): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const token = getToken()
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/api${path}`,
      method: opts.method ?? (opts.data !== undefined ? 'POST' : 'GET'),
      data: opts.data as WechatMiniprogram.IAnyObject,
      header: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      timeout: 20000,
      success: (res) => {
        const body = (res.data ?? {}) as Record<string, unknown>
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(body as T)
        else {
          if (res.statusCode === 401) clearSession()
          reject(new ApiError(typeof body.error === 'string' ? body.error : 'server_error', res.statusCode))
        }
      },
      fail: () => reject(new ApiError('network', 0)),
    })
  })
}

/** Sign in with WeChat (wx.login → our server). Returns the user. */
export function login(): Promise<User> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async ({ code }) => {
        try {
          const r = await api<{ token: string; user: User }>('/auth/wxmp/login', { data: { code } })
          saveSession(r.token, r.user)
          resolve(r.user)
        } catch (e) {
          reject(e)
        }
      },
      fail: () => reject(new ApiError('wx_login_failed', 0)),
    })
  })
}

/** Signed-in user, logging in first if needed (shows a loading toast). */
export async function ensureLogin(): Promise<User> {
  const u = getUser()
  if (u && getToken()) return u
  wx.showLoading({ title: '登录中…', mask: true })
  try {
    return await login()
  } finally {
    wx.hideLoading()
  }
}

/** Update the nickname / avatar shown on shares. */
export async function updateProfile(name: string): Promise<User> {
  const r = await api<{ user: User }>('/auth/profile', { data: { name } })
  wx.setStorageSync(USER_KEY, r.user)
  return r.user
}

const MESSAGES: Record<string, string> = {
  network: '连不上服务器（开发版要先打开调试）',
  wx_login_failed: '微信登录失败，请再试一次',
  provider_not_configured: '服务器还没配置小程序登录',
  not_signed_in: '请先登录',
  too_many_shares: '今天分享太多次了，明天再试',
  too_many_designs: '草稿太多了，先删掉一些',
  risky_text: '昵称里有不合适的内容，换一个吧',
  not_on_sale: '这个还没开放购买',
  bad_address: '收货地址不完整，请重新选择',
  pay_failed: '没能发起支付，请稍后再试',
  no_openid: '请重新登录后再试',
}
export const errorText = (e: unknown) => MESSAGES[e instanceof ApiError ? e.code : ''] ?? '出错了，请稍后再试'
