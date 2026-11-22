# QuadraFroyn v15 — Update notes

- Added image-led cards to the Our Team page's How We Work section.
- Replaced the individual leadership spotlight with a collective four-founder team introduction. No founder is singled out as a leader.
- Added four circular, grayscale-to-colour hover image treatments for the team capability cards.
- Replaced the inner-page footer with the homepage footer structure and loaded the shared footer styles across all additional pages.
- Set the homepage quote dialog auto-open delay to 3 seconds (still shown once per browser session and respects reduced-motion settings).
- Replaced Careers email-only Apply links with a structured application dialog. The form gathers contact, education, role, duration, work mode, portfolio, availability and interest details, then prepares a mailto message for the applicant to review and send.
- The application form does not store or submit data to a server; it opens the visitor's configured email application.


## v16 email + image correction (2026-11-21)
- Fixed the How We Work WebGL texture readiness flag: successfully loaded local process photos now set `slot.ready = 1`, replacing the grey shader placeholder with the actual image. The existing six-card layout and motion are preserved.
- Normalized process image URLs against the document base URL and removed unnecessary cross-origin mode for same-origin assets.
- Replaced mail-draft-only form handling with server-backed submissions for contact/enquiry forms, Get a Quote, and Careers applications.
- All form submissions are addressed to `info@quadrafroynsolutions.in`; sender email is used as Reply-To.
- Added `server.js`, `package.json`, `.env.example`, `.gitignore`, and `EMAIL_SETUP.md`. SMTP credentials must be supplied by the site owner before email sending is live.
- Updated displayed contact email links to the requested mailbox.
