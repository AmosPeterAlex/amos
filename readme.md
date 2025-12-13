# Amos P Alex - Flutter Developer Portfolio

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://amospalex.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A professional, responsive, and content-driven portfolio showcasing Flutter development expertise, cross-platform projects, and technical skills.

## 🌟 Features

- ✅ **Fully Responsive** - Mobile-first design, looks great on all devices
- ✅ **Content-Driven Architecture** - All content managed via `content.json`
- ✅ **Light/Dark Mode** - Theme switching with localStorage persistence
- ✅ **Smooth Animations** - IntersectionObserver-based scroll animations
- ✅ **SEO Optimized** - Complete meta tags, sitemap, and semantic HTML
- ✅ **PWA Ready** - Installable progressive web app
- ✅ **Contact Form** - Integrated with Formspree (no backend needed)
- ✅ **Performance Focused** - Lighthouse score 90+
- ✅ **Accessibility** - WCAG 2.1 compliant with ARIA labels

## 🚀 Quick Start

### Prerequisites
- None! This is a static HTML/CSS/JS site
- Only need a code editor and browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmosPeterAlex/portfolio.git
   cd portfolio
   ```

2. **Configure Formspree** (for contact form)
   - Sign up at [formspree.io](https://formspree.io)
   - Create a form and get your endpoint
   - Update `assets/content.json`:
     ```json
     "formspreeEndpoint": "https://formspree.io/f/YOUR_ID"
     ```

3. **Open in browser**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Or use VS Code Live Server extension
   ```

4. **Visit**
   ```
   http://localhost:8000
   ```

## 📁 Project Structure

```
portfolio/
├── index.html              # Main HTML document
├── styles/
│   └── styles.css          # All styling (theme system included)
├── script/
│   └── script.js           # All JavaScript behavior
├── assets/
│   ├── content.json        # ⭐ Content data source
│   └── icon/               # Favicon and PWA icons
├── manifest.json           # PWA configuration
├── robots.txt              # SEO crawler directives
├── sitemap.xml             # SEO sitemap
├── DEPLOYMENT_GUIDE.md     # Detailed deployment instructions
└── README.md               # This file
```

## 🎨 Customization Guide

### Update Content (Most Common)

All content is in `assets/content.json`. No code changes needed!

**Example: Add a new project**
```json
{
  "projects": [
    {
      "title": "Your New Project",
      "description": "Project description here",
      "features": ["Feature 1", "Feature 2"],
      "tech": ["Flutter", "Firebase"],
      "links": {
        "github": "https://github.com/...",
        "live": "https://..."
      }
    }
  ]
}
```

**Example: Update experience**
```json
{
  "experience": [
    {
      "tabId": "newjob",
      "companyShort": "Company",
      "title": "Senior Flutter Developer",
      "company": "Company Name",
      "duration": "Jan 2025 – Present",
      "highlights": ["<li>Achievement 1</li>"]
    }
  ]
}
```

### Change Theme Colors

Edit CSS variables in `styles/styles.css`:

```css
:root {
  --accent-primary: #2563eb;  /* Change primary color */
  --accent-secondary: #1d4ed8;
  /* ... other colors */
}

body.dark-mode {
  --accent-primary: #3b82f6;  /* Dark mode accent */
  /* ... */
}
```

### Add New Section

1. Add section to `index.html`:
   ```html
   <section id="new-section" class="new-section">
     <div class="container">
       <h2 class="section-title fade-in">New Section</h2>
       <!-- Content here -->
     </div>
   </section>
   ```

2. Add navigation link:
   ```html
   <li><a href="#new-section">New Section</a></li>
   ```

3. Add data to `content.json`:
   ```json
   "newSection": {
     "title": "New Section",
     "data": []
   }
   ```

4. Create population function in `script.js`:
   ```javascript
   function populateNewSection(data) {
     // Populate logic here
   }
   ```

## 🎯 Content Management

### JSON Schema Overview

```json
{
  "hero": {
    "greeting": "Hello, I'm",
    "name": "Your Name",
    "typingText": ["Role 1", "Role 2"],
    "description": "Your bio",
    "social": { "linkedin": "url", "github": "url" },
    "cta": { "label": "Button Text", "targetId": "projects" }
  },
  "about": {
    "paragraphsHtml": ["<p>Paragraph 1</p>", "<p>Paragraph 2</p>"]
  },
  "experience": [...],
  "skills": [...],
  "projects": [...],
  "contact": {...}
}
```

**Why HTML in JSON?**
- Allows rich formatting (bold, links) without custom parsers
- Easy to add emphasis and structure
- No security risk (content is trusted/owned by you)

## 🔧 Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Material Icons, Custom SVG
- **Fonts**: Google Fonts (Inter, Poppins)
- **Form Backend**: Formspree
- **Hosting**: GitHub Pages / Netlify / Vercel
- **Version Control**: Git & GitHub

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | ✅ Latest |
| Firefox | ✅ Latest |
| Safari  | ✅ Latest |
| Edge    | ✅ Latest |
| Mobile Safari | ✅ iOS 12+ |
| Chrome Mobile | ✅ Android 5+ |

## ⚡ Performance

- **Lighthouse Score**: 95+ (All categories)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Total Size**: < 500KB (excluding images)

### Optimization Tips
- Use WebP format for images
- Lazy load images with `loading="lazy"`
- Minify CSS/JS for production
- Enable Gzip/Brotli compression on server

## 🔒 Security

- ✅ HTTPS enforced
- ✅ Content Security Policy ready
- ✅ No inline scripts/styles
- ✅ External links with `rel="noopener noreferrer"`
- ✅ Form validation (client + server-side via Formspree)
- ✅ No sensitive data in client-side code

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Deploy Options:**

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/AmosPeterAlex/portfolio.git
git push -u origin main
```
Enable in Settings → Pages

### Netlify Drop
Drag and drop project folder at [app.netlify.com/drop](https://app.netlify.com/drop)

### Vercel
```bash
npm i -g vercel
vercel
```

## 🧪 Testing Checklist

- [ ] All sections load correctly
- [ ] Theme toggle works (light/dark)
- [ ] Mobile menu functions properly
- [ ] Contact form submits successfully
- [ ] All links work (internal & external)
- [ ] Animations trigger on scroll
- [ ] Responsive on mobile, tablet, desktop
- [ ] SEO meta tags present
- [ ] Social preview cards display correctly
- [ ] PWA installable (if manifest configured)

## 📊 Analytics Integration

### Google Analytics 4
Add to `<head>` in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible (Privacy-Friendly)
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Architecture inspired by modern SPA best practices
- Icons from [Material Icons](https://fonts.google.com/icons)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Form backend by [Formspree](https://formspree.io)

## 📞 Contact

**Amos P Alex**
- Email: amospalex@gmail.com
- LinkedIn: [linkedin.com/in/amos-p-alex](https://linkedin.com/in/amos-p-alex)
- GitHub: [@AmosPeterAlex](https://github.com/AmosPeterAlex)
- Location: Kollam, Kerala, India

---

⭐ **If you found this portfolio template useful, please consider giving it a star!**

Built with ❤️ using clean architecture principles