// ============================================================================
// ANALYTICS.JS - Comprehensive Trading Analytics Dashboard
// ============================================================================

class AnalyticsManager {
    constructor() {
        // State
        this.activeTab = 'analysis';
        this.currentBreakdown = 'Symbol';
        this.calendarDate = new Date();
        
        // Filters
        this.filters = {
            dateRange: 'lifetime',
            symbol: 'All',
            strategy: 'All',
            side: 'All'
        };
        
        // Charts
        this.charts = {
            cumulativePnl: null,
            performance: null,
            breakdown: null
        };
        
        // Data
        this.allTrades = [];
        this.filteredTrades = [];
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.populateFilterDropdowns();
        this.updateView();
    }
    
    loadData() {
        // Load trades from data manager
        this.allTrades = window.dataManager ? window.dataManager.getAllTrades() : [];
        this.applyFilters();
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.analytics-tab[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Breakdown switching
        document.querySelectorAll('.analytics-tab[data-breakdown]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const breakdown = e.currentTarget.dataset.breakdown;
                this.switchBreakdown(breakdown);
            });
        });
        
        // Filter controls
        const symbolFilter = document.getElementById('symbol-filter');
        const strategyFilter = document.getElementById('strategy-filter');
        const sideFilter = document.getElementById('side-filter');
        const resetBtn = document.getElementById('reset-filters-btn');
        
        if (symbolFilter) {
            symbolFilter.addEventListener('change', (e) => {
                this.filters.symbol = e.target.value;
                this.applyFilters();
                this.updateView();
            });
        }
        
        if (strategyFilter) {
            strategyFilter.addEventListener('change', (e) => {
                this.filters.strategy = e.target.value;
                this.applyFilters();
                this.updateView();
            });
        }
        
        if (sideFilter) {
            sideFilter.addEventListener('change', (e) => {
                this.filters.side = e.target.value;
                this.applyFilters();
                this.updateView();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // Calendar navigation
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => this.navigateCalendar(-1));
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => this.navigateCalendar(1));
        }
    }
    
    populateFilterDropdowns() {
        const symbols = ['All', ...new Set(this.allTrades.map(t => t.symbol))].sort();
        const strategies = ['All', ...new Set(this.allTrades.map(t => t.strategy).filter(Boolean))].sort();
        
        const symbolFilter = document.getElementById('symbol-filter');
        const strategyFilter = document.getElementById('strategy-filter');
        
        if (symbolFilter) {
            symbolFilter.innerHTML = symbols.map(s => 
                `<option value="${s}">${s}</option>`
            ).join('');
        }
        
        if (strategyFilter) {
            strategyFilter.innerHTML = strategies.map(s => 
                `<option value="${s}">${s}</option>`
            ).join('');
        }
    }
    
    applyFilters() {
        this.filteredTrades = this.allTrades.filter(trade => {
            // Symbol filter
            if (this.filters.symbol !== 'All' && trade.symbol !== this.filters.symbol) {
                return false;
            }
            
            // Strategy filter
            if (this.filters.strategy !== 'All' && trade.strategy !== this.filters.strategy) {
                return false;
            }
            
            // Side filter
            if (this.filters.side !== 'All' && trade.side !== this.filters.side) {
                return false;
            }
            
            return true;
        });
    }
    
    resetFilters() {
        this.filters = {
            dateRange: 'lifetime',
            symbol: 'All',
            strategy: 'All',
            side: 'All'
        };
        
        document.getElementById('symbol-filter').value = 'All';
        document.getElementById('strategy-filter').value = 'All';
        document.getElementById('side-filter').value = 'All';
        
        this.applyFilters();
        this.updateView();
    }
    
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.analytics-tab[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.analytics-tab[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`)?.classList.add('active');
        
        // Render appropriate content
        this.updateView();
    }
    
    switchBreakdown(breakdown) {
        this.currentBreakdown = breakdown;
        
        // Update breakdown buttons
        document.querySelectorAll('.analytics-tab[data-breakdown]').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.analytics-tab[data-breakdown="${breakdown}"]`)?.classList.add('active');
        
        // Update breakdown label
        const breakdownType = document.getElementById('breakdown-type');
        if (breakdownType) {
            breakdownType.textContent = breakdown;
        }
        
        this.updateDeepDive();
    }
    
    updateView() {
        if (this.activeTab === 'analysis') {
            this.updateAnalysisTab();
        } else if (this.activeTab === 'log') {
            this.updateLogTab();
        } else if (this.activeTab === 'calendar') {
            this.updateCalendarTab();
        } else if (this.activeTab === 'deep-dive') {
            this.updateDeepDive();
        }
    }
    
    // =========================================================================
    // ANALYSIS TAB
    // =========================================================================
    
    updateAnalysisTab() {
        const closedTrades = this.getClosedTrades();
        const stats = this.calculateStats(closedTrades);
        
        this.updateKPIs(stats);
        this.updateCumulativePnLChart(closedTrades);
        this.updatePerformanceChart(closedTrades);
    }
    
    getClosedTrades() {
        return this.filteredTrades
            .filter(t => t.status === 'CLOSED')
            .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
    }
    
    calculateStats(trades) {
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => (t.pnl || 0) > 0);
        const losingTrades = trades.filter(t => (t.pnl || 0) <= 0);
        
        const totalWinPnl = winningTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        const totalLossPnl = Math.abs(losingTrades.reduce((acc, t) => acc + (t.pnl || 0), 0));
        
        const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
        const profitFactor = totalLossPnl > 0 ? totalWinPnl / totalLossPnl : (totalWinPnl > 0 ? 999 : 0);
        const netPnl = totalWinPnl - totalLossPnl;
        const expectancy = totalTrades > 0 ? netPnl / totalTrades : 0;
        
        const avgWin = winningTrades.length > 0 ? totalWinPnl / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? totalLossPnl / losingTrades.length : 0;
        
        // Risk/Reward
        const avgRR = totalTrades > 0 
            ? trades.reduce((acc, t) => acc + (t.riskReward || 0), 0) / totalTrades 
            : 0;
        
        // Sharpe Ratio
        const pnls = trades.map(t => t.pnl || 0);
        const meanPnl = pnls.length > 0 ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0;
        const variance = pnls.length > 0 
            ? pnls.reduce((a, b) => a + Math.pow(b - meanPnl, 2), 0) / pnls.length 
            : 0;
        const stdDev = Math.sqrt(variance);
        const sharpeRatio = stdDev > 0 ? meanPnl / stdDev : 0;
        
        // Max Drawdown
        let balance = 0, peak = 0, maxDD = 0;
        trades.forEach(t => {
            balance += t.pnl || 0;
            if (balance > peak) peak = balance;
            const dd = peak - balance;
            if (dd > maxDD) maxDD = dd;
        });
        
        // Streaks
        const streaks = this.calculateStreaks(trades);
        
        return {
            totalTrades,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate,
            profitFactor,
            netPnl,
            expectancy,
            avgWin,
            avgLoss,
            avgRR,
            sharpeRatio,
            maxDD,
            streaks,
            highestWin: winningTrades.length > 0 
                ? Math.max(...winningTrades.map(t => t.pnl || 0)) 
                : 0,
            highestLoss: losingTrades.length > 0 
                ? Math.min(...losingTrades.map(t => t.pnl || 0)) 
                : 0
        };
    }
    
    calculateStreaks(trades) {
        let currentWin = 0, currentLoss = 0, maxWin = 0, maxLoss = 0;
        
        trades.forEach(t => {
            const isWin = (t.pnl || 0) > 0;
            if (isWin) {
                currentWin++;
                currentLoss = 0;
                if (currentWin > maxWin) maxWin = currentWin;
            } else {
                currentLoss++;
                currentWin = 0;
                if (currentLoss > maxLoss) maxLoss = currentLoss;
            }
        });
        
        return { maxWin, maxLoss };
    }
    
    updateKPIs(stats) {
        // Update all KPI elements
        this.updateElement('total-trades', stats.totalTrades);
        this.updateElement('win-rate', `${stats.winRate.toFixed(0)}%`);
        this.updateElement('profit-factor', stats.profitFactor.toFixed(2));
        this.updateElement('expectancy', this.formatCurrency(stats.expectancy));
        this.updateElement('avg-rr', `${stats.avgRR.toFixed(2)}:1`);
        this.updateElement('sharpe-ratio', stats.sharpeRatio.toFixed(2));
        this.updateElement('avg-win', this.formatCurrency(stats.avgWin));
        this.updateElement('avg-loss', this.formatCurrency(Math.abs(stats.avgLoss)));
        this.updateElement('max-drawdown', this.formatCurrency(stats.maxDD));
        this.updateElement('max-win-streak', stats.streaks.maxWin);
        this.updateElement('max-loss-streak', stats.streaks.maxLoss);
        
        // Update win rate progress bar
        const winRateProgress = document.getElementById('win-rate-progress');
        if (winRateProgress) {
            winRateProgress.style.width = `${stats.winRate}%`;
        }
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    formatCurrency(value) {
        const sign = value >= 0 ? '' : '-';
        return `$${Math.abs(value).toFixed(2)}`;
    }
    
    updateCumulativePnLChart(trades) {
        const canvas = document.getElementById('cumulative-pnl-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.cumulativePnl) {
            this.charts.cumulativePnl.destroy();
        }
        
        if (trades.length === 0) {
            return;
        }
        
        // Prepare data
        let runningPnl = 0;
        const chartData = trades.map((trade, index) => {
            runningPnl += trade.pnl || 0;
            return {
                x: new Date(trade.exitDate || trade.entryDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                }),
                y: runningPnl
            };
        });
        
        const ctx = canvas.getContext('2d');
        this.charts.cumulativePnl = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(d => d.x),
                datasets: [{
                    label: 'Cumulative P&L',
                    data: chartData.map(d => d.y),
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: 'rgba(139, 92, 246, 1)',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: 'rgba(148, 163, 184, 1)',
                        bodyColor: 'rgba(129, 140, 248, 1)',
                        borderColor: 'rgba(71, 85, 105, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `P&L: ${this.formatCurrency(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.7)',
                            font: { size: 11 }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(51, 65, 85, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.7)',
                            font: { size: 11 },
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    updatePerformanceChart(trades) {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }
        
        if (trades.length === 0) {
            return;
        }
        
        // Prepare data
        let runningPnl = 0, runningWins = 0, runningWinPnl = 0, runningLossPnl = 0;
        const chartData = trades.map((trade, index) => {
            const pnl = trade.pnl || 0;
            runningPnl += pnl;
            if (pnl > 0) {
                runningWins++;
                runningWinPnl += pnl;
            } else {
                runningLossPnl += Math.abs(pnl);
            }
            const total = index + 1;
            
            return {
                date: new Date(trade.exitDate || trade.entryDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                }),
                pnl: runningPnl,
                winRate: (runningWins / total) * 100,
                profitFactor: runningLossPnl === 0 ? (runningWinPnl > 0 ? 5 : 0) : runningWinPnl / runningLossPnl
            };
        });
        
        const ctx = canvas.getContext('2d');
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(d => d.date),
                datasets: [
                    {
                        label: 'Cumulative P&L',
                        data: chartData.map(d => d.pnl),
                        borderColor: 'rgba(139, 92, 246, 1)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    },
                    {
                        label: 'Win Rate %',
                        data: chartData.map(d => d.winRate),
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4,
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0
                    },
                    {
                        label: 'Profit Factor',
                        data: chartData.map(d => d.profitFactor),
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: 'rgba(148, 163, 184, 1)',
                            padding: 15,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: 'rgba(148, 163, 184, 1)',
                        bodyColor: 'rgba(129, 140, 248, 1)',
                        borderColor: 'rgba(71, 85, 105, 0.5)',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.7)',
                            font: { size: 11 }
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        grid: {
                            color: 'rgba(51, 65, 85, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.7)',
                            font: { size: 11 },
                            callback: (value) => this.formatCurrency(value)
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.7)',
                            font: { size: 11 }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    // =========================================================================
    // LOG TAB
    // =========================================================================
    
    updateLogTab() {
        const tbody = document.getElementById('trades-table-body');
        const tradeCount = document.getElementById('trade-count');
        
        if (!tbody) return;
        
        if (tradeCount) {
            tradeCount.textContent = this.filteredTrades.length;
        }
        
        if (this.filteredTrades.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: var(--spacing-2xl); color: var(--text-muted);">
                        No trades to display
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.filteredTrades.map(trade => {
            const pnl = trade.pnl || 0;
            const pnlClass = pnl >= 0 ? 'stat-value-positive' : 'stat-value-negative';
            const pnlSign = pnl >= 0 ? '+' : '';
            const sideClass = trade.side === 'LONG' ? 'badge-success' : 'badge-danger';
            
            const exitDate = trade.exitDate || trade.entryDate;
            const dateStr = new Date(exitDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: '2-digit',
                year: 'numeric'
            });
            
            return `
                <tr>
                    <td>${dateStr}</td>
                    <td style="font-weight: 700;">${trade.symbol}</td>
                    <td style="text-align: center;">
                        <span class="badge ${sideClass}">${trade.side}</span>
                    </td>
                    <td>${trade.strategy || '-'}</td>
                    <td style="text-align: right; font-family: monospace;">${trade.entryPrice.toFixed(2)}</td>
                    <td style="text-align: right; font-family: monospace;">${trade.exitPrice ? trade.exitPrice.toFixed(2) : '-'}</td>
                    <td style="text-align: right; font-family: monospace;" class="${pnlClass}">
                        ${pnlSign}${this.formatCurrency(pnl)}
                    </td>
                    <td style="text-align: right; font-family: monospace;" class="${pnlClass}">
                        ${(trade.pnlPercentage || 0).toFixed(2)}%
                    </td>
                    <td style="text-align: center;">
                        ${this.renderStars(trade.exitQuality || 0)}
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    renderStars(quality) {
        if (!quality || quality === 0) return '-';
        return '★'.repeat(quality);
    }
    
    // =========================================================================
    // CALENDAR TAB
    // =========================================================================
    
    updateCalendarTab() {
        const calendarGrid = document.getElementById('calendar-grid');
        const calendarMonth = document.getElementById('calendar-month');
        
        if (!calendarGrid) return;
        
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        
        if (calendarMonth) {
            calendarMonth.textContent = this.calendarDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        let html = '';
        
        // Day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayTrades = this.allTrades.filter(t => {
                const tradeDate = new Date(t.exitDate || t.entryDate);
                return tradeDate.getDate() === day && 
                       tradeDate.getMonth() === month && 
                       tradeDate.getFullYear() === year &&
                       t.status === 'CLOSED';
            });
            
            const pnl = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
            const tradeCount = dayTrades.length;
            const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
            
            const hasData = tradeCount > 0;
            const isProfitable = pnl > 0;
            const isBreakeven = pnl === 0 && hasData;
            
            let cellClass = 'calendar-day';
            if (hasData) {
                if (isProfitable) cellClass += ' profit';
                else if (isBreakeven) cellClass += ' breakeven';
                else cellClass += ' loss';
            }
            
            html += `
                <div class="${cellClass}">
                    <div class="calendar-day-number">${day}</div>
                    ${hasData ? `
                        <div class="calendar-day-pnl ${pnl >= 0 ? 'positive' : 'negative'}">
                            ${this.formatCurrency(pnl)}
                        </div>
                        <div class="calendar-day-trades">
                            ${tradeCount} trade${tradeCount !== 1 ? 's' : ''} (${wins}W)
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        calendarGrid.innerHTML = html;
    }
    
    navigateCalendar(direction) {
        const newMonth = this.calendarDate.getMonth() + direction;
        this.calendarDate = new Date(this.calendarDate.getFullYear(), newMonth, 1);
        this.updateCalendarTab();
    }
    
    // =========================================================================
    // DEEP DIVE TAB
    // =========================================================================
    
    updateDeepDive() {
        const breakdownData = this.getBreakdownData();
        this.updateBreakdownChart(breakdownData);
        this.updateBreakdownTable(breakdownData);
    }
    
    getBreakdownData() {
        const closedTrades = this.getClosedTrades();
        const groups = {};
        
        closedTrades.forEach(trade => {
            let key;
            
            switch (this.currentBreakdown) {
                case 'Symbol':
                    key = trade.symbol;
                    break;
                case 'Strategy':
                    key = trade.strategy || 'No Strategy';
                    break;
                case 'Day':
                    key = new Date(trade.entryDate).toLocaleDateString('en-US', { weekday: 'long' });
                    break;
                case 'Hour':
                    key = `${new Date(trade.entryDate).getHours()}:00`;
                    break;
                case 'Side':
                    key = trade.side;
                    break;
                default:
                    key = 'Unknown';
            }
            
            if (!groups[key]) {
                groups[key] = {
                    name: key,
                    pnl: 0,
                    wins: 0,
                    total: 0
                };
            }
            
            groups[key].pnl += trade.pnl || 0;
            groups[key].total += 1;
            if ((trade.pnl || 0) > 0) {
                groups[key].wins += 1;
            }
        });
        
        return Object.values(groups)
            .map(g => ({
                ...g,
                winRate: (g.wins / g.total) * 100
            }))
            .sort((a, b) => b.pnl - a.pnl);
    }
    
    updateBreakdownChart(data) {
        const canvas = document.getElementById('breakdown-chart');
        if (!canvas) return;
        
        if (this.charts.breakdown) {
            this.charts.breakdown.destroy();
        }
        
        if (data.length === 0) return;
        
        const ctx = canvas.getContext('2d');
        this.charts.breakdown = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: 'P&L',
                    data: data.map(d => d.pnl),
                    backgroundColor: data.map(d => 
                        d.pnl >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                    ),
                    borderColor: data.map(d => 
                        d.pnl >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
                    ),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: 'rgba(148, 163, 184, 1)',
                        bodyColor: 'rgba(129, 140, 248, 1)',
                        borderColor: 'rgba(71, 85, 105, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (context) => `P&L: ${this.formatCurrency(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.7)',
                            font: { size: 11 }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(51, 65, 85, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(148, 163, 184, 0.7)',
                            font: { size: 11 },
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }
    
    updateBreakdownTable(data) {
        const tbody = document.getElementById('breakdown-table-body');
        const headerName = document.getElementById('breakdown-header-name');
        
        if (headerName) {
            headerName.textContent = this.currentBreakdown;
        }
        
        if (!tbody) return;
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: var(--spacing-2xl); color: var(--text-muted);">
                        No data to display
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = data.map(item => {
            const pnlClass = item.pnl >= 0 ? 'stat-value-positive' : 'stat-value-negative';
            const pnlSign = item.pnl >= 0 ? '+' : '';
            
            return `
                <tr>
                    <td style="font-weight: 600;">${item.name}</td>
                    <td style="text-align: right;">${item.total}</td>
                    <td style="text-align: right;">${item.winRate.toFixed(1)}%</td>
                    <td style="text-align: right; font-family: monospace;" class="${pnlClass}">
                        ${pnlSign}${this.formatCurrency(item.pnl)}
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// ============================================================================
// INITIALIZE
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});
