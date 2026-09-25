# 👑 Godwin Hotels & Resorts — Official Website

> **Quintessential Royal Indian Hospitality**  
> Luxury stays, palatial suites, destination weddings, and award-winning dining across **Haridwar**, **Meerut**, and **Candolim, Goa**.  
> **Engineered for Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO)**.

[![GitHub Repository](https://img.shields.io/badge/GitHub-godwin--hotels--website-gold?logo=github)](https://github.com/rammimankotia-prog/godwin-hotels-website)
[![HTML5 Semantic](https://img.shields.io/badge/HTML5-Semantic%20%26%20Accessible-E34F26?logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![Schema.org](https://img.shields.io/badge/Schema.org-JSON--LD%20%40graph-007acc)](https://schema.org)
[![GEO / AEO Ready](https://img.shields.io/badge/GEO%20%2F%20AEO-AI%20Citability%20100%25-green)](https://schema.org/Hotel)
[![PHP](https://img.shields.io/badge/PHP-7.4+-777BB4?logo=php&logoColor=white)](https://php.net)

---

## 🎯 Architecture & GEO / AEO Highlights

### 1. 🤖 Generative & Answer Engine Optimization (GEO / AEO)
- **Deep Schema.org JSON-LD `@graph`**:
  - `Organization` with legal entity details, logo, phone, email, and social entities.
  - `Hotel` markup for each destination (Haridwar, Meerut, Candolim Goa) with complete NAP, GeoCoordinates (`latitude`/`longitude`), star rating, amenities, price bands, and check-in/out hours.
  - `HotelRoom` schemas with exact occupancy, dimensions, bed types, and pricing.
  - `FAQPage` schema answering high-intent conversational queries asked to AI assistants (ChatGPT, Claude, Perplexity, Google AI Overviews).
  - `AggregateRating` and `Review` schemas for social proof and trust signals.
- **Answer-First Declarative Content**:
  - Direct, factual answers front-loaded at the top of sections in short declarative sentences under ~25 words for instant extraction.
  - Visible "Last Updated: September 2026" freshness tags.
- **Single Source of Truth (`facts-sheet.json`)**:
  - Canonical property facts (amenities, policies, landmark distances) synchronized between the JSON feed, schema markup, and on-page text.
- **AI-Friendly Crawler Access**:
  - `robots.txt` explicitly allows `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, and `Applebot-Extended`.

### 2. 📱 Responsive & Mobile-First Performance
- **Fluid Layout**: Tested across **320px**, **375px**, **768px**, **1024px**, and **1440px** using fluid `clamp()` sizing.
- **Core Web Vitals**:
  - Lazy loading (`loading="lazy"`) and asynchronous decoding (`decoding="async"`) on all imagery.
  - Explicit aspect ratios to prevent Cumulative Layout Shift (CLS < 0.1).
  - Preconnected fonts and stylesheets for fast Largest Contentful Paint (LCP < 2.5s).
- **Initial HTML Rendering**:
  - 100% of facts and content are present in the initial server-side/static HTML, ensuring crawlers that do not run JavaScript can index all content completely.

### 3. 🏨 Booking & Interactive Features
- **Floating Live Booking Engine**: Interactive date pickers, room count, and instant rate checker.
- **Dynamic Reservation Modal**: Real-time nights calculator, add-on options (Buffet breakfast, VIP Airport transfer), and 18% GST calculation.
- **Multi-Currency Converter**: Live currency switching across **INR (₹)**, **USD ($)**, **EUR (€)**, and **AED (د.إ)**.
- **Filterable Destinations**: Real-time property filter for Haridwar, Meerut, and Candolim Goa.
- **Interactive FAQ Accordion**: Conversational Q&A toggle with accessible ARIA states.
- **WhatsApp Concierge Link**: Instant direct guest assistance via WhatsApp.

---

## 📂 Project Structure

```plaintext
Godwin Hotels Website/
├── index.html              # Main semantic HTML5 landing page with Schema.org JSON-LD
├── index.php               # PHP entrypoint for Apache/XAMPP
├── facts-sheet.json        # Canonical single source of truth for GEO / AEO
├── sitemap.xml             # Search & AI crawler XML sitemap
├── robots.txt              # Search engine & AI crawler access directives
├── api/
│   └── book.php            # PHP reservation API handler
├── assets/
│   ├── css/
│   │   └── style.css       # Fluid responsive styles, typography & micro-interactions
│   └── js/
│       └── main.js         # Booking engine, currency converter, FAQ & filters
├── .gitignore              # Git ignore rules
└── README.md               # Master documentation
```

---

## 🚀 Running Locally

### Option 1: Via XAMPP (Apache)
1. Ensure Apache is running in the **XAMPP Control Panel**.
2. Navigate to:
   ```
   http://localhost/Godwin%20Hotels%20Website/
   ```

### Option 2: Static Server
```bash
npx serve .
```

---

## 🌐 Remote Repository

- **Repository**: [https://github.com/rammimankotia-prog/godwin-hotels-website](https://github.com/rammimankotia-prog/godwin-hotels-website)
- **Author**: [Raman Mankotia (@rammimankotia-prog)](https://github.com/rammimankotia-prog)
