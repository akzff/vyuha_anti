/**
 * Constants - Default values, color schemes, and configurations
 */

// ============================================================================
// DEFAULT STRATEGIES
// ============================================================================

const DEFAULT_STRATEGIES = [
    {
        id: '1',
        name: 'Momentum Master',
        version: 1,
        status: 'active',
        description: 'Capitalizes on strong price movements, confirmed by volume.',
        setups: ['Breakout', 'Continuation'],
        sizingRules: ['1% risk per trade'],
        riskParams: { maxRiskPerTrade: 1, minRR: 2, dailyMaxDD: 3 },
        stats: { totalTrades: 0, winRate: 0, avgRR: 0, netRoi: 0, totalPnl: 0 },
        entryRules: { primary: ['Price > EMA20'], secondary: ['Volume > Avg'] },
        exitRules: { primary: ['Price < EMA20'], secondary: ['RSI Divergence'] },
    },
    {
        id: '2',
        name: 'Supply & Demand',
        version: 1,
        status: 'active',
        description: 'Trading specific zones of supply and demand.',
        setups: ['Rejection', 'Zone Flip'],
        sizingRules: ['2% risk per trade'],
        riskParams: { maxRiskPerTrade: 2, minRR: 3, dailyMaxDD: 5 },
        stats: { totalTrades: 0, winRate: 0, avgRR: 0, netRoi: 0, totalPnl: 0 },
        entryRules: { primary: ['Price enters zone'], secondary: [] },
        exitRules: { primary: ['Opposing zone'], secondary: [] },
    },
];

// ============================================================================
// DEFAULT TAGS
// ============================================================================

const DEFAULT_TAGS = {
    entry: [
        { id: '1', name: 'Breakout', color: 'purple', isBold: true, hasGlow: false },
        { id: '2', name: 'Pullback', color: 'blue', isBold: false, hasGlow: false },
    ],
    exit: [
        { id: '5', name: 'Target Hit', color: 'green', isBold: true, hasGlow: true },
        { id: '6', name: 'Stop Loss', color: 'red', isBold: true, hasGlow: false },
        { id: '7', name: 'Manual Close', color: 'amber', isBold: false, hasGlow: false },
    ],
    mental: [
        { id: '8', name: 'FOMO', color: 'red', isBold: true, hasGlow: true },
        { id: '10', name: 'Confident', color: 'green', isBold: false, hasGlow: false },
        { id: '11', name: 'Anxious', color: 'amber', isBold: false, hasGlow: false },
    ],
    general: [
        { id: '12', name: 'News Event', color: 'white', isBold: false, hasGlow: false },
    ]
};

// ============================================================================
// TAG COLORS
// ============================================================================

const TAG_COLORS = {
    purple: {
        bg: '#8B5CF6',
        bgAlpha: 'rgba(139, 92, 246, 0.2)',
        border: 'rgba(139, 92, 246, 0.5)',
        text: '#A78BFA',
        glow: '0 0 10px rgba(139,92,246,0.5)',
        dot: '#8B5CF6'
    },
    blue: {
        bg: '#3B82F6',
        bgAlpha: 'rgba(59, 130, 246, 0.2)',
        border: 'rgba(59, 130, 246, 0.5)',
        text: '#60A5FA',
        glow: '0 0 10px rgba(59,130,246,0.5)',
        dot: '#3B82F6'
    },
    emerald: {
        bg: '#10B981',
        bgAlpha: 'rgba(16, 185, 129, 0.2)',
        border: 'rgba(16, 185, 129, 0.5)',
        text: '#34D399',
        glow: '0 0 10px rgba(16,185,129,0.5)',
        dot: '#10B981'
    },
    green: {
        bg: '#22C55E',
        bgAlpha: 'rgba(34, 197, 94, 0.2)',
        border: 'rgba(34, 197, 94, 0.5)',
        text: '#4ADE80',
        glow: '0 0 10px rgba(34,197,94,0.5)',
        dot: '#22C55E'
    },
    rose: {
        bg: '#F43F5E',
        bgAlpha: 'rgba(244, 63, 94, 0.2)',
        border: 'rgba(244, 63, 94, 0.5)',
        text: '#FB7185',
        glow: '0 0 10px rgba(244,63,94,0.5)',
        dot: '#F43F5E'
    },
    red: {
        bg: '#EF4444',
        bgAlpha: 'rgba(239, 68, 68, 0.2)',
        border: 'rgba(239, 68, 68, 0.5)',
        text: '#F87171',
        glow: '0 0 10px rgba(239,68,68,0.5)',
        dot: '#EF4444'
    },
    amber: {
        bg: '#F59E0B',
        bgAlpha: 'rgba(245, 158, 11, 0.2)',
        border: 'rgba(245, 158, 11, 0.5)',
        text: '#FBBF24',
        glow: '0 0 10px rgba(245,158,11,0.5)',
        dot: '#F59E0B'
    },
    slate: {
        bg: '#64748B',
        bgAlpha: 'rgba(100, 116, 139, 0.2)',
        border: 'rgba(100, 116, 139, 0.5)',
        text: '#94A3B8',
        glow: '0 0 10px rgba(148,163,184,0.5)',
        dot: '#64748B'
    },
    white: {
        bg: '#FFFFFF',
        bgAlpha: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.3)',
        text: '#FFFFFF',
        glow: '0 0 10px rgba(255,255,255,0.5)',
        dot: '#FFFFFF'
    },
};

// ============================================================================
// DEFAULT EXCHANGES
// ============================================================================

const DEFAULT_EXCHANGES = [
    'Binance',
    'Bybit',
    'Coinbase',
    'Kraken',
    'OKX',
    'BitMEX',
    'Bitfinex'
];

// ============================================================================
// DEFAULT PROFILE
// ============================================================================

const DEFAULT_PROFILE = {
    nickname: 'Trader',
    bio: 'A disciplined trader focused on consistent growth',
    primaryExchange: 'Binance',
    timezone: 'UTC',
    baseCurrency: 'USD',
    fees: {
        maker: 0.02,
        taker: 0.05,
        type: 'PERCENTAGE'
    }
};

// ============================================================================
// DEFAULT ACCOUNTS
// ============================================================================

const DEFAULT_ACCOUNTS = [
    {
        id: 'main',
        name: 'Main Account',
        currency: 'USD',
        icon: 'fa-wallet',
        color: 'text-indigo-400'
    }
];

// ============================================================================
// DEFAULT TRANSACTIONS
// ============================================================================

const DEFAULT_TRANSACTIONS = [
    {
        id: '1',
        type: 'DEPOSIT',
        amount: 10000,
        date: new Date().toISOString(),
        note: 'Initial Deposit',
        accountId: 'main'
    }
];

// ============================================================================
// DEFAULT PROFIT GOALS
// ============================================================================

const DEFAULT_PROFIT_GOALS = {
    daily: { target: 1.5, active: true },
    weekly: { target: 5, active: true },
    monthly: { target: 15, active: true },
};

// ============================================================================
// DEFAULT RISK SETTINGS
// ============================================================================

const DEFAULT_RISK_SETTINGS = {
    dailyDD: 5,
    weeklyDD: 10,
    monthlyDD: 20,
    maxTradesDay: 0,
    maxTradesWeek: 0,
    maxRiskPerTrade: 1.0,
};

// ============================================================================
// DEFAULT HABITS
// ============================================================================

const DEFAULT_HABITS = [
    { id: '1', name: 'Market Analysis (Pre-market)' },
    { id: '2', name: 'Review Trading Plan' },
    { id: '3', name: 'Followed Trading Plan' },
    { id: '4', name: 'No Emotional Decisions' },
    { id: '5', name: 'Journal All Trades' },
    { id: '6', name: 'Backtesting / Strategy Work' },
    { id: '7', name: 'Read Market News / Analysis' },
    { id: '8', name: 'Physical Exercise' },
    { id: '9', name: 'Meditation / Mindfulness' },
    { id: '10', name: 'Progress Review' },
];

// ============================================================================
// DEFAULT FOCUS TASKS
// ============================================================================

const DEFAULT_FOCUS_TASKS = [
    {
        id: '1',
        text: 'Backtest divergence strategy',
        completed: false,
        color: 'amber',
        isBold: true,
        hasGlow: true
    },
    {
        id: '2',
        text: 'Review monthly PnL',
        completed: false,
        color: 'blue',
        isBold: false,
        hasGlow: false
    },
];

// ============================================================================
// CURRENCY CONFIGURATIONS
// ============================================================================

const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    INR: '₹'
};

const CURRENCY_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150,
    AUD: 1.52,
    CAD: 1.36,
    INR: 83.5
};

// ============================================================================
// TRADE STATUS & SIDE ENUMS
// ============================================================================

const TradeSide = {
    LONG: 'LONG',
    SHORT: 'SHORT'
};

const TradeStatus = {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED'
};

const TradeType = {
    LIVE: 'LIVE',
    PAST: 'PAST',
    DATA: 'DATA'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get currency formatter for a specific currency
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {Object} Formatting utilities
 */
function getCurrencyFormatter(currency = 'USD') {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    const rate = CURRENCY_RATES[currency] || 1;

    return {
        symbol,
        rate,
        format: (value) => {
            const converted = value * rate;
            return `${symbol}${converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        },
        formatCompact: (value) => {
            const converted = value * rate;
            if (Math.abs(converted) >= 1000000) {
                return `${symbol}${(converted / 1000000).toFixed(2)}M`;
            } else if (Math.abs(converted) >= 1000) {
                return `${symbol}${(converted / 1000).toFixed(2)}K`;
            }
            return `${symbol}${converted.toFixed(2)}`;
        },
        convert: (usdValue) => usdValue * rate
    };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date
 */
function formatDateYMD(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 * @param {string} timezone - Timezone string
 * @returns {string} Today's date
 */
function getTodayString(timezone = 'UTC') {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: timezone });
}

// ============================================================================
// EXPORT (if using modules) or make available globally
// ============================================================================

// Make constants available globally
if (typeof window !== 'undefined') {
    window.DEFAULT_STRATEGIES = DEFAULT_STRATEGIES;
    window.DEFAULT_TAGS = DEFAULT_TAGS;
    window.TAG_COLORS = TAG_COLORS;
    window.DEFAULT_EXCHANGES = DEFAULT_EXCHANGES;
    window.DEFAULT_PROFILE = DEFAULT_PROFILE;
    window.DEFAULT_ACCOUNTS = DEFAULT_ACCOUNTS;
    window.DEFAULT_TRANSACTIONS = DEFAULT_TRANSACTIONS;
    window.DEFAULT_PROFIT_GOALS = DEFAULT_PROFIT_GOALS;
    window.DEFAULT_RISK_SETTINGS = DEFAULT_RISK_SETTINGS;
    window.DEFAULT_HABITS = DEFAULT_HABITS;
    window.DEFAULT_FOCUS_TASKS = DEFAULT_FOCUS_TASKS;
    window.CURRENCY_SYMBOLS = CURRENCY_SYMBOLS;
    window.CURRENCY_RATES = CURRENCY_RATES;
    window.TradeSide = TradeSide;
    window.TradeStatus = TradeStatus;
    window.TradeType = TradeType;
    window.getCurrencyFormatter = getCurrencyFormatter;
    window.generateId = generateId;
    window.formatDateYMD = formatDateYMD;
    window.getTodayString = getTodayString;
}
