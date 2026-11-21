// Drops management functionality
let allDrops = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadDrops();
    setupLaunchButton();
    startCountdownTimers();
});

// Load drops from API
async function loadDrops() {
    try {
        const data = await getMerchantDrops();
        allDrops = data.drops || [];
        renderDrops();
    } catch (error) {
        console.error('Error loading drops:', error);
        showToast('Error loading drops', 'error');
    }
}

// Render drops
function renderDrops() {
    const dropsGrid = document.querySelector('.drops-grid');
    if (!dropsGrid) return;

    // Clear existing drops
    dropsGrid.innerHTML = '';

    if (allDrops.length === 0) {
        dropsGrid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 60px 20px; text-align: center;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; opacity: 0.3;">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <h3 style="font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 8px;">No drops created yet</h3>
                <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">Launch your first TAPP Drop to fill capacity quickly</p>
                <button onclick="openLaunchDropModal()" style="
                    padding: 12px 24px;
                    background: #0e1116;
                    color: white;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Launch Drop</button>
            </div>
        `;
        return;
    }

    // Render each drop
    allDrops.forEach(drop => {
        const dropCard = createDropCard(drop);
        dropsGrid.appendChild(dropCard);
    });
}

// Create drop card
function createDropCard(drop) {
    const now = new Date();
    const validFrom = new Date(drop.validFrom);
    const validUntil = new Date(drop.validUntil);
    
    let status = 'scheduled';
    let statusText = 'Scheduled';
    let statusColor = '#5b6472';
    
    if (drop.active && validFrom <= now && validUntil >= now) {
        status = 'active';
        statusText = 'Active';
        statusColor = '#10b981';
    } else if (!drop.active) {
        statusText = 'Inactive';
    } else if (validUntil < now) {
        status = 'completed';
        statusText = 'Completed';
    }

    const percentageClaimed = Math.round((drop.claimedSlots / drop.totalSlots) * 100);
    const remainingTime = validUntil - now;
    const timeRemaining = remainingTime > 0 ? formatTimeRemaining(remainingTime) : 'Ended';

    const card = document.createElement('div');
    card.className = `drop-card ${status}`;
    card.innerHTML = `
        <div class="drop-header">
            <span class="drop-status ${status}">
                <span class="drop-status-dot"></span>
                ${statusText}
            </span>
        </div>
        <h3 class="drop-title">${drop.title}</h3>
        <p class="drop-description">${drop.description || 'No description provided'}</p>
        
        <div class="drop-time">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
            </svg>
            <span class="drop-time-text" data-end-time="${validUntil.toISOString()}">
                ${status === 'active' ? `Ends in ${timeRemaining}` : 
                  status === 'scheduled' ? `Starts ${formatRelativeTime(validFrom)}` : 
                  'Ended'}
            </span>
        </div>

        <div class="drop-spots">
            <div class="drop-spots-label">
                <span>${status === 'completed' ? 'Final Count' : 'Spots Claimed'}</span>
                <span>${drop.claimedSlots}/${drop.totalSlots}</span>
            </div>
            <div class="drop-spots-bar">
                <div class="drop-spots-fill" style="width: ${percentageClaimed}%"></div>
            </div>
        </div>

        <div class="drop-stats">
            <div class="drop-stat">
                <span class="drop-stat-label">Views</span>
                <span class="drop-stat-value">${Math.floor(Math.random() * 2000) + 500}</span>
            </div>
            <div class="drop-stat">
                <span class="drop-stat-label">Claimed</span>
                <span class="drop-stat-value">${drop.claimedSlots}</span>
            </div>
            <div class="drop-stat">
                <span class="drop-stat-label">Rate</span>
                <span class="drop-stat-value">${(drop.claimedSlots / Math.max(1, drop.totalSlots) * 100).toFixed(1)}%</span>
            </div>
        </div>

        <div class="drop-actions">
            ${status === 'active' ? `
                <button class="drop-btn" onclick="editDrop('${drop.id}')">Edit</button>
                <button class="drop-btn" onclick="endDrop('${drop.id}')">End Early</button>
            ` : status === 'scheduled' ? `
                <button class="drop-btn drop-btn-primary" onclick="activateDrop('${drop.id}')">Launch Now</button>
                <button class="drop-btn" onclick="editDrop('${drop.id}')">Edit</button>
            ` : `
                <button class="drop-btn" onclick="viewDropReport('${drop.id}')">View Report</button>
                <button class="drop-btn" onclick="duplicateDrop('${drop.id}')">Duplicate</button>
            `}
        </div>
    `;

    return card;
}

// Format time remaining
function formatTimeRemaining(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
}

// Start countdown timers
function startCountdownTimers() {
    setInterval(() => {
        document.querySelectorAll('.drop-time-text[data-end-time]').forEach(el => {
            const endTime = new Date(el.dataset.endTime);
            const now = new Date();
            const remaining = endTime - now;
            
            if (remaining > 0) {
                el.textContent = `Ends in ${formatTimeRemaining(remaining)}`;
            } else {
                el.textContent = 'Ended';
            }
        });
    }, 60000); // Update every minute
}

// Setup launch button
function setupLaunchButton() {
    const launchBtn = document.querySelector('.btn-primary');
    if (launchBtn) {
        launchBtn.addEventListener('click', openLaunchDropModal);
    }
}

// Open launch drop modal
function openLaunchDropModal() {
    const modal = createDropModal();
    document.body.appendChild(modal);
}

// Create drop modal
function createDropModal() {
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
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 32px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        ">
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Launch TAPP Drop</h2>
            <p style="color: var(--muted); margin-bottom: 24px; font-size: 14px;">Create a time-limited offer to fill capacity quickly</p>
            
            <form id="dropForm">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Drop Title *</label>
                    <input type="text" name="title" required 
                        placeholder="e.g., Thursday Night Special"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Description</label>
                    <textarea name="description" rows="2"
                        placeholder="Describe the offer..."
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; resize: vertical;"></textarea>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Total Spots *</label>
                    <input type="number" name="totalSlots" required min="1"
                        placeholder="e.g., 30"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    <small style="color: var(--muted); font-size: 12px; margin-top: 4px; display: block;">How many spots are available?</small>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Offer Type *</label>
                    <select name="offerType" required 
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                        <option value="discount">Discount</option>
                        <option value="freebie">Free Item/Service</option>
                        <option value="special_access">Special Access</option>
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Offer Value *</label>
                    <input type="text" name="offerValue" required 
                        placeholder="e.g., 25% OFF or Free appetizer"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Valid From *</label>
                        <input type="datetime-local" name="validFrom" required
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Valid Until *</label>
                        <input type="datetime-local" name="validUntil" required
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Radius (km) *</label>
                    <input type="number" name="radiusKm" required min="1" max="50" value="5"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    <small style="color: var(--muted); font-size: 12px; margin-top: 4px; display: block;">How far should users be to see this drop?</small>
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
                    ">Launch Drop</button>
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

    // Set default times
    const form = modal.querySelector('#dropForm');
    const now = new Date();
    const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const inSixHours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    
    form.validFrom.value = inTwoHours.toISOString().slice(0, 16);
    form.validUntil.value = inSixHours.toISOString().slice(0, 16);

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const dropData = {
            title: formData.get('title'),
            description: formData.get('description') || null,
            totalSlots: parseInt(formData.get('totalSlots')),
            offerType: formData.get('offerType'),
            offerValue: formData.get('offerValue'),
            validFrom: new Date(formData.get('validFrom')).toISOString(),
            validUntil: new Date(formData.get('validUntil')).toISOString(),
            radiusKm: parseInt(formData.get('radiusKm')),
        };

        try {
            await createDrop(dropData);
            showToast('Drop launched successfully');
            modal.remove();
            await loadDrops();
        } catch (error) {
            console.error('Error creating drop:', error);
            showToast('Error launching drop', 'error');
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

// Drop action functions
async function activateDrop(dropId) {
    try {
        const drop = allDrops.find(d => d.id === dropId);
        if (!drop) return;

        await updateDrop(dropId, {
            ...drop,
            active: true,
            validFrom: new Date().toISOString(),
        });

        showToast('Drop activated successfully');
        await loadDrops();
    } catch (error) {
        console.error('Error activating drop:', error);
        showToast('Error activating drop', 'error');
    }
}

async function endDrop(dropId) {
    if (!confirm('Are you sure you want to end this drop early?')) return;

    try {
        const drop = allDrops.find(d => d.id === dropId);
        if (!drop) return;

        await updateDrop(dropId, {
            ...drop,
            active: false,
            validUntil: new Date().toISOString(),
        });

        showToast('Drop ended successfully');
        await loadDrops();
    } catch (error) {
        console.error('Error ending drop:', error);
        showToast('Error ending drop', 'error');
    }
}

function editDrop(dropId) {
    showToast('Edit drop coming soon');
}

function viewDropReport(dropId) {
    const drop = allDrops.find(d => d.id === dropId);
    if (drop) {
        const claimRate = ((drop.claimedSlots / drop.totalSlots) * 100).toFixed(1);
        alert(`Drop Report:\n\n${drop.title}\n\nTotal Spots: ${drop.totalSlots}\nClaimed: ${drop.claimedSlots}\nClaim Rate: ${claimRate}%\nOffer: ${drop.offerValue}`);
    }
}

function duplicateDrop(dropId) {
    showToast('Duplicate drop coming soon');
}
