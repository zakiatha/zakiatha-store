// js/views/detail.js
// Game Detail View - Handles dynamic forms, nominals grid, payment calculations, and checkout modal with points integration

const detailView = {
    // Helper to get help instructions based on game slug
    getGameInstructions: function(slug) {
        switch(slug) {
            case 'mobile-legends':
                return 'Untuk mengetahui User ID Anda, silakan klik menu profil di bagian pojok kiri atas pada menu utama game. User ID akan terlihat di bawah Nickname Anda. Silakan masukkan User ID dan Zone ID Anda untuk mengisi. Contoh: 12345678 (1234).';
            case 'free-fire':
                return 'Untuk menemukan Player ID Anda, ketuk profil Anda di pojok kiri atas menu utama game. Player ID Anda terletak di bawah nama karakter Anda. Silakan masukkan Player ID Anda di sini.';
            case 'pubg-mobile':
                return 'Untuk menemukan Character ID PUBG Mobile Anda, buka profil Anda di dalam game. Karakter ID berupa deretan angka yang terletak di bagian atas profil Anda.';
            case 'valorant':
                return 'Masukkan Riot ID dan Tagline Anda. Anda dapat menemukannya di klien Riot Games atau di dalam game (arahkan kursor ke nama profil Anda). Formatnya harus berupa Username#Tagline. Contoh: Budi#ID1.';
            case 'genshin-impact':
                return 'UID dapat ditemukan di pojok kanan bawah layar game atau di menu Paimon di bawah nama profil Anda. Pastikan Anda memilih server yang benar agar Diamond masuk ke akun Anda.';
            default:
                return 'Masukkan detail akun Anda dengan benar. Proses pengisian top-up akan diproses otomatis berdasarkan data yang Anda masukkan.';
        }
    },

    // Render function
    render: function(container, params) {
        const slug = params.slug;
        const game = window.dbService.getGameBySlug(slug);
        
        if (!game) {
            container.innerHTML = `
                <div class="card-glass" style="padding: 48px; text-align: center; max-width: 500px; margin: 40px auto;">
                    <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: var(--danger); margin-bottom: 16px;"></i>
                    <h3 style="margin-bottom: 8px;">Game Tidak Ditemukan</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">Maaf, game yang Anda cari tidak terdaftar di sistem kami.</p>
                    <a href="#home" class="btn-grad">Kembali ke Home</a>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // Fetch products and payment methods from DB
        const products = window.dbService.getProducts(game.id);
        const paymentMethods = window.dbService.getPaymentMethods();
        
        // State for this view selection
        let selectedProduct = null;
        let selectedPayment = null;
        let usePoints = false;
        let activeVoucher = null;
        let voucherDiscount = 0;
        
        // Helper to recalculate voucher discount when product/payment changes
        const recalculateVoucherDiscount = () => {
            if (!activeVoucher || !selectedProduct) {
                voucherDiscount = 0;
                return;
            }
            let feeAmount = 0;
            if (selectedPayment) {
                if (selectedPayment.feeType === 'percent') {
                    feeAmount = selectedProduct.price * (selectedPayment.feeValue / 100);
                } else if (selectedPayment.feeType === 'flat') {
                    feeAmount = selectedPayment.feeValue;
                }
            }
            const baseTotal = selectedProduct.price + feeAmount;
            if (activeVoucher.type === 'percent') {
                voucherDiscount = Math.round(baseTotal * (activeVoucher.value / 100));
            } else {
                voucherDiscount = Math.min(activeVoucher.value, baseTotal);
            }
            
            const mainVoucherMsg = document.getElementById('detail-voucher-message');
            if (mainVoucherMsg && mainVoucherMsg.style.display === 'block') {
                mainVoucherMsg.textContent = `Voucher berhasil digunakan! Potongan ${window.formatRupiah(voucherDiscount)}`;
            }
        };
        
        // Render view structure
        container.innerHTML = `
            <div class="detail-layout">
                <!-- Left Column: Game Details & Help Sidebar -->
                <aside class="detail-game-sidebar">
                    <div class="card-glass detail-game-card">
                        <img src="${game.banner}" alt="${game.name}" class="detail-banner">
                        <h1 class="detail-game-title">${game.name}</h1>
                        <p class="detail-game-desc">${game.description}</p>
                        
                        <div class="help-box">
                            <h4 class="help-box-title">
                                <i data-lucide="help-circle" style="width: 16px; height: 16px; color: var(--primary);"></i>
                                <span>Petunjuk Petunjuk</span>
                            </h4>
                            <p class="help-box-content">${this.getGameInstructions(game.slug)}</p>
                        </div>
                    </div>
                </aside>
                
                <!-- Right Column: Step by Step Process -->
                <div class="detail-steps">
                    
                    <!-- Step 1: Account Fields -->
                    <div class="card-glass step-card" id="step-account">
                        <div class="step-header">
                            <div class="step-num">1</div>
                            <h2 class="step-title">Masukkan Data Akun</h2>
                        </div>
                        <div class="step-content">
                            <div id="dynamic-fields-container">
                                <!-- Dynamically generated fields -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 2: Product Nominal Grid -->
                    <div class="card-glass step-card" id="step-nominals">
                        <div class="step-header">
                            <div class="step-num">2</div>
                            <h2 class="step-title">Pilih Nominal Top-Up</h2>
                        </div>
                        <div class="step-content">
                            <div class="product-grid" id="product-grid-container">
                                <!-- Dynamically generated products -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 3: Payment Accordion -->
                    <div class="card-glass step-card" id="step-payment">
                        <div class="step-header">
                            <div class="step-num">3</div>
                            <h2 class="step-title">Pilih Metode Pembayaran</h2>
                        </div>
                        <div class="step-content">
                            <div id="payment-methods-container">
                                <p style="color: var(--text-secondary); text-align: center; padding: 20px;">Silakan pilih nominal top-up terlebih dahulu untuk melihat metode pembayaran dan harga.</p>
                            </div>
                            <div id="points-usage-container" style="display: none; margin-top: 20px;">
                                <!-- Points toggle checkbox rendered dynamically -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 4: Contact & Purchase -->
                    <div class="card-glass step-card" id="step-purchase">
                        <div class="step-header">
                            <div class="step-num">4</div>
                            <h2 class="step-title">Konfirmasi & Beli</h2>
                        </div>
                        <div class="step-content" style="display: flex; flex-direction: column; gap: 20px;">
                            <!-- Voucher Input Section -->
                            <div class="form-group" id="detail-voucher-container">
                                <label for="detail-voucher-input">Kode Voucher (Opsional)</label>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="detail-voucher-input" class="form-input" placeholder="Contoh: PROMO10" style="text-transform: uppercase;">
                                    <button id="btn-apply-voucher" class="btn-grad" style="padding: 12px 20px; margin: 0; white-space: nowrap; height: auto;">Gunakan</button>
                                </div>
                                <div id="detail-voucher-message" style="font-size: 11px; margin-top: 6px; display: none; font-weight: 600;"></div>
                            </div>

                            <div class="form-group">
                                <label for="customer-whatsapp">Nomor WhatsApp</label>
                                <input type="tel" id="customer-whatsapp" class="form-input" placeholder="Contoh: 081234567890" required>
                                <p style="font-size: 11px; color: var(--text-muted);">Invoice dan bukti pembayaran akan dikirimkan ke nomor WhatsApp ini.</p>
                            </div>
                            
                            <button id="btn-submit-order" class="btn-grad" style="width: 100%; padding: 16px;" disabled>
                                <i data-lucide="shopping-bag" style="width: 20px; height: 20px;"></i>
                                <span>Beli Sekarang</span>
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <!-- Global Checkout Modal Overlay -->
            <div id="checkout-modal" class="modal-overlay">
                <div class="card-glass modal-card">
                    <button id="btn-modal-close" class="modal-close-btn">
                        <i data-lucide="x" style="width: 24px; height: 24px;"></i>
                    </button>
                    <h3 class="modal-title gradient-text">Detail Pembelian</h3>
                    
                    <!-- Verification Loader (Simulated API Check) -->
                    <div id="modal-loader" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px 0; gap: 16px;">
                        <div style="width: 40px; height: 40px; border: 3px solid rgba(139, 92, 246, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p style="color: var(--text-secondary); font-size: 14px; font-weight: 600;">Memverifikasi Akun/Data...</p>
                    </div>
                    
                    <!-- Modal Details Content (Shown after load) -->
                    <div id="modal-content" style="display: none;">
                        <div class="modal-details" id="checkout-details-table">
                            <!-- Dynamic summary rows -->
                        </div>
                        <div class="modal-actions">
                            <button id="btn-modal-cancel" class="modal-btn-cancel">Batal</button>
                            <button id="btn-modal-confirm" class="modal-btn-confirm">Konfirmasi</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Elements references
        const fieldsContainer = document.getElementById('dynamic-fields-container');
        const productsContainer = document.getElementById('product-grid-container');
        const paymentsContainer = document.getElementById('payment-methods-container');
        const pointsContainer = document.getElementById('points-usage-container');
        const whatsappInput = document.getElementById('customer-whatsapp');
        const submitBtn = document.getElementById('btn-submit-order');
        
        const mainVoucherInput = document.getElementById('detail-voucher-input');
        const mainVoucherApplyBtn = document.getElementById('btn-apply-voucher');
        const mainVoucherMsg = document.getElementById('detail-voucher-message');
        
        // Modal references
        const modalOverlay = document.getElementById('checkout-modal');
        const modalLoader = document.getElementById('modal-loader');
        const modalContent = document.getElementById('modal-content');
        const modalTable = document.getElementById('checkout-details-table');
        const modalClose = document.getElementById('btn-modal-close');
        const modalCancel = document.getElementById('btn-modal-cancel');
        const modalConfirm = document.getElementById('btn-modal-confirm');
        
        // Apply voucher handler on main page
        mainVoucherApplyBtn.onclick = () => {
            const code = mainVoucherInput.value.trim();
            if (!code) {
                mainVoucherMsg.style.display = 'block';
                mainVoucherMsg.style.color = 'var(--danger)';
                mainVoucherMsg.textContent = 'Masukkan kode voucher terlebih dahulu!';
                return;
            }
            if (!selectedProduct) {
                mainVoucherMsg.style.display = 'block';
                mainVoucherMsg.style.color = 'var(--danger)';
                mainVoucherMsg.textContent = 'Pilih nominal top-up terlebih dahulu!';
                return;
            }
            
            const checkResult = window.dbService.checkVoucher(code);
            if (checkResult.success) {
                activeVoucher = checkResult.voucher;
                recalculateVoucherDiscount();
                mainVoucherMsg.style.display = 'block';
                mainVoucherMsg.style.color = 'var(--success)';
            } else {
                activeVoucher = null;
                voucherDiscount = 0;
                mainVoucherMsg.style.display = 'block';
                mainVoucherMsg.style.color = 'var(--danger)';
                mainVoucherMsg.textContent = checkResult.message;
            }
        };
        
        // ----------------------------------------------------
        // 1. DYNAMIC INPUT FIELDS GENERATION
        // ----------------------------------------------------
        if (game.slug === 'mobile-legends') {
            fieldsContainer.innerHTML = `
                <div class="input-grid-ml">
                    <div class="form-group">
                        <label for="input-userId">User ID</label>
                        <input type="text" id="input-userId" class="form-input game-input" placeholder="Masukkan User ID" required>
                    </div>
                    <div class="form-group">
                        <label for="input-zoneId">Zone ID</label>
                        <input type="text" id="input-zoneId" class="form-input game-input" placeholder="Zone ID" required>
                    </div>
                </div>
            `;
        } else {
            fieldsContainer.innerHTML = game.fields.map(field => {
                if (field.type === 'select') {
                    return `
                        <div class="form-group">
                            <label for="input-${field.id}">${field.label}</label>
                            <select id="input-${field.id}" class="form-input form-select game-input" required>
                                <option value="" disabled selected>Pilih ${field.label}</option>
                                ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                            </select>
                        </div>
                    `;
                } else {
                    return `
                        <div class="form-group">
                            <label for="input-${field.id}">${field.label}</label>
                            <input type="text" id="input-${field.id}" class="form-input game-input" placeholder="${field.placeholder}" required>
                        </div>
                    `;
                }
            }).join('');
        }
        
        // ----------------------------------------------------
        // 2. DYNAMIC NOMINALS GENERATION
        // ----------------------------------------------------
        if (products.length === 0) {
            productsContainer.innerHTML = `<p style="color: var(--text-secondary); padding: 20px; text-align: center;">Tidak ada produk tersedia.</p>`;
        } else {
            productsContainer.innerHTML = products.map(prod => {
                const hasDiscount = prod.originalPrice > prod.price;
                return `
                    <div class="product-card" data-id="${prod.id}">
                        ${prod.isPopular ? `<div class="product-card-badge-container"><span class="badge popular">Populer</span></div>` : ''}
                        <div class="product-card-title">${prod.name}</div>
                        <div class="product-card-price-wrapper">
                            ${hasDiscount ? `<div class="product-card-original-price">${window.formatRupiah(prod.originalPrice)}</div>` : ''}
                            <div class="product-card-price">${window.formatRupiah(prod.price)}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add click listeners to product cards
            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    
                    const prodId = card.getAttribute('data-id');
                    selectedProduct = products.find(p => p.id === prodId);
                    
                    recalculateVoucherDiscount();
                    renderPayments();
                    validateForm();
                });
            });
        }
        
        // ----------------------------------------------------
        // 3. DYNAMIC PAYMENTS ACCORDION & PRICE CALCULATION
        // ----------------------------------------------------
        const renderPayments = () => {
            if (!selectedProduct) return;

            // Check logged in user points balance
            const session = window.getSession();
            let userPoints = 0;
            if (session) {
                const userObj = window.dbService.getUserByUsername(session.username);
                userPoints = userObj ? userObj.points : 0;
            }
            
            // Render user points box if logged in
            if (session && userPoints > 0) {
                pointsContainer.style.display = 'block';
                pointsContainer.innerHTML = `
                    <div class="points-use-box">
                        <div class="points-use-left">
                            <span class="points-use-title">Gunakan Poin Belanja</span>
                            <span class="points-use-desc">Poin Anda: <strong>${userPoints.toLocaleString('id-ID')} Pts</strong> (1 Pts = Rp 1)</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="toggle-use-points" ${usePoints ? 'checked' : ''}>
                            <span class="slider-switch"></span>
                        </label>
                    </div>
                `;
                
                document.getElementById('toggle-use-points').addEventListener('change', (e) => {
                    usePoints = e.target.checked;
                    renderPayments(); // Redraw prices with points calculation
                });
            } else {
                pointsContainer.style.display = 'none';
            }
            
            // Group payment methods by type
            const groups = {
                ewallet: { name: 'E-Wallet (OVO, Dana, LinkAja, QRIS)', items: [] },
                va: { name: 'Virtual Account (Transfer VA Otomatis)', items: [] },
                retail: { name: 'Gerai Retail (Alfamart / Indomaret)', items: [] }
            };
            
            paymentMethods.forEach(pm => {
                if (groups[pm.type]) {
                    groups[pm.type].items.push(pm);
                }
            });
            
            let accordionHtml = '<div class="payment-accordion">';
            
            for (const type in groups) {
                const group = groups[type];
                if (group.items.length === 0) continue;
                
                accordionHtml += `
                    <div class="payment-group-header">
                        <span>${group.name}</span>
                    </div>
                    <div class="payment-group-content">
                `;
                
                group.items.forEach(pm => {
                    // Calculate price with fee
                    let feeAmount = 0;
                    if (pm.feeType === 'percent') {
                        feeAmount = selectedProduct.price * (pm.feeValue / 100);
                    } else if (pm.feeType === 'flat') {
                        feeAmount = pm.feeValue;
                    }
                    
                    const totalPrice = selectedProduct.price + feeAmount;
                    const discountAmount = usePoints ? Math.min(userPoints, totalPrice) : 0;
                    const finalPrice = Math.max(0, totalPrice - discountAmount);
                    
                    const isSelected = selectedPayment && selectedPayment.id === pm.id;
                    
                    accordionHtml += `
                        <div class="payment-card payment-item ${isSelected ? 'selected' : ''}" data-pm-id="${pm.id}">
                            <div class="payment-card-logo-name">
                                <div class="payment-logo-container">
                                    <span class="payment-logo-text">${pm.code}</span>
                                </div>
                                <div class="payment-details-info">
                                    <div class="payment-name">${pm.name}</div>
                                    <div class="payment-info-text">${pm.info}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div class="payment-price">${window.formatRupiah(finalPrice)}</div>
                                ${discountAmount > 0 ? `<div style="font-size:10px; color:var(--success); font-weight:700;">Potong ${discountAmount.toLocaleString('id-ID')} Pts</div>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                accordionHtml += '</div>';
            }
            
            accordionHtml += '</div>';
            paymentsContainer.innerHTML = accordionHtml;
            
            // Add click listeners to payment items
            document.querySelectorAll('.payment-item').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.payment-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    
                    const pmId = item.getAttribute('data-pm-id');
                    selectedPayment = paymentMethods.find(p => p.id === pmId);
                    
                    recalculateVoucherDiscount();
                    validateForm();
                });
            });
        };
        
        // ----------------------------------------------------
        // 4. FORM VALIDATION
        // ----------------------------------------------------
        const validateForm = () => {
            const gameInputs = document.querySelectorAll('.game-input');
            let allInputsFilled = true;
            
            gameInputs.forEach(input => {
                if (!input.value.trim()) {
                    allInputsFilled = false;
                }
            });
            
            const isWhatsappFilled = whatsappInput.value.trim().length >= 9;
            const isProductSelected = selectedProduct !== null;
            const isPaymentSelected = selectedPayment !== null;
            
            if (allInputsFilled && isWhatsappFilled && isProductSelected && isPaymentSelected) {
                submitBtn.removeAttribute('disabled');
            } else {
                submitBtn.setAttribute('disabled', 'true');
            }
        };
        
        fieldsContainer.addEventListener('input', validateForm);
        fieldsContainer.addEventListener('change', validateForm);
        whatsappInput.addEventListener('input', validateForm);
        
        // ----------------------------------------------------
        // 5. SUBMIT ORDER & CHECKOUT MODAL
        // ----------------------------------------------------
        submitBtn.addEventListener('click', () => {
            if (!selectedProduct || !selectedPayment) return;
            
            // Get session points
            const session = window.getSession();
            let userPoints = 0;
            if (session) {
                const userObj = window.dbService.getUserByUsername(session.username);
                userPoints = userObj ? userObj.points : 0;
            }

            // Collect account input details
            const accountData = {};
            game.fields.forEach(f => {
                const el = document.getElementById(`input-${f.id}`);
                if (el) {
                    accountData[f.id] = el.value.trim();
                }
            });
            
            let accountTargetStr = '';
            if (game.slug === 'mobile-legends') {
                accountTargetStr = `${accountData.userId} (${accountData.zoneId})`;
            } else if (game.slug === 'genshin-impact') {
                accountTargetStr = `${accountData.userId} [Server: ${accountData.server}]`;
            } else {
                accountTargetStr = Object.values(accountData).join(' / ');
            }
            
            // Calculate prices
            let feeAmount = 0;
            if (selectedPayment.feeType === 'percent') {
                feeAmount = selectedProduct.price * (selectedPayment.feeValue / 100);
            } else if (selectedPayment.feeType === 'flat') {
                feeAmount = selectedPayment.feeValue;
            }
            
            const baseTotal = selectedProduct.price + feeAmount;
            const pointsToUse = usePoints ? Math.min(userPoints, baseTotal) : 0;
            
            // Earn points: 1% of base price
            const pointsEarned = Math.round(selectedProduct.price * 0.01);
            
            // Open modal in LOADING state
            modalOverlay.classList.add('active');
            modalLoader.style.display = 'flex';
            modalContent.style.display = 'none';
            
            // Verification check simulator
            setTimeout(() => {
                modalLoader.style.display = 'none';
                modalContent.style.display = 'block';
                
                const firstPart = ["Gamer", "Player", "Pro", "Zaki", "Sultan", "Legends", "Fighter"];
                const secondPart = ["Topup", "Santuy", "GGWP", "Store", "MVP", "Noob", "Gacor"];
                const mockNickname = `${firstPart[Math.floor(Math.random()*firstPart.length)]}_${secondPart[Math.floor(Math.random()*secondPart.length)]}`;
                
                // Show dynamic verification detail based on Category
                let targetLabel = 'Data Target';
                if (game.category === 'pulsa') targetLabel = 'Nomor HP';
                else if (game.category === 'voucher') targetLabel = 'Email Penerima';
  
                const updateModalDisplay = () => {
                    const currentFinalTotal = Math.max(0, baseTotal - pointsToUse - voucherDiscount);
                    
                    modalTable.innerHTML = `
                        <div class="modal-details-row">
                            <div class="modal-details-label">Kategori / Item</div>
                            <div class="modal-details-val">${game.name}</div>
                        </div>
                        <div class="modal-details-row">
                            <div class="modal-details-label">${targetLabel}</div>
                            <div class="modal-details-val" style="font-family: monospace; color: var(--primary);">${accountTargetStr}</div>
                        </div>
                        ${game.category !== 'pulsa' && game.category !== 'voucher' ? `
                        <div class="modal-details-row" style="background: rgba(16, 185, 129, 0.05);">
                            <div class="modal-details-label" style="color: var(--success); font-weight:700;">Nickname Akun</div>
                            <div class="modal-details-val" style="color: var(--success); font-weight:700;">${mockNickname} (Verified)</div>
                        </div>` : ''}
                        <div class="modal-details-row">
                            <div class="modal-details-label">Produk</div>
                            <div class="modal-details-val">${selectedProduct.name}</div>
                        </div>
                        <div class="modal-details-row">
                            <div class="modal-details-label">Harga</div>
                            <div class="modal-details-val">${window.formatRupiah(selectedProduct.price)}</div>
                        </div>
                        <div class="modal-details-row">
                            <div class="modal-details-label">Biaya Admin</div>
                            <div class="modal-details-val">${window.formatRupiah(feeAmount)}</div>
                        </div>
                        ${pointsToUse > 0 ? `
                        <div class="modal-details-row" style="color: var(--success); background: rgba(16, 185, 129, 0.03);">
                            <div class="modal-details-label">Potongan Poin</div>
                            <div class="modal-details-val">- ${window.formatRupiah(pointsToUse)}</div>
                        </div>` : ''}
                        ${activeVoucher ? `
                        <div class="modal-details-row" style="color: var(--success); background: rgba(16, 185, 129, 0.05);">
                            <div class="modal-details-label">Voucher (${activeVoucher.code})</div>
                            <div class="modal-details-val">- ${window.formatRupiah(voucherDiscount)}</div>
                        </div>` : ''}
                        <div class="modal-details-row modal-details-total">
                            <div class="modal-details-label" style="color: var(--secondary);">Total Bayar</div>
                            <div class="modal-details-val">${window.formatRupiah(currentFinalTotal)}</div>
                        </div>
                        ${session ? `
                        <div class="modal-details-row" style="background: rgba(6, 182, 212, 0.05);">
                            <div class="modal-details-label" style="color: var(--secondary); font-weight:700;">Cashback Didapat</div>
                            <div class="modal-details-val" style="color: var(--secondary); font-weight:700;">+ ${pointsEarned.toLocaleString('id-ID')} Pts (1%)</div>
                        </div>` : ''}
                    `;
                };

                // Populate checkout table initial
                updateModalDisplay();
                
                // Add voucher section to modal if not already present
                let voucherSection = modalContent.querySelector('.modal-voucher-box');
                if (!voucherSection) {
                    voucherSection = document.createElement('div');
                    voucherSection.className = 'modal-voucher-box';
                    voucherSection.style.marginTop = '16px';
                    voucherSection.style.padding = '12px';
                    voucherSection.style.border = '1px solid var(--border-color)';
                    voucherSection.style.borderRadius = 'var(--radius-md)';
                    voucherSection.style.background = 'rgba(255, 255, 255, 0.02)';
                    
                    // Insert before the button container
                    const btnContainer = modalContent.querySelector('.modal-actions');
                    modalContent.insertBefore(voucherSection, btnContainer);
                }

                voucherSection.innerHTML = `
                    <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">Punya Kode Voucher?</div>
                    <div style="display: flex; gap: 8px;">
                        <input type="text" id="modal-voucher-input" class="form-input" placeholder="Masukkan kode voucher" style="padding: 8px 12px; font-size: 13px; text-transform: uppercase; border-color: rgba(139, 92, 246, 0.3);">
                        <button id="modal-voucher-apply-btn" class="btn-grad" style="padding: 8px 16px; font-size: 13px; margin: 0; white-space: nowrap; height: auto;">Pakai</button>
                    </div>
                    <div id="modal-voucher-message" style="font-size: 11px; margin-top: 6px; display: none; font-weight: 600;"></div>
                `;

                const voucherInput = document.getElementById('modal-voucher-input');
                const voucherApplyBtn = document.getElementById('modal-voucher-apply-btn');
                const voucherMsg = document.getElementById('modal-voucher-message');

                // Pre-fill if voucher is already applied on main page
                if (activeVoucher) {
                    voucherInput.value = activeVoucher.code;
                    voucherMsg.style.display = 'block';
                    voucherMsg.style.color = 'var(--success)';
                    voucherMsg.textContent = `Voucher berhasil digunakan! Potongan ${window.formatRupiah(voucherDiscount)}`;
                }

                voucherApplyBtn.onclick = () => {
                    const code = voucherInput.value.trim();
                    if (!code) {
                        voucherMsg.style.display = 'block';
                        voucherMsg.style.color = 'var(--danger)';
                        voucherMsg.textContent = 'Masukkan kode voucher terlebih dahulu!';
                        return;
                    }

                    const checkResult = window.dbService.checkVoucher(code);
                    if (checkResult.success) {
                        activeVoucher = checkResult.voucher;
                        recalculateVoucherDiscount();
                        
                        voucherMsg.style.display = 'block';
                        voucherMsg.style.color = 'var(--success)';
                        voucherMsg.textContent = `Voucher berhasil digunakan! Potongan ${window.formatRupiah(voucherDiscount)}`;
                        
                        // Sync back to main page input
                        if (mainVoucherInput) {
                            mainVoucherInput.value = activeVoucher.code;
                        }
                        if (mainVoucherMsg) {
                            mainVoucherMsg.style.display = 'block';
                            mainVoucherMsg.style.color = 'var(--success)';
                            mainVoucherMsg.textContent = `Voucher berhasil digunakan! Potongan ${window.formatRupiah(voucherDiscount)}`;
                        }
                        
                        updateModalDisplay();
                    } else {
                        activeVoucher = null;
                        voucherDiscount = 0;
                        voucherMsg.style.display = 'block';
                        voucherMsg.style.color = 'var(--danger)';
                        voucherMsg.textContent = checkResult.message;
                        
                        // Sync back to main page input
                        if (mainVoucherInput) {
                            mainVoucherInput.value = '';
                        }
                        if (mainVoucherMsg) {
                            mainVoucherMsg.style.display = 'none';
                        }
                        
                        updateModalDisplay();
                    }
                };

                // Confirm action
                modalConfirm.onclick = () => {
                    const currentFinalTotal = Math.max(0, baseTotal - pointsToUse - voucherDiscount);
                    
                    // Increment voucher usage in DB
                    if (activeVoucher) {
                        activeVoucher.usageCount += 1;
                        window.dbService.saveVoucher(activeVoucher);
                    }

                    const tx = window.dbService.createTransaction({
                        gameId: game.id,
                        gameName: game.name,
                        accountData: accountData,
                        productId: selectedProduct.id,
                        productName: selectedProduct.name,
                        basePrice: selectedProduct.price,
                        adminFee: feeAmount,
                        totalAmount: currentFinalTotal,
                        pointsUsed: pointsToUse,
                        pointsEarned: pointsEarned,
                        voucherCode: activeVoucher ? activeVoucher.code : null,
                        discountAmount: voucherDiscount,
                        username: session ? session.username : null,
                        paymentMethodId: selectedPayment.id,
                        paymentMethodName: selectedPayment.name,
                        paymentMethodCode: selectedPayment.code,
                        paymentMethodType: selectedPayment.type,
                        whatsapp: whatsappInput.value.trim()
                    });
                    
                    modalOverlay.classList.remove('active');
                    window.location.hash = `#invoice/${tx.invoiceId}`;
                };
                
            }, 1200);
        });
        
        const closeModal = () => {
            modalOverlay.classList.remove('active');
        };
        modalClose.addEventListener('click', closeModal);
        modalCancel.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

window.detailView = detailView;
