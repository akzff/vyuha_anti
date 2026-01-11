/**
 * Data Manager - localStorage wrapper for persistent data management
 * Handles all CRUD operations for the trading dashboard
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================
const STORAGE_KEYS = {
    TRADES: 'nexus_trades',
    STRATEGIES: 'nexus_strategies',
    TAGS: 'nexus_tags',
    EXCHANGES: 'nexus_exchanges',
    PROFILE: 'nexus_profile',
    ACCOUNTS: 'nexus_accounts',
    TRANSACTIONS: 'nexus_transactions',
    PROFIT_GOALS: 'nexus_profit_goals',
    RISK_SETTINGS: 'nexus_risk_settings',
    HABITS: 'nexus_habits',
    HABIT_COMPLETIONS: 'nexus_habit_completions',
    FOCUS_TASKS: 'nexus_focus_tasks',
    JOURNAL_ENTRIES: 'nexus_journal_entries',
    ANALYTICS_FILTER: 'nexus_analytics_filter'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Parsed value or default
 */
function getFromStorage(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return defaultValue;
    }
}

/**
 * Save item to localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to save
 * @returns {boolean} Success status
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        return false;
    }
}

// ============================================================================
// DATA MANAGER CLASS
// ============================================================================

class DataManager {
    constructor() {
        this.initializeDefaults();
    }

    /**
     * Initialize with default values if storage is empty
     */
    initializeDefaults() {
        // Initialize trades if empty
        if (!localStorage.getItem(STORAGE_KEYS.TRADES)) {
            this.saveTrades([]);
        }

        // Initialize strategies with defaults
        if (!localStorage.getItem(STORAGE_KEYS.STRATEGIES)) {
            this.saveStrategies(DEFAULT_STRATEGIES);
        }

        // Initialize tags with defaults
        if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
            this.saveTags(DEFAULT_TAGS);
        }

        // Initialize other defaults...
        if (!localStorage.getItem(STORAGE_KEYS.EXCHANGES)) {
            this.saveExchanges(DEFAULT_EXCHANGES);
        }

        if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
            this.saveProfile(DEFAULT_PROFILE);
        }

        if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
            this.saveAccounts(DEFAULT_ACCOUNTS);
        }

        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            this.saveTransactions(DEFAULT_TRANSACTIONS);
        }

        if (!localStorage.getItem(STORAGE_KEYS.PROFIT_GOALS)) {
            this.saveProfitGoals(DEFAULT_PROFIT_GOALS);
        }

        if (!localStorage.getItem(STORAGE_KEYS.RISK_SETTINGS)) {
            this.saveRiskSettings(DEFAULT_RISK_SETTINGS);
        }

        if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
            this.saveHabits(DEFAULT_HABITS);
        }

        if (!localStorage.getItem(STORAGE_KEYS.HABIT_COMPLETIONS)) {
            this.saveHabitCompletions({});
        }

        if (!localStorage.getItem(STORAGE_KEYS.FOCUS_TASKS)) {
            this.saveFocusTasks(DEFAULT_FOCUS_TASKS);
        }

        if (!localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES)) {
            this.saveJournalEntries([]);
        }

        if (!localStorage.getItem(STORAGE_KEYS.ANALYTICS_FILTER)) {
            this.saveAnalyticsFilter({ type: 'LIFETIME' });
        }
    }

    // ============================================================================
    // TRADES
    // ============================================================================

    getTrades() {
        return getFromStorage(STORAGE_KEYS.TRADES, []);
    }

    // Alias for analytics compatibility
    getAllTrades() {
        return this.getTrades();
    }

    saveTrades(trades) {
        return saveToStorage(STORAGE_KEYS.TRADES, trades);
    }

    addTrade(trade) {
        const trades = this.getTrades();
        trades.unshift(trade); // Add to beginning
        return this.saveTrades(trades);
    }

    updateTrade(tradeId, updates) {
        const trades = this.getTrades();
        const index = trades.findIndex(t => t.id === tradeId);
        if (index !== -1) {
            trades[index] = { ...trades[index], ...updates };
            return this.saveTrades(trades);
        }
        return false;
    }

    deleteTrade(tradeId) {
        const trades = this.getTrades();
        const filtered = trades.filter(t => t.id !== tradeId);
        return this.saveTrades(filtered);
    }

    // ============================================================================
    // STRATEGIES
    // ============================================================================

    getStrategies() {
        return getFromStorage(STORAGE_KEYS.STRATEGIES, DEFAULT_STRATEGIES);
    }

    saveStrategies(strategies) {
        return saveToStorage(STORAGE_KEYS.STRATEGIES, strategies);
    }

    addStrategy(strategy) {
        const strategies = this.getStrategies();
        strategies.push(strategy);
        return this.saveStrategies(strategies);
    }

    updateStrategy(strategyId, updates) {
        const strategies = this.getStrategies();
        const index = strategies.findIndex(s => s.id === strategyId);
        if (index !== -1) {
            strategies[index] = { ...strategies[index], ...updates };
            return this.saveStrategies(strategies);
        }
        return false;
    }

    // ============================================================================
    // TAGS
    // ============================================================================

    getTags() {
        return getFromStorage(STORAGE_KEYS.TAGS, DEFAULT_TAGS);
    }

    saveTags(tags) {
        return saveToStorage(STORAGE_KEYS.TAGS, tags);
    }

    addTag(category, tag) {
        const tags = this.getTags();
        if (!tags[category]) {
            tags[category] = [];
        }
        tags[category].push(tag);
        return this.saveTags(tags);
    }

    deleteTag(category, tagId) {
        const tags = this.getTags();
        if (tags[category]) {
            tags[category] = tags[category].filter(t => t.id !== tagId);
            return this.saveTags(tags);
        }
        return false;
    }

    updateTag(category, tagId, updates) {
        const tags = this.getTags();
        if (tags[category]) {
            const index = tags[category].findIndex(t => t.id === tagId);
            if (index !== -1) {
                tags[category][index] = { ...tags[category][index], ...updates };
                return this.saveTags(tags);
            }
        }
        return false;
    }

    // ============================================================================
    // PROFILE & SETTINGS
    // ============================================================================

    getProfile() {
        return getFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    }

    saveProfile(profile) {
        return saveToStorage(STORAGE_KEYS.PROFILE, profile);
    }

    getProfitGoals() {
        return getFromStorage(STORAGE_KEYS.PROFIT_GOALS, DEFAULT_PROFIT_GOALS);
    }

    saveProfitGoals(goals) {
        return saveToStorage(STORAGE_KEYS.PROFIT_GOALS, goals);
    }

    getRiskSettings() {
        return getFromStorage(STORAGE_KEYS.RISK_SETTINGS, DEFAULT_RISK_SETTINGS);
    }

    saveRiskSettings(settings) {
        return saveToStorage(STORAGE_KEYS.RISK_SETTINGS, settings);
    }

    // ============================================================================
    // ACCOUNTS & TRANSACTIONS
    // ============================================================================

    getAccounts() {
        return getFromStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
    }

    saveAccounts(accounts) {
        return saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
    }

    getTransactions() {
        return getFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    }

    saveTransactions(transactions) {
        return saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.unshift(transaction);
        return this.saveTransactions(transactions);
    }

    // ============================================================================
    // HABITS
    // ============================================================================

    getHabits() {
        return getFromStorage(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
    }

    saveHabits(habits) {
        return saveToStorage(STORAGE_KEYS.HABITS, habits);
    }

    getHabitCompletions() {
        return getFromStorage(STORAGE_KEYS.HABIT_COMPLETIONS, {});
    }

    saveHabitCompletions(completions) {
        return saveToStorage(STORAGE_KEYS.HABIT_COMPLETIONS, completions);
    }

    toggleHabit(habitId, dateStr) {
        const completions = this.getHabitCompletions();
        const key = `${habitId}_${dateStr}`;
        completions[key] = !completions[key];
        return this.saveHabitCompletions(completions);
    }

    // ============================================================================
    // FOCUS TASKS
    // ============================================================================

    getFocusTasks() {
        return getFromStorage(STORAGE_KEYS.FOCUS_TASKS, DEFAULT_FOCUS_TASKS);
    }

    saveFocusTasks(tasks) {
        return saveToStorage(STORAGE_KEYS.FOCUS_TASKS, tasks);
    }

    addFocusTask(task) {
        const tasks = this.getFocusTasks();
        tasks.push(task);
        return this.saveFocusTasks(tasks);
    }

    toggleFocusTask(taskId) {
        const tasks = this.getFocusTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index].completed = !tasks[index].completed;
            return this.saveFocusTasks(tasks);
        }
        return false;
    }

    deleteFocusTask(taskId) {
        const tasks = this.getFocusTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        return this.saveFocusTasks(filtered);
    }

    // ============================================================================
    // JOURNAL
    // ============================================================================

    getJournalEntries() {
        return getFromStorage(STORAGE_KEYS.JOURNAL_ENTRIES, []);
    }

    saveJournalEntries(entries) {
        return saveToStorage(STORAGE_KEYS.JOURNAL_ENTRIES, entries);
    }

    saveJournalEntry(entry) {
        const entries = this.getJournalEntries();
        const existingIndex = entries.findIndex(
            e => e.date === entry.date && e.type === entry.type
        );

        if (existingIndex >= 0) {
            entries[existingIndex] = entry;
        } else {
            entries.push(entry);
        }

        return this.saveJournalEntries(entries);
    }

    getJournalEntry(date, type) {
        const entries = this.getJournalEntries();
        return entries.find(e => e.date === date && e.type === type);
    }

    // ============================================================================
    // EXCHANGES
    // ============================================================================

    getExchanges() {
        return getFromStorage(STORAGE_KEYS.EXCHANGES, DEFAULT_EXCHANGES);
    }

    saveExchanges(exchanges) {
        return saveToStorage(STORAGE_KEYS.EXCHANGES, exchanges);
    }

    // ============================================================================
    // ANALYTICS FILTER
    // ============================================================================

    getAnalyticsFilter() {
        return getFromStorage(STORAGE_KEYS.ANALYTICS_FILTER, { type: 'LIFETIME' });
    }

    saveAnalyticsFilter(filter) {
        return saveToStorage(STORAGE_KEYS.ANALYTICS_FILTER, filter);
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Clear all data (reset to defaults)
     */
    clearAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeDefaults();
    }

    /**
     * Export all data as JSON
     */
    exportData() {
        const data = {};
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            data[name] = getFromStorage(key, null);
        });
        return data;
    }

    /**
     * Import data from JSON
     */
    importData(data) {
        Object.entries(data).forEach(([name, value]) => {
            const key = STORAGE_KEYS[name];
            if (key && value !== null) {
                saveToStorage(key, value);
            }
        });
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create global instance
const dataManager = new DataManager();

// Make it available globally
window.dataManager = dataManager;
