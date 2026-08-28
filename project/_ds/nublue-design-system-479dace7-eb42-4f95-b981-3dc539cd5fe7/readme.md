# NuBlue Design System

The design system for **NuBlue Electric, Plumbing & Air** — a North Carolina home-services company operating in Charlotte, Lake Norman, Greenville and Fayetteville. NuBlue sells three service lines (electrical, plumbing, air), a membership product (**NuShield Protection Plan**), and a franchise-style ownership track (**Market Leader Program**).

The system is flat, high-contrast and action-forward: navy is the brand, red is the button, blue is the accent, and the imagery is always real technicians in real homes.

## Sources

| Source | What came from it |
|---|---|
| `https://callnublue.com/` (homepage, fetched July 2026) | Section order, headline and offer copy, nav structure, component inventory, footer structure |
| Brand notes supplied in the project brief | Exact hex values, Outfit type roles, button variants, layout rules |
| `uploads/` (7 files) | Logo lockups (horizontal white, vertical navy, Market Leader), technician photo, van render, NuShield mascot, employee-of-the-year cut-out |

No codebase or Figma file was provided. Where the live site's CSS could not be read directly, spacing and sizing were derived from the brand notes and the rendered page — flagged below under **Open questions**.

## Index

```
styles.css                 → the single entry point consumers link (imports only)
tokens/                    → fonts, colors, typography, spacing, shape, motion, base reset
assets/                    → logos (SVG) + imagery (jpg/webp/png)
components/core/           → Button, IconButton, Icon, Eyebrow, SectionHeading, GoogleRating, StarRating
components/forms/          → Input, Textarea, Select, Checkbox, RadioGroup, ZipSearch
components/cards/          → CouponCard, ReviewCard, FeatureItem
components/navigation/     → SiteHeader, SiteFooter
components/layout/         → Section, MediaSplit
guidelines/                → 18 foundation specimen cards (Colors, Type, Spacing, Brand)
ui_kits/website/           → click-through recreation of callnublue.com (5 screens)
templates/marketing-page/  → "Marketing page" template consuming projects can start from
SKILL.md                   → Agent Skills entry point
```

### Components

**Core** — `Button`, `IconButton`, `Icon`, `Eyebrow`, `SectionHeading`, `GoogleRating`, `StarRating`
**Forms** — `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `ZipSearch`
**Cards** — `CouponCard`, `ReviewCard`, `FeatureItem`
**Navigation** — `SiteHeader`, `SiteFooter`
**Layout** — `Section`, `MediaSplit`

Every component has a sibling `.d.ts` (props contract) and `.prompt.md` (when and how to use it). Import from the compiled bundle: `const { Button } = window.NuBlueDesignSystem_479dac`.

**Intentional additions** — the source site defines no reusable icon abstraction, so `Icon` was added as a thin Lucide wrapper so components can name glyphs instead of inlining SVG. `Section` / `MediaSplit` were added to encode the site's alternating-band layout rule. Everything else maps 1:1 to something visible on callnublue.com.

## Content fundamentals

**Voice: plain-spoken, local, and specific.** NuBlue writes like a dispatcher who answers the phone, not like a marketing department. Sentences are short and declarative. Claims are concrete ("same-day service", "$19/month", "4.9 Google rating") rather than atmospheric.

**We / you, never "I".** The company is always *we*; the reader is always *you*. Ownership language matters — "**your** home's most critical systems", "**We're** committed to serving **our** community".

Examples straight from the site:
- "We're committed to serving our community with reliable home care that saves you time and money."
- "Eliminate unexpected repair bills and service delays with priority access and ongoing maintenance for your home's most critical systems."
- "We want the next generation of electricians to be owners alongside us."

**Casing.** Headlines use Title Case with slightly loose rules ("Reliable Service you can Always depend on" — the site is not strict about it, and that informality is part of the voice). Buttons and nav are ALL CAPS. Micro-labels ("EXPIRES 01/31/2025") are all caps.

**Headline pattern.** A navy sentence with the word *NuBlue* swapped to accent blue: "Expect More With **NuBlue**", "Contact **NuBlue** Today". Use it on roughly half the headings on a page — it loses force if every heading does it.

**Offers lead with the number.** "$300 Savings on a Panel Swap", "$75 Off Surge Protector Install", "FREE Water Test". Dollar amount or the word FREE comes first, then the thing.

**Button labels are verbs, 2–4 words:** Schedule Service · Request Service · Start The Process · Read More Reviews · About Our Team · Join Our Team · Learn More About NuShield · View All Offers.

**No emoji. Ever.** Not in headings, not in body copy, not as bullets. The one illustrated character in the entire brand is the NuShield mascot.

**Fine print is honest and unhidden** — expiry dates, service-area limits and SMS opt-out language appear right on the coupon and under the form, in 13px caption type.

## Visual foundations

**Color.** Four brand colors carry everything: navy `#151A42` (headings, header, footer bar, coupon tiles), accent blue `#3F90CF` (the accented word, icons, focus), sky blue `#7BC7F8` (eyebrows on dark, footer strip, icon highlights), red `#DC3030` (every CTA). Surfaces are white, pale blue `#E7F3FF`, and light gray `#F1F1F1`. Body copy is navy at 80%. Gold `#FBBC04` appears only in review stars. **Red is the action color and blue is the brand color; they never swap roles.**

**Type.** Outfit only, six weights. Hero and section headings are Bold 700 with leading 1.05–1.12 and −0.01em tracking. Card titles are SemiBold 600. Body is Regular 400 at 1.55 leading. Buttons are Bold 700 uppercase at +0.05em; nav is Medium 500 uppercase at +0.06em. Full scale in `tokens/typography.css`.

**Spacing & layout.** 4px base scale. 1240px centered container with 24px gutters; 32px grid gap. Sections are full-bleed bands stacked vertically with `clamp(56px, 7vw, 104px)` vertical padding. Backgrounds alternate **white → pale blue → white → light gray**; never two colored bands in a row, and at most one navy band per page. Content sections are usually a 50/50 image + copy split; section headings are centered, split-section headings are left-aligned.

**Backgrounds.** Solid fills, not textures. There are no patterns, no grain, no noise overlays. The only gradients in the system are (a) the 10px sky→blue→navy strip above the footer and (b) a navy left-to-right scrim over hero photography. The van wrap has a halftone dot pattern, but that lives in the artwork, not in the UI.

**Imagery.** Real technicians in blue NuBlue polos, real homes, real customers, and branded vans shown large and clean on white or pale blue. Photography is cool-daylight — natural light, slightly cool white balance, green lawns and blue sky, no filters, no black-and-white, no heavy grade. Photos get a 16px radius when placed in a split; the van PNG is used with no radius and no container so it reads as a cut-out. Never crop a face tightly; the point is that these are actual people.

**Cards.** Flat. Review cards: light-gray (or white on gray sections) tile, 8px radius, no border, no shadow. Coupon cards: solid navy, 8px radius, a 2px white **dashed** inset border, and a pale-blue footer bar holding the action. Pricing tiles: 1px hairline border on white, or solid navy for the featured tier. Nothing in the system uses a colored left-border accent.

**Corner radii.** Actions are full pills (`999px`). Fields are 4px. Cards are 8px. Photography is 16px. Nothing else is rounded.

**Elevation.** The site is flat, not layered. `--shadow-none` is the default. Soft shadows exist (`--shadow-soft`, `--shadow-lift`, `--shadow-header`) but are reserved for genuinely floating chrome — a sticky header or a modal. Do not shadow cards.

**Borders.** 1px `#E3E3E3` hairlines on fields and quiet cards. 2px in exactly three places: outline buttons, the coupon dashed inset, and the active-nav underline.

**Transparency & blur.** Used sparingly and only over photography: white at 85–88% for body copy on navy, navy at 10–92% in the hero scrim. No frosted glass, no backdrop blur anywhere.

**Motion.** Restrained. 200ms `cubic-bezier(.4,0,.2,1)` on color and border transitions; 120ms for quick feedback. Fades and simple slides only — no bounces, no springs, no parallax, no scroll-jacking. The coupon carousel slides horizontally; that is the most animated thing on the site.

**Interaction states.** Hover *darkens* the primary red (`#DC3030` → `#B92222`); outline buttons **fill** with red and flip their label to white; the on-navy pale-blue button goes to pure white; the phone button fills white with navy text. Round icon buttons shift navy → accent blue. Press scales to 0.98. Focus is a 3px accent-blue ring at 45% (`--focus-ring`) — never a browser outline. Links in body copy are red and underline on hover.

**Fixed elements.** The header is the only sticky element. There is no floating chat bubble, no sticky bottom bar, no cookie banner in the design.

## Iconography

NuBlue's site uses a small set of **custom blue line icons** — roughly 1.5px stroke, rounded joins, drawn at ~40px — in the "Expect More" feature grid, plus small solid glyphs inside buttons (calendar, phone, magnifier) and round navy social circles in the footer.

Those source SVGs were **not** included in the upload and could not be extracted from the live site, so this system substitutes **Lucide** (`https://unpkg.com/lucide@latest`) — the closest CDN match for stroke weight, round caps and geometric construction. ⚠️ **This is a substitution.** If you can supply the real icon SVGs, drop them into `assets/icons/` and rewrite `components/core/Icon.jsx` to read from there.

Rules in force:
- Feature-grid icons: 40px, 1.5 stroke, accent blue, no container.
- Button icons: 18px (20px at `size="lg"`), inherit the label color, always on the **left** of the label.
- Social icons: white glyph inside a 44px navy circle (`IconButton`).
- Unicode characters are used as micro-affordances in exactly two places: `+` / `−` on the coupon "More Info" toggle, and the pipe `|` separating service areas.
- **No emoji, ever.** The NuShield mascot (`assets/img/nushield-mascot.webp`) is the only illustration in the system.

## Assets

| File | Use |
|---|---|
| `assets/logo-horizontal-white.svg` | Primary lockup on navy — site header, dark bands |
| `assets/logo-vertical-navy.svg` | Primary lockup on light — footer, documents |
| `assets/logo-market-leader.svg` | Market Leader Program sub-brand. White backgrounds only |
| `assets/img/nushield-mascot.webp` | NuShield membership content only |
| `assets/img/tech-ac-unit.jpg` | Hero / split photography |
| `assets/img/employee-daniel-moore.webp` | Employee-spotlight cut-out |
| `assets/img/van.png` | Branded van, shown large on white or pale blue |

The three logo SVGs arrived with their internal `<style>` blocks stripped, which rendered them solid black. Fills were restored per-path from the sampled brand hexes (`#151A42`, `#3F90CE`, `#FFFFFF`) — visually verified against the van wrap and the live site.

## Open questions

- **Fonts:** Outfit is loaded from Google Fonts. If NuBlue licenses a specific webfont build (or a different display face for the wordmark), send the files and `tokens/fonts.css` will be switched to local `@font-face`.
- **Icons:** see the substitution flag above.
- **Section padding and container width** were derived from the rendered page, not the theme CSS. If you can share `bc-nublue`'s stylesheet the numbers can be made exact.
- **Mobile breakpoints** are not yet encoded — the system is desktop-first at 1240px. Tell me the breakpoints you use and they'll go into `tokens/spacing.css`.
