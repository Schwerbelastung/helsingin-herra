# Helsingin Herra - Changelog

## v1.6.0 — Alppila & Pasila Districts (2026-04-05)

### Added
- **Two new districts** — Alppila (north of Kallio, west of Sörnäinen) and Pasila (large northern district reaching the map edge)
- **Pasila Railway Station** landmark with dedicated pixel art sprite (platform, canopy, clock tower, rail tracks)
- **Railway tracks** running north from Pasila station to the map edge
- **Mall of Tripla** — purchaseable mega-mall (€40M) with 2x-size sprite, connected to the railway station
- **Pasila Government Agency Center** landmark with flavor text about Finnish bureaucracy
- **Messukeskus** (convention centre) — purchaseable landmark in Pasila
- **Hietaniemi Cemetery** landmark with gravestone sprite and flavor text about Finland's most prestigious resting place
- Pasila office generation, street names, and procedural residential properties
- Alppila street names, starter restaurants, and procedural properties
- Linnanmäki reassigned from Kallio to Alppila (its real-world location)

### Changed
- Removed Northern Green park overlay from the top of the map to make room for Pasila
- Simplified coastline around Lapinlahti bay

---

## v1.5.4 — Portrait Selection & UX Polish (2026-04-05)

### Added
- **Portrait picker** — choose from 3 distinct character portraits per gender on the start screen; each variant has unique suit/blazer color, hair color, and skin tone (saved/loaded with game)
- **No actions popup** — clicking a greyed-out action button (Buy, Sell, Upgrade, Repair, Make Offer) when out of actions now shows a centered red warning toast and plays a sound, instead of silently doing nothing
- **News ticker glow pulse** — the ticker border briefly glows when it updates, drawing attention to new information
- **First-game ticker nudge** — new players see a "check the news ticker" tooltip during turns 1–3 (shown once, tracked via localStorage)
- **Panel z-index stacking** — last clicked/dragged panel now stays on top when panels overlap

### Fixed
- **Hotel St. George location** — moved to its correct position southeast of Forum, west of Sharetribe Office

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
- **Restart to main menu** — RESTART button in the Menu panel returns to the start screen mid-game

### Added
- **Player-initiated property offers** — you can now offer to buy rival-owned properties at a price of your choosing (50%–150% of market value); AI evaluates based on their cash situation, property ROI, and personality; costs 1 action; each rival has 40 unique personality-matched response quips

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
- **Portfolio panel scaling** — "My Props" window now scales with UI scale setting
- **Consecutive bidding wars** — buttons no longer get stuck disabled when starting a second auction
- **Panel overflow at high UI scales** — all zoomed panels (achievements, tutorial, victory, log, stats, menu, newspaper) now cap their height relative to the zoom level so they stay within the viewport
- **ESC closes more dialogs** — ESC now also closes the achievements, tutorial, and victory screens
- **Auction starting bid** — natural auctions start at 65% of market value (was 85%); cheat auctions start at 60%
- **Cheat auction property selection** — no longer picks properties wildly out of everyone's price range; caps at ~120% of the richest participant's budget
- **Cheat money sound** — adding money via cheat panel now plays the cash register sound

---

## v0.17.0 — UI Scaling & Quality of Life (2026-04-03)

### Added
- **UI scaling** — 5 zoom levels (1x, 1.25x, 1.5x, 1.75x, 2x) accessible from the Menu; persists across sessions via localStorage
- **Hide/show advisor** — "Hide" button above the monopoly man box; advisor slides off-screen with a humorous departure quote, "Show" button appears in the top-right corner to bring him back with a witty return comment (10 departure + 10 return quotes); preference persists across sessions
- **Scoreboard label** — "Net Worth:" prefix on scoreboard entries
- **HUD cash label** — "Cash:" prefix on the HUD money display
- **Full rival names in Stats** — statistics panel now shows full names (including last names) instead of short names
- **Random rival selection** — when starting with fewer than 3 AIs, rivals are now randomly selected instead of always the same order
- **Early-game protection** — incoming offers and bidding wars are blocked during the first 6 months

### Fixed
- **"Can Afford & Available" filter** — now updates correctly after upgrades and repairs (was missing map re-render calls)
- **Auction winner highlighting** — winner is now correctly highlighted even when the auction ends before the final round
- **Cheat bidding war** — completely rewritten to bypass cooldown/affordability checks; always triggers successfully
- **Newspaper scaling** — capped at 1.25x zoom to remain readable at higher UI scales
- **Newspaper prompt position** — reduced upward movement at higher scales to prevent overlap with bottom menu bar

### Visual
- **UI scale support** — HUD, scoreboard, action bar, news ticker, all panels, offer/auction/tutorial/cheat/achievement/victory overlays all respect the UI scale setting
- **Canvas advisor scaling** — advisor sprite, speech bubble, and text scale with the UI scale setting
- **Achievement toast scaling** — achievement unlock notifications scale with UI

---

## v0.16.4 — Auctions & Achievements (2026-04-03)

### Added
- **Strange Events achievements** — new achievements tracking easter egg encounters, in a dedicated "Strange Events" section at the bottom of the achievement list
- **Achievement categories** — all achievements are now grouped under section headers (Getting Started, Wealth, Campaign, Strange Events, etc.)

### Changed
- **Bidding war chance** — increased from 3% to 7% per turn
- **Bidding war cooldown** — minimum 6 months between auctions; maximum one per calendar year
- **Rival auction loans** — AI rivals can now take loans to participate in bidding wars (budget = cash + 50% of owned property value), making multi-opponent wars more common
- **Multi-rival preference** — auction property selection now favours properties that multiple rivals want

### Visual
- **Lauttasaari** — completely reshaped to match real geography: L-shaped silhouette with concave southwest bay and southward-pointing Vattuniemi peninsula
- **Valkosaari** — nudged west to avoid overlapping ferry paths

### Fixed
- **Lauttasaari Gym** — no longer placed at the water's edge
- **Lauttasaari Beach** — repositioned to sit within the island

---

## v0.16.3 — Map Details (2026-04-03)

### Visual
- **Seurasaari** — island now renders in forest green (seasonal park colour) instead of grey
- **Lauttasaari** — southern tip rendered in forest green to reflect the wooded area
- **Helsinki Wheel** — promoted from map decoration to proper landmark; now shows hover glow and tooltip

### Changed
- **Easter egg grace period** — special events cannot trigger during the first 6 months of a new game
- **Easter egg cooldown** — confirmed: at least 2 months must pass between special events (was already in place)
- **Name confirmation prompt** — if the player leaves the name field blank, a prompt asks whether to play as "The Tycoon of Helsinki" or go back and enter a custom name

---

## v0.16.2 — Map & Sprites (2026-04-03)

### Visual
- **Finlandia Hall sprite** — custom pixel art: white modernist building with stepped asymmetric roofline, angular blue-gray glass facade, and window rows
- **Oodi Library sprite** — custom pixel art: distinctive swooping copper/brown curved roof that rises at both ends, glass-paneled facade, seasonal snow
- **Jätkäsaari** — reshaped to a more angular rectangle; narrowed east side for wider water channel to Hernesaari
- **Hernesaari** — widened east-to-west for a more accurate peninsula shape; west side pushed east to open the channel
- **Eira** — shifted northeast to eliminate overlap with Hernesaari
- **Kluuvi** — northern edge pulled south to stop overlap with Töölönlahti bay; district widened east-west to maintain coverage

### Fixed
- Buildings in Kluuvi no longer appear inside Töölönlahti water body

---

## v0.16.1 — More Content (2026-04-03)

### Added
- **Doubled all filler stories** — general newspaper fillers 150→301; rival filler stories: Nalle 22→44, Hjallis 22→44, Risto 24→48
- **Rival activity story variants** — "Rival Investors Stay Active" now picks from 10 title variants, 8 intro variants, and 7 closing variants (competitive vs. measured tone), giving hundreds of possible combinations

---

## v0.16.0 — Bidding Wars & Hufvudstadsbladet (2026-04-03)

### Added
- **Hufvudstadsbladet** — a second Helsinki newspaper may appear under rare circumstances, published entirely in Swedish with its own headlines and district stories. When it does appear, you can read HS, HBL, or both
- **Auction auto-loan system** — players can now bid beyond their cash balance in auctions; if they win, a bank loan is automatically taken for the shortfall. RAISE button shows "(LOAN)" indicator when bidding with borrowed money
- **Bidding war headline variants** — 6 headline titles and 5 article text variants for auction year-in-review stories, randomly selected
- **50 new general filler stories** (100→150) and ~22 rival filler stories per rival (15→22-24)

### Changed
- **Slower auction animations** — rival bids now appear one at a time with ~900ms delays, with a brief highlight flash on each bidder's card. Both player-raise and player-dropout flows use staggered per-rival animations for a more dramatic bidding experience
- **Buttons disabled during auction animation** — RAISE and DROPOUT buttons are disabled while rivals are responding, preventing double-clicks

### Visual
- **Animated Linnanmäki roller coaster** — the yellow cart moves along the track rails during spring/summer, parks at the base in winter. Sprite scaled up 50%
- **Olympic Stadium** — sprite scaled up 25%
- **Disc golf sprite** — scaled up 25%, repositioned to directly north of the Munkkiniemi label
- **Seurasaari landmark** — nudged slightly southeast for better placement

### Fixed
- **Duplicate Hjallis filler story** — removed duplicate "arm-wrestling" story, replaced with new unique story

---

## v0.15.3 — Auction Overhaul (2026-04-03)

### Changed
- **Auction max rounds increased** — bidding wars now last up to 5 rounds (was 3), ending early when only 1 bidder remains
- **Animated auction dropout** — when the player steps out of a bidding war, remaining rounds play out with animated rival bids, sounds, and UI updates instead of resolving instantly
- **Rival offer cooldown** — at least 2 turns must pass between rival purchase offers to prevent spam
- **Cross-game filler story tracking** — newspaper filler stories (general and rival) now track recently shown stories across playthroughs via localStorage, so starting a new game won't show the same stories again until 75% of the pool has been cycled through

### Fixed
- **Hakaniemi district polygon** — pulled south/southwest vertices northward so the district no longer overlaps with Eläintarhanlahti bay
- **Jätkäsaari district polygon** — trimmed top-right corner that was extending into the sea near the Clarion hotel area

---

## v0.15.2 — Quality of Life (2026-04-03)

### Added
- **"Can Afford & Available" filter** — new toggle in the filter panel highlights only unowned properties within the player's budget, works alongside existing type/price/owner filters
- **30 new advisor quotes** — general tips (30→60), context quotes doubled per category, action quotes nearly doubled per action type
- **No back-to-back easter eggs** — if the same special event would fire twice in a row, a different eligible easter egg is chosen instead

### Fixed
- **Rival starting net worth** — rivals now show their actual starting cash on the scoreboard from turn 1 (was showing €0 until their first turn)

---

## v0.15.1 — Something Unexpected (2026-04-03)

### Added
- **New rare event** — something unusual can happen that temporarily transforms the entire city map, complete with its own music, newspaper coverage, and visual effects. You'll know it when you see it.
- **Per-event occurrence cap** — each special event can fire at most 3 times per playthrough (certain events stay at 1)

---

## v0.15.0 — Tycoon Identity (2026-04-03)

### Added
- **Gender selector** on start screen — choose male or female portrait
- **Player portrait** — gendered pixel art portrait appears in newspapers and auction dialog
  - Male: green suit with tie, brown hair, confident smile
  - Female: green blazer with emerald blouse, auburn hair, gold necklace
- **100 filler stories** (doubled from 50) — enough variety for the longest campaigns
- **Dynamic easter egg probability** — special events self-balance across years:
  - Each event that fires halves the chance of further events that year
  - A dry year with no events doubles the chances for the next year (up to 4×)
  - Ensures a natural ebb and flow of surprises across long campaigns
- **Distinct music styles** — Minimal and Cinematic modes completely redesigned:
  - Minimal: rhythmic lo-fi with square wave plucks, bouncy bassline, hi-hat clicks
  - Cinematic: epic orchestral pads, deep bass pedals, chord swells, timpani hits

### Changed
- Female portrait expression softened — arched eyebrows, warm smile, eye shine

---

## v0.14.0 — The Polish Update (2026-04-03)

### Added
- **Music style selector** — choose between Ambient, Minimal, and Cinematic music via dropdown in the HUD
  - Ambient: the classic seasonal pentatonic generative music
  - Minimal: sparse, piano-like triangle wave with deliberate silences
  - Cinematic: rich layered sound with bass drones, chord stacks, and high shimmers
- **Max upgrade star** — fully upgraded (5/5) properties show a pulsing golden star on the map
- **Newspaper illustrations** — special event headlines now include unique pixel art illustrations
- **Rival portraits in newspaper** — stories mentioning a specific tycoon show their pixel art portrait
- **Rival-specific filler stories** — 15 personality-driven stories (5 per rival)
- **Special event newspaper coverage** — certain rare events are now logged and appear in year-in-review papers
- **3 additional sailboats** in the northwestern corner of the map

### Changed
- Year-in-review event summaries now use varied titles, intros, and closing lines instead of fixed text
- Cleaned up ~300 temporary files left by previous editing sessions

---

## v0.13.0 — Helsingin Sanomat (2026-04-03)

### Added
- **Helsingin Sanomat newspaper** — a newspaper appears each January with a year-in-review
  - Cream-parchment overlay styled like a classic broadsheet
  - Headline story chosen from the year's most dramatic event (special events, auctions, acquisitions)
  - 2-4 smaller stories covering rival activity, player sales, market events
  - One handwritten filler story per year — pure Helsinki flavor (saunas, seagulls, salmiakki shortages...)
  - 10 unique filler stories in rotation
- **Day 1 newspaper** — introduces the competition and all rival tycoons with personalized profiles
- **Player name input** — enter your tycoon name on the start screen (default: "The Tycoon of Helsinki")
  - Name appears in ticker messages, scoreboard, auctions, and newspaper stories
- **Newspaper prompt bar** — READ or SKIP the paper; auto-dismisses after 2 months if ignored

### Changed
- "You" replaced with player name throughout ticker messages, auction UI, and scoreboard
- Monopoly man advisor scaled up 1.25× for better visibility
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
