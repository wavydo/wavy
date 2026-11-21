// Customers page functionality
let allCustomers = [];
let filteredCustomers = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadCustomers();
    setupFilters();
    setupExport();
});

// Load customers from API
async function loadCustomers() {
    try {
        const data = await getMerchantCustomers();
        allCustomers = data.customers || [];
        applyFilter(currentFilter);
        renderCustomers();
        renderStats();
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Error loading customers', 'error');
    }
}

// Apply filter
function applyFilter(filter) {
    currentFilter = filter;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
        case 'vip':
            filteredCustomers = allCustomers.filter(c => 
                c.totalSpent >= 25000 || c.visits >= 20
            );
            break;
        case 'regular':
            filteredCustomers = allCustomers.filter(c => 
                c.visits >= 3 && c.visits < 20 && c.totalSpent < 25000
            );
            break;
        case 'new':
            filteredCustomers = allCustomers.filter(c => 
                new Date(c.firstVisit) >= thirtyDaysAgo
            );
            break;
        case 'inactive':
            filteredCustomers = allCustomers.filter(c => 
                new Date(c.lastVisit) < thirtyDaysAgo
            );
            break;
        default:
            filteredCustomers = allCustomers;
    }
}

// Render stats
function renderStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const vipCount = allCustomers.filter(c => 
        c.totalSpent >= 25000 || c.visits >= 20
    ).length;

    const newThisMonth = allCustomers.filter(c => 
        new Date(c.firstVisit) >= thirtyDaysAgo
    ).length;

    const returningCount = allCustomers.filter(c => c.visits > 1).length;
    const returnRate = allCustomers.length > 0 
        ? ((returningCount / allCustomers.length) * 100).toFixed(0)
        : 0;

    const avgLifetimeValue = allCustomers.length > 0
        ? (allCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / allCustomers.length / 1000).toFixed(1)
        : 0;

    // Update stats
    const stats = document.querySelectorAll('.stat-value');
    if (stats[0]) stats[0].textContent = allCustomers.length.toLocaleString();
    if (stats[1]) stats[1].textContent = vipCount;
    if (stats[2]) stats[2].textContent = `+${newThisMonth}`;
    if (stats[3]) stats[3].textContent = `${returnRate}%`;
    if (stats[4]) stats[4].textContent = `RD$${avgLifetimeValue}K`;
}

// Render customers
function renderCustomers() {
    const tableBody = document.querySelector('.customer-table');
    if (!tableBody) return;

    // Remove existing rows (keep header)
    const existingRows = tableBody.querySelectorAll('.table-row');
    existingRows.forEach(row => row.remove());

    if (filteredCustomers.length === 0) {
        const emptyRow = document.createElement('div');
        emptyRow.style.cssText = 'padding: 40px; text-align: center; color: var(--muted);';
        emptyRow.textContent = 'No customers found';
        tableBody.appendChild(emptyRow);
        return;
    }

    // Render customers
    filteredCustomers.forEach(customerData => {
        const row = createCustomerRow(customerData);
        tableBody.appendChild(row);
    });
}

// Create customer row
function createCustomerRow(customerData) {
    const { customer, visits, totalSpent, lastVisit, firstVisit } = customerData;
    
    // Determine status badge
    let badgeClass = 'regular';
    let badgeText = 'Regular';
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    if (totalSpent >= 25000 || visits >= 20) {
        badgeClass = 'vip';
        badgeText = 'VIP';
    } else if (new Date(firstVisit) >= thirtyDaysAgo) {
        badgeClass = 'new';
        badgeText = 'New';
    } else if (new Date(lastVisit) < thirtyDaysAgo) {
        badgeClass = 'inactive';
        badgeText = 'Inactive';
    }

    // Generate avatar initials
    const initials = customer.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    // Random gradient for avatar
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    ];
    const gradient = gradients[Math.abs(customer.id.charCodeAt(0)) % gradients.length];

    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
        <div class="customer-info">
            <div class="customer-avatar" style="background: ${gradient};">${initials}</div>
            <div>
                <div class="customer-name">${customer.fullName}</div>
                <div class="customer-email">${customer.email}</div>
            </div>
        </div>
        <div><span class="badge ${badgeClass}">${badgeText}</span></div>
        <div style="font-weight: 600;">${visits}</div>
        <div style="font-weight: 600;">${formatCurrency(totalSpent)}</div>
        <div style="color: var(--muted); font-size: 13px;">${formatRelativeTime(lastVisit)}</div>
        <div><button class="action-btn" onclick="viewCustomer('${customer.id}')">View</button></div>
    `;

    return row;
}

// Setup filters
function setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active to clicked tab
            tab.classList.add('active');
            
            // Apply filter based on text
            const filterText = tab.textContent.trim().toLowerCase();
            const filterMap = {
                'all customers': 'all',
                'vip': 'vip',
                'regular': 'regular',
                'new': 'new',
                'inactive': 'inactive',
            };
            
            const filter = filterMap[filterText] || 'all';
            applyFilter(filter);
            renderCustomers();
        });
    });
}

// Setup export
function setupExport() {
    const exportBtn = document.querySelector('.header-actions .btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCustomers);
    }
}

// Export customers to CSV
function exportCustomers() {
    const csv = [
        ['Name', 'Email', 'Status', 'Visits', 'Total Spent', 'Last Visit'].join(','),
        ...filteredCustomers.map(c => [
            c.customer.fullName,
            c.customer.email,
            c.visits >= 20 ? 'VIP' : 'Regular',
            c.visits,
            c.totalSpent.toFixed(2),
            formatDate(c.lastVisit),
        ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast('Customers exported successfully');
}

// View customer details (placeholder for modal)
function viewCustomer(customerId) {
    const customer = allCustomers.find(c => c.customer.id === customerId);
    if (customer) {
        alert(`Customer Details:\n\nName: ${customer.customer.fullName}\nEmail: ${customer.customer.email}\nVisits: ${customer.visits}\nTotal Spent: ${formatCurrency(customer.totalSpent)}\nLast Visit: ${formatDate(customer.lastVisit)}`);
    }
}
