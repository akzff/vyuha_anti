/**
 * Trade Form Modal - Comprehensive trade entry system
 * Supports Live entries, Past entries, and Data Lab studies
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const CRYPTO_ASSETS = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-amber-500' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-indigo-400' },
    { symbol: 'SOL', name: 'Solana', icon: '◎', color: 'text-emerald-400' },
    { symbol: 'XRP', name: 'Ripple', icon: '✦', color: 'text-blue-400' },
    { symbol: 'BNB', name: 'Binance Coin', icon: '◆', color: 'text-yellow-400' },
    { symbol: 'ADA', name: 'Cardano', icon: '₳', color: 'text-blue-600' },
    { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', color: 'text-amber-300' },
    { symbol: 'MATIC', name: 'Polygon', icon: '⬟', color: 'text-purple-500' },
    { symbol: 'DOT', name: 'Polkadot', icon: '●', color: 'text-pink-500' },
    { symbol: 'AVAX', name: 'Avalanche', icon: '▲', color: 'text-rose-500' },
    { symbol: 'LINK', name: 'Chainlink', icon: '⬡', color: 'text-blue-500' },
    { symbol: 'UNI', name: 'Uniswap', icon: '🦄', color: 'text-pink-400' },
];

// ============================================================================
// TRADE FORM CLASS
// ============================================================================

class TradeFormModal {
    constructor() {
        this.modal = null;
        this.dataManager = window.dataManager || new DataManager();
        this.onSaveCallback = null;

        // Form state
        this.entryMode = 'LIVE'; // 'LIVE', 'PAST', 'DATA'
        this.formData = this.getDefaultFormData();
        this.metrics = { positionSize: 0, estFees: 0, liquidationPrice: 0, quantity: 0 };

        // Tag arrays
        this.entryReasons = [];
        this.exitReasons = [];
        this.mentalStates = [];
        this.generalTags = [];
        this.selectedSetups = [];
        this.checkedRules = [];

        this.slPercent = '';
        this.tpPercent = '';
        this.isFetchingPrice = false;
    }

    getDefaultFormData() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);

        return {
            symbol: '',
            side: 'LONG',
            entryDate: localDateTime,
            exchange: 'Binance',
            strategy: '',
            entryPrice: '',
            capital: '',
            leverage: 1,
            stopLoss: '',
            takeProfit: '',
            exitPrice: '',
            exitDate: localDateTime,
            exitQuality: 0,
            notes: ''
        };
    }

    open(callback) {
        this.onSaveCallback = callback;
        this.formData = this.getDefaultFormData();
        this.resetTags();
        this.render();
        this.attachEventListeners();
        this.calculateMetrics();
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    resetTags() {
        this.entryReasons = [];
        this.exitReasons = [];
        this.mentalStates = [];
        this.generalTags = [];
        this.selectedSetups = [];
        this.checkedRules = [];
    }

    // ============================================================================
    // RENDER
    // ============================================================================

    render() {
        const profile = this.dataManager.getProfile();
        const portfolioBalance = this.calculatePortfolioBalance();
        const riskSettings = this.dataManager.getRiskSettings();
        const riskState = this.calculateRiskState(portfolioBalance, riskSettings);

        const theme = this.getTheme();
        const strategies = this.dataManager.getStrategies().filter(s => s.status === 'active');
        const selectedStrategy = strategies.find(s => s.name === this.formData.strategy);

        const modalHTML = `
      <div class="trade-form-overlay" id="trade-form-overlay">
        <div class="trade-form-modal ${theme.borderClass}">
          <!-- Header -->
          <div class="trade-form-header">
            <div style="display: flex; align-items: center; gap: var(--spacing-md);">
              <div class="trade-form-icon ${theme.iconBg}">📊</div>
              <div>
                <h2 style="margin: 0; font-size: 1.125rem; font-weight: 700;">Log Your Position</h2>
                <p style="margin: 0; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                  Every trade is a lesson. Record it accurately.
                </p>
              </div>
            </div>

            <!-- Mode Selector -->
            <div class="mode-selector">
              <button class="mode-btn ${this.entryMode === 'LIVE' ? 'active' : ''}" data-mode="LIVE">
                Live Entry
              </button>
              <button class="mode-btn ${this.entryMode === 'PAST' ? 'active' : ''}" data-mode="PAST">
                Log Past
              </button>
              <button class="mode-btn ${this.entryMode === 'DATA' ? 'active' : ''}" data-mode="DATA">
                Data Study
              </button>
            </div>

            <button class="close-btn" id="close-form-btn">✕</button>
          </div>

          <!-- Risk Warning Banner -->
          ${riskState.isLocked && this.entryMode === 'LIVE' ? `
            <div class="risk-warning-banner">
              <span style="font-size: 1.2rem;">⚠️</span>
              <span style="font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                Trading Locked: ${riskState.lockReason}
              </span>
            </div>
          ` : ''}

          <!-- Risk Tickets (Live Mode Only) -->
          ${!riskState.isLocked && this.entryMode === 'LIVE' ? this.renderRiskTickets(riskState) : ''}

          <!-- Form Content -->
          <div class="trade-form-content" id="trade-form-content">
            <form id="trade-entry-form">
              ${this.renderFormFields(strategies, selectedStrategy, portfolioBalance, theme)}
            </form>
          </div>

          <!-- Footer -->
          <div class="trade-form-footer">
            <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
            <button type="submit" form="trade-entry-form" class="btn ${theme.buttonClass}" id="submit-btn"
              ${riskState.isLocked && this.entryMode === 'LIVE' ? 'disabled' : ''}>
              ${this.entryMode === 'LIVE' ? '🚀 Log Trade' : '💾 Save Trade'}
            </button>
          </div>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('trade-form-overlay');

        // Fade in animation
        requestAnimationFrame(() => {
            this.modal.style.opacity = '1';
        });
    }

    renderRiskTickets(riskState) {
        const tradesRemaining = riskState.maxTrades > 0 ? riskState.maxTrades - riskState.tradeCount : 999;
        const tradesProgress = riskState.maxTrades > 0 ? (riskState.tradeCount / riskState.maxTrades) * 100 : 0;
        const drawdownProgress = riskState.dailyDDLimit > 0 ? (riskState.currentDD / riskState.dailyDDLimit) * 100 : 0;

        let html = '<div class="risk-tickets">';

        if (riskState.maxTrades > 0) {
            html += `
        <div class="risk-ticket">
          <div class="risk-ticket-icon ${tradesRemaining === 0 ? 'danger' : 'info'}">🎫</div>
          <div style="flex: 1;">
            <div class="risk-ticket-label">
              <span>Daily Trades</span>
              <span class="${tradesRemaining === 0 ? 'text-danger' : ''}">${tradesRemaining} Left</span>
            </div>
            <div class="progress-bar-mini">
              <div class="progress-fill ${tradesRemaining === 0 ? 'danger' : 'info'}" 
                style="width: ${Math.min(tradesProgress, 100)}%"></div>
            </div>
          </div>
        </div>
      `;
        }

        if (riskState.dailyDDLimit > 0) {
            html += `
        <div class="risk-ticket">
          <div class="risk-ticket-icon ${drawdownProgress >= 100 ? 'danger' : 'success'}">📉</div>
          <div style="flex: 1;">
            <div class="risk-ticket-label">
              <span>Daily Drawdown</span>
              <span class="${drawdownProgress >= 100 ? 'text-danger' : ''}">
                ${riskState.currentDD.toFixed(2)}% / ${riskState.dailyDDLimit}%
              </span>
            </div>
            <div class="progress-bar-mini">
              <div class="progress-fill ${drawdownProgress >= 100 ? 'danger' : 'success'}" 
                style="width: ${Math.min(drawdownProgress, 100)}%"></div>
            </div>
          </div>
        </div>
      `;
        }

        html += '</div>';
        return html;
    }

    renderFormFields(strategies, selectedStrategy, portfolioBalance, theme) {
        const activeAsset = CRYPTO_ASSETS.find(a => a.symbol === this.formData.symbol.toUpperCase());
        const rr = this.calculateRR();

        return `
      <!-- Row 1: Basic Info -->
      <div class="form-grid">
        <!-- Symbol -->
        <div class="form-group">
          <label class="form-label">Symbol</label>
          <div class="input-wrapper">
            <span class="input-icon">${activeAsset ? activeAsset.icon : '💰'}</span>
            <input type="text" id="symbol-input" class="form-input" placeholder="e.g. BTC" 
              value="${this.formData.symbol}" required style="text-transform: uppercase;">
          </div>
          <div id="symbol-suggestions" class="suggestions-dropdown" style="display: none;"></div>
        </div>

        <!-- Side -->
        <div class="form-group">
          <label class="form-label">Position</label>
          <div class="side-toggle">
            <button type="button" class="side-btn ${this.formData.side === 'LONG' ? 'active long' : ''}" 
              data-side="LONG">Long</button>
            <button type="button" class="side-btn ${this.formData.side === 'SHORT' ? 'active short' : ''}" 
              data-side="SHORT">Short</button>
          </div>
        </div>

        <!-- Entry Date -->
        <div class="form-group">
          <label class="form-label">Entry Date & Time</label>
          <div class="input-wrapper">
            <span class="input-icon">📅</span>
            <input type="datetime-local" id="entry-date" class="form-input" 
              value="${this.formData.entryDate}">
          </div>
        </div>

        <!-- Exchange -->
        <div class="form-group">
          <label class="form-label">Exchange</label>
          <select id="exchange-select" class="form-select">
            ${this.dataManager.getExchanges().map(ex =>
            `<option value="${ex}" ${this.formData.exchange === ex ? 'selected' : ''}>${ex}</option>`
        ).join('')}
          </select>
        </div>
      </div>

      <!-- Row 2: Strategy & Pricing -->
      <div class="form-grid">
        <!-- Strategy -->
        <div class="form-group">
          <label class="form-label">Strategy</label>
          <select id="strategy-select" class="form-select">
            <option value="">Select a strategy</option>
            ${strategies.map(s =>
            `<option value="${s.name}" ${this.formData.strategy === s.name ? 'selected' : ''}>${s.name}</option>`
        ).join('')}
          </select>
        </div>

        <!-- Entry Price -->
        <div class="form-group">
          <label class="form-label">Entry Price</label>
          <div class="input-wrapper">
            <span class="input-icon">💲</span>
            <input type="number" id="entry-price" class="form-input" placeholder="0.00" 
              value="${this.formData.entryPrice}" step="any" required>
            <button type="button" class="refresh-price-btn" id="fetch-entry-price" 
              ${!this.formData.symbol ? 'disabled' : ''}>
              ${this.isFetchingPrice ? '⟳' : '↻'}
            </button>
          </div>
        </div>

        <!-- Capital -->
        <div class="form-group">
          <label class="form-label">
            Capital (USD)
            <span style="color: var(--green-primary); font-weight: 600; font-size: 0.75rem;">
              Avail: $${portfolioBalance.toLocaleString()}
            </span>
          </label>
          <div class="input-wrapper">
            <span class="input-icon">💵</span>
            <input type="number" id="capital-input" class="form-input" placeholder="0" 
              value="${this.formData.capital}" required>
          </div>
          <div class="quick-buttons">
            ${[25, 50, 75, 100].map(pct =>
            `<button type="button" class="quick-btn" data-capital-pct="${pct}">${pct}%</button>`
        ).join('')}
          </div>
        </div>

        <!-- Leverage -->
        <div class="form-group">
          <label class="form-label">Leverage</label>
          <div class="input-wrapper">
            <span class="input-icon">⚡</span>
            <input type="number" id="leverage-input" class="form-input" 
              value="${this.formData.leverage}" min="1" max="100">
            <span style="color: var(--text-muted); font-weight: 700; font-size: 0.875rem;">x</span>
          </div>
          <div class="quick-buttons">
            ${[1, 5, 10, 25, 50].map(lev =>
            `<button type="button" class="quick-btn ${this.formData.leverage === lev ? 'active' : ''}" 
                data-leverage="${lev}">${lev}x</button>`
        ).join('')}
          </div>
        </div>
      </div>

      <!-- Exit Fields (PAST/DATA mode only) -->
      ${this.entryMode !== 'LIVE' ? this.renderExitFields(theme) : ''}

      <!-- Row 3: Stop Loss & Take Profit -->
      <div class="form-grid-2">
        <!-- Stop Loss -->
        <div class="form-group">
          <label class="form-label">Stop Loss</label>
          <div class="split-input sl">
            <div class="split-part">
              <label class="split-label">Price</label>
              <input type="number" id="sl-price" class="form-input-split" placeholder="0.00" 
                value="${this.formData.stopLoss}" step="any">
            </div>
            <div class="split-part percent">
              <label class="split-label">%</label>
              <input type="number" id="sl-percent" class="form-input-split" placeholder="0" 
                value="${this.slPercent}" step="0.1">
            </div>
          </div>
          <div class="quick-buttons">
            ${[1, 2, 5, 10].map(pct =>
            `<button type="button" class="quick-btn danger" data-sl-pct="${pct}">${pct}%</button>`
        ).join('')}
          </div>
        </div>

        <!-- Take Profit -->
        <div class="form-group">
          <label class="form-label">Take Profit</label>
          <div class="split-input tp">
            <div class="split-part">
              <label class="split-label">Price</label>
              <input type="number" id="tp-price" class="form-input-split" placeholder="0.00" 
                value="${this.formData.takeProfit}" step="any">
            </div>
            <div class="split-part percent">
              <label class="split-label">%</label>
              <input type="number" id="tp-percent" class="form-input-split" placeholder="0" 
                value="${this.tpPercent}" step="0.1">
            </div>
          </div>
          <div class="quick-buttons">
            ${[1, 2, 5, 10].map(pct =>
            `<button type="button" class="quick-btn success" data-tp-pct="${pct}">${pct}%</button>`
        ).join('')}
          </div>
        </div>
      </div>

      <!-- Metrics Panel -->
      <div class="metrics-panel">
        <div class="metric-item">
          <div class="metric-label">Position Size</div>
          <div class="metric-value">$${this.metrics.positionSize.toLocaleString()}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Est. Fees (Round Trip)</div>
          <div class="metric-value" style="color: var(--green-primary);">$${this.metrics.estFees.toFixed(2)}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Est. Liquidation</div>
          <div class="metric-value" style="color: var(--red-primary);">
            ${this.metrics.liquidationPrice > 0 ? '$' + this.metrics.liquidationPrice.toFixed(2) : 'N/A'}
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">Risk:Reward</div>
          <div class="metric-value ${rr >= 2 ? 'text-success' : rr > 0 ? 'text-warning' : ''}">
            ${rr > 0 ? '1:' + rr.toFixed(2) : 'N/A'}
          </div>
        </div>
      </div>

      <!-- Strategy Validation -->
      ${selectedStrategy ? this.renderStrategyValidation(selectedStrategy) : ''}

      <!-- Tags Section -->
      ${this.renderTagsSection()}

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea id="notes-input" class="form-textarea" rows="3" 
          placeholder="Trade rationale, market conditions, etc...">${this.formData.notes}</textarea>
      </div>
    `;
    }

    renderExitFields(theme) {
        return `
      <div class="exit-fields">
        <div class="form-grid">
          <!-- Exit Price -->
          <div class="form-group">
            <label class="form-label">Exit Price</label>
            <div class="input-wrapper">
              <span class="input-icon">💲</span>
              <input type="number" id="exit-price" class="form-input" placeholder="0.00" 
                value="${this.formData.exitPrice}" step="any" required>
              <button type="button" class="refresh-price-btn" id="fetch-exit-price" 
                ${!this.formData.symbol ? 'disabled' : ''}>↻</button>
            </div>
          </div>

          <!-- Exit Date -->
          <div class="form-group">
            <label class="form-label">Exit Date & Time</label>
            <div class="input-wrapper">
              <span class="input-icon">📅</span>
              <input type="datetime-local" id="exit-date" class="form-input" 
                value="${this.formData.exitDate}" required>
            </div>
          </div>

          <!-- Exit Quality -->
          <div class="form-group">
            <label class="form-label">Exit Quality</label>
            <div class="star-rating" id="exit-quality-stars">
              ${[1, 2, 3, 4, 5].map(star => `
                <button type="button" class="star-btn ${star <= this.formData.exitQuality ? 'active' : ''}" 
                  data-star="${star}">★</button>
              `).join('')}
              <span class="star-label">${this.formData.exitQuality > 0 ? this.formData.exitQuality + '/5' : 'Rate'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    renderStrategyValidation(strategy) {
        return `
      <div class="strategy-validation">
        <div class="validation-header">
          <span>✓</span>
          <h4>${strategy.name} Validation</h4>
        </div>
        <div class="validation-grid">
          <!-- Mandatory Rules -->
          <div class="validation-section">
            <label class="validation-label mandatory">Entry Rules (Mandatory)</label>
            <div class="rule-checklist" id="mandatory-rules">
              ${(strategy.entryRules?.primary || []).map((rule, idx) => `
                <div class="rule-item ${this.checkedRules.includes(rule) ? 'checked' : ''}" 
                  data-rule="${rule}">
                  <div class="rule-checkbox">
                    ${this.checkedRules.includes(rule) ? '✓' : ''}
                  </div>
                  <span>${rule}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Optional Rules -->
          <div class="validation-section">
            <label class="validation-label optional">Additional Rules (Optional)</label>
            <div class="rule-checklist" id="optional-rules">
              ${(strategy.entryRules?.secondary || []).map((rule, idx) => `
                <div class="rule-item ${this.checkedRules.includes(rule) ? 'checked' : ''}" 
                  data-rule="${rule}">
                  <div class="rule-checkbox">
                    ${this.checkedRules.includes(rule) ? '✓' : ''}
                  </div>
                  <span>${rule}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Setups -->
          <div class="validation-section">
            <label class="validation-label">Valid Setups</label>
            <div class="setup-tags" id="setup-tags">
              ${(strategy.setups || []).map(setup => `
                <button type="button" class="setup-tag ${this.selectedSetups.includes(setup) ? 'active' : ''}" 
                  data-setup="${setup}">${setup}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    }

    renderTagsSection() {
        const allTags = this.dataManager.getTags();

        return `
      <div class="tags-section">
        <h4 class="tags-title">📌 Trade Tags</h4>
        <div class="tags-grid">
          <!-- Entry Reasons -->
          ${this.renderTagInput('Entry Reasons', 'entry', allTags.entry || [], this.entryReasons)}
          
          <!-- Exit Reasons -->
          ${this.renderTagInput('Exit Reasons', 'exit', allTags.exit || [], this.exitReasons)}
          
          <!-- Mental State -->
          ${this.renderTagInput('Mental State', 'mental', allTags.mental || [], this.mentalStates)}
          
          <!-- General Tags -->
          ${this.renderTagInput('General Tags', 'general', allTags.general || [], this.generalTags)}
        </div>
      </div>
    `;
    }

    renderTagInput(label, category, availableTags, selectedTags) {
        return `
      <div class="tag-group">
        <label class="form-label">${label}</label>
        <div class="tag-input-wrapper">
          <input type="text" class="tag-input" placeholder="Add tag..." 
            data-tag-category="${category}" id="${category}-tag-input">
        </div>
        <div class="tags-container" id="${category}-tags">
          ${selectedTags.map(tag => `
            <span class="tag" data-tag="${tag}" data-category="${category}">
              ${tag} <button type="button" class="tag-remove">×</button>
            </span>
          `).join('')}
        </div>
        ${availableTags.length > 0 ? `
          <div class="tag-suggestions">
            ${availableTags.slice(0, 5).map(tag => `
              <button type="button" class="tag-suggestion" 
                data-tag="${tag.name}" data-category="${category}">${tag.name}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    }

    // ============================================================================
    // EVENT LISTENERS
    // ============================================================================

    attachEventListeners() {
        // Close buttons
        document.getElementById('close-form-btn')?.addEventListener('click', () => this.close());
        document.getElementById('cancel-btn')?.addEventListener('click', () => this.close());
        document.getElementById('trade-form-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'trade-form-overlay') this.close();
        });

        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.entryMode = e.target.dataset.mode;
                this.close();
                this.open(this.onSaveCallback);
            });
        });

        // Form inputs
        this.attachFormInputListeners();
        this.attachQuickButtonListeners();
        this.attachPriceListeners();
        this.attachTagListeners();
        this.attachStrategyListeners();

        // Form submission
        document.getElementById('trade-entry-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    attachFormInputListeners() {
        // Symbol
        const symbolInput = document.getElementById('symbol-input');
        if (symbolInput) {
            symbolInput.addEventListener('input', (e) => {
                this.formData.symbol = e.target.value.toUpperCase();
                this.showSymbolSuggestions();
            });

            symbolInput.addEventListener('blur', () => {
                setTimeout(() => {
                    document.getElementById('symbol-suggestions').style.display = 'none';
                    if (this.formData.symbol && this.entryMode === 'LIVE') {
                        this.fetchLivePrice('entry');
                    }
                }, 200);
            });
        }

        // Side buttons
        document.querySelectorAll('.side-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.formData.side = e.target.dataset.side;
                this.updateSideButtons();
                this.calculateMetrics();
            });
        });

        // All other inputs
        const inputMap = {
            'entry-date': 'entryDate',
            'exchange-select': 'exchange',
            'strategy-select': 'strategy',
            'entry-price': 'entryPrice',
            'capital-input': 'capital',
            'leverage-input': 'leverage',
            'sl-price': 'stopLoss',
            'tp-price': 'takeProfit',
            'exit-price': 'exitPrice',
            'exit-date': 'exitDate',
            'notes-input': 'notes'
        };

        Object.entries(inputMap).forEach(([id, field]) => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.formData[field] = e.target.value;
                    if (['entryPrice', 'capital', 'leverage', 'stopLoss', 'takeProfit'].includes(field)) {
                        this.calculateMetrics();
                    }
                    if (field === 'strategy') {
                        this.checkedRules = [];
                        this.selectedSetups = [];
                        this.renderFormContent();
                    }
                });
            }
        });

        // SL/TP percent inputs
        document.getElementById('sl-percent')?.addEventListener('input', (e) => {
            this.setPriceByPercent('SL', parseFloat(e.target.value) || 0);
        });

        document.getElementById('tp-percent')?.addEventListener('input', (e) => {
            this.setPriceByPercent('TP', parseFloat(e.target.value) || 0);
        });

        // Exit quality stars
        document.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.formData.exitQuality = parseInt(e.target.dataset.star);
                this.updateStars();
            });
        });
    }

    attachQuickButtonListeners() {
        // Capital percentage buttons
        document.querySelectorAll('[data-capital-pct]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pct = parseFloat(e.target.dataset.capitalPct);
                const portfolioBalance = this.calculatePortfolioBalance();
                this.formData.capital = ((portfolioBalance * pct) / 100).toFixed(0);
                document.getElementById('capital-input').value = this.formData.capital;
                this.calculateMetrics();
            });
        });

        // Leverage buttons
        document.querySelectorAll('[data-leverage]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.formData.leverage = parseInt(e.target.dataset.leverage);
                document.getElementById('leverage-input').value = this.formData.leverage;
                this.updateLeverageButtons();
                this.calculateMetrics();
            });
        });

        // SL/TP percentage buttons
        document.querySelectorAll('[data-sl-pct]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setPriceByPercent('SL', parseFloat(e.target.dataset.slPct));
            });
        });

        document.querySelectorAll('[data-tp-pct]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setPriceByPercent('TP', parseFloat(e.target.dataset.tpPct));
            });
        });
    }

    attachPriceListeners() {
        document.getElementById('fetch-entry-price')?.addEventListener('click', () => {
            this.fetchLivePrice('entry');
        });

        document.getElementById('fetch-exit-price')?.addEventListener('click', () => {
            this.fetchLivePrice('exit');
        });
    }

    attachTagListeners() {
        // Tag inputs
        document.querySelectorAll('.tag-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const category = e.target.dataset.tagCategory;
                    this.addTag(category, e.target.value);
                    e.target.value = '';
                }
            });
        });

        // Tag suggestions
        document.querySelectorAll('.tag-suggestion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const tag = e.target.dataset.tag;
                this.addTag(category, tag);
            });
        });

        // Tag remove buttons
        document.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.closest('.tag');
                const tagName = tag.dataset.tag;
                const category = tag.dataset.category;
                this.removeTag(category, tagName);
            });
        });
    }

    attachStrategyListeners() {
        // Rule checkboxes
        document.querySelectorAll('.rule-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const rule = e.currentTarget.dataset.rule;
                if (this.checkedRules.includes(rule)) {
                    this.checkedRules = this.checkedRules.filter(r => r !== rule);
                } else {
                    this.checkedRules.push(rule);
                }
                e.currentTarget.classList.toggle('checked');
                const checkbox = e.currentTarget.querySelector('.rule-checkbox');
                checkbox.textContent = this.checkedRules.includes(rule) ? '✓' : '';
            });
        });

        // Setup tags
        document.querySelectorAll('.setup-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setup = e.target.dataset.setup;
                if (this.selectedSetups.includes(setup)) {
                    this.selectedSetups = this.selectedSetups.filter(s => s !== setup);
                } else {
                    this.selectedSetups.push(setup);
                }
                e.target.classList.toggle('active');
            });
        });
    }

    // ============================================================================
    // CALCULATIONS
    // ============================================================================

    calculateMetrics() {
        const capital = parseFloat(this.formData.capital) || 0;
        const entry = parseFloat(this.formData.entryPrice) || 0;
        const lev = this.formData.leverage || 1;

        const positionSize = capital * lev;
        const quantity = entry > 0 ? positionSize / entry : 0;

        const profile = this.dataManager.getProfile();
        const fees = profile.fees || { maker: 0.02, taker: 0.05, type: 'PERCENTAGE' };

        let estFees = 0;
        if (fees.type === 'FIXED') {
            estFees = fees.taker * 2;
        } else {
            const rate = (fees.taker || 0.05) / 100;
            estFees = positionSize * rate * 2;
        }

        let liquidationPrice = 0;
        if (entry > 0) {
            if (this.formData.side === 'LONG') {
                liquidationPrice = entry * (1 - (1 / lev) + 0.005);
            } else {
                liquidationPrice = entry * (1 + (1 / lev) - 0.005);
            }
        }

        this.metrics = {
            positionSize,
            estFees,
            liquidationPrice: Math.max(0, liquidationPrice),
            quantity
        };

        this.updateMetricsDisplay();
    }

    calculateRR() {
        const entry = parseFloat(this.formData.entryPrice) || 0;
        const sl = parseFloat(this.formData.stopLoss) || 0;
        const tp = parseFloat(this.formData.takeProfit) || 0;

        if (!entry || !sl || !tp) return 0;

        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);

        return risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
    }

    calculatePortfolioBalance() {
        if (window.calculatePortfolioBalance) {
            const transactions = this.dataManager.getTransactions();
            const trades = this.dataManager.getTrades().filter(t => t.tradeType !== 'DATA');
            return window.calculatePortfolioBalance(transactions, trades);
        }
        return 10000; // Default fallback
    }

    calculateRiskState(portfolioBalance, riskSettings) {
        if (window.calculateRiskState) {
            const trades = this.dataManager.getTrades().filter(t => t.tradeType !== 'DATA');
            const transactions = this.dataManager.getTransactions();
            const profile = this.dataManager.getProfile();
            return window.calculateRiskState(trades, transactions, portfolioBalance, riskSettings, profile.timezone);
        }

        // Fallback
        return {
            currentDD: 0,
            dailyDDLimit: riskSettings.dailyDD || 0,
            tradeCount: 0,
            maxTrades: riskSettings.maxTradesDay || 0,
            isLocked: false,
            lockReason: '',
            startOfDayBalance: portfolioBalance,
            todayRealizedPnL: 0
        };
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    getTheme() {
        const isLong = this.formData.side === 'LONG';
        return {
            borderClass: isLong ? 'border-long' : 'border-short',
            iconBg: isLong ? 'bg-long' : 'bg-short',
            buttonClass: isLong ? 'btn-long' : 'btn-short'
        };
    }

    showSymbolSuggestions() {
        const dropdown = document.getElementById('symbol-suggestions');
        if (!dropdown) return;

        const filtered = CRYPTO_ASSETS.filter(asset =>
            asset.symbol.includes(this.formData.symbol) ||
            asset.name.toUpperCase().includes(this.formData.symbol)
        );

        if (filtered.length > 0 && this.formData.symbol) {
            dropdown.innerHTML = filtered.map(asset => `
        <div class="suggestion-item" data-symbol="${asset.symbol}">
          <span class="suggestion-icon ${asset.color}">${asset.icon}</span>
          <div>
            <div class="suggestion-symbol">${asset.symbol}</div>
            <div class="suggestion-name">${asset.name}</div>
          </div>
        </div>
      `).join('');

            dropdown.style.display = 'block';

            dropdown.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    this.formData.symbol = e.currentTarget.dataset.symbol;
                    document.getElementById('symbol-input').value = this.formData.symbol;
                    dropdown.style.display = 'none';
                    if (this.entryMode === 'LIVE') {
                        this.fetchLivePrice('entry');
                    }
                    this.renderFormContent();
                });
            });
        } else {
            dropdown.style.display = 'none';
        }
    }

    async fetchLivePrice(field) {
        if (!this.formData.symbol) return;

        this.isFetchingPrice = true;
        const btn = document.getElementById(field === 'entry' ? 'fetch-entry-price' : 'fetch-exit-price');
        if (btn) btn.innerHTML = '⟳';

        try {
            const symbol = this.formData.symbol.toUpperCase();
            const binanceSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;

            const response = await fetch(`https://data.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);

            if (response.ok) {
                const data = await response.json();
                const price = parseFloat(data.price).toString();

                if (field === 'entry') {
                    this.formData.entryPrice = price;
                    document.getElementById('entry-price').value = price;
                } else {
                    this.formData.exitPrice = price;
                    document.getElementById('exit-price').value = price;
                }

                this.calculateMetrics();
            }
        } catch (error) {
            console.error('Failed to fetch price:', error);
        } finally {
            this.isFetchingPrice = false;
            if (btn) btn.innerHTML = '↻';
        }
    }

    setPriceByPercent(type, percent) {
        const entry = parseFloat(this.formData.entryPrice) || 0;
        if (entry <= 0 || !percent) return;

        let price = 0;
        if (type === 'SL') {
            this.slPercent = percent.toString();
            if (this.formData.side === 'LONG') {
                price = entry * (1 - percent / 100);
            } else {
                price = entry * (1 + percent / 100);
            }
            this.formData.stopLoss = price.toFixed(2);
            document.getElementById('sl-price').value = this.formData.stopLoss;
            document.getElementById('sl-percent').value = this.slPercent;
        } else {
            this.tpPercent = percent.toString();
            if (this.formData.side === 'LONG') {
                price = entry * (1 + percent / 100);
            } else {
                price = entry * (1 - percent / 100);
            }
            this.formData.takeProfit = price.toFixed(2);
            document.getElementById('tp-price').value = this.formData.takeProfit;
            document.getElementById('tp-percent').value = this.tpPercent;
        }

        this.calculateMetrics();
    }

    addTag(category, tagName) {
        if (!tagName || !tagName.trim()) return;

        const trimmed = tagName.trim();
        const targetArray = this.getTagArray(category);

        if (!targetArray.includes(trimmed)) {
            targetArray.push(trimmed);
            this.updateTagsDisplay(category);
        }
    }

    removeTag(category, tagName) {
        const targetArray = this.getTagArray(category);
        const index = targetArray.indexOf(tagName);
        if (index > -1) {
            targetArray.splice(index, 1);
            this.updateTagsDisplay(category);
        }
    }

    getTagArray(category) {
        switch (category) {
            case 'entry': return this.entryReasons;
            case 'exit': return this.exitReasons;
            case 'mental': return this.mentalStates;
            case 'general': return this.generalTags;
            default: return [];
        }
    }

    updateTagsDisplay(category) {
        const container = document.getElementById(`${category}-tags`);
        if (!container) return;

        const tags = this.getTagArray(category);
        container.innerHTML = tags.map(tag => `
      <span class="tag" data-tag="${tag}" data-category="${category}">
        ${tag} <button type="button" class="tag-remove">×</button>
      </span>
    `).join('');

        // Reattach event listeners for new tags
        container.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.closest('.tag');
                this.removeTag(tag.dataset.category, tag.dataset.tag);
            });
        });
    }

    updateMetricsDisplay() {
        const rr = this.calculateRR();

        // This is called when form first renders, elements may not exist yet
        const posEl = document.querySelector('.metrics-panel .metric-item:nth-child(1) .metric-value');
        if (posEl) posEl.textContent = '$' + this.metrics.positionSize.toLocaleString();

        const feeEl = document.querySelector('.metrics-panel .metric-item:nth-child(2) .metric-value');
        if (feeEl) feeEl.textContent = '$' + this.metrics.estFees.toFixed(2);

        const liqEl = document.querySelector('.metrics-panel .metric-item:nth-child(3) .metric-value');
        if (liqEl) liqEl.textContent = this.metrics.liquidationPrice > 0 ? '$' + this.metrics.liquidationPrice.toFixed(2) : 'N/A';

        const rrEl = document.querySelector('.metrics-panel .metric-item:nth-child(4) .metric-value');
        if (rrEl) {
            rrEl.textContent = rr > 0 ? '1:' + rr.toFixed(2) : 'N/A';
            rrEl.className = 'metric-value ' + (rr >= 2 ? 'text-success' : rr > 0 ? 'text-warning' : '');
        }
    }

    updateSideButtons() {
        document.querySelectorAll('.side-btn').forEach(btn => {
            btn.classList.remove('active', 'long', 'short');
            if (btn.dataset.side === this.formData.side) {
                btn.classList.add('active', this.formData.side.toLowerCase());
            }
        });
    }

    updateLeverageButtons() {
        document.querySelectorAll('[data-leverage]').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.leverage) === this.formData.leverage);
        });
    }

    updateStars() {
        document.querySelectorAll('.star-btn').forEach(btn => {
            const star = parseInt(btn.dataset.star);
            btn.classList.toggle('active', star <= this.formData.exitQuality);
        });

        const label = document.querySelector('.star-label');
        if (label) {
            label.textContent = this.formData.exitQuality > 0 ? this.formData.exitQuality + '/5' : 'Rate';
        }
    }

    renderFormContent() {
        const content = document.getElementById('trade-form-content');
        if (content) {
            const profile = this.dataManager.getProfile();
            const portfolioBalance = this.calculatePortfolioBalance();
            const strategies = this.dataManager.getStrategies().filter(s => s.status === 'active');
            const selectedStrategy = strategies.find(s => s.name === this.formData.strategy);
            const theme = this.getTheme();

            const form = document.getElementById('trade-entry-form');
            form.innerHTML = this.renderFormFields(strategies, selectedStrategy, portfolioBalance, theme);

            this.attachFormInputListeners();
            this.attachQuickButtonListeners();
            this.attachPriceListeners();
            this.attachTagListeners();
            this.attachStrategyListeners();
        }
    }

    // ============================================================================
    // SUBMIT
    // ============================================================================

    handleSubmit() {
        // Validate required fields
        if (!this.formData.symbol || !this.formData.entryPrice || !this.formData.capital) {
            alert('Please fill in all required fields');
            return;
        }

        // Check if exit fields are required and filled
        if (this.entryMode !== 'LIVE') {
            if (!this.formData.exitPrice || !this.formData.exitDate) {
                alert('Please fill in exit price and date for past/data trades');
                return;
            }
        }

        // Calculate P&L for closed trades
        let pnl = 0;
        let pnlPercentage = 0;
        let status = 'OPEN';
        let finalExitDate = undefined;
        let finalExitPrice = undefined;

        if (this.entryMode !== 'LIVE') {
            status = 'CLOSED';
            finalExitDate = this.formData.exitDate;
            finalExitPrice = parseFloat(this.formData.exitPrice);

            const entry = parseFloat(this.formData.entryPrice);
            if (this.formData.side === 'LONG') {
                pnl = (finalExitPrice - entry) * this.metrics.quantity;
            } else {
                pnl = (entry - finalExitPrice) * this.metrics.quantity;
            }

            const capital = parseFloat(this.formData.capital);
            if (capital > 0) {
                pnlPercentage = (pnl / capital) * 100;
            }
        }

        // Create trade object
        const newTrade = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            symbol: this.formData.symbol.toUpperCase(),
            side: this.formData.side,
            entryPrice: parseFloat(this.formData.entryPrice),
            quantity: this.metrics.quantity,
            capital: parseFloat(this.formData.capital),
            leverage: this.formData.leverage,
            exchange: this.formData.exchange,
            entryDate: this.formData.entryDate,
            status: status,
            tradeType: this.entryMode,
            exitDate: finalExitDate,
            exitPrice: finalExitPrice,
            exitQuality: this.entryMode !== 'LIVE' ? this.formData.exitQuality : undefined,
            pnl: status === 'CLOSED' ? pnl : undefined,
            pnlPercentage: status === 'CLOSED' ? parseFloat(pnlPercentage.toFixed(2)) : undefined,
            notes: this.formData.notes,
            strategy: this.formData.strategy || 'Discretionary',
            stopLoss: this.formData.stopLoss ? parseFloat(this.formData.stopLoss) : undefined,
            takeProfit: this.formData.takeProfit ? parseFloat(this.formData.takeProfit) : undefined,
            entryReasons: this.entryReasons,
            exitReasons: this.exitReasons,
            mentalState: this.mentalStates,
            tags: this.generalTags,
            setups: this.selectedSetups,
            riskReward: this.calculateRR()
        };

        // Save trade
        this.dataManager.addTrade(newTrade);

        // Call callback if provided
        if (this.onSaveCallback) {
            this.onSaveCallback(newTrade);
        }

        // Close modal
        this.close();

        // Reload data on main page
        if (window.loadData) {
            window.loadData();
        }
    }
}

// ============================================================================
// INITIALIZE
// ============================================================================

// Make globally available
window.TradeFormModal = TradeFormModal;

// Initialize trade form instance
window.tradeFormModal = new TradeFormModal();
