# Helsinki Tycoon — Mobile & Touch Implementation Plan

This document describes every change required to make Helsinki Tycoon fully playable on tablets and phones with touch input. It is written as a step-by-step implementation guide that can be followed across multiple sessions.

---

## Current State

- **Input**: Mouse only (`mousedown`, `mousemove`, `mouseup`, `wheel`, `click` on canvas). No touch events.
- **Layout**: Fixed desktop layout, zero `@media` queries. HUD (48px), scoreboard (18px), action bar (48px), news ticker (24px) = 138px of vertical chrome.
- **Touch targets**: Buttons are `6px 12px` padding with `8px` font — far below the 44×44px mobile minimum.
- **Hover**: CSS `:hover` used throughout; these "stick" on touch devices.
- **Hotkeys**: Shown on every button (`[space]`, `[B]`, etc.) — irrelevant on mobile.
- **Panels**: Property panel is 280px fixed width, right-positioned. Overlays are centered `position: absolute` with no max-height/scroll.
- **Viewport meta**: Already has `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- **Font**: Press Start 2P at 6–14px. Pixel fonts below ~8px are unreadable on mobile.

### Files involved

| File | What needs changing |
|------|-------------------|
| `js/map.js` | Touch events, pinch zoom, tap handling, hover replacement |
| `css/style.css` | Responsive breakpoints, touch targets, hover guards, layout changes |
| `index.html` | Possible structural changes (hamburger menu, drawer) |
| `js/ui.js` | Touch-aware panel behavior, mobile menu logic |

---

## Phase 1: Touch Input on Canvas

**File: `js/map.js` — `setupEvents()` and new functions**

### 1.1 Add touch event listeners

In `setupEvents()`, alongside existing mouse listeners, add:

```js
canvas.addEventListener('touchstart', onTouchStart, { passive: false });
canvas.addEventListener('touchmove', onTouchMove, { passive: false });
canvas.addEventListener('touchend', onTouchEnd, { passive: false });
```

### 1.2 Single-finger drag (pan)

Track touch state in module-scope variables:

```js
let touchState = {
    startX: 0, startY: 0,
    lastX: 0, lastY: 0,
    cameraStartX: 0, cameraStartY: 0,
    isPinching: false,
    initialPinchDist: 0,
    initialPinchZoom: 0,
    moved: false,
};
```

`onTouchStart`:
- If `e.touches.length === 1`: store touch position and camera position (mirror `onMouseDown`). Set `touchState.moved = false`.
- If `e.touches.length === 2`: switch to pinch mode — calculate initial distance between fingers, store `camera.zoom`.
- Call `e.preventDefault()` to block browser scroll/refresh.

`onTouchMove`:
- If single finger and not pinching: update `camera.x/y` from delta (mirror `onMouseMove` drag). Set `touchState.moved = true`.
- If two fingers: calculate new distance, set `camera.zoom = initialPinchZoom * (newDist / initialPinchDist)`, clamped to `[0.3, 4]`. Zoom toward midpoint between fingers (same math as `onWheel` but using midpoint instead of mouse position).
- Call `e.preventDefault()`.

`onTouchEnd`:
- If `!touchState.moved` and was single finger (not pinch): treat as tap — call existing `onClick`-equivalent logic using `changedTouches[0]` position.
- Reset touch state.

### 1.3 Tap-to-inspect (replaces hover)

On touch devices, there is no hover. The current flow is: hover shows tooltip → click opens panel. On mobile, change to:

- **Tap a property/landmark/district**: show a **toast-style info bar** at the bottom (above action bar) with name, type, price. Include a "View" button to open the full panel.
- Or simpler: first tap opens the property panel directly (same as click does now). This is already how `onClick` works, so single-tap = open panel should work with no extra code once touch-tap is wired.

The tooltip drawn on canvas by `drawTooltip()` won't appear on mobile (no hover), but that's acceptable — the property panel provides the same info.

### 1.4 Prevent browser gestures

Add to `#map-canvas` CSS:
```css
touch-action: none;
```

This prevents pull-to-refresh, pinch-zoom of the page, and swipe-back navigation on the canvas element.

---

## Phase 2: Responsive Layout — Breakpoints

**File: `css/style.css`**

Define two breakpoints at the bottom of the stylesheet:

| Breakpoint | Target |
|-----------|--------|
| `max-width: 1024px` | Tablets (landscape and portrait) |
| `max-width: 600px` | Phones |

### 2.1 Tablet breakpoint (`max-width: 1024px`)

```css
@media (max-width: 1024px) {
    /* HUD */
    #game-title { display: none; }              /* Hide title to save space */
    #hud { padding: 6px 10px; height: 40px; }
    #hud-left, #hud-center, #hud-right { gap: 8px; }
    
    /* Action bar */
    #action-buttons { flex-wrap: wrap; gap: 4px; }
    #action-bar { height: auto; min-height: 40px; padding: 6px 10px; }
    
    /* Property panel */
    .panel { width: 260px; right: 8px; top: 50px; }
    
    /* Scoreboard */
    #scoreboard { padding: 2px 10px; font-size: 6px; }
}
```

### 2.2 Phone breakpoint (`max-width: 600px`)

This is where major layout changes happen:

#### HUD collapse
```css
@media (max-width: 600px) {
    #hud {
        height: auto;
        flex-wrap: wrap;
        padding: 4px 8px;
        gap: 4px;
    }
    #hud-left {
        order: 2;
        gap: 6px;
    }
    #hud-center {
        order: 1;
        width: 100%;
        justify-content: center;
        gap: 8px;
    }
    #hud-right {
        order: 3;
        gap: 6px;
    }
    #game-title { display: none; }
    .music-style-select { display: none; }   /* Hide music style on phone */
    #hud-money { font-size: 10px; }
    #hud-properties, #hud-turn { font-size: 7px; }
}
```

#### Action bar → scrollable toolbar or hamburger

**Option A — Horizontal scroll** (simpler):
```css
@media (max-width: 600px) {
    #action-buttons {
        overflow-x: auto;
        flex-wrap: nowrap;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;       /* Firefox */
    }
    #action-buttons::-webkit-scrollbar { display: none; }
    #action-bar { height: auto; padding: 4px 8px; }
}
```

**Option B — Hamburger menu** (better UX, more work):
- Add a `<button id="btn-mobile-menu">☰</button>` in HTML (hidden on desktop via CSS).
- On phone, hide all action buttons except End Turn and the hamburger.
- Hamburger opens a slide-up drawer with the remaining buttons in a 2- or 3-column grid.
- This requires HTML changes in `index.html` and JS in `ui.js`.

**Recommendation**: Start with Option A, upgrade to Option B later if needed.

#### Property panel → bottom sheet
```css
@media (max-width: 600px) {
    .panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        width: 100%;
        max-height: 50vh;
        overflow-y: auto;
        border-radius: 8px 8px 0 0;
        border: 2px solid var(--border-color);
        border-bottom: none;
    }
}
```

#### Overlays → scrollable, full-width
```css
@media (max-width: 600px) {
    .overlay {
        align-items: flex-start;
        overflow-y: auto;
        padding: 16px 8px;
    }
}
```

Apply similar full-width treatment to:
- `.bank-panel` (currently 340px width)
- `.filter-panel` (currently 260px width)
- `.stats-panel` / `.menu-panel` (currently 400px / 260px)
- `.staff-panel` (currently 360px)
- `.log-panel` (currently 320px)
- `.portfolio-panel` (currently 440px)
- `#achievements-panel` (currently 320px)
- `#newspaper-overlay .newspaper` (currently 560px max-width)
- `#auction-content` (currently 540px max-width)

General pattern:
```css
@media (max-width: 600px) {
    .bank-panel, .filter-panel, .stats-panel, .menu-panel,
    .staff-panel, .log-panel, .portfolio-panel, #achievements-panel {
        width: calc(100vw - 16px) !important;
        max-width: none;
        left: 8px !important;
        right: 8px !important;
        max-height: 70vh;
        overflow-y: auto;
    }
    .newspaper {
        max-width: calc(100vw - 32px);
        max-height: 80vh;
        overflow-y: auto;
    }
}
```

#### Scoreboard
```css
@media (max-width: 600px) {
    #scoreboard { display: none; }   /* Hide on phones — info is in Stats panel */
}
```
Or make it a single-line scrollable ribbon with the player + leader only.

#### News ticker
```css
@media (max-width: 600px) {
    #news-ticker { font-size: 6px; height: 20px; }
}
```

---

## Phase 3: Touch Target Sizes

**File: `css/style.css`**

Mobile guidelines (Apple/Google) require minimum 44×44px tap targets.

```css
@media (max-width: 1024px) {
    .action-btn {
        font-size: 9px;
        padding: 10px 14px;
        min-height: 44px;
        min-width: 44px;
    }
    
    #panel-close, .log-header button, .filter-header button,
    .bank-header button, .stats-header button, .menu-header button,
    .staff-header button {
        min-width: 44px;
        min-height: 44px;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .filter-btn {
        padding: 8px 12px;
        min-height: 36px;
    }
    
    .bank-btn {
        padding: 10px 14px;
        min-height: 44px;
    }
    
    .sound-btn {
        min-width: 36px;
        min-height: 36px;
        font-size: 14px;
    }
}
```

---

## Phase 4: Hide Keyboard Hints

**File: `css/style.css`**

Hotkey indicators (`[space]`, `[B]`, etc.) and underlined letters are meaningless on touch devices.

```css
@media (hover: none) {
    .action-btn .hotkey { display: none; }
    .action-btn u { text-decoration: none; color: inherit; }
}
```

`(hover: none)` targets devices without a hover-capable pointer (phones, tablets).

---

## Phase 5: Fix Hover States

**File: `css/style.css`**

On touch devices, `:hover` sticks after tap. Wrap all `:hover` rules in a media query:

```css
@media (hover: hover) {
    .action-btn:hover { background: var(--btn-hover); }
    .sound-btn:hover { background: var(--btn-hover); color: var(--text-primary); }
    .music-style-select:hover { border-color: var(--text-accent); color: var(--text-primary); }
    .cheat-btn:hover { border-color: #cc88cc; background: rgba(136, 68, 136, 0.1); }
    #panel-close:hover { color: var(--text-danger); }
    .filter-btn:hover { background: var(--btn-hover); }
    /* ... all other :hover rules ... */
}
```

**Approach**: Search CSS for all `:hover` selectors, wrap each in `@media (hover: hover)`. Keep `:active` styles unconditional (they work on both mouse and touch).

To find all hover rules:
```bash
grep -n ':hover' css/style.css
```

---

## Phase 6: Orientation Handling

**File: `css/style.css` + possibly `js/map.js`**

### 6.1 Landscape recommendation

On phones in portrait, the map is squeezed vertically. Two options:

**Option A — Orientation prompt** (simpler):
```css
@media (max-width: 600px) and (orientation: portrait) {
    #orientation-hint {
        display: flex;
        position: fixed;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-panel);
        border: 1px solid var(--border-color);
        padding: 6px 12px;
        font-size: 7px;
        color: var(--text-secondary);
        z-index: 300;
        white-space: nowrap;
    }
}
@media (orientation: landscape), (min-width: 601px) {
    #orientation-hint { display: none; }
}
```

Add to `index.html`:
```html
<div id="orientation-hint">↻ Rotate for best experience</div>
```

Auto-dismiss after 5 seconds or on first touch.

**Option B — Portrait layout** (much more work):
Redesign the layout so the map takes the top 60% and panels slide up from the bottom. This is a significant structural change and should only be attempted if the game needs to work well in portrait.

**Recommendation**: Start with Option A. Most tycoon/strategy games use landscape.

### 6.2 Canvas resize on orientation change

The existing `window.addEventListener('resize', ...)` in `map.js` already handles this, but add a small delay to let the viewport settle:

```js
window.addEventListener('resize', () => {
    // Debounce for orientation change
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        resize();
        render();
    }, 100);
});
```

---

## Phase 7: Panel & Modal Scrollability

**File: `css/style.css`**

Several panels can exceed phone screen height. Ensure all content panels have:

```css
@media (max-width: 600px) {
    /* All side panels */
    .log-entries, .filter-section, .bank-body, .stats-body,
    .menu-body, .staff-body, #achievements-body, .portfolio-body {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    
    /* Newspaper */
    .newspaper-body {
        max-height: 50vh;
        overflow-y: auto;
    }
    
    /* Victory screen */
    #victory-content {
        max-height: 85vh;
        overflow-y: auto;
    }
    
    /* Start screen */
    .start-content {
        max-height: 90vh;
        overflow-y: auto;
    }
}
```

---

## Phase 8: Font Size Adjustments

**File: `css/style.css`**

Press Start 2P is a bitmap-style font. Below 8px it becomes illegible on high-DPI screens. Minimum readable size on mobile is ~8px.

```css
@media (max-width: 600px) {
    /* Bump up smallest text */
    .achievement-desc, .cheat-hint, .cheat-warn, .cheat-btn,
    .sb-entry, #news-text, .filter-btn, .achievement-category,
    .achievement-name {
        font-size: 8px;
    }
}
```

Don't overdo it — the pixel art aesthetic depends on small text. Only raise text that's functionally unreadable.

---

## Phase 9: Start Screen

**File: `css/style.css`**

The start screen is already an overlay so it should mostly work, but check:
- Name input field: needs larger touch target, at least 44px height
- Difficulty buttons: need adequate spacing
- Changelog button: needs adequate size

```css
@media (max-width: 600px) {
    .start-content {
        width: calc(100vw - 32px);
        padding: 16px;
    }
    #start-name {
        min-height: 44px;
        font-size: 10px;
    }
    .difficulty-btn {
        min-height: 44px;
        padding: 10px 16px;
    }
}
```

---

## Implementation Order

Recommended order to implement, with each phase being independently shippable:

1. **Phase 1** (Touch input) — highest impact, makes the game playable at all
2. **Phase 3** (Touch targets) — makes buttons usable
3. **Phase 4** (Hide hotkeys) — quick win, removes clutter
4. **Phase 5** (Fix hover) — prevents confusing stuck states
5. **Phase 2** (Responsive layout) — biggest chunk of work, but the game is *usable* without it on tablets
6. **Phase 7** (Scrollable panels) — needed once panels overflow on smaller screens
7. **Phase 6** (Orientation) — nice-to-have
8. **Phase 8** (Font sizes) — polish
9. **Phase 9** (Start screen) — polish

Phases 3–5 are small CSS-only changes that can be batched into one commit.

---

## Testing Checklist

After implementation, verify on:

- [ ] Desktop Chrome (no regressions)
- [ ] iPad Safari (landscape + portrait)
- [ ] iPad Chrome
- [ ] iPhone Safari (landscape)
- [ ] iPhone Chrome (landscape)
- [ ] Android tablet Chrome
- [ ] Android phone Chrome (landscape)

Test these interactions on each:
- [ ] Pan map with one finger
- [ ] Pinch zoom in/out
- [ ] Tap property → panel opens
- [ ] Tap district → info shows
- [ ] Tap End Turn → turn advances
- [ ] Open/close all panels (bank, stats, staff, filter, portfolio, log, achievements, menu)
- [ ] Read newspaper
- [ ] Auction bidding
- [ ] Start new game from start screen
- [ ] Tutorial flow

### Browser DevTools shortcut

Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M) → select device preset. This simulates touch events and viewport sizes. Not a replacement for real device testing but useful for rapid iteration.

---

## Notes

- The cheat panel can be ignored for mobile (it's a developer tool).
- The music/SFX controls should remain accessible — don't hide them entirely, just shrink them.
- The game already uses `flex: 1` on the canvas, so it will naturally fill available space as chrome shrinks.
- All changes should be purely additive (media queries, new event listeners) — no desktop regressions.
