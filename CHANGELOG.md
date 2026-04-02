# Helsingin Herra - Changelog

## v0.8.5 — Victory Screen, Cheats & Trophies (2026-04-02)

### Added
- **Victory screen overhaul** — proper overlay instead of browser alert
  - 10 end-game stats: Net Worth, Cash, Properties, Portfolio Value, Monthly Revenue, Total Earned, Loan, Staff, Avg Condition, Time Played
  - **Up to 3 trophies** awarded based on playstyle:
    - Speed Runner (won in ≤60 turns)
    - Maintenance King / Slumlord (avg condition ≥75% or <25%)
    - Type specialist: Retail Baron, Restaurant Mogul, Hotel Magnate, Office Tycoon, Housing King
    - Fully Upgraded (avg upgrade ≥ Lv.3)
    - Empire Builder (30+ properties)
    - Debt Free, Cash Machine (2x win target earned), Diversified (4+ types)
  - **Continue Playing** button to keep going after winning
- **Cheat system** — press **Ctrl+Shift+C** to toggle the cheat panel
  - Add money: +€10K, +€100K, +€1M
  - Free Buy Mode: buy one property for free (toggles off after use)
  - Repair All: set all owned properties to 100% condition
  - Max Upgrade All: upgrade all owned properties to max level
- **Campaign target selector** — Short (€50M ~1 hr), Medium (€100M ~1.5 hrs), Long (€200M ~2.5 hrs)

### Changed
- **Victory fanfare** — new brass-style fanfare with call-and-answer pattern, major chord finale, and shimmer flourish
- **Cash Machine trophy** — now scales to 2x win target instead of fixed €100M
- **Upgrade feedback** — upgrading shows revenue increase in ticker and log

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
- Staff state saved and loaded with game saves
- **End Turn hotkey** changed from Enter to **Spacebar**
- **Changelog viewer** on the start screen — embedded changelog viewable without needing to open files

### Changed
- **Upgrade feedback** — upgrading a property now shows the revenue increase in the ticker and log (e.g. "Revenue +€1.5K/mo")

---

## v0.7.5 — Portfolio Repairs & Event Fixes (2026-04-02)

### Added
- **Repair button in portfolio** — each property row now has a repair button showing the cost
  - Click to repair without leaving the portfolio view; table re-renders immediately
  - Disabled when condition ≥ 95%, not enough money, or no actions remaining
  - Shows "OK" in green when property is in good condition
- **Average ROI** in portfolio summary bar (alongside property count, total value, total revenue, avg condition)

### Fixed
- **Market Crash now actually works** — global `valueModifier` was silently skipped because it only checked `affectedDistricts`; now applies to all properties when `global: true`
- **Market Crash prices recover** — after 6 months, property values return to base price (previously the drop was permanent)
- **Alien Invasion & Market Crash recovery** — `tickEvents` now handles global recovery, not just district-scoped events
- **Event ticker shows recovery info** — Market Crash: "prices recover after"; Alien Invasion: "recovers to 150% of original"
- **Event descriptions clarified** — Market Crash and Alien Invasion now explain duration and recovery in their text

### Changed
- **Pipe Burst scales with property condition** — avg condition ≥ 90% = immune; lower condition increases both chance and cost
- Pipe Burst description reminds player to keep properties maintained

---

## v0.7.4 — Panels, Property Hotkeys & Smart Pipe Bursts (2026-04-02)

### Changed
- **Stats panel** — replaced browser `alert()` with a proper in-game panel matching the bank/filter style
  - Shows net worth, cash, properties, portfolio value, revenue/mo, loan, total earned
  - Rival rankings and campaign progress
  - Auto-refreshes when game state changes
- **Menu panel** — replaced browser `prompt()` with a proper in-game panel
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
  - Hotkey hints `[1]` `[2]` `[3]` `[4]` shown on buttons
- **Stats and Menu toggle** — pressing **S** or **M** again closes the panel (consistent with other panels)

---

## v0.7.2 — Hotkeys, Warnings & Polish (2026-04-02)

### Added
- **Keyboard hotkeys** for all action bar buttons:
  - **Enter** — End Turn, **B** — Bank, **S** — Stats, **P** — My Props, **L** — Log, **F** — Filter, **M** — Menu
  - **Escape** — Close any open panel
  - Hotkey letters highlighted in gold on buttons; disabled on start screen and in input fields
- **Condition warnings** — properties below 25% condition now show `⚠` alerts in the news ticker and turn log (red)
- **Scrolling news ticker** — long messages now scroll in a continuous loop instead of being clipped; speed scales with text length

### Fixed
- **Upgrade revenue always visible** — upgrading now guarantees at least €1K revenue increase per level
- **Property panel refreshes after end turn** — buy/upgrade/repair buttons correctly enable when income brings enough cash
- **Author name typo** — corrected to Schwerbelastung

---

## v0.7.1 — Bug Fixes (2026-04-02)

### Fixed
- **Upgrade revenue always visible** — upgrading now guarantees at least €1K revenue increase per level; cheap properties no longer show unchanged revenue after upgrade
- **Property panel refreshes after end turn** — buy/upgrade/repair buttons now correctly enable when income brings enough cash mid-turn
- **News ticker fully visible** — canvas flex child now uses `min-height: 0` to prevent it from overflowing the viewport in fullscreen

---

## v0.7.0 — Helsingin Herra (2026-04-02)

### Changed
- **Renamed to Helsingin Herra** — splash screen shows "(Lord of Helsinki)" subtitle and author credit (Schwerbelasting) with version number
- **Win screen** updated: "You are the Helsingin Herra — Lord of Helsinki!"
- **Turquoise water** — all seasons now use teal/turquoise tones instead of dark navy, matching real Helsinki maps
  - Summer brightest (`#2a7a8a`), winter coolest (`#1a4a5a`)
- **Sound volumes boosted** — master gain, music, SFX, melody and harmony notes all roughly doubled for better audibility
- **Road positions corrected** — Mannerheimintie, Bulevardi, Hämeentie, Aleksanterinkatu, Mechelininkatu, Runeberginkatu all repositioned to match real Helsinki geography
- **Kuusisaari** repositioned to northeast of Lehtisaari (was incorrectly west)

### Fixed
- **Safari audio silence** — added explicit `setValueAtTime()` before all `exponentialRampToValueAtTime()` calls; Safari requires this or gain jumps to near-zero immediately
- **News ticker hidden** — canvas `resize()` used hardcoded pixel offset (`container.clientHeight - 120`) that didn't account for the new scoreboard bar; now reads the flex-computed size via `getBoundingClientRect()`
- **Safari viewport clipping** — added `100dvh` fallback for Safari's dynamic viewport height

### Added
- **Rival scoreboard bar** below the HUD showing player and all AI rivals at a glance
  - Color-coded dots matching each rival's map marker color
  - Shows net worth and property count for each competitor
  - Player highlighted in gold, sorted by net worth
  - Updates every turn and after every action
- Cache-busting version strings on all script tags

---

## v0.6.5 — Rival Scoreboard (2026-04-02)

### Added
- **Scoreboard bar** below the HUD showing player and all AI rivals at a glance
  - Color-coded dots matching each rival's map marker color
  - Shows net worth and property count for each competitor
  - Player highlighted in gold, sorted by net worth
  - Updates every turn and after every action

---

## v0.6.4 — New Districts & Coastline Refinement (2026-04-02)

### Added
- **Kalasatama** — modern development area east of Sörnäinen with REDI Shopping Centre, tower apartments, and office space (prestige 3)
- **Sompasaari** — new residential peninsula south of Kalasatama with converted loft apartments and a waterfront bistro (prestige 3)
- **Kaivopuisto** — carved out of Ullanlinna as its own district; grand park area with embassy row villas and Café Ursula (prestige 5)
- **Kuusisaari** — tiny exclusive island west of Kaskisaari with luxury private villas (prestige 5), rendered as a separate landmass
- 9 new named properties across the four districts
- Street names for procedural generation in all new districts
- Sörnäisten rantatie road connecting east coast districts
- REDI Centre and Kaivopuisto Observatory landmarks

### Changed
- **East coastline refined** — Sompasaari now reads as a distinct peninsula jutting into the sea; Kalasatama harbour has a visible indentation
- **Sörnäinen eastern boundary** tightened to make room for Kalasatama
- **Ullanlinna southern boundary** trimmed to carve out Kaivopuisto
- Kalasatama and Sompasaari added to office-eligible procedural generation
- Total districts: 23 (was 19)

---

## v0.6.3 — Bank Panel Overhaul (2026-04-02)

### Changed
- **Bank is now a proper panel** instead of browser prompt/confirm dialogs
  - Shows current loan, available credit, interest rate, and monthly payment at a glance
  - **Withdraw buttons**: +€10K, +€100K, +€1M — click to borrow in increments
  - **Repay buttons**: -€10K, -€100K, -€1M, and **Repay All**
  - Buttons disable automatically when you can't afford them or would exceed credit limit
  - Panel stays in sync with game state (updates after every action and turn)
- **Incremental borrowing** — players can now take additional loans on top of existing ones (up to 2× net worth total)
- Bank panel auto-closes when opening a property panel, and vice versa

### Fixed
- Bank loan countdown now shows "unlock in X turns" instead of unhelpful "after month 3"
- Exact-amount loan rejection bug (floating-point mismatch between UI and backend)

---

## v0.6.2 — Save / Load (2026-04-01)

### Added
- **Two independent save slots** stored in localStorage:
  - **Auto-save** — automatically saved at end of every turn; always tracks the latest state
  - **Manual save** — player-triggered via Menu > SAVE; preserved independently so you can save, play forward, then LOAD to go back in time
- **Continue button** on the start screen — loads auto-save (most recent turn) to pick up where you left off; shows info for both save slots
- **Menu save commands** — click "Menu" and type SAVE, LOAD, or DELETE to manage the manual save
- Full game state is preserved: money, properties (positions, conditions, upgrades, ownership), rivals, active events, loan, turn counter

### Changed
- Menu panel now shows both auto-save and manual save status

---

## v0.6.1 — Property Portfolio View (2026-04-01)

### Added
- **"My Props" button** in the action bar opens a full-screen portfolio overlay
- **Sortable table** of all player-owned properties showing:
  - Name, Type, District, Value, Revenue/mo, ROI%, Condition, Upgrade Level
  - Click any column header to sort ascending/descending
  - Active sort column shows a triangle indicator
- **Summary bar** at the top: total properties, total value, total revenue/mo, average condition
- **Condition color coding**: green (75%+), yellow (50-74%), orange (25-49%), red (<25%)
- **Click any row** to close the portfolio and open that property's detail panel on the map
- Empty state message when no properties owned yet

---

## v0.6.0 — Music & Sound Effects (2026-04-01)

### Added
- **Procedural ambient music** — relaxing background music synthesized via Web Audio API, no audio files needed
  - **Season-aware**: music changes mood with the seasons
    - Winter: low D minor pentatonic, slow and contemplative
    - Spring: C major pentatonic, fresh and awakening
    - Summer: high G major pentatonic, bright and warm
    - Autumn: A minor pentatonic, mellow and warm
  - Occasional bass drones and harmonies for atmospheric depth
  - Music seamlessly transitions when seasons change
- **Sound effects** for all game actions:
  - Buy property (cash register ascending chime)
  - Sell property (descending tones)
  - Upgrade property (rising shimmer)
  - Repair property (percussive hammer taps)
  - End turn (soft double chime)
  - Take/repay loan (low confirmation tone)
  - UI button clicks
  - Game start fanfare
- **Event sound effects**:
  - Positive events: bright ascending chime
  - Negative events: ominous descending + low rumble
  - Alien invasion: sci-fi frequency sweep + eerie tones
  - Rival purchases: subtle low alert
- **Victory fanfare** (triumphant major scale) and **bankruptcy sound** (sad descent)
- **Music and SFX toggle buttons** in the top HUD bar — independent on/off control
  - Buttons dim when muted for clear visual feedback

---

## v0.5.6 — Turn Log & Richer Event Info (2026-04-01)

### Added
- **Turn log panel** — click "Log" in the action bar to see a scrollable history of every month
  - Shows finances (revenue, maintenance, loan payments, net income)
  - Shows event details with actual effects (revenue %, property value changes, affected districts, duration)
  - Shows rival purchases
  - Tracks your own actions (buy, sell, upgrade, repair)
  - Color-coded: green for income, red for losses, blue for positive events, orange for negative, purple for special events
  - Keeps up to 120 months of history (10 years)
- Log and Filter panels auto-close each other (they share the left panel area)

### Changed
- **Event notifications are now informative** — the news ticker and log show actual mechanical effects:
  - Revenue modifiers (e.g. "+20% revenue")
  - Property value changes (e.g. "-15% property values")
  - Maintenance cost increases (e.g. "+50% maintenance costs")
  - Emergency costs (e.g. "-€25K emergency cost")
  - Affected districts or "city-wide" scope
  - Duration for multi-month events

---

## v0.5.5 — More Starter Properties & Rival Options (2026-04-01)

### Added
- **15 new affordable properties** across Helsinki for a better early game:
  - R-kioski stands in Kamppi, Sörnäinen, Hakaniemi (€45K–€60K)
  - Food truck spot in Jätkäsaari (€35K)
  - Neighborhood businesses: pizzerias, barbershops, bakeries, tattoo studios, laundromats, flower shops, kebab shops, vinyl bars, gyms, massage studios, antique shops (€65K–€180K)
- **AI Rival count selector** on the start screen — choose 0, 1, 2, or 3 opponents
  - Defaults to 3 (all rivals) for the classic experience
  - 0 rivals = peaceful sandbox, no competition for properties

### Fixed
- **€NaN bug** — events without a `revenueModifier` (Market Crash, Harsh Winter, Alien Invasion) caused revenue calculation to produce NaN, corrupting the money counter

---

## v0.5.4 — Map Filters (2026-04-01)

### Added
- **Map filter panel** — toggle with the "Filter" button in the action bar
  - **Type filter**: highlight only Retail, Restaurant, Residential, Office, or Hotel properties
  - **Price filter**: categorical ranges — Under €200K, €200K–€1M, €1M–€5M, €5M–€20M, €20M+
  - **Ownership filter**: show only For Sale, Mine, or Rival-owned properties
- Non-matching properties are dimmed to ~15% opacity so matching ones stand out clearly
- Filter button glows when any filter is active, so you always know filters are on
- Filter panel on the left side of the map, property panel stays on the right

---

## v0.5.3 — Property Spacing & Landmark Tooltips (2026-04-01)

### Fixed
- Properties no longer overlap — a spacing algorithm pushes nearby markers apart (minimum 14 units) after generation, keeping named properties in place and nudging procedural ones
- Named properties (real businesses) stay at their real-world coordinates; only procedural ones get repositioned

### Added
- **Landmark hover tooltips** — mousing over landmarks (churches, monuments, buildings) now shows their name in a yellow tooltip with a glowing ring highlight
- Landmarks are checked in the hover priority chain: properties > landmarks > districts

---

## v0.5.2 — New Districts & Road Fix (2026-04-01)

### Added
- **Kaskisaari** — exclusive island north of Lauttasaari with ultra-luxury villas (prestige 5, €5-8M properties)
- **Lehtisaari** — upscale residential island north of Kaskisaari with waterfront homes, a café, and a corner shop
- **Hernesaari** — industrial peninsula east of Jätkäsaari with Löyly sauna restaurant, heliport, and warehouse space; no residential real estate (yet)
- 8 new named properties across the three districts
- Street name data for procedural generation in new districts

### Changed
- Roads are now much subtler — thinner lines with lower opacity so they don't dominate the map
- Removed road shadow effect that was making roads appear as thick dark grey lines
- Kaskisaari and Lehtisaari render as separate island landmasses (visible water gap from mainland)

---

## v0.5.1 — Map Overhaul (2026-04-01)
Major rework of the Helsinki map to be geographically accurate and recognizable.

### Changed
- **Coastline**: Helsinki is now correctly rendered as a peninsula — land extends off the top of the map (mainland Finland), with water to the south, east, and west
- **Lauttasaari**: Now a properly separated island with a visible water strait between it and the mainland
- **Peninsulas**: Jätkäsaari, Hernesaari, Katajanokka, and Kaivopuisto all read as distinct peninsulas/tips jutting into the sea
- **Map bounds**: Widened from 1200x900 to 1400x1005 units to fit the improved geography

### Added
- **Water bodies**: Töölönlahti, South Harbour, Eläintarhanlahti, Hietalahti dock, and Lapinlahti bay now cut visibly into the landmass
- **Small islands**: Seurasaari, Harakka, Valkosaari, Luoto rendered as decorative features
- **Parks**: Kaisaniemi Park, Sinebrychoff Park, Hietaniemi Beach, Sibelius Park, Tähtitorninmäki
- **Roads**: Mechelininkatu, Runeberginkatu, Lauttasaarentie added; major roads (Mannerheimintie, Hämeentie) now render wider
- **Landmarks**: Uspenski Cathedral, Oodi Library, Sibelius Monument, Olympic Stadium
- **Visual effects**: Coast shadow/depth effect, road shadows, distinct landmark shapes (pointed roofs for churches, circles for monuments), improved wave rendering

---

## v0.5.0 — Full Core Game (2026-04-01)
All core systems implemented in a single session. Game is fully playable.

### Added
- **Map**: Scrollable/zoomable Helsinki map with 16 real districts
  - Approximate real geography using lat/lon coordinate mapping
  - Seasonal visual palettes (winter snow, summer green, autumn colors, spring)
  - Minimap in top-right corner
  - Water with wave effect, parks, major roads, landmarks
  - District hover highlighting and labels
- **Properties**: 33 named real Helsinki businesses + procedural generation
  - Real businesses: Stockmann, Fazer Café, Hotel Kämp, Marimekko, Savoy, etc.
  - Types: retail, restaurant, hotel, office, residential, landmark
  - Procedural residential apartments, shops, offices per district
  - Upgrade system (5 levels), condition degradation, repairs
- **Economy**: Full financial system
  - Monthly revenue collection based on type, condition, season, events
  - Maintenance costs (higher in winter)
  - Bank loans (unlock after month 3, up to 2x net worth)
  - 15% transaction fee on property sales
- **Seasons**: 4 seasons with economic impact
  - Hotel/restaurant boost in summer, retail boost in winter (Christmas)
  - Visual map changes per season
- **Events**: 16 events with real economic effects
  - Positive: Flow Festival, Slush, Pride, Christmas Market, Vappu, Design Week, Helsinki Festival, Lux Helsinki
  - Negative: Recession, construction, pipe burst, tenant dispute, harsh winter, market crash
  - Special: Alien Invasion (~2% chance/year)
- **AI Rivals**: 3 personality-driven competitors
  - Björn "Nalle" Wahlroos — premium property hunter
  - Harry "Hjallis" Harkimo — entertainment focus
  - Risto Siilasmaa — tech/office investor
  - Difficulty-scaled capital and aggressiveness
- **UI**: Complete game interface
  - Start screen with capital/difficulty/mode selection
  - HUD showing money, properties, turn, season
  - Property detail panel with buy/sell/upgrade/repair
  - Action bar with end turn, bank, stats, menu
  - News ticker for events and rival actions
- **Game Modes**: Campaign (reach €50M) and Sandbox (endless)
- **Difficulty**: Easy (4 actions, weak AI) / Normal / Hard (aggressive AI, high interest)

---

## Planned Future Versions

### v0.7.0 — UI Polish
- [ ] Replace alert/prompt dialogs with proper in-game panels
- [ ] Better stats screen with graphs
- [ ] Richer property tooltips

### v0.9.0 — Visual Polish
- [ ] Pixel art sprites for buildings
- [ ] Alien invasion visual effects
- [ ] Animated transitions between seasons
- [ ] Better property markers by type

### v1.0.0 — Release
- [ ] Bidding wars with rivals
- [ ] Balance tuning
- [ ] Achievement system
- [ ] Mobile/touch support
- [ ] Tutorial/help system
