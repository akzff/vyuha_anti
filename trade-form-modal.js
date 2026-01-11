/**
 * Trade Form Modal - JavaScript
 * Handles all trade form interactions and calculations
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

let currentTradeType = 'live'; // 'live' or 'past'
let currentSide = 'LONG';
let exitQuality = 0;
const PORTFOLIO_BALANCE = 10000; // Default, will be updated from dataManager

// Crypto symbols for autocomplete
const CRYPTO_SYMBOLS = [
    { symbol: 'BTC', name: 'Bitcoin', icon: 'fa-bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'fa-ethereum' },
    { symbol: 'SOL', name: 'Solana', icon: 'fa-layer-group' },
    { symbol: 'XRP', name: 'Ripple', icon: 'fa-droplet' },
    { symbol: 'BNB', name: 'Binance Coin', icon: 'fa-coins' },
    { symbol: 'ADA', name: 'Cardano', icon: 'fa-certificate' },
    { symbol: 'DOGE', name: 'Dogecoin', icon: 'fa-dog' },
    { symbol: 'MATIC', name: 'Polygon', icon: 'fa-draw-polygon' },
    { symbol: 'DOT', name: 'Polkadot', icon: 'fa-circle-dot' },
    { symbol: 'AVAX', name: 'Avalanche', icon: 'fa-mountain' },
    { symbol: 'LINK', name: 'Chainlink', icon: 'fa-link' },
    { symbol: 'UNI', name: 'Uniswap', icon: 'fa-unicorn' },
];

// ============================================================================
// MODAL CONTROLS
// ============================================================================

/**
 * Open trade form modal
 */
function openTradeFormModal() {
    const modal = document.getElementById('trade-form-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Set current date/time
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        document.getElementById('trade-entry-date').value = localDateTime;
        document.getElementById('trade-exit-date').value = localDateTime;

        // Reset form
        resetTradeForm();
    }
}

/**
 * Close trade form modal
 */
function closeTradeFormModal() {
    const modal = document.getElementById('trade-form-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetTradeForm();
    }
}

/**
 * Reset form to initial state
 */
function resetTradeForm() {
    document.getElementById('trade-form').reset();
    currentTradeType = 'live';
    currentSide = 'LONG';
    exitQuality = 0;

    // Reset toggles
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === 'live') btn.classList.add('active');
    });

    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.side === 'LONG') btn.classList.add('active');
    });

    // Reset stars
    document.querySelectorAll('.star-rating .fa-star').forEach(star => {
        star.classList.remove('fas');
        star.classList.add('far');
    });

    // Hide exit fields
    document.getElementById('exit-fields').style.display = 'none';
    document.getElementById('pnl-metric').style.display = 'none';

    updateCalculations();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Trade type toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTradeType = this.dataset.type;

            // Show/hide exit fields
            const exitFields = document.getElementById('exit-fields');
            if (currentTradeType === 'past') {
                exitFields.style.display = 'block';
                document.getElementById('pnl-metric').style.display = 'block';
                document.getElementById('submit-text').textContent = 'Log Past Trade';
            } else {
                exitFields.style.display = 'none';
                document.getElementById('pnl-metric').style.display = 'none';
                document.getElementById('submit-text').textContent = 'Open Position';
            }

            updateCalculations();
        });
    });

    // Side toggle
    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSide = this.dataset.side;
            updateCalculations();
        });
    });

    // Symbol autocomplete
    const symbolInput = document.getElementById('trade-symbol');
    if (symbolInput) {
        symbolInput.addEventListener('input', handleSymbolInput);
        symbolInput.addEventListener('focus', () => {
            if (symbolInput.value.length > 0) showSymbolSuggestions(symbolInput.value);
        });
        symbolInput.addEventListener('blur', () => {
            setTimeout(() => {
                document.getElementById('symbol-suggestions').style.display = 'none';
            }, 200);
        });
    }

    // Real-time calculations
    const calcInputs = [
        'trade-entry-price', 'trade-capital', 'trade-leverage',
        'trade-stop-loss', 'trade-take-profit', 'trade-exit-price'
    ];

    calcInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateCalculations);
        }
    });

    // SL/TP percent inputs
    document.getElementById('sl-percent')?.addEventListener('input', function () {
        const percent = parseFloat(this.value);
        if (!isNaN(percent)) setSLPercent(percent);
    });

    document.getElementById('tp-percent')?.addEventListener('input', function () {
        const percent = parseFloat(this.value);
        if (!isNaN(percent)) setTPPercent(percent);
    });

    // Star rating
    document.querySelectorAll('.star-rating .fa-star').forEach(star => {
        star.addEventListener('click', function () {
            exitQuality = parseInt(this.dataset.rating);
            updateStarRating(exitQuality);
        });

        star.addEventListener('mouseenter', function () {
            const rating = parseInt(this.dataset.rating);
            updateStarRating(rating, true);
        });
    });

    document.querySelector('.star-rating')?.addEventListener('mouseleave', function () {
        updateStarRating(exitQuality);
    });
});

// ============================================================================
// SYMBOL AUTOCOMPLETE
// ============================================================================

function handleSymbolInput(e) {
    const value = e.target.value.toUpperCase();
    e.target.value = value;

    if (value.length > 0) {
        showSymbolSuggestions(value);
    } else {
        document.getElementById('symbol-suggestions').style.display = 'none';
    }
}

function showSymbolSuggestions(query) {
    const filtered = CRYPTO_SYMBOLS.filter(s =>
        s.symbol.includes(query) || s.name.toUpperCase().includes(query)
    );

    const container = document.getElementById('symbol-suggestions');
    if (filtered.length > 0) {
        container.innerHTML = filtered.map(s => `
      <div class="suggestion-item" onclick="selectSymbol('${s.symbol}')">
        <i class="fa-brands ${s.icon}"></i>
        <div>
          <div class="suggestion-symbol">${s.symbol}</div>
          <div class="suggestion-name">${s.name}</div>
        </div>
      </div>
    `).join('');
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function selectSymbol(symbol) {
    document.getElementById('trade-symbol').value = symbol;
    document.getElementById('symbol-suggestions').style.display = 'none';
}

// ============================================================================
// CALCULATIONS
// ============================================================================

function updateCalculations() {
    const entryPrice = parseFloat(document.getElementById('trade-entry-price').value) || 0;
    const capital = parseFloat(document.getElementById('trade-capital').value) || 0;
    const leverage = parseFloat(document.getElementById('trade-leverage').value) || 1;
    const stopLoss = parseFloat(document.getElementById('trade-stop-loss').value) || 0;
    const takeProfit = parseFloat(document.getElementById('trade-take-profit').value) || 0;
    const exitPrice = parseFloat(document.getElementById('trade-exit-price').value) || 0;

    // Position size
    const positionSize = capital * leverage;
    document.getElementById('calc-position-size').textContent = `$${positionSize.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Quantity
    const quantity = entryPrice > 0 ? positionSize / entryPrice : 0;
    document.getElementById('calc-quantity').textContent = quantity.toFixed(4);

    // Risk/Reward
    if (entryPrice > 0 && stopLoss > 0 && takeProfit > 0) {
        const risk = Math.abs(entryPrice - stopLoss);
        const reward = Math.abs(takeProfit - entryPrice);
        const rr = risk > 0 ? reward / risk : 0;
        document.getElementById('calc-rr').textContent = `1:${rr.toFixed(2)}`;
    } else {
        document.getElementById('calc-rr').textContent = '0.00';
    }

    // P&L (for past trades)
    if (currentTradeType === 'past' && entryPrice > 0 && exitPrice > 0) {
        let pnl = 0;
        if (currentSide === 'LONG') {
            pnl = (exitPrice - entryPrice) * quantity;
        } else {
            pnl = (entryPrice - exitPrice) * quantity;
        }

        const pnlElement = document.getElementById('calc-pnl');
        pnlElement.textContent = `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
        pnlElement.style.color = pnl >= 0 ? 'var(--green-primary)' : 'var(--red-primary)';
    }
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

function setCapitalPercent(percent) {
    const amount = (PORTFOLIO_BALANCE * percent) / 100;
    document.getElementById('trade-capital').value = amount.toFixed(2);
    updateCalculations();
}

function setLeverage(lev) {
    document.getElementById('trade-leverage').value = lev;
    updateCalculations();
}

function setSLPercent(percent) {
    const entryPrice = parseFloat(document.getElementById('trade-entry-price').value);
    if (!entryPrice || entryPrice <= 0) return;

    let slPrice = 0;
    if (currentSide === 'LONG') {
        slPrice = entryPrice * (1 - percent / 100);
    } else {
        slPrice = entryPrice * (1 + percent / 100);
    }

    document.getElementById('trade-stop-loss').value = slPrice.toFixed(2);
    document.getElementById('sl-percent').value = percent.toFixed(1);
    updateCalculations();
}

function setTPPercent(percent) {
    const entryPrice = parseFloat(document.getElementById('trade-entry-price').value);
    if (!entryPrice || entryPrice <= 0) return;

    let tpPrice = 0;
    if (currentSide === 'LONG') {
        tpPrice = entryPrice * (1 + percent / 100);
    } else {
        tpPrice = entryPrice * (1 - percent / 100);
    }

    document.getElementById('trade-take-profit').value = tpPrice.toFixed(2);
    document.getElementById('tp-percent').value = percent.toFixed(1);
    updateCalculations();
}

function updateStarRating(rating, isHover = false) {
    document.querySelectorAll('.star-rating .fa-star').forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas');
            if (isHover) {
                star.style.color = '#fbbf24';
            }
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
            if (isHover) {
                star.style.color = '';
            }
        }
    });
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================

function handleTradeFormSubmit(event) {
    event.preventDefault();

    // Gather form data
    const formData = {
        id: generateId(),
        symbol: document.getElementById('trade-symbol').value.toUpperCase(),
        side: currentSide,
        entryDate: document.getElementById('trade-entry-date').value,
        exchange: document.getElementById('trade-exchange').value,
        strategy: document.getElementById('trade-strategy').value || 'Discretionary',
        entryPrice: parseFloat(document.getElementById('trade-entry-price').value),
        capital: parseFloat(document.getElementById('trade-capital').value),
        leverage: parseFloat(document.getElementById('trade-leverage').value),
        stopLoss: parseFloat(document.getElementById('trade-stop-loss').value) || undefined,
        takeProfit: parseFloat(document.getElementById('trade-take-profit').value) || undefined,
        notes: document.getElementById('trade-notes').value,
        status: currentTradeType === 'live' ? 'OPEN' : 'CLOSED',
        tradeType: currentTradeType.toUpperCase()
    };

    // Calculate quantity
    const positionSize = formData.capital * formData.leverage;
    formData.quantity = formData.entryPrice > 0 ? positionSize / formData.entryPrice : 0;

    // Calculate R:R
    if (formData.stopLoss && formData.takeProfit) {
        const risk = Math.abs(formData.entryPrice - formData.stopLoss);
        const reward = Math.abs(formData.takeProfit - formData.entryPrice);
        formData.riskReward = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
    }

    // Add exit data for past trades
    if (currentTradeType === 'past') {
        formData.exitDate = document.getElementById('trade-exit-date').value;
        formData.exitPrice = parseFloat(document.getElementById('trade-exit-price').value);
        formData.exitQuality = exitQuality || undefined;

        // Calculate P&L
        let pnl = 0;
        if (currentSide === 'LONG') {
            pnl = (formData.exitPrice - formData.entryPrice) * formData.quantity;
        } else {
            pnl = (formData.entryPrice - formData.exitPrice) * formData.quantity;
        }

        formData.pnl = parseFloat(pnl.toFixed(2));
        formData.pnlPercentage = formData.capital > 0
            ? parseFloat(((pnl / formData.capital) * 100).toFixed(2))
            : 0;
    }

    // Save to dataManager
    try {
        dataManager.addTrade(formData);

        // Show success message
        showNotification('Trade saved successfully!', 'success');

        // Close modal
        closeTradeFormModal();

        // Reload dashboard if we're on index.html
        if (typeof loadData === 'function') {
            loadData();
            renderOpenPositions();
            renderRecentActivity();
            renderProfitGoals();
            renderRiskStatus();
            initializeCharts();
        }

    } catch (error) {
        console.error('Error saving trade:', error);
        showNotification('Error saving trade. Please try again.', 'error');
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId() {
    return 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions available globally
window.openTradeFormModal = openTradeFormModal;
window.closeTradeFormModal = closeTradeFormModal;
window.handleTradeFormSubmit = handleTradeFormSubmit;
window.setCapitalPercent = setCapitalPercent;
window.setLeverage = setLeverage;
window.setSLPercent = setSLPercent;
window.setTPPercent = setTPPercent;
window.selectSymbol = selectSymbol;
