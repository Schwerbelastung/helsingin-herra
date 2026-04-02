// Auto-generated from CHANGELOG.md — update when releasing new versions
const CHANGELOG_MD = `## v0.8.5 — Victory Screen, Cheats & Trophies (2026-04-02)

### Added
- **Victory screen overhaul** — proper overlay with 10 end-game stats and up to 3 trophies
  - Trophies: Speed Runner, Maintenance King/Slumlord, type specialists, Fully Upgraded, Empire Builder, Debt Free, Cash Machine, Diversified
  - Continue Playing button to keep going after winning
- **Cheat system** — press **Ctrl+Shift+C** to toggle cheats: add money, free buy, repair all, max upgrade all
- **Campaign target selector** — Short (€50M ~1 hr), Medium (€100M ~1.5 hrs), Long (€200M ~2.5 hrs)

### Changed
- **Victory fanfare** — new brass-style fanfare with call-and-answer pattern and shimmer flourish
- **Cash Machine trophy** scales to 2x win target instead of fixed €100M
- **Upgrade feedback** shows revenue increase in ticker and log

---

## v0.8.1 — Campaign Duration (2026-04-02)

### Added
- **Campaign target selector** — choose Short (€50M ~1 hr), Medium (€100M ~1.5 hrs), or Long (€200M ~2.5 hrs)
  - Estimates based on ~20 sec average per turn, with compounding income making later milestones faster
  - Target section hides when Sandbox mode is selected

---

## v0.8.0 — Staff System (2026-04-02)

### Added
- **Staff system** — hire and fire employees from the new **Staff** panel (hotkey **T**)
  - **Maintenance Person** — repairs one random damaged property to 100% each turn at 50% cost
  - **Property Manager** — +1 action per turn
  - **Accountant** — reduces loan interest rate by 1.5%
  - **Scout** — reveals the best available deal (highest ROI) in the news ticker each turn
- Each staff member has a **hiring fee** (3x monthly salary) and **monthly salary** that scales with game progress
- Staff salaries shown in turn summary ticker, turn log, and stats panel
- Bank panel shows reduced interest rate when accountant is hired
- **End Turn hotkey** changed from Enter to **Spacebar**
- **Changelog viewer** on the start screen

### Changed
- **Upgrade feedback** — upgrading a property now shows the revenue increase in the ticker and log

---

## v0.7.5 — Portfolio Repairs & Event Fixes (2026-04-02)

### Added
- **Repair button in portfolio** — each property row now has a repair button showing the cost
  - Click to repair without leaving the portfolio view; table re-renders immediately
  - Disabled when condition ≥ 95%, not enough money, or no actions remaining
  - Shows "OK" in green when property is in good condition
- **Average ROI** in portfolio summary bar (alongside property count, total value, total revenue, avg condition)

### Fixed
- **Market Crash now actually works** — global valueModifier was silently skipped because it only checked affectedDistricts; now applies to all properties when global
- **Market Crash prices recover** — after 6 months, property values return to base price (previously the drop was permanent)
- **Alien Invasion & Market Crash recovery** — tickEvents now handles global recovery, not just district-scoped events
- **Event ticker shows recovery info** — Market Crash: "prices recover after"; Alien Invasion: "recovers to 150% of original"
- **Event descriptions clarified** — Market Crash and Alien Invasion now explain duration and recovery in their text

### Changed
- **Pipe Burst scales with property condition** — avg condition ≥ 90% = immune; lower condition increases both chance and cost
- Pipe Burst description reminds player to keep properties maintained

---

## v0.7.4 — Panels, Property Hotkeys & Smart Pipe Bursts (2026-04-02)

### Changed
- **Stats panel** — replaced browser alert() with a proper in-game panel matching the bank/filter style
  - Shows net worth, cash, properties, portfolio value, revenue/mo, loan, total earned
  - Rival rankings and campaign progress
  - Auto-refreshes when game state changes
- **Menu panel** — replaced browser prompt() with a proper in-game panel
  - SAVE, LOAD, DELETE buttons (LOAD/DELETE disabled when no save exists)
  - Save slot info displayed inline
  - Controls help text at the bottom
- **All right-side panels** (property, bank, stats, menu) now close each other — no more overlap
- **Pipe Burst now scales with property condition**:
  - Average condition ≥ 90%: completely immune — no pipe bursts
  - Lower condition increases both chance (up to 6%) and cost (up to €50K)
  - Event text now reminds player to keep properties maintained
- Disabled style for menu LOAD/DELETE buttons when no save exists

### Added
- **Property panel hotkeys** — when a property panel is open:
  - **1** — Buy, **2** — Sell, **3** — Upgrade, **4** — Repair
  - Keys only activate when the corresponding button is visible and enabled
  - Hotkey hints [1] [2] [3] [4] shown on buttons
- **Stats and Menu toggle** — pressing **S** or **M** again closes the panel (consistent with other panels)

---

## v0.7.2 — Hotkeys, Warnings & Polish (2026-04-02)

### Added
- **Keyboard hotkeys** for all action bar buttons:
  - **Space** — End Turn, **B** — Bank, **S** — Stats, **P** — My Props, **L** — Log, **F** — Filter, **M** — Menu
  - **Escape** — Close any open panel
  - Hotkey letters highlighted in gold on buttons; disabled on start screen and in input fields
- **Condition warnings** — properties below 25% condition show alerts in the news ticker and turn log
- **Scrolling news ticker** — long messages now scroll in a continuous loop instead of being clipped; speed scales with text length

### Fixed
- **Upgrade revenue always visible** — upgrading now guarantees at least €1K revenue increase per level
- **Property panel refreshes after end turn** — buy/upgrade/repair buttons correctly enable when income brings enough cash
- **Author name typo** — corrected to Schwerbelastung

---

## v0.7.0 — Helsingin Herra (2026-04-02)

### Changed
- **Renamed to Helsingin Herra** — splash screen shows "(Lord of Helsinki)" subtitle and author credit with version number
- **Turquoise water** — all seasons now use teal/turquoise tones matching real Helsinki maps
- **Sound volumes boosted** — master gain, music, SFX all roughly doubled for better audibility
- **Road positions corrected** — all major streets repositioned to match real Helsinki geography
- **Kuusisaari** repositioned to northeast of Lehtisaari

### Fixed
- **Safari audio silence** — added explicit setValueAtTime() before all exponentialRampToValueAtTime() calls
- **News ticker hidden** — canvas resize now reads flex-computed size via getBoundingClientRect()

### Added
- **Rival scoreboard bar** below the HUD showing player and all AI rivals at a glance
- Cache-busting version strings on all script tags

---

## v0.6.4 — New Districts & Coastline Refinement (2026-04-02)

### Added
- **Kalasatama** — modern development area east of Sörnäinen
- **Sompasaari** — new residential peninsula south of Kalasatama
- **Kaivopuisto** — carved out of Ullanlinna as its own district
- **Kuusisaari** — tiny exclusive island with luxury private villas
- 9 new named properties across the four districts
- Total districts: 23

---

## v0.6.3 — Bank Panel Overhaul (2026-04-02)

### Changed
- **Bank is now a proper panel** instead of browser prompt/confirm dialogs
  - Withdraw buttons: +€10K, +€100K, +€1M
  - Repay buttons: -€10K, -€100K, -€1M, and Repay All
- **Incremental borrowing** — take additional loans on top of existing ones (up to 2x net worth)

---

## v0.6.2 — Save / Load (2026-04-01)

### Added
- **Two independent save slots** stored in localStorage: auto-save and manual save
- **Continue button** on the start screen to pick up where you left off
- Full game state is preserved

---

## v0.6.1 — Property Portfolio View (2026-04-01)

### Added
- **"My Props" button** opens a full-screen sortable portfolio table
- Summary bar with total properties, value, revenue, and condition
- Click any row to open that property on the map

---

## v0.6.0 — Music & Sound Effects (2026-04-01)

### Added
- **Procedural ambient music** via Web Audio API — season-aware, no audio files needed
- **Sound effects** for all game actions, events, victory, and bankruptcy
- **Music and SFX toggle buttons** in the HUD

---

## v0.5.6 — Turn Log & Richer Event Info (2026-04-01)

### Added
- **Turn log panel** — scrollable history of every month with finances, events, and rival actions
- **Event notifications** now show actual mechanical effects (revenue %, value changes, duration)

---

## v0.5.5 — More Starter Properties & Rival Options (2026-04-01)

### Added
- **15 new affordable properties** across Helsinki for a better early game
- **AI Rival count selector** on the start screen — choose 0 to 3 opponents

---

## v0.5.4 — Map Filters (2026-04-01)

### Added
- **Map filter panel** — filter by property type, price range, and ownership

---

## v0.5.3 — Property Spacing & Landmark Tooltips (2026-04-01)

### Fixed
- Properties no longer overlap — spacing algorithm pushes nearby markers apart

### Added
- **Landmark hover tooltips** with glowing ring highlight

---

## v0.5.2 — New Districts & Road Fix (2026-04-01)

### Added
- **Kaskisaari**, **Lehtisaari**, **Hernesaari** districts with 8 new named properties
- Subtler road rendering

---

## v0.5.1 — Map Overhaul (2026-04-01)

### Changed
- Helsinki now correctly rendered as a peninsula with accurate coastline
- Lauttasaari as a separate island
- Added water bodies, parks, roads, landmarks, and visual effects

---

## v0.5.0 — Full Core Game (2026-04-01)

All core systems implemented. Game is fully playable with map, properties, economy, seasons, events, AI rivals, and UI.
`;
