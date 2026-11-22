# QuadraFroyn Solutions — Company Site

A cinematic homepage plus eleven standalone inner pages for **QuadraFroyn Solutions**, a product-led software company that designs, builds, ships and supports web platforms, mobile apps, AI products and career tools.

Built with **plain HTML, CSS and JavaScript**, plus a small Node.js + Express + Nodemailer endpoint for server-side form delivery. All motion remains dependency-free. Every process-card image is served locally from `assets/`.

The homepage flows as one story:

**hero → tools → how we work → services → inside the build → client notes → about → start a project + footer**

and links out to eleven standalone pages:

**about · services · products · careers · gallery · our team · mobile app development · website development · software development · AI & automation · career guidance**

---

## Quick start

The frontend is static, but form delivery requires the included Node.js server and SMTP configuration. See `EMAIL_SETUP.md`.

```bash
npm install
npm start
```

Open <http://localhost:3000>.

Deploy to a Node.js-capable host and configure the SMTP environment variables. Static-only hosting requires a separately deployed serverless `/api/submit` endpoint.

> Opening `index.html` via `file://` renders the layout, but the video may be blocked by the browser. Use a server for the intended experience.

---

## Opening state

There is **no loading screen**. The page paints straight into the hero: the background video fades in behind the copy, the headline lines rise in sequence and the foot row settles last. Scroll is never locked and nothing blocks the first interaction, including with JavaScript disabled.

---

## Homepage sections

| Section | Highlights |
| --- | --- |
| Hero | Extra-spacious centred composition — eyebrow, oversized headline, lead and dual CTAs over a full-bleed studio-office video that plays muted, looped and inline behind the **entire hero section**. Local clip (`hero-cinematic.mp4`, 1280×720), local poster, second local `<source>` fallback, `object-fit: cover`, readability scrim and resilient play handling. Slow pan, floating particles and a diagonal sheen, then a metadata row and wave seam into the tools band |
| Tools we ship with | Compact heading plus two opposite-direction auto-scrolling marquee rows (TypeScript, React, Next.js, React Native, Flutter, Node.js, Python, Go, and more), each word taking its own colour and lift on hover |
| How we work | The original **WebGL2 lens carousel**, restored exactly: six stage cards (Discover → Launch) on a curved, draggable strip with pointer parallax, depth shading and a glass-lens highlight. Each card carries a real 4:5 photograph. Drag, scroll, arrow keys or the arrows to move; pause/resume; tap or Enter to expand a card, Escape to return. A plain horizontal strip replaces it when WebGL is unavailable, and a caption updates the stage number, name and description |
| Services we provide | Five large cards inside a **hand-drawn lace/wavy rectangle** frame — an SVG clip path shapes the scalloped border and a dashed inner outline draws itself on scroll. Each card links to its detail page |
| Inside the build | Six large **company-event photographs** on an auto-advancing 3D orbit; pauses on hover, focus, drag and hidden tabs. Drag, wheel, arrow keys, arrow buttons and a matching lightbox |
| Client notes | The infinite 3D menu carousel — a rotating word wheel of six illustrative client notes around a large panel with a **136px portrait** (112px on phones). It **auto-advances every 6.2s** and keeps advancing even when the operating system requests reduced motion (the wheel itself simply stops rotating and the panel cross-fades), so the section never freezes. Pauses on hover, focus, dragging and hidden tabs; manual arrows, dots, drag, keyboard and the Auto/Pause toggle stay available |
| About us | White editorial spread with a three-image studio collage, numbered facts and a showreel trigger, over an auto-running values marquee |
| Start a project + footer | One merged `#060B14` panel: contact CTAs and a quote button, sitemap columns linking every page, giant dotted wordmark and aurora grain |

A **project quote popup** (`#quoteDialog`) opens automatically once per session after the page settles, and any "Get a quote" button reopens it — a light, elegant two-panel card with a soft gradient intro, 44px circular close button, and a form for name, email, need, budget and a one-line brief. Fields are validated in-page and sent through the server-side `/api/submit` endpoint to `info@quadrafroynsolutions.in` after SMTP is configured.

On pointer-fine devices the normal cursor is replaced across the whole page by a **splash cursor**: a full-screen canvas of dark-blue fluid trails that react to movement and clicks. Touch devices keep their native behaviour, and the effect is disabled for reduced motion.

---

## Inner pages

Every navbar and footer link, and every homepage service card, opens a real page. Each page is a full standalone document with its own title, meta description, Open Graph tags, hero composition, breadcrumb, enquiry CTA and footer.

The nine pages requested in this round were rebuilt from scratch in a light, premium editorial style (`css/pages-v15.css`, `js/pages-v15.js`) with original CSS mockups, asymmetric grids and locally hosted photography.

| Page | Focus |
| --- | --- |
| `pages/products.html` | Light product page: "Technology designed to move ideas forward." — 01 **QuadraConverter** ("Convert smarter. Work faster.") with an interactive-looking CSS converter window, 02 **Quadra AI Resume Builder** ("Build your next opportunity with AI.") linking to <https://quadraresumebuilder.in/> in a new tab, and 03 **QuadraBill** marked **COMING SOON** with a non-functional button. Numbered product modules, detail strips, product principles, enquiry CTA |
| `pages/careers.html` | Exactly **two commission-based internships**: 01 Digital Marketing Intern (Marketing & Brand Growth) and 02 Client Acquisition Intern (Business Development). Hero "Build Your Experience. Create Your Opportunity.", benefits "More Than an Internship. A Place to Grow.", opportunity cards with Apply Now → pre-filled `mailto:info@quadrafroynsolutions.in`, a permanent transparency note about the commission-based structure (no fixed salary or guaranteed stipend), a four-step process and closing CTA |
| `pages/mobile_app_development.html` | "We Turn Ideas Into Powerful Mobile Experiences." — 3-phone CSS 3D mockup, six asymmetric capability blocks (Native, Cross-Platform, UI/UX, Backend & API, App Modernization, Maintenance & Support), five-phase "From First Sketch to Final Launch." timeline with an animated connector, tech ticker (Flutter → AWS), three clearly-labelled concept directions, four partnership strengths, "Have an App Idea? Let's Bring It to Life." |
| `pages/website_development.html` | "Websites that make your brand impossible to overlook." — browser/tablet/phone stage, showcase "Built to look exceptional. Engineered to perform.", six creation categories, ten capabilities, tech ticker (HTML5 → Git), five-stage process, six reasons, six-question FAQ accordion, "Let's build a website worth remembering." |
| `pages/software_development.html` | Split hero "Building Digital Solutions That Move Businesses Forward." with a code-snippet panel, four capability cards, six-phase process, eleven-item tech strip (React → Docker), four reasons, "Have an Idea Worth Building?" |
| `pages/ai_automation.html` | "Make Work Smarter. Let Intelligence Do More." — Input → AI Processing → Intelligent Decision → Automated Workflow → Result flow diagram in a dark band, five capabilities, five-stage process, four practical applications explicitly framed as application areas rather than deployed client work, "Let's Make Your Workflows More Intelligent." |
| `pages/career_guidance.html` | "Your Future Has Possibilities. Let's Find Your Direction." — clickable journey jump links with scroll-spy, four full sections for **Class 10, Class 11, Class 12 and College** students, a Learn → Practice → Build → Showcase → Prepare progression for college, five-step approach, no admission guarantees anywhere, closing CTA |
| `pages/gallery.html` | "A closer look at what we create." — editorial six-frame **Featured Moments** composition, interactive 12-photo gallery with All/Workplace/Team/Events/Innovation filters and a keyboard lightbox (prev/next, Escape, focus-safe), "Ideas become experiences." storytelling panel with an animated equaliser accent, "Let's create something worth sharing." |
| `pages/ourteam.html` | "Great ideas are built by great people." — Leadership section naming **Dhanalakshmi E, CEO** with a neutral monogram portrait (no invented face), six discipline cards (strategy, design, engineering, product, growth, support), a DISCOVER → COLLABORATE → CREATE → DELIVER flow, culture grid and values chips, "Explore Careers" CTA |
| `pages/services.html` | Five service lines as linked cards, tabbed detail panels, engagement models, process, FAQ |
| `pages/about.html` | Studio story, values tabs (Clarity / Craft / Candour), disciplines grid, six-step process, FAQ, photo-led two-column blocks, values marquee |

### Features across the inner pages

1. Reading-progress bar across the top
2. Reveal-on-scroll entrance for every block (`[data-reveal]`, staggered)
3. Animated stat counters in the v15 heroes
4. Enquiry form that validates and composes a `mailto:` draft, with status messaging
5. Copy-email button with confirmation
6. Back-to-top button that appears after 700px
7. Single-open FAQ accordion (native `<details>`, used on website development and about)
8. Related-page cards at the end of every page
9. Accessible Services dropdown in the header (keyboard and outside-click close), with Products, Careers, Gallery and Our Team in the primary nav and footer
10. Responsive layout verified from 360px to 1920px
11. Reduced-motion support across all of the above

Page-specific extras: gallery filters + lightbox, careers `mailto:` application flow, career-guidance journey jump-links with scroll-spy, timeline connector draw-ins, mockup drift, tech tickers, tabbed panels on about and services.

---

## Project structure

```
quadra-homepage/
├── index.html                  # Homepage: hero, lens carousel, orbit gallery, client wheel, dialogs
├── pages/                      # Eleven inner pages (about, services + nine rebuilt in v15)
├── css/
│   ├── tokens.css              # Colour, type, spacing, radii, easing
│   ├── base.css                # Resets, headings, buttons, dialogs
│   ├── nav.css                 # Fixed header, desktop nav, mobile drawer (incl. tight-desktop compression)
│   ├── hero.css                # Hero layout and entrance states
│   ├── sections.css            # Base section styling
│   ├── animations.css          # Keyframe helpers
│   ├── motion.css              # Scroll/motion helpers
│   ├── responsive.css          # Breakpoints 360–1920
│   ├── company.css             # QuadraFroyn design layer
│   ├── v6.css                  # Lens carousel, note wheel, lace frames, splash cursor, quote dialog
│   ├── pages.css               # Inner-page design system, nav dropdown, forms, gallery, lightbox
│   └── pages-v15.css           # Light v15 design language: heroes, CSS mockups, asymmetric grids, timelines
├── js/
│   ├── core.js                 # Utilities, header, hero video, scroll-spy, footer stage, dialogs
│   ├── motion.js               # Base motion modules (gallery orbit, reveals, buttons)
│   ├── v6.js                   # Lens carousel, note wheel, masked headings, elastic mesh, splash cursor
│   ├── pages.js                # Inner-page behaviour: progress, sub-nav, tabs, filters, search,
│   │                           # lightbox, tilt, counters, forms, copy, back-to-top, FAQs
│   ├── pages-v15.js            # v15 extras: journey scroll-spy, timeline draw, mockup drift, image fallbacks
│   └── main.js                 # Bootstraps Q.start
├── assets/
│   ├── logo.png                # Navbar logo (transparent)
│   ├── images/
│   │   ├── gallery/            # Event photography (gala, festival, awards, birthdays…)
│   │   ├── process/            # Stage photography
│   │   ├── lens/               # 4:5 stage crops for the lens carousel
│   │   ├── clients/            # 1:1 portraits for the client-note wheel
│   │   ├── pages/              # Hero and supporting photography for every inner page
│   │   ├── studio/             # About collage photography
│   │   └── work/               # Service-card imagery + branded SVG fallback
│   └── media/
│       ├── hero-cinematic.mp4  # Primary local hero clip
│       ├── hero.mp4            # Second local source fallback
│       ├── hero-network-poster.jpg
│       ├── showreel.mp4
│       └── showreel-poster.jpg
└── README.md
```

Homepage scripts load deferred in order: `core.js → motion.js → v6.js → main.js`. Inner pages load `core.js → main.js → pages.js → pages-v15.js`, so shared header, dialogs and footer behaviour stay identical without pulling homepage-only motion.

---

## Motion inventory

All motion respects `prefers-reduced-motion`, with one deliberate exception: the muted hero background video keeps playing so the hero is never a still frame, and the client-notes panel keeps cross-fading between notes (rotation is switched off instead of the whole carousel freezing). Reduced motion stops pans, lens drift, wheel rotation, marquees and ambient animation.

1. **WebGL2 lens carousel** — curved card strip with pointer parallax, depth fog and a moving lens highlight; drag/scroll/keyboard, expand and Escape.
2. **Client-note wheel** — perspective menu wheel that auto-advances through six notes with 136px portraits every 6.2s, pausing on hover, focus, drag and hidden tabs.
3. **Splash cursor** — canvas fluid trails in the homepage navy, with click bursts.
4. **Elastic mesh** — soft cursor-reactive gradient mesh behind the about/contact panels.
5. **Masked headings** — clip-path sweeps reveal each section title as it enters the viewport.
6. **Lace frame draw** — the scalloped service border stroke traces itself (`pathLength` dash animation).
7. **Event orbit gallery** — tilted 3D ring; auto-advance with pause-on-hover/focus/drag and lightbox.
8. **Wave seams** — one exact S-shaped silhouette repeated at the hero seam, gallery caps and contact entry.
9. **Auto marquees** — tools rows at 36 s / 43 s in opposite directions; about values at 33 s; tech tickers on the v15 service pages.
10. **Hero** — video pan, floating particles, sheen and rotating role words.
11. **Quote dialog** — light card springs in over a blurred backdrop; inline validation and a mailto state.
12. **Footer** — per-letter wordmark rise, aurora drift, magnetic buttons and reveal-on-scroll.
13. **Inner pages** — progress bar, scroll-spy sub-nav, counters, staggered reveals, tilt cards, tab transitions and lightbox.
14. **v15 page motion** — CSS mockups drift on a slow loop, timeline connectors draw in, journey links follow reading position, gallery filters animate the grid.

---

## Accessibility

- Keyboard-operable lens carousel (arrows, Enter, Escape), client wheel, orbit gallery, dialogs, drawer and gallery lightbox; visible focus outlines.
- Inner pages: tab lists support ←/→; FAQ accordions are native `<details>`; filters and search update a live count; lightbox traps focus via native `<dialog>` and closes on Escape.
- Quote dialog uses native `<dialog>` with labelled fields, error messaging and focus return.
- Auto-advance and auto-rotation pause for hover, focus, dragging, modal dialogs and hidden tabs.
- `prefers-reduced-motion` disables the splash cursor, mesh, marquees, lens motion, wheel rotation, wave drawing and scroll-driven motion; the muted hero video still autoplays by design and the client-notes panel still changes without animating.
- The splash cursor never replaces the cursor on coarse pointers, and native focus rings remain visible.
- Semantic landmarks, labelled sections, `sr-only` summaries, decorative art hidden from assistive tech.
- Responsive from 360px to 1920px; the fixed header and sticky sub-nav are accounted for in anchor scroll offsets.

---

## Credits

- Hero background video: supplied by the client (Pexels stock footage, free-to-use licence), bundled locally as `hero-cinematic.mp4`; the poster is a local frame and `assets/media/hero.mp4` is kept as a second local source.
- Process stage photography: [Pexels](https://www.pexels.com) photos #7688336, #196644, #326502, #1181675, #3585088 and #1148820 (free-to-use licence).
- Lens-carousel stage crops and client-note portraits: [Pexels](https://www.pexels.com) (free-to-use licence), cropped to 4:5 and 1:1.
- Inner-page photography, including every v15 page image: [Pexels](https://www.pexels.com) (free-to-use licence) — photo IDs include #5062973, #3184407, #1181244, #3184467, #5905709, #607812, #3184456, #1181712, #3184459, #196644, #3184405, #3184461, #574071, #1267697, #3184291, #1181676, #3184417, #5212345, #3861958, #4145190, #7551442, #6146972, #3184317, #3184319, #1181605, #3184325, #3184406, #3184339, #3184360, #7648050, #3184357, #3184293, #3184287, #1181354, #587741, #3171837, #1181607, #1181396, #3184292, #3184300, #2608517, #1181397, #3184418, #326518, #3184466, #3184416 and #3184457.
- Event gallery and studio photography: [Pexels](https://www.pexels.com) / [Unsplash](https://unsplash.com) (free-to-use licence).
- Typefaces: Inter, Inter Tight and Instrument Serif via Google Fonts (SIL Open Font License).
- Logo: QuadraFroyn brand asset, provided by the client.
- Interaction patterns and every CSS product mockup (converter window, resume builder phone, app/website/browser frames, code panel, flow diagram) are original vanilla implementations; no React, WebGL library or other package is used.

## Notes

- Quadraconverter, Quadra AI Resume Builder and QuadraBill are original QuadraFroyn products; QuadraBill is presented only as **coming soon**. No other product is presented as real.
- Careers lists exactly two **commission-based** internships with no fixed salary, guaranteed stipend or earnings claims, and a permanent transparency note; applications open a pre-filled email to `info@quadrafroynsolutions.in`.
- Client notes, gallery captions, team disciplines and project descriptions are illustrative; quotes carry an "Illustrative quote" label, names and roles are anonymised, and no client logos, metrics or testimonials are invented.
- The Our Team page names only Dhanalakshmi E (CEO), shown with a neutral monogram rather than a stock face. All other photos on the page represent studio atmosphere, not named staff.
- AI applications are presented as capability examples, not delivered client deployments.
- Every interactive demo runs client-side only; no form data leaves the browser.
- Contact: `info@quadrafroynsolutions.in`.


## Form email delivery

Contact/enquiry forms, the Get a Quote popup, and Careers application popup post to the included Node API. All submissions are addressed to `info@quadrafroynsolutions.in`. Configure SMTP credentials before deployment; see [`EMAIL_SETUP.md`](EMAIL_SETUP.md). The credentials are intentionally not included in the project ZIP.
"# portfolio" 
