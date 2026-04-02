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
    };

    // Cheat state
    let freeBuyMode = false;

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
        setupCheats();
        setupHotkeys();
    }

    function setupStartScreen() {
        // Option button selection
        document.querySelectorAll('.option-group').forEach(group => {
            group.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    Sound.init(); // ensure audio context on first interaction
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
                });
            });
        });

        // Start game button
        document.getElementById('btn-start-game').addEventListener('click', () => {
            Sound.init();
            Sound.playStartGame();

            const capital = document.querySelector('.option-btn.selected[data-capital]')?.dataset.capital || 'small';
            const difficulty = document.querySelector('.option-btn.selected[data-difficulty]')?.dataset.difficulty || 'normal';
            const rivalCount = parseInt(document.querySelector('.option-btn.selected[data-rivals]')?.dataset.rivals ?? '3');
            const mode = document.querySelector('.option-btn.selected[data-mode]')?.dataset.mode || 'campaign';
            const target = parseInt(document.querySelector('.option-btn.selected[data-target]')?.dataset.target || '50000000');

            document.getElementById('start-screen').classList.add('hidden');
            Game.start(capital, difficulty, mode, rivalCount, target);
        });

        // Continue button — loads auto-save (most recent turn)
        const continueBtn = document.getElementById('btn-continue-game');
        continueBtn.addEventListener('click', () => {
            Sound.init();
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
            } else if ((key === '1' || key === '2' || key === '3' || key === '4') &&
                       !document.getElementById('property-panel').classList.contains('hidden')) {
                // Property panel hotkeys
                const btnMap = { '1': 'btn-buy', '2': 'btn-sell', '3': 'btn-upgrade', '4': 'btn-repair' };
                const btn = document.getElementById(btnMap[key]);
                if (btn && !btn.classList.contains('hidden') && !btn.disabled) {
                    Sound.playClick();
                    btn.click();
                }
            } else if (key === 'escape') {
                // Close any open panel
                hidePropertyPanel();
                hideBankPanel();
                hideStatsPanel();
                hideStaffPanel();
                hideMenuPanel();
                document.getElementById('log-panel').classList.add('hidden');
                document.getElementById('filter-panel').classList.add('hidden');
                document.getElementById('btn-filter').classList.remove('filter-active');
                document.getElementById('portfolio-overlay').classList.add('hidden');
            }
        });
    }

    function setupPanelClose() {
        document.getElementById('panel-close').addEventListener('click', () => {
            hidePropertyPanel();
        });
        document.getElementById('log-close').addEventListener('click', () => {
            document.getElementById('log-panel').classList.add('hidden');
        });
        document.getElementById('portfolio-close').addEventListener('click', () => {
            document.getElementById('portfolio-overlay').classList.add('hidden');
        });
    }

    function updateHUD(gameState) {
        const season = Seasons.getCurrentSeason(gameState.month);
        document.getElementById('hud-month').textContent = Seasons.getMonthName(gameState.month);
        document.getElementById('hud-year').textContent = gameState.year;
        document.getElementById('hud-money').textContent = '€' + formatMoney(gameState.money);
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

        // Build entries: player first, then rivals sorted by net worth descending
        let html = '';
        html += `<div class="sb-entry sb-player">`;
        html += `<span class="sb-dot" style="background:#ffcc00"></span>`;
        html += `<span class="sb-name">You</span>`;
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

        sb.innerHTML = html;
    }

    function showPropertyPanel(property) {
        hideBankPanel(); // close right-side panels to avoid overlap
        hideStatsPanel();
        hideStaffPanel();
        hideMenuPanel();
        currentPanelProperty = property;
        const panel = document.getElementById('property-panel');
        panel.classList.remove('hidden');

        document.getElementById('panel-title').textContent = property.name;
        document.getElementById('panel-type').innerHTML = `<span>Type:</span><span>${property.type}</span>`;
        document.getElementById('panel-district').innerHTML = `<span>District:</span><span>${property.districtName}</span>`;
        document.getElementById('panel-owner').innerHTML = `<span>Owner:</span><span>${property.owner ? (property.owner === 'player' ? 'You' : property.owner) : 'For Sale'}</span>`;
        document.getElementById('panel-price').innerHTML = `<span>Price:</span><span>€${formatMoney(property.price)}</span>`;
        document.getElementById('panel-revenue').innerHTML = `<span>Revenue/mo:</span><span>€${formatMoney(property.revenue)}</span>`;
        document.getElementById('panel-condition').innerHTML = `<span>Condition:</span><span>${Math.floor(property.condition)}%</span>`;
        document.getElementById('panel-upgrade').innerHTML = `<span>Upgrade:</span><span>Lv.${property.upgradeLevel}/${property.maxUpgrade}</span>`;

        // Show/hide action buttons
        const btnBuy = document.getElementById('btn-buy');
        const btnSell = document.getElementById('btn-sell');
        const btnUpgrade = document.getElementById('btn-upgrade');
        const btnRepair = document.getElementById('btn-repair');

        if (property.owner === null) {
            btnBuy.classList.remove('hidden');
            btnBuy.disabled = (!freeBuyMode && GameState.money < property.price) || GameState.actionsRemaining <= 0;
            btnBuy.onclick = () => Game.buyProperty(property);
            btnSell.classList.add('hidden');
            btnUpgrade.classList.add('hidden');
            btnRepair.classList.add('hidden');
        } else if (property.owner === 'player') {
            btnBuy.classList.add('hidden');
            btnSell.classList.remove('hidden');
            btnSell.disabled = GameState.actionsRemaining <= 0;
            btnSell.onclick = () => Game.sellProperty(property);
            btnUpgrade.classList.remove('hidden');
            const upgCost = Properties.getUpgradeCost(property);
            btnUpgrade.disabled = !upgCost || GameState.money < upgCost || GameState.actionsRemaining <= 0;
            btnUpgrade.innerHTML = upgCost ? `Upgrade (€${formatMoney(upgCost)}) <span class="hotkey">[3]</span>` : 'MAX';
            btnUpgrade.onclick = () => Game.upgradeProperty(property);
            btnRepair.classList.remove('hidden');
            const repCost = Properties.getRepairCost(property);
            btnRepair.disabled = property.condition >= 95 || GameState.money < repCost || GameState.actionsRemaining <= 0;
            btnRepair.innerHTML = `Repair (€${formatMoney(repCost)}) <span class="hotkey">[4]</span>`;
            btnRepair.onclick = () => Game.repairProperty(property);
        } else {
            // Rival-owned
            btnBuy.classList.add('hidden');
            btnSell.classList.add('hidden');
            btnUpgrade.classList.add('hidden');
            btnRepair.classList.add('hidden');
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
    }

    function showBankPanel() {
        const panel = document.getElementById('bank-panel');
        // Toggle if already open
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        // Close other right-side panels
        hidePropertyPanel();
        hideStatsPanel();
        hideStaffPanel();
        hideMenuPanel();
        panel.classList.remove('hidden');
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
        document.getElementById('bank-close').addEventListener('click', hideBankPanel);

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
        // Close other right-side panels
        hidePropertyPanel();
        hideBankPanel();
        hideStaffPanel();
        hideMenuPanel();
        panel.classList.remove('hidden');
        updateStatsPanel();
    }

    function hideStatsPanel() {
        document.getElementById('stats-panel').classList.add('hidden');
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

        if (GameState.rivals.length > 0) {
            html += '<div class="stats-divider"></div>';
            const rivals = [...GameState.rivals].sort((a, b) => b.netWorth - a.netWorth);
            for (const rival of rivals) {
                html += `<div class="stats-row rival"><span>${rival.shortName}</span><span>€${formatMoney(rival.netWorth)} (${rival.propertiesOwned}p)</span></div>`;
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
        // Close other right-side panels
        hidePropertyPanel();
        hideBankPanel();
        hideStatsPanel();
        hideStaffPanel();
        panel.classList.remove('hidden');
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

    function setupMenuPanel() {
        document.getElementById('menu-close').addEventListener('click', hideMenuPanel);

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
    }

    function setupStatsPanel() {
        document.getElementById('stats-close').addEventListener('click', hideStatsPanel);
    }

    function showStaffPanel() {
        const panel = document.getElementById('staff-panel');
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        hidePropertyPanel();
        hideBankPanel();
        hideStatsPanel();
        hideMenuPanel();
        panel.classList.remove('hidden');
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

        if (GameState.staff.length > 0) {
            html += `<div class="staff-salary-total">Monthly salaries: <span>€${formatMoney(totalSalary)}</span></div>`;
        }

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

        // Wire up hire buttons
        body.querySelectorAll('.staff-hire-btn').forEach(btn => {
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

        // Wire up fire buttons
        body.querySelectorAll('.staff-fire-btn').forEach(btn => {
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
        document.getElementById('staff-close').addEventListener('click', hideStaffPanel);
    }

    // === CHEATS ===
    function toggleCheatPanel() {
        const panel = document.getElementById('cheat-panel');
        panel.classList.toggle('hidden');
    }

    function setupCheats() {
        document.getElementById('cheat-close').addEventListener('click', () => {
            document.getElementById('cheat-panel').classList.add('hidden');
        });

        document.getElementById('cheat-10k').addEventListener('click', () => {
            GameState.money += 10000;
            updateHUD(GameState);
            setNewsText('Cheat: +€10K');
        });

        document.getElementById('cheat-100k').addEventListener('click', () => {
            GameState.money += 100000;
            updateHUD(GameState);
            setNewsText('Cheat: +€100K');
        });

        document.getElementById('cheat-1m').addEventListener('click', () => {
            GameState.money += 1000000;
            updateHUD(GameState);
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
                tickerParts.push(msg);
            }
        }

        if (summary.rivalActions && summary.rivalActions.length > 0) {
            for (const action of summary.rivalActions) {
                tickerParts.push(`${action.rival} bought ${action.property}`);
            }
        }

        if (summary.newEvents && summary.newEvents.length > 0) {
            for (const event of summary.newEvents) {
                const prefix = event.special ? '👽' : event.positive ? '📈' : '📉';
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
                logEntry.lines.push({ text: msg, cls: 'income-positive' });
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
        const filterPanel = document.getElementById('filter-panel');
        // Close filter panel if open (they share the same screen area)
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            return;
        }
        filterPanel.classList.add('hidden');
        document.getElementById('btn-filter').classList.remove('filter-active');
        panel.classList.remove('hidden');
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
            if (p.condition >= 95) {
                html += `<td class="portfolio-repair-cell"><span class="cond-good">OK</span></td>`;
            } else {
                html += `<td class="portfolio-repair-cell"><button class="portfolio-repair-btn" data-repair-id="${p.id}" ${canRepair ? '' : 'disabled'}>€${formatMoney(repCost)}</button></td>`;
            }
            html += `</tr>`;
        }
        tbody.innerHTML = html;

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
        document.getElementById('btn-toggle-sfx').addEventListener('click', () => {
            const on = Sound.toggleSfx();
            const btn = document.getElementById('btn-toggle-sfx');
            btn.classList.toggle('muted', !on);
            btn.title = on ? 'Toggle SFX (ON)' : 'Toggle SFX (OFF)';
        });
    }

    function setupFilters() {
        document.getElementById('filter-close').addEventListener('click', () => {
            document.getElementById('filter-panel').classList.add('hidden');
            document.getElementById('btn-filter').classList.remove('filter-active');
        });

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
                updateFilterButtonState();
                MapRenderer.render();
            });
        });
    }

    function toggleFilterPanel() {
        const panel = document.getElementById('filter-panel');
        const btn = document.getElementById('btn-filter');
        if (panel.classList.contains('hidden')) {
            // Close log panel if open (they share the same screen area)
            document.getElementById('log-panel').classList.add('hidden');
        }
        panel.classList.toggle('hidden');
        btn.classList.toggle('filter-active');
    }

    function updateFilterButtonState() {
        const btn = document.getElementById('btn-filter');
        const hasActiveFilter = filters.type !== 'all' || filters.price !== 'all' || filters.owner !== 'all';
        if (hasActiveFilter) {
            btn.classList.add('filter-active');
        } else if (document.getElementById('filter-panel').classList.contains('hidden')) {
            btn.classList.remove('filter-active');
        }
    }

    function propertyMatchesFilter(property) {
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
        return filters.type !== 'all' || filters.price !== 'all' || filters.owner !== 'all';
    }

    function formatMoney(amount) {
        if (amount >= 1000000) {
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
        formatMoney,
        formatMoneyPrecise,
        propertyMatchesFilter,
        isFilterActive,
        addLogAction,
        isFreeBuyMode,
        clearFreeBuyMode,
    };
})();
