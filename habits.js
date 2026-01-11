// Habit Tracker JavaScript

const habits = [
    'Market Analysis (Pre-market)',
    'Review Trading Plan',
    'Followed Trading Plan',
    'No Emotional Decisions',
    'Journal All Trades',
    'Backtesting / Strategy Work',
    'Read Market News / Analysis',
    'Physical Exercise',
    'Meditation / Mindfulness',
    'Progress'
];

const currentMonth = 'January 2026';
const daysInMonth = 31;

// Generate habit calendar
function generateHabitCalendar() {
    const container = document.querySelector('.habit-calendar');

    let html = '<div class="habit-grid">';

    // Header row
    html += '<div class="habit-header-row">';
    html += '<div class="habit-label">My Habits</div>';
    for (let day = 1; day <= daysInMonth; day++) {
        html += `<div class="habit-day-header">
      <div style="font-weight: 600;">${day}</div>
    </div>`;
    }
    html += '</div>';

    // Habit rows
    habits.forEach((habit, habitIndex) => {
        html += '<div class="habit-row">';
        html += `<div class="habit-label">${habit}</div>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const isChecked = (habitIndex < 3 && day <= 3) ? 'checked' : ''; // Sample data
            html += `<div class="habit-cell">
        <div class="habit-checkbox-mini ${isChecked}" data-habit="${habitIndex}" data-day="${day}"></div>
      </div>`;
        }

        html += '</div>';
    });

    // Stats row
    html += '<div class="habit-stats-row">';
    html += '<div class="habit-label">Done</div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const completedCount = day <= 3 ? 3 : 0; // Sample data
        html += `<div class="habit-stat-cell">${completedCount}</div>`;
    }
    html += '</div>';

    // Not Done row
    html += '<div class="habit-stats-row">';
    html += '<div class="habit-label">Not Done</div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const notDoneCount = day <= 3 ? 7 : 10;
        html += `<div class="habit-stat-cell">${notDoneCount}</div>`;
    }
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;

    // Add click listeners to checkboxes
    initializeCheckboxes();
}

// Handle checkbox clicks
function initializeCheckboxes() {
    const checkboxes = document.querySelectorAll('.habit-checkbox-mini');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function () {
            this.classList.toggle('checked');
            updateStats();
        });
    });
}

// Update statistics
function updateStats() {
    const totalHabits = habits.length;
    const checkedBoxes = document.querySelectorAll('.habit-checkbox-mini.checked').length;
    const daysTracked = daysInMonth;
    const totalPossible = totalHabits * daysTracked;
    const progress = Math.round((checkedBoxes / totalPossible) * 100);

    document.getElementById('habit-count').textContent = totalHabits;
    document.getElementById('completed-count').textContent = checkedBoxes;
    document.getElementById('progress-percent').textContent = progress + '%';

    // Update progress color
    const progressElement = document.getElementById('progress-percent');
    if (progress >= 70) {
        progressElement.classList.remove('neutral');
        progressElement.classList.add('positive');
    } else if (progress >= 40) {
        progressElement.classList.remove('positive');
        progressElement.classList.add('neutral');
    }
}

// Create discipline chart
function createDisciplineChart() {
    const ctx = document.getElementById('discipline-chart');
    if (!ctx) return;

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.01)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 31 }, (_, i) => i + 1),
            datasets: [{
                label: 'Discipline %',
                data: [
                    100, 95, 90, 85, 80, 75, 70, 65, 60, 55,
                    50, 45, 40, 35, 30, 25, 20, 15, 10, 5,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ],
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
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
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxTicksLimit: 15
                    }
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    generateHabitCalendar();
    updateStats();

    // Wait for Chart.js to load
    setTimeout(() => {
        createDisciplineChart();
    }, 100);
});
