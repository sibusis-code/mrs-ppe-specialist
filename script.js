/* ===================================================
   Mrs PPE Specialist – Main Script
   =================================================== */

// ⚙️ CONFIGURATION – UPDATE YOUR WHATSAPP NUMBER HERE
// Format: country code + number (no + or spaces)
// Example: South Africa +27 123 456 7890 becomes '27123456789'
const WHATSAPP_NUMBER = '27635002390';  // 👈 CHANGE THIS TO YOUR ACTUAL NUMBER

// ── Navbar scroll effect ──────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Active nav link on scroll ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const observerOptions = { rootMargin: '-50% 0px -50% 0px' };
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

// ── Mobile menu ───────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ── Cart ──────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('mrsppe_cart') || '[]');

const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartCount   = document.getElementById('cartCount');
const cartItems   = document.getElementById('cartItems');
const cartFooter  = document.getElementById('cartFooter');
const cartTotal   = document.getElementById('cartTotal');

function saveCart() {
  localStorage.setItem('mrsppe_cart', JSON.stringify(cart));
}

function formatPrice(cents) {
  return 'R' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function generateWhatsAppMessage() {
  const totalCents = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  
  let message = "NEW ORDER REQUEST - Mrs PPE Specialist\n\n";
  message += "📦 Order Details:\n";
  message += "━━━━━━━━━━━━━━━\n\n";
  
  cart.forEach((item, idx) => {
    message += `${idx + 1}. *${item.name}*\n`;
    message += `   Category: ${item.category}\n`;
    message += `   Price: ${formatPrice(item.price)} × ${item.qty}\n`;
    message += `   Subtotal: ${formatPrice(item.price * item.qty)}\n\n`;
  });
  
  message += "━━━━━━━━━━━━━━━\n";
  message += `📊 *Total Items:* ${totalQty}\n`;
  message += `💰 *Estimated Total:* ${formatPrice(totalCents)}\n\n`;
  message += "⚠️ *Note:* This is an initial quote. Final price will be confirmed on WhatsApp based on quantities, delivery location, and any special requirements.\n\n";
  message += "Please reply to confirm your order and provide:\n";
  message += "✓ Delivery address\n";
  message += "✓ Company name (if applicable)\n";
  message += "✓ Any special requirements\n\n";
  message += "We'll respond with a detailed quote within 1 hour! 🚀";
  
  return encodeURIComponent(message);
}

function sendCartToWhatsApp() {
  if (cart.length === 0) {
    alert('Your cart is empty. Please add items before sending to WhatsApp.');
    return;
  }
  
  const message = generateWhatsAppMessage();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  
  window.open(whatsappUrl, '_blank');
}

function renderCart() {
  const totalCents = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="ri-shopping-bag-3-line"></i>
        <p>Your cart is empty</p>
        <a href="#shop" class="btn btn-primary" onclick="closeCart()">Start Shopping</a>
      </div>`;
    cartFooter.style.display = 'none';
  } else {
    cartItems.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-icon"><i class="${item.icon}"></i></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">${formatPrice(item.price)} × ${item.qty}</div>
        </div>
        <button class="cart-item-remove" data-idx="${idx}" aria-label="Remove ${escapeHtml(item.name)}">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>`).join('');

    cartFooter.style.display = 'block';
    cartTotal.textContent = formatPrice(totalCents);

    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        cart.splice(idx, 1);
        saveCart();
        renderCart();
      });
    });
  }
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

// ── Products data ─────────────────────────────────────────
const products = [
  {
    id:       'p001',
    name:     'Industrial Hard Hat \u2013 Class E',
    category: 'Head Protection',
    price:    14900,
    oldPrice: 18900,
    badge:    'Sale',
    badgeType:'sale',
    icon:     'ri-hard-drive-line',
    image:    'HeadProtection/IndustrialHardHat\u2013ClassE.jpg',
  },
  {
    id:       'p002',
    name:     'Anti-Fog Safety Goggles',
    category: 'Eye & Face Protection',
    price:    8900,
    oldPrice: null,
    badge:    'Best Seller',
    badgeType:'',
    icon:     'ri-eye-line',
    image:    'EyeFaceProtection/Anti-FogSafetyGoggles.jpg',
  },
  {
    id:       'p003',
    name:     'Cut-Resistant Work Gloves',
    category: 'Hand Protection',
    price:    5500,
    oldPrice: null,
    badge:    null,
    badgeType:'',
    icon:     'ri-hand-coin-line',
    image:    'HandProtection/Cut-ResistantWorkGloves.jpg',
  },
  {
    id:       'p004',
    name:     'N95 Particulate Respirator',
    category: 'Respiratory Protection',
    price:    3200,
    oldPrice: null,
    badge:    'New',
    badgeType:'',
    icon:     'ri-lungs-line',
    image:    'RespiratoryProtection/N95ParticulateRespirator.jpg',
  },
  {
    id:       'p005',
    name:     'Steel Toe Safety Boot',
    category: 'Safety Footwear',
    price:    89900,
    oldPrice: 109900,
    badge:    'Sale',
    badgeType:'sale',
    icon:     'ri-run-line',
    image:    'SafetyFootwear/SteelToeSafetyBoot.jpg',
  },
  {
    id:       'p006',
    name:     'Hi-Vis Safety Vest \u2013 Class 2',
    category: 'Workwear',
    price:    17900,
    oldPrice: null,
    badge:    'Best Seller',
    badgeType:'',
    icon:     'ri-shirt-line',
    image:    'WorkWear/Hi-VisSafetyVest\u2013Class2.jpg',
  },
  {
    id:       'p007',
    name:     'Full Body Safety Harness',
    category: 'Fall Protection',
    price:    149900,
    oldPrice: null,
    badge:    null,
    badgeType:'',
    icon:     'ri-user-line',
    image:    'FallProtection/FullBodySafetyHarness.jpg',
  },
  {
    id:       'p008',
    name:     'Disposable Coverall \u2013 Type 5/6',
    category: 'Workwear',
    price:    6500,
    oldPrice: null,
    badge:    'New',
    badgeType:'',
    icon:     'ri-shirt-line',
    image:    'DisposableCoverall/DisposableCoverall\u2013Type5-6.jpg',
  },
];

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-image">
        ${p.image
          ? `<img src="${encodeURI(p.image)}" alt="${escapeHtml(p.name)}" class="product-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><i class="${p.icon} product-icon" style="display:none"></i>`
          : `<i class="${p.icon} product-icon"></i>`
        }
        ${p.badge ? `<span class="product-badge ${p.badgeType}">${escapeHtml(p.badge)}</span>` : ''}
      </div>
      <div class="product-info">
        <p class="product-category">${escapeHtml(p.category)}</p>
        <h3 class="product-name">${escapeHtml(p.name)}</h3>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="product-price-old">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <button
          class="product-add-btn"
          data-id="${escapeHtml(p.id)}"
          aria-label="Add ${escapeHtml(p.name)} to cart"
        >
          <i class="ri-shopping-bag-3-line"></i> Add to Cart
        </button>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = products.find(p => p.id === btn.dataset.id);
      if (product) addToCart(product);
    });
  });
}

// ── Quote form ────────────────────────────────────────────
const quoteForm    = document.getElementById('quoteForm');
const formSuccess  = document.getElementById('formSuccess');

quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Basic HTML5 validation
  if (!quoteForm.checkValidity()) {
    quoteForm.reportValidity();
    return;
  }

  // Simulate form submission (replace with real fetch/API call)
  const submitBtn = quoteForm.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending…';

  setTimeout(() => {
    quoteForm.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Send Quote Request <i class="ri-send-plane-line"></i>';
    formSuccess.classList.remove('hidden');
    setTimeout(() => formSuccess.classList.add('hidden'), 6000);
  }, 1400);
});

// ── Smooth scroll for anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Scroll reveal animation ───────────────────────────────
const revealElements = document.querySelectorAll(
  '.category-card, .product-card, .stat-card, .testimonial-card, .why-list li'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity    = '1';
      entry.target.style.transform  = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach((el, i) => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.45s ease ${(i % 6) * 0.06}s, transform 0.45s ease ${(i % 6) * 0.06}s`;
  revealObserver.observe(el);
});

// ── Security helper – prevent XSS ────────────────────────
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, ch => map[ch]);
}

// ── Init ──────────────────────────────────────────────────
renderProducts();
renderCart();
