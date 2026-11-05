import { serve } from '@hono/node-server'
import { createApp } from './app'
import { loadConfig } from './config'
import { openDb } from './db'
import { smtpMailer } from './mail'
import { PROVIDERS, providers } from './oauth'

// BeadSpark API. Runs behind Nginx on the same domain as the site: https://<site>/api/...
const cfg = loadConfig()
const db = openDb(cfg.dbPath)
const app = createApp({ cfg, db, mailer: smtpMailer(cfg) })

// Housekeeping once an hour: expired sessions, codes and rate-limit records.
setInterval(() => {
  const now = Date.now()
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now)
  db.prepare('DELETE FROM email_codes WHERE created_at < ?').run(now - 2 * 86400_000)
  db.prepare('DELETE FROM login_attempts WHERE at < ?').run(now - 86400_000)
  db.prepare('DELETE FROM oauth_states WHERE expires_at < ?').run(now)
}, 3600_000).unref()

serve({ fetch: app.fetch, port: cfg.port, hostname: '127.0.0.1' }, (info) => {
  const on = PROVIDERS.filter((p) => providers(cfg)[p].configured)
  console.log(`BeadSpark API on http://127.0.0.1:${info.port} · site ${cfg.siteUrl} · mail ${cfg.smtp.user ? cfg.smtp.host : 'NOT CONFIGURED'} · sign-in: email${on.length ? `, ${on.join(', ')}` : ''}`)
})
