// Merchant Analytics functionality
let analyticsData = null;
let currentPeriod = '30';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadAnalytics(currentPeriod);
    setupPeriodFilters();
});

// Load analytics data
async function loadAnalytics(period = '30') {
    try {
        const data = await getMerchantAnalytics(period);
        analyticsData = data;
        currentPeriod = period;
        renderAnalytics();
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Error loading analytics', 'error');
    }
}

// Render all analytics sections
function renderAnalytics() {
    if (!analyticsData) return;

    renderMetrics();
    renderTopCustomers();
    renderRecentTransactions();
}

// Render key metrics
function renderMetrics() {
    const metrics = analyticsData.metrics;
    
    updateMetricCard('totalRevenue', formatCurrency(metrics.totalRevenue));
    updateMetricCard('totalDiscounts', formatCurrency(metrics.totalDiscounts));
    updateMetricCard('totalTransactions', metrics.totalTransactions.toLocaleString());
    updateMetricCard('avgTransactionValue', formatCurrency(metrics.avgTransactionValue));
    updateMetricCard('newCustomers', metrics.newCustomers.toLocaleString());
    updateMetricCard('returningCustomers', metrics.returningCustomers.toLocaleString());
    updateMetricCard('retentionRate', metrics.retentionRate + '%');
}

// Update metric card
function updateMetricCard(id, value) {
    const element = document.querySelector(`[data-metric="${id}"]`);
    if (element) {
        element.textContent = value;
    }
}

// Render top customers
function renderTopCustomers() {
    const container = document.querySelector('.top-customers-list');
    if (!container || !analyticsData.topCustomers) return;

    const topCustomers = analyticsData.topCustomers;

    if (topCustomers.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--muted);">
                <p>No customer data available</p>
            </div>
        `;
        return;
    }

    container.innerHTML = topCustomers.map((item, index) => {
        const customer = item.customer;
        
        return `
            <div style="
                display: grid;
                grid-template-columns: auto auto 1fr auto;
                gap: 16px;
                padding: 16px;
                border-bottom: 1px solid var(--border);
                align-items: center;
            ">
                <div style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7f32' : 'var(--border)'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                ">
                    ${index + 1}
                </div>
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
                    ${customer ? customer.fullName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <div style="font-size: 14px; font-weight: 600; color: var(--ink);">
                        ${customer ? customer.fullName : 'Unknown Customer'}
                    </div>
                    <div style="font-size: 12px; color: var(--muted);">
                        ${item.visits} visits
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 16px; font-weight: 700; color: var(--ink);">
                        ${formatCurrency(0)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render recent transactions
function renderRecentTransactions() {
    const container = document.querySelector('.analytics-transactions-list');
    if (!container || !analyticsData.recentTransactions) return;

    const transactions = analyticsData.recentTransactions;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--muted);">
                <p>No transactions in this period</p>
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
                        ${formatDate(transaction.createdAt)} • ${formatTime(transaction.createdAt)}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 14px; font-weight: 600; color: var(--ink);">
                        ${formatCurrency(transaction.finalAmount)}
                    </div>
                    <div style="font-size: 12px; color: var(--success);">
                        -${formatCurrency(transaction.discountApplied)}
                    </div>
                </div>
                <div>
                    <span style="
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

// Setup period filters
function setupPeriodFilters() {
    const filters = document.querySelectorAll('[data-period]');
    
    filters.forEach(filter => {
        filter.addEventListener('click', async function() {
            // Remove active from all
            filters.forEach(f => f.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            
            // Load analytics for selected period
            const period = this.getAttribute('data-period');
            await loadAnalytics(period);
        });
    });
}
