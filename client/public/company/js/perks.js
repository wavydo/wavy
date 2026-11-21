// Perks management functionality
let baseCashbackRate = 5;
let baseDiscountRate = 10;
let pointsMultiplier = 1;
let allPerks = [];
let activePromotions = [];
let scheduledPerks = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadMerchantData();
    setupSliders();
    setupButtons();
});

// Load all merchant perks and configuration
async function loadMerchantData() {
    try {
        const data = await getMerchantPerks();
        allPerks = data.perks || [];
        
        // Separate perks by type
        categorizePerks();
        renderBaseRates();
        renderPromotions();
        renderScheduled();
    } catch (error) {
        console.error('Error loading perks:', error);
        showToast('Error loading perks data', 'error');
    }
}

// Categorize perks
function categorizePerks() {
    const now = new Date();
    
    // Base rates (permanent cashback/discount)
    const cashbackPerk = allPerks.find(p => 
        p.type === 'cashback' && p.active && !p.maxRedemptions
    );
    if (cashbackPerk) {
        baseCashbackRate = parseFloat(cashbackPerk.value);
    }

    const discountPerk = allPerks.find(p => 
        p.type === 'discount' && p.active && !p.maxRedemptions
    );
    if (discountPerk) {
        baseDiscountRate = parseFloat(discountPerk.value);
    }

    // Active promotions (time-limited offers)
    activePromotions = allPerks.filter(p => 
        p.active && 
        new Date(p.validFrom) <= now &&
        new Date(p.validUntil) >= now &&
        (p.maxRedemptions || p.title.toLowerCase().includes('hour') || p.title.toLowerCase().includes('bonus'))
    );

    // Scheduled/paused perks
    scheduledPerks = allPerks.filter(p => 
        !p.active || new Date(p.validFrom) > now
    );
}

// Render base rates section
function renderBaseRates() {
    // Update cashback value display
    const cashbackValue = document.querySelector('.perk-value');
    if (cashbackValue && cashbackValue.textContent === '5') {
        cashbackValue.textContent = baseCashbackRate;
    }

    // Update discount value display
    const discountValue = document.querySelectorAll('.perk-value')[1];
    if (discountValue && discountValue.textContent === '10') {
        discountValue.textContent = baseDiscountRate;
    }

    // Update stats from real data
    const cashbackPerk = allPerks.find(p => p.type === 'cashback');
    if (cashbackPerk) {
        updatePerkStats(0, cashbackPerk);
    }

    const discountPerk = allPerks.find(p => p.type === 'discount');
    if (discountPerk) {
        updatePerkStats(1, discountPerk);
    }
}

// Update perk stats in card
function updatePerkStats(cardIndex, perk) {
    const cards = document.querySelectorAll('[style*="border-left: 3px"]');
    if (cards[cardIndex]) {
        const stats = cards[cardIndex].querySelectorAll('.perk-stat-value');
        if (stats.length >= 3) {
            stats[0].textContent = perk.currentRedemptions || 0;
            // Revenue would come from analytics
            stats[2].textContent = '72%'; // Return rate placeholder
        }
    }
}

// Setup sliders
function setupSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach((slider, index) => {
        const valueDisplay = slider.nextElementSibling;
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            valueDisplay.textContent = `${value}%`;
            
            if (index === 0) {
                baseCashbackRate = parseInt(value);
            } else if (index === 1) {
                baseDiscountRate = parseInt(value);
            }
        });
    });
}

// Setup buttons
function setupButtons() {
    // Update Rate buttons
    const updateButtons = document.querySelectorAll('.perk-btn-primary');
    updateButtons.forEach((btn, index) => {
        if (btn.textContent.includes('Update')) {
            btn.addEventListener('click', () => updateBaseRate(index));
        }
    });

    // Create New Perk button
    const createBtn = document.querySelector('.btn-primary');
    if (createBtn && createBtn.textContent.includes('Create')) {
        createBtn.addEventListener('click', openCreatePerkModal);
    }

    // New Promotion button
    const newPromoBtn = document.querySelectorAll('.btn')[1];
    if (newPromoBtn) {
        newPromoBtn.addEventListener('click', openCreatePromotionModal);
    }
}

// Update base rate
async function updateBaseRate(rateType) {
    try {
        let perkData;
        let perkId;
        
        if (rateType === 0) {
            // Update cashback
            const existingPerk = allPerks.find(p => p.type === 'cashback' && !p.maxRedemptions);
            perkData = {
                title: 'Standard Cashback Rate',
                description: `All TAPP members earn ${baseCashbackRate}% cashback on every purchase`,
                type: 'cashback',
                value: baseCashbackRate.toString(),
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                active: true,
            };
            
            if (existingPerk) {
                perkId = existingPerk.id;
                await updatePerk(perkId, perkData);
            } else {
                await createPerk(perkData);
            }
        } else if (rateType === 1) {
            // Update discount
            const existingPerk = allPerks.find(p => p.type === 'discount' && !p.maxRedemptions);
            perkData = {
                title: 'Member Discount',
                description: `TAPP members get ${baseDiscountRate}% off their total bill`,
                type: 'discount',
                value: baseDiscountRate.toString(),
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                active: true,
            };
            
            if (existingPerk) {
                perkId = existingPerk.id;
                await updatePerk(perkId, perkData);
            } else {
                await createPerk(perkData);
            }
        }
        
        showToast('Rate updated successfully');
        await loadMerchantData();
    } catch (error) {
        console.error('Error updating rate:', error);
        showToast('Error updating rate', 'error');
    }
}

// Open create perk modal
function openCreatePerkModal() {
    const modal = createPerkModal();
    document.body.appendChild(modal);
}

// Open create promotion modal
function openCreatePromotionModal() {
    const modal = createPromotionModal();
    document.body.appendChild(modal);
}

// Create perk modal
function createPerkModal() {
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
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Create New Perk</h2>
            <p style="color: var(--muted); margin-bottom: 24px; font-size: 14px;">Define a new reward or benefit for your customers</p>
            
            <form id="perkForm">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ink);">Title *</label>
                    <input type="text" name="title" required 
                        placeholder="e.g., 20% OFF All Items"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ink);">Type *</label>
                    <select name="type" required 
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                        <option value="discount">Discount (%)</option>
                        <option value="cashback">Cashback (%)</option>
                        <option value="points">TAPP Points</option>
                        <option value="freebie">Free Item/Service</option>
                    </select>
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ink);">Value *</label>
                    <input type="number" name="value" required min="0" step="0.01"
                        placeholder="e.g., 20 for 20% or 500 for 500 points"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ink);">Description</label>
                    <textarea name="description" rows="3"
                        placeholder="Describe the perk and any conditions..."
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; resize: vertical;"></textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ink);">Valid From *</label>
                        <input type="datetime-local" name="validFrom" required
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ink);">Valid Until *</label>
                        <input type="datetime-local" name="validUntil" required
                            style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
                    </div>
                </div>

                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--ink);">Max Redemptions</label>
                    <input type="number" name="maxRedemptions" min="1"
                        placeholder="Leave empty for unlimited"
                        style="width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px;">
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
                        transition: all 180ms ease;
                    ">Create Perk</button>
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
                        transition: all 180ms ease;
                    ">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Set default dates
    const form = modal.querySelector('#perkForm');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    form.validFrom.value = tomorrow.toISOString().slice(0, 16);
    form.validUntil.value = nextWeek.toISOString().slice(0, 16);

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const perkData = {
            title: formData.get('title'),
            type: formData.get('type'),
            value: formData.get('value'),
            description: formData.get('description') || null,
            validFrom: new Date(formData.get('validFrom')).toISOString(),
            validUntil: new Date(formData.get('validUntil')).toISOString(),
            maxRedemptions: formData.get('maxRedemptions') ? parseInt(formData.get('maxRedemptions')) : null,
        };

        try {
            await createPerk(perkData);
            showToast('Perk created successfully');
            modal.remove();
            await loadMerchantData();
        } catch (error) {
            console.error('Error creating perk:', error);
            showToast('Error creating perk', 'error');
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

// Create promotion modal (simplified version)
function createPromotionModal() {
    const modal = createPerkModal(); // Reuse the same modal
    const title = modal.querySelector('h2');
    title.textContent = 'Create New Promotion';
    
    return modal;
}

// Toggle perk active status
async function togglePerk(perkId, currentStatus) {
    try {
        const perk = allPerks.find(p => p.id === perkId);
        if (!perk) return;

        await updatePerk(perkId, {
            ...perk,
            active: !currentStatus,
        });

        showToast(`Perk ${!currentStatus ? 'activated' : 'paused'}`);
        await loadMerchantData();
    } catch (error) {
        console.error('Error toggling perk:', error);
        showToast('Error updating perk', 'error');
    }
}

// Delete perk
async function deletePerkById(perkId) {
    if (!confirm('Are you sure you want to delete this perk?')) return;

    try {
        await deletePerk(perkId);
        showToast('Perk deleted successfully');
        await loadMerchantData();
    } catch (error) {
        console.error('Error deleting perk:', error);
        showToast('Error deleting perk', 'error');
    }
}

// Render promotions section
function renderPromotions() {
    // This would update the Active Promotions section with real data
    // For now, the static HTML will show examples
}

// Render scheduled section
function renderScheduled() {
    // This would update the Scheduled & Paused section with real data
}
