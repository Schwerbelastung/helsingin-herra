// Helsingin Herra - UI System
const UI = (() => {

    // Turn log history
    const turnLog = [];

    // Currently displayed property (for refreshing panel after end turn)
    let currentPanelProperty = null;

    // Filter state
    const filters = {
        type: 'all',    // 'all' or a specific type string
        price: 'all',   // 'all' or a price range key
        owner: 'all',   // 'all', 'forsale', 'player', 'rival'
        affordable: false, // true = show only unowned properties the player can afford
        fadeLandmarks: false, // true = fade landmark visibility
    };

    // Cheat state
    let freeBuyMode = false;
    let districtBuyMode = false;

    // Pending game start (held while tutorial prompt is shown)
    let pendingStart = null;

    function launchPendingGame() {
        if (!pendingStart) return;
        Sound.stopMenuMusic();
        Sound.playStartGame();
        const s = pendingStart;
        pendingStart = null;
        Game.start(s.capital, s.difficulty, s.mode, s.rivalCount, s.target, s.playerName, s.playerGender, s.playerPortrait);
    }

    function init() {
        setupStartScreen();
        setupActionButtons();
        setupPanelClose();
        setupFilters();
        setupSoundToggles();
        setupBankPanel();
        setupStatsPanel();
        setupStaffPanel();
        setupMenuPanel();
        loadUIScale();
        setupCheats();
        setupHotkeys();
        setupOfferAndUndo();
        setupPlayerOffer();
        setupNewsTicker();
        setupNoActionsFeedback();
        initDraggablePanels();
    }

    function showNoActionsToast() {
        const toast = document.getElementById('no-actions-toast');
        toast.classList.remove('hidden');
        // Force reflow so transition plays even if already visible
        void toast.offsetWidth;
        toast.classList.add('show');
        Sound.playEventNegative();
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    }

    function setupNoActionsFeedback() {
        const actionBtnIds = ['btn-buy', 'btn-sell', 'btn-upgrade', 'btn-repair', 'btn-make-offer'];

        // pointerdown fires on disabled buttons (unlike click)
        const panel = document.getElementById('property-panel');
        if (panel) {
            panel.addEventListener('pointerdown', (e) => {
                const btn = e.target.closest('button');
                if (!btn || !btn.disabled) return;
                if (!actionBtnIds.includes(btn.id)) return;
                if (GameState.actionsRemaining > 0) return;
                hidePropertyPanel();
                showNoActionsToast();
            });
        }

        // Portfolio panel upgrade/repair buttons
        const statsPanel = document.getElementById('stats-panel');
        if (statsPanel) {
            statsPanel.addEventListener('pointerdown', (e) => {
                const btn = e.target.closest('button');
                if (!btn || !btn.disabled) return;
                if (!btn.classList.contains('portfolio-upgrade-btn') && !btn.classList.contains('portfolio-repair-btn')) return;
                if (GameState.actionsRemaining > 0) return;
                showNoActionsToast();
            });
        }
    }

    function setupNewsTicker() {
        const ticker = document.getElementById('news-ticker');
        if (ticker) {
            ticker.addEventListener('click', () => {
                if (currentScoutProperty) {
                    // Jump to scout property
                    MapRenderer.zoomToProperty(currentScoutProperty);
                    showPropertyPanel(currentScoutProperty);
                    Sound.playClick();
                }
            });
            // Show clickable cursor when scout tip is available
            ticker.style.cursor = currentScoutProperty ? 'pointer' : 'default';
        }
    }

    function setupStartScreen() {
        // Option button selection
        document.querySelectorAll('.option-group').forEach(group => {
            group.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    Sound.init(); // ensure audio context on first interaction
                    Sound.startMenuMusic();
                    Sound.playClick();

                    // Show/hide campaign target based on mode
                    if (btn.dataset.mode) {
                        const targetSection = document.getElementById('campaign-target-section');
                        if (btn.dataset.mode === 'sandbox') {
                            targetSection.classList.add('hidden');
                        } else {
                            targetSection.classList.remove('hidden');
                        }
                    }

                    // Re-render portrait previews when gender changes
                    if (btn.dataset.gender) {
                        renderPortraitPreviews(btn.dataset.gender);
                    }
                });
            });
        });

        // Portrait picker
        function renderPortraitPreviews(gender) {
            document.querySelectorAll('#portrait-picker .portrait-option').forEach(canvas => {
                const variant = parseInt(canvas.dataset.portrait);
                MapRenderer.drawPlayerPortrait(canvas, gender, variant);
            });
        }

        document.querySelectorAll('#portrait-picker .portrait-option').forEach(canvas => {
            canvas.addEventListener('click', () => {
                document.querySelectorAll('#portrait-picker .portrait-option').forEach(c => c.classList.remove('selected'));
                canvas.classList.add('selected');
                Sound.playClick();
            });
        });

        // Initial render of portrait previews
        renderPortraitPreviews('male');

        // Start game button
        document.getElementById('btn-start-game').addEventListener('click', () => {
            Sound.init();
            Sound.playClick();

            // Stash selections for after the prompts
            const nameInput = document.getElementById('player-name-input');
            const enteredName = nameInput.value.trim();
            const playerName = enteredName || nameInput.placeholder;
            pendingStart = {
                playerName,
                playerGender: document.querySelector('.option-btn.selected[data-gender]')?.dataset.gender || 'male',
                playerPortrait: parseInt(document.querySelector('#portrait-picker .portrait-option.selected')?.dataset.portrait || '1'),
                capital: document.querySelector('.option-btn.selected[data-capital]')?.dataset.capital || 'small',
                difficulty: document.querySelector('.option-btn.selected[data-difficulty]')?.dataset.difficulty || 'normal',
                rivalCount: parseInt(document.querySelector('.option-btn.selected[data-rivals]')?.dataset.rivals ?? '3'),
                mode: document.querySelector('.option-btn.selected[data-mode]')?.dataset.mode || 'campaign',
                target: parseInt(document.querySelector('.option-btn.selected[data-target]')?.dataset.target || '50000000'),
            };
            document.getElementById('start-screen').classList.add('hidden');
            // If name was left blank, ask for confirmation before proceeding
            if (!enteredName) {
                document.getElementById('name-confirm-prompt').classList.remove('hidden');
            } else {
                document.getElementById('tutorial-prompt').classList.remove('hidden');
            }
        });

        // Name confirmation prompt buttons
        document.getElementById('name-confirm-yes').addEventListener('click', () => {
            Sound.playClick();
            document.getElementById('name-confirm-prompt').classList.add('hidden');
            document.getElementById('tutorial-prompt').classList.remove('hidden');
        });
        document.getElementById('name-confirm-no').addEventListener('click', () => {
            Sound.playClick();
            document.getElementById('name-confirm-prompt').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            const nameInput = document.getElementById('player-name-input');
            nameInput.focus();
            nameInput.select();
        });

        // Tutorial prompt buttons
        document.getElementById('tutorial-prompt-yes').addEventListener('click', () => {
            Sound.playClick();
            document.getElementById('tutorial-prompt').classList.add('hidden');
            launchPendingGame();
            showTutorial();
        });
        document.getElementById('tutorial-prompt-no').addEventListener('click', () => {
            Sound.playClick();
            document.getElementById('tutorial-prompt').classList.add('hidden');
            launchPendingGame();
        });

        // Continue button — loads auto-save (most recent turn)
        const continueBtn = document.getElementById('btn-continue-game');
        continueBtn.addEventListener('click', () => {
            Sound.init();
            Sound.stopMenuMusic();
            Sound.playStartGame();
            document.getElementById('start-screen').classList.add('hidden');
            // Prefer auto-save (most recent), fall back to manual
            if (!Game.loadAutoSave()) {
                Game.loadGame();
            }
        });

        // Show continue button if save exists
        updateStartScreenSaveInfo();

        // Changelog
        document.getElementById('btn-changelog').addEventListener('click', () => {
            Sound.init();
            Sound.playClick();
            showChangelog();
        });
        document.getElementById('changelog-close').addEventListener('click', () => {
            document.getElementById('changelog-overlay').classList.add('hidden');
        });

        // Tutorial
        document.getElementById('btn-tutorial').addEventListener('click', () => {
            Sound.init();
            Sound.playClick();
            showTutorial();
        });

        document.getElementById('btn-quit-game').addEventListener('click', () => {
            window.close();
        });
    }

    let changelogCache = null;

    function showChangelog() {
        const overlay = document.getElementById('changelog-overlay');
        const body = document.getElementById('changelog-body');

        if (!changelogCache) {
            changelogCache = markdownToHTML(CHANGELOG_MD);
        }
        body.innerHTML = changelogCache;
        overlay.classList.remove('hidden');
    }

    function markdownToHTML(md) {
        // Simple markdown converter for changelog format
        let html = '';
        let inList = false;
        for (const line of md.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed) {
                if (inList) { html += '</ul>'; inList = false; }
                continue;
            }
            if (trimmed.startsWith('# ')) {
                if (inList) { html += '</ul>'; inList = false; }
                continue; // skip top-level heading
            }
            if (trimmed.startsWith('## ')) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<h2>${trimmed.slice(3)}</h2>`;
            } else if (trimmed.startsWith('### ')) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<h3>${trimmed.slice(4)}</h3>`;
            } else if (trimmed.startsWith('---')) {
                if (inList) { html += '</ul>'; inList = false; }
                html += '<hr>';
            } else if (trimmed.startsWith('- ')) {
                if (!inList) { html += '<ul>'; inList = true; }
                html += `<li>${formatInlineMarkdown(trimmed.slice(2))}</li>`;
            } else if (trimmed.startsWith('  - ')) {
                // Sub-item — treat as regular list item
                if (!inList) { html += '<ul>'; inList = true; }
                html += `<li>${formatInlineMarkdown(trimmed.slice(4))}</li>`;
            }
        }
        if (inList) html += '</ul>';
        return html;
    }

    function formatInlineMarkdown(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.+?)`/g, '<code>$1</code>');
    }

    function formatSaveInfoLine(label, info) {
        if (!info) return null;
        const monthName = Seasons.getMonthName(info.month);
        return `${label}: Turn ${info.turn}, ${monthName} ${info.year} — €${formatMoney(info.money)}`;
    }

    function updateStartScreenSaveInfo() {
        const continueBtn = document.getElementById('btn-continue-game');
        const saveInfoEl = document.getElementById('save-info');
        const autoInfo = Game.getAutoSaveInfo();
        const manualInfo = Game.getManualSaveInfo();

        if (autoInfo || manualInfo) {
            continueBtn.classList.remove('hidden');
            saveInfoEl.classList.remove('hidden');
            const lines = [];
            if (autoInfo) lines.push(formatSaveInfoLine('Auto-save', autoInfo));
            if (manualInfo) lines.push(formatSaveInfoLine('Manual save', manualInfo));
            saveInfoEl.innerHTML = lines.join('<br>');
        } else {
            continueBtn.classList.add('hidden');
            saveInfoEl.classList.add('hidden');
        }
    }

    // =========================================================
    // TUTORIAL SYSTEM
    // =========================================================
    const TUTORIAL_STEPS = [
        {
            title: 'Welcome to Helsingin Herra!',
            body: `You are a real estate investor in Helsinki, Finland. Your goal is to build a property empire by buying, upgrading, and managing properties across the city's districts.

<strong>In Campaign mode</strong>, reach the target net worth to win.
<strong>In Sandbox mode</strong>, play endlessly and see how rich you can get.

You'll compete against up to 3 AI rivals who also buy properties!`,
        },
        {
            title: 'The Map',
            body: `The map shows Helsinki with its real districts, landmarks, and coastline.

<strong>Click on a property</strong> (coloured building) to see its details and buy it.
<strong>Scroll</strong> to zoom in/out. <strong>Drag</strong> to pan around.
The <strong>minimap</strong> in the top-right shows your current view.

Properties have coloured ground pads:
- <span style="color:#ffcc00">Gold</span> = yours
- <span style="color:#ff4444">Red/Blue/Cyan</span> = rival-owned
- No pad = available for purchase`,
        },
        {
            title: 'Buying & Managing Properties',
            body: `Each property has a <strong>type</strong> (retail, restaurant, hotel, office, residential, landmark), a <strong>price</strong>, and monthly <strong>revenue</strong>.

After buying, you can:
- <strong>Upgrade</strong> (up to Lv.5) to increase revenue
- <strong>Repair</strong> to restore condition (condition degrades over time and reduces income)
- <strong>Sell</strong> at 85% of current value

Tip: Keep properties in good condition! Below 25% you'll get warnings.`,
        },
        {
            title: 'Finding Properties with Filters',
            body: `Press <strong>F</strong> or click the <strong>Filter</strong> button to filter the map by property type, price range, district, or owner.

The most useful quick filter is <strong>"Can Afford &amp; Available"</strong> — it highlights only the properties you can currently buy with your cash on hand. Use it whenever you're not sure what's within your budget.

Other quick filters let you see only <strong>your properties</strong>, <strong>rival-owned</strong> ones, or <strong>unowned</strong> ones at a glance.

Tip: Filters update automatically each turn as your cash changes.`,
        },
        {
            title: 'Actions & Turns',
            body: `Each turn represents one month. You have <strong>5 actions per turn on Easy, 4 on Normal, 3 on Hard</strong>.

Actions are spent on: buying, selling, upgrading, or repairing.

Press <strong>Space</strong> or click <strong>End Turn</strong> to advance.
Each turn:
- You collect revenue from owned properties
- Maintenance costs are deducted
- Loan interest is charged
- Property conditions degrade slightly
- Random events may occur`,
        },
        {
            title: 'Economy & Events',
            body: `<strong>Bank</strong> (B): Take loans up to 2x your net worth. Interest is charged monthly.

<strong>Staff</strong> (T): Hire employees — a Maintenance Person auto-repairs, a Manager gives +1 action, an Accountant lowers interest, a Scout reveals deals.

<strong>Events</strong>: Helsinki events like Flow Festival, Slush, and Christmas Markets boost revenue. Watch out for recessions, pipe bursts, and the occasional strange event...

<strong>Seasons</strong> affect revenue: hotels boom in summer, retail peaks in winter.`,
        },
        {
            title: 'Controls',
            body: `<strong>Keyboard shortcuts:</strong>
<span style="color:#ffcc00">Space</span> — End Turn
<span style="color:#ffcc00">B</span> — Bank &nbsp; <span style="color:#ffcc00">S</span> — Stats &nbsp; <span style="color:#ffcc00">T</span> — Staff
<span style="color:#ffcc00">P</span> — My Properties &nbsp; <span style="color:#ffcc00">L</span> — Turn Log
<span style="color:#ffcc00">F</span> — Map Filter &nbsp; <span style="color:#ffcc00">M</span> — Menu (save/load)
<span style="color:#ffcc00">Esc</span> — Close any panel
<span style="color:#ffcc00">1-4</span> — Buy/Sell/Upgrade/Repair (when panel open)
<span style="color:#ffcc00">Ctrl+Shift+C</span> — Cheats

Good luck — become the Helsingin Herra!`,
        },
    ];

    let tutorialStep = 0;

    function showTutorial() {
        tutorialStep = 0;
        renderTutorialStep();
        document.getElementById('tutorial-overlay').classList.remove('hidden');
        // Wire up buttons (only once)
        const prevBtn = document.getElementById('tutorial-prev');
        const nextBtn = document.getElementById('tutorial-next');
        const skipBtn = document.getElementById('tutorial-skip');
        prevBtn.onclick = () => { if (tutorialStep > 0) { tutorialStep--; renderTutorialStep(); Sound.playClick(); } };
        nextBtn.onclick = () => {
            Sound.playClick();
            if (tutorialStep < TUTORIAL_STEPS.length - 1) {
                tutorialStep++;
                renderTutorialStep();
            } else {
                closeTutorial();
            }
        };
        skipBtn.onclick = () => { Sound.playClick(); closeTutorial(); };
    }

    function closeTutorial() {
        document.getElementById('tutorial-overlay').classList.add('hidden');
    }

    function renderTutorialStep() {
        const step = TUTORIAL_STEPS[tutorialStep];
        document.getElementById('tutorial-step-indicator').textContent = `${tutorialStep + 1}/${TUTORIAL_STEPS.length}`;
        document.getElementById('tutorial-body').innerHTML =
            `<div class="tutorial-title">${step.title}</div>` +
            `<div class="tutorial-text">${step.body}</div>`;
        document.getElementById('tutorial-prev').style.visibility = tutorialStep === 0 ? 'hidden' : 'visible';
        const nextBtn = document.getElementById('tutorial-next');
        nextBtn.textContent = tutorialStep === TUTORIAL_STEPS.length - 1 ? 'START' : 'NEXT';
    }

    function setupActionButtons() {
        document.getElementById('btn-end-turn').addEventListener('click', () => {
            Sound.playClick();
            Game.endTurn();
        });

        document.getElementById('btn-bank').addEventListener('click', () => {
            Sound.playClick();
            showBankPanel();
        });

        document.getElementById('btn-stats').addEventListener('click', () => {
            Sound.playClick();
            showStatsPanel();
        });

        document.getElementById('btn-portfolio').addEventListener('click', () => {
            Sound.playClick();
            togglePortfolio();
        });

        document.getElementById('btn-log').addEventListener('click', () => {
            Sound.playClick();
            toggleLogPanel();
        });

        document.getElementById('btn-filter').addEventListener('click', () => {
            Sound.playClick();
            toggleFilterPanel();
        });

        document.getElementById('btn-staff').addEventListener('click', () => {
            Sound.playClick();
            showStaffPanel();
        });

        document.getElementById('btn-menu').addEventListener('click', () => {
            Sound.playClick();
            showMenuPanel();
        });

        document.getElementById('btn-help').addEventListener('click', () => {
            Sound.playClick();
            showTutorial();
        });

        document.getElementById('btn-achievements').addEventListener('click', () => {
            Sound.playClick();
            showAchievementsPanel();
        });

        document.getElementById('btn-newspaper').addEventListener('click', () => {
            Sound.playClick();
            if (lastNewspaper && lastSwedishPaper) {
                // Both available — re-open the prompt so user can choose
                pendingNewspaper = lastNewspaper;
                pendingSwedishPaper = lastSwedishPaper;
                returnToPromptAfterClose = true;
                showNewspaperPrompt(lastNewspaper, lastSwedishPaper);
            } else if (lastNewspaper) {
                showNewspaper(lastNewspaper);
            } else if (lastSwedishPaper) {
                showNewspaper(lastSwedishPaper);
            }
        });

        document.getElementById('achievements-close').addEventListener('click', () => {
            Sound.playClick();
            document.getElementById('achievements-panel').classList.add('hidden');
        });
    }

    function setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger hotkeys when typing in inputs/prompts or start screen is visible
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (!document.getElementById('start-screen').classList.contains('hidden')) return;

            const key = e.key.toLowerCase();

            // Cheat panel toggle: Ctrl+Shift+C
            if (key === 'c' && e.ctrlKey && e.shiftKey) {
                e.preventDefault();
                toggleCheatPanel();
                return;
            }

            if (key === ' ') {
                e.preventDefault();
                Sound.playClick();
                Game.endTurn();
            } else if (key === 'b') {
                Sound.playClick();
                showBankPanel();
            } else if (key === 's') {
                Sound.playClick();
                showStatsPanel();
            } else if (key === 'p') {
                Sound.playClick();
                togglePortfolio();
            } else if (key === 'l') {
                Sound.playClick();
                toggleLogPanel();
            } else if (key === 'f') {
                Sound.playClick();
                toggleFilterPanel();
            } else if (key === 't') {
                Sound.playClick();
                showStaffPanel();
            } else if (key === 'm') {
                Sound.playClick();
                showMenuPanel();
            } else if (key === 'h') {
                Sound.playClick();
                showTutorial();
            } else if (key === 'u') {
                Game.undo();
            } else if (key === 'a') {
                Sound.playClick();
                showAchievementsPanel();
            } else if ((key === '1' || key === '2' || key === '3' || key === '4' || key === '5') &&
                       !document.getElementById('property-panel').classList.contains('hidden')) {
                // Property panel hotkeys
                const btnMap = { '1': 'btn-buy', '2': 'btn-sell', '3': 'btn-upgrade', '4': 'btn-repair', '5': 'btn-make-offer' };
                const btn = document.getElementById(btnMap[key]);
                if (btn && !btn.classList.contains('hidden') && !btn.disabled) {
                    Sound.playClick();
                    btn.click();
                }
            } else if (key === 'escape') {
                // Close any open panel
                hideLandmarkPanel();
                hidePropertyPanel();
                hideBankPanel();
                hideStatsPanel();
                hideStaffPanel();
                hideMenuPanel();
                document.getElementById('log-panel').classList.add('hidden');
                document.getElementById('filter-panel').classList.add('hidden');
                document.getElementById('btn-filter').classList.remove('filter-active');
                document.getElementById('portfolio-overlay').classList.add('hidden');
                // Close player offer dialog on escape
                if (!document.getElementById('player-offer-overlay').classList.contains('hidden')) {
                    hidePlayerOfferDialog();
                }
                // Decline offer on escape
                if (!document.getElementById('offer-overlay').classList.contains('hidden')) {
                    Game.declineOffer();
                }
                // Close newspaper on escape
                if (!document.getElementById('newspaper-overlay').classList.contains('hidden')) {
                    closeNewspaper();
                }
                // Dismiss newspaper prompt on escape
                if (!document.getElementById('newspaper-prompt').classList.contains('hidden')) {
                    hideNewspaperPrompt();
                }
                // Close Nokia press release on escape
                if (!document.getElementById('nokia-overlay').classList.contains('hidden')) {
                    closeNokiaDialog();
                }
                // Close auction on escape
                if (!document.getElementById('auction-overlay').classList.contains('hidden')) {
                    const resultVisible = !document.getElementById('auction-result').classList.contains('hidden');
                    if (resultVisible) {
                        Game.closeAuction();
                    } else {
                        Game.auctionPlayerDropout();
                    }
                }
                // Close achievements on escape
                document.getElementById('achievements-panel').classList.add('hidden');
                // Close tutorial on escape
                if (!document.getElementById('tutorial-overlay').classList.contains('hidden')) {
                    document.getElementById('tutorial-overlay').classList.add('hidden');
                }
                // Close victory on escape
                if (!document.getElementById('victory-overlay').classList.contains('hidden')) {
                    document.getElementById('victory-overlay').classList.add('hidden');
                }
            }
        });
    }

    function setupPanelClose() {
        // landmark-panel-close, panel-close, log-close removed — handled by injected window controls
        document.getElementById('portfolio-close').addEventListener('click', () => {
            document.getElementById('portfolio-overlay').classList.add('hidden');
        });
    }

    function updateHUD(gameState) {
        const season = Seasons.getCurrentSeason(gameState.month);
        document.getElementById('hud-month').textContent = Seasons.getMonthName(gameState.month);
        document.getElementById('hud-year').textContent = gameState.year;
        document.getElementById('hud-money').textContent = 'Cash: €' + formatMoney(gameState.money);
        document.getElementById('hud-properties').textContent = 'Properties: ' + gameState.properties.filter(p => p.owner === 'player').length;
        document.getElementById('hud-turn').textContent = 'Turn ' + gameState.turn;

        const seasonEl = document.getElementById('hud-season');
        seasonEl.textContent = season.charAt(0).toUpperCase() + season.slice(1);
        seasonEl.className = 'season-' + season;

        const totalActions = gameState.actionsPerTurn + Staff.getActionsBonus(gameState);
        document.getElementById('actions-remaining').textContent =
            `Actions: ${gameState.actionsRemaining}/${totalActions}`;

        // Keep panels in sync if open
        if (!document.getElementById('bank-panel').classList.contains('hidden')) {
            updateBankPanel();
        }
        if (!document.getElementById('stats-panel').classList.contains('hidden')) {
            updateStatsPanel();
        }

        // Refresh property panel buttons if open (e.g. after end turn grants more money)
        if (currentPanelProperty && !document.getElementById('property-panel').classList.contains('hidden')) {
            showPropertyPanel(currentPanelProperty);
        }

        // Update scoreboard
        updateScoreboard(gameState);
    }

    function updateScoreboard(gameState) {
        const sb = document.getElementById('scoreboard');
        if (!sb) return;

        const playerProps = gameState.properties.filter(p => p.owner === 'player').length;
        const playerNetWorth = Economy.calculateNetWorth(gameState);

        // Build entries: label, then player, then rivals sorted by net worth descending
        let html = '';
        html += `<span class="sb-label">Net Worth:</span>`;
        html += `<div class="sb-entry sb-player">`;
        html += `<span class="sb-dot" style="background:#ffcc00"></span>`;
        html += `<span class="sb-name">${GameState.playerName}</span>`;
        html += `<span class="sb-worth">€${formatMoney(playerNetWorth)}</span>`;
        html += `<span class="sb-props">${playerProps}p</span>`;
        html += `</div>`;

        const rivals = [...gameState.rivals].sort((a, b) => b.netWorth - a.netWorth);
        for (const rival of rivals) {
            html += `<span class="sb-separator">|</span>`;
            html += `<div class="sb-entry">`;
            html += `<span class="sb-dot" style="background:${rival.color}"></span>`;
            html += `<span class="sb-name">${rival.shortName}</span>`;
            html += `<span class="sb-worth">€${formatMoney(rival.netWorth)}</span>`;
            html += `<span class="sb-props">${rival.propertiesOwned}p</span>`;
            html += `</div>`;
        }

        // Show win target in campaign mode
        if (gameState.mode === 'campaign' && gameState.winTarget) {
            html += `<span class="sb-separator">|</span>`;
            html += `<span class="sb-goal">GOAL: €${formatMoney(gameState.winTarget)}</span>`;
        }

        sb.innerHTML = html;
    }

    function showLandmarkPanel(landmark) {
        if (!isPanelPinned('bank-panel')) hideBankPanel();
        if (!isPanelPinned('stats-panel')) hideStatsPanel();
        if (!isPanelPinned('staff-panel')) hideStaffPanel();
        if (!isPanelPinned('menu-panel')) hideMenuPanel();
        if (!isPanelPinned('property-panel')) hidePropertyPanel();
        const panel = document.getElementById('landmark-panel');
        document.getElementById('landmark-panel-title').textContent = landmark.name.toUpperCase();
        const body = document.getElementById('landmark-panel-body');
        body.innerHTML = '';
        const blurbs = landmark.blurb || ['No information available.'];
        for (const para of blurbs) {
            const p = document.createElement('p');
            p.textContent = para;
            body.appendChild(p);
        }
        panel.classList.remove('hidden');
        applyPanelPosition('landmark-panel');
    }

    function hideLandmarkPanel() {
        document.getElementById('landmark-panel').classList.add('hidden');
    }

    function showPropertyPanel(property) {
        if (!isPanelPinned('bank-panel')) hideBankPanel();
        if (!isPanelPinned('stats-panel')) hideStatsPanel();
        if (!isPanelPinned('staff-panel')) hideStaffPanel();
        if (!isPanelPinned('menu-panel')) hideMenuPanel();
        currentPanelProperty = property;
        const panel = document.getElementById('property-panel');
        panel.classList.remove('hidden');
        applyPanelPosition('property-panel');

        document.getElementById('panel-title').textContent = property.name;
        document.getElementById('panel-type').innerHTML = `<span>Type:</span><span>${property.type}</span>`;
        document.getElementById('panel-district').innerHTML = `<span>District:</span><span>${property.districtName}</span>`;
        document.getElementById('panel-owner').innerHTML = `<span>Owner:</span><span>${property.owner ? (property.owner === 'player' ? GameState.playerName : property.owner) : 'For Sale'}</span>`;
        document.getElementById('panel-price').innerHTML = `<span>Price:</span><span>€${formatMoney(property.price)}</span>`;
        document.getElementById('panel-revenue').innerHTML = `<span>Revenue/mo:</span><span>€${formatMoney(property.revenue)}</span>`;
        document.getElementById('panel-condition').innerHTML = `<span>Condition:</span><span>${Math.floor(property.condition)}%</span>`;
        document.getElementById('panel-upgrade').innerHTML = `<span>Upgrade:</span><span>Lv.${property.upgradeLevel}/${property.maxUpgrade}</span>`;

        // Show/hide action buttons
        const btnBuy = document.getElementById('btn-buy');
        const btnSell = document.getElementById('btn-sell');
        const btnUpgrade = document.getElementById('btn-upgrade');
        const btnRepair = document.getElementById('btn-repair');

        const btnOffer = document.getElementById('btn-make-offer');

        if (property.owner === null) {
            btnBuy.classList.remove('hidden');
            btnBuy.disabled = (!freeBuyMode && GameState.money < property.price) || GameState.actionsRemaining <= 0;
            btnBuy.onclick = () => Game.buyProperty(property);
            btnSell.classList.add('hidden');
            btnUpgrade.classList.add('hidden');
            btnRepair.classList.add('hidden');
            btnOffer.classList.add('hidden');
        } else if (property.owner === 'player') {
            btnBuy.classList.add('hidden');
            btnSell.classList.remove('hidden');
            btnSell.disabled = GameState.actionsRemaining <= 0;
            btnSell.onclick = () => Game.sellProperty(property);
            btnUpgrade.classList.remove('hidden');
            const upgCost = Properties.getUpgradeCost(property);
            btnUpgrade.disabled = !upgCost || GameState.money < upgCost || GameState.actionsRemaining <= 0;
            if (upgCost) {
                // Calculate projected upgrade values
                const newLevel = property.upgradeLevel + 1;
                const projRevenue = Math.floor(property.baseRevenue * (1 + (newLevel - 1) * 0.2));
                const projPrice = Math.floor(property.basePrice * (1 + (newLevel - 1) * 0.15));
                const revIncrease = projRevenue - property.revenue;
                btnUpgrade.innerHTML = `Upgrade (€${formatMoney(upgCost)}) <span class="hotkey">[3]</span>`;
                btnUpgrade.title = `+€${formatMoney(revIncrease)}/mo revenue, +€${formatMoney(projPrice - property.price)} value`;
            } else {
                btnUpgrade.innerHTML = 'MAX';
                btnUpgrade.title = 'Already fully upgraded';
            }
            btnUpgrade.onclick = () => Game.upgradeProperty(property);
            btnRepair.classList.remove('hidden');
            const repCost = Properties.getRepairCost(property);
            btnRepair.disabled = property.condition >= 95 || GameState.money < repCost || GameState.actionsRemaining <= 0;
            btnRepair.innerHTML = `Repair (€${formatMoney(repCost)}) <span class="hotkey">[4]</span>`;
            btnRepair.onclick = () => Game.repairProperty(property);
            btnOffer.classList.add('hidden');
        } else {
            // Rival-owned — show Make Offer button
            btnBuy.classList.add('hidden');
            btnSell.classList.add('hidden');
            btnUpgrade.classList.add('hidden');
            btnRepair.classList.add('hidden');
            const btnOffer = document.getElementById('btn-make-offer');
            btnOffer.classList.remove('hidden');
            btnOffer.disabled = GameState.actionsRemaining <= 0;
            btnOffer.onclick = () => showPlayerOfferDialog(property);
        }
    }

    function hidePropertyPanel() {
        currentPanelProperty = null;
        document.getElementById('property-panel').classList.add('hidden');
    }

    function showDistrictInfo(district) {
        // Count properties in district
        const props = GameState.properties.filter(p => p.district === district.id);
        const available = props.filter(p => p.owner === null).length;
        const playerOwned = props.filter(p => p.owner === 'player').length;

        setNewsText(`${district.name}: ${district.description} | ${props.length} properties (${available} for sale, ${playerOwned} yours)`);
    }

    function setNewsText(text) {
        const ticker = document.getElementById('news-ticker');
        const span = document.getElementById('news-text');
        // Reset to measure natural width
        ticker.classList.remove('scrolling');
        span.textContent = text;
        // Update cursor based on scout property availability
        ticker.style.cursor = currentScoutProperty ? 'pointer' : 'default';
        // Check if text overflows the ticker
        requestAnimationFrame(() => {
            if (span.scrollWidth > ticker.clientWidth) {
                // Duplicate text with separator for seamless loop
                span.textContent = text + '     ///     ' + text + '     ///     ';
                // Scale duration to text length (~60px per second)
                const duration = Math.max(15, span.scrollWidth / 60);
                ticker.style.setProperty('--scroll-duration', duration + 's');
                ticker.classList.add('scrolling');
            }
        });

        // Glow pulse on important messages
        ticker.classList.remove('ticker-pulse');
        void ticker.offsetWidth; // reflow to restart animation
        ticker.classList.add('ticker-pulse');

        // First-game nudge: show on turns 1-3, only once ever
        if (GameState.turn <= 3 && !localStorage.getItem('ht_ticker_nudge_seen')) {
            showTickerNudge();
        }
    }

    let tickerNudgeTimer = null;
    function showTickerNudge() {
        const nudge = document.getElementById('ticker-nudge');
        if (!nudge) return;
        localStorage.setItem('ht_ticker_nudge_seen', '1');
        nudge.classList.add('show');
        clearTimeout(tickerNudgeTimer);
        tickerNudgeTimer = setTimeout(() => {
            nudge.classList.remove('show');
        }, 4000);
    }

    let quirkPopupTimer = null;

    function showQuirkPopup(text) {
        const el = document.getElementById('quirk-popup');
        const textEl = document.getElementById('quirk-text');

        if (quirkPopupTimer) {
            clearTimeout(quirkPopupTimer);
            quirkPopupTimer = null;
        }

        textEl.textContent = text;
        // Shift above the newspaper prompt if it's visible
        const promptVisible = !document.getElementById('newspaper-prompt').classList.contains('hidden');
        el.style.bottom = promptVisible ? '140px' : '90px';
        el.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add('show'));
        });

        quirkPopupTimer = setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.classList.add('hidden'), 400);
            quirkPopupTimer = null;
        }, 5000);
    }

    let rivalQuipTimer = null;

    function showRivalQuip(rival, text) {
        const el = document.getElementById('rival-quip');
        const nameEl = document.getElementById('rival-quip-name');
        const textEl = document.getElementById('rival-quip-text');

        // Clear any existing timer
        if (rivalQuipTimer) {
            clearTimeout(rivalQuipTimer);
            rivalQuipTimer = null;
        }

        nameEl.textContent = rival.shortName.toUpperCase();
        nameEl.style.color = rival.color;
        el.style.borderColor = rival.color;
        textEl.textContent = text;

        const portraitCanvas = document.getElementById('rival-quip-portrait');
        if (portraitCanvas) MapRenderer.drawRivalPortrait(portraitCanvas, rival.id);

        el.classList.remove('hidden');
        // Trigger animation on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => el.classList.add('show'));
        });

        // Auto-hide after 6 seconds
        rivalQuipTimer = setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.classList.add('hidden'), 400);
            rivalQuipTimer = null;
        }, 6000);
    }

    function showBankPanel() {
        const panel = document.getElementById('bank-panel');
        // Toggle if already open
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        // Close other right-side panels (unless pinned)
        if (!isPanelPinned('property-panel')) hidePropertyPanel();
        if (!isPanelPinned('stats-panel')) hideStatsPanel();
        if (!isPanelPinned('staff-panel')) hideStaffPanel();
        if (!isPanelPinned('menu-panel')) hideMenuPanel();
        panel.classList.remove('hidden');
        applyPanelPosition('bank-panel');
        updateBankPanel();
    }

    function hideBankPanel() {
        document.getElementById('bank-panel').classList.add('hidden');
    }

    function updateBankPanel() {
        const locked = !Economy.canTakeLoan(GameState);
        const lockedDiv = document.getElementById('bank-locked');
        const withdrawBtns = document.querySelectorAll('.bank-withdraw');
        const repayBtns = document.querySelectorAll('.bank-repay');
        const repayAllBtn = document.querySelector('.bank-repay-all');

        // Info display
        document.getElementById('bank-loan').textContent = `€${GameState.loanAmount > 0 ? GameState.loanAmount.toLocaleString() : '0'}`;
        const effectiveRate = Math.max(0.01, GameState.loanInterestRate - Staff.getInterestReduction(GameState));
        const rateText = Staff.isHired(GameState, 'accountant')
            ? `${(effectiveRate * 100).toFixed(1)}%/yr (was ${(GameState.loanInterestRate * 100).toFixed(1)}%)`
            : `${(GameState.loanInterestRate * 100).toFixed(1)}%/yr`;
        document.getElementById('bank-rate').textContent = rateText;

        const monthlyPayment = GameState.loanAmount > 0
            ? Math.floor(GameState.loanAmount * GameState.loanInterestRate / 12)
            : 0;
        document.getElementById('bank-monthly').textContent = `€${monthlyPayment.toLocaleString()}/mo`;

        if (locked) {
            const turnsLeft = 3 - GameState.turn;
            lockedDiv.classList.remove('hidden');
            document.getElementById('bank-locked-text').textContent =
                `Bank loans unlock in ${turnsLeft} turn${turnsLeft === 1 ? '' : 's'}.`;
            document.getElementById('bank-credit').textContent = '—';
            withdrawBtns.forEach(btn => btn.disabled = true);
            // Still allow repay if they somehow have a loan
            const hasLoan = GameState.loanAmount > 0;
            repayBtns.forEach(btn => btn.disabled = !hasLoan || GameState.money < parseInt(btn.dataset.amount));
            if (repayAllBtn) repayAllBtn.disabled = !hasLoan || GameState.money <= 0;
        } else {
            lockedDiv.classList.add('hidden');
            const available = Economy.getAvailableCredit(GameState);
            document.getElementById('bank-credit').textContent = `€${available.toLocaleString()}`;

            // Enable/disable withdraw buttons
            withdrawBtns.forEach(btn => {
                const amt = parseInt(btn.dataset.amount);
                btn.disabled = amt > available;
            });

            // Enable/disable repay buttons
            const hasLoan = GameState.loanAmount > 0;
            repayBtns.forEach(btn => {
                const amt = parseInt(btn.dataset.amount);
                btn.disabled = !hasLoan || GameState.money < amt;
            });
            if (repayAllBtn) repayAllBtn.disabled = !hasLoan || GameState.money <= 0;
        }
    }

    function setupBankPanel() {
        // bank-close removed — handled by injected window controls

        // Withdraw buttons
        document.querySelectorAll('.bank-withdraw').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                if (Economy.takeLoan(GameState, amount)) {
                    Sound.playLoan();
                    updateHUD(GameState);
                    updateBankPanel();
                    setNewsText(`Withdrew €${formatMoney(amount)} from the bank.`);
                }
            });
        });

        // Repay buttons
        document.querySelectorAll('.bank-repay').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                const repayAmount = Math.min(amount, GameState.loanAmount, GameState.money);
                if (repayAmount > 0 && Economy.repayLoan(GameState, repayAmount)) {
                    Sound.playLoan();
                    updateHUD(GameState);
                    updateBankPanel();
                    setNewsText(`Repaid €${formatMoney(repayAmount)} on your loan.`);
                }
            });
        });

        // Repay All button
        const repayAllBtn = document.querySelector('.bank-repay-all');
        if (repayAllBtn) {
            repayAllBtn.addEventListener('click', () => {
                const repayAmount = Math.min(GameState.loanAmount, GameState.money);
                if (repayAmount > 0 && Economy.repayLoan(GameState, repayAmount)) {
                    Sound.playLoan();
                    updateHUD(GameState);
                    updateBankPanel();
                    setNewsText(`Repaid €${formatMoney(repayAmount)} on your loan. ${GameState.loanAmount === 0 ? 'Loan fully paid off!' : ''}`);
                }
            });
        }
    }

    function showStatsPanel() {
        const panel = document.getElementById('stats-panel');
        // Toggle if already open
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        // Close other right-side panels (unless pinned)
        if (!isPanelPinned('property-panel')) hidePropertyPanel();
        if (!isPanelPinned('bank-panel')) hideBankPanel();
        if (!isPanelPinned('staff-panel')) hideStaffPanel();
        if (!isPanelPinned('menu-panel')) hideMenuPanel();
        panel.classList.remove('hidden');
        applyPanelPosition('stats-panel');
        updateStatsPanel();
    }

    function hideStatsPanel() {
        document.getElementById('stats-panel').classList.add('hidden');
    }

    function renderBarGraph(history, label, getIncome, getExpense) {
        const count = Math.min(history.length, 12);
        if (count === 0) return `<div class="stats-graph-empty">No data yet</div>`;
        const data = history.slice(-count);
        // Find max value for scaling
        let maxVal = 0;
        for (const h of data) {
            maxVal = Math.max(maxVal, getIncome(h), getExpense(h));
        }
        if (maxVal === 0) maxVal = 1;

        let html = `<div class="stats-graph-label">${label}</div>`;
        html += '<div class="stats-graph">';
        for (const h of data) {
            const incH = Math.round((getIncome(h) / maxVal) * 100);
            const expH = Math.round((getExpense(h) / maxVal) * 100);
            html += '<div class="stats-graph-col">';
            html += `<div class="stats-bar-pair">`;
            html += `<div class="stats-bar income" style="height:${incH}%" title="Income: €${formatMoney(getIncome(h))}"></div>`;
            html += `<div class="stats-bar expense" style="height:${expH}%" title="Expenses: €${formatMoney(getExpense(h))}"></div>`;
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';
        // Legend
        html += '<div class="stats-graph-legend"><span class="legend-income">Income</span><span class="legend-expense">Expenses</span></div>';
        return html;
    }

    function renderLineGraph(history, label, getValue) {
        const count = Math.min(history.length, 12);
        if (count === 0) return '';
        const data = history.slice(-count);
        let maxVal = 0;
        let minVal = Infinity;
        for (const h of data) {
            const v = getValue(h);
            if (v > maxVal) maxVal = v;
            if (v < minVal) minVal = v;
        }
        const range = maxVal - minVal || 1;

        let html = `<div class="stats-graph-label">${label}</div>`;
        html += '<div class="stats-graph line-graph">';
        for (const h of data) {
            const v = getValue(h);
            const pct = Math.round(((v - minVal) / range) * 100);
            html += '<div class="stats-graph-col">';
            html += `<div class="stats-line-bar" style="height:${Math.max(pct, 2)}%" title="€${formatMoney(v)}"></div>`;
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    function updateStatsPanel() {
        const body = document.getElementById('stats-body');
        if (!body) return;

        const netWorth = Economy.calculateNetWorth(GameState);
        const playerProps = GameState.properties.filter(p => p.owner === 'player');
        const totalRevenue = playerProps.reduce((s, p) => s + p.revenue, 0);
        const totalValue = playerProps.reduce((s, p) => s + p.price, 0);

        let html = '';
        html += `<div class="stats-row"><span>Net Worth</span><span>€${formatMoney(netWorth)}</span></div>`;
        html += `<div class="stats-row"><span>Cash</span><span>€${formatMoney(GameState.money)}</span></div>`;
        html += `<div class="stats-row"><span>Properties</span><span>${playerProps.length}</span></div>`;
        html += `<div class="stats-row"><span>Portfolio Value</span><span>€${formatMoney(totalValue)}</span></div>`;
        html += `<div class="stats-row"><span>Revenue/mo</span><span>€${formatMoney(totalRevenue)}</span></div>`;
        html += `<div class="stats-row"><span>Loan</span><span>€${formatMoney(GameState.loanAmount || 0)}</span></div>`;
        html += `<div class="stats-row"><span>Total Earned</span><span>€${formatMoney(GameState.totalRevenueEarned || 0)}</span></div>`;
        if (GameState.staff.length > 0) {
            html += `<div class="stats-row"><span>Staff</span><span>${GameState.staff.length} (€${formatMoney(Staff.getTotalSalaries(GameState))}/mo)</span></div>`;
        }

        // Financial graphs
        if (GameState.financeHistory.length > 0) {
            html += '<div class="stats-divider"></div>';
            html += renderBarGraph(
                GameState.financeHistory,
                'Monthly Income vs Expenses (last 12 mo)',
                h => h.revenue,
                h => h.maintenance + h.loanPayment + h.staffSalaries
            );
            html += renderLineGraph(
                GameState.financeHistory,
                'Net Worth',
                h => h.netWorth
            );
        }

        if (GameState.rivals.length > 0) {
            html += '<div class="stats-divider"></div>';
            const rivals = [...GameState.rivals].sort((a, b) => b.netWorth - a.netWorth);
            for (const rival of rivals) {
                html += `<div class="stats-row rival"><span>${rival.name}</span><span>€${formatMoney(rival.netWorth)} (${rival.propertiesOwned}p)</span></div>`;
            }
        }

        if (GameState.mode === 'campaign') {
            html += '<div class="stats-divider"></div>';
            const progress = Math.floor((netWorth / GameState.winTarget) * 100);
            html += `<div class="stats-row goal"><span>Goal</span><span>€${formatMoney(GameState.winTarget)}</span></div>`;
            html += `<div class="stats-row goal"><span>Progress</span><span>${progress}%</span></div>`;
        }

        body.innerHTML = html;
    }

    function showMenuPanel() {
        const panel = document.getElementById('menu-panel');
        // Toggle if already open
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        // Close other right-side panels (unless pinned)
        if (!isPanelPinned('property-panel')) hidePropertyPanel();
        if (!isPanelPinned('bank-panel')) hideBankPanel();
        if (!isPanelPinned('stats-panel')) hideStatsPanel();
        if (!isPanelPinned('staff-panel')) hideStaffPanel();
        panel.classList.remove('hidden');
        applyPanelPosition('menu-panel');
        updateMenuPanel();
    }

    function hideMenuPanel() {
        document.getElementById('menu-panel').classList.add('hidden');
    }

    function updateMenuPanel() {
        const infoEl = document.getElementById('menu-info');
        if (!infoEl) return;

        const autoInfo = Game.getAutoSaveInfo();
        const manualInfo = Game.getManualSaveInfo();

        let html = '';
        if (autoInfo) {
            html += `<div>Auto-save: Turn ${autoInfo.turn}, ${Seasons.getMonthName(autoInfo.month)} ${autoInfo.year}</div>`;
        } else {
            html += '<div>Auto-save: none</div>';
        }
        if (manualInfo) {
            html += `<div>Manual: Turn ${manualInfo.turn}, ${Seasons.getMonthName(manualInfo.month)} ${manualInfo.year}</div>`;
        } else {
            html += '<div>Manual save: none</div>';
        }
        infoEl.innerHTML = html;

        // Enable/disable load and delete based on save existence
        document.getElementById('menu-load').disabled = !manualInfo;
        document.getElementById('menu-load-auto').disabled = !autoInfo;
        document.getElementById('menu-delete').disabled = !manualInfo;
    }

    function applyUIScale(scale) {
        document.documentElement.style.setProperty('--ui-scale', scale);
        // Update active button state
        document.querySelectorAll('.menu-scale-btn').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.scale) === scale);
        });
        // Persist
        try { localStorage.setItem('helsinkiTycoon_uiScale', scale); } catch {}
        // Re-render map to update advisor
        if (typeof MapRenderer !== 'undefined') {
            MapRenderer.resize();
            MapRenderer.render();
        }
    }

    function loadUIScale() {
        try {
            const saved = localStorage.getItem('helsinkiTycoon_uiScale');
            applyUIScale(saved ? parseFloat(saved) : 1);
        } catch {}
    }

    function setupMenuPanel() {
        // menu-close removed — handled by injected window controls

        // UI Scale buttons
        document.querySelectorAll('.menu-scale-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Sound.playClick();
                applyUIScale(parseFloat(btn.dataset.scale));
            });
        });

        document.getElementById('menu-save').addEventListener('click', () => {
            Sound.playClick();
            if (Game.saveGame()) {
                setNewsText(`Game saved at Turn ${GameState.turn}, ${Seasons.getMonthName(GameState.month)} ${GameState.year}.`);
                updateMenuPanel();
            } else {
                setNewsText('Save failed!');
            }
        });

        document.getElementById('menu-load').addEventListener('click', () => {
            Sound.playClick();
            if (Game.loadGame()) {
                hideMenuPanel();
            } else {
                setNewsText('No manual save found.');
            }
        });

        document.getElementById('menu-load-auto').addEventListener('click', () => {
            Sound.playClick();
            if (Game.loadAutoSave()) {
                hideMenuPanel();
            } else {
                setNewsText('No auto-save found.');
            }
        });

        document.getElementById('menu-delete').addEventListener('click', () => {
            Sound.playClick();
            Game.deleteSave();
            setNewsText('Manual save deleted.');
            updateMenuPanel();
        });

        document.getElementById('menu-restart').addEventListener('click', () => {
            Sound.playClick();
            restartToMainMenu();
        });

        document.getElementById('menu-quit').addEventListener('click', () => {
            Sound.playClick();
            window.close();
        });
    }

    function restartToMainMenu() {
        // Stop autopilot if active
        if (Game.isAutopilot()) Game.stopAutopilot();

        // Stop music/sounds and restore if muted by Finnish Silence
        Sound.restoreAll();
        Sound.stopMusic();

        // Hide all panels and overlays
        const panelIds = [
            'property-panel', 'landmark-panel', 'log-panel', 'filter-panel',
            'bank-panel', 'achievements-panel', 'stats-panel', 'menu-panel',
            'staff-panel', 'portfolio-overlay', 'cheat-panel', 'auction-overlay',
            'offer-overlay', 'player-offer-overlay', 'newspaper-overlay', 'newspaper-prompt',
            'nokia-overlay', 'victory-overlay', 'changelog-overlay',
            'name-confirm-prompt', 'tutorial-prompt', 'tutorial-overlay',
        ];
        panelIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        // Reset game state
        GameState.gameOver = false;
        GameState.victoryScreenShown = false;
        GameState.turn = 1;
        GameState.month = 0;
        GameState.year = 2024;
        GameState.money = 50000;
        GameState.properties = [];
        GameState.rivals = [];
        GameState.activeEvents = [];
        GameState.staff = [];
        GameState.loanAmount = 0;
        GameState.yearlyLog = [];
        GameState.financeHistory = [];
        GameState.silenceUntilNextTurn = false;

        // Show start screen and update save info
        document.getElementById('start-screen').classList.remove('hidden');
        updateStartScreenSaveInfo();
    }

    function setupStatsPanel() {
        // stats-close removed — handled by injected window controls
    }

    function showStaffPanel() {
        const panel = document.getElementById('staff-panel');
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        if (!isPanelPinned('property-panel')) hidePropertyPanel();
        if (!isPanelPinned('bank-panel')) hideBankPanel();
        if (!isPanelPinned('stats-panel')) hideStatsPanel();
        if (!isPanelPinned('menu-panel')) hideMenuPanel();
        panel.classList.remove('hidden');
        applyPanelPosition('staff-panel');
        updateStaffPanel();
    }

    function hideStaffPanel() {
        document.getElementById('staff-panel').classList.add('hidden');
    }

    function updateStaffPanel() {
        const body = document.getElementById('staff-body');
        if (!body) return;

        const totalSalary = Staff.getTotalSalaries(GameState);
        let html = '';

        // Salary scaling explanation
        html += `<div class="staff-panel-info">Salaries scale by 15% per year — staff become more expensive but more valuable over time.</div>`;

        if (GameState.staff.length > 0 || GameState.maintenanceTier > 0) {
            html += `<div class="staff-salary-total">Monthly salaries: <span>€${formatMoney(totalSalary)}</span></div>`;
        }

        // Maintenance Worker Widget
        html += `<div class="staff-section-title">Maintenance Worker</div>`;
        html += `<div class="maintenance-desc">Each tier repairs that exact number of damaged properties per turn at 50% cost. Tier 1 repairs 1, Tier 2 repairs 2, up to Tier 5 repairing 5—all fully repaired to 100% condition.</div>`;
        html += `<div class="maintenance-widget">`;
        const currentTier = Staff.getMaintenanceTier(GameState);
        for (let tier = 1; tier <= 5; tier++) {
            const tierDef = Staff.getMaintenanceTierDef(tier);
            const hired = currentTier === tier;
            const salary = Staff.getMaintenanceSalary(tier, GameState.turn);
            const hireCost = Staff.getMaintenanceHireCost(tier);
            const canAfford = GameState.money >= hireCost;

            html += `<div class="maintenance-row ${hired ? 'active' : ''}">`;
            html += `<div class="maint-tier-label">Tier ${tier}${hired ? ' ✓' : ''}</div>`;
            html += `<div class="maint-tier-costs">`;
            if (hired) {
                html += `<div>Salary: <span>€${formatMoney(salary)}/mo</span></div>`;
            } else {
                html += `<div>Hire: <span>€${formatMoney(hireCost)}</span> | <span>€${formatMoney(salary)}/mo</span></div>`;
            }
            html += `</div>`;
            if (hired) {
                html += `<button class="staff-fire-btn" data-maintenance-tier="${tier}">FIRE</button>`;
            } else {
                html += `<button class="staff-hire-btn" data-maintenance-tier="${tier}" ${canAfford ? '' : 'disabled'}>HIRE</button>`;
            }
            html += `</div>`;
        }
        html += `</div>`;

        // Other Staff
        html += `<div class="staff-section-title">Support Staff</div>`;
        for (const def of Staff.getDefinitions()) {
            const hired = Staff.isHired(GameState, def.id);
            const salary = Staff.getSalary(def.id, GameState.turn);
            const hireCost = Staff.getHireCost(def.id, GameState.turn);
            const canAfford = GameState.money >= hireCost;

            html += `<div class="staff-card ${hired ? 'hired' : ''}">`;
            html += `<div class="staff-card-name">${def.name}${hired ? ' ✓' : ''}</div>`;
            html += `<div class="staff-card-desc">${def.description}</div>`;
            html += `<div class="staff-card-cost">`;
            if (hired) {
                html += `Salary: <span>€${formatMoney(salary)}/mo</span>`;
            } else {
                html += `Hire: <span>€${formatMoney(hireCost)}</span> | Salary: <span>€${formatMoney(salary)}/mo</span>`;
            }
            html += `</div>`;
            if (hired) {
                html += `<button class="staff-fire-btn" data-staff-id="${def.id}">FIRE</button>`;
            } else {
                html += `<button class="staff-hire-btn" data-staff-id="${def.id}" ${canAfford ? '' : 'disabled'}>HIRE (€${formatMoney(hireCost)})</button>`;
            }
            html += `</div>`;
        }

        body.innerHTML = html;

        // Wire up maintenance hire buttons
        body.querySelectorAll('.staff-hire-btn[data-maintenance-tier]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tier = parseInt(btn.dataset.maintenanceTier);
                if (Staff.hireMaintenanceTier(GameState, tier)) {
                    Sound.playBuy();
                    updateHUD(GameState);
                    updateStaffPanel();
                    const tierDef = Staff.getMaintenanceTierDef(tier);
                    setNewsText(`Hired ${tierDef.name}!`);
                    addLogAction(`Hired ${tierDef.name}`);
                }
            });
        });

        // Wire up maintenance fire buttons
        body.querySelectorAll('.staff-fire-btn[data-maintenance-tier]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tier = parseInt(btn.dataset.maintenanceTier);
                const tierDef = Staff.getMaintenanceTierDef(tier);
                if (Staff.fireMaintenanceTier(GameState)) {
                    Sound.playSell();
                    updateHUD(GameState);
                    updateStaffPanel();
                    setNewsText(`Fired ${tierDef.name}.`);
                    addLogAction(`Fired ${tierDef.name}`);
                }
            });
        });

        // Wire up regular hire buttons
        body.querySelectorAll('.staff-hire-btn[data-staff-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.staffId;
                if (Staff.hire(GameState, id)) {
                    Sound.playBuy();
                    updateHUD(GameState);
                    updateStaffPanel();
                    const def = Staff.getDefinition(id);
                    setNewsText(`Hired ${def.name}!`);
                    addLogAction(`Hired ${def.name}`);
                }
            });
        });

        // Wire up regular fire buttons
        body.querySelectorAll('.staff-fire-btn[data-staff-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.staffId;
                if (Staff.fire(GameState, id)) {
                    Sound.playSell();
                    updateHUD(GameState);
                    updateStaffPanel();
                    const def = Staff.getDefinition(id);
                    setNewsText(`Fired ${def.name}.`);
                    addLogAction(`Fired ${def.name}`);
                }
            });
        });
    }

    function setupStaffPanel() {
        // staff-close removed — handled by injected window controls
    }

    // === CHEATS ===
    function toggleCheatPanel() {
        const panel = document.getElementById('cheat-panel');
        panel.classList.toggle('hidden');
    }

    function setupCheats() {
        // cheat-close removed — handled by injected window controls

        document.getElementById('cheat-10k').addEventListener('click', () => {
            GameState.money += 10000;
            updateHUD(GameState);
            Sound.playBuy();
            setNewsText('Cheat: +€10K');
        });

        document.getElementById('cheat-100k').addEventListener('click', () => {
            GameState.money += 100000;
            updateHUD(GameState);
            Sound.playBuy();
            setNewsText('Cheat: +€100K');
        });

        document.getElementById('cheat-1m').addEventListener('click', () => {
            GameState.money += 1000000;
            updateHUD(GameState);
            Sound.playBuy();
            setNewsText('Cheat: +€1M');
        });

        document.getElementById('cheat-free-buy').addEventListener('click', () => {
            freeBuyMode = !freeBuyMode;
            document.getElementById('cheat-free-buy').classList.toggle('active', freeBuyMode);
            document.getElementById('cheat-free-status').textContent = freeBuyMode
                ? 'ON — next property buy is free!'
                : 'OFF — click a property to buy for free';
            setNewsText(freeBuyMode ? 'Free Buy Mode ON' : 'Free Buy Mode OFF');
        });

        document.getElementById('cheat-district-buy').addEventListener('click', () => {
            districtBuyMode = !districtBuyMode;
            document.getElementById('cheat-district-buy').classList.toggle('active', districtBuyMode);
            document.getElementById('cheat-district-status').textContent = districtBuyMode
                ? 'ON — click a district on the map'
                : 'OFF — click a district to buy all its properties';
            setNewsText(districtBuyMode ? 'District Buy Mode ON — click a district' : 'District Buy Mode OFF');
        });

        document.getElementById('cheat-repair-all').addEventListener('click', () => {
            let count = 0;
            for (const p of GameState.properties) {
                if (p.owner === 'player' && p.condition < 100) {
                    p.condition = 100;
                    count++;
                }
            }
            updateHUD(GameState);
            MapRenderer.render();
            setNewsText(`Cheat: repaired ${count} properties to 100%`);
        });

        document.getElementById('cheat-bidding-war').addEventListener('click', () => {
            Sound.playClick();
            Game.cheatBiddingWar();
        });
        document.getElementById('cheat-rival-offer').addEventListener('click', () => {
            Sound.playClick();
            Game.cheatRivalOffer();
        });
        document.getElementById('cheat-easter-egg').addEventListener('click', () => {
            Sound.playClick();
            Game.cheatEasterEgg();
        });
        document.getElementById('cheat-max-upgrade').addEventListener('click', () => {
            let count = 0;
            for (const p of GameState.properties) {
                if (p.owner === 'player' && p.upgradeLevel < p.maxUpgrade) {
                    while (p.upgradeLevel < p.maxUpgrade) {
                        Properties.upgradeProperty(p);
                    }
                    count++;
                }
            }
            updateHUD(GameState);
            MapRenderer.render();
            setNewsText(`Cheat: maxed upgrades on ${count} properties`);
        });

        document.getElementById('cheat-autopilot').addEventListener('click', () => {
            const active = Game.isAutopilot();
            if (active) {
                Game.stopAutopilot();
            } else {
                Game.startAutopilot();
            }
            const nowActive = Game.isAutopilot();
            document.getElementById('cheat-autopilot').classList.toggle('active', nowActive);
            document.getElementById('cheat-autopilot-status').textContent = nowActive
                ? 'ON — the advisor is playing for you'
                : 'OFF — let the AI play for you';
        });
    }

    function isFreeBuyMode() {
        return freeBuyMode;
    }

    function clearFreeBuyMode() {
        freeBuyMode = false;
        const btn = document.getElementById('cheat-free-buy');
        if (btn) btn.classList.remove('active');
        const status = document.getElementById('cheat-free-status');
        if (status) status.textContent = 'OFF — click a property to buy for free';
    }

    function isDistrictBuyMode() {
        return districtBuyMode;
    }

    function clearDistrictBuyMode() {
        districtBuyMode = false;
        const btn = document.getElementById('cheat-district-buy');
        if (btn) btn.classList.remove('active');
        const status = document.getElementById('cheat-district-status');
        if (status) status.textContent = 'OFF — click a district to buy all its properties';
    }

    function clearAutopilotUI() {
        const btn = document.getElementById('cheat-autopilot');
        if (btn) btn.classList.remove('active');
        const status = document.getElementById('cheat-autopilot-status');
        if (status) status.textContent = 'OFF — let the AI play for you';
    }

    function formatEventEffect(event) {
        const parts = [];
        if (event.revenueModifier) {
            const pct = Math.round(event.revenueModifier * 100);
            parts.push(`${pct > 0 ? '+' : ''}${pct}% revenue`);
        }
        if (event.valueModifier) {
            const pct = Math.round(event.valueModifier * 100);
            parts.push(`${pct > 0 ? '+' : ''}${pct}% property values`);
        }
        if (event.maintenanceModifier) {
            const pct = Math.round(event.maintenanceModifier * 100);
            parts.push(`+${pct}% maintenance costs`);
        }
        if (event.immediateCost) {
            parts.push(`-€${formatMoney(event.immediateCost)} emergency cost`);
        }
        if (event.affectedDistricts && event.affectedDistricts.length > 0) {
            const districtNames = event.affectedDistricts.map(id => {
                const d = HelsinkiDistricts.districts.find(d => d.id === id);
                return d ? d.name : id;
            });
            parts.push(`in ${districtNames.join(', ')}`);
        } else if (event.global) {
            parts.push('city-wide');
        }
        if (event.duration > 1) {
            parts.push(`${event.duration} months`);
        }
        if (event.recoveryModifier) {
            if (event.recoveryModifier > 1) {
                parts.push(`recovers to ${Math.round(event.recoveryModifier * 100)}% of original`);
            } else {
                parts.push('prices recover after');
            }
        }
        return parts.join(' | ');
    }

    function showEventNotification(event) {
        const prefix = event.special ? '👽 ' : event.positive ? '📈 ' : '📉 ';
        const effect = formatEventEffect(event);
        setNewsText(`${prefix}${event.name}: ${event.description}${effect ? ' [' + effect + ']' : ''}`);
    }

    function showTurnSummary(summary) {
        // Build ticker text
        const tickerParts = [];
        if (summary.revenue > 0) tickerParts.push(`Revenue: +€${formatMoney(summary.revenue)}`);
        if (summary.maintenance > 0) tickerParts.push(`Maint: -€${formatMoney(summary.maintenance)}`);
        if (summary.loanPayment > 0) tickerParts.push(`Loan: -€${formatMoney(summary.loanPayment)}`);
        if (summary.staffSalaries > 0) tickerParts.push(`Staff: -€${formatMoney(summary.staffSalaries)}`);
        tickerParts.push(`Net: ${summary.netIncome >= 0 ? '+' : ''}€${formatMoney(summary.netIncome)}`);

        // Staff action results
        if (summary.staffResults && summary.staffResults.length > 0) {
            for (const msg of summary.staffResults) {
                if (typeof msg === 'object' && msg.text) {
                    tickerParts.push(msg.text);
                    if (msg.scoutProperty) {
                        currentScoutProperty = msg.scoutProperty;
                    }
                } else {
                    tickerParts.push(msg);
                }
            }
        }

        if (summary.rivalActions && summary.rivalActions.length > 0) {
            for (const action of summary.rivalActions) {
                tickerParts.push(`${action.rival} bought ${action.property}`);
            }
        }

        if (summary.newEvents && summary.newEvents.length > 0) {
            for (const event of summary.newEvents) {
                const prefix = event.special ? '👽' : event.councilVote ? (event.positive ? '🏛️' : '🏛️') : event.positive ? '📈' : '📉';
                const effect = formatEventEffect(event);
                tickerParts.push(`${prefix} ${event.name}${effect ? ' [' + effect + ']' : ''}`);
            }
        }

        // Condition warnings for player properties
        const warnProps = GameState.properties.filter(p => p.owner === 'player' && p.condition < 25);
        for (const p of warnProps) {
            const cond = Math.floor(p.condition);
            tickerParts.push(`⚠ ${p.name} condition ${cond}%!`);
        }

        setNewsText(tickerParts.join(' | '));

        // Build structured log entry
        const logEntry = {
            turn: GameState.turn - 1, // endTurn already incremented
            month: Seasons.getMonthName(GameState.month === 0 ? 11 : GameState.month - 1),
            year: GameState.month === 0 ? GameState.year - 1 : GameState.year,
            lines: [],
        };

        // Finances
        if (summary.revenue > 0 || summary.maintenance > 0 || summary.loanPayment > 0 || summary.staffSalaries > 0) {
            const netClass = summary.netIncome >= 0 ? 'income-positive' : 'income-negative';
            let finText = `Revenue: +€${formatMoney(summary.revenue)} | Maintenance: -€${formatMoney(summary.maintenance)}`;
            if (summary.loanPayment > 0) finText += ` | Loan: -€${formatMoney(summary.loanPayment)}`;
            if (summary.staffSalaries > 0) finText += ` | Staff: -€${formatMoney(summary.staffSalaries)}`;
            logEntry.lines.push({ text: finText, cls: '' });
            logEntry.lines.push({ text: `Net income: ${summary.netIncome >= 0 ? '+' : ''}€${formatMoney(summary.netIncome)}`, cls: netClass });
        }

        // Staff effects
        if (summary.staffResults && summary.staffResults.length > 0) {
            for (const msg of summary.staffResults) {
                const text = typeof msg === 'object' && msg.text ? msg.text : msg;
                logEntry.lines.push({ text, cls: 'income-positive' });
            }
        }

        // Events
        if (summary.newEvents && summary.newEvents.length > 0) {
            for (const event of summary.newEvents) {
                const effect = formatEventEffect(event);
                const cls = event.special ? 'event-special' : event.positive ? 'event-positive' : 'event-negative';
                logEntry.lines.push({ text: `${event.name}: ${event.description}`, cls });
                if (effect) {
                    logEntry.lines.push({ text: `  Effect: ${effect}`, cls });
                }
            }
        }

        // Rival actions
        if (summary.rivalActions && summary.rivalActions.length > 0) {
            for (const action of summary.rivalActions) {
                logEntry.lines.push({ text: `${action.rival} bought ${action.property} in ${action.district}`, cls: 'rival-action' });
            }
        }

        // Condition warnings
        if (warnProps.length > 0) {
            for (const p of warnProps) {
                logEntry.lines.push({ text: `⚠ ${p.name} condition critical: ${Math.floor(p.condition)}%`, cls: 'income-negative' });
            }
        }

        turnLog.unshift(logEntry); // newest first
        if (turnLog.length > 120) turnLog.pop(); // cap history
        renderLogPanel();
    }

    function toggleLogPanel() {
        const panel = document.getElementById('log-panel');
        // Close filter panel if open (unless pinned)
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        if (!isPanelPinned('filter-panel')) {
            document.getElementById('filter-panel').classList.add('hidden');
            document.getElementById('btn-filter').classList.remove('filter-active');
        }
        panel.classList.remove('hidden');
        applyPanelPosition('log-panel');
        renderLogPanel();
    }

    function addLogAction(text) {
        // Add a player action to the current turn's log, or create a new entry
        const currentMonth = Seasons.getMonthName(GameState.month);
        const currentYear = GameState.year;
        const currentTurn = GameState.turn;

        // Check if top entry is for the current turn
        if (turnLog.length > 0 && turnLog[0].turn === currentTurn) {
            turnLog[0].lines.push({ text, cls: 'income-positive' });
        } else {
            turnLog.unshift({
                turn: currentTurn,
                month: currentMonth,
                year: currentYear,
                lines: [{ text, cls: 'income-positive' }],
            });
        }
        renderLogPanel();
    }

    function renderLogPanel() {
        const container = document.getElementById('log-entries');
        if (!container) return;

        if (turnLog.length === 0) {
            container.innerHTML = '<div class="log-entry"><div class="log-line">No turns yet.</div></div>';
            return;
        }

        let html = '';
        for (const entry of turnLog) {
            html += '<div class="log-entry">';
            html += `<div class="log-date">Turn ${entry.turn} — ${entry.month} ${entry.year}</div>`;
            for (const line of entry.lines) {
                html += `<div class="log-line ${line.cls}">${line.text}</div>`;
            }
            html += '</div>';
        }
        container.innerHTML = html;
    }

    function showWinScreen() {
        const overlay = document.getElementById('victory-overlay');
        const statsEl = document.getElementById('victory-stats');
        const trophiesEl = document.getElementById('victory-trophies');

        // --- Stats ---
        const netWorth = Economy.calculateNetWorth(GameState);
        const playerProps = GameState.properties.filter(p => p.owner === 'player');
        const totalValue = playerProps.reduce((s, p) => s + p.price, 0);
        const totalRevenue = playerProps.reduce((s, p) => s + p.revenue, 0);
        const avgCondition = playerProps.length > 0
            ? playerProps.reduce((s, p) => s + p.condition, 0) / playerProps.length : 0;
        const years = Math.floor((GameState.turn - 1) / 12);
        const months = (GameState.turn - 1) % 12;
        const timeStr = years > 0 ? `${years}y ${months}m` : `${months}m`;

        let statsHtml = '';
        const stat = (label, val) => `<div class="victory-stat"><span>${label}</span><span>${val}</span></div>`;
        statsHtml += stat('Net Worth', `€${formatMoney(netWorth)}`);
        statsHtml += stat('Cash', `€${formatMoney(GameState.money)}`);
        statsHtml += stat('Properties', playerProps.length);
        statsHtml += stat('Portfolio Value', `€${formatMoney(totalValue)}`);
        statsHtml += stat('Monthly Revenue', `€${formatMoney(totalRevenue)}`);
        statsHtml += stat('Total Earned', `€${formatMoney(GameState.totalRevenueEarned || 0)}`);
        statsHtml += stat('Loan', `€${formatMoney(GameState.loanAmount || 0)}`);
        statsHtml += stat('Staff', GameState.staff.length > 0 ? GameState.staff.length : 'None');
        statsHtml += stat('Avg Condition', `${Math.floor(avgCondition)}%`);
        statsHtml += stat('Time Played', `${timeStr} (${GameState.turn - 1} turns)`);
        statsEl.innerHTML = statsHtml;

        // --- Trophies ---
        const trophies = calculateTrophies(playerProps, avgCondition);
        let trophyHtml = '';
        for (const t of trophies.slice(0, 3)) {
            trophyHtml += `<div class="trophy-card">`;
            trophyHtml += `<div class="trophy-icon">${t.icon}</div>`;
            trophyHtml += `<div class="trophy-info"><div class="trophy-name">${t.name}</div><div class="trophy-desc">${t.desc}</div></div>`;
            trophyHtml += `</div>`;
        }
        trophiesEl.innerHTML = trophyHtml;

        // Continue button
        document.getElementById('victory-continue').onclick = () => {
            overlay.classList.add('hidden');
            GameState.gameOver = false; // allow sandbox play after winning
        };

        overlay.classList.remove('hidden');
    }

    function calculateTrophies(playerProps, avgCondition) {
        const trophies = [];

        // Condition-based
        if (avgCondition >= 75) {
            trophies.push({ icon: '🔧', name: 'Maintenance King', desc: `Average condition ${Math.floor(avgCondition)}% — your properties shine.`, priority: 3 });
        } else if (playerProps.length > 0 && avgCondition < 25) {
            trophies.push({ icon: '🏚', name: 'Slumlord', desc: `Average condition ${Math.floor(avgCondition)}% — your tenants are not happy.`, priority: 3 });
        }

        // Type specialization
        if (playerProps.length >= 3) {
            const typeCounts = {};
            for (const p of playerProps) {
                typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
            }
            const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
            const ratio = topType[1] / playerProps.length;
            if (ratio >= 0.5) {
                const typeLabels = {
                    retail: { icon: '🛍', name: 'Retail Baron', desc: `${topType[1]} retail properties — Helsinki shops for you.` },
                    restaurant: { icon: '🍽', name: 'Restaurant Mogul', desc: `${topType[1]} restaurants — you feed the city.` },
                    hotel: { icon: '🏨', name: 'Hotel Magnate', desc: `${topType[1]} hotels — tourists fill your rooms.` },
                    office: { icon: '🏢', name: 'Office Tycoon', desc: `${topType[1]} offices — corporate Helsinki is yours.` },
                    residential: { icon: '🏠', name: 'Housing King', desc: `${topType[1]} residential properties — Helsinki lives in your buildings.` },
                };
                const label = typeLabels[topType[0]] || { icon: '🏗', name: 'Specialist', desc: `${topType[1]} ${topType[0]} properties.` };
                trophies.push({ ...label, priority: 2 });
            }
        }

        // Speed
        if (GameState.turn <= 60) {
            trophies.push({ icon: '⚡', name: 'Speed Runner', desc: `Won in just ${GameState.turn - 1} turns — Helsinki never saw you coming.`, priority: 4 });
        }

        // Property count
        if (playerProps.length >= 30) {
            trophies.push({ icon: '🏙', name: 'Empire Builder', desc: `${playerProps.length} properties — you own half the city.`, priority: 2 });
        }

        // High average upgrade level
        if (playerProps.length >= 5) {
            const avgUpgrade = playerProps.reduce((s, p) => s + p.upgradeLevel, 0) / playerProps.length;
            if (avgUpgrade >= 3) {
                trophies.push({ icon: '💎', name: 'Fully Upgraded', desc: `Avg upgrade Lv.${avgUpgrade.toFixed(1)} — premium properties across the board.`, priority: 2 });
            }
        }

        // Debt-free
        if ((GameState.loanAmount || 0) === 0) {
            trophies.push({ icon: '🏦', name: 'Debt Free', desc: 'No outstanding loans — a clean balance sheet.', priority: 1 });
        }

        // Cash Machine — scale threshold to 2x the win target
        const cashThreshold = GameState.winTarget * 2;
        if ((GameState.totalRevenueEarned || 0) >= cashThreshold) {
            trophies.push({ icon: '💰', name: 'Cash Machine', desc: `€${formatMoney(GameState.totalRevenueEarned)} total revenue — more than twice the goal.`, priority: 1 });
        }

        // Diverse portfolio (3+ types)
        if (playerProps.length >= 5) {
            const types = new Set(playerProps.map(p => p.type));
            if (types.size >= 4) {
                trophies.push({ icon: '🎯', name: 'Diversified', desc: `${types.size} different property types — a balanced portfolio.`, priority: 1 });
            }
        }

        // Sort by priority descending and return top 3
        trophies.sort((a, b) => b.priority - a.priority);
        return trophies;
    }

    // === PORTFOLIO ===
    let portfolioSortKey = 'name';
    let portfolioSortDir = 'asc';
    let currentScoutProperty = null;

    function togglePortfolio() {
        const overlay = document.getElementById('portfolio-overlay');
        if (overlay.classList.contains('hidden')) {
            renderPortfolio();
            setupPortfolioSortHeaders();
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    function setupPortfolioSortHeaders() {
        document.querySelectorAll('#portfolio-table th[data-sort]').forEach(th => {
            // Remove old listeners by replacing element
            const newTh = th.cloneNode(true);
            th.parentNode.replaceChild(newTh, th);
            newTh.addEventListener('click', () => {
                const key = newTh.dataset.sort;
                if (portfolioSortKey === key) {
                    portfolioSortDir = portfolioSortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    portfolioSortKey = key;
                    portfolioSortDir = 'asc';
                }
                renderPortfolio();
            });
        });
    }

    function renderPortfolio() {
        const tbody = document.getElementById('portfolio-tbody');
        const summary = document.getElementById('portfolio-summary');
        if (!tbody) return;

        const playerProps = GameState.properties.filter(p => p.owner === 'player');

        if (playerProps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="portfolio-empty">You don\'t own any properties yet.</td></tr>';
            summary.innerHTML = '';
            updatePortfolioSortIndicators();
            return;
        }

        // Compute ROI for sorting
        const withROI = playerProps.map(p => ({
            ...p,
            roi: p.price > 0 ? (p.revenue / p.price * 100) : 0,
        }));

        // Sort
        withROI.sort((a, b) => {
            let va = a[portfolioSortKey];
            let vb = b[portfolioSortKey];
            if (typeof va === 'string') {
                va = va.toLowerCase();
                vb = (vb || '').toLowerCase();
            }
            if (va < vb) return portfolioSortDir === 'asc' ? -1 : 1;
            if (va > vb) return portfolioSortDir === 'asc' ? 1 : -1;
            return 0;
        });

        // Summary
        const totalValue = playerProps.reduce((s, p) => s + p.price, 0);
        const totalRevenue = playerProps.reduce((s, p) => s + p.revenue, 0);
        const avgCondition = playerProps.reduce((s, p) => s + p.condition, 0) / playerProps.length;
        const avgROI = totalValue > 0 ? (totalRevenue / totalValue * 100) : 0;
        summary.innerHTML =
            `${playerProps.length} properties | Value: €${formatMoney(totalValue)} | Rev: €${formatMoney(totalRevenue)}/mo | Avg cond: ${Math.floor(avgCondition)}% | Avg ROI: ${avgROI.toFixed(1)}%`;

        // Render rows
        let html = '';
        for (const p of withROI) {
            const condCls = p.condition >= 75 ? 'cond-good' :
                            p.condition >= 50 ? 'cond-fair' :
                            p.condition >= 25 ? 'cond-poor' : 'cond-bad';
            const realProp = GameState.properties.find(rp => rp.id === p.id);
            const repCost = Properties.getRepairCost(realProp);
            const canRepair = p.condition < 95 && GameState.money >= repCost && GameState.actionsRemaining > 0;
            html += `<tr data-prop-id="${p.id}">`;
            html += `<td>${p.name}</td>`;
            html += `<td>${p.type}</td>`;
            html += `<td>${p.districtName}</td>`;
            html += `<td>€${formatMoney(p.price)}</td>`;
            html += `<td>€${formatMoney(p.revenue)}</td>`;
            html += `<td>${p.roi.toFixed(1)}%</td>`;
            html += `<td class="${condCls}">${Math.floor(p.condition)}%</td>`;
            html += `<td>Lv.${p.upgradeLevel}/${p.maxUpgrade}</td>`;
            // Upgrade column
            const upgCost = Properties.getUpgradeCost(realProp);
            const canUpgrade = upgCost && GameState.money >= upgCost && GameState.actionsRemaining > 0;
            if (upgCost) {
                html += `<td class="portfolio-upgrade-cell"><button class="portfolio-upgrade-btn" data-upgrade-id="${p.id}" ${canUpgrade ? '' : 'disabled'}>€${formatMoney(upgCost)}</button></td>`;
            } else {
                html += `<td class="portfolio-upgrade-cell"><span class="cond-good">MAX</span></td>`;
            }
            // Repair column
            if (p.condition >= 95) {
                html += `<td class="portfolio-repair-cell"><span class="cond-good">OK</span></td>`;
            } else {
                html += `<td class="portfolio-repair-cell"><button class="portfolio-repair-btn" data-repair-id="${p.id}" ${canRepair ? '' : 'disabled'}>€${formatMoney(repCost)}</button></td>`;
            }
            // Go column
            html += `<td class="portfolio-go-cell"><button class="portfolio-go-btn" data-go-id="${p.id}">→</button></td>`;
            html += `</tr>`;
        }
        tbody.innerHTML = html;

        // Upgrade buttons
        tbody.querySelectorAll('.portfolio-upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // don't trigger row click
                const propId = btn.dataset.upgradeId;
                const prop = GameState.properties.find(p => p.id === propId);
                if (prop) {
                    Game.upgradeProperty(prop);
                    renderPortfolio(); // re-render to update upgrade level/buttons
                }
            });
        });

        // Repair buttons
        tbody.querySelectorAll('.portfolio-repair-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // don't trigger row click
                const propId = btn.dataset.repairId;
                const prop = GameState.properties.find(p => p.id === propId);
                if (prop) {
                    Game.repairProperty(prop);
                    renderPortfolio(); // re-render to update condition/buttons
                }
            });
        });

        // Go-to buttons
        tbody.querySelectorAll('.portfolio-go-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // don't trigger row click
                const propId = btn.dataset.goId;
                const prop = GameState.properties.find(p => p.id === propId);
                if (prop) {
                    // Close portfolio, zoom to property, select it
                    document.getElementById('portfolio-overlay').classList.add('hidden');
                    MapRenderer.zoomToProperty(prop);
                    showPropertyPanel(prop);
                }
            });
        });

        // Click row to open property on map
        tbody.querySelectorAll('tr[data-prop-id]').forEach(row => {
            row.addEventListener('click', () => {
                const propId = row.dataset.propId;
                const prop = GameState.properties.find(p => p.id === propId);
                if (prop) {
                    document.getElementById('portfolio-overlay').classList.add('hidden');
                    showPropertyPanel(prop);
                }
            });
        });

        updatePortfolioSortIndicators();
    }

    function updatePortfolioSortIndicators() {
        document.querySelectorAll('#portfolio-table th[data-sort]').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === portfolioSortKey) {
                th.classList.add(portfolioSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }

    function setupSoundToggles() {
        document.getElementById('btn-toggle-music').addEventListener('click', () => {
            const on = Sound.toggleMusic();
            const btn = document.getElementById('btn-toggle-music');
            btn.classList.toggle('muted', !on);
            btn.title = on ? 'Toggle Music (ON)' : 'Toggle Music (OFF)';
        });
        document.getElementById('music-style-select').addEventListener('change', (e) => {
            Sound.setMusicStyle(e.target.value);
        });
        document.getElementById('btn-toggle-sfx').addEventListener('click', () => {
            const on = Sound.toggleSfx();
            const btn = document.getElementById('btn-toggle-sfx');
            btn.classList.toggle('muted', !on);
            btn.title = on ? 'Toggle SFX (ON)' : 'Toggle SFX (OFF)';
        });
    }

    function setupFilters() {
        // filter-close removed — handled by injected window controls
        // Watch for filter panel being hidden to also clear the filter-active state
        const filterPanel = document.getElementById('filter-panel');
        const filterObserver = new MutationObserver(() => {
            if (filterPanel.classList.contains('hidden')) {
                document.getElementById('btn-filter').classList.remove('filter-active');
            }
        });
        filterObserver.observe(filterPanel, { attributes: true, attributeFilter: ['class'] });

        // Type filter buttons
        document.querySelectorAll('#filter-type .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#filter-type .filter-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                filters.type = btn.dataset.type;
                updateFilterButtonState();
                MapRenderer.render();
            });
        });

        // Price filter buttons
        document.querySelectorAll('#filter-price .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#filter-price .filter-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                filters.price = btn.dataset.price;
                updateFilterButtonState();
                MapRenderer.render();
            });
        });

        // Owner filter buttons
        document.querySelectorAll('#filter-owner .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#filter-owner .filter-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                filters.owner = btn.dataset.owner;
                // Turn off affordable quick filter when ownership changes
                if (filters.affordable) {
                    filters.affordable = false;
                    document.querySelectorAll('#filter-affordable .filter-btn').forEach(b => b.classList.remove('selected'));
                }
                updateFilterButtonState();
                MapRenderer.render();
            });
        });

        // Affordable toggle button
        document.querySelectorAll('#filter-affordable .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filters.affordable = !filters.affordable;
                btn.classList.toggle('selected', filters.affordable);
                updateFilterButtonState();
                MapRenderer.render();
            });
        });

        // Landmark fade filter buttons
        document.querySelectorAll('#filter-landmarks .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.landmarks;
                filters.fadeLandmarks = (mode === 'fade');
                document.querySelectorAll('#filter-landmarks .filter-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                MapRenderer.render();
            });
        });

        // Set default landmark filter button to "Show"
        document.querySelector('#filter-landmarks .filter-btn[data-landmarks="show"]').classList.add('selected');
    }

    function toggleFilterPanel() {
        const panel = document.getElementById('filter-panel');
        const btn = document.getElementById('btn-filter');
        if (panel.classList.contains('hidden')) {
            // Close log panel if open (unless pinned)
            if (!isPanelPinned('log-panel')) {
                document.getElementById('log-panel').classList.add('hidden');
            }
        }
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            applyPanelPosition('filter-panel');
        }
        btn.classList.toggle('filter-active');
    }

    function updateFilterButtonState() {
        const btn = document.getElementById('btn-filter');
        const hasActiveFilter = filters.type !== 'all' || filters.price !== 'all' || filters.owner !== 'all' || filters.affordable;
        if (hasActiveFilter) {
            btn.classList.add('filter-active');
        } else if (document.getElementById('filter-panel').classList.contains('hidden')) {
            btn.classList.remove('filter-active');
        }
    }

    function propertyMatchesFilter(property) {
        // Affordable filter: must be unowned AND within player's cash
        if (filters.affordable) {
            if (property.owner !== null) return false;
            if (typeof GameState !== 'undefined' && property.price > GameState.money) return false;
        }

        // Type filter
        if (filters.type !== 'all' && property.type !== filters.type) return false;

        // Price filter
        if (filters.price !== 'all') {
            const price = property.price;
            switch (filters.price) {
                case 'under200k': if (price >= 200000) return false; break;
                case '200k-1m': if (price < 200000 || price >= 1000000) return false; break;
                case '1m-5m': if (price < 1000000 || price >= 5000000) return false; break;
                case '5m-20m': if (price < 5000000 || price >= 20000000) return false; break;
                case 'over20m': if (price < 20000000) return false; break;
            }
        }

        // Owner filter
        if (filters.owner !== 'all') {
            switch (filters.owner) {
                case 'forsale': if (property.owner !== null) return false; break;
                case 'player': if (property.owner !== 'player') return false; break;
                case 'rival': if (!property.owner || property.owner === 'player' || property.owner === null) return false; break;
            }
        }

        return true;
    }

    function isFilterActive() {
        return filters.type !== 'all' || filters.price !== 'all' || filters.owner !== 'all' || filters.affordable;
    }

    function shouldFadeLandmarks() {
        return filters.fadeLandmarks;
    }

    function formatMoney(amount) {
        if (amount >= 10000000) {
            return (amount / 1000000).toFixed(0) + 'M';
        } else if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toString();
    }

    function formatMoneyPrecise(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 10000) {
            return (amount / 1000).toFixed(0) + 'K';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'K';
        }
        return amount.toString();
    }

    // =========================================================
    // ACHIEVEMENTS UI
    // =========================================================
    function showAchievementsPanel() {
        const panel = document.getElementById('achievements-panel');
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        panel.classList.remove('hidden');
        renderAchievementsPanel();
    }

    function renderAchievementsPanel() {
        const body = document.getElementById('achievements-body');
        const countEl = document.getElementById('achievements-count');
        const all = Achievements.getAll();
        countEl.textContent = `${Achievements.getUnlockedCount()} / ${Achievements.getTotalCount()}`;

        let html = '';
        let currentCategory = '';
        for (const a of all) {
            if (a.category && a.category !== currentCategory) {
                currentCategory = a.category;
                html += `<div class="achievement-category">${currentCategory}</div>`;
            }
            const cls = a.unlocked ? 'achievement-item unlocked' : 'achievement-item locked';
            const icon = a.unlocked ? a.icon : '🔒';
            const name = a.unlocked ? a.name : '???';
            const desc = a.unlocked ? a.desc : '???';
            html += `<div class="${cls}">`;
            html += `<span class="achievement-icon">${icon}</span>`;
            html += `<div class="achievement-info">`;
            html += `<div class="achievement-name">${name}</div>`;
            html += `<div class="achievement-desc">${desc}</div>`;
            html += `</div></div>`;
        }
        body.innerHTML = html;
    }

    let achievementToastTimer = null;

    function showPendingAchievements() {
        const notif = Achievements.popNotification();
        if (!notif) return;
        showAchievementToast(notif);
    }

    function showAchievementToast(def) {
        const toast = document.getElementById('achievement-toast');
        toast.innerHTML = `<span class="toast-icon">${def.icon}</span><div class="toast-info"><div class="toast-label">ACHIEVEMENT UNLOCKED</div><div class="toast-name">${def.name}</div></div>`;
        toast.classList.remove('hidden');
        toast.classList.add('show');

        if (achievementToastTimer) clearTimeout(achievementToastTimer);
        achievementToastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hidden');
            // Show next pending if any
            const next = Achievements.popNotification();
            if (next) {
                setTimeout(() => showAchievementToast(next), 300);
            }
        }, 3000);
    }

    // === OFFER DIALOG ===
    function showOfferDialog(offer) {
        const overlay = document.getElementById('offer-overlay');
        const nameEl = document.getElementById('offer-rival-name');
        const textEl = document.getElementById('offer-text');
        const priceEl = document.getElementById('offer-price');
        const portraitCanvas = document.getElementById('offer-portrait');

        // Draw rival portrait
        MapRenderer.drawRivalPortrait(portraitCanvas, offer.rival.id);

        nameEl.textContent = offer.rival.name;
        nameEl.style.color = offer.rival.color;

        // Calculate ROI for property details
        const roi = offer.property.price > 0 ? (offer.property.revenue / offer.property.price * 100).toFixed(1) : '0';
        const propDetails = `${offer.property.type} • ${offer.property.districtName || offer.property.district} • ${Math.floor(offer.property.condition)}% condition • ${roi}% ROI`;

        if (offer.type === 'buy') {
            textEl.innerHTML = `wants to <span style="color:#ffcc00">BUY</span> your <strong>${offer.property.name}</strong>.<br><span style="font-size:9px;color:#aaa">${propDetails}</span><br><br>Offering <strong>+${offer.premium}% above market value</strong>.`;
            priceEl.textContent = `€${formatMoney(offer.price)}`;
        } else {
            textEl.innerHTML = `offers to <span style="color:#ffcc00">SELL</span> you <strong>${offer.property.name}</strong>.<br><span style="font-size:9px;color:#aaa">${propDetails}</span><br><br>At a <strong>${offer.discount}% discount</strong> below market value.`;
            priceEl.textContent = `€${formatMoney(offer.price)}`;
        }

        overlay.classList.remove('hidden');
        Sound.playOffer();
    }

    // === PLAYER OFFER DIALOG ===
    let playerOfferProperty = null;
    let playerOfferRival = null;
    let playerOfferPct = 100; // percentage of market value

    function showPlayerOfferDialog(property) {
        // Find the rival who owns this property
        const rival = GameState.rivals.find(r => r.id === property.owner);
        if (!rival) return;

        playerOfferProperty = property;
        playerOfferRival = rival;
        playerOfferPct = 100;

        const overlay = document.getElementById('player-offer-overlay');
        const portraitCanvas = document.getElementById('player-offer-portrait');
        const propName = document.getElementById('player-offer-prop-name');
        const propInfo = document.getElementById('player-offer-prop-info');
        const marketVal = document.getElementById('player-offer-market-val');

        // Draw rival portrait
        MapRenderer.drawRivalPortrait(portraitCanvas, rival.id);

        propName.textContent = property.name;
        propName.style.color = rival.color;
        propInfo.textContent = `${property.districtName || property.district} — ${property.type} — Lv.${property.upgradeLevel}`;
        marketVal.textContent = `€${formatMoney(property.price)}`;

        updatePlayerOfferPrice();

        overlay.classList.remove('hidden');
        Sound.playOffer();
    }

    function updatePlayerOfferPrice() {
        const price = Math.floor(playerOfferProperty.price * playerOfferPct / 100);
        document.getElementById('player-offer-price').textContent = `€${formatMoney(price)}`;
        const diff = playerOfferPct - 100;
        const pctEl = document.getElementById('player-offer-pct');
        if (diff > 0) {
            pctEl.textContent = `+${diff}% above market`;
            pctEl.style.color = '#ff6666';
        } else if (diff < 0) {
            pctEl.textContent = `${diff}% below market`;
            pctEl.style.color = '#66ff66';
        } else {
            pctEl.textContent = 'At market value';
            pctEl.style.color = '#ffcc00';
        }

        // Disable submit if player can't afford
        const submitBtn = document.getElementById('player-offer-submit');
        submitBtn.disabled = price > GameState.money;
    }

    function hidePlayerOfferDialog() {
        document.getElementById('player-offer-overlay').classList.add('hidden');
        playerOfferProperty = null;
        playerOfferRival = null;
    }

    function setupPlayerOffer() {
        document.getElementById('player-offer-minus-10').addEventListener('click', () => {
            Sound.playClick();
            playerOfferPct = Math.max(50, playerOfferPct - 10);
            updatePlayerOfferPrice();
        });
        document.getElementById('player-offer-minus-5').addEventListener('click', () => {
            Sound.playClick();
            playerOfferPct = Math.max(50, playerOfferPct - 5);
            updatePlayerOfferPrice();
        });
        document.getElementById('player-offer-plus-5').addEventListener('click', () => {
            Sound.playClick();
            playerOfferPct = Math.min(150, playerOfferPct + 5);
            updatePlayerOfferPrice();
        });
        document.getElementById('player-offer-plus-10').addEventListener('click', () => {
            Sound.playClick();
            playerOfferPct = Math.min(150, playerOfferPct + 10);
            updatePlayerOfferPrice();
        });
        document.getElementById('player-offer-submit').addEventListener('click', () => {
            Sound.playClick();
            if (!playerOfferProperty || !playerOfferRival) return;
            const price = Math.floor(playerOfferProperty.price * playerOfferPct / 100);
            if (price > GameState.money) return;
            hidePlayerOfferDialog();
            Game.processPlayerOffer(playerOfferProperty, playerOfferRival, price, playerOfferPct);
        });
        document.getElementById('player-offer-cancel').addEventListener('click', () => {
            Sound.playClick();
            hidePlayerOfferDialog();
        });
    }

    // === NEWSPAPER ===

    let pendingNewspaper = null; // stored paper data while prompt is showing
    let pendingSwedishPaper = null; // HBL paper during Swedish invasion
    let returnToPromptAfterClose = false; // whether to re-show prompt after closing a paper
    let lastNewspaper = null;      // most recent HS for re-read button
    let lastSwedishPaper = null;   // most recent HBL for re-read button

    function updateNewspaperBtn() {
        const btn = document.getElementById('btn-newspaper');
        if (!btn) return;
        if (!lastNewspaper && !lastSwedishPaper) {
            btn.classList.add('hidden');
            return;
        }
        btn.classList.remove('hidden');
        if (lastSwedishPaper && lastNewspaper) {
            btn.textContent = 'HS/HBL';
        } else if (lastSwedishPaper) {
            btn.textContent = 'HBL';
        } else {
            btn.textContent = 'HS';
        }
    }

    function showNewspaperPrompt(paper, swedishPaper) {
        pendingNewspaper = paper;
        pendingSwedishPaper = swedishPaper || null;
        if (paper) lastNewspaper = paper;
        if (swedishPaper) lastSwedishPaper = swedishPaper;
        updateNewspaperBtn();
        returnToPromptAfterClose = !!(paper && swedishPaper); // return to prompt if both available
        const prompt = document.getElementById('newspaper-prompt');
        const textEl = document.getElementById('newspaper-prompt-text');
        const hblBtn = document.getElementById('newspaper-prompt-hbl');
        const readBtn = document.getElementById('newspaper-prompt-read');

        if (paper && swedishPaper) {
            // Both papers available
            textEl.textContent = `Tidningar tillgängliga — ${paper.date}`;
            readBtn.textContent = 'READ HS';
            readBtn.classList.remove('hidden');
            hblBtn.classList.remove('hidden');
        } else if (swedishPaper && !paper) {
            // Only HBL (Swedish invasion mid-year)
            textEl.textContent = `Hufvudstadsbladet — Specialutgåva`;
            readBtn.classList.add('hidden');
            hblBtn.classList.remove('hidden');
        } else {
            // Only HS (normal)
            textEl.textContent = `Helsingin Sanomat — ${paper.date}`;
            readBtn.textContent = 'READ';
            readBtn.classList.remove('hidden');
            hblBtn.classList.add('hidden');
        }
        prompt.classList.remove('hidden');
    }

    function hideNewspaperPrompt() {
        document.getElementById('newspaper-prompt').classList.add('hidden');
        pendingNewspaper = null;
        pendingSwedishPaper = null;
        returnToPromptAfterClose = false;
    }

    let currentNewspaper = null; // the paper currently displayed, for translation use

    function buildStoryHtml(stories, useEnglish) {
        let html = '';
        for (const story of stories) {
            const isHeadline = story.headline;
            const hasPortrait = !!story.rival;
            const hasIllustration = !!story.illustration;
            const hasVisual = hasPortrait || hasIllustration;

            html += `<div class="${isHeadline ? 'newspaper-headline' : 'newspaper-story'}${hasVisual ? ' newspaper-story-with-visual' : ''}">`;
            if (hasPortrait) {
                html += `<canvas class="newspaper-portrait" data-rival="${story.rival}" width="96" height="96"></canvas>`;
            }
            if (hasIllustration) {
                const ilSize = isHeadline ? 120 : 96;
                html += `<canvas class="newspaper-illustration${isHeadline ? ' newspaper-illustration-headline' : ''}" data-illustration="${story.illustration}" width="${ilSize}" height="${ilSize}"></canvas>`;
            }
            const titleText = useEnglish ? (story.titleEn || story.title || story.headline) : (story.title || story.headline);
            const bodyText = useEnglish ? (story.textEn || story.text) : story.text;
            html += `<div class="newspaper-story-content">`;
            html += `<div class="newspaper-story-title">${titleText}</div>`;
            html += `<div class="newspaper-story-text">${bodyText}</div>`;
            html += `</div>`;
            html += `</div>`;
        }
        return html;
    }

    function renderPortraitsAndIllustrations(storiesEl) {
        storiesEl.querySelectorAll('.newspaper-portrait').forEach(canvas => {
            const rivalId = canvas.dataset.rival;
            if (rivalId === 'player') {
                const gender = (typeof GameState !== 'undefined' && GameState.playerGender) || 'male';
                const portrait = (typeof GameState !== 'undefined' && GameState.playerPortrait) || 1;
                MapRenderer.drawPlayerPortrait(canvas, gender, portrait);
            } else if (rivalId && MapRenderer.drawRivalPortrait) {
                MapRenderer.drawRivalPortrait(canvas, rivalId);
            }
        });
        storiesEl.querySelectorAll('.newspaper-illustration').forEach(canvas => {
            const illId = canvas.dataset.illustration;
            if (illId && MapRenderer.drawNewsIllustration) {
                MapRenderer.drawNewsIllustration(canvas, illId);
            }
        });
    }

    function showNewspaper(paper) {
        if (!paper) paper = pendingNewspaper;
        if (!paper) return;
        currentNewspaper = paper;

        // Don't clear pending data if we want to return to prompt
        if (!returnToPromptAfterClose) {
            hideNewspaperPrompt();
        } else {
            document.getElementById('newspaper-prompt').classList.add('hidden');
        }

        const overlay = document.getElementById('newspaper-overlay');
        const mastheadEl = document.getElementById('newspaper-masthead');
        const dateEl = document.getElementById('newspaper-date');
        const storiesEl = document.getElementById('newspaper-stories');
        const translateBtn = document.getElementById('newspaper-translate');
        const closeBtn = document.getElementById('newspaper-close');

        mastheadEl.textContent = paper.isSwedish ? 'HUFVUDSTADSBLADET' : 'HELSINGIN SANOMAT';
        dateEl.textContent = paper.date;

        storiesEl.innerHTML = buildStoryHtml(paper.stories, false);
        renderPortraitsAndIllustrations(storiesEl);

        // HBL-specific UI tweaks
        if (paper.isSwedish) {
            closeBtn.textContent = 'STÄNG';
            translateBtn.style.display = 'inline-block';
        } else {
            closeBtn.textContent = 'CLOSE';
            translateBtn.style.display = 'none';
        }

        // Hide translation panel when opening a fresh paper
        document.getElementById('newspaper-translation').classList.add('hidden');

        overlay.classList.remove('hidden');
        document.getElementById('newspaper-content').scrollTop = 0;
    }

    function showNewspaperTranslation() {
        if (!currentNewspaper || !currentNewspaper.isSwedish) return;
        const panel = document.getElementById('newspaper-translation');
        const dateEl = document.getElementById('newspaper-translation-date');
        const storiesEl = document.getElementById('newspaper-translation-stories');

        dateEl.textContent = currentNewspaper.date;
        storiesEl.innerHTML = buildStoryHtml(currentNewspaper.stories, true);
        renderPortraitsAndIllustrations(storiesEl);
        panel.classList.remove('hidden');
        panel.scrollTop = 0;
    }

    function closeNewspaper() {
        document.getElementById('newspaper-overlay').classList.add('hidden');
        document.getElementById('newspaper-translation').classList.add('hidden');
        currentNewspaper = null;
        // Reset button text for next open
        document.getElementById('newspaper-close').textContent = 'CLOSE';
        // If both papers were available, return to prompt so user can read the other
        if (returnToPromptAfterClose && (pendingNewspaper || pendingSwedishPaper)) {
            document.getElementById('newspaper-prompt').classList.remove('hidden');
        }
    }

    // === NOKIA PRESS RELEASE ===

    function drawNokia3310(canvas) {
        const c = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        c.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const s = 1.4;

        // Phone body (dark blue)
        c.fillStyle = '#1a2a55';
        c.beginPath();
        c.roundRect(cx - 18*s, cy - 38*s, 36*s, 76*s, 5*s);
        c.fill();

        // Body inner highlight
        c.fillStyle = '#222e58';
        c.beginPath();
        c.roundRect(cx - 16*s, cy - 36*s, 32*s, 72*s, 4*s);
        c.fill();

        // Top cap (slightly lighter curve)
        c.fillStyle = '#2a3a6a';
        c.beginPath();
        c.roundRect(cx - 16*s, cy - 36*s, 32*s, 12*s, [4*s, 4*s, 0, 0]);
        c.fill();

        // Screen bezel
        c.fillStyle = '#556677';
        c.fillRect(cx - 12*s, cy - 24*s, 24*s, 18*s);

        // Screen (greenish LCD)
        c.fillStyle = '#88aa66';
        c.fillRect(cx - 10*s, cy - 22*s, 20*s, 14*s);
        // Screen inner glow
        c.fillStyle = '#99bb77';
        c.fillRect(cx - 8*s, cy - 20*s, 16*s, 10*s);

        // "NOKIA" on screen
        c.fillStyle = '#445522';
        c.font = `bold ${Math.floor(5*s)}px monospace`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('NOKIA', cx, cy - 14*s);

        // Signal bars on screen (top-left)
        c.fillStyle = '#556633';
        for (let i = 0; i < 4; i++) {
            c.fillRect(cx - 8*s + i * 2.5*s, cy - 20*s + (3 - i)*s, 1.5*s, (i + 1)*s);
        }

        // Battery icon (top-right of screen)
        c.fillRect(cx + 3*s, cy - 20*s, 5*s, 2*s);
        c.fillRect(cx + 8*s, cy - 19.5*s, 1*s, 1*s);

        // "NOKIA" branding above screen
        c.fillStyle = '#8899bb';
        c.font = `bold ${Math.floor(3.5*s)}px monospace`;
        c.fillText('NOKIA', cx, cy - 28*s);

        // Navigation button (round)
        c.fillStyle = '#2a3870';
        c.beginPath();
        c.arc(cx, cy + 0*s, 6*s, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#3a4888';
        c.beginPath();
        c.arc(cx, cy + 0*s, 4.5*s, 0, Math.PI * 2);
        c.fill();
        // Directional marks
        c.fillStyle = '#556699';
        c.fillRect(cx - 0.5*s, cy - 3.5*s, 1*s, 2*s); // up
        c.fillRect(cx - 0.5*s, cy + 1.5*s, 1*s, 2*s); // down
        c.fillRect(cx - 3.5*s, cy - 0.5*s, 2*s, 1*s); // left
        c.fillRect(cx + 1.5*s, cy - 0.5*s, 2*s, 1*s); // right

        // Side buttons (menu / back)
        c.fillStyle = '#2a3870';
        c.beginPath();
        c.roundRect(cx - 14*s, cy - 2*s, 6*s, 4*s, 1*s);
        c.fill();
        c.beginPath();
        c.roundRect(cx + 8*s, cy - 2*s, 6*s, 4*s, 1*s);
        c.fill();

        // Keypad (4 rows x 3 cols)
        const keyLabels = [
            ['1','2','3'],
            ['4','5','6'],
            ['7','8','9'],
            ['*','0','#'],
        ];
        c.font = `bold ${Math.floor(3*s)}px monospace`;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                const bx = cx + (col - 1) * 9*s;
                const by = cy + 10*s + row * 7.5*s;
                // Key button
                c.fillStyle = '#2a3870';
                c.beginPath();
                c.roundRect(bx - 3.5*s, by - 2.5*s, 7*s, 5*s, 1.2*s);
                c.fill();
                // Key highlight
                c.fillStyle = '#3a4888';
                c.beginPath();
                c.roundRect(bx - 2.5*s, by - 1.5*s, 5*s, 3*s, 0.8*s);
                c.fill();
                // Key label
                c.fillStyle = '#8899bb';
                c.fillText(keyLabels[row][col], bx, by + 0.5*s);
            }
        }

        // Bottom speaker holes
        c.fillStyle = '#151d40';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                c.fillRect(cx - 3*s + i * 3*s, cy + 34*s + j * 2.5*s, 1.5*s, 1*s);
            }
        }

        c.textAlign = 'left';
        c.textBaseline = 'alphabetic';
    }

    function showNokiaAnnouncement() {
        const overlay = document.getElementById('nokia-overlay');
        const portraitCanvas = document.getElementById('nokia-portrait');
        const phoneCanvas = document.getElementById('nokia-phone');
        const textEl = document.getElementById('nokia-text');

        // Draw Risto's portrait
        MapRenderer.drawRivalPortrait(portraitCanvas, 'risto');

        // Draw Nokia 3310 pixel art
        drawNokia3310(phoneCanvas);

        textEl.innerHTML =
            'Nokia Corporation Chairman Risto Siilasmaa today announced that Nokia will re-enter the consumer mobile phone market, ' +
            'effective immediately. "The world needs indestructible phones again," Siilasmaa stated at a packed press conference in Espoo.<br><br>' +
            'The company\'s first new device — a modernized Nokia 3310 — is expected to ship in Q2. ' +
            'Office property values in Helsinki\'s tech districts have already surged on the news. ' +
            'Analysts predict a sustained boom for Ruoholahti, Jätkäsaari, Kamppi, and Sörnäinen.';

        overlay.classList.remove('hidden');
    }

    function closeNokiaDialog() {
        document.getElementById('nokia-overlay').classList.add('hidden');
    }

    // === AUCTION UI ===

    function showAuctionDialog(auction) {
        const overlay = document.getElementById('auction-overlay');
        const propName = document.getElementById('auction-prop-name');
        const propStats = document.getElementById('auction-prop-stats');
        const bidAmount = document.getElementById('auction-bid-amount');
        const bidLeader = document.getElementById('auction-bid-leader');
        const roundNum = document.getElementById('auction-round-num');
        const roundMax = document.getElementById('auction-round-max');
        const participantsEl = document.getElementById('auction-participants');
        const buttonsEl = document.getElementById('auction-buttons');
        const resultEl = document.getElementById('auction-result');
        const raiseBtn = document.getElementById('auction-raise');

        const p = auction.property;
        propName.textContent = p.name;
        propStats.innerHTML = `
            District: <span>${p.districtName || p.district}</span> &nbsp;|&nbsp;
            Type: <span>${p.type}</span><br>
            Price: <span>€${formatMoney(p.price)}</span> &nbsp;|&nbsp;
            Revenue: <span>€${formatMoney(p.revenue)}/mo</span><br>
            Condition: <span>${Math.floor(p.condition)}%</span> &nbsp;|&nbsp;
            Level: <span>${p.upgradeLevel}</span>
        `;

        roundNum.textContent = '1';
        roundMax.textContent = auction.maxRounds;
        bidAmount.textContent = `€${formatMoney(auction.currentBid)}`;
        bidLeader.textContent = 'Opening bid';
        const firstRaise = auction.currentBid + auction.increment;
        const needsLoan = firstRaise > GameState.money;
        raiseBtn.textContent = `RAISE €${formatMoney(firstRaise)}${needsLoan ? ' (LOAN)' : ''}`;

        // Build participant portraits
        participantsEl.innerHTML = '';

        // Player card
        const playerCard = document.createElement('div');
        playerCard.className = 'auction-participant active';
        playerCard.id = 'auction-player-card';
        playerCard.innerHTML = `
            <canvas width="56" height="56" id="auction-player-portrait"></canvas>
            <div class="auction-participant-name" style="color:#44ff44">${GameState.playerName}</div>
            <div class="auction-participant-status">IN</div>
        `;
        participantsEl.appendChild(playerCard);

        // Draw player or advisor portrait on the auction canvas
        setTimeout(() => {
            const pc = document.getElementById('auction-player-portrait');
            if (pc) {
                if (typeof Game !== 'undefined' && Game.isAutopilot && Game.isAutopilot()) {
                    MapRenderer.drawAdvisorPortrait(pc);
                } else {
                    drawPlayerPortrait(pc);
                }
            }
        }, 10);

        // Rival cards
        for (const b of auction.bidders) {
            const card = document.createElement('div');
            card.className = 'auction-participant active';
            card.id = `auction-rival-${b.rival.id}`;
            const canvasId = `auction-portrait-${b.rival.id}`;
            card.innerHTML = `
                <canvas width="56" height="56" id="${canvasId}"></canvas>
                <div class="auction-participant-name" style="color:${b.rival.color}">${b.rival.shortName}</div>
                <div class="auction-participant-status">IN</div>
            `;
            participantsEl.appendChild(card);
            // Draw portrait
            setTimeout(() => {
                const c = document.getElementById(canvasId);
                if (c) MapRenderer.drawRivalPortrait(c, b.rival.id);
            }, 10);
        }

        buttonsEl.style.display = 'flex';
        // Re-enable buttons (may be left disabled from a previous auction)
        const raiseBtnEl = document.getElementById('auction-raise');
        const dropoutBtnEl = document.getElementById('auction-dropout');
        if (raiseBtnEl) raiseBtnEl.disabled = false;
        if (dropoutBtnEl) dropoutBtnEl.disabled = false;
        resultEl.classList.add('hidden');
        overlay.classList.remove('hidden');
    }

    function drawPlayerPortrait(canvasEl) {
        const gender = (typeof GameState !== 'undefined' && GameState.playerGender) || 'male';
        const portrait = (typeof GameState !== 'undefined' && GameState.playerPortrait) || 1;
        MapRenderer.drawPlayerPortrait(canvasEl, gender, portrait);
    }

    function updateAuctionRound(auction, rivalResults) {
        const roundNum = document.getElementById('auction-round-num');
        const bidAmount = document.getElementById('auction-bid-amount');
        const bidLeader = document.getElementById('auction-bid-leader');
        const raiseBtn = document.getElementById('auction-raise');

        roundNum.textContent = auction.round + 1;
        bidAmount.textContent = `€${formatMoney(auction.currentBid)}`;

        if (auction.leader === 'player') {
            bidLeader.textContent = GameState.playerName + ' is leading!';
            bidLeader.style.color = '#44ff44';
        } else {
            const leader = auction.bidders.find(b => b.rival.id === auction.leader);
            bidLeader.textContent = leader ? `${leader.rival.shortName} is leading` : '';
            bidLeader.style.color = leader ? leader.rival.color : '';
        }

        const nextBid = auction.currentBid + auction.increment;
        raiseBtn.textContent = `RAISE €${formatMoney(nextBid)}`;

        // Update rival cards
        updateAuctionRivals(auction, rivalResults);
    }

    function updateAuctionRivals(auction, rivalResults) {
        for (const r of rivalResults) {
            updateSingleAuctionRival(r);
        }
    }

    function updateSingleAuctionRival(r) {
        const card = document.getElementById(`auction-rival-${r.rival.id}`);
        if (!card) return;
        const statusEl = card.querySelector('.auction-participant-status');
        if (r.action === 'raise') {
            statusEl.textContent = `€${formatMoney(r.bid)}`;
            card.className = 'auction-participant active';
            // Brief flash effect
            card.style.outline = '2px solid ' + (r.rival.color || '#ffcc00');
            setTimeout(() => { card.style.outline = ''; }, 600);
        } else {
            statusEl.textContent = 'OUT';
            card.className = 'auction-participant dropped';
        }
    }

    // Animate rival results one by one with delays, then call onComplete
    function animateRivalResults(results, onComplete, baseDelay) {
        const delay = baseDelay || 800;
        let i = 0;
        function showNext() {
            if (i >= results.length) {
                if (onComplete) setTimeout(onComplete, delay);
                return;
            }
            const r = results[i];
            updateSingleAuctionRival(r);
            if (r.action === 'raise') Sound.playAuctionRivalBid();
            else Sound.playAuctionDropout();
            i++;
            setTimeout(showNext, delay);
        }
        // Start first one after a pause
        setTimeout(showNext, delay);
    }

    function showAuctionResult(auction, playerWon, text) {
        const buttonsEl = document.getElementById('auction-buttons');
        const resultEl = document.getElementById('auction-result');
        const resultText = document.getElementById('auction-result-text');

        buttonsEl.style.display = 'none';
        resultText.innerHTML = text;
        resultText.style.color = playerWon ? '#44ff44' : '#ff6666';
        resultEl.classList.remove('hidden');

        // Update player card if they dropped out
        if (!auction.playerIn) {
            const playerCard = document.getElementById('auction-player-card');
            if (playerCard) {
                playerCard.className = 'auction-participant dropped';
                playerCard.querySelector('.auction-participant-status').textContent = 'OUT';
            }
        }

        // Final bid display
        const bidAmount = document.getElementById('auction-bid-amount');
        const bidLeader = document.getElementById('auction-bid-leader');
        bidAmount.textContent = `€${formatMoney(auction.currentBid)}`;
        if (playerWon) {
            bidLeader.textContent = 'SOLD TO YOU!';
            bidLeader.style.color = '#44ff44';
            const playerCard = document.getElementById('auction-player-card');
            if (playerCard) {
                playerCard.className = 'auction-participant winner';
                playerCard.querySelector('.auction-participant-status').textContent = 'WINNER';
            }
        } else if (auction.leader) {
            const winner = auction.bidders.find(b => b.rival.id === auction.leader);
            bidLeader.textContent = winner ? `SOLD TO ${winner.rival.shortName.toUpperCase()}` : 'UNSOLD';
            bidLeader.style.color = winner ? winner.rival.color : '#888';
            // Highlight winner's card (may have been marked OUT during animation)
            if (winner) {
                const winnerCard = document.getElementById(`auction-rival-${winner.rival.id}`);
                if (winnerCard) {
                    winnerCard.className = 'auction-participant winner';
                    const statusEl = winnerCard.querySelector('.auction-participant-status');
                    if (statusEl) statusEl.textContent = 'WINNER';
                }
            }
        }
    }

    function setupOfferAndUndo() {
        document.getElementById('offer-accept').addEventListener('click', () => {
            Sound.playClick();
            Game.acceptOffer();
        });
        document.getElementById('offer-decline').addEventListener('click', () => {
            Sound.playClick();
            Game.declineOffer();
        });
        document.getElementById('btn-undo').addEventListener('click', () => {
            Game.undo();
        });
        // Auction buttons
        document.getElementById('auction-raise').addEventListener('click', () => {
            Game.auctionPlayerRaise();
        });
        document.getElementById('auction-dropout').addEventListener('click', () => {
            Game.auctionPlayerDropout();
        });
        document.getElementById('auction-close').addEventListener('click', () => {
            Sound.playClick();
            Game.closeAuction();
        });
        // Newspaper
        document.getElementById('newspaper-close').addEventListener('click', () => {
            Sound.playClick();
            closeNewspaper();
        });
        document.getElementById('newspaper-translate').addEventListener('click', () => {
            Sound.playClick();
            showNewspaperTranslation();
        });
        document.getElementById('newspaper-prompt-read').addEventListener('click', () => {
            Sound.playClick();
            showNewspaper(pendingNewspaper);
        });
        document.getElementById('newspaper-prompt-hbl').addEventListener('click', () => {
            Sound.playClick();
            if (pendingSwedishPaper) showNewspaper(pendingSwedishPaper);
        });
        document.getElementById('newspaper-prompt-skip').addEventListener('click', () => {
            Sound.playClick();
            hideNewspaperPrompt();
        });
        // Nokia press release
        document.getElementById('nokia-close').addEventListener('click', () => {
            Sound.playClick();
            UI.closeNokiaDialog();
        });
    }

    // === DRAGGABLE PANELS ===
    function getPanelPositions() {
        try {
            return JSON.parse(localStorage.getItem('helsinkiTycoon_panelPositions') || '{}');
        } catch {
            return {};
        }
    }

    function savePanelPosition(panelId, pinned) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const scale = parseFloat(getComputedStyle(document.documentElement)
            .getPropertyValue('--ui-scale')) || 1;
        const rect = panel.getBoundingClientRect();
        const positions = getPanelPositions();
        positions[panelId] = { left: rect.left / scale, top: rect.top / scale, pinned };
        localStorage.setItem('helsinkiTycoon_panelPositions', JSON.stringify(positions));
    }

    function isPanelPinned(panelId) {
        const data = getPanelPositions()[panelId];
        return !!(data?.pinned);
    }

    function applyPanelPosition(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        // Reset inline position so CSS defaults take effect
        panel.style.left = panel.style.top = panel.style.right = panel.style.bottom = '';
        // Apply saved position if one exists
        const data = getPanelPositions()[panelId];
        if (!data || data.left === undefined) return;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        panel.style.left = data.left + 'px';
        panel.style.top = data.top + 'px';
    }

    function resetPanelPosition(panelId) {
        const positions = getPanelPositions();
        delete positions[panelId];
        localStorage.setItem('helsinkiTycoon_panelPositions', JSON.stringify(positions));
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.style.left = panel.style.top = panel.style.right = panel.style.bottom = '';
    }

    function injectWindowControls(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const handle = panel.querySelector('.panel-drag-handle');
        if (!handle) return;

        const pinned = !!(getPanelPositions()[panelId]?.pinned);
        const controls = document.createElement('div');
        controls.className = 'panel-window-controls';
        controls.innerHTML = `
            <button class="pwc-btn pwc-pin ${pinned ? 'pinned' : ''}"
                title="${pinned ? 'Unpin panel' : 'Pin panel (stays open when switching panels)'}">
                ${pinned ? '●' : '○'}
            </button>
            <button class="pwc-btn pwc-reset" title="Reset to default position">↺</button>
            <button class="pwc-btn pwc-close" title="Close panel">✕</button>
        `;
        handle.appendChild(controls);

        controls.querySelector('.pwc-close').addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.add('hidden');
        });

        controls.querySelector('.pwc-reset').addEventListener('click', (e) => {
            e.stopPropagation();
            resetPanelPosition(panelId);
            refreshWindowControls(panelId);
        });

        controls.querySelector('.pwc-pin').addEventListener('click', (e) => {
            e.stopPropagation();
            const data = getPanelPositions()[panelId];
            const currentlyPinned = !!(data?.pinned);
            const newPinned = !currentlyPinned;
            savePanelPosition(panelId, newPinned);
            refreshWindowControls(panelId);
            setNewsText(newPinned ? 'Panel pinned — stays open when switching panels.' : 'Panel unpinned.');
        });
    }

    function refreshWindowControls(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const existing = panel.querySelector('.panel-window-controls');
        if (existing) existing.remove();
        injectWindowControls(panelId);
    }

    function initDraggablePanels() {
        const draggablePanels = [
            'property-panel', 'landmark-panel', 'bank-panel',
            'stats-panel', 'staff-panel', 'menu-panel',
            'filter-panel', 'log-panel', 'cheat-panel'
        ];

        draggablePanels.forEach(injectWindowControls);

        let dragging = null;
        let topZIndex = 100;

        function bringToFront(panel) {
            topZIndex++;
            panel.style.zIndex = topZIndex;
        }

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const { panel, offsetX, offsetY } = dragging;
            const scale = parseFloat(getComputedStyle(document.documentElement)
                .getPropertyValue('--ui-scale')) || 1;
            const rect = panel.getBoundingClientRect();

            let x = (e.clientX - offsetX) / scale;
            let y = (e.clientY - offsetY) / scale;

            x = Math.max(-(rect.width / scale) + 40, Math.min(x, (window.innerWidth - 40) / scale));
            y = Math.max(0, Math.min(y, (window.innerHeight - 40) / scale));

            panel.style.left = x + 'px';
            panel.style.top = y + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            const data = getPanelPositions()[dragging.panel.id];
            savePanelPosition(dragging.panel.id, !!(data?.pinned));
            document.body.style.userSelect = '';
            dragging = null;
        });

        draggablePanels.forEach(id => {
            const panel = document.getElementById(id);
            if (!panel) return;
            const handle = panel.querySelector('.panel-drag-handle');
            if (!handle) return;

            panel.addEventListener('mousedown', () => bringToFront(panel));

            handle.addEventListener('mousedown', (e) => {
                if (e.target.closest('.panel-window-controls')) return;
                e.preventDefault();
                const scale = parseFloat(getComputedStyle(document.documentElement)
                    .getPropertyValue('--ui-scale')) || 1;
                const rect = panel.getBoundingClientRect();

                panel.style.right = 'auto';
                panel.style.bottom = 'auto';
                panel.style.left = (rect.left / scale) + 'px';
                panel.style.top = (rect.top / scale) + 'px';
                bringToFront(panel);

                dragging = {
                    panel,
                    offsetX: e.clientX - rect.left,
                    offsetY: e.clientY - rect.top,
                };
                document.body.style.userSelect = 'none';
            });
        });
    }

    return {
        init,
        updateHUD,
        showPropertyPanel,
        hidePropertyPanel,
        showDistrictInfo,
        setNewsText,
        showEventNotification,
        showTurnSummary,
        showWinScreen,
        showBankPanel,
        showStatsPanel,
        showOfferDialog,
        showNewspaperPrompt,
        hideNewspaperPrompt,
        showNewspaper,
        closeNewspaper,
        showNokiaAnnouncement,
        closeNokiaDialog,
        showAuctionDialog,
        updateAuctionRound,
        updateAuctionRivals,
        animateRivalResults,
        showAuctionResult,
        formatMoney,
        formatMoneyPrecise,
        propertyMatchesFilter,
        isFilterActive,
        shouldFadeLandmarks,
        addLogAction,
        isFreeBuyMode,
        clearFreeBuyMode,
        isDistrictBuyMode,
        clearDistrictBuyMode,
        clearAutopilotUI,
        showPendingAchievements,
        showAchievementsPanel,
        showRivalQuip,
        showQuirkPopup,
        showLandmarkPanel,
        hideLandmarkPanel,
        showPlayerOfferDialog,
        hidePlayerOfferDialog,
    };
})();
