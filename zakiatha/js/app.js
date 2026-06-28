// js/app.js
// Main router and application coordinator for ZakiTopup SPA

// Global configuration & state
const appState = {
    currentView: null,
    currentParams: {}
};

// Global Helpers
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Session Helpers
function getSession() {
    try {
        const sess = localStorage.getItem('topup_store_session');
        return sess ? JSON.parse(sess) : null;
    } catch (e) {
        return null;
    }
}

// --- Hamburger Menu Logic ---
function initHamburger() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('main-nav-links');
    const overlay = document.getElementById('mobile-nav-overlay');

    if (!hamburgerBtn || !navLinks) return;

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('open');
        toggleMenu(!isOpen);
    });

    if (overlay) {
        overlay.addEventListener('click', () => {
            toggleMenu(false);
        });
    }

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
    });
}

function toggleMenu(open) {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('main-nav-links');
    const overlay = document.getElementById('mobile-nav-overlay');

    if (open) {
        hamburgerBtn.classList.add('active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Dynamic Auth Navbar Header updater
function refreshAuthHeader() {
    const container = document.getElementById('auth-nav-container');
    const adminLink = document.getElementById('nav-admin-link');
    const settingsLink = document.getElementById('nav-settings-link');
    if (!container) return;

    const session = getSession();
    if (session) {
        // Logged in
        const user = window.dbService.getUserByUsername(session.username);
        const points = user ? user.points : 0;
        
        container.innerHTML = `
            <div class="user-profile-badge">
                <i data-lucide="user" style="width: 14px; height: 14px; color: var(--primary);"></i>
                <span>${session.username}</span>
                <div class="user-points-badge" id="nav-points-badge" title="Poin Belanja Anda (1% Cashback)">
                    <i data-lucide="award" style="width: 12px; height: 12px;"></i>
                    <span>${points.toLocaleString('id-ID')} Pts</span>
                </div>
            </div>
            <button id="btn-logout" class="nav-btn secondary" style="padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);">
                <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
                <span>Keluar</span>
            </button>
        `;

        // Bind logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            localStorage.removeItem('topup_store_session');
            refreshAuthHeader();
            toggleMenu(false);
            // If current page is admin or settings, redirect to home
            if (window.location.hash === '#admin' || window.location.hash === '#settings') {
                window.location.hash = '#home';
            } else {
                router(); // force redraw
            }
        });

        // Show Admin link if user is admin
        if (session.role === 'admin') {
            if (adminLink) adminLink.style.display = 'flex';
        } else {
            if (adminLink) adminLink.style.display = 'none';
        }

        // Show Settings link for logged-in users
        if (settingsLink) settingsLink.style.display = 'flex';
    } else {
        // Guest (not logged in)
        container.innerHTML = `
            <a href="#login" class="nav-btn secondary" style="padding: 8px 16px; border-radius: var(--radius-sm);">
                <i data-lucide="log-in" style="width: 14px; height: 14px;"></i>
                <span>Masuk</span>
            </a>
            <a href="#register" class="nav-btn primary" style="padding: 8px 16px; border-radius: var(--radius-sm); box-shadow: none;">
                <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i>
                <span>Daftar</span>
            </a>
        `;
        if (adminLink) adminLink.style.display = 'none';
        if (settingsLink) settingsLink.style.display = 'none';
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Router function
function router() {
    const appContainer = document.getElementById('app');
    const hash = window.location.hash || '#home';
    
    // Close hamburger menu on navigation
    toggleMenu(false);
    
    // Smooth transition effect: fade out current view
    appContainer.style.opacity = '0';
    
    // Give it a short delay for smooth fade transition
    setTimeout(() => {
        // Clear container
        appContainer.innerHTML = '';
        
        // Parse Route
        if (hash === '#home' || hash === '') {
            updateActiveNav('nav-home-link');
            if (window.homeView) {
                window.homeView.render(appContainer);
            } else {
                renderError(appContainer, 'Home View not loaded');
            }
        } 
        else if (hash === '#login') {
            updateActiveNav('');
            if (window.loginView) {
                window.loginView.render(appContainer);
            } else {
                renderError(appContainer, 'Login View not loaded');
            }
        }
        else if (hash === '#register') {
            updateActiveNav('');
            if (window.registerView) {
                window.registerView.render(appContainer);
            } else {
                renderError(appContainer, 'Register View not loaded');
            }
        }
        else if (hash.startsWith('#game/')) {
            updateActiveNav(''); // No main nav button is active
            const slug = hash.split('/')[1];
            if (window.detailView) {
                window.detailView.render(appContainer, { slug: slug });
            } else {
                renderError(appContainer, 'Detail View not loaded');
            }
        } 
        else if (hash.startsWith('#invoice/')) {
            updateActiveNav('');
            const id = hash.split('/')[1];
            if (window.invoiceView) {
                window.invoiceView.render(appContainer, { invoiceId: id });
            } else {
                renderError(appContainer, 'Invoice View not loaded');
            }
        } 
        else if (hash === '#track') {
            updateActiveNav('nav-track-link');
            if (window.trackView) {
                window.trackView.render(appContainer);
            } else {
                renderError(appContainer, 'Track View not loaded');
            }
        }
        else if (hash === '#settings') {
            // Protected Route: Check if user is logged in
            const session = getSession();
            if (!session) {
                window.location.hash = '#login';
                return;
            }
            
            updateActiveNav('nav-settings-link');
            if (window.settingsView) {
                window.settingsView.render(appContainer);
            } else {
                renderError(appContainer, 'Settings View not loaded');
            }
        }
        else if (hash === '#admin') {
            // Protected Route: Check if user is logged in as admin
            const session = getSession();
            if (!session || session.role !== 'admin') {
                // Not authorized: redirect to login
                window.location.hash = '#login';
                return;
            }
            
            updateActiveNav('nav-admin-link');
            if (window.adminView) {
                window.adminView.render(appContainer);
            } else {
                renderError(appContainer, 'Admin View not loaded');
            }
        } 
        else {
            // 404 Route
            updateActiveNav('');
            render404(appContainer);
        }
        
        // Render Lucide icons for any newly added icons in the view
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Fade in new view
        appContainer.style.transition = 'opacity 0.2s ease';
        appContainer.style.opacity = '1';
        
        // Scroll to top on page change
        window.scrollTo(0, 0);
    }, 150);
}

// Helper: Highlight active nav link
function updateActiveNav(activeId) {
    const navLinks = ['nav-home-link', 'nav-track-link', 'nav-admin-link', 'nav-settings-link'];
    navLinks.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (id === activeId) {
            el.classList.add('active');
            if (id === 'nav-admin-link') {
                el.classList.remove('secondary');
            }
        } else {
            el.classList.remove('active');
            if (id === 'nav-admin-link') {
                el.classList.add('secondary');
            }
        }
    });
}

// Helper: Render 404 Page
function render404(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; gap: 20px;">
            <i data-lucide="alert-triangle" style="width: 64px; height: 64px; color: var(--danger); filter: drop-shadow(0 0 10px var(--danger-glow));"></i>
            <h1 class="gradient-text" style="font-size: 36px;">Halaman Tidak Ditemukan</h1>
            <p style="color: var(--text-secondary); max-width: 450px;">Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.</p>
            <a href="#home" class="btn-grad">
                <i data-lucide="arrow-left" style="width: 18px; height: 18px;"></i>
                <span>Kembali ke Home</span>
            </a>
        </div>
    `;
}

// Helper: Render Error message
function renderError(container, message) {
    container.innerHTML = `
        <div class="card-glass" style="padding: 32px; text-align: center; max-width: 500px; margin: 40px auto; border-color: var(--danger);">
            <i data-lucide="x-circle" style="width: 48px; height: 48px; color: var(--danger); margin-bottom: 16px;"></i>
            <h3 style="margin-bottom: 8px;">Terjadi Kesalahan</h3>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">${message}</p>
            <a href="#home" class="btn-grad" style="padding: 10px 20px; font-size: 14px;">Kembali ke Home</a>
        </div>
    `;
}

// Application Initialization
function init() {
    // Set global helper on window so views can access it
    window.formatRupiah = formatRupiah;
    window.getSession = getSession;
    window.refreshAuthHeader = refreshAuthHeader;
    
    // Initialize hamburger menu
    initHamburger();
    
    // Listen for hash changes
    window.addEventListener('hashchange', router);
    
    // Refresh header dynamic session updates
    window.addEventListener('sessionUpdated', refreshAuthHeader);
    window.addEventListener('dbUpdated', refreshAuthHeader);
    
    // Initial load for header auth state
    refreshAuthHeader();

    console.log("ZakiTopup SPA Initialized — Galaxy Edition 🌌");
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
    init();
    router();
});
