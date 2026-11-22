require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = Number(process.env.PORT || 3000);
const INBOX = 'info@quadrafroynsolutions.in';
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
let transport;
function mailer() {
  if (transport) return transport;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new Error('Email delivery is not configured yet. Add SMTP settings to the .env file.');
  transport = nodemailer.createTransport({
    host, port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user, pass }
  });
  return transport;
}
const labels = {
  contact: 'Website contact enquiry',
  quote: 'New project quote request',
  career_application: 'New careers application'
};
const limits = new Map();
app.post('/api/submit', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (limits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (recent.length >= 8) return res.status(429).json({ ok: false, message: 'Too many submissions. Please wait a few minutes.' });
  const type = String(req.body && req.body.type || '');
  const fields = req.body && req.body.fields;
  if (!labels[type] || !fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return res.status(400).json({ ok: false, message: 'Invalid form submission.' });
  }
  const clean = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== 'string') continue;
    clean[String(key).slice(0, 60)] = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, 5000);
  }
  const name = (clean.name || '').trim();
  const email = (clean.email || '').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'Please provide a valid name and email address.' });
  }
  if (type === 'quote' && !(clean.message || '').trim()) return res.status(400).json({ ok: false, message: 'Please describe your project briefly.' });
  if (type === 'career_application' && (!(clean.phone || '').trim() || !(clean.education || '').trim() || !(clean.message || '').trim())) {
    return res.status(400).json({ ok: false, message: 'Please complete all required application fields.' });
  }
  const subjectDetail = type === 'career_application' ? (clean.role || clean.role_display || 'General application') : (clean.topic || clean.service || 'General enquiry');
  const subject = `${labels[type]} — ${subjectDetail} — ${name}`.slice(0, 180);
  const body = [
    'QuadraFroyn Solutions website submission',
    `Form type: ${labels[type]}`,
    `Received: ${new Date().toISOString()}`,
    '',
    ...Object.entries(clean).map(([key, value]) => `${key.replace(/[_-]/g, ' ')}: ${value || '(not provided)'}`),
    '',
    'Reply directly to the sender using the Reply-To address above.'
  ].join('\n');
  try {
    recent.push(now); limits.set(ip, recent);
    await mailer().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: INBOX,
      replyTo: email,
      subject,
      text: body
    });
    return res.json({ ok: true, message: 'Submission delivered.' });
  } catch (error) {
    console.error('Email submission failed:', error.message);
    return res.status(503).json({ ok: false, message: error.message.includes('not configured') ? error.message : 'Email delivery failed. Please try again shortly.' });
  }
});
app.use(express.static(path.join(__dirname), { extensions: ['html'], maxAge: '1h' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(PORT, () => console.log(`QuadraFroyn site running at http://localhost:${PORT}`));
