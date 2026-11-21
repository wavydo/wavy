// Load user profile data and update sidebar
async function loadUserProfile() {
    console.log('[User Profile] Loading user profile...');
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        console.log('[User Profile] Response status:', response.status);
        
        if (!response.ok) {
            // If not authenticated, redirect to auth
            if (response.status === 401 || response.status === 403) {
                console.log('[User Profile] Not authenticated, redirecting to /auth');
                window.location.href = '/auth';
                return;
            }
            throw new Error('Failed to load user profile');
        }
        
        const data = await response.json();
        console.log('[User Profile] User data received:', data);
        const user = data.user;
        
        // Update profile section in sidebar
        const profileNameElement = document.querySelector('.profile .name');
        const profileOccupationElement = document.querySelector('.profile .occupation');
        const profileImageElement = document.querySelector('.profile img');
        
        console.log('[User Profile] Found elements:', {
            name: !!profileNameElement,
            occupation: !!profileOccupationElement,
            image: !!profileImageElement
        });
        
        if (profileNameElement && user) {
            // Set user name
            const displayName = user.name || user.businessName || user.username || 'Usuario';
            console.log('[User Profile] Setting name to:', displayName);
            profileNameElement.textContent = displayName;
        }
        
        if (profileOccupationElement && user) {
            // Set user type
            let occupation = 'User';
            if (data.userType === 'user') {
                occupation = 'TAPP User';
            } else if (data.userType === 'establishment') {
                occupation = user.category ? getCategoryLabel(user.category) : 'Business';
            } else if (data.userType === 'admin') {
                occupation = 'Administrator';
            }
            console.log('[User Profile] Setting occupation to:', occupation);
            profileOccupationElement.textContent = occupation;
        }
        
        if (profileImageElement && user) {
            // Set profile image if available
            if (user.logo) {
                console.log('[User Profile] Setting logo:', user.logo);
                profileImageElement.src = user.logo;
            } else {
                // Use default avatar with initials
                const initials = getInitials(user.name || user.businessName || user.username || 'U');
                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=667eea&color=fff&size=128`;
                console.log('[User Profile] Setting avatar with initials:', initials, avatarUrl);
                profileImageElement.src = avatarUrl;
            }
        }
        
        // Make profile clickable to go to settings
        const profileElement = document.querySelector('.profile');
        if (profileElement) {
            profileElement.style.cursor = 'pointer';
            profileElement.onclick = () => {
                window.location.href = '/dashboard/settings';
            };
            console.log('[User Profile] Profile element made clickable');
        }
        
        console.log('[User Profile] Profile updated successfully');
        
    } catch (error) {
        console.error('[User Profile] Error loading user profile:', error);
    }
}

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Get category label helper
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
    return labels[category] || 'Business';
}

// Load profile on page load
console.log('[User Profile] Script loaded, waiting for DOM...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('[User Profile] DOM loaded, calling loadUserProfile()');
    loadUserProfile();
});
