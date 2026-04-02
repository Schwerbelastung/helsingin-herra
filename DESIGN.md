# Helsinki Tycoon - Game Design Document

## Overview
A turn-based real estate tycoon game set in Helsinki city centre. Players buy, manage, and upgrade real properties and businesses across recognizable Helsinki districts. Compete against AI rivals inspired by famous Finnish businesspeople.

## Core Loop
1. **Survey** the map — browse available properties across Helsinki districts
2. **Buy** properties — shops, restaurants, apartments, offices, hotels
3. **Manage** — upgrade, set rents, handle maintenance
4. **Collect** income each month
5. **Compete** — outbid AI rivals, respond to events, grow your empire
6. **Repeat** — monthly turns with limited actions

---

## Map & Districts

### Geography
- Approximate real Helsinki layout, scrollable/zoomable
- Water (Baltic Sea, bays) clearly visible
- All properties on one visible layer (no drill-down)
- Grid-based but shaped to match Helsinki's real coastline and street layout

### Districts (West to East, roughly)
1. **Lauttasaari** — residential island, some shops
2. **Jätkäsaari** — new development, modern apartments
3. **Ruoholahti** — offices, residential
4. **Kamppi** — major commercial hub, shopping centre
5. **Punavuori** — trendy boutiques, design district
6. **Eira** — upscale residential
7. **Ullanlinna** — upscale residential, embassies
8. **Kaartinkaupunki** — central, mixed
9. **Kluuvi** — retail core (Stockmann, Aleksi)
10. **Kruununhaka** — historic, Senate Square
11. **Katajanokka** — residential, Allas Sea Pool, terminals
12. **Kallio** — hipster district, bars, affordable housing
13. **Hakaniemi** — market hall, mixed use
14. **Sörnäinen** — emerging area
15. **Merihaka** — brutalist residential towers
16. **Töölö** — residential, Finlandia Hall, museums

### Visual Style
- Retro pixel art aesthetic
- Seasonal visual changes (green summer, white/blue winter, autumn colors)
- Buildings rendered as small pixel sprites on the map
- Water in blue, parks in green, streets in grey

---

## Properties

### Types
| Type | Examples | Revenue Model |
|------|----------|---------------|
| **Retail/Shop** | Stockmann, Fazer Café, Marimekko, Akateeminen | Monthly rent from tenants |
| **Restaurant/Bar** | Ravintola Sea Horse, Savoy, Bar Loose | Monthly revenue, event-sensitive |
| **Residential** | "Apartment building on Bulevardi", "Penthouse in Eira" | Monthly rent |
| **Office** | Office building in Ruoholahti, coworking space in Kamppi | Monthly rent, long leases |
| **Hotel** | Hotel Kämp, Scandic, Hotel Haven | Revenue varies by season/tourism |
| **Landmark/Special** | Allas Sea Pool, Suvilahti event space | Unique revenue mechanics |

### Real Helsinki Businesses (Sample Pool)
**Retail:**
- Stockmann (Kluuvi) — iconic department store
- Akateeminen Kirjakauppa (Kluuvi) — bookstore
- Marimekko flagship (Kamppi)
- Iittala store (Esplanadi)
- K-Supermarket Kamppi
- S-Market various locations
- Forum shopping centre (Kamppi)
- Citycenter (Kluuvi)

**Restaurants/Cafés:**
- Fazer Café (Kluuvi)
- Ravintola Savoy (Kluuvi/Esplanadi)
- Sea Horse (Punavuori)
- Zetor (Kamppi)
- Löyly (Hernesaari)
- Café Regatta (Töölö)
- Bar Loose (Kamppi)
- Ravintola Nokka (Katajanokka)

**Hotels:**
- Hotel Kämp (Kluuvi)
- Hotel Haven (Katajanokka)
- Scandic Grand Marina (Katajanokka)
- Radisson Blu Plaza (Kluuvi)
- Hotel St. George (Kamppi)
- Clarion Hotel Helsinki (Jätkäsaari)

**Residential (generic, district-based):**
- "Art Nouveau apartment in Eira"
- "Penthouse on Bulevardi"
- "Studio in Kallio"
- "Seaside apartment in Jätkäsaari"
- "Tower apartment in Merihaka"
- "Family home in Lauttasaari"
- "Renovated flat in Kruununhaka"
- "Loft in Punavuori"

**Offices:**
- "Office block in Ruoholahti"
- "Coworking space in Kamppi"
- "Startup hub in Sörnäinen"

### Property Generation
- Fixed pool of ~40 named real businesses always available in the game
- Additional procedurally generated properties drawn from realistic templates per district
- Total: ~80-120 properties on the map at game start
- New properties occasionally appear (development)

### Property Stats
- **Purchase price** (realistic-ish, in euros)
- **Monthly revenue** (base)
- **Condition** (0-100%, degrades over time)
- **Upgrade level** (1-5)
- **Tenant satisfaction** (affects revenue)
- **District prestige** (affects property value growth)

---

## Economy

### Starting Conditions
Two modes at game start:
- **Small Investor**: Start with €50,000 — buy kiosks, small shops, cheap apartments
- **Wealthy Investor**: Start with €500,000 — can immediately buy mid-range properties

### Pricing (approximate real scale)
- Kiosk/small shop: €30,000 - €80,000
- Restaurant/bar: €100,000 - €500,000
- Residential apartment: €80,000 - €400,000
- Penthouse/luxury: €500,000 - €2,000,000
- Office building: €300,000 - €2,000,000
- Hotel: €1,000,000 - €10,000,000
- Landmark: €2,000,000 - €20,000,000
- Stockmann (the whole thing): €50,000,000+

### Revenue
- Properties generate monthly income based on type, condition, upgrades, season, and events
- Hotels and restaurants are more seasonal (summer tourism boost)
- Offices provide stable but lower returns
- Residential is steady income

### Bank Loans
- Unlocked after month 3
- Borrow up to 2x your net worth
- Interest rate: 3-8% annually depending on difficulty
- Must make monthly payments

### Actions Per Turn
- **3 actions per turn** (base)
- Actions: Buy property, Sell property, Upgrade property, Repair property, Take loan, Repay loan
- Collecting rent is automatic (not an action)

---

## AI Rivals

### Characters
1. **Björn "Nansen" Wahlroos** (inspired by Nalle Wahlroos) — aggressive investor, targets premium properties, heavy use of leverage
2. **Hjallis Harkimo** — entertainment and sports focused, goes for event venues and restaurants
3. **Risto Siilasmaa** — tech-focused, prefers offices and modern developments in Jätkäsaari/Ruoholahti

### AI Behavior
- Each rival has personality-driven preferences
- They buy properties each turn (visible on map with their color)
- Bidding wars: if both player and AI want the same property, price goes up
- Rivals can be outbid but will sometimes counter-offer
- At higher difficulties, AI is more aggressive and has more starting capital

### Difficulty Levels
| Level | AI Starting Capital | AI Aggressiveness | Market Volatility | Player Actions |
|-------|-------------------|-------------------|-------------------|----------------|
| **Easy** | 50% of player | Low | Low | 4/turn |
| **Normal** | 100% of player | Medium | Medium | 3/turn |
| **Hard** | 150% of player | High | High | 3/turn |

---

## Seasons & Weather

### Seasonal Cycle
- Each turn = 1 month
- **Spring** (March-May): Tourism starts rising, construction season begins
- **Summer** (June-August): Peak tourism, +20-40% hotel/restaurant revenue, outdoor events
- **Autumn** (September-November): Tourism drops, business travel steady
- **Winter** (December-February): Low tourism (except Christmas), higher maintenance costs, heating costs

### Visual Changes
- Map color palette shifts with seasons
- Snow on buildings in winter
- Green parks in summer
- Autumn foliage colors

---

## Events

### Positive Events
- **Flow Festival** (August) — boosts Suvilahti/Sörnäinen area revenue +30%
- **Helsinki Christmas Market** (December) — Senate Square area +25%
- **Pride Parade** (June) — boosts Kamppi/Kallio restaurant/bar revenue +20%
- **Helsinki Design Week** (September) — Punavuori/Design District +25%
- **Slush Conference** (November) — office/hotel demand spike city-wide +15%
- **May Day / Vappu** (May) — restaurant/bar revenue +20% everywhere
- **Helsinki Festival** (August) — cultural venues +20%
- **Lux Helsinki** (January) — mild tourism boost in winter +10%

### Negative Events
- **Recession** — all revenue -20% for 3 months
- **Construction disruption** — random street blocked, affected properties -30% revenue for 2 months
- **Pipe burst** (winter) — random property needs emergency repair, costs €10,000-€50,000
- **Tenant dispute** — one property generates no revenue for 1 month
- **Harsh winter** — heating costs +50%, maintenance costs up
- **Market crash** — property values drop 15% for 6 months

### Special Events
- **Alien Invasion** (very rare, ~2% chance per year) — all properties in a random district lose 50% value, but if you hold them, they recover to 150% in 6 months ("tourism from the incident"). Fun chaos event.

---

## Win Conditions

### Campaign Mode
Three tiers:
- **Helsinki Newcomer**: Reach net worth of €1,000,000
- **Property Mogul**: Reach net worth of €10,000,000
- **King of Helsinki**: Reach net worth of €50,000,000

### Sandbox Mode
- No win condition, play indefinitely
- Track stats: total revenue earned, properties owned, years played

---

## UI Layout

```
+----------------------------------------------+
|  HELSINKI TYCOON          Month: Jan 2024     |
|  €125,000  |  Props: 3  |  Turn 5  | [Menu]  |
+----------------------------------------------+
|                                              |
|              SCROLLABLE MAP                  |
|           (Helsinki districts)               |
|          with property markers               |
|                                              |
+----------------------------------------------+
|  [Buy] [Sell] [Upgrade] [Repair] [Bank]      |
|  Actions remaining: 2/3                      |
+----------------------------------------------+
|  News: Flow Festival boosted Suvilahti!      |
|  Rival Nalle bought Hotel Kämp!              |
+----------------------------------------------+
|                [End Turn]                     |
+----------------------------------------------+
```

### Property Detail Panel
Clicking a property shows:
- Name, type, district
- Owner (player, rival, or available)
- Price / current value
- Monthly revenue
- Condition & upgrade level
- Buy/Sell/Upgrade buttons

---

## Technical Architecture

### Files
```
helsinki-tycoon/
├── index.html          — main page
├── css/
│   └── style.css       — all styling
├── js/
│   ├── main.js         — entry point, game loop
│   ├── map.js          — map rendering, scrolling, zoom
│   ├── districts.js    — district data and geography
│   ├── properties.js   — property definitions, generation
│   ├── economy.js      — money, loans, revenue calculation
│   ├── events.js       — event system
│   ├── rivals.js       — AI rival logic
│   ├── seasons.js      — seasonal effects
│   ├── ui.js           — UI panels, modals, notifications
│   └── game.js         — game state, turn management
├── assets/
│   └── (pixel art sprites, if any)
├── DESIGN.md           — this file
├── CHANGELOG.md        — feature/version log
├── DEVLOG.md           — internal progress/todo
└── README.md           — (later)
```

### Rendering
- HTML5 Canvas for the map
- DOM elements for UI panels overlaying the canvas
- Pixel art drawn procedurally or with small sprite assets

### State Management
- Single game state object
- Turn-based: process player actions → process AI → process events → update economy → render
