// Events management functionality
let allEvents = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadEvents();
    setupFilters();
    setupCreateButton();
});

// Load events from API
async function loadEvents() {
    try {
        const data = await getMerchantEvents();
        allEvents = data.events || [];
        applyFilter(currentFilter);
        renderEvents();
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Error loading events', 'error');
    }
}

// Apply filter
function applyFilter(filter) {
    currentFilter = filter;
    const now = new Date();

    switch (filter) {
        case 'upcoming':
            allEvents = allEvents.filter(e => 
                new Date(e.date) > now && e.status === 'upcoming'
            );
            break;
        case 'live':
            allEvents = allEvents.filter(e => {
                const eventDate = new Date(e.date);
                const eventEndTime = new Date(eventDate);
                eventEndTime.setHours(23, 59, 59); // End of day
                return eventDate <= now && eventEndTime >= now;
            });
            break;
        case 'past':
            allEvents = allEvents.filter(e => 
                new Date(e.date) < now || e.status === 'completed'
            );
            break;
        case 'draft':
            allEvents = allEvents.filter(e => e.status === 'draft');
            break;
        default:
            // All events
            break;
    }
}

// Render events
function renderEvents() {
    const eventsList = document.querySelector('.events-list');
    if (!eventsList) return;

    // Clear existing events
    eventsList.innerHTML = '';

    if (allEvents.length === 0) {
        eventsList.innerHTML = `
            <div style="padding: 60px 20px; text-align: center;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; opacity: 0.3;">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3 style="font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px;">No events found</h3>
                <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">Create your first event to start attracting customers</p>
                <button onclick="openCreateEventModal()" style="
                    padding: 12px 24px;
                    background: #0e1116;
                    color: white;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Create Event</button>
            </div>
        `;
        return;
    }

    // Render each event
    allEvents.forEach(event => {
        const eventCard = createEventCard(event);
        eventsList.appendChild(eventCard);
    });
}

// Create event card
function createEventCard(event) {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    // Determine status
    let statusClass = 'upcoming';
    let statusText = 'Upcoming';
    
    if (event.status === 'completed' || eventDate < now) {
        statusClass = 'past';
        statusText = 'Past';
    } else if (eventDate.toDateString() === now.toDateString()) {
        statusClass = 'live';
        statusText = 'Live Now';
    }

    const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
    const day = eventDate.getDate();

    const attendees = event.currentAttendees || 0;
    const capacity = event.capacity || 0;
    const revenue = attendees * parseFloat(event.price || 0);

    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
        <div class="event-content">
            <div class="event-date">
                <span class="event-month">${month}</span>
                <span class="event-day">${day}</span>
            </div>
            <div class="event-details">
                <div class="event-header-row">
                    <span class="event-status ${statusClass}">
                        ${statusText}
                    </span>
                    <h3 class="event-title">${event.title}</h3>
                </div>
                <p class="event-description">
                    ${event.description || 'No description provided'}
                </p>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        <span>${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}</span>
                    </div>
                    <div class="event-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                            <path d="M12 2v20M2 12h20"/>
                        </svg>
                        <span>${formatCurrency(event.price)}/person</span>
                    </div>
                </div>
            </div>
            <div class="event-stats">
                <div class="event-stat">
                    <span class="event-stat-label">${statusClass === 'past' ? 'Attended' : 'Tickets Sold'}</span>
                    <span class="event-stat-value">${capacity ? `${attendees}/${capacity}` : attendees}</span>
                </div>
                <div class="event-stat">
                    <span class="event-stat-label">Revenue</span>
                    <span class="event-stat-value">${formatCurrency(revenue)}</span>
                </div>
            </div>
        </div>
        <div class="event-actions">
            ${statusClass === 'past' 
                ? `
                    <button class="event-btn" onclick="viewEventReport('${event.id}')">View Report</button>
                    <button class="event-btn" onclick="viewEventFeedback('${event.id}')">Customer Feedback</button>
                    <button class="event-btn" onclick="duplicateEvent('${event.id}')">Duplicate Event</button>
                `
                : `
                    <button class="event-btn" onclick="viewEventDetails('${event.id}')">View Details</button>
                    <button class="event-btn" onclick="manageTickets('${event.id}')">Manage Tickets</button>
                    <button class="event-btn" onclick="editEvent('${event.id}')">Edit</button>
                `
            }
        </div>
    `;

    return card;
}

// Setup filters
function setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filterText = tab.textContent.trim().toLowerCase();
            const filterMap = {
                'all events': 'all',
                'upcoming': 'upcoming',
                'live': 'live',
                'past': 'past',
                'draft': 'draft',
            };
            
            currentFilter = filterMap[filterText] || 'all';
            await loadEvents(); // Reload to apply filter
        });
    });
}

// Setup create button
function setupCreateButton() {
    const createBtn = document.querySelector('.btn-primary');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateEventModal);
    }
}

// Open create event modal
function openCreateEventModal() {
    const modal = createEventModal();
    document.body.appendChild(modal);
}

// Create event modal
function createEventModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
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
            border-radius: 20px;
            padding: 32px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            margin: 20px;
        ">
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Create New Event</h2>
            <p style="color: var(--muted); margin-bottom: 24px; font-size: 14px;">Host an experience for your TAPP members</p>
            
            <form id="eventForm">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Event Title *</label>
                    <input type="text" name="title" required 
                        placeholder="e.g., Wine Tasting Night"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Category *</label>
                    <select name="category" required 
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                        <option value="wine_tasting">Wine Tasting</option>
                        <option value="concert">Concert</option>
                        <option value="jazz">Jazz Night</option>
                        <option value="party">Party</option>
                        <option value="networking">Networking</option>
                        <option value="dining">Special Dining</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Description</label>
                    <textarea name="description" rows="3"
                        placeholder="Describe your event..."
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; resize: vertical;"></textarea>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Venue Name *</label>
                    <input type="text" name="venue" required 
                        placeholder="e.g., La Parrillada Main Hall"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Address *</label>
                    <input type="text" name="address" required 
                        placeholder="Full address"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">City *</label>
                    <input type="text" name="city" required value="Santo Domingo"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Date *</label>
                        <input type="date" name="date" required
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Capacity</label>
                        <input type="number" name="capacity" min="1" placeholder="Max attendees"
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Start Time *</label>
                        <input type="time" name="startTime" required
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">End Time</label>
                        <input type="time" name="endTime"
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Ticket Price (RD$) *</label>
                    <input type="number" name="price" required min="0" step="0.01"
                        placeholder="0.00"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 24px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="isPerkIncluded" style="width: 18px; height: 18px;">
                        <span style="font-size: 14px; font-weight: 500;">Include special perk for attendees</span>
                    </label>
                    <input type="text" name="perkDetails" placeholder="Describe the perk (e.g., Free drink, 2X points)"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; margin-top: 8px;">
                </div>

                <div style="display: flex; gap: 12px;">
                    <button type="submit" style="
                        flex: 1;
                        padding: 14px 24px;
                        background: #0e1116;
                        color: white;
                        border-radius: 12px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Create Event</button>
                    <button type="button" onclick="this.closest('[style*=fixed]').remove()" style="
                        flex: 1;
                        padding: 14px 24px;
                        background: transparent;
                        color: var(--ink);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Set minimum date to tomorrow
    const form = modal.querySelector('#eventForm');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    form.date.value = tomorrow.toISOString().split('T')[0];
    form.startTime.value = '19:00';

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Combine date and time
        const eventDate = new Date(formData.get('date'));
        
        const eventData = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description') || null,
            venue: formData.get('venue'),
            address: formData.get('address'),
            city: formData.get('city'),
            date: eventDate.toISOString(),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime') || null,
            price: formData.get('price'),
            capacity: formData.get('capacity') ? parseInt(formData.get('capacity')) : null,
            isPerkIncluded: formData.get('isPerkIncluded') === 'on',
            perkDetails: formData.get('perkDetails') || null,
        };

        try {
            await createEvent(eventData);
            showToast('Event created successfully');
            modal.remove();
            await loadEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            showToast('Error creating event', 'error');
        }
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    return modal;
}

// Event action functions
function viewEventDetails(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (event) {
        alert(`Event Details:\n\n${event.title}\n${event.venue}\n${formatDate(event.date)} at ${event.startTime}\nAttendees: ${event.currentAttendees}/${event.capacity || '∞'}\nRevenue: ${formatCurrency(event.currentAttendees * parseFloat(event.price))}`);
    }
}

function manageTickets(eventId) {
    showToast('Ticket management coming soon');
}

function editEvent(eventId) {
    showToast('Edit event coming soon');
}

function viewEventReport(eventId) {
    showToast('Event report coming soon');
}

function viewEventFeedback(eventId) {
    showToast('Customer feedback coming soon');
}

function duplicateEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (event) {
        // Open create modal with pre-filled data
        showToast('Duplicate feature coming soon');
    }
}
