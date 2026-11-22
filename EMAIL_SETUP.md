# Email delivery setup (required before going live)

The website now sends Contact Us, Get a Quote, and Careers application submissions to **info@quadrafroynsolutions.in** through a server-side SMTP endpoint. The browser never receives the mailbox password.

## 1. Configure SMTP

1. Install Node.js 18 or newer on the hosting computer/server.
2. Copy `.env.example` to a new file named `.env`.
3. For a Google Workspace/Gmail mailbox, enable 2-Step Verification on `info@quadrafroynsolutions.in`, create an App Password for this website, and place that 16-character app password in `SMTP_PASS`. Do not use the normal account password.
4. Confirm `SMTP_USER=info@quadrafroynsolutions.in`. Keep `.env` private; it is excluded by `.gitignore` and must never be uploaded to a public repository.

If your email provider uses different SMTP settings, replace `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS` with the values supplied by that provider.

## 2. Install and run

From the project folder:

```bash
npm install
npm start
```

Open `http://localhost:3000`. Do not open the HTML file directly with `file://`, because the form API requires the Node server.

## 3. Deploy

Deploy the complete project to a Node.js-capable host (for example, a VPS or a Node application service), set the same environment variables in the host's private environment-variable settings, and start it with `npm start`. Point the domain to that service and enable HTTPS. A static-only host such as GitHub Pages cannot run this server endpoint by itself; use a Node-capable host or deploy the `/api/submit` endpoint separately as a serverless function.

## 4. Test all three form types

- Contact Us / inner-page enquiry forms: submits a `Website contact enquiry` email.
- Get a Quote popup: submits a `New project quote request` email.
- Careers > Apply popup: submits a `New careers application` email.

Every email is sent to `info@quadrafroynsolutions.in`; the sender's address is set as Reply-To. The form displays success only after the SMTP server accepts the message. If SMTP is not configured or delivery fails, the form shows an error rather than claiming the email was sent.

**Important:** SMTP credentials are not included in this ZIP. You must configure them in `.env` or your hosting provider's environment settings before live submissions can be delivered.
