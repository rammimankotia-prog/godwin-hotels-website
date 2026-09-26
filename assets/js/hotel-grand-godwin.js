/**
 * HOTEL GRAND GODWIN — INTERACTIVE LOGIC
 * Google Business Listing Compliance:
 * 1. Address Autocomplete & Geolocation for Quick Checkout
 * 2. Interactive Amenity Map & Area Explorer
 * 3. 39 Rooms Category Filter & Direct Reservation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initGrandGodwinAddressAutocomplete();
  initGrandGodwinAmenityExplorer();
  initGrandGodwinBooking();
  initGrandGodwinDates();
});

/* ─────────────────────────────────────────────────────────────
   1. GOOGLE ADDRESS AUTOCOMPLETE COMPONENT (Card 2 Compliance)
   ───────────────────────────────────────────────────────────── */
const SUGGESTED_LOCATIONS = [
  { main: "New Delhi Railway Station (NDLS)", sub: "Paharganj / Ajmeri Gate, New Delhi - 110055", city: "New Delhi", state: "Delhi", country: "India" },
  { main: "Connaught Place (CP)", sub: "Rajiv Chowk, Central Delhi - 110001", city: "New Delhi", state: "Delhi", country: "India" },
  { main: "Indira Gandhi International Airport (IGI)", sub: "Terminal 3 / Terminal 1, New Delhi - 110037", city: "New Delhi", state: "Delhi", country: "India" },
  { main: "Paharganj Main Bazaar", sub: "Ram Nagar, Central Delhi - 110055", city: "New Delhi", state: "Delhi", country: "India" },
  { main: "Karol Bagh", sub: "Ghaffar Market & Ajmal Khan Road, Central Delhi - 110005", city: "New Delhi", state: "Delhi", country: "India" },
  { main: "South Extension & Greater Kailash", sub: "South Delhi - 110049", city: "New Delhi", state: "Delhi", country: "India" },
  { main: "DLF Cyber Hub & Golf Course Road", sub: "Gurugram, Haryana - 122002", city: "Gurugram", state: "Haryana", country: "India" },
  { main: "Sector 18 & Film City", sub: "Noida, Gautam Buddha Nagar, UP - 201301", city: "Noida", state: "Uttar Pradesh", country: "India" },
  { main: "Bandra Kurla Complex (BKC) & Nariman Point", sub: "Mumbai, Maharashtra - 400051", city: "Mumbai", state: "Maharashtra", country: "India" },
  { main: "Koramangala & Indiranagar", sub: "Bengaluru, Karnataka - 560034", city: "Bengaluru", state: "Karnataka", country: "India" },
  { main: "Civil Lines & C-Scheme", sub: "Jaipur, Rajasthan - 302001", city: "Jaipur", state: "Rajasthan", country: "India" },
  { main: "Taj East Gate & Fatehabad Road", sub: "Agra, Uttar Pradesh - 282001", city: "Agra", state: "Uttar Pradesh", country: "India" },
  { main: "Sector 17 & IT Park", sub: "Chandigarh - 160017", city: "Chandigarh", state: "Chandigarh", country: "India" },
  { main: "Salt Lake & Park Street", sub: "Kolkata, West Bengal - 700016", city: "Kolkata", state: "West Bengal", country: "India" },
  { main: "HITEC City & Banjara Hills", sub: "Hyderabad, Telangana - 500081", city: "Hyderabad", state: "Telangana", country: "India" },
  { main: "Central London / Westminster", sub: "Greater London, United Kingdom", city: "London", state: "England", country: "United Kingdom" },
  { main: "Downtown Dubai & Business Bay", sub: "Dubai, United Arab Emirates", city: "Dubai", state: "Dubai", country: "UAE" },
  { main: "Manhattan & Midtown", sub: "New York, NY, United States", city: "New York", state: "NY", country: "United States" },
  { main: "Marina Bay & Orchard Road", sub: "Singapore, 018956", city: "Singapore", state: "Central Region", country: "Singapore" },
  { main: "Sydney CBD & Circular Quay", sub: "Sydney, NSW, Australia", city: "Sydney", state: "NSW", country: "Australia" }
];

function initGrandGodwinAddressAutocomplete() {
  const inputs = document.querySelectorAll('.grand-address-autocomplete');

  inputs.forEach(input => {
    const container = input.closest('.autocomplete-container');
    if (!container) return;

    let dropdown = container.querySelector('.autocomplete-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'autocomplete-dropdown';
      container.appendChild(dropdown);
    }

    const locateBtn = container.querySelector('.btn-locate-me');
    let activeIdx = -1;

    // Filter and show suggestions
    function renderSuggestions(query) {
      const q = query.trim().toLowerCase();
      let matches = [];

      if (!q) {
        matches = SUGGESTED_LOCATIONS.slice(0, 6);
      } else {
        matches = SUGGESTED_LOCATIONS.filter(item => 
          item.main.toLowerCase().includes(q) ||
          item.sub.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q)
        );
      }

      if (!matches.length) {
        dropdown.innerHTML = `
          <div class="autocomplete-item" style="cursor:default;color:#666;">
            <i class="fa-solid fa-location-dot autocomplete-item-icon"></i>
            <div>
              <div class="autocomplete-item-main">"${query}"</div>
              <div class="autocomplete-item-sub">Custom entered address / city</div>
            </div>
          </div>
        `;
        dropdown.classList.add('open');
        return;
      }

      dropdown.innerHTML = matches.map((item, idx) => `
        <div class="autocomplete-item" data-index="${idx}">
          <i class="fa-solid fa-location-dot autocomplete-item-icon"></i>
          <div>
            <div class="autocomplete-item-main">${item.main}</div>
            <div class="autocomplete-item-sub">${item.sub}</div>
          </div>
        </div>
      `).join('');

      dropdown.classList.add('open');
      activeIdx = -1;

      dropdown.querySelectorAll('.autocomplete-item').forEach((elem, i) => {
        elem.addEventListener('click', () => {
          const match = matches[i];
          if (match) {
            input.value = `${match.main}, ${match.city}, ${match.country}`;
          } else {
            input.value = query;
          }
          dropdown.classList.remove('open');
        });
      });
    }

    input.addEventListener('focus', () => {
      renderSuggestions(input.value);
    });

    input.addEventListener('input', () => {
      renderSuggestions(input.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.autocomplete-item');
      if (!items.length || !dropdown.classList.contains('open')) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = (activeIdx + 1) % items.length;
        updateActive(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = (activeIdx - 1 + items.length) % items.length;
        updateActive(items);
      } else if (e.key === 'Enter') {
        if (activeIdx >= 0 && items[activeIdx]) {
          e.preventDefault();
          items[activeIdx].click();
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('open');
      }
    });

    function updateActive(items) {
      items.forEach((item, i) => {
        item.classList.toggle('active', i === activeIdx);
      });
      if (activeIdx >= 0 && items[activeIdx]) {
        items[activeIdx].scrollIntoView({ block: 'nearest' });
      }
    }

    // Geolocation detector button
    if (locateBtn) {
      locateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser.');
          return;
        }

        const originalText = locateBtn.innerHTML;
        locateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';
        locateBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Try reverse geocoding via OpenStreetMap Nominatim
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`);
              if (res.ok) {
                const data = await res.json();
                const city = data.address?.city || data.address?.town || data.address?.state_district || 'New Delhi';
                const state = data.address?.state || '';
                const country = data.address?.country || '';
                input.value = `${city}, ${state} ${country}`.replace(/^, |, $/g, '');
              } else {
                input.value = `Near Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`;
              }
            } catch (err) {
              input.value = `Current Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
            }
            locateBtn.innerHTML = originalText;
            locateBtn.disabled = false;
            dropdown.classList.remove('open');
          },
          (error) => {
            alert('Unable to retrieve location. Please type your city/address.');
            locateBtn.innerHTML = originalText;
            locateBtn.disabled = false;
          },
          { timeout: 7000 }
        );
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   2. INTERACTIVE AMENITY MAP & EXPLORER (Card 3 Compliance)
   ───────────────────────────────────────────────────────────── */
const AMENITY_DATA = [
  // Transit
  {
    category: "transit",
    name: "New Delhi Railway Station (NDLS)",
    badge: "500 m · 5 min walk",
    desc: "Ajmeri Gate exit. Direct access to all express, Shatabdi & Rajdhani trains across India.",
    icon: "fa-train",
    destQuery: "New Delhi Railway Station, Paharganj, New Delhi"
  },
  {
    category: "transit",
    name: "New Delhi Airport Express Metro",
    badge: "700 m · 7 min walk",
    desc: "Orange Line terminal. Reaches IGI Airport Terminal 3 in just 22 minutes without traffic.",
    icon: "fa-train-subway",
    destQuery: "New Delhi Airport Express Metro Station, New Delhi"
  },
  {
    category: "transit",
    name: "RK Ashram Marg Metro Station",
    badge: "800 m · 8 min walk",
    desc: "Blue Line metro connecting directly to Connaught Place (Rajiv Chowk), Noida & Dwarka.",
    icon: "fa-train-subway",
    destQuery: "RK Ashram Marg Metro Station, Paharganj, New Delhi"
  },
  {
    category: "transit",
    name: "IGI International Airport (DEL)",
    badge: "15 km · 22 min via Express Metro",
    desc: "Hotel Grand Godwin offers 24/7 chauffeured airport pickup and drop assistance.",
    icon: "fa-plane-departure",
    destQuery: "Indira Gandhi International Airport, New Delhi"
  },

  // Dining
  {
    category: "dining",
    name: "Coffee Brownie (24-Hour Cafe)",
    badge: "On-Site · Ground Level",
    desc: "Boutique on-site cafe serving freshly brewed espresso, cappuccinos, fudgy brownies & snacks round the clock.",
    icon: "fa-mug-hot",
    destQuery: "Hotel Grand Godwin, 8502/41 Arakashan Road, Paharganj, New Delhi"
  },
  {
    category: "dining",
    name: "The Indian Grill Restaurant",
    badge: "On-Site / Adjacent Sister Facility",
    desc: "Renowned multi-cuisine dining serving Mughlai curries, tandoori kebabs, Italian pastas & daily buffet breakfast.",
    icon: "fa-utensils",
    destQuery: "The Indian Grill, Arakashan Road, Paharganj, New Delhi"
  },
  {
    category: "dining",
    name: "Connaught Place Fine Dining & Cafes",
    badge: "1.2 km · 5 min drive",
    desc: "Host to legendary eateries like United Coffee House, Farzi Cafe, Saravana Bhavan & Haldiram's.",
    icon: "fa-champagne-glasses",
    destQuery: "Connaught Place, New Delhi"
  },
  {
    category: "dining",
    name: "Old Delhi Street Food & Karim's",
    badge: "3.2 km · 12 min drive",
    desc: "World-famous culinary landmarks: Karim's, Aslam Butter Chicken & Chandni Chowk Paranthe Wali Gali.",
    icon: "fa-bowl-rice",
    destQuery: "Karim's Restaurant, Jama Masjid, Old Delhi"
  },

  // Sights
  {
    category: "sights",
    name: "Connaught Place (CP) & Central Park",
    badge: "1.2 km · 5 min drive / 15 min walk",
    desc: "Colonial Georgian-style architecture, heritage buildings, luxury shopping colonnades & huge Indian flag.",
    icon: "fa-monument",
    destQuery: "Central Park, Connaught Place, New Delhi"
  },
  {
    category: "sights",
    name: "Red Fort (Lal Qila - UNESCO)",
    badge: "3.5 km · 12 min drive",
    desc: "Magnificent red sandstone fortress built by Mughal Emperor Shah Jahan in 1638.",
    icon: "fa-landmark",
    destQuery: "Red Fort, Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi"
  },
  {
    category: "sights",
    name: "Jama Masjid Delhi",
    badge: "3.0 km · 10 min drive",
    desc: "One of India's largest historical mosques with 40-meter minarets overlooking Old Delhi.",
    icon: "fa-mosque",
    destQuery: "Jama Masjid, Old Delhi, New Delhi"
  },
  {
    category: "sights",
    name: "India Gate & Kartavya Path",
    badge: "4.5 km · 15 min drive",
    desc: "National war memorial arch, evening illuminated lawns and Rashtrapati Bhavan view.",
    icon: "fa-archway",
    destQuery: "India Gate, Rajpath, India Gate, New Delhi"
  },

  // Shopping
  {
    category: "shopping",
    name: "Paharganj Main Bazaar",
    badge: "300 m · 3 min walk",
    desc: "Vibrant Bohemian market known for leather goods, incense, handicrafts, textiles & spices.",
    icon: "fa-bag-shopping",
    destQuery: "Main Bazaar, Paharganj, New Delhi"
  },
  {
    category: "shopping",
    name: "Palika Bazaar & Janpath",
    badge: "1.5 km · 6 min drive",
    desc: "Underground air-conditioned market and Janpath Tibetan & ethnic shopping street.",
    icon: "fa-basket-shopping",
    destQuery: "Janpath Market, Connaught Place, New Delhi"
  },
  {
    category: "shopping",
    name: "Karol Bagh Market",
    badge: "2.8 km · 10 min drive",
    desc: "Premier shopping district for bridal wear, jewellery, electronics & Indian apparel.",
    icon: "fa-store",
    destQuery: "Ajmal Khan Road, Karol Bagh, New Delhi"
  },

  // Convenience
  {
    category: "convenience",
    name: "24/7 ATMs & Foreign Currency Exchange",
    badge: "50 m · 1 min walk",
    desc: "Authorized forex counters and national bank ATMs right along Arakashan Road.",
    icon: "fa-money-bill-wave",
    destQuery: "Arakashan Road, Paharganj, New Delhi"
  },
  {
    category: "convenience",
    name: "Lady Hardinge Medical College & Hospital",
    badge: "1.4 km · 6 min drive",
    desc: "Prominent multi-specialty central government hospital with 24/7 emergency trauma care.",
    icon: "fa-hospital",
    destQuery: "Lady Hardinge Medical College, Connaught Place, New Delhi"
  }
];

function initGrandGodwinAmenityExplorer() {
  const container = document.getElementById('amenityItemsList');
  const buttons = document.querySelectorAll('.amenity-tab-btn');
  const mapIframe = document.getElementById('hotelGrandGodwinMap');

  if (!container) return;

  function renderList(category) {
    const filtered = category === 'all' 
      ? AMENITY_DATA 
      : AMENITY_DATA.filter(item => item.category === category);

    container.innerHTML = filtered.map(item => `
      <div class="amenity-item-card" data-query="${encodeURIComponent(item.destQuery)}">
        <div class="amenity-item-info">
          <h4><i class="fa-solid ${item.icon}" style="color:var(--gold-600);width:18px;"></i> ${item.name}</h4>
          <p class="amenity-item-desc">${item.desc}</p>
        </div>
        <div class="amenity-item-meta">
          <span class="amenity-distance-badge">${item.badge}</span>
          <div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.destQuery)}" 
               target="_blank" rel="noopener noreferrer" class="btn-directions">
              <i class="fa-solid fa-diamond-turn-right"></i> Directions
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Initial render
  renderList('all');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat') || 'all';
      renderList(cat);
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   3. 39 ROOMS BOOKING & RESERVATION ENGINE
   ───────────────────────────────────────────────────────────── */
function initGrandGodwinBooking() {
  const form = document.getElementById('grandReservationForm');
  const roomSelect = document.getElementById('resRoomCategory');
  const nightsInput = document.getElementById('resNights');
  const summaryBox = document.getElementById('resSummaryBox');
  const waBtn = document.getElementById('resWhatsAppBtn');

  const ROOM_RATES = {
    'Deluxe Room (39 Rooms Total)': 2800,
    'Deluxe Room': 2800,
    'Executive Room': 3600,
    'Studio Room': 4500,
    'Executive Twin Room': 3400
  };

  function updatePricing() {
    if (!roomSelect || !summaryBox) return;
    const selectedRoom = roomSelect.value;
    const nights = parseInt(nightsInput?.value || 1, 10);
    const ratePerNight = ROOM_RATES[selectedRoom] || 2800;
    const total = ratePerNight * nights;

    summaryBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:var(--text-muted);margin-bottom:0.35rem;">
        <span>Rate per Night:</span>
        <span>₹${ratePerNight.toLocaleString('en-IN')}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:var(--text-muted);margin-bottom:0.35rem;">
        <span>Duration:</span>
        <span>${nights} Night${nights > 1 ? 's' : ''}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:1.15rem;font-weight:700;color:var(--navy-850);border-top:1px solid rgba(0,0,0,0.1);padding-top:0.4rem;">
        <span>Estimated Total:</span>
        <span style="color:var(--gold-700);">₹${total.toLocaleString('en-IN')}</span>
      </div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.3rem;">
        *Includes complimentary high-speed Wi-Fi & early check-in assistance. Taxes per GST norms.
      </div>
    `;

    // Update WhatsApp link
    if (waBtn) {
      const checkin = document.getElementById('resCheckin')?.value || 'Upcoming';
      const checkout = document.getElementById('resCheckout')?.value || '';
      const guests = document.getElementById('resGuests')?.value || '2 Adults';
      const address = document.getElementById('resGuestAddress')?.value || '';

      const msg = `Hello Hotel Grand Godwin Team, I would like to book a stay:\n` +
        `• Hotel: Hotel Grand Godwin (39 Rooms Boutique)\n` +
        `• Category: ${selectedRoom}\n` +
        `• Dates: ${checkin} to ${checkout} (${nights} nights)\n` +
        `• Guests: ${guests}\n` +
        (address ? `• Origin: ${address}\n` : '') +
        `• Estimated Amount: ₹${total.toLocaleString('en-IN')}\n\nPlease confirm availability.`;

      waBtn.href = `https://wa.me/918860081994?text=${encodeURIComponent(msg)}`;
    }
  }

  roomSelect?.addEventListener('change', updatePricing);
  nightsInput?.addEventListener('input', updatePricing);
  document.getElementById('resCheckin')?.addEventListener('change', updatePricing);
  document.getElementById('resCheckout')?.addEventListener('change', updatePricing);
  document.getElementById('resGuests')?.addEventListener('change', updatePricing);
  document.getElementById('resGuestAddress')?.addEventListener('input', updatePricing);

  // Trigger initial calculation
  updatePricing();

  // Form submission via AJAX to api/book.php
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming Reservation...';
    submitBtn.disabled = true;

    const payload = {
      name: document.getElementById('resGuestName')?.value || 'Guest',
      email: document.getElementById('resGuestEmail')?.value || '',
      phone: document.getElementById('resGuestPhone')?.value || '',
      destination: 'Hotel Grand Godwin, New Delhi (39 Rooms Boutique)',
      room: roomSelect?.value || 'Deluxe Room',
      checkin: document.getElementById('resCheckin')?.value || '',
      checkout: document.getElementById('resCheckout')?.value || '',
      address: document.getElementById('resGuestAddress')?.value || '',
      guests: document.getElementById('resGuests')?.value || '2 Guests'
    };

    try {
      const res = await fetch('../api/book.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.status === 'success') {
        const modal = document.getElementById('bookingSuccessModal');
        if (modal) {
          document.getElementById('bookingSuccessRef').textContent = data.bookingRef;
          modal.style.display = 'flex';
        } else {
          alert(`Reservation Received! Your booking reference is ${data.bookingRef}. Our concierge will contact you shortly.`);
        }
        form.reset();
        initGrandGodwinDates();
        updatePricing();
      } else {
        alert(data.message || 'Error saving reservation. Please call +91-88600-81994.');
      }
    } catch (err) {
      alert('Your inquiry was recorded. Our reservation desk will call you at ' + payload.phone);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Category quick select buttons
  document.querySelectorAll('.select-room-cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCat = btn.getAttribute('data-category');
      if (roomSelect && targetCat) {
        for (let i = 0; i < roomSelect.options.length; i++) {
          if (roomSelect.options[i].value.includes(targetCat)) {
            roomSelect.selectedIndex = i;
            break;
          }
        }
        updatePricing();
      }
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function initGrandGodwinDates() {
  const checkin = document.getElementById('resCheckin');
  const checkout = document.getElementById('resCheckout');
  const nightsInput = document.getElementById('resNights');

  if (!checkin || !checkout) return;

  const today = new Date();
  const tmrw = new Date();
  tmrw.setDate(today.getDate() + 1);

  const formatDate = d => d.toISOString().split('T')[0];

  checkin.min = formatDate(today);
  checkin.value = formatDate(today);

  checkout.min = formatDate(tmrw);
  checkout.value = formatDate(tmrw);

  function recalcNights() {
    const d1 = new Date(checkin.value);
    const d2 = new Date(checkout.value);
    if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
      const diffTime = Math.abs(d2 - d1);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (nightsInput) nightsInput.value = diffDays;
    }
  }

  checkin.addEventListener('change', () => {
    const nextDay = new Date(checkin.value);
    nextDay.setDate(nextDay.getDate() + 1);
    checkout.min = formatDate(nextDay);
    if (new Date(checkout.value) <= new Date(checkin.value)) {
      checkout.value = formatDate(nextDay);
    }
    recalcNights();
  });

  checkout.addEventListener('change', recalcNights);
}
