// Auto-generated from CHANGELOG.md — update when releasing new versions
const CHANGELOG_MD = `## v1.6.2 — Fullscreen & Quit Button (2026-04-07)

### Added
- **Fullscreen launch** — game now opens in fullscreen by default
- **Quit button on start screen** — below CHANGELOG and HOW TO PLAY
- **Quit button in Menu panel** — alongside Save/Load/Restart for in-game exit

---

## v1.6.1 — Splash Screen Music (2026-04-07)

### Added
- **Splash screen music** — upbeat procedural music plays immediately when the game launches, before any button is clicked
- Music is a bouncy C–G–Am–F loop with walking bass, triangle arpeggios, a bright melody line, and light hi-hat ticks at ~107 BPM
- Music fades out gracefully when starting or continuing a game

---

## v1.5.4 — Portrait Selection & UX Polish (2026-04-05)

### Added
- **Portrait picker** — choose from 3 distinct character portraits per gender on the start screen; each variant has unique suit/blazer color, hair color, and skin tone (saved/loaded with game)
- **No actions popup** — clicking a greyed-out action button when out of actions now shows a centered red warning toast and plays a sound, instead of silently doing nothing
- **News ticker glow pulse** — the ticker border briefly glows when it updates, drawing attention to new information
- **First-game ticker nudge** — new players see a "check the news ticker" tooltip during turns 1–3 (shown once, tracked via localStorage)
- **Panel z-index stacking** — last clicked/dragged panel now stays on top when panels overlap

### Fixed
- **Hotel St. George location** — moved to correct position southeast of Forum, west of Sharetribe Office

---

## v1.5.3 — Draggable Panels & Window Controls (2026-04-05)

### Added
- **Draggable panels** — all panels (staff, bank, properties, filters, log, etc.) can now be freely repositioned by dragging their header; positions persist across sessions via localStorage
- **Pin toggle (●/○)** — pinned panels stay open when switching to other panels, overriding the normal mutual-exclusion behavior; useful for keeping stats or staff visible while browsing properties
- **Window control buttons** — each panel header now has three buttons with tooltips: ● pin, ↺ reset position, ✕ close
- **Peter's hoodie fix** — darkened drawstring color so it no longer blends with skin tone

### Changed
- **Panel headers** — old close buttons replaced with the new window control group
- **Tutorial close button** — now white instead of gray for better visibility

---

## v1.5.2 — Salary Scaling & Maintenance UI (2026-04-05)

### Changed
- **Percentage-based salary scaling** — all staff salaries now use 15% annual compounding instead of flat yearly increases, making salaries scale meaningfully in late-game (e.g., Manager grows from €5K to €17.5K by year 10, vs flat €14K previously)
- **Compact maintenance worker widget** — replaced 5 separate staff cards with a single table-like widget showing all tiers in rows, making cost/repair tradeoffs immediately visible; active tier is highlighted with left border

### Fixed
- **Maintenance tier display clarity** — each tier now explicitly shows how many properties it repairs per turn in a dedicated column

---

## v1.5.1 — Ultra-Cheap Properties Fixes (2026-04-05)

### Fixed
- **Ultra-cheap property district validation** — 5 properties were assigned to non-existent districts and silently skipped from the game; reassigned to valid districts with real Helsinki locations: Hakaniemi Used Books, Kallio Ramen House, Töölö Smoothie Bar, Ruoholahti Sauna Club, Kruununhaka Vintage Shop
- **Property name consistency** — fixed Töölö property name to use proper Finnish umlauts (Töölö Smoothie Bar)

---

## v1.5.0 — Starter Properties Balance (2026-04-05)

### Added
- **12 new ultra-cheap properties (€50K–€140K)** — added cafes, kebab shops, kiosks, and convenience stores across multiple districts to improve early-game fairness in 1+3 rival games; now ~27 total ultra-cheap starters (up from 15) ensures each of 4 players gets 6-7 affordable options regardless of turn order

---

## v1.4.0 — Maintenance Worker Tiers (2026-04-05)

### Added
- **Multiple maintenance worker tiers (1-5)** — hire progressively higher tiers that automatically repair more properties each turn: Tier 1 repairs 1 property, Tier 2 repairs 2, up to Tier 5 repairing 5 properties per turn, all at 50% repair cost
- **Tiered salary scaling** — each tier costs 50% more than the previous (base salary scales from €2K to €10.1K), with scaling that increases over time
- **Tier selection UI** — separate staff panel section showing all 5 maintenance tiers with hire/fire buttons, costs, and salary information

### Changed
- **Staff hiring system** — maintenance workers now use dedicated tier system instead of single hire; can upgrade to higher tiers or downgrade by firing current tier

---

## v1.3.1 — Ultrawide Support (2026-04-05)

### Fixed
- **Ultrawide aspect ratio lock** — window now locks to 16:9 aspect ratio on ultrawide monitors, preventing UI elements (advisor, menu bar) from stretching too far to the sides; users can resize the window but it maintains perfect 16:9 proportions with black bars on ultrawide displays

---

## v1.3.0 — District Monopolies & Strategic Depth (2026-04-05)

### Added
- **District Monopoly System** — acquire all properties in a district to unlock Monopoly-style rewards: +50% revenue per property in monopolized districts, districts change color to owner's color (gold for player, unique colors for each rival), AI strategically pursues district monopolies, and newspaper headlines celebrate major monopoly achievements
- **District-aware AI offers** — rivals now prioritize buying properties that complete their district monopolies (70% preference) and prefer selling from non-monopoly districts to protect their consolidation strategy
- **Landmark visibility filter** — new map filter toggle to fade landmarks to 20% opacity for cleaner visual focus on properties
- **Annual events calendar** — January Year Review newspaper now includes "Helsinki's Annual Events" section with 2-3 randomly selected recurring festivals showing affected districts and estimated revenue impacts (10 unique descriptions per event for variety)
- **District takeover headlines** — newspaper generates special headlines when players or rivals complete district monopolies, with dedicated story sections for major consolidation events

### Changed
- **District rendering** — districts now display stronger tint and brighter borders when owned as monopoly, making district control status instantly visible at a glance
- **Revenue calculation** — per-property monopoly bonus system replaces simpler flat bonuses for more meaningful economic reward

### Fixed
- **District Monopoly implementation** — completed proper Monopoly-style system that was previously marked as done but not fully implemented; now includes all planned features

---

## v1.2.0 — Interactive UI & Quality of Life (2026-04-05)

### Added
- **Go-to-property button in My Properties** — click the → button to zoom in, center, and select any property from your portfolio instantly
- **Upgrade button in My Properties** — upgrade properties directly from the portfolio view without opening the property panel
- **Clickable scout tips** — click the scout's message in the news ticker to jump directly to the recommended property
- **Rival win detection** — game now ends immediately if a rival reaches the win target before you
- **Rival bankruptcy notifications** — receive a notification when a rival runs out of money and is eliminated
- **Animated offer popups** — rival offers now appear with smooth fade-in and scale-up animations for better visibility
- **Goal displayed in scoreboard** — win target now shows alongside all player/rival net worths so you can see progress at a glance
- **Upgrade projection tooltips** — hover over upgrade buttons to see exactly how much they'll increase your property's value and monthly revenue
- **Landmark visibility filter** — new filter toggle to fade landmarks (20% opacity) for less visual clutter when focusing on properties
- **Annual events in Year Review** — January newspaper now includes a "Helsinki's Annual Events" section highlighting recurring festivals and events throughout the year with their affected areas and estimated revenue impacts, helping you plan your investment strategy
- **District Monopoly system** — complete Monopoly-style feature with district color changes, 50% revenue bonuses for monopolized districts, AI preference for completing monopolies, and newspaper headlines when districts are taken over

### Changed
- **News ticker more prominent** — increased font size (7px → 9px), height (24px → 32px), added gradient background, improved contrast for better visibility
- **Log panel repositioned and reversed** — moved from top-left to bottom-left corner; newest entries now appear on top for better usability
- **Money formatting enhanced** — amounts between €1M–€10M now show one decimal (e.g. €5.6M) for more precision; ≥€10M shows whole millions
- **Menu button moved to bottom-left** — relocated from center-right action bar to bottom-left for consistency with other panels
- **Newspaper scrollbar visible** — styled webkit scrollbar now visible in Helsingin Sanomat overlay for clarity
- **AI property retention** — rivals will never sell their last property, showing more realistic behavior
- **Löyly property type** — changed from restaurant to sauna (still appears with special sauna sprite on map)
- **Victory screen now shows only once** — no longer re-appears if you continue playing after winning

### Fixed
- **Go button coordinates** — property zoom now correctly centers on the selected property at maximum zoom level
- **Escape key close buttons** — updated labels from "Skip" to "Close" in tutorial for consistency
- **Easter eggs persist on restart** — easter egg properties now properly clear when restarting to main menu
- **Out of actions feedback** — added clear visual feedback (sound + ⚠️ message) when attempting actions with no remaining actions

---

## v1.1.0 — Balance & Polish (2026-04-04)

### Added
- **Player-initiated property offers** — you can now offer to buy rival-owned properties at a price of your choosing (50%–150% of market value); AI evaluates based on their cash situation, property ROI, and personality; costs 1 action; each rival has 40 unique personality-matched response quips
- **Restart to main menu** — RESTART button in the Menu panel returns to the start screen mid-game

### Changed
- **Advisor moved to bottom-right** — the advisor now permanently lives in the bottom-right corner; Show button matches the same position
- **Menu button repositioned** — Menu is now the second button in the action bar, right after End Turn
- **Easter egg probability rebalanced** — base chances significantly lowered for ~25% combined chance per year; max 1 per year; 4-month cooldown between events (was 2); catchup multiplier capped at 2x (was 4x); no two special events can fire on the same turn

### Fixed
- **Bidding war winner marked as OUT** — the auction winner is now always correctly highlighted, even when all rivals drop out in the same round
- **Useless final auction bid** — rivals no longer make a pointless bid when they're the only participant left
- **Autopilot hide button** — stopping autopilot via Hide now shows the departure quote for 3 seconds before the advisor slides away
- **Quirk popup hidden by newspaper** — "DID YOU KNOW?" popups now appear above the HS/HBL prompt bar when it's visible
- **Changelog spoilers removed** — redacted easter egg names, achievement names, and event counts from all changelog entries

---

## v1.0.0 — Helsingin Herra (2026-04-04)

The game is complete! All systems, content, and polish are in place.

### Added
- **195 advisor quotes** — tripled the monopoly man's idle commentary pool so he repeats far less often
- **Advisor portrait in auctions** — during autopilot, the monopoly man's face appears in bidding wars instead of the player's portrait
- **Electron packaging** — the game can now be built as a standalone Windows .exe

### Fixed
- **Strange event achievement fix** — one easter egg achievement now unlocks correctly during natural gameplay (was only triggering via cheat)
- **Autopilot repair banner** — condition percentages in the action banner are now rounded to whole numbers instead of showing long decimals

---

## v0.21.0 — The Mustache Takes the Wheel (2026-04-04)

### Added
- **Autopilot action banner** — a green banner at the top-center of the screen shows each AI decision in real time (buying, upgrading, repairing, ending turn, bidding, accepting/declining offers)
- **Autopilot advisor remarks** — the advisor comments on his own brilliance every 4 actions, and always reacts to offer accept/decline and auction win/lose with tailored quips
- **Advisor repositioned during autopilot** — moves to bottom-right so the property panel no longer covers him; Hide button follows directly above
- **Autopilot Hide = fire the advisor** — clicking Hide during autopilot stops it with a snarky departure quote instead of just hiding

### Fixed
- **Autopilot auction dialog stuck** — bidding war result screen now auto-closes during autopilot instead of blocking
- **Harakka description** — corrected to mention the ferry service instead of claiming the island is only reachable by rowboat
- **Hide button position** — now always sits directly above the advisor box regardless of position, preventing overlap with the property panel

---

## v0.20.0 — The Sound of Silence (2026-04-04)

### Added
- **AI Autopilot cheat** — press "AI Autopilot" in the cheat panel and let the advisor play for you; buys properties by ROI, upgrades efficiently, repairs damaged buildings, handles rival offers and bidding wars automatically; the advisor moves to the bottom-right and makes periodic remarks about his own genius; an action banner at the top shows each decision in real time; clicking "Hide" during autopilot fires the advisor (and stops autopilot) with a snarky goodbye
- **District Buy cheat** — new "Buy District" button in the cheat panel; click to enter mode, then click any district on the map to instantly acquire all unowned properties in it for free (separate from the single-property Free Buy mode)
- **Easter egg cheat cycling** — the Easter Egg button now cycles through all events in a shuffled random order; once every event has been triggered once, the order reshuffles and starts again; the hint text shows how many remain in the current cycle

### Fixed & Improved
- **Easter egg newspaper fix** — a certain special edition now correctly appears as the right newspaper; it also overwrites the last-read copy so the re-read button reflects it
- **Easter egg duration fix** — one easter egg's effect now lasts the entire turn and lifts naturally when you press End Turn, instead of fading too early
- **Easter egg newspaper content** — enriched with new stories; one may or may not appear depending on your settings
- **Missing Strange Events achievement** — one easter egg event was missing its achievement entirely since v0.9.3; now added
- **Easter egg achievements not triggering** — strange event achievements now unlock immediately when the event fires (via cheat or naturally), instead of being lost to a timing issue with event expiry

---

## v0.19.0 — The Mighty Eagle (2026-04-04)

### Added
- **Peter Vesterbacka** — 4th rival, the red-hooded creator of Angry Birds. Targets waterfront, offices, and anything tunnel-adjacent to Tallinn. Comes with 50 unique quips, a day-1 newspaper intro, 12 filler stories (tunnel pitches, hoodie at state dinners, rollerblading property tours), and a pixel-art portrait complete with red zip hoodie and drawstrings
- **Clickable map objects** — 7 new clickable decorations with humorous blurbs: Viking Line ferry, Silja Line ferry, Suomenlinna fortress, the Moose in the north, Korkeasaari Zoo, Mustikkamaa blueberry, and Töölönlahti fountain
- **New easter egg in cheat menu** — one more easter egg can now be triggered via the cheat panel like all others
- **Cheat panel easter egg status** — a hint appears below the Easter Egg button when all eggs are currently active

---

## v0.18.0 — Life in Helsinki (2026-04-04)

### Added
- **Rival personality quips** — Nalle, Hjallis, and Risto now make personal remarks that appear in the top-left corner with their portrait (50 unique quips each, ~1–2 per year)
- **Property quirks** — 33% chance of a "DID YOU KNOW?" popup when buying a property, with 15 humorous quirks per property type (90 total)
- **Clickable landmarks** — all 20 landmarks on the map are now clickable, opening a panel with 1–2 humorous paragraphs about the location
- **Tenant letters to the editor** — 20 new filler stories in Helsingin Sanomat written as letters from disgruntled (and delighted) tenants
- **New easter egg** — a rare event with its own special newspaper edition, achievement, and advisor quotes
- **City council vote events** — 10 new district-specific events (rent caps, landmark grants, parking fees, etc.) with 🏛️ ticker icon
- **HBL "Translate into English"** — Hufvudstadsbladet now has a translate button that opens a side-by-side English edition with the same stories in the same order; close button reads "STÄNG" in Swedish
- **Tutorial updates** — new "Finding Properties with Filters" tip highlighting the "Can Afford & Available" filter; actions-per-turn now reflects difficulty (5/4/3); removed alien invasion spoiler

---

## v0.17.1 — Bugfixes (2026-04-03)

### Fixed
- **Portfolio panel scaling** — "My Props" window now scales with UI scale
- **Consecutive bidding wars** — buttons no longer stuck after back-to-back auctions
- **Panel overflow at high UI scales** — all panels stay within the viewport at any zoom
- **ESC closes more dialogs** — achievements, tutorial, and victory screens
- **Auction starting bid** — lowered to 65% (natural) / 60% (cheat) of market value
- **Cheat auction pricing** — no longer picks absurdly expensive properties
- **Cheat money sound** — money cheats now play a cash register sound

---

## v0.17.0 — UI Scaling & Quality of Life (2026-04-03)

### Added
- **UI scaling** — 5 zoom levels (1x–2x) in the Menu; persists across sessions
- **Hide/show advisor** — hide the monopoly man with humorous departure/return quotes (10 each); persists across sessions
- **Scoreboard & HUD labels** — "Net Worth:" on scoreboard, "Cash:" on HUD
- **Full rival names in Stats** — statistics panel shows full names
- **Random rival selection** — rivals randomised when fewer than 3 AIs
- **Early-game protection** — no offers or bidding wars in the first 6 months

### Fixed
- **"Can Afford & Available" filter** — now updates after upgrades/repairs
- **Auction winner highlighting** — works when auction ends before final round
- **Cheat bidding war** — always triggers (bypasses cooldowns)
- **Newspaper scaling** — capped at 1.25x to stay readable

---

## v0.16.4 — Auctions & Achievements (2026-04-03)

### Added
- **Strange Events achievements** — new achievements tracking easter egg encounters, in a dedicated section
- **Achievement categories** — achievements now grouped under section headers

### Changed
- **Bidding wars** — more frequent (7% chance, was 3%), with 6-month cooldown and max one per year
- **Rival auction loans** — AI rivals can now take loans to compete in bidding wars
- **Multi-rival preference** — auctions now favour properties multiple rivals want

### Visual
- **Lauttasaari** — reshaped to L-shaped silhouette with concave southwest bay and Vattuniemi peninsula
- **Valkosaari** — nudged west to clear ferry paths

---

## v0.16.3 — Map Details (2026-04-03)

### Visual
- **Seurasaari** — island now renders in forest green (seasonal) instead of grey
- **Lauttasaari** — southern wooded tip rendered in forest green
- **Helsinki Wheel** — now a proper landmark with hover glow and tooltip

### Changed
- **Easter egg grace period** — special events cannot trigger in the first 6 months of a new game
- **Easter egg cooldown** — at least 2 months between special events (was already in place)
- **Name confirmation prompt** — leaving the name blank now asks if you want to play as "The Tycoon of Helsinki" or enter your own name

---

## v0.16.2 — Map & Sprites (2026-04-03)

### Visual
- **Finlandia Hall sprite** — white modernist building with stepped roofline and angular glass facade
- **Oodi Library sprite** — swooping copper/brown curved roof with glass-paneled facade
- **Jätkäsaari & Hernesaari** — reshaped for accuracy; wider water channel between them
- **Eira** — shifted northeast, no longer overlaps Hernesaari
- **Kluuvi** — north edge pulled south, no longer overlaps Töölönlahti

---

## v0.16.1 — More Content (2026-04-03)

### Added
- **Doubled all filler stories** — 301 general stories, 44 Nalle / 44 Hjallis / 48 Risto rival stories
- **Rival activity story variants** — 10 titles × 8 intros × 7 closings for the annual rival round-up

---

## v0.16.0 — Bidding Wars & Hufvudstadsbladet (2026-04-03)

### Added
- **Hufvudstadsbladet** — a second newspaper may appear under rare circumstances, published entirely in Swedish with its own headlines and local stories
- **Auction auto-loan** — bid beyond your cash; loans taken automatically if you win
- **6 bidding war headline variants** for year-in-review newspapers
- **50 new filler stories** (150 total) + more rival stories

### Changed
- **Slower auction animations** — rival bids appear one at a time with dramatic pacing
- **Buttons disabled during rival animation** to prevent double-clicks
- **Animated roller coaster** at Linnanmäki (spring/summer), bigger sprites for stadium, disc golf, roller coaster
- **Disc golf** repositioned north of Munkkiniemi label; **Seurasaari** landmark nudged SE

---

## v0.15.3 — Auction Overhaul (2026-04-03)

### Changed
- **Auction max rounds increased** — bidding wars now last up to 5 rounds (was 3), ending early when only 1 bidder remains
- **Animated auction dropout** — when the player steps out, remaining rounds play out with animated rival bids and UI updates
- **Rival offer cooldown** — at least 2 turns between rival purchase offers
- **Cross-game filler story tracking** — newspaper stories feel fresh across playthroughs (75% must cycle before repeats)

### Fixed
- **Hakaniemi district** — polygon no longer overlaps with the sea to the south/southwest
- **Jätkäsaari district** — trimmed top-right corner extending into the sea

---

## v0.15.2 — Quality of Life (2026-04-03)

### Added
- **"Can Afford & Available" filter** — toggle in filter panel to show only purchaseable properties within budget
- **30 new advisor quotes** — doubled tips, context quotes, and action quotes
- **No back-to-back easter eggs** — same special event won't fire twice in a row

### Fixed
- **Rival starting net worth** — rivals show correct starting cash on scoreboard from turn 1

---

## v0.15.1 — Something Unexpected (2026-04-03)

### Added
- **New rare event** — something unusual can happen that temporarily transforms the entire city, with its own music, newspaper coverage, and visual effects
- **Per-event occurrence cap** — each special event can fire at most 3 times per playthrough

---

## v0.15.0 — Tycoon Identity (2026-04-03)

### Added
- **Gender selector** on start screen — choose male or female portrait
- **Player portrait** — gendered pixel art portrait appears in newspapers and auction dialog
- **100 filler stories** (doubled from 50) — enough variety for the longest campaigns
- **Dynamic easter egg probability** — special events self-balance across years
- **Distinct music styles** — Minimal and Cinematic modes completely redesigned

### Changed
- Female portrait expression softened — arched eyebrows, warm smile, eye shine

---

## v0.14.0 — The Polish Update (2026-04-03)

### Added
- **Music style selector** — choose between Ambient, Minimal, and Cinematic music
- **Max upgrade star** — fully upgraded properties show a pulsing golden star
- **Newspaper illustrations** — special event headlines include pixel art sprites
- **Rival portraits in newspaper** — tycoon stories show their portrait
- **Rival-specific filler stories** — 15 personality-driven stories (5 per rival)
- **Special event newspaper coverage** — certain rare events are now logged in year-in-review papers
- **3 additional sailboats** in the northwestern waters

### Changed
- Year-in-review event summaries now use varied text instead of fixed phrases

---

## v0.13.0 — Helsingin Sanomat (2026-04-03)

### Added
- **Helsingin Sanomat newspaper** — a newspaper appears each January with a year-in-review
  - Cream-parchment overlay styled like a classic broadsheet
  - Headline story chosen from the year's most dramatic event
  - 2-4 smaller stories covering rival activity, player sales, market events
  - One handwritten filler story per year — pure Helsinki flavor
  - 10 unique filler stories in rotation
- **Day 1 newspaper** — introduces the competition and all rival tycoons with personalized profiles
- **Player name input** — enter your tycoon name on the start screen
  - Name appears in ticker messages, scoreboard, auctions, and newspaper stories
- **Newspaper prompt bar** — READ or SKIP the paper; auto-dismisses after 2 months

### Changed
- "You" replaced with player name throughout the game
- Monopoly man advisor scaled up 1.25×
- One rare seasonal event now spreads more widely across the map

---

## v0.12.0 — Mysteries of Helsinki (2026-04-03)

### Added
- **Rare special events** — strange and wonderful things may happen in Helsinki when you least expect them
  - Some appear only in certain seasons or months
  - Some affect the whole city, others target specific districts or property types
  - Each has unique animated visuals and sound effects
- **2-month cooldown** between special events — no more clustering
- **One-time events** — certain surprises can only happen once per campaign
- **Seasonal cheat protection** — trying to cheat a seasonal event out of season gives a cryptic hint
- **Easter egg cheat button** — trigger a random special event from the cheat panel

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
  - **Pixel art portraits** of all participating rivals shown with live status
  - Player portrait with green suit and € symbol
  - Rivals use smart bidding AI: budget-aware, strategy-driven, with probabilistic dropout
  - Property stats (district, type, price, revenue, condition, level) displayed in the auction window
  - Dramatic golden-bordered UI with pulsing lightning bolt headers
- **Auction sound design**:
  - Gavel strike + rising tension on auction start
  - Ascending chime when you raise
  - Menacing sawtooth tones when a rival raises
  - Deflating descend when someone drops out
  - Mini-fanfare on win, sad trombone on loss
  - **Tense background music loop** during bidding — pulsing bass drone with rhythmic heartbeat pattern
  - Normal ambient music pauses during auction and resumes after

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
- **Korkeasaari Zoo island** south of Mustikkamaa with zoo gate, lion, bear, and penguin
- **Seurasaari island** with label and pedestrian bridge
- **6 new islands**: Sirpalesaari, Liuskasaari, Uunisaari, Särkkä, Harakka (labeled), Lighthouse Island
- **6 new bridges** connecting island chains
- **Tali DiscGolfPark** landmark with frisbee golfer sprite
- **Water decorations**: sailboats, rowing boat, buoys, seagulls, wave clusters
- **Töölönlahti** label, fountain, and paddle boat
- **Land decorations**: Helsinki tram, Mannerheim statue, Helsinki Wheel, market tents, sauna
- **Christmas tree** on Senate Square (winter only)
- **Bushes** along park edges, **moose** in the north
- **Rare winter surprise** — something unusual may appear along the coastline during winter...
- **Lighthouse**, **Citymarket Ruoholahti**, **Lauttasaari Beach** and new properties

### Changed
- Lauttasaari properties spread across the full island
- Improved winter surprise sprite and spawn behavior
- Bushes now larger and darker green with highlights

### Fixed
- Buoy moved from land to water, Seurasaari position corrected, duplicate island removed

---

## v0.9.2 — Season Transitions & Achievements (2026-04-03)

### Added
- **Animated season transitions** — map colors smoothly blend between seasons with a banner overlay
- **32 achievements** — persistent across games, covering purchases, milestones, economy, campaign wins, and easter eggs
- **Achievement toast** notification and **Achievements panel** (press **A**)

---

## v0.9.1 — Tycoon Advisor & Landmark Sprites (2026-04-03)

### Added
- **Tycoon Advisor** — pixel art character with tips, jokes, and action reactions replaces the minimap
- **Custom landmark sprites**: Linnanmäki rollercoaster, Hietaniemi Beach umbrella, Allas Sea Pool, Olympic Stadium, Sibelius Monument pipes
- **Island decorations**: Suomenlinna castle with walls, cannons, and Finnish flag; Mustikkamaa blueberry
- **Help button** (H) in the action bar and tutorial prompt after starting a new game

### Changed
- **District labels** use text outline instead of black background boxes for better visibility

---

## v0.9.0 — Stats Graphs & Tutorial (2026-04-03)

### Added
- **Income vs Expenses bar graph** in Stats panel — last 12 months of green (income) vs red (expenses)
- **Net Worth line graph** in Stats panel — yellow bars showing your wealth trend
- **Tutorial / How to Play** — 6-step guided walkthrough from the start screen
- Financial history saved with game saves

---

## v0.8.8 — Landmark & Property Cleanup (2026-04-03)

### Added
- **Finnkino Tennispalatsi** — new purchaseable retail property in Kamppi
- **Kansallismuseo** — new purchaseable landmark in Töölö, west of Finlandia Hall
- **Hietaniemi Beach** and **Temppeliaukio Church** landmarks

### Changed
- **Finlandia Hall**, **Temppeliaukio Church**, **Allas Sea Pool** — now landmarks only (not purchaseable)
- **REDI Centre** landmark removed (REDI Shopping Centre stays as property)
- **Kamppi Centre**, **Forum Shopping Centre**, **Clarion Hotel** — hardcoded positions adjusted

### Fixed
- No more landmark/property duplicates appearing in the same game

---

## v0.8.7 — Coastline Overhaul, New Districts & Islands (2026-04-03)

### Added
- **Kulosaari district** — exclusive residential island with villas, manor, and casino restaurant
- **Mustikkamaa** and **Suomenlinna** — decorative islands with map labels
- **Linnanmäki landmark** — amusement park near Kallio
- **Northern green area** and **Alppipuisto** parks
- **Vanhankaupunginlahti bay** — new water body northeast of Sörnäinen
- **Bridge rendering** — bridges render thicker on the map
- **Point-in-polygon property placement** — properties stay within district boundaries

### Changed
- **Jätkäsaari** is now a separate island polygon for accurate coastline
- **Hakaniemi** moved north, **Kalasatama** simplified, **Sörnäinen** expanded
- **Coastline significantly reworked** for better geographic accuracy
- **Villa-only filtering** for exclusive island districts
- **Easter egg properties** excluded from AI rival purchases

### Fixed
- **Buildings in ocean** — properties no longer spawn in water in coastal districts
- **Retail sprite artifact** — two dots to the right of awning removed
- **Game crash** — const used before declaration bug fixed

---

## v0.8.6 — Pixel Art Buildings & Special Event Visuals (2026-04-02)

### Added
- **Pixel art building sprites** — each property type now has a distinct building sprite
  - Retail: shop with striped awning and warm-lit windows
  - Restaurant: building with chimney and animated smoke puffs
  - Residential: house/apartment with peaked roof (scales with upgrade level)
  - Office: tall glass curtain-wall tower with antenna
  - Hotel: wide building with entrance canopy and flag
  - Landmark: columned monument with star on top
- **All buildings grow taller with upgrades** — visual feedback for investment
- **Snow on rooftops** in winter
- **Special event visual effects** — rare events now have animated visuals on the map
- **Easter egg properties**: Schwerbelastung's Penthouse, Sharetribe Office
- **Seaside apartments** now only spawn in waterfront districts

---

## v0.8.5 — Victory Screen, Cheats & Trophies (2026-04-02)

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
- **Special event & Market Crash recovery** — tickEvents now handles global recovery, not just district-scoped events
- **Event ticker shows recovery info** — events with price impact now show recovery details
- **Event descriptions clarified** — multi-month events now explain duration and recovery in their text

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
