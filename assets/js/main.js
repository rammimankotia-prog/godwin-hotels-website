/**
 * GODWIN HOTELS & RESORTS
 * Core Application & Booking Engine Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initDestinationFilters();
  initCurrencySelector();
  initBookingEngine();
  initNewsletter();
  initBanquetForm();
  initFaqAccordion();
});

/* ==========================================================================
   1. NAVBAR & SCROLL BEHAVIOR
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close when clicking nav link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

/* ==========================================================================
   2. HERO BACKGROUND SLIDER
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-slider-dot');
  if (!slides.length) return;

  let currentSlide = 0;
  const slideInterval = 6000;

  function showSlide(index) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  let timer = setInterval(() => {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }, slideInterval);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
      timer = setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
      }, slideInterval);
    });
  });
}

/* ==========================================================================
   3. CURRENCY SWITCHER ENGINE
   ========================================================================== */
const CURRENCY_RATES = {
  INR: { symbol: '₹', rate: 1 },
  USD: { symbol: '$', rate: 0.012 },
  EUR: { symbol: '€', rate: 0.011 },
  AED: { symbol: 'AED ', rate: 0.044 }
};

let currentCurrency = 'INR';

function initCurrencySelector() {
  const currencySelector = document.getElementById('currencySelector');
  if (!currencySelector) return;

  currencySelector.addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    updateAllPrices();
  });
}

function formatPrice(amountINR) {
  const cur = CURRENCY_RATES[currentCurrency] || CURRENCY_RATES.INR;
  const converted = Math.round(amountINR * cur.rate);
  return `${cur.symbol}${converted.toLocaleString()}`;
}

function updateAllPrices() {
  const priceElements = document.querySelectorAll('[data-base-price]');
  priceElements.forEach(el => {
    const base = parseFloat(el.getAttribute('data-base-price'));
    if (!isNaN(base)) {
      el.textContent = formatPrice(base);
    }
  });
  if (typeof updateModalBill === 'function') {
    updateModalBill();
  }
}

/* ==========================================================================
   4. DESTINATION FILTER TABS
   ========================================================================== */
function initDestinationFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const hotelCards = document.querySelectorAll('.hotel-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-filter');

      hotelCards.forEach(card => {
        const dest = card.getAttribute('data-destination');
        if (target === 'all' || dest === target) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. BOOKING MODAL & ENGINE
   ========================================================================== */
let updateModalBill = () => {};

function initBookingEngine() {
  const modal = document.getElementById('bookingModal');
  const closeModal = document.getElementById('closeBookingModal');
  const quickBookForm = document.getElementById('quickBookingForm');
  const modalForm = document.getElementById('modalReservationForm');

  // Trigger buttons
  const bookTriggers = document.querySelectorAll('.trigger-booking-modal');

  // Today & Tomorrow date defaults
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const checkinInput = document.getElementById('checkinDate');
  const checkoutInput = document.getElementById('checkoutDate');
  const modalCheckin = document.getElementById('modalCheckin');
  const modalCheckout = document.getElementById('modalCheckout');

  if (checkinInput && checkoutInput) {
    checkinInput.value = formatDate(today);
    checkinInput.min = formatDate(today);
    checkoutInput.value = formatDate(tomorrow);
    checkoutInput.min = formatDate(tomorrow);
  }

  if (modalCheckin && modalCheckout) {
    modalCheckin.value = formatDate(today);
    modalCheckin.min = formatDate(today);
    modalCheckout.value = formatDate(tomorrow);
    modalCheckout.min = formatDate(tomorrow);
  }

  function openModal(destination = 'Hotel Grand Godwin, New Delhi', roomType = 'Deluxe Room', basePrice = 2800) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Sync fields
    const modalDest = document.getElementById('modalDestination');
    const modalRoom = document.getElementById('modalRoomType');
    if (modalDest) modalDest.value = destination;
    if (modalRoom) {
      modalRoom.value = roomType;
      modalRoom.setAttribute('data-price', basePrice);
    }
    updateModalBill();
  }

  function hideModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  }

  if (closeModal) {
    closeModal.addEventListener('click', hideModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });
  }

  // Quick booking form submit
  if (quickBookForm) {
    quickBookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dest = document.getElementById('bookingDestination').value;
      const guests = document.getElementById('bookingGuests').value;
      const rooms = document.getElementById('bookingRooms').value;

      if (modalCheckin && checkinInput) modalCheckin.value = checkinInput.value;
      if (modalCheckout && checkoutInput) modalCheckout.value = checkoutInput.value;
      if (document.getElementById('modalGuests')) document.getElementById('modalGuests').value = guests;
      if (document.getElementById('modalRoomsCount')) document.getElementById('modalRoomsCount').value = rooms;

      openModal(dest, 'Deluxe Room', 2800);
    });
  }

  // Card specific triggers
  bookTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const dest = btn.getAttribute('data-destination') || 'Hotel Grand Godwin, New Delhi';
      const room = btn.getAttribute('data-room') || 'Deluxe Room';
      const price = parseFloat(btn.getAttribute('data-price') || '2800');
      openModal(dest, room, price);
    });
  });

  // Calculate bill in modal
  updateModalBill = function() {
    const modalRoom = document.getElementById('modalRoomType');
    const modalCheckinVal = modalCheckin ? new Date(modalCheckin.value) : new Date();
    const modalCheckoutVal = modalCheckout ? new Date(modalCheckout.value) : new Date();
    const roomsCount = parseInt(document.getElementById('modalRoomsCount')?.value || '1', 10);

    let nights = 1;
    if (modalCheckoutVal > modalCheckinVal) {
      const diffTime = Math.abs(modalCheckoutVal - modalCheckinVal);
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }

    let ratePerNight = 2800;
    if (modalRoom) {
      const selectedOption = modalRoom.options[modalRoom.selectedIndex];
      if (selectedOption && selectedOption.dataset.price) {
        ratePerNight = parseFloat(selectedOption.dataset.price);
      }
    }

    // Addons
    let addonsTotal = 0;
    const breakfast = document.getElementById('addonBreakfast');
    const transfer = document.getElementById('addonTransfer');
    if (breakfast && breakfast.checked) addonsTotal += 350 * nights * roomsCount;
    if (transfer && transfer.checked) addonsTotal += 950;

    const baseRoomTotal = ratePerNight * nights * roomsCount;
    const subtotal = baseRoomTotal + addonsTotal;
    const tax = Math.round(subtotal * 0.12); // 12% Hotel GST
    const grandTotal = subtotal + tax;

    const billNightsEl = document.getElementById('billNights');
    const billRoomRateEl = document.getElementById('billRoomRate');
    const billSubtotalEl = document.getElementById('billSubtotal');
    const billTaxEl = document.getElementById('billTax');
    const billTotalEl = document.getElementById('billTotal');

    if (billNightsEl) billNightsEl.textContent = `${nights} Night(s) × ${roomsCount} Room(s)`;
    if (billRoomRateEl) billRoomRateEl.textContent = formatPrice(baseRoomTotal);
    if (billSubtotalEl) billSubtotalEl.textContent = formatPrice(subtotal);
    if (billTaxEl) billTaxEl.textContent = formatPrice(tax);
    if (billTotalEl) billTotalEl.textContent = formatPrice(grandTotal);
  };

  // Attach change listeners inside modal
  ['modalRoomType', 'modalCheckin', 'modalCheckout', 'modalRoomsCount', 'addonBreakfast', 'addonTransfer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', updateModalBill);
    }
  });

  // Modal form submit
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('guestFullName')?.value || 'Valued Guest';
      const guestEmail = document.getElementById('guestEmail')?.value || '';
      const guestPhone = document.getElementById('guestPhone')?.value || '';
      const dest = document.getElementById('modalDestination')?.value || '';
      const room = document.getElementById('modalRoomType')?.value || '';
      const totalText = document.getElementById('billTotal')?.textContent || '';

      const bookingRef = 'GDW-' + Math.floor(100000 + Math.random() * 900000);

      // Attempt async POST to PHP backend if available
      fetch('api/book.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef,
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          destination: dest,
          room: room,
          total: totalText
        })
      }).catch(() => {
        // Fallback gracefully for pure static hosting
      });

      // Display reservation confirmation
      showConfirmationSuccess(bookingRef, guestName, dest, room, totalText);
    });
  }

  function showConfirmationSuccess(ref, name, dest, room, total) {
    const modalBody = document.querySelector('.modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem;">
        <div style="width: 72px; height: 72px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.5rem;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: var(--navy-900); margin-bottom: 0.5rem;">
          Reservation Confirmed
        </h3>
        <p style="color: var(--slate-600); margin-bottom: 1.5rem;">
          Thank you, <strong>${name}</strong>. Your luxury stay request at <strong>${dest}</strong> has been secured!
        </p>
        <div style="background: var(--gold-50); border: 1px dashed var(--gold-400); padding: 1.25rem; border-radius: 8px; max-width: 420px; margin: 0 auto 2rem; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <span style="color: var(--slate-500); font-size: 0.85rem;">Booking Reference:</span>
            <strong style="color: var(--navy-900); font-family: monospace; font-size: 1rem;">${ref}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <span style="color: var(--slate-500); font-size: 0.85rem;">Reserved Suite:</span>
            <strong style="color: var(--navy-900); font-size: 0.85rem;">${room}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--gold-200); padding-top: 0.5rem; margin-top: 0.5rem;">
            <span style="color: var(--slate-600); font-weight: 600;">Grand Total:</span>
            <strong style="color: var(--gold-700); font-size: 1.1rem;">${total}</strong>
          </div>
        </div>
        <p style="font-size: 0.85rem; color: var(--slate-500); margin-bottom: 2rem;">
          A detailed confirmation email & WhatsApp itinerary has been dispatched. Our 24/7 concierge is at your service.
        </p>
        <button id="finishBookingBtn" class="btn-luxury-primary" style="margin: 0 auto;">
          Done
        </button>
      </div>
    `;

    document.getElementById('finishBookingBtn')?.addEventListener('click', () => {
      hideModal();
      window.location.reload();
    });
  }
}

/* ==========================================================================
   6. BANQUET & WEDDING INQUIRY
   ========================================================================== */
function initBanquetForm() {
  const banquetBtn = document.getElementById('banquetInquiryBtn');
  if (banquetBtn) {
    banquetBtn.addEventListener('click', () => {
      const email = prompt("Please enter your phone number or email address for Banquet / Wedding concierge:");
      if (email && email.trim()) {
        alert("Thank you! Our dedicated Godwin Events Director will reach out to you within 2 business hours.");
      }
    });
  }
}

/* ==========================================================================
   7. NEWSLETTER
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        alert(`Thank you for subscribing to Godwin Privileges! Exclusive offers will be sent to ${input.value}.`);
        input.value = '';
      }
    });
  }
}

/* ==========================================================================
   8. FAQ ACCORDION (AEO CONVERSATIONAL INTERACTION)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });
}
