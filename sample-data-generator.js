// ============================================================================
// SAMPLE DATA GENERATOR
// Generates realistic trading data for demonstration purposes
// ============================================================================

class SampleDataGenerator {
    constructor() {
        this.symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AAPL', 'TSLA', 'NVDA', 'SPY', 'EUR/USD'];
        this.strategies = ['Momentum Master', 'Supply & Demand', 'Breakout Hunter', 'Reversal Edge', 'Trend Following'];
        this.sides = ['LONG', 'SHORT'];
    }

    // Generate a random date within the last N days
    randomDate(daysBack = 90) {
        const now = new Date();
        const randomDays = Math.floor(Math.random() * daysBack);
        const date = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));

        // Add random hours and minutes
        date.setHours(Math.floor(Math.random() * 24));
        date.setMinutes(Math.floor(Math.random() * 60));

        return date;
    }

    // Generate a random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Generate a random integer between min and max
    randomInt(min, max) {
        return Math.floor(this.random(min, max));
    }

    // Generate a single trade
    generateTrade(index) {
        const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        const strategy = this.strategies[Math.floor(Math.random() * this.strategies.length)];
        const side = this.sides[Math.floor(Math.random() * this.sides.length)];

        const entryDate = this.randomDate(90);
        const holdingTimeHours = this.random(0.5, 72); // 30 min to 3 days
        const exitDate = new Date(entryDate.getTime() + (holdingTimeHours * 60 * 60 * 1000));

        // Price logic based on symbol
        let entryPrice, exitPrice;
        if (symbol.includes('BTC')) {
            entryPrice = this.random(40000, 50000);
        } else if (symbol.includes('ETH')) {
            entryPrice = this.random(2000, 3000);
        } else if (symbol.includes('SOL')) {
            entryPrice = this.random(80, 150);
        } else if (symbol.includes('EUR')) {
            entryPrice = this.random(1.05, 1.15);
        } else {
            entryPrice = this.random(100, 500);
        }

        // Generate win/loss with 55% win rate
        const isWin = Math.random() < 0.55;

        // Calculate exit price based on win/loss
        let percentChange;
        if (isWin) {
            percentChange = this.random(0.5, 5); // 0.5% to 5% gain
        } else {
            percentChange = -this.random(0.3, 2); // 0.3% to 2% loss
        }

        if (side === 'SHORT') {
            percentChange = -percentChange; // Reverse for shorts
        }

        exitPrice = entryPrice * (1 + percentChange / 100);

        const quantity = this.random(0.1, 10);
        const entryValue = entryPrice * quantity;
        const exitValue = exitPrice * quantity;
        const pnl = side === 'LONG' ? exitValue - entryValue : entryValue - exitValue;
        const pnlPercentage = (pnl / entryValue) * 100;

        // Risk/Reward (typical range 1:1.5 to 1:3)
        const riskReward = isWin ? this.random(1.5, 3) : this.random(0.5, 0.9);

        // Quality rating (1-5 stars)
        let exitQuality;
        if (Math.abs(pnlPercentage) > 3) {
            exitQuality = 5;
        } else if (Math.abs(pnlPercentage) > 2) {
            exitQuality = 4;
        } else if (Math.abs(pnlPercentage) > 1) {
            exitQuality = 3;
        } else if (Math.abs(pnlPercentage) > 0.5) {
            exitQuality = 2;
        } else {
            exitQuality = 1;
        }

        return {
            id: `trade_${Date.now()}_${index}`,
            symbol: symbol,
            side: side,
            strategy: strategy,
            entryDate: entryDate.toISOString(),
            exitDate: exitDate.toISOString(),
            entryPrice: parseFloat(entryPrice.toFixed(2)),
            exitPrice: parseFloat(exitPrice.toFixed(2)),
            quantity: parseFloat(quantity.toFixed(4)),
            pnl: parseFloat(pnl.toFixed(2)),
            pnlPercentage: parseFloat(pnlPercentage.toFixed(2)),
            riskReward: parseFloat(riskReward.toFixed(2)),
            status: 'CLOSED',
            exitQuality: exitQuality,
            notes: isWin ? 'Good execution, followed the plan.' : 'Stop loss hit, protected capital.',
            tags: [],
            emotionalState: isWin ? 'confident' : 'disciplined'
        };
    }

    // Generate multiple trades
    generateTrades(count = 50) {
        const trades = [];
        for (let i = 0; i < count; i++) {
            trades.push(this.generateTrade(i));
        }

        // Sort by entry date
        trades.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));

        return trades;
    }

    // Add trades to localStorage
    addToLocalStorage(trades) {
        try {
            // Get existing trades
            const existingData = localStorage.getItem('trades');
            let allTrades = existingData ? JSON.parse(existingData) : [];

            // Add new trades
            allTrades = allTrades.concat(trades);

            // Save back to localStorage
            localStorage.setItem('trades', JSON.stringify(allTrades));

            console.log(`✅ Successfully added ${trades.length} trades to localStorage`);
            console.log(`📊 Total trades: ${allTrades.length}`);

            return allTrades;
        } catch (error) {
            console.error('❌ Error saving trades:', error);
            return null;
        }
    }

    // Clear all trades
    clearAllTrades() {
        localStorage.removeItem('trades');
        console.log('🗑️ All trades cleared from localStorage');
    }

    // Generate and display statistics
    displayStatistics(trades) {
        const wins = trades.filter(t => t.pnl > 0).length;
        const losses = trades.filter(t => t.pnl <= 0).length;
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
        const winRate = (wins / trades.length) * 100;

        console.log('\n📈 SAMPLE DATA STATISTICS');
        console.log('='.repeat(50));
        console.log(`Total Trades: ${trades.length}`);
        console.log(`Winning Trades: ${wins}`);
        console.log(`Losing Trades: ${losses}`);
        console.log(`Win Rate: ${winRate.toFixed(1)}%`);
        console.log(`Total P&L: $${totalPnl.toFixed(2)}`);
        console.log(`Average P&L per Trade: $${(totalPnl / trades.length).toFixed(2)}`);
        console.log('='.repeat(50));

        // Symbol breakdown
        const symbolStats = {};
        trades.forEach(t => {
            if (!symbolStats[t.symbol]) {
                symbolStats[t.symbol] = { count: 0, pnl: 0 };
            }
            symbolStats[t.symbol].count++;
            symbolStats[t.symbol].pnl += t.pnl;
        });

        console.log('\n💹 BY SYMBOL:');
        Object.entries(symbolStats)
            .sort((a, b) => b[1].pnl - a[1].pnl)
            .forEach(([symbol, stats]) => {
                console.log(`  ${symbol}: ${stats.count} trades, $${stats.pnl.toFixed(2)}`);
            });

        // Strategy breakdown
        const strategyStats = {};
        trades.forEach(t => {
            if (!strategyStats[t.strategy]) {
                strategyStats[t.strategy] = { count: 0, pnl: 0 };
            }
            strategyStats[t.strategy].count++;
            strategyStats[t.strategy].pnl += t.pnl;
        });

        console.log('\n🎯 BY STRATEGY:');
        Object.entries(strategyStats)
            .sort((a, b) => b[1].pnl - a[1].pnl)
            .forEach(([strategy, stats]) => {
                console.log(`  ${strategy}: ${stats.count} trades, $${stats.pnl.toFixed(2)}`);
            });
    }
}

// ============================================================================
// QUICK ACTIONS - Use these in browser console
// ============================================================================

function generateSampleData(count = 50) {
    console.log(`🎲 Generating ${count} sample trades...`);
    const generator = new SampleDataGenerator();
    const trades = generator.generateTrades(count);
    generator.displayStatistics(trades);
    const allTrades = generator.addToLocalStorage(trades);

    console.log('\n✨ Sample data generated successfully!');
    console.log('🔄 Reload the page or refresh analytics to see the data.');

    return allTrades;
}

function clearSampleData() {
    const generator = new SampleDataGenerator();
    generator.clearAllTrades();
    console.log('\n🔄 Reload the page to see the changes.');
}

function generateAndReload(count = 50) {
    generateSampleData(count);
    setTimeout(() => {
        console.log('🔄 Reloading page...');
        window.location.reload();
    }, 1000);
}

// ============================================================================
// AUTO-RUN (if script is loaded directly)
// ============================================================================

console.log('📊 Sample Data Generator Loaded!');
console.log('\n🎯 AVAILABLE COMMANDS:');
console.log('  generateSampleData(50)    - Generate 50 sample trades');
console.log('  generateAndReload(50)     - Generate and auto-reload page');
console.log('  clearSampleData()         - Clear all trades');
console.log('\nExample: generateAndReload(100)');
