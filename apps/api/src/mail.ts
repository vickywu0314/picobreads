import nodemailer from 'nodemailer'
import type { Config } from './config'

export interface Mailer {
  send(to: string, subject: string, text: string, html: string): Promise<void>
}

/** SMTP mailer (QQ Mail / Gmail …). Without SMTP settings it only logs, so local testing still works. */
export function smtpMailer(cfg: Config): Mailer {
  const { host, port, user, pass, fromName } = cfg.smtp
  if (!user || !pass) {
    return {
      async send(to, subject, text) {
        console.warn(`[mail] SMTP not configured, would send to ${to}: ${subject}\n${text}`)
      },
    }
  }
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  return {
    async send(to, subject, text, html) {
      const info = await transport.sendMail({ from: { name: fromName, address: user }, to, subject, text, html })
      // What the SMTP server said, e.g. "250 OK: queued as …" — for tracing mail that never arrives.
      console.log(`[mail] to ${to}: accepted=${info.accepted.length} rejected=${info.rejected.length} id=${info.messageId} response=${info.response}`)
    },
  }
}

const PURPOSE: Record<string, { zh: string; en: string }> = {
  register: { zh: '注册', en: 'sign-up' },
  reset: { zh: '重设密码', en: 'password reset' },
}

/** Verification code email, Chinese first then English. */
export function codeEmail(code: string, purpose: string) {
  const p = PURPOSE[purpose] ?? PURPOSE.register
  const subject = `BeadSpark 验证码 ${code}（${p.zh}）· Your ${p.en} code`
  const text =
    `你的 BeadSpark ${p.zh}验证码是：${code}\n10 分钟内有效。如果不是你本人操作，请忽略这封邮件。\n\n` +
    `Your BeadSpark ${p.en} code is ${code}. It expires in 10 minutes. If you didn't ask for it, ignore this email.`
  const html = `<div style="font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#4a2620">
<p style="font-size:20px;font-weight:800;margin:0 0 16px">Bead<span style="color:#d93d72">Spark</span></p>
<p>你的${p.zh}验证码是 / Your ${p.en} code:</p>
<p style="font-size:32px;font-weight:800;letter-spacing:6px;margin:12px 0;color:#d93d72">${code}</p>
<p style="color:#7d5f58;font-size:13px">10 分钟内有效。如果不是你本人操作，请忽略这封邮件。<br>Expires in 10 minutes. If you didn't ask for it, ignore this email.</p>
</div>`
  return { subject, text, html }
}
