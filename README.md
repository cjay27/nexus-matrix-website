# Nexus Matrix — AI Solutions & Development Company

Corporate website for **Nexus Matrix**, an enterprise AI development company offering LLM development, generative AI, RAG pipelines, ML engineering, and AI consulting to global B2B clients.

Live site: [nexusmatrix.com](https://nexusmatrix.com)

---

## Project Structure

```
nexus-matrix/
├── index.html                        # Homepage
├── about.html                        # About page
├── contact.html                      # Contact page
├── faq.html                          # FAQ page
├── privacy-policy.html               # Privacy policy
├── terms-of-service.html             # Terms of service
├── 404.html                          # Custom 404 page
│
├── services/                         # Services section
│   ├── index.html                    # Services overview
│   ├── generative-ai-development/    # Generative AI service page
│   ├── llm-development/              # LLM development service page
│   └── rag-development/              # RAG development service page
│
├── industries/                       # Industries section
│   ├── index.html                    # Industries overview
│   ├── fintech-banking/
│   ├── healthcare/
│   └── retail-ecommerce/
│
├── hire-ai-developers/               # Hiring section
│   ├── index.html
│   ├── generative-ai-developers/
│   ├── llm-engineers/
│   └── machine-learning-engineers/
│
├── css/
│   └── global.css                    # Single global stylesheet
├── js/
│   └── main.js                       # Global JavaScript
├── php/
│   └── contact.php                   # Contact form handler
├── images/                           # Site images
│
├── sitemap.xml                       # Sitemap index
├── sitemap-pages.xml                 # Core page URLs
├── sitemap-services.xml              # Service page URLs
├── sitemap-industries.xml            # Industry page URLs
├── robots.txt                        # Crawler directives
└── .htaccess                         # Apache server config
```

---

## Services Covered

| Category | Services |
|---|---|
| Generative AI | Generative AI Development, LLM Development, LLM Fine-Tuning, Prompt Engineering |
| AI Agents & Apps | AI Agent Development, AI Chatbot Development, AI Copilot Development, AI App Development |
| ML & Data | Machine Learning, Deep Learning, NLP, Computer Vision, Speech Recognition, Predictive Analytics |
| Infrastructure | MLOps, Data Engineering, AI Model Training, AI Integration, AI Automation |
| Strategy | AI Consulting, Custom AI Software, AI PoC/MVP Development, Recommendation Systems |

## Industries Served

Healthcare · Fintech & Banking · Insurance · Retail & E-commerce · Manufacturing · Logistics · Automotive · Real Estate · Education · Travel · Media · Legal · HR & Recruitment · Energy · Agriculture · Telecom · Gaming · Cybersecurity

---

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (no framework dependencies)
- **Font:** [Orbitron](https://fonts.google.com/specimen/Orbitron) (Google Fonts)
- **Backend:** PHP (contact form)
- **Server:** Apache (`.htaccess` configuration)
- **SEO:** Schema.org structured data, Open Graph, Twitter Cards, XML sitemaps

---

## Getting Started

No build step required — this is a static site with a single PHP endpoint.

**Local development (any static server):**
```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

Open `http://localhost:8000` in your browser.

**Contact form** (`php/contact.php`) requires a PHP-enabled server or hosting environment to function.

---

## SEO

- XML sitemaps split by content type (pages, services, industries)
- Canonical URLs set on every page
- Structured data (Organization, WebSite, WebPage schemas) via JSON-LD
- `robots.txt` configured for full crawl access
- Open Graph and Twitter Card meta tags on all pages
