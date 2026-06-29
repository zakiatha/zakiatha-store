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
    const footerAdminLink = document.getElementById('footer-admin-link');
    const settingsLink = document.getElementById('nav-settings-link');
    if (!container) return;

    const session = getSession();
    
    // As requested, completely remove login, register, and logout/profile badge from the header.
    // They are now accessed via the settings page.
    container.innerHTML = '';

    // Show Admin link if user is admin
    if (session && session.role === 'admin') {
        if (adminLink) adminLink.style.display = 'flex';
        if (footerAdminLink) footerAdminLink.style.display = 'inline-block';
    } else {
        if (adminLink) adminLink.style.display = 'none';
        if (footerAdminLink) footerAdminLink.style.display = 'none';
    }

    // Always show Settings link for all users (guests will be redirected to #login)
    if (settingsLink) settingsLink.style.display = 'flex';

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

// Theme Initialization & Logic
function initTheme() {
    // Load saved theme
    const savedTheme = localStorage.getItem('topup_store_theme');
    
    // Default to dark theme unless saved as light
    const isLightTheme = savedTheme === 'light';
    
    if (isLightTheme) {
        document.documentElement.classList.add('light-theme');
    } else {
        document.documentElement.classList.remove('light-theme');
    }
    
    window.getCurrentTheme = function() {
        return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
    };
    
    window.toggleTheme = function() {
        const isCurrentLight = document.documentElement.classList.contains('light-theme');
        if (isCurrentLight) {
            document.documentElement.classList.remove('light-theme');
            localStorage.setItem('topup_store_theme', 'dark');
        } else {
            document.documentElement.classList.add('light-theme');
            localStorage.setItem('topup_store_theme', 'light');
        }
        window.dispatchEvent(new CustomEvent('themeChanged'));
    };
}

// Translation Dictionary for Bilingual Mode (ID/AR)
const translations = {
    id: {
        home: "Home",
        track: "Lacak Pesanan",
        settings: "Pengaturan",
        admin: "Dashboard Admin",
        lang_btn: "AR"
    },
    ar: {
        home: "الرئيسية",
        track: "تتبع الطلب",
        settings: "الإعدادات",
        admin: "لوحة التحكم",
        lang_btn: "ID"
    }
};

function initLanguage() {
    let savedLang = localStorage.getItem('topup_store_lang');
    if (!savedLang) {
        savedLang = 'id';
    }
    
    window.getCurrentLanguage = function() {
        return localStorage.getItem('topup_store_lang') || 'id';
    };
    
    window.toggleLanguage = function() {
        const current = window.getCurrentLanguage();
        const next = current === 'id' ? 'ar' : 'id';
        localStorage.setItem('topup_store_lang', next);
        applyLanguage(next);
        // Re-render current view so the view translations take effect
        router();
    };
    
    applyLanguage(savedLang);
    
    // Bind click listener to lang toggle button
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            window.toggleLanguage();
        });
    }
}

function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    // Translate static nav links
    const homeLink = document.querySelector('#nav-home-link span');
    if (homeLink) homeLink.textContent = translations[lang].home;
    
    const trackLink = document.querySelector('#nav-track-link span');
    if (trackLink) trackLink.textContent = translations[lang].track;
    
    const settingsLink = document.querySelector('#nav-settings-link span');
    if (settingsLink) settingsLink.textContent = translations[lang].settings;
    
    const adminLink = document.querySelector('#nav-admin-link span');
    if (adminLink) adminLink.textContent = translations[lang].admin;
    
    const langText = document.getElementById('lang-text');
    if (langText) langText.textContent = translations[lang].lang_btn;
}

// Application Initialization
function init() {
    // Set global helper on window so views can access it
    window.formatRupiah = formatRupiah;
    window.getSession = getSession;
    window.refreshAuthHeader = refreshAuthHeader;
    
    // Initialize hamburger menu
    initHamburger();
    
    // Initialize theme
    initTheme();
    
    // Initialize language
    initLanguage();
    
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
