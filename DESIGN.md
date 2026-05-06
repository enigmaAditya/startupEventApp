# Design System Documentation: The Electric Curative

## 1. Overview & Creative North Star
**Creative North Star: The Electric Curative**
This design system is built to move away from the static, "flat" web and toward a multi-dimensional, editorial experience. It is designed specifically for a premium events platform, where the UI should feel like a high-end physical venue—layered, atmospheric, and alive with energy.

We achieve this through "The Electric Curative" approach: utilizing a deep obsidian foundation to ground the experience, while layering semi-transparent "glass" surfaces and high-intensity neon accents to guide the user’s eye. We reject the rigid, boxed-in nature of standard templates in favor of intentional asymmetry, generous breathing room, and kinetic feedback that makes every interaction feel deliberate and high-end.

---

## 2. Colors & Surface Philosophy
The palette is built on a foundation of deep obsidian with high-energy accents. However, the sophistication of this system lies in how these colors are layered rather than how they are outlined.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Boundaries must be established through background shifts.
*   **Primary Sectioning:** Use `surface` (#0e0e0e) as the base.
*   **Secondary Sectioning:** Use `surface-container-low` (#131313) to define distinct content areas.
*   **Depth through Tone:** A card should not have a border; it should simply sit as a `surface-container-highest` (#262626) element on a `surface-dim` (#0e0e0e) background.

### Surface Hierarchy & Nesting
Treat the UI as physical sheets of frosted glass.
*   **Lowest Tier:** `surface-container-lowest` (#000000) for deep-set backgrounds or footer areas.
*   **Mid Tier:** `surface-container` (#1a1919) for standard content groupings.
*   **Highest Tier:** `surface-container-highest` (#262626) for elements that need to pop, such as active navigation items or modal overlays.

### The Glass & Gradient Rule
To achieve "The Electric Curative" look, all floating elements (modals, dropdowns, navigation bars) must use **Glassmorphism**:
*   **Background:** Semi-transparent versions of `surface-container` (approx 60-80% opacity).
*   **Effect:** `backdrop-filter: blur(15px)`.
*   **Gradients:** Main CTAs and Hero moments must utilize a 45-degree linear gradient (e.g., `primary` #96f8ff to `secondary` #44a3f5) to provide a "visual soul" that flat colors cannot replicate.

---

## 3. Typography
Our typography is unapologetically bold and editorial. We use **Inter** to bridge the gap between technical precision and high-end fashion.

*   **Display & Headlines:** Must use **Bold weights** with a tracking value of `-0.02em`. This creates a "tight," authoritative look.
*   **Body Copy:** Use `body-lg` (1rem) for readability. Maintain a clear hierarchy where the `display-lg` (3.5rem) acts as a visual anchor.
*   **Labels:** Use `label-md` (0.75rem) for metadata. These should often be paired with `on-surface-variant` (#adaaaa) to ensure they don't compete with the primary headline.

---

## 4. Elevation & Depth
Depth is the cornerstone of this system. We avoid traditional drop shadows in favor of **Tonal Layering**.

### The Layering Principle
Stacking `surface-container` tiers creates a natural lift. A `surface-container-high` card placed on a `surface-dim` background creates an immediate sense of hierarchy without adding visual clutter.

### Ambient Shadows & Glows
*   **Ambient Shadows:** For floating glass panels, use extra-diffused shadows. Blur values should be large (30px-50px) and opacity extremely low (4%-8%). The color should be a tinted version of `primary` or `tertiary` to simulate light passing through colored glass.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` (#494847) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** A gradient fill (Cyan to Blue) with a `0.4s` transition. On hover, apply `scale(1.02)` and a soft glow using a `box-shadow` that matches the `primary` color.
*   **Secondary:** Glass-based (semi-transparent `surface-variant`) with a "Ghost Border."
*   **Tertiary:** Text-only using `tertiary` (#d873ff) with a subtle underline on hover.

### Cards (The Event Card)
*   **Construction:** No borders. Background: `surface-container-high`. 
*   **Interactivity:** On hover, the card scales to `1.02` and the `backdrop-filter` increases. 
*   **Layout:** Use vertical white space (from the Spacing Scale) instead of dividers.

### Chips
*   Used for event categories (e.g., "Tech," "Design").
*   **Style:** `surface-bright` background with `on-surface` text. For "Active" states, use a `primary` glow.

### Input Fields
*   **Base:** `surface-container-low` with a bottom-only "Ghost Border."
*   **Focus State:** The bottom border transforms into a `primary` gradient, and the label floats upward with a `tertiary` tint.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts for Hero sections to create a "custom" feel.
*   **Do** allow background gradients to bleed through glass components using `backdrop-blur`.
*   **Do** use the `0.4s` transition for all scale and color changes to ensure a "liquid" feel.
*   **Do** prioritize `primary` (Cyan) for utility and `tertiary` (Purple) for moments of delight.

### Don’t:
*   **Don’t** use 1px solid, high-contrast borders. They break the glass illusion.
*   **Don’t** use pure black (#000000) for anything other than the deepest `surface-container-lowest` layers.
*   **Don’t** use traditional "Drop Shadows" with high opacity. They feel dated and heavy.
*   **Don’t** crowd the interface. If a section feels tight, increase the vertical spacing by 1.5x the standard scale.