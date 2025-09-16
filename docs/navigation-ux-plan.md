# Navigation UX Plan

## Goals
- Deliver an ecommerce-focused navigation system that keeps primary store actions within thumb reach on mobile while showcasing key collections on larger viewports.
- Maintain compliance visibility (state restrictions, disclaimers) without overwhelming the primary purchase journeys.
- Ensure extensibility for merchandising, seasonal promotions, and personalization hooks.

## Architecture Overview
1. **Desktop / Large Tablet**
   - Persistent `AppSidebar` hosts the full navigation tree, customer shortcuts, and merchandising callouts.
   - Hover-triggered mega menus for core categories (`Shop`, `Flower`, `Edibles`) with promotional slots and dynamic content (e.g., featured SKUs, bundle banners, compliance badges).
   - Sticky top bar exposes brand, search, cart, and customer status. Search expands into predictive panel with quick categories.

2. **Mobile Portrait**
   - Updated `MobileThumbBar` delivers five-tile quick navigation: Home, Shop, Flower, Edibles (or seasonal feature), Menu trigger.
   - Menu trigger opens the existing sheet-based sidebar with the full nav tree and compliance links.
   - Contextual badge support (“New”, “Sale”) for featured categories like Gamma Gummies.

3. **Mobile Landscape**
   - Collapse thumb bar; keep a floating bottom-right menu trigger that opens the sidebar immediately.
   - Optional quick access floating buttons (e.g., “Filters”, “Scroll to top”) appear when relevant, positioned above compliance bar.

4. **Compliance & Messaging**
   - Compliance bar remains fixed at bottom with popover links; integrate matching links within sidebar footer.
   - Provide geo-aware messaging (shipping eligibility, age gate confirmation) within sidebar header.

## Implementation Roadmap
1. Refine portrait thumb bar (done) – dynamic items, promo badge, consistent active states.
2. Introduce landscape dock with dedicated menu trigger and optional shortcuts.
3. Expand desktop mega menu content (design + data mapping).
4. Add personalization hooks (logged-in state summary, loyalty CTA) to nav components.
5. QA across breakpoints, audit accessibility, and tune transitions.

## Next Steps
- Prototype the landscape dock component and integrate safe-area offsets.
- Draft wireframes for mega menu content slots in collaboration with merchandising.
- Set up analytics/tracking hooks on nav interactions to measure engagement.
