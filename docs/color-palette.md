# Total Hemp Consumables – Brand Palette

All brand colors below come directly from the provided style-guide assets. Values are expressed in hex and HSL (rounded) so they can be dropped into design tools or code.

| Token            | Hex     | HSL (deg / % / %) | Usage Sketch |
|------------------|---------|-------------------|--------------|
| brand-forest     | #19572B | hsl(137, 55%, 22%) | Heritage base, deep backgrounds, button outlines |
| brand-teal       | #12A578 | hsl(162, 80%, 36%) | Primary CTAs, highlights, focus states |
| brand-butter     | #F6F5AD | hsl(59, 80%, 82%)  | Default page background, soft cards, section wash |
| brand-gold       | #F4BF3D | hsl(43, 89%, 60%)  | Secondary accents, price badges, hover tints |
| brand-tangelo    | #E56525 | hsl(20, 79%, 52%)  | Alerts, promotional tags, warm gradients |
| brand-cocoa      | #6D3C2C | hsl(15, 42%, 30%)  | Depth accents, dividers, glass shadows |
| brand-black      | #030303 | hsl(0, 0%, 1%)     | Headlines, dark mode base |
| brand-graphite   | #474747 | hsl(0, 0%, 28%)    | Body copy, muted controls |
| brand-silver     | #9F9F9F | hsl(0, 0%, 62%)    | Borders, disabled states |
| brand-white      | #FFFFFF | hsl(0, 0%, 100%)   | On-light contrast, highlights |

The CSS token mapping lives in `src/app/global.css` so Tailwind and shadcn components share the same palette.

## Next Palette Tasks
- Derive complementary tints/shades for gradients, especially for the liquid-glass look (teal → gold, forest → butter).
- Define semantic roles (`success`, `warning`, `info`) based on the brand palette, ensuring adequate contrast.
- Produce dark-mode tweaks: audit contrast (4.5:1) for text on butter/gold backgrounds, adjust as needed.
