// User Dashboard - Events functionality
let allEvents = [];
let filteredEvents = [];
let currentCategory = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadEvents();
    setupFilters();
});

// Load all events
async function loadEvents() {
    try {
        const data = await getEvents();
        allEvents = data.events || [];
        filterEvents(currentCategory);
        renderEvents();
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Error loading events', 'error');
    }
}

// Filter events by category
function filterEvents(category) {
    currentCategory = category;
    
    if (category === 'all') {
        filteredEvents = allEvents;
    } else {
        filteredEvents = allEvents.filter(e => 
            e.event.category === category
        );
    }
}

// Render events to the page
function renderEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;

    if (filteredEvents.length === 0) {
        eventsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <p style="font-size: 18px; color: var(--muted);">No events found</p>
                <p style="font-size: 14px; color: var(--text-grey); margin-top: 8px;">Check back soon for upcoming experiences</p>
            </div>
        `;
        return;
    }

    eventsGrid.innerHTML = filteredEvents.map(item => {
        const event = item.event;
        const establishment = item.establishment;
        const eventDate = new Date(event.date);
        
        return `
            <div class="event-card" onclick="viewEventDetails('${event.id}')">
                <div class="event-image">
                    <img src="${event.coverImage || event.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop'}" alt="${event.title}">
                    <div class="event-badge${event.price == '0' ? ' free' : ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${event.price == '0' ? 'Free' : formatCurrency(event.price)}
                    </div>
                </div>
                <div class="event-content">
                    <div class="event-date-section">
                        <div class="event-date-box">
                            <div class="event-date-content">
                                <div class="event-day">${eventDate.getDate()}</div>
                                <div class="event-month">${eventDate.toLocaleString('en', { month: 'short' })}</div>
                            </div>
                        </div>
                        <div class="event-time-info">
                            <div class="event-time">${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}</div>
                            <div class="event-location">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                ${event.venue}
                            </div>
                        </div>
                    </div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-description">${event.description || ''}</p>
                    ${establishment ? `
                        <p style="font-size: 13px; color: var(--muted); margin-top: 8px;">
                            Hosted by <strong>${establishment.businessName}</strong>
                        </p>
                    ` : ''}
                    <div class="event-footer">
                        <div class="event-attendees">
                            <div class="attendees-count">
                                ${event.currentAttendees} attending${event.capacity ? ` / ${event.capacity} max` : ''}
                            </div>
                        </div>
                        <button class="event-button">
                            Get Tickets
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View event details
async function viewEventDetails(eventId) {
    try {
        const data = await getEventDetails(eventId);
        openEventModal(data.event);
    } catch (error) {
        console.error('Error loading event details:', error);
        showToast('Error loading event details', 'error');
    }
}

// Open event modal with details
function openEventModal(eventData) {
    const event = eventData.event;
    const establishment = eventData.establishment;
    const eventDate = new Date(event.date);
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        overflow-y: auto;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 24px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        ">
            <div style="position: relative; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 24px 24px 0 0; overflow: hidden;">
                ${event.coverImage || event.image ? `<img src="${event.coverImage || event.image}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
                <button onclick="this.closest('[style*=fixed]').remove()" style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div style="padding: 32px;">
                <h2 style="font-size: 28px; font-weight: 700; color: var(--ink); margin-bottom: 16px;">${event.title}</h2>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div style="padding: 16px; background: rgba(14, 17, 22, 0.04); border-radius: 12px;">
                        <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Date & Time</div>
                        <div style="font-size: 15px; font-weight: 600; color: var(--ink);">${eventDate.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <div style="font-size: 14px; color: var(--muted);">${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}</div>
                    </div>
                    <div style="padding: 16px; background: rgba(14, 17, 22, 0.04); border-radius: 12px;">
                        <div style="font-size: 11px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Location</div>
                        <div style="font-size: 15px; font-weight: 600; color: var(--ink);">${event.venue}</div>
                        <div style="font-size: 14px; color: var(--muted);">${event.address}</div>
                    </div>
                </div>

                <p style="font-size: 15px; line-height: 1.7; color: var(--ink); margin-bottom: 24px;">${event.description || ''}</p>

                ${establishment ? `
                    <div style="padding: 20px; background: rgba(14, 17, 22, 0.04); border-radius: 12px; margin-bottom: 24px;">
                        <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px;">Hosted by</div>
                        <div style="font-size: 18px; font-weight: 600; color: var(--ink);">${establishment.businessName}</div>
                    </div>
                ` : ''}

                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid var(--border);">
                    <div>
                        <div style="font-size: 14px; color: var(--muted); margin-bottom: 4px;">Price</div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--ink);">${event.price == '0' ? 'Free' : formatCurrency(event.price)}</div>
                    </div>
                    <button onclick="purchaseTicket('${event.id}')" style="
                        padding: 16px 32px;
                        background: var(--ink);
                        color: white;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        border: none;
                        transition: all 180ms ease;
                    ">Get Tickets</button>
                </div>
            </div>
        </div>
    `;

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Purchase event ticket
async function purchaseTicket(eventId) {
    try {
        const result = await purchaseEventTicket(eventId);
        showToast('Ticket purchased successfully!');
        
        // Close any open modals
        document.querySelectorAll('[style*="position: fixed"]').forEach(m => m.remove());
        
        // Reload events
        await loadEvents();
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        showToast(error.message || 'Error purchasing ticket', 'error');
    }
}

// Setup category filters
function setupFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active from all
            filterChips.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            chip.classList.add('active');
            
            // Get category from chip text
            const category = chip.textContent.toLowerCase().trim()
                .replace(/\s+/g, '_');
            
            // Filter and render
            filterEvents(category === 'all_events' ? 'all' : category);
            renderEvents();
        });
    });
}
