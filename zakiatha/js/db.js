// js/db.js
// Database service for the game top-up store using localStorage

const DB_KEY = 'topup_store_db';

// Helper: Get database from localStorage
function getDB() {
    let db = localStorage.getItem(DB_KEY);
    if (!db) {
        db = initDefaultDB();
    } else {
        db = JSON.parse(db);
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
                logo: 'mobile-legends.svg',
                banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
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
                logo: 'free-fire.svg',
                banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
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
                logo: 'pubg-mobile.svg',
                banner: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=600&auto=format&fit=crop',
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
                logo: 'genshin-impact.svg',
                banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
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
                logo: 'valorant.svg',
                banner: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop',
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
                logo: 'steam.svg',
                banner: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=600&auto=format&fit=crop',
                description: 'Beli Steam Wallet Code Rupiah instan untuk mengisi saldo akun Steam Anda. Masukkan Username akun Steam Anda (hanya untuk verifikasi) dan pilih nominal voucher.',
                fields: [
                    { id: 'userId', label: 'Username Steam', placeholder: 'Masukkan Username Steam', type: 'text', required: true }
                ],
                isActive: true
            },
            // --- KATEGORI ISI PULSA ---
            {
                id: 'g-xl',
                name: 'Pulsa XL Axiata',
                slug: 'xl',
                category: 'pulsa',
                logo: 'xl.svg',
                banner: 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=600&auto=format&fit=crop',
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
                logo: 'axis.svg',
                banner: 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=600&auto=format&fit=crop',
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
                logo: 'byu.svg',
                banner: 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=600&auto=format&fit=crop',
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
                logo: 'telkomsel.svg',
                banner: 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=600&auto=format&fit=crop',
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
                logo: 'smartfren.svg',
                banner: 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=600&auto=format&fit=crop',
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
                logo: 'indosat.svg',
                banner: 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=600&auto=format&fit=crop',
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
                logo: 'googleplay.svg',
                banner: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop',
                description: 'Beli Google Play Gift Card instan. Kode voucher Google Play akan dikirimkan langsung ke email Anda.',
                fields: [
                    { id: 'email', label: 'Alamat Email Penerima', placeholder: 'Contoh: budi@gmail.com', type: 'text', required: true }
                ],
                isActive: true
            }
        ],
        products: [
            // Mobile Legends
            { id: 'p-ml-5', gameId: 'g-mlbb', name: '5 Diamonds', price: 1500, originalPrice: 2000, isPopular: false, isActive: true },
            { id: 'p-ml-12', gameId: 'g-mlbb', name: '12 Diamonds', price: 3500, originalPrice: 4000, isPopular: false, isActive: true },
            { id: 'p-ml-50', gameId: 'g-mlbb', name: '50 Diamonds', price: 14000, originalPrice: 16000, isPopular: false, isActive: true },
            { id: 'p-ml-86', gameId: 'g-mlbb', name: '86 Diamonds', price: 20000, originalPrice: 24000, isPopular: false, isActive: true },
            { id: 'p-ml-wdp', gameId: 'g-mlbb', name: 'Weekly Diamond Pass', price: 28000, originalPrice: 32000, isPopular: true, isActive: true },
            { id: 'p-ml-257', gameId: 'g-mlbb', name: '257 Diamonds (234 + 23 Bonus)', price: 60000, originalPrice: 70000, isPopular: false, isActive: true },
            { id: 'p-ml-706', gameId: 'g-mlbb', name: '706 Diamonds (625 + 81 Bonus)', price: 165000, originalPrice: 180000, isPopular: true, isActive: true },
            
            // Free Fire
            { id: 'p-ff-5', gameId: 'g-ff', name: '5 Diamonds', price: 1000, originalPrice: 1500, isPopular: false, isActive: true },
            { id: 'p-ff-12', gameId: 'g-ff', name: '12 Diamonds', price: 2000, originalPrice: 2500, isPopular: false, isActive: true },
            { id: 'p-ff-50', gameId: 'g-ff', name: '50 Diamonds', price: 7000, originalPrice: 9000, isPopular: false, isActive: true },
            { id: 'p-ff-70', gameId: 'g-ff', name: '70 Diamonds', price: 10000, originalPrice: 12000, isPopular: false, isActive: true },
            { id: 'p-ff-140', gameId: 'g-ff', name: '140 Diamonds', price: 19000, originalPrice: 22000, isPopular: false, isActive: true },
            { id: 'p-ff-355', gameId: 'g-ff', name: '355 Diamonds', price: 47000, originalPrice: 55000, isPopular: true, isActive: true },
            { id: 'p-ff-720', gameId: 'g-ff', name: '720 Diamonds', price: 95000, originalPrice: 110000, isPopular: true, isActive: true },

            // PUBG Mobile
            { id: 'p-pubg-60', gameId: 'g-pubg', name: '60 UC', price: 14000, originalPrice: 16000, isPopular: false, isActive: true },
            { id: 'p-pubg-325', gameId: 'g-pubg', name: '325 UC', price: 69000, originalPrice: 79000, isPopular: true, isActive: true },
            { id: 'p-pubg-660', gameId: 'g-pubg', name: '660 UC', price: 139000, originalPrice: 155000, isPopular: false, isActive: true },
            { id: 'p-pubg-1800', gameId: 'g-pubg', name: '1800 UC', price: 349000, originalPrice: 399000, isPopular: true, isActive: true },

            // Valorant
            { id: 'p-val-125', gameId: 'g-valorant', name: '125 Points', price: 15000, originalPrice: 18000, isPopular: false, isActive: true },
            { id: 'p-val-375', gameId: 'g-valorant', name: '375 Points', price: 45000, originalPrice: 50000, isPopular: false, isActive: true },
            { id: 'p-val-700', gameId: 'g-valorant', name: '700 Points', price: 79000, originalPrice: 85000, isPopular: false, isActive: true },
            { id: 'p-val-1375', gameId: 'g-valorant', name: '1375 Points', price: 149000, originalPrice: 165000, isPopular: true, isActive: true },
            { id: 'p-val-2400', gameId: 'g-valorant', name: '2400 Points', price: 249000, originalPrice: 280000, isPopular: true, isActive: true },

            // Genshin Impact
            { id: 'p-gen-60', gameId: 'g-genshin', name: '60 Genesis Crystals', price: 15000, originalPrice: 16500, isPopular: false, isActive: true },
            { id: 'p-gen-300', gameId: 'g-genshin', name: '300 Crystals', price: 75000, originalPrice: 79000, isPopular: false, isActive: true },
            { id: 'p-gen-welkin', gameId: 'g-genshin', name: 'Blessing of the Welkin Moon', price: 79000, originalPrice: 89000, isPopular: true, isActive: true },
            { id: 'p-gen-980', gameId: 'g-genshin', name: '980 Genesis Crystals', price: 220000, originalPrice: 249000, isPopular: false, isActive: true },
            { id: 'p-gen-1980', gameId: 'g-genshin', name: '1980 Genesis Crystals', price: 439000, originalPrice: 489000, isPopular: true, isActive: true },

            // Steam Wallet
            { id: 'p-steam-12', gameId: 'g-steam', name: 'Steam Wallet IDR 12.000', price: 15000, originalPrice: 16000, isPopular: false, isActive: true },
            { id: 'p-steam-45', gameId: 'g-steam', name: 'Steam Wallet IDR 45.000', price: 52000, originalPrice: 56000, isPopular: false, isActive: true },
            { id: 'p-steam-60', gameId: 'g-steam', name: 'Steam Wallet IDR 60.000', price: 69000, originalPrice: 75000, isPopular: true, isActive: true },
            { id: 'p-steam-120', gameId: 'g-steam', name: 'Steam Wallet IDR 120.000', price: 135000, originalPrice: 145000, isPopular: true, isActive: true },

            // Pulsa Nominals (XL, Axis, By.U, Telkomsel, Smartfren, Indosat share these nominal prices)
            // XL
            { id: 'p-xl-5', gameId: 'g-xl', name: 'Pulsa XL Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true },
            { id: 'p-xl-10', gameId: 'g-xl', name: 'Pulsa XL Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true },
            { id: 'p-xl-25', gameId: 'g-xl', name: 'Pulsa XL Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true },
            { id: 'p-xl-50', gameId: 'g-xl', name: 'Pulsa XL Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true },
            { id: 'p-xl-100', gameId: 'g-xl', name: 'Pulsa XL Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true },

            // Axis
            { id: 'p-ax-5', gameId: 'g-axis', name: 'Pulsa Axis Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true },
            { id: 'p-ax-10', gameId: 'g-axis', name: 'Pulsa Axis Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true },
            { id: 'p-ax-25', gameId: 'g-axis', name: 'Pulsa Axis Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true },
            { id: 'p-ax-50', gameId: 'g-axis', name: 'Pulsa Axis Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true },
            { id: 'p-ax-100', gameId: 'g-axis', name: 'Pulsa Axis Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true },

            // By.U
            { id: 'p-byu-5', gameId: 'g-byu', name: 'Pulsa by.U Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true },
            { id: 'p-byu-10', gameId: 'g-byu', name: 'Pulsa by.U Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true },
            { id: 'p-byu-25', gameId: 'g-byu', name: 'Pulsa by.U Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true },
            { id: 'p-byu-50', gameId: 'g-byu', name: 'Pulsa by.U Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true },
            { id: 'p-byu-100', gameId: 'g-byu', name: 'Pulsa by.U Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true },

            // Telkomsel
            { id: 'p-ts-5', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true },
            { id: 'p-ts-10', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true },
            { id: 'p-ts-25', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true },
            { id: 'p-ts-50', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true },
            { id: 'p-ts-100', gameId: 'g-telkomsel', name: 'Pulsa Telkomsel Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true },

            // Smartfren
            { id: 'p-sf-5', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true },
            { id: 'p-sf-10', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true },
            { id: 'p-sf-25', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true },
            { id: 'p-sf-50', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true },
            { id: 'p-sf-100', gameId: 'g-smartfren', name: 'Pulsa Smartfren Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true },

            // Indosat
            { id: 'p-ind-5', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 5.000', price: 6000, originalPrice: 7000, isPopular: false, isActive: true },
            { id: 'p-ind-10', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 10.000', price: 11200, originalPrice: 12000, isPopular: false, isActive: true },
            { id: 'p-ind-25', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 25.000', price: 26000, originalPrice: 27000, isPopular: true, isActive: true },
            { id: 'p-ind-50', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 50.000', price: 50800, originalPrice: 52000, isPopular: false, isActive: true },
            { id: 'p-ind-100', gameId: 'g-indosat', name: 'Pulsa Indosat Rp 100.000', price: 99500, originalPrice: 102000, isPopular: true, isActive: true },

            // Google Play Voucher
            { id: 'p-gp-20', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 20.000', price: 22000, originalPrice: 25000, isPopular: false, isActive: true },
            { id: 'p-gp-50', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 50.000', price: 53500, originalPrice: 59000, isPopular: false, isActive: true },
            { id: 'p-gp-100', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 100.000', price: 105000, originalPrice: 115000, isPopular: true, isActive: true },
            { id: 'p-gp-200', gameId: 'g-googleplay', name: 'Google Play Gift Card Rp 200.000', price: 208000, originalPrice: 220000, isPopular: true, isActive: true }
        ],
        paymentMethods: [
            { id: 'pm-qris', name: 'QRIS', code: 'QRIS', type: 'qris', feeType: 'percent', feeValue: 0, isActive: true, info: 'Bayar instan via GoPay, Dana, OVO, LinkAja, ShopeePay' },
            { id: 'pm-dana', name: 'DANA', code: 'DANA', type: 'ewallet', feeType: 'percent', feeValue: 1.5, isActive: true, info: 'Biaya admin 1.5%' },
            { id: 'pm-ovo', name: 'OVO', code: 'OVO', type: 'ewallet', feeType: 'percent', feeValue: 1.5, isActive: true, info: 'Biaya admin 1.5%' },
            { id: 'pm-shopeepay', name: 'ShopeePay', code: 'SHOPEEPAY', type: 'ewallet', feeType: 'percent', feeValue: 2.0, isActive: true, info: 'Biaya admin 2%' },
            { id: 'pm-bca', name: 'BCA Virtual Account', code: 'BCA_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-mandiri', name: 'Mandiri Virtual Account', code: 'MANDIRI_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis 24 jam' },
            { id: 'pm-bni', name: 'BNI Virtual Account', code: 'BNI_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis' },
            { id: 'pm-bri', name: 'BRI Virtual Account', code: 'BRI_VA', type: 'va', feeType: 'flat', feeValue: 3000, isActive: true, info: 'Dicek otomatis' },
            { id: 'pm-alfa', name: 'Alfamart', code: 'ALFAMART', type: 'retail', feeType: 'flat', feeValue: 2500, isActive: true, info: 'Bayar di kasir Alfamart terdekat' },
            { id: 'pm-indomaret', name: 'Indomaret', code: 'INDOMARET', type: 'retail', feeType: 'flat', feeValue: 2500, isActive: true, info: 'Bayar di kasir Indomaret terdekat' }
        ],
        transactions: [],
        apiConfig: {
            apiUrl: 'https://api.reseller-topup.com/v1',
            apiKey: 'ZAKI_TRX_9281',
            secretKey: 'd3v_s3cr3t_2026',
            balance: 7500000,
            providerName: 'Digiflazz Reseller SDK'
        },
        apiLogs: []
    };
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
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
        const index = db.games.findIndex(g => g.id === gameData.id);
        
        if (index > -1) {
            db.games[index] = { ...db.games[index], ...gameData };
        } else {
            const newGame = {
                id: 'g-' + Math.random().toString(36).substring(2, 9),
                isActive: true,
                ...gameData
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
        const index = db.products.findIndex(p => p.id === productData.id);
        
        if (index > -1) {
            db.products[index] = { ...db.products[index], ...productData };
        } else {
            const newProduct = {
                id: 'p-' + Math.random().toString(36).substring(2, 9),
                isActive: true,
                isPopular: false,
                originalPrice: productData.price * 1.15,
                ...productData
            };
            db.products.push(newProduct);
        }
        saveDB(db);
        return true;
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
            totalAmount: txData.totalAmount, // Ini total tagihan setelah dikurangi poin (jika ada)
            pointsUsed: txData.pointsUsed || 0,
            pointsEarned: txData.pointsEarned || 0,
            username: txData.username || null, // Catat user pembeli (null jika guest)
            paymentMethodId: txData.paymentMethodId,
            paymentMethodName: txData.paymentMethodName,
            paymentMethodCode: txData.paymentMethodCode,
            paymentMethodType: txData.paymentMethodType,
            whatsapp: txData.whatsapp,
            status: 'PENDING',
            createdAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
        };

        // Jika transaksi menggunakan poin, potong poin langsung dari user saat ini
        if (newTx.username && newTx.pointsUsed > 0) {
            const userIndex = db.users.findIndex(u => u.username.toLowerCase() === newTx.username.toLowerCase());
            if (userIndex > -1) {
                db.users[userIndex].points = Math.max(0, db.users[userIndex].points - newTx.pointsUsed);
            }
        }

        // Tulis log API Outgoing untuk simulasi koneksi 3rd party
        const logReq = {
            api_key: db.apiConfig.apiKey,
            ref_id: invoiceId,
            buyer_phone: txData.whatsapp,
            game_code: txData.gameId,
            product_code: txData.productId,
            account_data: txData.accountData,
            timestamp: now.toISOString()
        };
        const logResp = {
            status: 'RECEIVED',
            message: 'Transaction successfully queued on provider server.',
            provider_ref_id: '3RD-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            balance_remaining: db.apiConfig.balance - txData.basePrice
        };
        
        // Simpan log API
        if (!db.apiLogs) db.apiLogs = [];
        db.apiLogs.unshift({
            timestamp: now.toISOString(),
            action: `CREATE_TRX_OUTGOING`,
            request: JSON.stringify(logReq, null, 2),
            response: JSON.stringify(logResp, null, 2)
        });

        // Potong saldo API Provider (sebagai simulasi admin)
        db.apiConfig.balance = Math.max(0, db.apiConfig.balance - txData.basePrice);

        db.transactions.push(newTx);
        saveDB(db);
        return newTx;
    },

    updateTransactionStatus: function(id, status) {
        const db = getDB();
        const index = db.transactions.findIndex(t => t.id === id || t.invoiceId === id);
        
        if (index > -1) {
            const tx = db.transactions[index];
            const oldStatus = tx.status;
            tx.status = status;

            // Log callback webhook dari API 3rd party
            const logReq = {
                callback_token: 'secure_webhook_token_abc123',
                invoice_id: tx.invoiceId,
                status: status,
                updated_at: new Date().toISOString()
            };
            const logResp = {
                success: true,
                message: 'Callback received and transaction updated successfully.'
            };
            if (!db.apiLogs) db.apiLogs = [];
            db.apiLogs.unshift({
                timestamp: new Date().toISOString(),
                action: `CALLBACK_INCOMING_${status}`,
                request: JSON.stringify(logReq, null, 2),
                response: JSON.stringify(logResp, null, 2)
            });

            // LOGIKA POIN:
            // 1. Jika status berubah dari PENDING -> SUCCESS
            if (oldStatus === 'PENDING' && status === 'SUCCESS') {
                if (tx.username) {
                    const userIndex = db.users.findIndex(u => u.username.toLowerCase() === tx.username.toLowerCase());
                    if (userIndex > -1) {
                        // Tambahkan poin reward 5%
                        db.users[userIndex].points += tx.pointsEarned;
                    }
                }
            }
            // 2. Jika status berubah dari PENDING -> FAILED (Refund poin yang sudah dipotong)
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
            }

            saveDB(db);
            return tx;
        }
        return null;
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
