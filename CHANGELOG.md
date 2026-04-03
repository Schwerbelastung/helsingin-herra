# Helsingin Herra - Changelog

## v0.12.0 — Mysteries of Helsinki (2026-04-03)

### Added
- **8 rare special events** — strange and wonderful things may happen in Helsinki when you least expect them
  - Some appear only in certain seasons or months
  - Some affect the whole city, others target specific districts or property types
  - Each has unique animated visuals and sound effects
  - One features a press release dialog with a familiar face
- **2-month cooldown** between special events — no more clustering
- **One-time events** — certain surprises can only happen once per campaign
- **Seasonal cheat protection** — trying to cheat a seasonal event out of season gives a cryptic hint instead
- **Easter egg cheat button** — trigger a random special event from the cheat panel (Ctrl+Shift+C)

### Changed
- Special event chances reduced ~30% — expect 0-1 per year instead of 1-2
- Cheat ticker messages now hint at where to look without spoiling the surprise

---

## v0.11.0 — Bidding Wars (2026-04-03)

### Added
- **Bidding Wars** — 3% chance per turn that a property goes to auction
  - Properties are weighted toward ones that AI rivals actually want, ensuring competitive bidding
  - Works with any number of AI rivals (1-3)
  - Interactive 3-round bidding: raise or drop out each round
  - Pixel art portraits of all participating rivals shown with live status
  - Player portrait with green suit and € symbol
  - Rivals use smart bidding AI: budget-aware, strategy-driven, with probabilistic dropout
  - Property stats displayed in the auction window
  - Dramatic golden-bordered UI with pulsing lightning bolt headers
- **Auction sound design**: gavel strike, bid chimes, rival raises, dropout sounds, win/lose fanfares
- **Tense auction background music** — pulsing bass drone with rhythmic heartbeat pattern

---

## v0.10.2 — Sprites, Animations & Balance (2026-04-03)

### Added
- **Kiasma** landmark with curved modern museum sprite
- **Animated Töölönlahti fountain** — water jets oscillate, droplets orbit; frozen in winter
- **Food truck sprite** for Jätkäsaari Food Truck Spot — red truck with serving window and awning
- **Löyly sauna sprite** — wooden sauna building with chimney smoke

### Changed
- **Actions per turn** — Normal: 4 (was 3), Easy: 5 (was 4), Hard: 3 (unchanged)
- **Citymarket Ruoholahti** nudged southwest
- **Löyly** nudged southeast, duplicate removed
- Replaced Mannerheim statue decoration with Kiasma landmark

---

## v0.10.1 — Landmarks & Fixes (2026-04-03)

### Added
- **Tähtitorninmäki Observatory** landmark north of Kaivopuisto with dome + telescope sprite
- **Seurasaari Open-Air Museum** landmark — red Finnish wooden cottage on northern Seurasaari
- **Löyly sauna sprite** — Löyly now renders as a sauna building with chimney smoke

### Changed
- **Seurasaari bridge** repositioned from north edge of island to mainland NE
- **Suomenlinna ferry** slower and pauses 6 seconds at each end
- **Lighthouse Island** moved further west
- **Weather effects** shortened to 5 seconds

### Fixed
- Removed duplicate Löyly property and orphaned sauna decoration
- Observatory positions corrected (Kaivopuisto SW, Tähtitorninmäki N)

---

## v0.10.0 — Rival Offers, Animations & Weather (2026-04-03)

### Added
- **Rival offers** — AI rivals occasionally propose to buy your properties at a premium or sell theirs at a discount
  - Offer dialog with pixel art portraits of Björn, Hjallis, and Risto
  - Accept or decline with keyboard (Enter/Escape) or buttons
- **Animated seagulls** — seagulls now drift and circle over the water
- **Moving Suomenlinna ferry** — the ferry glides back and forth between Market Square and Suomenlinna
- **Weather effects** — temporary rain, snow, or sunshine particles on season changes (30% chance)
- **Undo button** — undo your last action (buy/sell/upgrade/repair) before ending the turn (hotkey **U**)
- **Offer sound effect** — doorbell chime when a rival makes an offer

---

## v0.9.4 — Position Fixes (2026-04-03)

### Fixed
- **Story restaurant** nudged northwest — no longer partially in the ocean
- **Market Square tents** nudged northwest to match corrected position

---

## v0.9.3 — Decorations, Islands & Surprises (2026-04-03)

### Added
- **Korkeasaari Zoo island** south of Mustikkamaa — with zoo gate, lion, brown bear, and penguin sprites
- **Seurasaari island** — open-air museum island with label and pedestrian bridge
- **6 new islands**: Sirpalesaari, Liuskasaari, Uunisaari, Särkkä south of Ullanlinna; **Harakka** (labeled); Lighthouse Island NW of Suomenlinna
- **6 new bridges**: Korkeasaari, Mustikkamaa-Kulosaari, Lauttasaari-Kaskisaari, Kaskisaari-Lehtisaari, Lehtisaari-Kuusisaari, Seurasaari
- **Tali DiscGolfPark** landmark — frisbee golfer throwing at a basket
- **Water decorations**: 4 sailboats, rowing boat, 3 buoys, 6 seagulls, 10 wave clusters
- **Töölönlahti** water body label, fountain, and paddle boat (hidden in winter)
- **Land decorations**: Helsinki tram, Mannerheim statue, Helsinki Wheel, market square tents, sauna with smoke puffs
- **Christmas tree** on Senate Square (winter only, with ornaments and star)
- **Bushes** along Esplanadi, Kaivopuisto, and Sinebrychoff park edges
- **Moose** in the northern green area
- **Rare winter surprise** — something unusual may appear along the coastline during winter...
- **Lighthouse** on tiny island NW of Suomenlinna
- **Citymarket Ruoholahti** — new retail property
- **Lauttasaari Beach** landmark on the south coast
- **Lauttasaari Pizzeria** and **Lauttasaari S-Market** — new properties spread across the island

### Changed
- **Lauttasaari property spread** — procedural properties now scatter across the full district polygon, not just the center
- **Bushes** are now larger and visually distinct darker green with highlights
- Improved winter surprise sprite and spawn behavior
- **Korkeasaari zoo** layout — gate shifted north, animals shifted south for better spacing

### Fixed
- **Buoy on land** — moved the Ullanlinna buoy from land to water south of the coast
- **Seurasaari position** — moved island south to correct geographic location
- **Duplicate Seurasaari** island entries merged into one

---

## v0.9.2 — Season Transitions & Achievements (2026-04-03)

### Added
- **Animated season transitions** — when the season changes, all map colors smoothly blend from old to new palette over ~1.2 seconds
  - Season banner with icon appears briefly (e.g. "❄ WINTER ❄", "☀ SUMMER ☀")
  - Snow/no-snow switch happens at the midpoint of the transition
- **Achievement system** — 32 persistent achievements stored in localStorage across games
  - **Getting started**: First Steps, The Art of the Deal, Home Improvement
  - **Property milestones**: Landlord (5), Real Estate Mogul (15), Empire Builder (30)
  - **Money milestones**: Millionaire (€1M cash), Multi-Millionaire (€10M), Helsinki Tycoon (€50M net worth), Untouchable (€100M), Helsingin Herra (€200M)
  - **District-specific**: Hipster Investor (Kallio), High Society (Eira), Island Life (island district)
  - **Portfolio**: Diversified Portfolio (all types), Fully Loaded (Lv.5), Pristine Empire (10+ properties above 90%)
  - **Economy**: Leverage, Debt Free, Cash Flow (€100K/mo), Money Printer (€1M/mo)
  - **Staff**: Team Player (first hire), Full House (all 4)
  - **Campaign**: Warm-Up (Easy win), Contender (Normal), Master Tycoon (Hard), Speed Runner (≤60 turns)
  - **Fun**: Close Encounter, Easter Egg Hunter, Dedicated (50 turns), Marathon Runner (100 turns)
- **Achievement notification toast** — slides in at the top of the screen when an achievement is unlocked
- **Achievements panel** — press **A** or click the Achievements button to see all achievements, unlocked and locked
- Locked achievements show as "???" until discovered

---

## v0.9.1 — Tycoon Advisor & Landmark Sprites (2026-04-03)

### Added
- **Tycoon Advisor** — pixel art Monopoly Man-style character with top hat, monocle, and mustache replaces the minimap in the top-right corner
  - Displays rotating tips, jokes, and Helsinki-themed quips every turn
  - Contextual advice based on game state (low cash, bad condition, nearing victory, etc.)
  - ~50% chance to comment on player actions: buying, selling, upgrading, and repairing
  - 30+ general tips and 25+ action-specific reactions
- **Custom landmark sprites**:
  - Linnanmäki — rollercoaster with arched rails, support beams, and a cart
  - Hietaniemi Beach — beach umbrella with striped canopy and waves
  - Allas Sea Pool — floating pool with sauna building and steam
  - Olympic Stadium — oval stadium with green field and iconic tower
  - Sibelius Monument — vertical organ pipes on a stone base
- **Island decoration sprites**:
  - Suomenlinna — castle walls with battlements, gate arch, tower with Finnish flag, and two cannons
  - Mustikkamaa — cute blueberry with leaf and stem above the island name
- **Help button** in the action bar (hotkey **H**) — opens the tutorial at any time
- **Tutorial prompt** — "First time playing?" dialog appears after clicking START GAME with "SHOW ME HOW" / "JUMP RIGHT IN" options
- All custom sprites have winter/snow variants

### Changed
- **District labels** no longer have black background boxes — uses text outline stroke for readability instead, letting you see properties behind labels
- **Island labels** also use outline stroke instead of background boxes

---

## v0.9.0 — Stats Graphs & Tutorial (2026-04-03)

### Added
- **Financial history tracking** — revenue, expenses, net worth, and cash recorded each turn (up to 120 months)
- **Income vs Expenses bar graph** in the Stats panel — green bars for income, red for expenses, showing the last 12 months side by side
- **Net Worth line graph** in the Stats panel — yellow bars showing net worth trend over the last 12 months
- **Tutorial / How to Play** — accessible from the start screen via "HOW TO PLAY" button
  - 6-step guided walkthrough covering: game objective, map navigation, buying & managing properties, actions & turns, economy & events, keyboard controls
  - Navigate with Back/Next buttons or skip at any time
- Financial history is saved and loaded with game saves

---

## v0.8.8 — Landmark & Property Cleanup (2026-04-03)

### Added
- **Finnkino Tennispalatsi** — new purchaseable retail property in Kamppi (€12M)
- **Kansallismuseo** — new purchaseable landmark property in Töölö, west of Finlandia Hall (€12M)
- **Hietaniemi Beach** landmark on the coastline near Sibelius Monument
- **Temppeliaukio Church** landmark at the northern edge of Kamppi

### Changed
- **Finlandia Hall** is now a landmark only (no longer a purchaseable property)
- **Temppeliaukio Church** is now a landmark only (no longer a purchaseable property)
- **Allas Sea Pool** is now a landmark only (no longer a purchaseable property)
- **REDI Centre** is now a property only (removed duplicate landmark; REDI Shopping Centre remains purchaseable)
- **Kamppi Centre** — hardcoded position, moved west within the district
- **Forum Shopping Centre** — hardcoded to southeastern edge of Kamppi
- **Clarion Hotel Helsinki** — hardcoded to northeastern Jätkäsaari

### Fixed
- **Landmark/property duplicates** — Kamppi Centre, Finlandia Hall, Allas Sea Pool, and REDI Centre no longer appear as both a landmark and a purchaseable property in the same game

---

## v0.8.7 — Coastline Overhaul, New Districts & Islands (2026-04-03)

### Added
- **Kulosaari district** — exclusive residential island (prestige 5) with villas only
  - Named properties: Kulosaari Manor (€6M), Kulosaari Villa (€4M), Kulosaari Casino restaurant (€2M)
  - Streets: Hopeasalmentie, Kulosaaren puistotie, Svinhufvudintie
  - Connected to mainland via Kulosaaren silta (bridge)
- **Mustikkamaa island** — decorative island just south of Kulosaari with map label
- **Suomenlinna island** — decorative island in the southern sea with map label
- **Linnanmäki landmark** — amusement park east of Olympiastadioni
- **Northern green area** — large park covering the area north of Töölö/Kallio/Sörnäinen
- **Alppipuisto park** — green area around Linnanmäki
- **Vanhankaupunginlahti bay** — water body northeast of Sörnäinen toward Arabianranta
- **Island labels** — decorative islands with `label: true` now render text labels on the map
- **Bridge rendering** — roads with "silta" or "bridge" in the name render thicker
- **Point-in-polygon property placement** — procedural properties now use ray casting to stay within district boundaries

### Changed
- **Jätkäsaari** is now a separate island polygon (no longer part of the main coastline), fixing self-intersecting coastline issues
- **Hakaniemi district** moved north to avoid buildings rendering in water
- **Kalasatama polygon** simplified to convex shape to keep district center on land
- **Sörnäinen polygon** expanded northeast
- **Coastline significantly reworked** for better accuracy compared to real Helsinki geography
- **Hietalahti water body** updated to fill the gap between mainland and Jätkäsaari island
- **Villa-only filtering** for exclusive island districts (Kaskisaari, Kuusisaari, Kulosaari)
- **Special properties** excluded from AI rival purchases (`easterEgg: true` flag)
- **Sharetribe Office** moved to middle of Kaartinkaupunki district

### Fixed
- **Buildings in ocean** — properties in Jätkäsaari, Hakaniemi, and Kalasatama no longer spawn in water
- **Retail sprite artifact** — two dots to the right of awning fixed (stripe stride changed from `i*4*p` to `i*2*p`)
- **Game crash** — `kulosaariIsland` const used before declaration; fixed with inline polygon
- **Named property coordinates** updated for Jätkäsaari, Hakaniemi to stay within district bounds

---

## v0.8.6 — Pixel Art Buildings & Special Event Visuals (2026-04-02)

### Added
- **Pixel art building sprites** — each property type now has a distinct building sprite instead of colored squares
  - Retail: shop with striped awning and warm-lit windows
  - Restaurant: building with chimney and animated smoke puffs
  - Residential: house/apartment with peaked roof and window rows (scales with upgrade level)
  - Office: tall glass curtain-wall tower with antenna (grows taller with upgrades)
  - Hotel: wide building with entrance canopy, flag, and lit windows
  - Landmark: columned monument with star on top
- **All buildings grow taller with upgrades** — visual feedback for property investment
- **Snow on rooftops** in winter season
- **Special event visual effects** — rare events now have animated visuals on the map
- **Easter egg properties**:
  - Schwerbelastung's Penthouse (Jätkäsaari, €300K) — purple color
  - Sharetribe Office (Kaartinkaupunki, €500K) — orange color
- **Seaside apartments** now only appear in waterfront districts

### Changed
- **Ownership indicator** changed from border color to colored ground pad beneath buildings
- **Hover highlight** adapted for taller building sprites

---

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
- **Special event & Market Crash recovery** — `tickEvents` now handles global recovery, not just district-scoped events
- **Event ticker shows recovery info** — events with price impact now show recovery details
- **Event descriptions clarified** — multi-month events now explain duration and recovery in their text

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
  - Special events: unique sound effects
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
- **€NaN bug** — events without a `revenueModifier` caused revenue calculation to produce NaN, corrupting the money counter

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
  - Special: rare surprises (play to find out!)
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

### v1.0.0 — Release
- [ ] Balance tuning
- [ ] Mobile/touch support
- [ ] Richer property tooltips
