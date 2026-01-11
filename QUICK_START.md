# 🚀 Quick Start Guide - TradeVerse Dashboard

## Getting Started in 3 Steps

### Step 1: Generate Sample Data (2 minutes)
1. Open `data-generator.html` in your browser
2. Click **"Generate & View Analytics"** (default: 50 trades)
3. Review the statistics
4. Click the link to view analytics OR proceed to step 2

### Step 2: Explore Analytics (5 minutes)
1. Open `analytics.html` in your browser
2. Click through all 4 tabs:
   - **Analysis:** Charts + KPIs
   - **Log:** Trade history table
   - **Calendar:** Daily profit grid
   - **Deep Dive:** Performance breakdowns
3. Try the filters (Symbol, Strategy, Side)
4. Navigate the calendar (Previous/Next month buttons)

### Step 3: Use Dashboard (5 minutes)
1. Open `index.html` in your browser
2. View your performance:
   - Recent Activity (last 3 trades)
   - Day of Week charts
   - Profit Goals progress
   - Mission Control (habits + focus tasks)
3. Toggle a daily habit
4. Add a focus task

---

## 📂 File Guide

### **Main Pages:**
- `index.html` - Main Dashboard
- `analytics.html` - Performance Analytics
- `journal.html` - Trading Journal
- `habits.html` - Habit Tracker
- `goals.html` - Goals & Risk Management
- `tags.html` - Tags Management

### **Utilities:**
- `data-generator.html` - Generate sample trades

### **Scripts:**
- `script.js` - Dashboard logic
- `analytics.js` - Analytics engine
- `habits.js` - Habits functionality
- `journal.js` - Journal functionality
- `data-manager.js` - Data persistence
- `calculations.js` - Financial calculations
- `sample-data-generator.js` - Data generation

### **Styles:**
- `styles.css` - All UI styles

---

## ⌨️ Keyboard Shortcuts

- **Enter** on focus task input → Add new task
- **Click** on checkbox → Toggle habit/task
- **Click** on calendar day → (Future: View day details)

---

##  🎨 Color Legend

### **P&L Colors:**
- 🟢 **Green** = Profit / Win
- 🔴 **Red** = Loss
- ⚪ **Gray** = Breakeven / Neutral

### **Side Colors:**
- 🟢 **Green Badge** = LONG position
- 🔴 **Red Badge** = SHORT position

### **Quality Stars:**
- ⭐ = 1 star (Poor execution)
- ⭐⭐⭐⭐⭐ = 5 stars (Perfect execution)

---

## 🗂️ Data Storage

All data is stored in your browser's **localStorage**:
- `nexus_trades` - All trades
- `nexus_strategies` - Trading strategies
- `nexus_habits` - Habit definitions
- `nexus_habit_completions` - Habit check history
- `nexus_focus_tasks` - Focus task list
- `nexus_profit_goals` - Profit targets
- `nexus_risk_settings` - Risk parameters

---

## 🎯 Common Tasks

### **Add Sample Data:**
1. Open `data-generator.html`
2. Enter trade count (1-500)
3. Click "Generate & View Analytics"

### **Clear All Data:**
1. Open `data-generator.html`
2. Click "Clear All Trades"
3. Confirm deletion

### **View Trade History:**
1. Open `analytics.html`
2. Click "Log" tab
3. Browse all closed trades

### **Check Daily Performance:**
1. Open `analytics.html`
2. Click "Calendar" tab
3. View monthly profit grid

### **Analyze Performance:**
1. Open `analytics.html`
2. Click "Deep Dive" tab
3. Select breakdown type (Symbol/Strategy/Day/Hour/Side)
4. View chart and table

---

## 📊 Understanding the Analytics

### **Analysis Tab KPIs:**

1. **Total Trades** - Number of closed trades
2. **Win Rate** - Percentage of winning trades
3. **Profit Factor** - Gross profit ÷ Gross loss
4. **Expectancy** - Average $ per trade
5. **Avg R:R** - Average risk/reward ratio
6. **Sharpe Ratio** - Risk-adjusted returns
7. **Avg Win** - Average profit per winning trade
8. **Avg Loss** - Average loss per losing trade
9. **Max Hit** - Largest winning trade
10. **Max Drawdown** - Largest loss from peak
11. **Win Streak** - Longest consecutive wins
12. **Loss Streak** - Longest consecutive losses

### **Performance Charts:**

- **Cumulative P&L** - Shows profit growth over time
- **Performance Over Time** - Tracks win rate, profit factor
- **Day of Week P&L** - Shows best/worst trading days
- **Day of Week Activity** - Shows busiest trading days

---

## 🛠️ Troubleshooting

### **No data showing?**
- Generate sample data using `data-generator.html`
- Check browser console for errors (F12)

### **Charts not loading?**
- Ensure Chart.js CDN is accessible
- Wait 2-3 seconds for page load
- Refresh the page (Ctrl+R)

### **Data not persisting?**
- Check if browser allows localStorage
- Try a different browser
- Clear browser cache and retry

### **Filters not working?**
- Click "Reset" button
- Refresh the page
- Re-apply filters one at a time

---

## 🔄 Current vs. Planned Features

### ✅ **Currently Working:**
- Analytics (all 4 tabs)
- Dashboard (with live data)
- Sample data generator
- Habit tracking (with persistence)
- Focus task management
- Profit goals tracking
- Performance charts

### ⏳ **Planned (Not Yet Implemented):**
- Trade Form Modal (add/edit trades from UI)
- Trade Details Modal (view trade info)
- Playbook/Strategy management
- Journal save/load
- Export/Import trades (CSV/JSON)
- Portfolio equity tracking
- Achievements/Gamification

---

## 💡 Tips & Best Practices

1. **Start with sample data** to understand the analytics
2. **Explore all tabs** to see different views
3. **Use filters** to analyze specific periods or symbols
4. **Check calendar** to identify best trading days
5. **Monitor Deep Dive** to find your edge
6. **Toggle habits daily** to build discipline
7. **Set realistic profit goals** in goals.html

---

## 📱 Browser Compatibility

**Recommended:**
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

**Works Best On:**
- Desktop/Laptop (optimized)
- Mobile (basic functionality, enhancements planned)

---

## 🆘 Need Help?

Refer to these documents:
- `INTEGRATION_STATUS.md` - Feature tracking
- `COMPLETION_REPORT.md` - Detailed documentation
- `README.md` - Project overview (if available)

---

**Last Updated:** January 11, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
