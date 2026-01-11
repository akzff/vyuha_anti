/**
 * Calculations - P&L, Risk, and Portfolio calculations
 */

// ============================================================================
// P&L CALCULATIONS
// ============================================================================

/**
 * Calculate P&L for a trade
 * @param {Object} trade - Trade object
 * @param {number} exitPrice - Exit price
 * @returns {Object} P&L data
 */
function calculateTradePnL(trade, exitPrice) {
    const qty = trade.quantity;
    let pnl = 0;

    if (trade.side === 'LONG') {
        pnl = (exitPrice - trade.entryPrice) * qty;
    } else { // SHORT
        pnl = (trade.entryPrice - exitPrice) * qty;
    }

    const pnlPercentage = trade.capital > 0 ? (pnl / trade.capital) * 100 : 0;

    return {
        pnl,
        pnlPercentage
    };
}

/**
 * Calculate unrealized P&L for an open trade
 * @param {Object} trade - Trade object
 * @param {number} currentPrice - Current market price
 * @returns {Object} Unrealized P&L data
 */
function calculateUnrealizedPnL(trade, currentPrice) {
    if (trade.status === 'CLOSED') {
        return { pnl: trade.pnl || 0, pnlPercentage: trade.pnlPercentage || 0 };
    }

    return calculateTradePnL(trade, currentPrice);
}

// ============================================================================
// PORTFOLIO CALCULATIONS
// ============================================================================

/**
 * Calculate portfolio balance
 * @param {Array} transactions - All transactions
 * @param {Array} trades - All portfolio trades (excluding DATA type)
 * @returns {number} Current balance
 */
function calculatePortfolioBalance(transactions, trades) {
    const totalDeposits = transactions
        .filter(t => t.type === 'DEPOSIT')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalWithdrawals = transactions
        .filter(t => t.type === 'WITHDRAWAL')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalRealizedPnL = trades
        .filter(t => t.status === 'CLOSED')
        .reduce((acc, t) => acc + (t.pnl || 0), 0);

    return totalDeposits - totalWithdrawals + totalRealizedPnL;
}

/**
 * Get portfolio trades (excluding DATA type)
 * @param {Array} allTrades - All trades
 * @returns {Array} Portfolio trades
 */
function getPortfolioTrades(allTrades) {
    return allTrades.filter(t => t.tradeType !== 'DATA');
}

/**
 * Get data lab trades (only DATA type)
 * @param {Array} allTrades - All trades
 * @returns {Array} Data trades
 */
function getDataTrades(allTrades) {
    return allTrades.filter(t => t.tradeType === 'DATA');
}

// ============================================================================
// RISK CALCULATIONS
// ============================================================================

/**
 * Calculate risk state for the current day
 * @param {Array} portfolioTrades - Portfolio trades
 * @param {Array} transactions - All transactions
 * @param {number} portfolioBalance - Current balance
 * @param {Object} riskSettings - Risk settings
 * @param {string} timezone - User timezone
 * @returns {Object} Risk state
 */
function calculateRiskState(portfolioTrades, transactions, portfolioBalance, riskSettings, timezone = 'UTC') {
    const now = new Date();
    const today = now.toLocaleDateString('en-CA', { timeZone: timezone });

    // 1. Identify Today's Activity
    const todayTrades = portfolioTrades.filter(t => {
        const entryDay = new Date(t.entryDate).toLocaleDateString('en-CA', { timeZone: timezone });
        return entryDay === today;
    });

    // Calculate Realized PnL for trades CLOSED TODAY
    const todayClosedTrades = portfolioTrades.filter(t => {
        if (t.status !== 'CLOSED' || !t.exitDate) return false;
        const exitDay = new Date(t.exitDate).toLocaleDateString('en-CA', { timeZone: timezone });
        return exitDay === today;
    });

    const todayRealizedPnL = todayClosedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

    // 2. Calculate Start of Day Balance
    const todayTx = transactions.filter(tx =>
        new Date(tx.date).toLocaleDateString('en-CA', { timeZone: timezone }) === today
    );
    const todayNetDep = todayTx.reduce((acc, tx) =>
        tx.type === 'DEPOSIT' ? acc + tx.amount : acc - tx.amount, 0
    );

    const startOfDayBalance = portfolioBalance - todayNetDep - todayRealizedPnL;

    // 3. Evaluate Limits
    const dailyDDLimit = Number(riskSettings.dailyDD) || 0;
    const maxTrades = Number(riskSettings.maxTradesDay) || 0;

    let currentDD = 0;
    // Only calculate Drawdown if we are in negative realized PnL
    if (todayRealizedPnL < 0 && startOfDayBalance > 0) {
        currentDD = (Math.abs(todayRealizedPnL) / startOfDayBalance) * 100;
    }

    const tradeCount = todayTrades.length;

    const isDDLocked = dailyDDLimit > 0 && currentDD >= dailyDDLimit;
    const isFreqLocked = maxTrades > 0 && tradeCount >= maxTrades;

    let lockReason = '';
    if (isDDLocked) {
        lockReason = `Daily Drawdown Hit (${currentDD.toFixed(1)}% / ${dailyDDLimit}%)`;
    } else if (isFreqLocked) {
        lockReason = `Daily Trade Limit Reached (${tradeCount}/${maxTrades})`;
    }

    return {
        currentDD,
        dailyDDLimit,
        tradeCount,
        maxTrades,
        isLocked: isDDLocked || isFreqLocked,
        lockReason,
        startOfDayBalance,
        todayRealizedPnL,
        todayTrades: todayTrades.length
    };
}

// ============================================================================
// ANALYTICS CALCULATIONS
// ============================================================================

/**
 * Calculate win rate
 * @param {Array} trades - Closed trades
 * @returns {number} Win rate percentage
 */
function calculateWinRate(trades) {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    if (closedTrades.length === 0) return 0;

    const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    return (wins / closedTrades.length) * 100;
}

/**
 * Calculate average win and loss
 * @param {Array} trades - Closed trades
 * @returns {Object} Average win and loss
 */
function calculateAvgWinLoss(trades) {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const wins = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losses = closedTrades.filter(t => (t.pnl || 0) < 0);

    const avgWin = wins.length > 0
        ? wins.reduce((acc, t) => acc + (t.pnl || 0), 0) / wins.length
        : 0;

    const avgLoss = losses.length > 0
        ? Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0) / losses.length)
        : 0;

    return { avgWin, avgLoss };
}

/**
 * Calculate profit factor
 * @param {Array} trades - Closed trades
 * @returns {number} Profit factor
 */
function calculateProfitFactor(trades) {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const grossProfit = closedTrades
        .filter(t => (t.pnl || 0) > 0)
        .reduce((acc, t) => acc + (t.pnl || 0), 0);

    const grossLoss = Math.abs(closedTrades
        .filter(t => (t.pnl || 0) < 0)
        .reduce((acc, t) => acc + (t.pnl || 0), 0));

    return grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
}

/**
 * Calculate total P&L
 * @param {Array} trades - Closed trades
 * @returns {number} Total PnL
 */
function calculateTotalPnL(trades) {
    return trades
        .filter(t => t.status === 'CLOSED')
        .reduce((acc, t) => acc + (t.pnl || 0), 0);
}

/**
 * Calculate ROI based on initial capital
 * @param {Array} trades - Closed trades
 * @param {number} initialCapital - Starting capital
 * @returns {number} ROI percentage
 */
function calculateROI(trades, initialCapital) {
    const totalPnL = calculateTotalPnL(trades);
    return initialCapital > 0 ? (totalPnL / initialCapital) * 100 : 0;
}

// ============================================================================
// DATE FILTERING
// ============================================================================

/**
 * Filter trades by date range
 * @param {Array} trades - All trades
 * @param {Object} filter - Date filter object
 * @returns {Array} Filtered trades
 */
function filterTradesByDate(trades, filter) {
    if (filter.type === 'LIFETIME') {
        return trades;
    }

    const now = new Date();
    let startDate, endDate;

    if (filter.type === 'RELATIVE') {
        const days = filter.days || 30;
        endDate = now;
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    } else if (filter.type === 'ABSOLUTE' && filter.range) {
        startDate = new Date(filter.range.start);
        endDate = new Date(filter.range.end);
    } else {
        return trades;
    }

    return trades.filter(t => {
        const tradeDate = new Date(t.entryDate);
        return tradeDate >= startDate && tradeDate <= endDate;
    });
}

// ============================================================================
// PROFIT GOALS CALCULATIONS
// ============================================================================

/**
 * Calculate profit goals progress
 * @param {Array} trades - Portfolio trades
 * @param {Object} profitGoals - Profit goals settings
 * @param {number} portfolioBalance - Current balance
 * @param {string} timezone - User timezone
 * @returns {Object} Progress for each goal
 */
function calculateProfitGoalsProgress(trades, profitGoals, portfolioBalance, timezone = 'UTC') {
    const now = new Date();
    const today = now.toLocaleDateString('en-CA', { timeZone: timezone });

    // Daily
    const dailyTrades = trades.filter(t => {
        if (t.status !== 'CLOSED' || !t.exitDate) return false;
        const exitDay = new Date(t.exitDate).toLocaleDateString('en-CA', { timeZone: timezone });
        return exitDay === today;
    });
    const dailyPnL = dailyTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const dailyTarget = (portfolioBalance * profitGoals.daily.target) / 100;
    const dailyProgress = dailyTarget > 0 ? (dailyPnL / dailyTarget) * 100 : 0;

    // Weekly (last 7 days)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTrades = trades.filter(t => {
        if (t.status !== 'CLOSED' || !t.exitDate) return false;
        return new Date(t.exitDate) >= weekAgo;
    });
    const weeklyPnL = weeklyTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const weeklyTarget = (portfolioBalance * profitGoals.weekly.target) / 100;
    const weeklyProgress = weeklyTarget > 0 ? (weeklyPnL / weeklyTarget) * 100 : 0;

    // Monthly (last 30 days)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyTrades = trades.filter(t => {
        if (t.status !== 'CLOSED' || !t.exitDate) return false;
        return new Date(t.exitDate) >= monthAgo;
    });
    const monthlyPnL = monthlyTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const monthlyTarget = (portfolioBalance * profitGoals.monthly.target) / 100;
    const monthlyProgress = monthlyTarget > 0 ? (monthlyPnL / monthlyTarget) * 100 : 0;

    return {
        daily: {
            pnl: dailyPnL,
            target: dailyTarget,
            progress: Math.max(0, dailyProgress),
            active: profitGoals.daily.active
        },
        weekly: {
            pnl: weeklyPnL,
            target: weeklyTarget,
            progress: Math.max(0, weeklyProgress),
            active: profitGoals.weekly.active
        },
        monthly: {
            pnl: monthlyPnL,
            target: monthlyTarget,
            progress: Math.max(0, monthlyProgress),
            active: profitGoals.monthly.active
        }
    };
}

// ============================================================================
// MAKE FUNCTIONS AVAILABLE GLOBALLY
// ============================================================================

if (typeof window !== 'undefined') {
    window.calculateTradePnL = calculateTradePnL;
    window.calculateUnrealizedPnL = calculateUnrealizedPnL;
    window.calculatePortfolioBalance = calculatePortfolioBalance;
    window.getPortfolioTrades = getPortfolioTrades;
    window.getDataTrades = getDataTrades;
    window.calculateRiskState = calculateRiskState;
    window.calculateWinRate = calculateWinRate;
    window.calculateAvgWinLoss = calculateAvgWinLoss;
    window.calculateProfitFactor = calculateProfitFactor;
    window.calculateTotalPnL = calculateTotalPnL;
    window.calculateROI = calculateROI;
    window.filterTradesByDate = filterTradesByDate;
    window.calculateProfitGoalsProgress = calculateProfitGoalsProgress;
}
