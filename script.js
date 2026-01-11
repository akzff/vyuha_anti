/**
 * Main Dashboard Script
 * Handles UI interactions and integrates with data layer
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================

let currentTrades = [];
let currentProfile = {};
let currentProfitGoals = {};
let currentRiskSettings = {};
let currentHabits = [];
let currentHabitCompletions = {};
let currentFocusTasks = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
  // Load data from storage
  loadData();

  // Render UI
  renderOpenPositions();
  renderRecentActivity();
  renderDailyHabits();
  renderFocusTasks();
  renderProfitGoals();
  renderRiskStatus();

  // Initialize event listeners
  initializeEventListeners();

  // Initialize charts
  setTimeout(() => {
    initializeCharts();
  }, 100);
});

// ============================================================================
// DATA LOADING
// ============================================================================

function loadData() {
  currentTrades = dataManager.getTrades();
  currentProfile = dataManager.getProfile();
  currentProfitGoals = dataManager.getProfitGoals();
  currentRiskSettings = dataManager.getRiskSettings();
  currentHabits = dataManager.getHabits();
  currentHabitCompletions = dataManager.getHabitCompletions();
  currentFocusTasks = dataManager.getFocusTasks();
}

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

/**
 * Render open positions
 */
function renderOpenPositions() {
  const container = document.getElementById('positions-container');
  if (!container) return;

  const openTrades = currentTrades.filter(t => t.status === 'OPEN');

  // Update badge count
  const badge = document.querySelector('.badge.active');
  if (badge) {
    badge.textContent = `${openTrades.length} Active`;
  }

  if (openTrades.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-2xl); color: var(--text-muted);">
        <p>No open positions</p>
        <p style="font-size: 0.875rem; margin-top: var(--spacing-sm);">Click "New Trade" to add your first position</p>
      </div>
    `;
    return;
  }

  container.innerHTML = openTrades.map(trade => {
    // Calculate unrealized P&L (would need current price - using mock for now)
    const mockCurrentPrice = trade.side === 'LONG'
      ? trade.entryPrice * 1.02
      : trade.entryPrice * 0.98;

    const pnlData = calculateUnrealizedPnL(trade, mockCurrentPrice);
    const pnlClass = pnlData.pnl >= 0 ? 'positive' : 'negative';
    const pnlSign = pnlData.pnl >= 0 ? '+' : '';

    return `
      <div class="position-card">
        <div class="position-info">
          <div>
            <div class="position-symbol">${trade.symbol}</div>
            <span class="position-type">${trade.side}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: var(--spacing-xs);">
            <div>Entry: $${trade.entryPrice.toFixed(2)}</div>
            <div>Stop: $${(trade.stopLoss || 0).toFixed(2)} • TP: $${(trade.takeProfit || 0).toFixed(2)}</div>
          </div>
        </div>
        <div class="position-stats">
          <div>
            <div class="position-pnl ${pnlClass}">
              ${pnlSign}$${Math.abs(pnlData.pnl).toFixed(2)}
            </div>
            <div class="pnl-change ${pnlClass}">
              ${pnlSign}${pnlData.pnlPercentage.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render recent activity
 */
function renderRecentActivity() {
  const container = document.getElementById('activity-container');
  if (!container) return;

  const closedTrades = currentTrades
    .filter(t => t.status === 'CLOSED')
    .sort((a, b) => new Date(b.exitDate) - new Date(a.exitDate))
    .slice(0, 3);

  if (closedTrades.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
        <p>No recent activity</p>
      </div>
    `;
    return;
  }

  container.innerHTML = closedTrades.map(trade => {
    const isWin = (trade.pnl || 0) > 0;
    const iconClass = isWin ? 'green' : 'red';
    const badgeClass = isWin ? 'win' : 'loss';
    const pnlClass = isWin ? 'positive' : 'negative';
    const icon = isWin ? '📈' : '📉';
    const pnlSign = isWin ? '+' : '';

    return `
      <div class="activity-item">
        <div class="activity-info">
          <div class="activity-icon ${iconClass}">${icon}</div>
          <div class="activity-details">
            <h4>${trade.symbol} ${trade.side}</h4>
            <div class="activity-meta">
              Entry: $${trade.entryPrice.toFixed(2)} → Exit: $${(trade.exitPrice || 0).toFixed(2)}
            </div>
          </div>
        </div>
        <div class="activity-result">
          <div class="badge ${badgeClass}">${isWin ? 'WIN' : 'LOSS'}</div>
          <div class="activity-pnl ${pnlClass}">
            ${pnlSign}$${Math.abs(trade.pnl || 0).toFixed(2)}
          </div>
          <div class="activity-change ${pnlClass}">
            ${pnlSign}${(trade.pnlPercentage || 0).toFixed(2)}%
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render daily habits with persistence
 */
function renderDailyHabits() {
  const container = document.getElementById('daily-habits');
  if (!container) return;

  const today = getTodayString(currentProfile.timezone || 'UTC');

  container.innerHTML = currentHabits.slice(0, 5).map((habit, index) => {
    const key = `${habit.id}_${today}`;
    const isCompleted = currentHabitCompletions[key] || false;
    const checkedClass = isCompleted ? 'checked' : '';

    return `
      <li class="checklist-item">
        <div class="checkbox ${checkedClass}" data-habit-id="${habit.id}" data-date="${today}"></div>
        <span class="checklist-label">${habit.name}</span>
      </li>
    `;
  }).join('');

  // Add event listeners to checkboxes
  container.querySelectorAll('.checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function () {
      const habitId = this.getAttribute('data-habit-id');
      const date = this.getAttribute('data-date');

      // Toggle in storage
      dataManager.toggleHabit(habitId, date);

      // Toggle UI
      this.classList.toggle('checked');

      // Update completions
      currentHabitCompletions = dataManager.getHabitCompletions();
    });
  });
}

/**
 * Render focus tasks
 */
function renderFocusTasks() {
  const container = document.querySelector('.focus-item').parentElement;
  if (!container) return;

  // Clear existing tasks (except input)
  const input = container.querySelector('#focus-input');
  const inputContainer = input.parentElement;
  container.innerHTML = '<h4 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: var(--spacing-sm); text-transform: uppercase; letter-spacing: 0.5px;">Focus List</h4>';

  // Render tasks
  currentFocusTasks.forEach(task => {
    const indicator = task.completed ? 'inactive' : 'active';
    const taskDiv = document.createElement('div');
    taskDiv.className = 'focus-item';
    taskDiv.innerHTML = `
      <span class="focus-indicator ${indicator}"></span>
      <span class="focus-text" style="${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${task.text}</span>
    `;
    taskDiv.style.cursor = 'pointer';
    taskDiv.addEventListener('click', () => toggleFocusTask(task.id));
    container.appendChild(taskDiv);
  });

  // Re-add input
  container.appendChild(inputContainer);
}

/**
 * Toggle focus task completion
 */
function toggleFocusTask(taskId) {
  dataManager.toggleFocusTask(taskId);
  currentFocusTasks = dataManager.getFocusTasks();
  renderFocusTasks();
}

/**
 * Render profit goals with real calculations
 */
function renderProfitGoals() {
  const portfolioTrades = getPortfolioTrades(currentTrades);
  const transactions = dataManager.getTransactions();
  const portfolioBalance = calculatePortfolioBalance(transactions, portfolioTrades);

  const goalsProgress = calculateProfitGoalsProgress(
    portfolioTrades,
    currentProfitGoals,
    portfolioBalance,
    currentProfile.timezone || 'UTC'
  );

  const formatter = getCurrencyFormatter(currentProfile.baseCurrency || 'USD');

  // Update Daily Target
  updateProgressBar(0, goalsProgress.daily.progress,
    formatter.format(goalsProgress.daily.pnl),
    formatter.format(goalsProgress.daily.target));

  // Update Weekly Target
  updateProgressBar(1, goalsProgress.weekly.progress,
    formatter.format(goalsProgress.weekly.pnl),
    formatter.format(goalsProgress.weekly.target));

  // Update Monthly Target
  updateProgressBar(2, goalsProgress.monthly.progress,
    formatter.format(goalsProgress.monthly.pnl),
    formatter.format(goalsProgress.monthly.target));
}

/**
 * Update a progress bar
 */
function updateProgressBar(index, progress, current, target) {
  const sections = document.querySelectorAll('.progress-section');
  if (sections[index]) {
    const progressBar = sections[index].querySelector('.progress-bar');
    const progressValue = sections[index].querySelector('.progress-value strong');
    const valueSpans = sections[index].querySelectorAll('div[style*="justify-content: space-between"] span');

    if (progressBar) {
      progressBar.style.width = `${Math.min(100, progress)}%`;
    }
    if (progressValue) {
      progressValue.textContent = `${progress.toFixed(1)}%`;
    }
    if (valueSpans.length >= 2) {
      valueSpans[0].textContent = current;
      valueSpans[1].textContent = target;
    }
  }
}

/**
 * Render risk status with real calculations
 */
function renderRiskStatus() {
  const portfolioTrades = getPortfolioTrades(currentTrades);
  const transactions = dataManager.getTransactions();
  const portfolioBalance = calculatePortfolioBalance(transactions, portfolioTrades);

  const riskState = calculateRiskState(
    portfolioTrades,
    transactions,
    portfolioBalance,
    currentRiskSettings,
    currentProfile.timezone || 'UTC'
  );

  // Update risk per trade (this would come from settings)
  const riskPerTrade = currentRiskSettings.maxRiskPerTrade || 1.0;
  const riskAmount = (portfolioBalance * riskPerTrade) / 100;

  // Update daily DD progress bar
  const dailyDDSection = document.querySelectorAll('.progress-section')[3]; // Assuming index
  if (dailyDDSection) {
    const progressBar = dailyDDSection.querySelector('.progress-bar');
    const progressValue = dailyDDSection.querySelector('.progress-value');

    if (progressBar && progressValue) {
      const ddProgress = riskState.dailyDDLimit > 0
        ? (riskState.currentDD / riskState.dailyDDLimit) * 100
        : 0;

      progressBar.style.width = `${Math.min(100, ddProgress)}%`;
      progressValue.textContent = `${riskState.currentDD.toFixed(2)}% / ${riskState.dailyDDLimit}%`;

      // Change color based on risk level
      if (ddProgress > 80) {
        progressBar.style.background = 'linear-gradient(90deg, var(--red-primary), var(--red-light))';
      } else if (ddProgress > 50) {
        progressBar.style.background = 'linear-gradient(90deg, var(--orange-primary), #fbbf24)';
      } else {
        progressBar.style.background = 'linear-gradient(90deg, var(--green-primary), var(--green-light))';
      }
    }
  }

  // Show lock status if locked
  if (riskState.isLocked) {
    alert(`⚠️ Trading Locked: ${riskState.lockReason}`);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initializeEventListeners() {
  // Focus task input
  const focusInput = document.getElementById('focus-input');
  if (focusInput) {
    focusInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        const newTask = {
          id: generateId(),
          text: this.value.trim(),
          completed: false,
          color: 'purple',
          isBold: false,
          hasGlow: false
        };

        dataManager.addFocusTask(newTask);
        currentFocusTasks = dataManager.getFocusTasks();
        renderFocusTasks();
        this.value = '';
      }
    });
  }

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Active navigation link on scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // New Trade button - open trade form modal
  const newTradeCard = document.querySelector('.nav-card[href="#new-trade"]');
  if (newTradeCard) {
    newTradeCard.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.tradeFormModal) {
        window.tradeFormModal.open((trade) => {
          console.log('New trade added:', trade);
          // Reload UI
          loadData();
          renderOpenPositions();
          renderRecentActivity();
          renderProfitGoals();
          renderRiskStatus();
          initializeCharts();
        });
      }
    });
  }
}

// ============================================================================
// CHARTS INITIALIZATION
// ============================================================================

function initializeCharts() {
  createPnLChart();
  createPerformanceChart();
  createDayPnLChart();
  createDayActivityChart();
}

function createPnLChart() {
  const ctx = document.getElementById('pnl-chart');
  if (!ctx) return;

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0.01)');

  // Calculate cumulative P&L from closed trades
  const closedTrades = currentTrades
    .filter(t => t.status === 'CLOSED')
    .sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));

  let cumulative = 0;
  const data = closedTrades.map(t => {
    cumulative += t.pnl || 0;
    return cumulative;
  });

  const labels = closedTrades.map((t, i) => `Trade ${i + 1}`);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['Start'],
      datasets: [{
        label: 'Cumulative P&L',
        data: data.length > 0 ? data : [0],
        borderColor: '#8b5cf6',
        backgroundColor: gradient,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: getChartOptions('Cumulative P&L ($)')
  });
}

function createPerformanceChart() {
  const ctx = document.getElementById('performance-chart');
  if (!ctx) return;

  const closedTrades = currentTrades
    .filter(t => t.status === 'CLOSED')
    .sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));

  const labels = closedTrades.map((t, i) => `${i + 1}`);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['1'],
      datasets: [
        {
          label: 'Win Rate',
          data: labels.length > 0 ? labels.map((_, i) => {
            const trades = closedTrades.slice(0, i + 1);
            return calculateWinRate(trades);
          }) : [0],
          borderColor: '#10b981',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: getChartOptions('Win Rate (%)')
  });
}

function createDayPnLChart() {
  const ctx = document.getElementById('day-pnl-chart');
  if (!ctx) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayPnL = new Array(7).fill(0);

  currentTrades.filter(t => t.status === 'CLOSED').forEach(trade => {
    const exitDate = new Date(trade.exitDate);
    const dayIndex = (exitDate.getDay() + 6) % 7; // Convert to Mon=0
    dayPnL[dayIndex] += trade.pnl || 0;
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'P&L',
        data: dayPnL,
        backgroundColor: dayPnL.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
        borderColor: dayPnL.map(v => v >= 0 ? '#10b981' : '#ef4444'),
        borderWidth: 1
      }]
    },
    options: getBarChartOptions('P&L ($)')
  });
}

function createDayActivityChart() {
  const ctx = document.getElementById('day-activity-chart');
  if (!ctx) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayActivity = new Array(7).fill(0);

  currentTrades.forEach(trade => {
    const entryDate = new Date(trade.entryDate);
    const dayIndex = (entryDate.getDay() + 6) % 7;
    dayActivity[dayIndex]++;
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: 'Trades',
        data: dayActivity,
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: '#8b5cf6',
        borderWidth: 1
      }]
    },
    options: getBarChartOptions('Number of Trades')
  });
}

function getChartOptions(yAxisLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 46, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: yAxisLabel, color: '#94a3b8' }
      }
    }
  };
}

function getBarChartOptions(yAxisLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 46, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: yAxisLabel, color: '#94a3b8' }
      }
    }
  };
}
