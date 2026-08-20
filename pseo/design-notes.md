# OMAY pSEO visual system

This is the visual contract for generated Turkish pSEO pages. It is additive: a generated page should load `styles.css` first and `pseo/pseo-design.css` second, then use the `pseo-*` classes below. Existing production pages and their current CSS are not changed by this layer.

## Direction

OMAY's current public identity is a light, product-led system: white paper, dark blue ink, thin blue-grey rules, cyan as a restrained action colour, compact uppercase labels, and practical cards. pSEO pages should feel like a technical magazine or an infrastructure briefing built from that identity. The page should communicate a decision clearly before asking for a lead.

Avoid the familiar AI visual shorthand: no neon purple/blue gradients, floating glass panels, fake dashboards, glowing circuit backgrounds, robot imagery, synthetic data streams, or rows of identical statistic cards. Use whitespace, visible evidence, plain-language labels, real tables, short editorial notes, and photography/diagrams with a reason to be present.

## Page anatomy

The canonical generated page should use this order:

1. Existing OMAY header and navigation.
2. `.pseo-utility` with the content type and review date.
3. `.pseo-breadcrumbs` with valid hierarchical links.
4. `.pseo-hero` with one specific title, a practical summary and a short decision note.
5. `.pseo-answer` containing the direct answer for the query.
6. `.pseo-facts` for three decision facts, not vanity metrics.
7. Main content in `.pseo-layout`, with the article and a sticky `.pseo-rail` table of contents.
8. A real comparison or capacity table.
9. A small architecture/data-flow diagram or a five-image editorial set.
10. Sources, method and review date.
11. `.pseo-cta` mapped to the relevant OMAY service.

The first screen should make the page's subject and conclusion obvious. Keep the strongest answer above the fold; do not hide it behind a calculator, pop-up or carousel.

## Five-image rule

Every page may have five unique images, but each image must serve a different editorial role. Use `.pseo-image-set` and five `.pseo-image-card` figures when the images explain the decision:

1. **Hero context:** a quiet, documentary image of the relevant hardware, workspace or physical infrastructure.
2. **Architecture:** a clearly labelled data-flow diagram showing input, model, GPU and output.
3. **Workload detail:** a close, legible view of a real component or workflow, not a generic server-room stock photo.
4. **Decision detail:** an annotated chart, capacity board or photographed setup that supports a claim in the page.
5. **Human context:** a team or operator using the result, used only when it adds context.

Use imagegen-created editorial masters or commissioned photography with an explicit caption. The shipped set uses five imagegen role masters and deterministic, page-specific raster treatments so every URL receives five distinct WebP files without introducing a synthetic dashboard aesthetic. Each image needs a descriptive Turkish `alt`, a caption explaining its relevance, and a stable filename derived from the page ID. Keep image crops calm and documentary: the CSS deliberately reduces saturation slightly and avoids poster-like overlays.

## Content density and rhythm

The intended body copy is approximately 500 Turkish words before tables, captions and source notes. Treat that as a useful minimum for a decision page, not a quota to fill with repetition. A good page contains:

- one direct answer;
- one `uygun / uygun değil` decision section;
- one original table, calculation or benchmark;
- one architecture or implementation explanation;
- one limitations note;
- three to six relevant internal links;
- one service-specific next step.

Use one idea per paragraph. Keep most paragraphs between two and five sentences. Headings should describe a buyer question: “Bu iş yükünde hangi GPU sınıfı daha mantıklı?” is more useful than “Avantajlar”.

## Typography and layout

The layer intentionally uses the existing system font stack and OMAY tokens. Do not add a decorative display font, a font CDN, or a new visual brand. Large titles are editorial and tight; body copy is quieter and wider. Use a maximum reading width of roughly 760px. A table may be wider than the article, but it must remain scrollable on mobile.

Use the grid to create hierarchy:

- hero: two columns on desktop, one column on mobile;
- article plus rail: approximately 1fr / 320px;
- evidence cards: two or three columns only when the contents are genuinely different;
- flow diagrams: four steps maximum before breaking into another section;
- five-image set: one large anchor image plus four supporting images.

Do not turn every paragraph into a card. Cards are for discrete evidence or choices. Narrative, methodology and limitations should stay on the paper background.

## Colour and interaction

Use dark ink for authority, cyan for links and actions, blue-grey for rules, and pale blue for answer callouts. Gold is reserved for one small review or method marker. Keep borders visible and shadows shallow. Hover states should be subtle; the page must remain understandable without animation. Respect `prefers-reduced-motion`.

CTAs should use existing OMAY button styles where possible. The CTA label must name the next action, for example “İş yükünü birlikte değerlendirelim” or “AI hizmet planınızı çıkaralım”. Avoid “Hemen başla” when the page is about a scoped project quote.

## Component contract

Required classes and their semantic jobs:

| Class | Job |
| --- | --- |
| `.pseo-page` | Scope root on `<body>` |
| `.pseo-shell` | Shared max-width container |
| `.pseo-utility` | Content type and review metadata |
| `.pseo-breadcrumbs` | Crawlable hierarchy and orientation |
| `.pseo-hero` / `.pseo-title` / `.pseo-dek` | Page opening |
| `.pseo-answer` | Direct answer block |
| `.pseo-facts` / `.pseo-fact` | Three decision facts |
| `.pseo-layout` / `.pseo-article` / `.pseo-rail` | Reading layout |
| `.pseo-table-wrap` / `.pseo-table` | Evidence and comparison tables |
| `.pseo-flow` / `.pseo-flow-step` | Small architecture or process flow |
| `.pseo-image-set` / `.pseo-image-card` | Five-role image set |
| `.pseo-source-list` | Sources and methodology |
| `.pseo-cta` | Service-specific next step |

Use semantic HTML (`article`, `figure`, `figcaption`, `table`, `thead`, `tbody`, `time`, `nav`) alongside these classes. The CSS does not replace alt text, captions, structured data, canonical URLs, or accessible link names.

## Quality check before publishing

- The page answers a real Turkish buyer question and maps to one OMAY service layer.
- The title, answer, table, captions and CTA are specific to this page's model, GPU, workload, industry or decision.
- All five images, if present, have distinct roles and accurate Turkish alt text.
- At least one claim is supported by a visible source, test, calculation or methodology note.
- The page does not imply unverified inventory, SLA, monitoring, price, compliance or delivery guarantees.
- No page is an interchangeable copy of another page with only nouns swapped.
- Keyboard focus, mobile table scrolling, reduced motion and print output remain usable.
