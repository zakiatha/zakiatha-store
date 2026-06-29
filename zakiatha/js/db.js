// js/db.js
// Database service for the game top-up store using localStorage

const DB_KEY = 'topup_store_db';

// Helper: Get database from localStorage
function getDB() {
    let dbStr = localStorage.getItem(DB_KEY);
    if (!dbStr) {
        const defaultDb = initDefaultDB();
        localStorage.setItem(DB_KEY, JSON.stringify(defaultDb));
        return defaultDb;
    }
    
    let db = JSON.parse(dbStr);
    
    // Migration check: Ensure new default games and products (like E-Wallet) are injected
    const defaultDb = initDefaultDB();
    let hasUpdates = false;
    
    if (!db.games) db.games = [];
    if (!db.products) db.products = [];
    if (!db.vouchers) {
        db.vouchers = defaultDb.vouchers || [];
        hasUpdates = true;
    }
    
    if (!db.paymentMethods) {
        db.paymentMethods = defaultDb.paymentMethods || [];
        hasUpdates = true;
    } else {
        // Sync payment methods
        defaultDb.paymentMethods.forEach(defaultPM => {
            const index = db.paymentMethods.findIndex(pm => pm.id === defaultPM.id);
            if (index === -1) {
                db.paymentMethods.push(defaultPM);
                hasUpdates = true;
            } else {
                // Update properties if changed
                if (db.paymentMethods[index].name !== defaultPM.name ||
                    db.paymentMethods[index].code !== defaultPM.code ||
                    db.paymentMethods[index].type !== defaultPM.type ||
                    db.paymentMethods[index].feeType !== defaultPM.feeType ||
                    db.paymentMethods[index].feeValue !== defaultPM.feeValue ||
                    db.paymentMethods[index].info !== defaultPM.info) {
                    db.paymentMethods[index].name = defaultPM.name;
                    db.paymentMethods[index].code = defaultPM.code;
                    db.paymentMethods[index].type = defaultPM.type;
                    db.paymentMethods[index].feeType = defaultPM.feeType;
                    db.paymentMethods[index].feeValue = defaultPM.feeValue;
                    db.paymentMethods[index].info = defaultPM.info;
                    hasUpdates = true;
                }
            }
        });
    }
    
    // Healing: Clean up any invalid/undefined IDs in the existing database
    db.games.forEach(g => {
        if (!g.id || g.id === 'undefined') {
            g.id = 'g-' + Math.random().toString(36).substring(2, 9);
            hasUpdates = true;
        }
    });
    db.products.forEach(p => {
        if (!p.id || p.id === 'undefined') {
            p.id = 'p-' + Math.random().toString(36).substring(2, 9);
            hasUpdates = true;
        }
    });
    db.vouchers.forEach(v => {
        if (!v.id || v.id === 'undefined') {
            v.id = 'v-' + Math.random().toString(36).substring(2, 9);
            hasUpdates = true;
        }
    });
    
    // Sync default game properties (like logos) to existing games
    defaultDb.games.forEach(defaultGame => {
        const index = db.games.findIndex(g => g.id === defaultGame.id);
        if (index === -1) {
            db.games.push(defaultGame);
            hasUpdates = true;
        } else {
            // Update logo, banner, fields, and other static details for default games
            if (db.games[index].logo !== defaultGame.logo || 
                db.games[index].banner !== defaultGame.banner || 
                JSON.stringify(db.games[index].fields) !== JSON.stringify(defaultGame.fields)) {
                db.games[index].logo = defaultGame.logo;
                db.games[index].banner = defaultGame.banner;
                db.games[index].description = defaultGame.description;
                db.games[index].fields = defaultGame.fields;
                hasUpdates = true;
            }
        }
    });
    
    defaultDb.products.forEach(defaultProduct => {
        const exists = db.products.some(p => p.id === defaultProduct.id);
        if (!exists) {
            db.products.push(defaultProduct);
            hasUpdates = true;
        }
    });

    if (!db.apiConfig) {
        db.apiConfig = defaultDb.apiConfig;
        hasUpdates = true;
    }
    
    if (hasUpdates) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    
    return db;
}

// Helper: Save database to localStorage
function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Trigger custom event so other views can react to database changes in real-time
    window.dispatchEvent(new CustomEvent('dbUpdated'));
}

// Initialize default data if database is empty
function initDefaultDB() {
    const defaultDB = {
        users: [
            {
                username: 'admin',
                gmail: 'admin@gmail.com',
                phone: '081234567890',
                password: 'adminpassword',
                role: 'admin',
                points: 0
            },
            {
                username: 'gamer',
                gmail: 'gamer@gmail.com',
                phone: '089876543210',
                password: 'gamerpassword',
                role: 'user',
                points: 25000 // Berikan poin awal untuk uji coba pembayaran poin
            }
        ],
        games: [
            {
                id: 'g-mlbb',
                name: 'Mobile Legends',
                slug: 'mobile-legends',
                category: 'mobile',
                logo: 'mobilelgendsbangbang.jpg',
                banner: 'img/banner-mlbb.jpg',
                description: 'Top up Diamond Mobile Legends: Bang Bang instan, murah, dan aman. Masukkan data akun Anda, pilih nominal, selesaikan pembayaran, dan Diamond akan langsung masuk ke akun Anda!',
                fields: [
                    { id: 'userId', label: 'User ID', placeholder: 'Masukkan User ID', type: 'text', required: true },
                    { id: 'zoneId', label: 'Zone ID', placeholder: 'Masukkan Zone ID', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-ff',
                name: 'Free Fire',
                slug: 'free-fire',
                category: 'mobile',
                logo: 'freefire.jpg',
                banner: 'img/banner-ff.jpg',
                description: 'Top up Diamond Free Fire instan, murah, dan terpercaya. Cukup masukkan Player ID Free Fire Anda, pilih nominal Diamond, dan selesaikan pembayaran.',
                fields: [
                    { id: 'userId', label: 'Player ID', placeholder: 'Masukkan Player ID', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-pubg',
                name: 'PUBG Mobile',
                slug: 'pubg-mobile',
                category: 'mobile',
                logo: 'PUBGM.jpg',
                banner: 'img/banner-pubg.jpg',
                description: 'Top up Unknown Cash (UC) PUBG Mobile instan dan murah. Masukkan Character ID Anda, pilih jumlah UC yang diinginkan, dan bayar dengan metode pembayaran favorit Anda.',
                fields: [
                    { id: 'userId', label: 'Character ID', placeholder: 'Masukkan Character ID', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-genshin',
                name: 'Genshin Impact',
                slug: 'genshin-impact',
                category: 'mobile',
                logo: 'gensinimpact.jpg',
                banner: 'img/banner-genshin.jpg',
                description: 'Top up Genesis Crystals atau Welkin Moon Genshin Impact instan. Masukkan UID dan pilih Server yang sesuai dengan akun Genshin Impact Anda.',
                fields: [
                    { id: 'userId', label: 'UID', placeholder: 'Masukkan UID Akun', type: 'text', required: true },
                    { 
                        id: 'server', 
                        label: 'Server', 
                        type: 'select', 
                        required: true,
                        options: ['Asia', 'America', 'Europe', 'TW/HK/MO'] 
                    }
                ],
                isActive: true
            },
            {
                id: 'g-valorant',
                name: 'Valorant',
                slug: 'valorant',
                category: 'pc',
                logo: 'valorant.jpg',
                banner: 'img/banner-valorant.jpg',
                description: 'Top up Valorant Points (VP) murah dan cepat. Masukkan Riot ID + Tagline Anda (contoh: Username#1234), pilih nominal VP, dan VP akan segera masuk.',
                fields: [
                    { id: 'userId', label: 'Riot ID (Username#Tagline)', placeholder: 'Contoh: GamerSejati#ID1', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-steam',
                name: 'Steam Wallet IDR',
                slug: 'steam-wallet',
                category: 'voucher',
                logo: 'steam.jpg',
                banner: 'img/banner-steam.jpg',
                description: 'Beli Steam Wallet Code Rupiah instan untuk mengisi saldo akun Steam Anda. Masukkan Akun Gmail Pengguna dan Nomor Handphone Anda.',
                fields: [
                    { id: 'gmail', label: 'Akun Gmail Pengguna', placeholder: 'Masukkan Akun Gmail Anda', type: 'text', required: true },
                    { id: 'phone', label: 'Nomor Handphone', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            },
            // --- KATEGORI ISI PULSA ---
            {
                id: 'g-xl',
                name: 'Pulsa XL Axiata',
                slug: 'xl',
                category: 'pulsa',
                logo: 'XL.png',
                banner: 'img/banner-xl.jpg',
                description: 'Isi ulang pulsa XL murah, cepat, dan otomatis 24 jam. Cukup masukkan nomor handphone XL Anda, pilih nominal pulsa, dan selesaikan pembayaran.',
                fields: [
                    { id: 'phone', label: 'Nomor Handphone XL', placeholder: 'Contoh: 081812345678', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-axis',
                name: 'Pulsa Axis',
                slug: 'axis',
                category: 'pulsa',
                logo: 'axis.png',
                banner: 'img/banner-axis.jpg',
                description: 'Isi ulang pulsa Axis murah, cepat, dan otomatis. Masukkan nomor handphone Axis Anda, pilih nominal pulsa, dan selesaikan pembayaran.',
                fields: [
                    { id: 'phone', label: 'Nomor Handphone Axis', placeholder: 'Contoh: 083812345678', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-byu',
                name: 'Pulsa By.U',
                slug: 'byu',
                category: 'pulsa',
                logo: 'by-u.png',
                banner: 'img/banner-byu.jpg',
                description: 'Isi ulang pulsa by.U instan 24 jam. Masukkan nomor handphone by.U Anda, pilih nominal pulsa, dan selesaikan pembayaran.',
                fields: [
                    { id: 'phone', label: 'Nomor Handphone by.U', placeholder: 'Contoh: 085112345678', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-telkomsel',
                name: 'Pulsa Telkomsel',
                slug: 'telkomsel',
                category: 'pulsa',
                logo: 'telkomsel.jpg',
                banner: 'img/banner-telkomsel.jpg',
                description: 'Isi ulang pulsa Telkomsel murah, cepat, dan terpercaya. Masukkan nomor handphone Telkomsel Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor Handphone Telkomsel', placeholder: 'Contoh: 081212345678', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-smartfren',
                name: 'Pulsa Smartfren',
                slug: 'smartfren',
                category: 'pulsa',
                logo: 'smartfren.jpg',
                banner: 'img/banner-smartfren.jpg',
                description: 'Isi ulang pulsa Smartfren murah dan cepat. Masukkan nomor HP Smartfren Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor Handphone Smartfren', placeholder: 'Contoh: 088212345678', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-indosat',
                name: 'Pulsa Indosat IM3',
                slug: 'indosat',
                category: 'pulsa',
                logo: 'indoosat.png',
                banner: 'img/banner-indosat.jpg',
                description: 'Isi ulang pulsa Indosat Ooredoo murah dan cepat. Masukkan nomor HP Indosat Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor Handphone Indosat', placeholder: 'Contoh: 085712345678', type: 'text', required: true }
                ],
                isActive: true
            },
            // --- KATEGORI VOUCHER BARU ---
            {
                id: 'g-googleplay',
                name: 'Google Play Voucher',
                slug: 'google-play',
                category: 'voucher',
                logo: 'googleplay.png',
                banner: 'img/banner-googleplay.jpg',
                description: 'Beli Google Play Gift Card instan. Kode voucher Google Play akan dikirimkan langsung ke email Anda.',
                fields: [
                    { id: 'email', label: 'Akun Gmail Pengguna', placeholder: 'Masukkan Akun Gmail Anda', type: 'text', required: true },
                    { id: 'phone', label: 'Nomor Handphone', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            },
            // --- KATEGORI E-WALLET ---
            {
                id: 'g-shopeepay',
                name: 'ShopeePay',
                slug: 'shopeepay',
                category: 'ewallet',
                logo: 'shoopepay.png',
                banner: 'img/banner-shopeepay.jpg',
                description: 'Top up saldo ShopeePay instan. Masukkan nomor HP yang terdaftar di akun Shopee Anda, pilih nominal, dan saldo akan langsung masuk.',
                fields: [
                    { id: 'phone', label: 'Nomor HP ShopeePay', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-dana',
                name: 'DANA',
                slug: 'dana',
                category: 'ewallet',
                logo: 'dana.jpg',
                banner: 'img/banner-dana.jpg',
                description: 'Top up saldo DANA instan dan murah. Masukkan nomor HP terdaftar di DANA Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor HP DANA', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-gopay',
                name: 'GoPay',
                slug: 'gopay',
                category: 'ewallet',
                logo: 'gopay.jpg',
                banner: 'img/banner-gopay.jpg',
                description: 'Top up saldo GoPay instan. Masukkan nomor HP yang terdaftar di akun Gojek Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor HP GoPay', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-ovo',
                name: 'OVO',
                slug: 'ovo',
                category: 'ewallet',
                logo: 'ovo.jpg',
                banner: 'img/banner-ovo.jpg',
                description: 'Top up saldo OVO instan dan terpercaya. Masukkan nomor HP yang terdaftar di OVO Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor HP OVO', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-grabpay',
                name: 'GrabPay',
                slug: 'grabpay',
                category: 'ewallet',
                logo: 'grabpay.png',
                banner: 'img/banner-grabpay.jpg',
                description: 'Top up saldo GrabPay / OVO (via Grab) instan. Masukkan nomor HP terdaftar di Grab Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor HP Grab', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            },
            {
                id: 'g-sakuku',
                name: 'SakuKu',
                slug: 'sakuku',
                category: 'ewallet',
                logo: 'sakuku.jpg',
                banner: 'img/banner-sakuku.jpg',
                description: 'Top up saldo SakuKu (BCA) instan. Masukkan nomor HP terdaftar di SakuKu Anda.',
                fields: [
                    { id: 'phone', label: 'Nomor HP SakuKu', placeholder: 'Contoh: 081234567890', type: 'text', required: true }
                ],
                isActive: true
            }
        ],
        products: [
            // ===== BUYER_SKU_CODE is used for Digiflazz API integration =====
            // Mobile Legends
            { id: 'p-ml-5', gameId: 'g-mlbb', name: '5 Diamonds', price: 1500, originalPrice: 2000, isPopular: false, isActive: true, buyer_sku_code: 'ml5' },
            { id: 'p-ml-12', gameId: 'g-mlbb', name: '12 Diamonds', price: 3500, originalPrice: 4000, isPopular: false, isActive: true, buyer_sku_code: 'ml12' },
            { id: 'p-ml-50', gameId: 'g-mlbb', name: '50 Diamonds', price: 14000, originalPrice: 16000, isPopular: false, isActive: true, buyer_sku_code: 'ml50' },
            { id: 'p-ml-86', gameId: 'g-mlbb', name: '86 Diamonds', price: 20000, originalPrice: 24000, isPopular: false, isActive: true, buyer_sku_code: 'ml86' },
            { id: 'p-ml-wdp', gameId: 'g-mlbb', name: 'Weekly Diamond Pass', price: 28000, originalPrice: 32000, isPopular: true, isActive: true, buyer_sku_code: 'mlwdp' },
            { id: 'p-ml-257', gameId: 'g-mlbb', name: '257 Diamonds (234 + 23 Bonus)', price: 60000, originalPrice: 70000, isPopular: false, isActive: true, buyer_sku_code: 'ml257' },
            { id: 'p-ml-706', gameId: 'g-mlbb', name: '706 Diamonds (625 + 81 Bonus)', price: 165000, originalPrice: 180000, isPopular: true, isActive: true, buyer_sku_code: 'ml706' },
            
            // Free Fire
            { id: 'p-ff-5', gameId: 'g-ff', name: '5 Diamonds', price: 1000, originalPrice: 1500, isPopular: false, isActive: true, buyer_sku_code: 'ff5' },
            { id: 'p-ff-12', gameId: 'g-ff', name: '12 Diamonds', price: 2000, originalPrice: 2500, isPopular: false, isActive: true, buyer_sku_code: 'ff12' },
            { id: 'p-ff-50', gameId: 'g-ff', name: '50 Diamonds', price: 7000, originalPrice: 9000, isPopular: false, isActive: true, buyer_sku_code: 'ff50' },
            { id: 'p-ff-70', gameId: 'g-ff', name: '70 Diamonds', price: 10000, originalPrice: 12000, isPopular: false, isActive: true, buyer_sku_code: 'ff70' },
            { id: 'p-ff-140', gameId: 'g-ff', name: '140 Diamonds', price: 19000, originalPrice: 22000, isPopular: false, isActive: true, buyer_sku_code: 'ff140' },
            { id: 'p-ff-355', gameId: 'g-ff', name: '355 Diamonds', price: 47000, originalPrice: 55000, isPopular: true, isActive: true, buyer_sku_code: 'ff355' },
            { id: 'p-ff-720', gameId: 'g-ff', name: '720 Diamonds', price: 95000, originalPrice: 110000, isPopular: true, isActive: true, buyer_sku_code: 'ff720' },

            // PUBG Mobile
            { id: 'p-pubg-60', gameId: 'g-pubg', name: '60 UC', price: 14000, originalPrice: 16000, isPopular: false, isActive: true, buyer_sku_code: 'pubg60' },
            { id: 'p-pubg-325', gameId: 'g-pubg', name: '325 UC', price: 69000, originalPrice: 79000, isPopular: true, isActive: true, buyer_sku_code: 'pubg325' },
            { id: 'p-pubg-660', gameId: 'g-pubg', name: '660 UC', price: 139000, originalPrice: 155000, isPopular: false, isActive: true, buyer_sku_code: 'pubg660' },
            { id: 'p-pubg-1800', gameId: 'g-pubg', name: '1800 UC', price: 349000, originalPrice: 399000, isPopular: true, isActive: true, buyer_sku_code: 'pubg1800' },

            // Valorant
            { id: 'p-val-125', gameId: 'g-valorant', name: '125 Points', price: 15000, originalPrice: 18000, isPopular: false, isActive: true, buyer_sku_code: 'val125' },
            { id: 'p-val-375', gameId: 'g-valorant', name: '375 Points', price: 45000, originalPrice: 50000, isPopular: false, isActive: true, buyer_sku_code: 'val375' },
            { id: 'p-val-700', gameId: 'g-valorant', name: '700 Points', price: 79000, originalPrice: 85000, isPopular: false, isActive: true, buyer_sku_code: 'val700' },
            { id: 'p-val-1375', gameId: 'g-valorant', name: '1375 Points', price: 149000, originalPrice: 165000, isPopular: true, isActive: true, buyer_sku_code: 'val1375' },
            { id: 'p-val-2400', gameId: 'g-valorant', name: '2400 Points', price: 249000, originalPrice: 280000, isPopular: true, isActive: true, buyer_sku_code: 'val2400' },

            // Genshin Impact
            { id: 'p-gen-60', gameId: 'g-genshin', name: '60 Genesis Crystals', price: 15000, originalPrice: 16500, isPopular: false, isActive: true, buyer_sku_code: 'gen60' },
            { id: 'p-gen-300', gameId: 'g-genshin', name: '300 Crystals', price: 75000, originalPrice: 79000, isPopular: false, isActive: true, buyer_sku_code: 'gen300' },
            { id: 'p-gen-welkin', gameId: 'g-genshin', name: 'Blessing of the Welkin Moon', price: 79000, originalPrice: 89000, isPopular: true, isActive: true, buyer_sku_code: 'genwelkin' },
            { id: 'p-gen-980', gameId: 'g-genshin', name: '980 Genesis Crystals', price: 220000, originalPrice: 249000, isPopular: false, isActive: true, buyer_sku_code: 'gen980' },
            { id: 'p-gen-1980', gameId: 'g-genshin', name: '1980 Genesis Crystals', price: 439000, originalPrice: 489000, isPopular: true, isActive: true, buyer_sku_code: 'gen1980' },

            // Steam Wallet
            { id: 'p-steam-12', gameId: 'g-steam', name: 'Steam Wallet IDR 12.000', price: 15000, originalPrice: 16000, isPopular: false, isActive: true, buyer_sku_code: 'steam12' },
            { id: 'p-steam-45', gameId: 'g-steam', name: 'Steam Wallet IDR 45.000', price: 52000, originalPrice: 56000, isPopular: false, isActive: true, buyer_sku_code: 'steam45' },
            { id: 'p-steam-60', gameId: 'g-steam', name: 'Steam Wallet IDR 60.000', price: 69000, originalPrice: 75000, isPopular: true, isActive: true, buyer_sku_code: 'steam60' },
            { id: 'p-steam-120', gameId: 'g-steam', name: 'Steam Wallet IDR 120.000', price: 135000, originalPrice: 145000, isPopular: true, isActive: true, buyer_sku_code: 'steam120' },

            // Pulsa Nominals (XL, Axis, By.U, Telkomsel, Smartfren, Indosat share these nominal prices)
            // XL
            { id: 'p-xl-5', gameId: 'g-xl', name: 'Pulsa XL Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true, buyer_sku_code: 'xl5' },
            { id: 'p-xl-10', gameId: 'g-xl', name: 'Pulsa XL Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true, buyer_sku_code: 'xl10' },
            { id: 'p-xl-25', gameId: 'g-xl', name: 'Pulsa XL Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true, buyer_sku_code: 'xl25' },
            { id: 'p-xl-50', gameId: 'g-xl', name: 'Pulsa XL Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true, buyer_sku_code: 'xl50' },
            { id: 'p-xl-100', gameId: 'g-xl', name: 'Pulsa XL Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true, buyer_sku_code: 'xl100' },

            // Axis
            { id: 'p-ax-5', gameId: 'g-axis', name: 'Pulsa Axis Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true, buyer_sku_code: 'ax5' },
            { id: 'p-ax-10', gameId: 'g-axis', name: 'Pulsa Axis Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true, buyer_sku_code: 'ax10' },
            { id: 'p-ax-25', gameId: 'g-axis', name: 'Pulsa Axis Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true, buyer_sku_code: 'ax25' },
            { id: 'p-ax-50', gameId: 'g-axis', name: 'Pulsa Axis Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true, buyer_sku_code: 'ax50' },
            { id: 'p-ax-100', gameId: 'g-axis', name: 'Pulsa Axis Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true, buyer_sku_code: 'ax100' },

            // By.U
            { id: 'p-byu-5', gameId: 'g-byu', name: 'Pulsa by.U Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true, buyer_sku_code: 'byu5' },
            { id: 'p-byu-10', gameId: 'g-byu', name: 'Pulsa by.U Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true, buyer_sku_code: 'byu10' },
            { id: 'p-byu-25', gameId: 'g-byu', name: 'Pulsa by.U Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true, buyer_sku_code: 'byu25' },
            { id: 'p-byu-50', gameId: 'g-byu', name: 'Pulsa by.U Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true, buyer_sku_code: 'byu50' },
            { id: 'p-byu-100', gameId: 'g-byu', name: 'Pulsa by.U Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true, buyer_sku_code: 'byu100' },

            // Telkomsel
            { id: 'p-ts-5', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true, buyer_sku_code: 'ts5' },
            { id: 'p-ts-10', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true, buyer_sku_code: 'ts10' },
            { id: 'p-ts-25', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true, buyer_sku_code: 'ts25' },
            { id: 'p-ts-50', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 5.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true, buyer_sku_code: 'ts50' },
            { id: 'p-ts-100', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true, buyer_sku_code: 'ts100' },

            // Smartfren
            { id: 'p-sf-5', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true, buyer_sku_code: 'sf5' },
            { id: 'p-sf-10', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true, buyer_sku_code: 'sf10' },
            { id: 'p-sf-25', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true, buyer_sku_code: 'sf25' },
            { id: 'p-sf-50', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true, buyer_sku_code: 'sf50' },
            { id: 'p-sf-100', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true, buyer_sku_code: 'sf100' },

            // Indosat
            { id: 'p-ind-5', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true, buyer_sku_code: 'ind5' },
            { id: 'p-ind-10', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true, buyer_sku_code: 'ind10' },
            { id: 'p-ind-25', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true, buyer_sku_code: 'ind25' },
            { id: 'p-ind-50', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true, buyer_sku_code: 'ind50' },
            { id: 'p-ind-100', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true, buyer_sku_code: 'ind100' },

            // Google Play Voucher
            { id: 'p-gp-20', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 20.000', price: 22000, originalPrice: 25000, isPopular: false, isActive: true, buyer_sku_code: 'gp20' },
            { id: 'p-gp-50', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 50.000', price: 53500, originalPrice: 59000, isPopular: false, isActive: true, buyer_sku_code: 'gp50' },
            { id: 'p-gp-100', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 100.000', price: 105000, originalPrice: 115000, isPopular: true, isActive: true, buyer_sku_code: 'gp100' },
            { id: 'p-gp-200', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 200.000', price: 208000, originalPrice: 220000, isPopular: true, isActive: true, buyer_sku_code: 'gp200' },

            // === E-WALLET PRODUCTS ===
            // ShopeePay
            { id: 'p-spay-25', gameId: 'g-shopeepay', name: 'ShopeePay Rp 25.000', price: 26000, originalPrice: 27500, isPopular: false, isActive: true, buyer_sku_code: 'spay25' },
            { id: 'p-spay-50', gameId: 'g-shopeepay', name: 'ShopeePay Rp 50.000', price: 51000, originalPrice: 53000, isPopular: true, isActive: true, buyer_sku_code: 'spay50' },
            { id: 'p-spay-100', gameId: 'g-shopeepay', name: 'ShopeePay Rp 100.000', price: 101000, originalPrice: 105000, isPopular: false, isActive: true, buyer_sku_code: 'spay100' },
            { id: 'p-spay-200', gameId: 'g-shopeepay', name: 'ShopeePay Rp 200.000', price: 201000, originalPrice: 210000, isPopular: true, isActive: true, buyer_sku_code: 'spay200' },
            { id: 'p-spay-500', gameId: 'g-shopeepay', name: 'ShopeePay Rp 500.000', price: 501000, originalPrice: 520000, isPopular: false, isActive: true, buyer_sku_code: 'spay500' },
            // DANA
            { id: 'p-dana-25', gameId: 'g-dana', name: 'DANA Rp 25.000', price: 26000, originalPrice: 27500, isPopular: false, isActive: true, buyer_sku_code: 'dana25' },
            { id: 'p-dana-50', gameId: 'g-dana', name: 'DANA Rp 50.000', price: 51000, originalPrice: 53000, isPopular: true, isActive: true, buyer_sku_code: 'dana50' },
            { id: 'p-dana-100', gameId: 'g-dana', name: 'DANA Rp 100.000', price: 101000, originalPrice: 105000, isPopular: false, isActive: true, buyer_sku_code: 'dana100' },
            { id: 'p-dana-200', gameId: 'g-dana', name: 'DANA Rp 200.000', price: 201000, originalPrice: 210000, isPopular: true, isActive: true, buyer_sku_code: 'dana200' },
            { id: 'p-dana-500', gameId: 'g-dana', name: 'DANA Rp 500.000', price: 501000, originalPrice: 520000, isPopular: false, isActive: true, buyer_sku_code: 'dana500' },
            // GoPay
            { id: 'p-gopay-25', gameId: 'g-gopay', name: 'GoPay Rp 25.000', price: 26000, originalPrice: 27500, isPopular: false, isActive: true, buyer_sku_code: 'gopay25' },
            { id: 'p-gopay-50', gameId: 'g-gopay', name: 'GoPay Rp 50.000', price: 51000, originalPrice: 53000, isPopular: true, isActive: true, buyer_sku_code: 'gopay50' },
            { id: 'p-gopay-100', gameId: 'g-gopay', name: 'GoPay Rp 100.000', price: 101000, originalPrice: 105000, isPopular: false, isActive: true, buyer_sku_code: 'gopay100' },
            { id: 'p-gopay-200', gameId: 'g-gopay', name: 'GoPay Rp 200.000', price: 201000, originalPrice: 210000, isPopular: true, isActive: true, buyer_sku_code: 'gopay200' },
            { id: 'p-gopay-500', gameId: 'g-gopay', name: 'GoPay Rp 500.000', price: 501000, originalPrice: 520000, isPopular: false, isActive: true, buyer_sku_code: 'gopay500' },
            // OVO
            { id: 'p-ovo-25', gameId: 'g-ovo', name: 'OVO Rp 25.000', price: 26000, originalPrice: 27500, isPopular: false, isActive: true, buyer_sku_code: 'ovo25' },
            { id: 'p-ovo-50', gameId: 'g-ovo', name: 'OVO Rp 50.000', price: 51000, originalPrice: 53000, isPopular: true, isActive: true, buyer_sku_code: 'ovo50' },
            { id: 'p-ovo-100', gameId: 'g-ovo', name: 'OVO Rp 100.000', price: 101000, originalPrice: 105000, isPopular: false, isActive: true, buyer_sku_code: 'ovo100' },
            { id: 'p-ovo-200', gameId: 'g-ovo', name: 'OVO Rp 200.000', price: 201000, originalPrice: 210000, isPopular: true, isActive: true, buyer_sku_code: 'ovo200' },
            { id: 'p-ovo-500', gameId: 'g-ovo', name: 'OVO Rp 500.000', price: 501000, originalPrice: 520000, isPopular: false, isActive: true, buyer_sku_code: 'ovo500' },
            // GrabPay
            { id: 'p-grab-25', gameId: 'g-grabpay', name: 'GrabPay Rp 25.000', price: 26000, originalPrice: 27500, isPopular: false, isActive: true, buyer_sku_code: 'grab25' },
            { id: 'p-grab-50', gameId: 'g-grabpay', name: 'GrabPay Rp 50.000', price: 51000, originalPrice: 53000, isPopular: true, isActive: true, buyer_sku_code: 'grab50' },
            { id: 'p-grab-100', gameId: 'g-grabpay', name: 'GrabPay Rp 100.000', price: 101000, originalPrice: 105000, isPopular: false, isActive: true, buyer_sku_code: 'grab100' },
            { id: 'p-grab-200', gameId: 'g-grabpay', name: 'GrabPay Rp 200.000', price: 201000, originalPrice: 210000, isPopular: true, isActive: true, buyer_sku_code: 'grab200' },
            { id: 'p-grab-500', gameId: 'g-grabpay', name: 'GrabPay Rp 500.000', price: 501000, originalPrice: 520000, isPopular: false, isActive: true, buyer_sku_code: 'grab500' },
            // SakuKu
            { id: 'p-saku-25', gameId: 'g-sakuku', name: 'SakuKu Rp 25.000', price: 26500, originalPrice: 28000, isPopular: false, isActive: true, buyer_sku_code: 'saku25' },
            { id: 'p-saku-50', gameId: 'g-sakuku', name: 'SakuKu Rp 50.000', price: 51500, originalPrice: 54000, isPopular: true, isActive: true, buyer_sku_code: 'saku50' },
            { id: 'p-saku-100', gameId: 'g-sakuku', name: 'SakuKu Rp 100.000', price: 101500, originalPrice: 106000, isPopular: false, isActive: true, buyer_sku_code: 'saku100' },
            { id: 'p-saku-200', gameId: 'g-sakuku', name: 'SakuKu Rp 200.000', price: 202000, originalPrice: 212000, isPopular: true, isActive: true, buyer_sku_code: 'saku200' },
            { id: 'p-saku-500', gameId: 'g-sakuku', name: 'SakuKu Rp 500.000', price: 503000, originalPrice: 525000, isPopular: false, isActive: true, buyer_sku_code: 'saku500' }
        ],
        paymentMethods: [
            { id: 'pm-qris', name: 'QRIS', code: 'QRIS', type: 'qris', feeType: 'percent', feeValue: 0, isActive: true, info: 'Bayar instan via GoPay, Dana, OVO, LinkAja, ShopeePay' },
            { id: 'pm-dana', name: 'DANA', code: 'DANA', type: 'ewallet', feeType: 'percent', feeValue: 1.5, isActive: true, info: 'Biaya admin 1.5%' },
            { id: 'pm-ovo', name: 'OVO', code: 'OVO', type: 'ewallet', feeType: 'percent', feeValue: 1.5, isActive: true, info: 'Biaya admin 1.5%' },
            { id: 'pm-shopeepay', name: 'ShopeePay', code: 'SHOPEEPAY', type: 'ewallet', feeType: 'percent', feeValue: 2.0, isActive: true, info: 'Biaya admin 2%' },
            { id: 'pm-gopay', name: 'GoPay', code: 'GOPAY', type: 'ewallet', feeType: 'percent', feeValue: 1.5, isActive: true, info: 'Biaya admin 1.5%' },
            { id: 'pm-linkaja', name: 'LinkAja', code: 'LINKAJA', type: 'ewallet', feeType: 'percent', feeValue: 1.5, isActive: true, info: 'Biaya admin 1.5%' },
            { id: 'pm-bca', name: 'BCA Virtual Account', code: 'BCA_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-mandiri', name: 'Mandiri Virtual Account', code: 'MANDIRI_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-bni', name: 'BNI Virtual Account', code: 'BNI_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-bri', name: 'BRI Virtual Account', code: 'BRI_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-bsi', name: 'BSI Virtual Account', code: 'BSI_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-cimb', name: 'CIMB Virtual Account', code: 'CIMB_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-alfa', name: 'Alfamart', code: 'ALFAMART', type: 'retail', feeType: 'flat', feeValue: 2500, isActive: true, info: 'Bayar di kasir Alfamart terdekat' },
            { id: 'pm-indomaret', name: 'Indomaret', code: 'INDOMARET', type: 'retail', feeType: 'flat', feeValue: 2500, isActive: true, info: 'Bayar di kasir Indomaret terdekat' }
        ],
        transactions: [],
        vouchers: [
            { id: 'v-promo10', code: 'PROMO10', type: 'percent', value: 10, maxUsage: 100, usageCount: 0, isActive: true },
            { id: 'v-coba5k', code: 'COBA5K', type: 'flat', value: 5000, maxUsage: 50, usageCount: 0, isActive: true }
        ],
        apiConfig: {
            // Digiflazz API Configuration
            apiUrl: 'https://api.digiflazz.com/v1',
            username: '',
            apiKey: '',
            webhookUrl: '',
            isTestMode: true,
            // Simulated provider data
            balance: 7500000,
            providerName: 'Digiflazz'
        },
        apiLogs: []
    };
    return defaultDB;
}

// ==================== DATABASE CRUD OPERATIONS ====================

const dbService = {
    // --- AUTHENTICATION OPERATIONS ---
    getUsers: function() {
        const db = getDB();
        return db.users || [];
    },

    registerUser: function(userData) {
        const db = getDB();
        if (!db.users) db.users = [];

        // Validate uniqueness of username and email
        const userExists = db.users.some(u => 
            u.username.toLowerCase() === userData.username.toLowerCase() || 
            u.gmail.toLowerCase() === userData.gmail.toLowerCase()
        );

        if (userExists) {
            return { success: false, message: 'Username atau Email sudah terdaftar!' };
        }

        const newUser = {
            username: userData.username,
            gmail: userData.gmail,
            phone: userData.phone,
            password: userData.password,
            role: 'user', // default role
            points: 0
        };

        db.users.push(newUser);
        saveDB(db);
        return { success: true, user: newUser };
    },

    loginUser: function(identifier, password) {
        const db = getDB();
        if (!db.users) return { success: false, message: 'Belum ada pengguna terdaftar.' };

        const user = db.users.find(u => 
            (u.username.toLowerCase() === identifier.toLowerCase() || 
             u.gmail.toLowerCase() === identifier.toLowerCase()) && 
            u.password === password
        );

        if (!user) {
            return { success: false, message: 'Username/Email atau Password salah!' };
        }

        return { success: true, user: user };
    },

    getUserByUsername: function(username) {
        const db = getDB();
        if (!db.users) return null;
        return db.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    },

    updateUserPoints: function(username, pointsChange) {
        const db = getDB();
        const userIndex = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
        if (userIndex > -1) {
            db.users[userIndex].points = Math.max(0, db.users[userIndex].points + pointsChange);
            saveDB(db);
            return db.users[userIndex].points;
        }
        return 0;
    },

    // --- USER PROFILE OPERATIONS ---
    updateUserProfile: function(currentUsername, newData) {
        const db = getDB();
        const userIndex = db.users.findIndex(u => u.username.toLowerCase() === currentUsername.toLowerCase());
        if (userIndex === -1) return { success: false, message: 'User tidak ditemukan.' };

        // Check uniqueness if username/email changed
        const otherUsers = db.users.filter((u, i) => i !== userIndex);
        if (newData.username && otherUsers.some(u => u.username.toLowerCase() === newData.username.toLowerCase())) {
            return { success: false, message: 'Username sudah digunakan oleh akun lain!' };
        }
        if (newData.gmail && otherUsers.some(u => u.gmail.toLowerCase() === newData.gmail.toLowerCase())) {
            return { success: false, message: 'Email sudah digunakan oleh akun lain!' };
        }

        if (newData.username) db.users[userIndex].username = newData.username;
        if (newData.gmail) db.users[userIndex].gmail = newData.gmail;
        if (newData.phone !== undefined) db.users[userIndex].phone = newData.phone;

        saveDB(db);
        return { success: true, user: db.users[userIndex] };
    },

    changePassword: function(username, currentPassword, newPassword) {
        const db = getDB();
        const userIndex = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
        if (userIndex === -1) return { success: false, message: 'User tidak ditemukan.' };

        if (db.users[userIndex].password !== currentPassword) {
            return { success: false, message: 'Password saat ini salah!' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Password baru minimal 6 karakter!' };
        }

        db.users[userIndex].password = newPassword;
        saveDB(db);
        return { success: true, message: 'Password berhasil diubah.' };
    },

    deleteAccount: function(username) {
        const db = getDB();
        db.users = db.users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
        saveDB(db);
        return true;
    },

    // --- GAME CATALOG OPERATIONS ---
    getGames: function(includeInactive = false) {
        const db = getDB();
        if (includeInactive) return db.games;
        return db.games.filter(g => g.isActive);
    },

    getGameBySlug: function(slug) {
        const db = getDB();
        return db.games.find(g => g.slug === slug);
    },

    getGameById: function(id) {
        const db = getDB();
        return db.games.find(g => g.id === id);
    },

    saveGame: function(gameData) {
        const db = getDB();
        const targetId = gameData.id && gameData.id !== 'undefined' ? gameData.id : null;
        const index = targetId ? db.games.findIndex(g => g.id === targetId) : -1;
        
        if (index > -1) {
            db.games[index] = { 
                ...db.games[index], 
                ...gameData,
                id: targetId // Ensure ID is preserved
            };
        } else {
            const newGame = {
                isActive: true,
                ...gameData,
                id: 'g-' + Math.random().toString(36).substring(2, 9) // Set a clean random ID
            };
            db.games.push(newGame);
        }
        saveDB(db);
        return true;
    },

    deleteGame: function(id) {
        const db = getDB();
        db.games = db.games.filter(g => g.id !== id);
        db.products = db.products.filter(p => p.gameId !== id);
        saveDB(db);
        return true;
    },

    // --- PRODUCT OPERATIONS ---
    getProducts: function(gameId, includeInactive = false) {
        const db = getDB();
        let list = db.products.filter(p => p.gameId === gameId);
        if (!includeInactive) {
            list = list.filter(p => p.isActive);
        }
        return list.sort((a, b) => a.price - b.price);
    },

    saveProduct: function(productData) {
        const db = getDB();
        
        // Uniqueness validation for buyer_sku_code
        if (productData.buyer_sku_code) {
            const targetSku = String(productData.buyer_sku_code).trim().toLowerCase();
            const duplicate = db.products.find(p => 
                p.id !== productData.id && 
                p.buyer_sku_code && 
                String(p.buyer_sku_code).trim().toLowerCase() === targetSku
            );
            if (duplicate) {
                return { success: false, message: `Kode SKU "${productData.buyer_sku_code}" sudah digunakan oleh produk "${duplicate.name}"!` };
            }
        }

        const targetId = productData.id && productData.id !== 'undefined' ? productData.id : null;
        const index = targetId ? db.products.findIndex(p => p.id === targetId) : -1;
        
        if (index > -1) {
            db.products[index] = { 
                ...db.products[index], 
                ...productData,
                id: targetId, // Ensure ID is preserved
                originalPrice: Math.round(productData.price * 1.15) // Update original price when price changes
            };
        } else {
            const newProduct = {
                isActive: true,
                isPopular: false,
                ...productData,
                id: 'p-' + Math.random().toString(36).substring(2, 9), // Set a clean random ID
                originalPrice: Math.round(productData.price * 1.15)
            };
            db.products.push(newProduct);
        }
        saveDB(db);
        return { success: true };
    },

    deleteProduct: function(id) {
        const db = getDB();
        db.products = db.products.filter(p => p.id !== id);
        saveDB(db);
        return true;
    },

    // --- PAYMENT METHOD OPERATIONS ---
    getPaymentMethods: function(includeInactive = false) {
        const db = getDB();
        if (includeInactive) return db.paymentMethods;
        return db.paymentMethods.filter(pm => pm.isActive);
    },

    savePaymentMethod: function(pmData) {
        const db = getDB();
        const index = db.paymentMethods.findIndex(p => p.id === pmData.id);
        
        if (index > -1) {
            db.paymentMethods[index] = { ...db.paymentMethods[index], ...pmData };
        } else {
            const newPM = {
                id: 'pm-' + Math.random().toString(36).substring(2, 9),
                isActive: true,
                ...pmData
            };
            db.paymentMethods.push(newPM);
        }
        saveDB(db);
        return true;
    },

    // --- TRANSACTION OPERATIONS WITH POINTS & API SIMULATOR ---
    getTransactions: function() {
        const db = getDB();
        return db.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getTransactionById: function(id) {
        const db = getDB();
        return db.transactions.find(t => t.id === id || t.invoiceId === id);
    },

    createTransaction: function(txData) {
        const db = getDB();
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const randomHex = Math.floor(1000 + Math.random() * 9000);
        const invoiceId = `INV-${yyyy}${mm}${dd}-${randomHex}`;

        const newTx = {
            id: 'tx-' + Math.random().toString(36).substring(2, 11),
            invoiceId: invoiceId,
            gameId: txData.gameId,
            gameName: txData.gameName,
            accountData: txData.accountData,
            productId: txData.productId,
            productName: txData.productName,
            basePrice: txData.basePrice,
            adminFee: txData.adminFee,
            totalAmount: txData.totalAmount, // Ini total tagihan setelah dikurangi poin & voucher (jika ada)
            pointsUsed: txData.pointsUsed || 0,
            pointsEarned: txData.pointsEarned || 0,
            voucherCode: txData.voucherCode || null,
            discountAmount: txData.discountAmount || 0,
            username: txData.username || null, // Catat user pembeli (null jika guest)
            paymentMethodId: txData.paymentMethodId,
            paymentMethodName: txData.paymentMethodName,
            paymentMethodCode: txData.paymentMethodCode,
            paymentMethodType: txData.paymentMethodType,
            whatsapp: txData.whatsapp,
            status: 'PENDING',
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            purchaseNote: '',
            statusHistory: [
                { status: 'PENDING', date: now.toISOString(), note: 'Pesanan dibuat. Menunggu pembayaran.' }
            ]
        };

        // Jika transaksi menggunakan poin, potong poin langsung dari user saat ini
        if (newTx.username && newTx.pointsUsed > 0) {
            const userIndex = db.users.findIndex(u => u.username.toLowerCase() === newTx.username.toLowerCase());
            if (userIndex > -1) {
                db.users[userIndex].points = Math.max(0, db.users[userIndex].points - newTx.pointsUsed);
            }
        }

        // Tulis log API Outgoing untuk simulasi koneksi 3rd party (Digiflazz)
        const product = db.products.find(p => p.id === txData.productId);
        const buyerSku = product ? product.buyer_sku_code : 'unknown';
        const customerNo = Object.values(txData.accountData).join('');
        
        const logReq = {
            username: db.apiConfig.username || 'zakitopup_reseller',
            buyer_sku_code: buyerSku,
            customer_no: customerNo,
            ref_id: invoiceId,
            sign: 'simulated_md5_hash_of_credentials_and_' + invoiceId
        };
        const logResp = {
            data: {
                ref_id: invoiceId,
                buyer_sku_code: buyerSku,
                customer_no: customerNo,
                status: 'Pengisian dalam Proses',
                rc: '39',
                sn: '',
                price: txData.basePrice,
                message: 'PROSES',
                balance: db.apiConfig.balance - txData.basePrice
            }
        };
        
        // Simpan log API
        if (!db.apiLogs) db.apiLogs = [];
        db.apiLogs.unshift({
            timestamp: now.toISOString(),
            action: `DIGIFLAZZ_TRX_POST`,
            request: JSON.stringify(logReq, null, 2),
            response: JSON.stringify(logResp, null, 2)
        });

        // Potong saldo API Provider (sebagai simulasi admin)
        db.apiConfig.balance = Math.max(0, db.apiConfig.balance - txData.basePrice);

        db.transactions.push(newTx);
        saveDB(db);
        return newTx;
    },

    updateTransactionStatus: function(id, status, noteText = '') {
        const db = getDB();
        const index = db.transactions.findIndex(t => t.id === id || t.invoiceId === id);
        
        if (index > -1) {
            const tx = db.transactions[index];
            const oldStatus = tx.status;
            tx.status = status;

            // Ensure statusHistory exists
            if (!tx.statusHistory) {
                tx.statusHistory = [
                    { status: 'PENDING', date: tx.createdAt, note: 'Pesanan dibuat. Menunggu pembayaran.' }
                ];
            }

            // Append status history
            tx.statusHistory.push({
                status: status,
                date: new Date().toISOString(),
                note: noteText || (status === 'SUCCESS' ? 'Transaksi sukses diproses.' : status === 'FAILED' ? 'Transaksi gagal/dibatalkan.' : 'Status diperbarui.')
            });

            // Log callback webhook dari API 3rd party (Digiflazz Webhook)
            const product = db.products.find(p => p.id === tx.productId);
            const buyerSku = product ? product.buyer_sku_code : 'unknown';
            const customerNo = Object.values(tx.accountData).join('');
            
            const logReq = {
                data: {
                    ref_id: tx.invoiceId,
                    buyer_sku_code: buyerSku,
                    customer_no: customerNo,
                    status: status === 'SUCCESS' ? 'Sukses' : 'Gagal',
                    rc: status === 'SUCCESS' ? '00' : '06',
                    sn: status === 'SUCCESS' ? Math.floor(100000000 + Math.random() * 900000000).toString() : '',
                    price: tx.basePrice,
                    message: status === 'SUCCESS' ? 'Transaksi Sukses' : 'Transaksi Gagal / Batalkan',
                    sign: 'simulated_md5_hash_callback_' + tx.invoiceId
                }
            };
            const logResp = {
                success: true,
                message: 'Callback received and transaction updated successfully. Status: ' + status
            };
            if (!db.apiLogs) db.apiLogs = [];
            db.apiLogs.unshift({
                timestamp: new Date().toISOString(),
                action: `DIGIFLAZZ_WEBHOOK_CALLBACK_${status}`,
                request: JSON.stringify(logReq, null, 2),
                response: JSON.stringify(logResp, null, 2)
            });

            // LOGIKA POIN:
            // 1. Jika status berubah dari PENDING -> SUCCESS
            if (oldStatus === 'PENDING' && status === 'SUCCESS') {
                if (tx.username) {
                    const userIndex = db.users.findIndex(u => u.username.toLowerCase() === tx.username.toLowerCase());
                    if (userIndex > -1) {
                        // Tambahkan poin reward 1%
                        db.users[userIndex].points += tx.pointsEarned;
                    }
                }
            }
            // 2. Jika status berubah dari PENDING -> FAILED (Refund poin & kuota voucher yang sudah dipotong)
            else if (oldStatus === 'PENDING' && status === 'FAILED') {
                if (tx.username && tx.pointsUsed > 0) {
                    const userIndex = db.users.findIndex(u => u.username.toLowerCase() === tx.username.toLowerCase());
                    if (userIndex > -1) {
                        // Kembalikan poin yang terpakai
                        db.users[userIndex].points += tx.pointsUsed;
                    }
                }
                // Kembalikan saldo API provider karena trx gagal
                db.apiConfig.balance += tx.basePrice;

                // Kembalikan kuota penggunaan voucher
                if (tx.voucherCode) {
                    const voucher = db.vouchers.find(v => v.code.toUpperCase() === tx.voucherCode.toUpperCase());
                    if (voucher) {
                        voucher.usageCount = Math.max(0, voucher.usageCount - 1);
                    }
                }
            }

            saveDB(db);
            return tx;
        }
        return null;
    },

    updateTransactionNote: function(id, note) {
        const db = getDB();
        const index = db.transactions.findIndex(t => t.id === id || t.invoiceId === id);
        if (index > -1) {
            db.transactions[index].purchaseNote = note;
            saveDB(db);
            return db.transactions[index];
        }
        return null;
    },

    // --- VOUCHER OPERATIONS ---
    getVouchers: function() {
        const db = getDB();
        return db.vouchers || [];
    },

    saveVoucher: function(voucherData) {
        const db = getDB();
        
        // Uniqueness validation for voucher code
        const targetCode = String(voucherData.code).trim().toUpperCase();
        const duplicate = db.vouchers.find(v => 
            v.id !== voucherData.id && 
            String(v.code).trim().toUpperCase() === targetCode
        );
        if (duplicate) {
            return { success: false, message: `Kode voucher "${voucherData.code}" sudah digunakan!` };
        }

        const targetId = voucherData.id && voucherData.id !== 'undefined' ? voucherData.id : null;
        const index = targetId ? db.vouchers.findIndex(v => v.id === targetId) : -1;

        const updatedVoucher = {
            id: targetId || 'v-' + Math.random().toString(36).substring(2, 9),
            code: targetCode,
            type: voucherData.type,
            value: parseInt(voucherData.value) || 0,
            maxUsage: parseInt(voucherData.maxUsage) || 0,
            usageCount: voucherData.usageCount !== undefined ? parseInt(voucherData.usageCount) : 0,
            isActive: voucherData.isActive !== undefined ? voucherData.isActive : true
        };

        if (index > -1) {
            db.vouchers[index] = updatedVoucher;
        } else {
            db.vouchers.push(updatedVoucher);
        }
        saveDB(db);
        return { success: true, voucher: updatedVoucher };
    },

    deleteVoucher: function(id) {
        const db = getDB();
        db.vouchers = db.vouchers.filter(v => v.id !== id);
        saveDB(db);
        return true;
    },

    checkVoucher: function(code) {
        const db = getDB();
        const targetCode = String(code).trim().toUpperCase();
        const voucher = db.vouchers.find(v => String(v.code).trim().toUpperCase() === targetCode);
        
        if (!voucher) {
            return { success: false, message: 'Kode voucher tidak ditemukan!' };
        }
        if (!voucher.isActive) {
            return { success: false, message: 'Voucher sudah tidak aktif!' };
        }
        if (voucher.usageCount >= voucher.maxUsage) {
            return { success: false, message: 'Voucher sudah melebihi batas penggunaan!' };
        }
        
        return { success: true, voucher: voucher };
    },

    searchTransactions: function(query) {
        const db = getDB();
        if (!query) return [];
        const cleanQuery = query.trim().toLowerCase();
        
        return db.transactions.filter(t => 
            t.invoiceId.toLowerCase().includes(cleanQuery) || 
            t.whatsapp.includes(cleanQuery)
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getStats: function() {
        const db = getDB();
        const successTxs = db.transactions.filter(t => t.status === 'SUCCESS');
        const pendingTxs = db.transactions.filter(t => t.status === 'PENDING');
        const totalRevenue = successTxs.reduce((sum, t) => sum + t.totalAmount, 0);
        
        return {
            totalRevenue: totalRevenue,
            successCount: successTxs.length,
            pendingCount: pendingTxs.length,
            totalCount: db.transactions.length,
            gamesCount: db.games.filter(g => g.isActive).length
        };
    },

    // --- API CONFIGURATION OPERATIONS ---
    getApiConfig: function() {
        const db = getDB();
        return db.apiConfig || { apiUrl: '', apiKey: '', secretKey: '', balance: 0 };
    },

    saveApiConfig: function(config) {
        const db = getDB();
        db.apiConfig = { ...db.apiConfig, ...config };
        saveDB(db);
        return true;
    },

    getApiLogs: function() {
        const db = getDB();
        return db.apiLogs || [];
    },

    clearApiLogs: function() {
        const db = getDB();
        db.apiLogs = [];
        saveDB(db);
        return true;
    },

    // Simulasi sinkronisasi produk via API Digiflazz/Apigames
    syncThirdPartyProducts: function() {
        const db = getDB();
        
        // Produk tiruan dari API
        const newProducts = [
            { gameSlug: 'mobile-legends', name: '86 Diamonds (API)', price: 19500, isPopular: false },
            { gameSlug: 'mobile-legends', name: '172 Diamonds (API)', price: 38000, isPopular: true },
            { gameSlug: 'free-fire', name: '140 Diamonds (API)', price: 18200, isPopular: false },
            { gameSlug: 'pubg-mobile', name: '325 UC (API)', price: 65000, isPopular: true },
            { gameSlug: 'xl', name: 'Pulsa XL Rp 20.000 (API)', price: 20200, isPopular: false },
            { gameSlug: 'telkomsel', name: 'Pulsa Telkomsel Rp 20.000 (API)', price: 20100, isPopular: false },
            { gameSlug: 'google-play', name: 'Google Play Gift Card Rp 50.000 (API)', price: 51200, isPopular: false }
        ];

        let addedCount = 0;

        newProducts.forEach(item => {
            const game = db.games.find(g => g.slug === item.gameSlug);
            if (!game) return;

            // Cek apakah produk ini sudah ada berdasarkan nama dan gameId
            const productExists = db.products.some(p => p.gameId === game.id && p.name === item.name);
            if (!productExists) {
                const newProduct = {
                    id: 'p-api-' + Math.random().toString(36).substring(2, 9),
                    gameId: game.id,
                    name: item.name,
                    price: item.price,
                    originalPrice: Math.round(item.price * 1.15),
                    isPopular: item.isPopular,
                    isActive: true
                };
                db.products.push(newProduct);
                addedCount++;
            }
        });

        // Log aksi sync
        const logReq = {
            action: 'GET_PRICELIST',
            provider: db.apiConfig.providerName || 'Digiflazz Reseller SDK',
            timestamp: new Date().toISOString()
        };
        const logResp = {
            success: true,
            records_fetched: newProducts.length,
            records_imported: addedCount,
            status: 'OK'
        };
        if (!db.apiLogs) db.apiLogs = [];
        db.apiLogs.unshift({
            timestamp: new Date().toISOString(),
            action: 'SYNC_PRODUCTS_API',
            request: JSON.stringify(logReq, null, 2),
            response: JSON.stringify(logResp, null, 2)
        });

        saveDB(db);
        return addedCount;
    }
};

window.dbService = dbService;
