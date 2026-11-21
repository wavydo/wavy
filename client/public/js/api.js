// API utility functions for TAPP dashboards
const API_BASE = '';

// Generic API call handler
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Important for session cookies
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// USER API (Customer Dashboard)
// ============================================

// Get all events
async function getEvents() {
    return apiCall('/api/events');
}

// Get event details
async function getEventDetails(eventId) {
    return apiCall(`/api/events/${eventId}`);
}

// Purchase event ticket
async function purchaseEventTicket(eventId) {
    return apiCall(`/api/events/${eventId}/purchase`, {
        method: 'POST',
    });
}

// Get establishments (Explore)
async function getEstablishments(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiCall(`/api/explore/establishments?${params}`);
}

// Get establishment details
async function getEstablishmentDetails(establishmentId) {
    return apiCall(`/api/explore/establishments/${establishmentId}`);
}

// Get perks
async function getPerks() {
    return apiCall('/api/perks');
}

// Redeem perk
async function redeemPerk(perkId) {
    return apiCall(`/api/perks/${perkId}/redeem`, {
        method: 'POST',
    });
}

// Get drops
async function getDrops() {
    return apiCall('/api/drops');
}

// Claim drop
async function claimDrop(dropId) {
    return apiCall(`/api/drops/${dropId}/claim`, {
        method: 'POST',
    });
}

// Toggle favorite
async function toggleFavorite(establishmentId) {
    return apiCall(`/api/explore/establishments/${establishmentId}/favorite`, {
        method: 'POST',
    });
}

// Get my favorites
async function getMyFavorites() {
    return apiCall('/api/explore/my-favorites');
}

// Submit review
async function submitReview(data) {
    return apiCall('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Get establishment reviews
async function getEstablishmentReviews(establishmentId) {
    return apiCall(`/api/reviews/establishment/${establishmentId}`);
}

// ============================================
// MERCHANT API (Business Dashboard)
// ============================================

// Get merchant dashboard overview
async function getMerchantDashboard() {
    return apiCall('/api/merchant/dashboard');
}

// PERKS MANAGEMENT
async function getMerchantPerks() {
    return apiCall('/api/merchant/perks');
}

async function createPerk(perkData) {
    return apiCall('/api/merchant/perks', {
        method: 'POST',
        body: JSON.stringify(perkData),
    });
}

async function updatePerk(perkId, perkData) {
    return apiCall(`/api/merchant/perks/${perkId}`, {
        method: 'PUT',
        body: JSON.stringify(perkData),
    });
}

async function deletePerk(perkId) {
    return apiCall(`/api/merchant/perks/${perkId}`, {
        method: 'DELETE',
    });
}

// EVENTS MANAGEMENT
async function getMerchantEvents() {
    return apiCall('/api/merchant/events');
}

async function createEvent(eventData) {
    return apiCall('/api/merchant/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
    });
}

async function updateEvent(eventId, eventData) {
    return apiCall(`/api/merchant/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
    });
}

// DROPS MANAGEMENT
async function getMerchantDrops() {
    return apiCall('/api/merchant/drops');
}

async function createDrop(dropData) {
    return apiCall('/api/merchant/drops', {
        method: 'POST',
        body: JSON.stringify(dropData),
    });
}

async function updateDrop(dropId, dropData) {
    return apiCall(`/api/merchant/drops/${dropId}`, {
        method: 'PUT',
        body: JSON.stringify(dropData),
    });
}

// ANALYTICS
async function getMerchantAnalytics(period = '30') {
    return apiCall(`/api/merchant/analytics?period=${period}`);
}

// CUSTOMERS
async function getMerchantCustomers() {
    return apiCall('/api/merchant/customers');
}

// REVIEWS
async function getMerchantReviews() {
    return apiCall('/api/merchant/reviews');
}

async function respondToReview(reviewId, response) {
    return apiCall(`/api/merchant/reviews/${reviewId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
    });
}

// PROFILE
async function updateMerchantProfile(profileData) {
    return apiCall('/api/merchant/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Format currency
function formatCurrency(amount) {
    return `RD$${parseFloat(amount).toLocaleString('es-DO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// Format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return formatDate(dateString);
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0e1116'};
        color: #ffffff;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
