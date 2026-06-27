// js/views/home.js
// Home View - Displays Hero Banner with Live HUD feed, Search, Categories, and PC/Mobile Game Catalog

const homeView = {
    // High-quality custom inline SVGs for game and reseller logos
    logos: {
        'mobile-legends.svg': `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="url(#ml-grad)" stroke="#f59e0b" stroke-width="1"/>
                <path d="M12 6v12M8 10h8M9 14h6" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
                <defs>
                    <linearGradient id="ml-grad" x1="3" y1="2" x2="21" y2="23" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#b45309"/>
                        <stop offset="50%" stop-color="#d97706"/>
                        <stop offset="100%" stop-color="#78350f"/>
                    </linearGradient>
                </defs>
            </svg>`,
        'free-fire.svg': `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" fill="url(#ff-grad)"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" fill="#ffffff" opacity="0.8"/>
                <defs>
                    <linearGradient id="ff-grad" x1="6" y1="4" x2="18" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#ea580c"/>
                        <stop offset="100%" stop-color="#dc2626"/>
                    </linearGradient>
                </defs>
            </svg>`,
        'pubg-mobile.svg': `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="16" x="4" y="4" rx="2" fill="url(#pubg-grad)" stroke="#ca8a04" stroke-width="1.5"/>
                <path d="M9 9h6v6H9V9z" fill="#ffffff" opacity="0.9"/>
                <path d="M4 10h16M10 4v16" stroke="#ca8a04" stroke-width="1" stroke-dasharray="2 2"/>
                <defs>
                    <linearGradient id="pubg-grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#1e293b"/>
                        <stop offset="100%" stop-color="#0f172a"/>
                    </linearGradient>
                </defs>
            </svg>`,
        'valorant.svg': `
            <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="20" fill="#111827"/>
                <path d="M50 15L25 35V75L50 85L75 75V35L50 15Z" stroke="#ef4444" stroke-width="4" stroke-linejoin="round"/>
                <path d="M38 42L50 30L62 42M38 58L50 70L62 58" stroke="#ef4444" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
        'genshin-impact.svg': `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" fill="url(#gen-grad)" stroke="#06b6d4" stroke-width="1"/>
                <circle cx="12" cy="12" r="2" fill="#ffffff"/>
                <defs>
                    <linearGradient id="gen-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#06b6d4"/>
                        <stop offset="50%" stop-color="#0891b2"/>
                        <stop offset="100%" stop-color="#0e7490"/>
                    </linearGradient>
                </defs>
            </svg>`,
        'steam.svg': `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.889 13.778l-3.38 1.408a2.53 2.53 0 01-3.14-1.258l-2.73-4.72a.507.507 0 01.328-.737l5.228-.93a4.56 4.56 0 015.659 2.268l1.41 2.443a2.534 2.534 0 01-3.375 1.526zm-1.89-6.388c-.988 0-1.789-.8-1.789-1.789s.801-1.79 1.79-1.79c.988 0 1.788.801 1.788 1.79s-.8 1.789-1.789 1.789z" fill="url(#steam-grad)"/>
                <defs>
                    <linearGradient id="steam-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#0284c7"/>
                        <stop offset="100%" stop-color="#1e3a8a"/>
                    </linearGradient>
                </defs>
            </svg>`,
        'xl.svg': `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#00529C"/>
                <path d="M12 14L22 24L12 34" stroke="#FFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M36 14L26 24L36 34" stroke="#FFCC00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
        'axis.svg': `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#800080"/>
                <ellipse cx="24" cy="24" rx="12" ry="12" fill="#FF1493"/>
                <circle cx="24" cy="24" r="6" fill="#FFF"/>
            </svg>`,
        'byu.svg': `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#00E5FF"/>
                <text x="24" y="30" font-family="sans-serif" font-size="18" font-weight="900" fill="#002D3B" text-anchor="middle">by.u</text>
            </svg>`,
        'telkomsel.svg': `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#E60000"/>
                <path d="M14 14L34 24L14 34Z" fill="#FFF"/>
                <path d="M22 20L34 24L22 28Z" fill="#CCCCCC"/>
            </svg>`,
        'smartfren.svg': `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#FF007F"/>
                <path d="M16 16H32V32H16V16Z" fill="#FFF" opacity="0.9"/>
                <circle cx="24" cy="24" r="5" fill="#FF007F"/>
            </svg>`,
        'indosat.svg': `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#FFCC00"/>
                <path d="M14 24C14 18.48 18.48 14 24 14C29.52 14 34 18.48 34 24C34 29.52 29.52 34 24 34C18.48 34 14 29.52 14 24Z" fill="#E60000"/>
                <path d="M24 18C20.69 18 18 20.69 18 24C18 27.31 20.69 30 24 30C27.31 30 30 27.31 30 24C30 20.69 27.31 18 24 18Z" fill="#FFCC00"/>
            </svg>`,
        'googleplay.svg': `
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="24" fill="#1e293b"/>
                <path d="M14 12V36L34 24L14 12Z" fill="url(#gp-triangle)"/>
                <defs>
                    <linearGradient id="gp-triangle" x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#00C9FF"/>
                        <stop offset="50%" stop-color="#92FE9D"/>
                        <stop offset="100%" stop-color="#FC466B"/>
                    </linearGradient>
                </defs>
            </svg>`
    },

    // Dynamic grid matrix animation helper
    init3DGrid: function() {
        let canvas = document.getElementById('matrix-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'matrix-canvas';
            document.body.appendChild(canvas);
        }
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const resizeHandler = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.removeEventListener('resize', resizeHandler);
        window.addEventListener('resize', resizeHandler);

        let speed = 0.6;
        let offset = 0;
        let animId;

        const drawGrid = () => {
            ctx.clearRect(0, 0, w, h);
            
            // Cyberpunk color configurations
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)'; // Neon purple
            ctx.lineWidth = 1;

            const horizon = h * 0.45;

            // Perspective vertical lines
            const lineCount = 32;
            for (let i = 0; i <= lineCount; i++) {
                const ratio = i / lineCount;
                const xStart = w * ratio;
                const xEnd = (ratio - 0.5) * w * 3.5 + w / 2;

                ctx.beginPath();
                ctx.moveTo(xStart, horizon);
                ctx.lineTo(xEnd, h);
                ctx.stroke();
            }

            // Scrolling horizon lines
            offset += speed;
            if (offset >= 40) offset = 0;

            let y = horizon;
            let spacing = 8;
            while (y < h) {
                const currY = y + offset * (spacing / 40);
                
                // Add color glow on closer lines
                const alpha = Math.min(0.6, (currY - horizon) / (h - horizon));
                ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.3})`; // Cyan glow lines

                ctx.beginPath();
                ctx.moveTo(0, currY);
                ctx.lineTo(w, currY);
                ctx.stroke();

                y += spacing;
                spacing *= 1.22; // perspective spacing multiplier
            }
            
            animId = requestAnimationFrame(drawGrid);
        };

        drawGrid();

        // Save anim ID to window so we can clear it when routing away
        if (window.matrixAnimId) {
            cancelAnimationFrame(window.matrixAnimId);
        }
        window.matrixAnimId = animId;
    },

    // Simulated 3D tilt tracking effect
    init3DTilt: function() {
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top;  
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;

                const rotX = -(dy / yc) * 15; // Rotate up to 15 deg
                const rotY = (dx / xc) * 15;

                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.06, 1.06, 1.06)`;
                card.style.borderColor = 'var(--primary)';
                card.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.4), 0 0 20px var(--primary-glow)';
            });

            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.15s ease-out, border-color var(--transition-normal), box-shadow var(--transition-normal)';

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                card.style.borderColor = 'var(--border-color)';
                card.style.boxShadow = '';
            });
        });
    },

    // Render function
    render: function(container) {
        let activeCategory = 'all';
        let searchQuery = '';
        
        // Load games from DB
        const games = window.dbService.getGames();

        // Static simulated transaction feed data
        const transactionMocks = [
            { user: 'Budi***', item: 'Diamond MLBB', amount: '86 Diamonds', status: 'SUCCESS' },
            { user: 'Lutfi***', item: 'Pulsa Telkomsel', amount: 'Rp 50.000', status: 'SUCCESS' },
            { user: 'Sultan***', item: 'Steam Wallet', amount: 'IDR 120.000', status: 'SUCCESS' },
            { user: 'Rian***', item: 'Free Fire', amount: '355 Diamonds', status: 'SUCCESS' },
            { user: 'Zaki***', item: 'Valorant Points', amount: '1375 Points', status: 'SUCCESS' },
            { user: 'Gamer***', item: 'Pulsa XL', amount: 'Rp 100.000', status: 'SUCCESS' },
            { user: 'Dewi***', item: 'Google Play Gift Card', amount: 'Rp 50.000', status: 'SUCCESS' }
        ];

        // Double array to create smooth seamless marquee loop
        const marqueeFeed = [...transactionMocks, ...transactionMocks];

        container.innerHTML = `
            <!-- Interactive Hacker/Gamer HUD Transaction Feed -->
            <div class="hud-panel">
                <div class="hud-feed-container">
                    <div class="hud-feed-track">
                        ${marqueeFeed.map(tx => `
                            <div class="hud-feed-item success">
                                <span class="hud-feed-dot"></span>
                                <span style="color: var(--text-primary); font-weight:700;">${tx.user}</span>
                                <span style="color: var(--text-secondary);">Membeli</span>
                                <span style="color: var(--secondary); font-weight:800;">${tx.item} (${tx.amount})</span>
                                <span class="badge status-success" style="font-size: 8px; padding: 1px 4px;">Sukses</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Immersive Hero Banner with 3D Cyber Console Aesthetic -->
            <section class="hero-banner" style="border: 1px solid rgba(139, 92, 246, 0.3); background: radial-gradient(circle at top left, rgba(13, 19, 39, 0.95), rgba(7, 10, 19, 0.9));">
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" alt="Promo Banner" class="hero-bg">
                <div class="hero-overlay" style="background: linear-gradient(135deg, rgba(7, 10, 19, 0.95) 20%, rgba(139, 92, 246, 0.15) 100%);"></div>
                <div class="hero-content">
                    <span class="badge popular" style="margin-bottom: 12px; font-weight: 800; padding: 6px 12px; font-size: 12px; letter-spacing: 1px;">GAMING PORTAL 3D</span>
                    <h1 class="gradient-text" style="font-size: 46px; text-shadow: 0 0 20px rgba(139,92,246,0.3);">Portal Top-Up Gamers Sejati</h1>
                    <p style="font-size: 15px; line-height: 1.7; color: var(--text-secondary);">
                        Rasakan pengalaman top-up paling visual, cepat dan aman di Indonesia. Diuji oleh komunitas e-sports, terintegrasi langsung dengan gateway pihak ketiga otomatis 24 Jam.
                    </p>
                    <a href="#game/mobile-legends" class="btn-grad" style="border-radius: var(--radius-md);">
                        <i data-lucide="zap" style="width: 18px; height: 18px;"></i>
                        <span>Isi Diamond MLBB</span>
                    </a>
                </div>
            </section>
            
            <!-- Search and Cyber Category Selector -->
            <section class="search-filter-bar" style="background: rgba(15, 19, 34, 0.4); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md); backdrop-filter: blur(10px);">
                <div class="search-box">
                    <i data-lucide="search" class="search-icon" style="width: 20px; height: 20px; color: var(--primary);"></i>
                    <input type="text" id="game-search" class="form-input" placeholder="Cari game, pulsa, atau voucher..." style="border-color: rgba(139, 92, 246, 0.3);">
                </div>
                
                <div class="category-tabs">
                    <button class="tab-btn active" data-category="all">Semua Kategori</button>
                    <button class="tab-btn" data-category="mobile">📱 Game Mobile</button>
                    <button class="tab-btn" data-category="pc">💻 Game PC</button>
                    <button class="tab-btn" data-category="voucher">🎫 Voucher Game</button>
                    <button class="tab-btn" data-category="pulsa">📞 Isi Pulsa</button>
                </div>
            </section>
            
            <!-- Catalog Sections (Separate categories visually) -->
            <section id="catalog-section" style="margin-top: 40px;">
                <div id="no-games-found" style="display: none; text-align: center; padding: 48px; color: var(--text-secondary);">
                    <i data-lucide="frown" style="width: 48px; height: 48px; margin-bottom: 12px; color: var(--text-muted);"></i>
                    <p>Item tidak dapat ditemukan.</p>
                </div>

                <div id="games-categories-container">
                    <!-- Dynamic categories lists populated here -->
                </div>
            </section>
        `;
        
        const searchInput = document.getElementById('game-search');
        const tabButtons = document.querySelectorAll('.tab-btn');
        const gamesCategoriesContainer = document.getElementById('games-categories-container');
        const noGamesFound = document.getElementById('no-games-found');
        
        // Define rendering groups
        const renderGroups = () => {
            gamesCategoriesContainer.innerHTML = '';
            
            // Map category IDs to titles
            const categoryGroups = [
                { key: 'mobile', title: '📱 Game Mobile', desc: 'Isi Diamond, Token, dan Crystal game mobile favorit Anda secara instan.' },
                { key: 'pc', title: '💻 Game PC', desc: 'Top-up Points & Wallet Game PC terbaik dengan harga paling miring.' },
                { key: 'voucher', title: '🎫 Voucher Digital', desc: 'Beli Kode Voucher Google Play, Steam Wallet secara aman.' },
                { key: 'pulsa', title: '📞 Isi Pulsa', desc: 'Isi ulang pulsa XL, Axis, By.U, Telkomsel, Smartfren, Indosat otomatis 24 Jam.' }
            ];

            let totalRendered = 0;

            categoryGroups.forEach(group => {
                // If filtering specific category, skip others
                if (activeCategory !== 'all' && activeCategory !== group.key) return;

                // Filter games belonging to this group and matching search query
                const matchedGames = games.filter(g => 
                    g.category === group.key && 
                    g.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (matchedGames.length === 0) return;

                totalRendered += matchedGames.length;

                // Create header and grid container
                const section = document.createElement('div');
                section.className = 'category-section';
                section.style.marginBottom = '48px';

                section.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <h2 class="game-grid-section-title gradient-text">${group.title}</h2>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px; padding-left: 12px;">${group.desc}</p>
                    </div>
                    <div class="game-grid">
                        ${matchedGames.map(game => {
                            const logoSvg = this.logos[game.logo] || `<div style="width:48px; height:48px; background:var(--primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800;">${game.name.substring(0,2)}</div>`;
                            return `
                                <div class="game-card-wrapper">
                                    <div class="game-card" data-slug="${game.slug}">
                                        <div class="game-card-img-wrapper">
                                            <img src="${game.banner}" alt="${game.name}" class="game-card-img" loading="lazy">
                                        </div>
                                        <div class="game-card-overlay"></div>
                                        
                                        <!-- Cyber Glow Floating Logo -->
                                        <div style="position: absolute; top: 16px; left: 16px; z-index: 3; background: rgba(15, 19, 34, 0.9); backdrop-filter: blur(8px); padding: 8px; border-radius: 50%; border: 1px solid rgba(139, 92, 246, 0.4); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow);">
                                            ${logoSvg}
                                        </div>
                                        
                                        <div class="game-card-info">
                                            <h3 class="game-card-title">${game.name}</h3>
                                            <span class="game-card-category" style="color: var(--secondary);">${game.category === 'mobile' ? 'Mobile' : game.category === 'pc' ? 'PC' : game.category === 'voucher' ? 'Voucher' : 'Isi Pulsa'}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;

                gamesCategoriesContainer.appendChild(section);
            });

            if (totalRendered === 0) {
                noGamesFound.style.display = 'block';
            } else {
                noGamesFound.style.display = 'none';
            }

            // Click listener for cards
            document.querySelectorAll('.game-card').forEach(card => {
                card.addEventListener('click', () => {
                    const slug = card.getAttribute('data-slug');
                    window.location.hash = `#game/${slug}`;
                });
            });

            // Initialize 3D dynamic tilt interaction
            this.init3DTilt();
        };

        // Event listeners for search & tabs
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderGroups();
        });

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category');
                renderGroups();
            });
        });

        // Initialize background canvas animations & dynamic cards
        this.init3DGrid();
        renderGroups();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

window.homeView = homeView;
