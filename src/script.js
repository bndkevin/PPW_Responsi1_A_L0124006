// Nama : BENEDHICTUS KEVIN DONI BRILLIAN EVEREST
// NIM  : L0124006

// =============================================
// KAKEV COMPANY - INTERACTIVE WEBSITE
// =============================================

const EMAILJS_SERVICE_ID = 'service_a3rbpsm';
const EMAILJS_TEMPLATE_ORDER = 'template_9tm9gm9';
const EMAILJS_TEMPLATE_RESERVASI = 'template_lw980c2';
const EMAILJS_PUBLIC_KEY = 'Q6X5UlyTsy3FPO0BG';

let cachedData = {
  branches: [],
  menu: [],
  selectedBranch: null,
  currentFilter: 'all'
};

$(document).ready(function() {
  // Initialize EmailJS - GANTI DENGAN PUBLIC KEY ANDA DARI EMAILJS
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized with public key:', EMAILJS_PUBLIC_KEY);
  
  // Load data from JSON
  loadApplicationData();
  initializeThemeToggle();
});

// =============================================
// 1. LOAD APPLICATION DATA (AJAX)
// =============================================
const DATA_API_URL = 'https://raw.githubusercontent.com/bndkevin/PPW_Responsi1_A_L0124006/main/src/data.json';

function loadApplicationData() {
  $.ajax({
    url: DATA_API_URL,
    method: 'GET',
    dataType: 'json',
    success: function(data) {
      cachedData.branches = data.branches;
      cachedData.menu = data.menu;
      
      // Initialize branch selector
      initializeBranchSelector();
      
      // Load menu items
      loadMenuItems(cachedData.menu);
      
      // Populate order form menu options
      populateOrderForm();
    },
    error: function(xhr, status, error) {
      console.error('Error loading data from API:', error);
      showErrorNotification('Gagal memuat data aplikasi dari API');
    }
  });
}

// =============================================
// 2. BRANCH SELECTOR FUNCTIONALITY
// =============================================
function initializeBranchSelector() {
  const branchList = $('#branchList');
  branchList.empty();
  
  cachedData.branches.forEach(branch => {
    const branchCard = `
      <div class="branch-card" data-branch-id="${branch.id}">
        <div class="branch-card__icon">${branch.image}</div>
        <h3 class="branch-card__name">${branch.name}</h3>
        <p class="branch-card__location">${branch.location}</p>
        <p class="branch-card__details">📞 ${branch.phone}</p>
        <p class="branch-card__details">📧 ${branch.email}</p>
        <div class="branch-card__hours">${branch.hours}</div>
      </div>
    `;
    branchList.append(branchCard);
  });
  
  // Handle branch selection
  $('.branch-card').on('click', function() {
    const branchId = $(this).data('branch-id');
    selectBranch(branchId);
  });
}

function selectBranch(branchId) {
  const branch = cachedData.branches.find(b => b.id === branchId);
  
  if (branch) {
    cachedData.selectedBranch = branch;
    
    // Update navbar
    $('#selectedBranchName').text(branch.name.split(' ')[0] + ' Jakarta');
    
    // Hide modal with animation
    $('#branchModal').fadeOut(300, function() {
      $(this).css('display', 'none');
    });
    
    // Show success notification
    showSuccessNotification(`Anda memilih cabang: ${branch.name}`);
    
    // Smooth scroll to hero
    setTimeout(() => {
      $('html, body').animate({ scrollTop: 0 }, 800);
    }, 300);
  }
}

function initializeThemeToggle() {
  const themeBtn = $('#themeToggleBtn');
  const savedTheme = localStorage.getItem('kakev-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  themeBtn.on('click', function() {
    const nextTheme = $('html').hasClass('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

function applyTheme(themeName) {
  if (themeName === 'dark') {
    $('html').addClass('dark-mode');
    $('#themeToggleBtn').text('☀️').attr('title', 'Ubah ke mode Terang');
  } else {
    $('html').removeClass('dark-mode');
    $('#themeToggleBtn').text('🌙').attr('title', 'Ubah ke mode Gelap');
  }

  localStorage.setItem('kakev-theme', themeName);
}

// Change branch button
$('#changeBranchBtn').on('click', function(e) {
  e.preventDefault();
  $('#branchModal').fadeIn(300);
});

// =============================================
// 3. MENU LOADING AND FILTERING (AJAX)
// =============================================
function loadMenuItems(items) {
  displayMenuItems(items);
}

function displayMenuItems(items) {
  const menuGrid = $('#menuGrid');
  menuGrid.empty();
  
  if (items.length === 0) {
    menuGrid.html('<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Menu tidak tersedia</p>');
    return;
  }
  
  items.forEach(item => {
    const badgeClass = item.badge === 'Terlaris' ? 'badge--hot' : 
                       item.badge === 'Baru' ? 'badge--new' : 'badge--cold';
    
    const menuCard = `
      <div class="menu-card" data-menu-id="${item.id}" data-category="${item.category}">
        <div class="menu-card__image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="menu-card__content">
          <div class="menu-card__meta">
            <span class="menu-card__category">${item.category}</span>
            <span class="badge ${badgeClass}">${item.badge}</span>
          </div>
          <h3 class="menu-card__name">${item.name}</h3>
          <p class="menu-card__desc">${item.description}</p>
        </div>
        <div class="menu-card__footer">
          <span class="menu-card__price">Rp ${item.price.toLocaleString('id-ID')}</span>
          <button class="menu-card__action">Pesan</button>
        </div>
      </div>
    `;
    menuGrid.append(menuCard);
  });
  
  // Add click event to menu cards
  attachMenuCardEvents();
}

function attachMenuCardEvents() {
  $('.menu-card').on('click', function() {
    const menuId = $(this).data('menu-id');
    const item = cachedData.menu.find(m => m.id === menuId);
    
    if (item) {
      showMenuModal(item);
    }
  });
}

// Filter functionality
$('.filter-btn').on('click', function() {
  $('.filter-btn').removeClass('active');
  $(this).addClass('active');
  
  const filter = $(this).data('filter');
  cachedData.currentFilter = filter;
  
  let filtered = cachedData.menu;
  if (filter !== 'all') {
    filtered = cachedData.menu.filter(item => item.category === filter);
  }
  
  displayMenuItems(filtered);
});

// =============================================
// 4. MENU MODAL (DOM MANIPULATION)
// =============================================
function showMenuModal(item) {
  const modalHtml = `
    <div class="modal-overlay">
      <div class="modal-content">
        <button type="button" class="modal-close">&times;</button>
        <div class="modal-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <h2 class="modal-title">${item.name}</h2>
        <p class="modal-desc">${item.description}</p>
        <div class="modal-price">Rp ${item.price.toLocaleString('id-ID')}</div>
        <button class="modal-order-btn" data-menu-id="${item.id}" data-menu-name="${item.name}">
          Tambah ke Pesanan
        </button>
      </div>
    </div>
  `;
  
  $('body').append(modalHtml);
  
  // Animate modal
  $('.modal-overlay').fadeIn(300);
  
  // Close modal
  $('.modal-close, .modal-overlay').on('click', function(e) {
    if (e.target === this) {
      $('.modal-overlay').fadeOut(300, function() {
        $(this).remove();
      });
    }
  });
  
  // Add to order button
  $('.modal-order-btn').on('click', function() {
    const menuName = $(this).data('menu-name');
    $('#orderMenu').val(menuName);
    showSuccessNotification(`${menuName} ditambahkan ke pesanan`);
    
    $('.modal-overlay').fadeOut(300, function() {
      $(this).remove();
    });
    
    // Smooth scroll to order form
    $('html, body').animate({
      scrollTop: $('#pesan').offset().top - 100
    }, 800);
  });
}

// =============================================
// 5. POPULATE ORDER FORM
// =============================================
function populateOrderForm() {
  const orderMenu = $('#orderMenu');
  orderMenu.empty();
  orderMenu.append('<option value="">-- Pilih Menu --</option>');
  
  cachedData.menu.forEach(item => {
    orderMenu.append(`<option value="${item.name}">${item.name} - Rp ${item.price.toLocaleString('id-ID')}</option>`);
  });
}

// =============================================
// 6. FORM VALIDATION FUNCTIONS
// =============================================
function validateForm(formType) {
  const isValid = {
    order: validateOrderForm(),
    reservasi: validateReservasiForm()
  };
  
  return isValid[formType] || false;
}

function validateOrderForm() {
  const form = $('#orderForm');
  let isValid = true;
  
  // Reset error states
  form.find('input, select, textarea').removeClass('input-error');
  
  // Validate fields
  if (!form.find('input[name="nama"]').val().trim()) {
    form.find('input[name="nama"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('input[name="email"]').val().trim() || !isValidEmail(form.find('input[name="email"]').val())) {
    form.find('input[name="email"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('select[name="menu"]').val()) {
    form.find('select[name="menu"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('input[name="jumlah"]').val() || parseInt(form.find('input[name="jumlah"]').val()) < 1) {
    form.find('input[name="jumlah"]').addClass('input-error');
    isValid = false;
  }
  
  return isValid;
}

function validateReservasiForm() {
  const form = $('#reservasiForm');
  let isValid = true;
  
  // Reset error states
  form.find('input, select, textarea').removeClass('input-error');
  
  // Validate fields
  if (!form.find('input[name="nama"]').val().trim()) {
    form.find('input[name="nama"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('input[name="email"]').val().trim() || !isValidEmail(form.find('input[name="email"]').val())) {
    form.find('input[name="email"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('input[name="phone"]').val().trim()) {
    form.find('input[name="phone"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('input[name="tanggal"]').val()) {
    form.find('input[name="tanggal"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('input[name="jam"]').val()) {
    form.find('input[name="jam"]').addClass('input-error');
    isValid = false;
  }
  
  if (!form.find('select[name="jumlahOrang"]').val()) {
    form.find('select[name="jumlahOrang"]').addClass('input-error');
    isValid = false;
  }
  
  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// =============================================
// 7. FORM SUBMISSION (AJAX)
// =============================================
$('#orderForm').on('submit', function(e) {
  e.preventDefault();
  
  if (!validateOrderForm()) {
    showErrorNotification('Harap isi semua field dengan benar');
    return;
  }
  
  if (!cachedData.selectedBranch) {
    showErrorNotification('Harap pilih cabang terlebih dahulu');
    return;
  }
  
  const form = $(this);

  // Prepare data
  const formData = {
    nama: form.find('input[name="nama"]').val(),
    email: form.find('input[name="email"]').val(),
    menu: form.find('select[name="menu"]').val(),
    jumlah: parseInt(form.find('input[name="jumlah"]').val()),
    tipe: form.find('select[name="tipe"]').val(),
    catatan: form.find('textarea[name="catatan"]').val(),
    cabang: cachedData.selectedBranch.name,
    timestamp: new Date().toLocaleString('id-ID')
  };
  
  // Show loading state
  const btn = $(this).find('button[type="submit"]');
  const originalText = btn.text();
  btn.text('Mengirim...').prop('disabled', true);
  
  // Prepare email data
  const emailData = {
    to_email: 'anthoniajayani@gmail.com',
    from_name: formData.nama,
    customer_name: formData.nama,
    customer_email: formData.email,
    name: formData.nama,
    email: formData.email,
    reply_to: formData.email,
    order_item: formData.menu,
    order_quantity: formData.jumlah,
    order_type: formData.tipe,
    special_notes: formData.catatan || 'Tidak ada catatan khusus',
    branch_name: formData.cabang,
    timestamp: formData.timestamp
  };
  
  // Send email using EmailJS (Order Template)
  console.log('Sending order email via EmailJS', EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ORDER, emailData);
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ORDER, emailData)
    .then(function(response) {
      console.log('Order email sent successfully:', response);
      const statusDiv = $('#orderStatus');
      statusDiv.removeClass('error').addClass('success');
      statusDiv.html(`
        ✓ Pesanan berhasil dikirim!<br>
        <small>Pesanan Anda akan dikonfirmasi dalam waktu 30 menit ke email ${formData.email}</small>
      `);
      
      // Reset form
      $('#orderForm')[0].reset();
      btn.text(originalText).prop('disabled', false);
      
      // Remove status after 5 seconds
      setTimeout(() => {
        statusDiv.fadeOut(500, function() {
          $(this).removeClass('success').html('').show();
        });
      }, 5000);
      
      showSuccessNotification('Pesanan dikirim! Periksa email Anda');
    }, function(error) {
      const errorDetail = error && (error.text || error.statusText || JSON.stringify(error));
      console.error('Order email send failed:', errorDetail);
      const statusDiv = $('#orderStatus');
      statusDiv.removeClass('success').addClass('error');
      statusDiv.html(`
        ✗ Gagal mengirim pesanan. Silakan coba lagi atau hubungi kami langsung.<br>
        <small>${errorDetail}</small>
      `);
      
      btn.text(originalText).prop('disabled', false);
      showErrorNotification('Gagal mengirim pesanan. Silakan coba lagi.');
    });
});

$('#reservasiForm').on('submit', function(e) {
  e.preventDefault();
  
  if (!validateReservasiForm()) {
    showErrorNotification('Harap isi semua field dengan benar');
    return;
  }
  
  if (!cachedData.selectedBranch) {
    showErrorNotification('Harap pilih cabang terlebih dahulu');
    return;
  }
  
  const form = $(this);

  // Prepare data
  const formData = {
    nama: form.find('input[name="nama"]').val(),
    email: form.find('input[name="email"]').val(),
    phone: form.find('input[name="phone"]').val(),
    tanggal: form.find('input[name="tanggal"]').val(),
    jam: form.find('input[name="jam"]').val(),
    jumlahOrang: form.find('select[name="jumlahOrang"]').val(),
    catatan: form.find('textarea[name="catatan"]').val(),
    cabang: cachedData.selectedBranch.name,
    timestamp: new Date().toLocaleString('id-ID')
  };
  
  // Show loading state
  const btn = $(this).find('button[type="submit"]');
  const originalText = btn.text();
  btn.text('Mengirim...').prop('disabled', true);
  
  // Prepare email data
  const emailData = {
    to_email: 'anthoniajayani@gmail.com',
    from_name: formData.nama,
    customer_name: formData.nama,
    customer_email: formData.email,
    name: formData.nama,
    email: formData.email,
    reply_to: formData.email,
    customer_phone: formData.phone,
    reservation_date: formData.tanggal,
    reservation_time: formData.jam,
    number_of_people: formData.jumlahOrang,
    special_notes: formData.catatan || 'Tidak ada catatan khusus',
    branch_name: formData.cabang,
    timestamp: formData.timestamp
  };
  
  // Send email using EmailJS (Reservation Template)
  console.log('Sending reservation email via EmailJS', EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_RESERVASI, emailData);
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_RESERVASI, emailData)
    .then(function(response) {
      console.log('Reservation email sent successfully:', response);
      
      const statusDiv = $('#reservasiStatus');
      statusDiv.removeClass('error').addClass('success');
      statusDiv.html(`
        ✓ Reservasi berhasil dikirim!<br>
        <small>Kami akan mengkonfirmasi reservasi Anda ke nomor ${formData.phone}</small>
      `);
      
      // Reset form
      $('#reservasiForm')[0].reset();
      btn.text(originalText).prop('disabled', false);
      
      // Remove status after 5 seconds
      setTimeout(() => {
        statusDiv.fadeOut(500, function() {
          $(this).removeClass('success').html('').show();
        });
      }, 5000);
      
      showSuccessNotification('Reservasi dikirim! Tunggu konfirmasi kami');
    }, function(error) {
      const errorDetail = error && (error.text || error.statusText || JSON.stringify(error));
      console.error('Reservation email send failed:', errorDetail);
      
      const statusDiv = $('#reservasiStatus');
      statusDiv.removeClass('success').addClass('error');
      statusDiv.html(`
        ✗ Gagal mengirim reservasi. Silakan coba lagi atau hubungi kami langsung.<br>
        <small>${errorDetail}</small>
      `);
      
      btn.text(originalText).prop('disabled', false);
      
      showErrorNotification('Gagal mengirim reservasi. Silakan coba lagi.');
    });
});

// =============================================
// 8. CHAT FUNCTIONALITY
// =============================================

// Chat template responses
const chatTemplates = [
  {
    id: 1,
    question: "Bagaimana cara reservasi?",
    answer: "Untuk melakukan reservasi di KaKev Company:\n\n1. Scroll ke bagian 'Sistem Reservasi Online'\n2. Pilih cabang KaKev yang Anda inginkan\n3. Isi form dengan:\n   • Nama lengkap\n   • Email & nomor telepon\n   • Tanggal & waktu reservasi\n   • Jumlah orang\n   • Catatan khusus (jika ada)\n4. Klik 'Ajukan Reservasi'\n5. Tim kami akan mengkonfirmasi ke nomor Anda\n\nRasa terima kasih telah memilih KaKev Company! ☕"
  },
  {
    id: 2,
    question: "Jam operasional?",
    answer: "KaKev Company beroperasi dengan jam sebagai berikut:\n\n📍 Central Jakarta\n⏰ Senin - Jumat: 07:00 - 21:00\n⏰ Sabtu - Minggu: 08:00 - 22:00\n\n📍 South Jakarta\n⏰ Senin - Jumat: 07:00 - 21:00\n⏰ Sabtu - Minggu: 08:00 - 22:00\n\nCatatan: Jam operasional bisa berubah pada hari libur nasional. Hubungi kami untuk info lebih lanjut! 😊"
  },
  {
    id: 3,
    question: "Menu & Harga",
    answer: "KaKev Company memiliki berbagai pilihan menu:\n\n☕ COFFEE\nEspresso, Americano, Cappuccino, Latte, Macchiato\nHarga: Rp 18.000 - Rp 35.000\n\n🥤 NON-COFFEE\nMatcha, Teh Latte, Chocolate, Smoothies\nHarga: Rp 22.000 - Rp 32.000\n\n🍰 DESSERT\nCake, Pastry, Cookies\nHarga: Rp 15.000 - Rp 45.000\n\n🍽️ MEALS & MAIN COURSE\nNasi, Sandwich, Pasta\nHarga: Rp 35.000 - Rp 65.000\n\nLihat menu lengkap di bagian 'Menu Istimewa' atau hubungi kami! 📱"
  },
  {
    id: 4,
    question: "Lokasi Cabang",
    answer: "KaKev Company memiliki 5 cabang tersebar di Jakarta:\n\n1. 📍 Central Jakarta\n   Jl. Sudirman, Jakarta Pusat\n   ☎️ (021) 5234-5678\n\n2. 📍 South Jakarta\n   Jl. Gatot Subroto, Jakarta Selatan\n   ☎️ (021) 7234-9876\n\n3. 📍 West Jakarta\n   Jl. Jendral Sudirman, Jakarta Barat\n   ☎️ (021) 6543-2109\n\n4. 📍 East Jakarta\n   Jl. Mayjen Sungkono, Jakarta Timur\n   ☎️ (021) 8765-4321\n\n5. 📍 North Jakarta\n   Jl. Rajawali, Jakarta Utara\n   ☎️ (021) 4321-8765\n\nKunjungi cabang terdekat Anda! 😊"
  },
  {
    id: 5,
    question: "Delivery & Takeaway",
    answer: "Pesan menu favorit Anda dengan mudah!\n\n🚚 DELIVERY\n• Gratis ongkos kirim untuk pembelian minimal Rp 100.000\n• Pengiriman dalam 30-45 menit\n• Syarat & Ketentuan berlaku\n\n📦 TAKEAWAY\n• Pesan dan ambil di kasir\n• Siap dalam 5-10 menit\n• Lebih hemat untuk pembelian multiple items\n\n📝 CARA PESAN:\n1. Scroll ke 'Delivery & Takeaway'\n2. Pilih menu & jumlah\n3. Pilih tipe (Delivery/Takeaway)\n4. Isi data diri & catatan\n5. Klik 'Kirim Pesanan'\n6. Tunggu konfirmasi kami\n\nSegera pesan sekarang! 🎉"
  },
  {
    id: 6,
    question: "Hubungi Kami",
    answer: "Hubungi KaKev Company melalui berbagai saluran:\n\n📞 TELEPON\n• Customer Service: (021) 5234-5678\n• WhatsApp: 0812-3456-7890\n• Senin-Minggu: 07:00 - 22:00 WIB\n\n📧 EMAIL\n• info@kakevcompany.com\n• support@kakevcompany.com\n\n📍 KUNJUNGI KAMI\n• 5 cabang tersebar di Jakarta\n• Lihat detail di opsi 'Lokasi Cabang'\n\n💬 LIVE CHAT\n• Chat dengan kami sekarang juga! 👈\n• Tim support siap membantu 24/7\n\nTerima kasih telah menghubungi kami! 😊☕"
  }
];

const adminResponses = [
  'Ada yang bisa saya bantu? 😊',
  'Terima kasih telah menghubungi KaKev Company! Bagaimana kabar Anda?',
  'Baik, saya akan membantu Anda. Apa pertanyaannya?',
  'Silakan tunggu sebentar, saya sedang memproses informasi Anda.',
  'Apakah ada lagi yang bisa saya bantu?',
  'Terima kasih atas pertanyaannya. Semoga puas dengan layanan kami!',
  'Kami sangat menghargai masukan Anda untuk KaKev Company.',
];

let messageCount = 0;

// Handle suggestion button clicks
$('#chatSuggestions').on('click', '.suggestion-btn', function() {
  const templateId = $(this).data('template-id');
  const template = chatTemplates.find(t => t.id === templateId);
  
  if (template) {
    // Add user message
    addChatMessage(template.question, 'user-message');
    
    // Simulate typing and show admin response
    setTimeout(() => {
      addChatMessage(template.answer, 'admin-message');
    }, 800 + Math.random() * 400);
  }
});

$('#chatForm').on('submit', function(e) {
  e.preventDefault();
  
  const messageInput = $('#chatInput');
  const messageText = messageInput.val().trim();
  
  if (!messageText) return;
  
  // Add user message
  addChatMessage(messageText, 'user-message');
  messageInput.val('');
  
  // Check if message matches any template question
  let foundTemplate = null;
  const lowerMessage = messageText.toLowerCase();
  
  for (let template of chatTemplates) {
    if (template.question.toLowerCase().includes(messageText.toLowerCase()) || 
        messageText.toLowerCase().includes(template.question.toLowerCase())) {
      foundTemplate = template;
      break;
    }
  }
  
  // Simulate admin response
  setTimeout(() => {
    let response;
    if (foundTemplate) {
      response = foundTemplate.answer;
    } else {
      response = adminResponses[Math.floor(Math.random() * adminResponses.length)];
    }
    addChatMessage(response, 'admin-message');
  }, 800 + Math.random() * 400);
});

function addChatMessage(text, messageClass) {
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  
  // Handle multiline text
  const formattedText = escapeHtml(text).replace(/\n/g, '<br>');
  
  const messageDiv = `
    <div class="chat-message ${messageClass}">
      <p>${formattedText}</p>
      <span class="timestamp">${timestamp}</span>
    </div>
  `;
  
  $('#chatMessages').append(messageDiv);
  
  // Scroll to bottom
  const chatBox = $('.chat-messages');
  chatBox.scrollTop(chatBox[0].scrollHeight);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================
// 9. SMOOTH SCROLL FOR NAVIGATION
// ============================================= 
$('.navbar__links a[href^="#"]').on('click', function(e) {
  const target = $(this).attr('href');
  const $targetElement = $(target);
  
  if ($targetElement.length === 0) return;
  
  e.preventDefault();
  const offset = $targetElement.offset().top - 80;
  
  $('html, body').animate({
    scrollTop: offset
  }, 800, 'swing');
});

// =============================================
// 10. SCROLL ANIMATIONS
// =============================================
function checkScroll() {
  $('.section').each(function() {
    const elementTop = $(this).offset().top;
    const elementBottom = elementTop + $(this).outerHeight();
    const viewportTop = $(window).scrollTop();
    const viewportBottom = viewportTop + $(window).height();
    
    if (elementBottom > viewportTop && elementTop < viewportBottom) {
      $(this).addClass('fade-in');
    }
  });
}

// Initial check
checkScroll();

// Check on scroll
$(window).on('scroll', function() {
  checkScroll();
});

// =============================================
// 11. NOTIFICATION SYSTEM
// =============================================
function showSuccessNotification(message) {
  showNotification(message, 'success');
}

function showErrorNotification(message) {
  showNotification(message, 'error');
}

function showNotification(message, type) {
  const notificationId = 'notif-' + Date.now();
  const notificationClass = type === 'success' ? 'success' : 'error';
  const icon = type === 'success' ? '✓' : '✕';
  
  const notification = `
    <div id="${notificationId}" class="notification ${notificationClass}" style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    ">
      <strong>${icon} ${message}</strong>
    </div>
  `;
  
  $('body').append(notification);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    $(`#${notificationId}`).fadeOut(300, function() {
      $(this).remove();
    });
  }, 4000);
}

// =============================================
// 12. HERO STATS COUNTER ANIMATION
// =============================================
function animateCounters() {
  $('.stat__number').each(function() {
    const $this = $(this);
    const target = parseInt($this.text().replace(/[^\d]/g, ''));
    const suffix = $this.text().replace(/[\d]/g, '');
    
    $({ count: 0 }).animate({ count: target }, {
      duration: 2000,
      easing: 'swing',
      step: function() {
        $this.text(Math.floor(this.count) + suffix);
      },
      complete: function() {
        $this.text(target + suffix);
      }
    });
  });
}

// Trigger animation when hero is visible
const heroObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      heroObserver.unobserve(entry.target);
    }
  });
});

if ($('.hero')[0]) {
  heroObserver.observe($('.hero')[0]);
}

// =============================================
// 13. INPUT ERROR STYLING
// =============================================
$('.order-form input, .order-form select, .order-form textarea, .reservasi-form input, .reservasi-form select, .reservasi-form textarea').on('focus', function() {
  $(this).removeClass('input-error');
}).on('change', function() {
  $(this).removeClass('input-error');
});

// =============================================
// 14. FOOTER BRANCH LINKS
// =============================================
$('.branch-contact').on('click', function(e) {
  e.preventDefault();
  $('#branchModal').fadeIn(300);
  $('html, body').animate({ scrollTop: 0 }, 500);
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Log initial load
console.log('%cKaKev Company Interactive Website Loaded', 'font-size: 16px; color: #c89b4a; font-weight: bold;');
console.log('Selected Branch:', cachedData.selectedBranch);
console.log('Available Menu Items:', cachedData.menu.length);
