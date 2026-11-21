// User Dashboard - Explore functionality
let allEstablishments = [];
let filteredEstablishments = {};
let searchQuery = '';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadEstablishments();
    setupSearch();
});

// Load all establishments
async function loadEstablishments(filters = {}) {
    try {
        const data = await getEstablishments(filters);
        allEstablishments = data.establishments || [];
        categorizeEstablishments();
        renderAllCategories();
    } catch (error) {
        console.error('Error loading establishments:', error);
        showToast('Error loading establishments', 'error');
    }
}

// Categorize establishments by category
function categorizeEstablishments() {
    filteredEstablishments = {
        featured: allEstablishments.filter(e => e.totalRevenue > 50000).slice(0, 6),
        restaurants: allEstablishments.filter(e => e.category === 'restaurante'),
        cafes: allEstablishments.filter(e => e.category === 'cafeteria'),
        shops: allEstablishments.filter(e => e.category === 'supermercado' || e.category === 'colmado'),
        services: allEstablishments.filter(e => ['barberia', 'gym', 'farmacia'].includes(e.category)),
    };
}

// Render all categories
function renderAllCategories() {
    renderCategory('Featured', filteredEstablishments.featured, '.category-scroll');
}

// Render a specific category
function renderCategory(categoryName, establishments, containerSelector) {
    const containers = document.querySelectorAll(containerSelector);
    if (containers.length === 0) return;

    const container = containers[0];
    
    if (establishments.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--muted);">
                <p>No merchants found in this category</p>
            </div>
        `;
        return;
    }

    container.innerHTML = establishments.map(establishment => `
        <div class="merchant-card" onclick="viewEstablishmentDetails('${establishment.id}')">
            <div class="merchant-image">
                <img src="${establishment.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'}" alt="${establishment.businessName}">
                <div class="merchant-badge${establishment.totalRevenue > 50000 ? ' featured' : ''}">${establishment.totalRevenue > 50000 ? 'Featured' : getCategoryLabel(establishment.category)}</div>
            </div>
            <div class="merchant-content">
                <div class="merchant-header">
                    <div class="merchant-info">
                        <h3>${establishment.businessName}</h3>
                        <p class="merchant-category">${getCategoryLabel(establishment.category)}</p>
                    </div>
                    <div class="merchant-rating">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span class="rating-value">4.8</span>
                    </div>
                </div>
                <div class="merchant-perks">
                    <span class="perk-pill">${establishment.discountPercentage}% discount</span>
                    <span class="perk-pill">TAPP Points</span>
                </div>
                <div class="merchant-footer">
                    <div class="merchant-distance">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${establishment.city}
                    </div>
                    <button class="visit-btn">Visit</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get category label in Spanish
function getCategoryLabel(category) {
    const labels = {
        'restaurante': 'Restaurante',
        'cafeteria': 'Cafetería',
        'colmado': 'Colmado',
        'supermercado': 'Supermercado',
        'farmacia': 'Farmacia',
        'barberia': 'Barbería',
        'gym': 'Gimnasio',
        'otro': 'Comercio'
    };
    return labels[category] || 'Comercio';
}

// View establishment details
async function viewEstablishmentDetails(establishmentId) {
    try {
        const data = await getEstablishmentDetails(establishmentId);
        openEstablishmentModal(data);
    } catch (error) {
        console.error('Error loading establishment details:', error);
        showToast('Error loading establishment details', 'error');
    }
}

// Open establishment modal - TAPP True Design System
function openEstablishmentModal(data) {
    const establishment = data.establishment;
    const perks = data.perks || [];
    const events = data.events || [];
    
    const modal = document.createElement('div');
    modal.className = 'establishment-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(8, 8, 8, 0.95);
        backdrop-filter: blur(20px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        overflow-y: auto;
        animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    modal.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
            
            @font-face {
                font-family: 'Antipasto Pro';
                src: url('/antipasto/Antipasto-Pro-Regular-trial.ttf') format('truetype');
                font-weight: 200;
                font-style: normal;
            }
            
            @font-face {
                font-family: 'Antipasto Pro';
                src: url('/antipasto/Antipasto-Pro-ExtraLight-trial.ttf') format('truetype');
                font-weight: 100;
                font-style: normal;
            }
            
            @font-face {
                font-family: 'Antipasto Pro';
                src: url('/antipasto/Antipasto-Pro-ExtraBold-trial.ttf') format('truetype');
                font-weight: 800;
                font-style: normal;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: scale(0.96) translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            .establishment-modal-box {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
            }
            .establishment-modal-box::-webkit-scrollbar {
                width: 6px;
            }
            .establishment-modal-box::-webkit-scrollbar-track {
                background: transparent;
            }
            .establishment-modal-box::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
            }
            .establishment-modal-box::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.15);
            }
            .perk-item:hover {
                border-color: rgba(255, 255, 255, 0.15) !important;
                background: rgba(255, 255, 255, 0.03) !important;
            }
            .action-button:hover {
                background: rgba(255, 255, 255, 0.12) !important;
                transform: translateY(-1px);
            }
            .redeem-button:hover {
                background: rgba(255, 255, 255, 1) !important;
                transform: translateY(-1px);
            }
        </style>
        
        <div class="establishment-modal-box" style="
            background: rgba(18, 18, 18, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            max-width: 800px;
            width: 100%;
            max-height: 88vh;
            overflow-y: auto;
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        ">
            <!-- Close Button -->
            <button onclick="this.closest('.establishment-modal-overlay').remove()" style="
                position: fixed;
                top: 32px;
                right: 32px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(18, 18, 18, 0.9);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                cursor: url('/hand.png'), pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                z-index: 10001;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(255,255,255,0.2)'" 
               onmouseout="this.style.background='rgba(18,18,18,0.9)'; this.style.borderColor='rgba(255,255,255,0.1)'">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2L14 14M14 2L2 14" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>

            <!-- Hero Image Section -->
            <div style="position: relative; height: 320px; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); overflow: hidden; border-radius: 24px 24px 0 0;">
                ${establishment.logo ? `
                    <img src="${establishment.logo}" 
                         style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" 
                         alt="${establishment.businessName}">
                ` : `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <svg width="100" height="100" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.15">
                            <circle cx="16" cy="16" r="3" fill="white" />
                            <path d="M16 9C12.134 9 9 12.134 9 16C9 19.866 12.134 23 16 23" 
                                stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
                            <path d="M16 5C9.925 5 5 9.925 5 16C5 22.075 9.925 27 16 27" 
                                stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
                        </svg>
                    </div>
                `}
                <!-- Gradient Overlay -->
                <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(8,8,8,0.3) 60%, rgba(18,18,18,1) 100%);"></div>
                
                <!-- Category Badge -->
                <div style="position: absolute; top: 24px; left: 24px;">
                    <div style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: rgba(8, 8, 8, 0.8); backdrop-filter: blur(20px); border-radius: 100px; border: 1px solid rgba(255, 255, 255, 0.08);">
                        <span style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.7); text-transform: uppercase; letter-spacing: 0.1em;">${getCategoryLabel(establishment.category)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 48px 48px;">
                <!-- Business Name -->
                <h1 style="
                    font-family: 'Antipasto Pro', sans-serif; 
                    font-size: 48px; 
                    font-weight: 200; 
                    color: #ffffff; 
                    letter-spacing: 0.03em;
                    margin-bottom: 12px;
                    line-height: 1.1;
                ">${establishment.businessName}</h1>
                
                <!-- Description -->
                ${establishment.description ? `
                    <p style="
                        font-family: 'Inter', sans-serif; 
                        font-size: 16px; 
                        font-weight: 300; 
                        line-height: 1.7; 
                        color: rgba(255, 255, 255, 0.5); 
                        margin-bottom: 40px;
                        letter-spacing: 0.01em;
                    ">${establishment.description}</p>
                ` : `
                    <p style="
                        font-family: 'Inter', sans-serif; 
                        font-size: 16px; 
                        font-weight: 300; 
                        line-height: 1.7; 
                        color: rgba(255, 255, 255, 0.5); 
                        margin-bottom: 40px;
                        letter-spacing: 0.01em;
                    ">Disfruta de beneficios exclusivos con tu tarjeta TAPP.</p>
                `}

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px;">
                    <div style="padding: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; text-align: center;">
                        <div style="font-family: 'Antipasto Pro', sans-serif; font-size: 36px; font-weight: 200; color: #ffffff; line-height: 1; margin-bottom: 8px; letter-spacing: 0.02em;">${establishment.discountPercentage}%</div>
                        <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Descuento</div>
                    </div>
                    <div style="padding: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; text-align: center;">
                        <div style="font-family: 'Antipasto Pro', sans-serif; font-size: 36px; font-weight: 200; color: #ffffff; line-height: 1; margin-bottom: 8px; letter-spacing: 0.02em;">5%</div>
                        <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Cashback</div>
                    </div>
                    <div style="padding: 24px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; text-align: center;">
                        <div style="font-family: 'Antipasto Pro', sans-serif; font-size: 36px; font-weight: 200; color: #ffffff; line-height: 1; margin-bottom: 8px; letter-spacing: 0.02em;">2X</div>
                        <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">Puntos</div>
                    </div>
                </div>

                <!-- Perks Section -->
                ${perks.length > 0 ? `
                    <div style="margin-bottom: 48px;">
                        <h3 style="
                            font-family: 'Antipasto Pro', sans-serif; 
                            font-size: 24px; 
                            font-weight: 200; 
                            color: #ffffff; 
                            margin-bottom: 24px;
                            letter-spacing: 0.03em;
                        ">Beneficios disponibles</h3>
                        <div style="display: grid; gap: 12px;">
                            ${perks.map(perk => `
                                <div class="perk-item" style="
                                    padding: 20px 24px;
                                    background: rgba(255, 255, 255, 0.02);
                                    border: 1px solid rgba(255, 255, 255, 0.06);
                                    border-radius: 16px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    transition: all 0.2s ease;
                                    cursor: url('/pointer.png'), auto;
                                ">
                                    <div style="flex: 1; margin-right: 20px;">
                                        <div style="font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 500; color: #ffffff; margin-bottom: 6px; letter-spacing: 0.01em;">${perk.title}</div>
                                        ${perk.description ? `<div style="font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; color: rgba(255, 255, 255, 0.4); line-height: 1.6;">${perk.description}</div>` : ''}
                                    </div>
                                    <button onclick="event.stopPropagation(); redeemPerkById('${perk.id}')" class="redeem-button" style="
                                        padding: 12px 24px;
                                        background: rgba(255, 255, 255, 0.92);
                                        color: #080808;
                                        border-radius: 100px;
                                        font-family: 'Inter', sans-serif;
                                        font-size: 14px;
                                        font-weight: 500;
                                        border: none;
                                        cursor: url('/hand.png'), pointer;
                                        transition: all 0.2s ease;
                                        white-space: nowrap;
                                        letter-spacing: 0.01em;
                                    ">Canjear</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Events Section -->
                ${events.length > 0 ? `
                    <div style="margin-bottom: 48px;">
                        <h3 style="
                            font-family: 'Antipasto Pro', sans-serif; 
                            font-size: 24px; 
                            font-weight: 200; 
                            color: #ffffff; 
                            margin-bottom: 24px;
                            letter-spacing: 0.03em;
                        ">Próximos eventos</h3>
                        <div style="display: grid; gap: 12px;">
                            ${events.map(event => {
                                const eventDate = new Date(event.eventDate);
                                return `
                                    <div style="
                                        padding: 20px 24px;
                                        background: rgba(255, 255, 255, 0.02);
                                        border: 1px solid rgba(255, 255, 255, 0.06);
                                        border-radius: 16px;
                                        display: flex;
                                        align-items: center;
                                        gap: 20px;
                                    ">
                                        <div style="
                                            flex-shrink: 0;
                                            width: 60px;
                                            height: 60px;
                                            background: rgba(255, 255, 255, 0.06);
                                            border-radius: 12px;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            justify-content: center;
                                            border: 1px solid rgba(255, 255, 255, 0.08);
                                        ">
                                            <div style="font-family: 'Antipasto Pro', sans-serif; font-size: 22px; font-weight: 200; color: #ffffff; line-height: 1;">${eventDate.getDate()}</div>
                                            <div style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px;">${eventDate.toLocaleDateString('es-DO', { month: 'short' })}</div>
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 500; color: #ffffff; margin-bottom: 4px; letter-spacing: 0.01em;">${event.title}</div>
                                            <div style="font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300; color: rgba(255, 255, 255, 0.4);">${eventDate.toLocaleDateString('es-DO', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Location & Contact -->
                <div style="padding: 28px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
                        <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Ubicación</div>
                            <div style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 400; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">${establishment.address}, ${establishment.city}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: flex-start; gap: 16px;">
                        <div style="width: 40px; height: 40px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Teléfono</div>
                            <div style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 400; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">${establishment.phone}</div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <button onclick="toggleFavoriteEstablishment('${establishment.id}')" class="action-button" style="
                        padding: 16px 24px;
                        background: rgba(255, 255, 255, 0.06);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: 100px;
                        font-family: 'Inter', sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        color: rgba(255, 255, 255, 0.9);
                        cursor: url('/hand.png'), pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        letter-spacing: 0.01em;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Guardar
                    </button>
                    <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(establishment.address + ', ' + establishment.city)}', '_blank')" class="action-button" style="
                        padding: 16px 24px;
                        background: rgba(255, 255, 255, 0.92);
                        border: 1px solid rgba(255, 255, 255, 1);
                        border-radius: 100px;
                        font-family: 'Inter', sans-serif;
                        font-size: 14px;
                        font-weight: 500;
                        color: #080808;
                        cursor: url('/hand.png'), pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        letter-spacing: 0.01em;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        Cómo llegar
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Redeem a perk
async function redeemPerkById(perkId) {
    try {
        await redeemPerk(perkId);
        showToast('¡Beneficio canjeado exitosamente!');
        
        // Close modal
        document.querySelectorAll('[style*="position: fixed"]').forEach(m => m.remove());
    } catch (error) {
        console.error('Error redeeming perk:', error);
        showToast(error.message || 'Error al canjear beneficio', 'error');
    }
}

// Toggle favorite
async function toggleFavoriteEstablishment(establishmentId) {
    try {
        const result = await toggleFavorite(establishmentId);
        showToast(result.favorited ? 'Añadido a favoritos' : 'Eliminado de favoritos');
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('Error al actualizar favoritos', 'error');
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        searchQuery = e.target.value.trim();
        
        debounceTimer = setTimeout(async () => {
            if (searchQuery.length > 0) {
                await loadEstablishments({ search: searchQuery });
            } else {
                await loadEstablishments();
            }
        }, 300);
    });
}
