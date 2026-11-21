// Merchant Dashboard - Overview functionality
let dashboardData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
    startAutoRefresh();
});

// Load dashboard overview data
async function loadDashboardData() {
    try {
        const data = await getMerchantDashboard();
        dashboardData = data;
        renderDashboardStats();
        renderRecentTransactions();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Render dashboard statistics
function renderDashboardStats() {
    if (!dashboardData) return;

    const stats = dashboardData.stats;
    
    // Update stat cards
    updateStatCard('monthlyRevenue', formatCurrency(stats.monthlyRevenue || 0));
    updateStatCard('monthlyTransactions', (stats.monthlyTransactions || 0).toLocaleString());
    updateStatCard('monthlyCustomers', (stats.monthlyCustomers || 0).toLocaleString());
    updateStatCard('totalCustomers', (stats.totalCustomers || 0).toLocaleString());
    updateStatCard('activePerks', stats.activePerks || 0);
    updateStatCard('upcomingEvents', stats.upcomingEvents || 0);
}

// Update a stat card value
function updateStatCard(id, value) {
    const element = document.querySelector(`[data-stat="${id}"]`);
    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Stat element not found: ${id}`);
    }
}

// Render recent transactions
function renderRecentTransactions() {
    if (!dashboardData || !dashboardData.recentTransactions) return;

    const container = document.querySelector('.recent-transactions-list');
    if (!container) return;

    const transactions = dashboardData.recentTransactions;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--muted);">
                <p>No recent transactions</p>
            </div>
        `;
        return;
    }

    container.innerHTML = transactions.map(item => {
        const transaction = item.transaction;
        const user = item.user;
        
        return `
            <div style="
                display: grid;
                grid-template-columns: auto 1fr auto auto;
                gap: 16px;
                padding: 16px;
                border-bottom: 1px solid var(--border);
                align-items: center;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                ">
                    ${user ? user.fullName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <div style="font-size: 14px; font-weight: 600; color: var(--ink);">
                        ${user ? user.fullName : 'Unknown Customer'}
                    </div>
                    <div style="font-size: 12px; color: var(--muted);">
                        ${formatRelativeTime(transaction.createdAt)}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 14px; font-weight: 600; color: var(--ink);">
                        ${formatCurrency(transaction.finalAmount)}
                    </div>
                    <div style="font-size: 12px; color: var(--success);">
                        -${formatCurrency(transaction.discountApplied)} saved
                    </div>
                </div>
                <div>
                    <span style="
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        padding: 4px 8px;
                        background: rgba(16, 185, 129, 0.1);
                        color: var(--success);
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 600;
                    ">
                        +${transaction.pointsEarned} pts
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Auto-refresh dashboard every 30 seconds
function startAutoRefresh() {
    setInterval(async () => {
        await loadDashboardData();
    }, 30000);
}
