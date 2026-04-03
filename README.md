# HELSINGIN HERRA

### *(Lord of Helsinki)*

**A retro pixel-art real estate tycoon game set in the heart of Finland's capital.**

Buy corner shops in Kallio, flip luxury villas in Kaivopuisto, and outmaneuver three ruthless AI rivals -- all while dodging pipe bursts, market crashes, and the occasional alien invasion. Yes, aliens. Helsinki is a weird place.

No downloads, no installs, no frameworks. Just open `index.html` in your browser and start your empire.

---

## How to Play

**Open `index.html` in any modern browser.** That's it. No server needed.

You start with a modest pile of cash and a dream. Each turn represents one month. You get **3 actions per turn** (4 on Easy, or more if you hire a Property Manager) to:

- **Buy properties** -- click them on the map, check the numbers, make an offer
- **Upgrade** owned properties (up to Lv.5) to boost revenue
- **Repair** properties before they crumble and your tenants riot
- **Sell** when the price is right (15% transaction fee, because Helsinki bureaucracy)

Press **Space** to end your turn and watch the months roll by.

### The Goal

**Campaign mode:** Reach your net worth target (€50M / €100M / €200M) before you go bankrupt. Or just...

**Sandbox mode:** There is no goal. Buy everything. Become the landlord Helsinki never asked for.

---

## Game Systems

### Economy
- Revenue flows monthly based on property type, condition, season, and active events
- Winter boosts retail (Christmas shopping!), summer boosts hotels and restaurants
- Properties degrade 1-4% per month -- neglect them at your peril
- Bank loans unlock after month 3 (up to 2x your net worth)

### Events
Real Helsinki events affect the economy: **Flow Festival**, **Slush**, **Helsinki Pride**, **Christmas Markets**, and more. Also fake ones: recessions, pipe bursts, and a ~2% annual chance of **alien invasion** (property values crash, but tourism booms afterward -- buy the dip!).

### AI Rivals
Three Finnish business personalities compete for properties:
- **Nalle** (Bjorn Wahlroos) -- goes for premium properties
- **Hjallis** (Harry Harkimo) -- entertainment and hospitality focus
- **Risto** (Risto Siilasmaa) -- tech and office buildings

### Staff
Hire employees from the Staff panel to give you an edge:

| Staff | Effect | Base Salary |
|---|---|---|
| Maintenance Person | Auto-repairs one property/turn at 50% cost | €2K/mo |
| Property Manager | +1 action per turn | €5K/mo |
| Accountant | -1.5% loan interest rate | €3K/mo |
| Scout | Shows best ROI deal each turn | €1.5K/mo |

Salaries scale up as the game progresses. You can fire them anytime (no severance -- this is a game, not Finland's labor law simulator).

### Districts
23 districts modeled on real Helsinki geography, from downtown Kamppi to the islands of Kaskisaari and Kuusisaari. The map is pannable and zoomable with seasonal visual changes.

---

## Controls

| Key | Action |
|---|---|
| **Space** | End turn |
| **B** | Bank |
| **S** | Stats |
| **T** | Staff |
| **P** | My Properties |
| **L** | Turn log |
| **F** | Map filters |
| **M** | Menu (save/load) |
| **Esc** | Close any panel |
| **1-4** | Buy/Sell/Upgrade/Repair (when property panel is open) |
| **Ctrl+Shift+C** | Cheats (add money, free buy, repair all, max upgrades) |

Click and drag to pan the map. Scroll to zoom.

---

## Tech Stack

- **Zero dependencies.** Pure HTML5, CSS3, and vanilla JavaScript
- Canvas-based map renderer with pan/zoom
- Procedural ambient music via Web Audio API (season-aware, no audio files)
- All sound effects synthesized at runtime
- Saves to localStorage (auto-save + manual save)
- Works offline, works from `file://`, works on a potato

---

## Project Structure

```
helsinki-tycoon/
  index.html        -- game page
  css/style.css     -- dark retro pixel art theme
  js/
    districts.js    -- 23 Helsinki districts + coastline + landmarks
    properties.js   -- 33 named businesses + procedural generation
    economy.js      -- revenue, maintenance, loans
    events.js       -- 16 events + alien invasion
    seasons.js      -- seasonal revenue modifiers
    rivals.js       -- 3 AI competitors
    staff.js        -- hireable staff system
    sound.js        -- procedural Web Audio music & SFX
    changelog.js    -- embedded changelog for in-game viewer
    ui.js           -- all UI panels, hotkeys, portfolio, cheats
    game.js         -- game state, turn management, save/load
    map.js          -- canvas map renderer, minimap
    main.js         -- entry point
  DESIGN.md         -- full game design document
  CHANGELOG.md      -- version history
  DEVLOG.md         -- development notes
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history, or click the **CHANGELOG** button on the in-game start screen.

**Current version: v0.10.2**

---

## Credits

Made by **Schwerbelastung** with the help of Claude.

Built in Helsinki, for Helsinki. Kiitos!
