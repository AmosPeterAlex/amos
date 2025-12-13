# Portfolio Deployment Guide for Amos P Alex

## 📋 Pre-Deployment Checklist

### 1. **Formspree Setup** (CRITICAL - Required for Contact Form)
1. Go to [https://formspree.io](https://formspree.io)
2. Sign up for a free account
3. Create a new form
4. Copy your form endpoint (looks like: `https://formspree.io/f/xxxxxxxx`)
5. Open `assets/content.json`
6. Replace `YOUR_FORMSPREE_ENDPOINT_HERE` with your actual endpoint:
   ```json
   "formspreeEndpoint": "https://formspree.io/f/xxxxxxxx"
   ```

### 2. **Icon Assets** (Required)
Create a square logo/avatar image and generate favicons:
- Use [Favicon Generator](https://realfavicongenerator.net/)
- Generate sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Place all icons in `/assets/icon/` folder
- Include `favicon.ico` in the root folder

### 3. **Social Preview Image**
1. Create an Open Graph image (1200x630px recommended)
2. Save as `/assets/preview.jpg`
3. Update meta tags in `index.html` if you change the filename

### 4. **Domain Configuration**
Update all URLs in these files:
- `index.html` - canonical URL and meta tags
- `sitemap.xml` - domain URLs
- `robots.txt` - sitemap URL

---

## 🚀 Deployment Options

### Option A: GitHub Pages (Recommended - Free)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio commit"
   git branch -M main
   git remote add origin https://github.com/AmosPeterAlex/portfolio.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main` / `root`
   - Save and wait 2-3 minutes
   - Access at: `https://amospeteralex.github.io/portfolio/`

3. **Custom Domain (Optional)**
   - Add CNAME file with your domain: `amospalex.com`
   - Configure DNS with your domain provider:
     - A Record: `185.199.108.153`
     - A Record: `185.199.109.153`
     - A Record: `185.199.110.153`
     - A Record: `185.199.111.153`
   - Enable HTTPS in GitHub Pages settings

### Option B: Netlify (Easiest - Free)

1. **Deploy via Netlify Drop**
   - Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop your project folder
   - Get instant live URL

2. **Deploy via Git (Better)**
   - Connect GitHub repository to Netlify
   - Build settings: None needed (static site)
   - Deploy branch: `main`
   - Publish directory: `/` (root)

3. **Custom Domain**
   - Go to Domain settings → Add custom domain
   - Follow DNS configuration instructions

### Option C: Vercel (Fast - Free)

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Or via GitHub**
   - Connect repository at [vercel.com](https://vercel.com)
   - Auto-deploys on every push

### Option D: Traditional Hosting (cPanel/FTP)

1. **Prepare files**
   - Zip entire project folder
   - Or use FTP client (FileZilla)

2. **Upload**
   - Upload all files to `public_html` or `www` directory
   - Ensure `index.html` is in root

3. **Test**
   - Visit your domain
   - Verify all sections load correctly

---

## 🔧 Post-Deployment Configuration

### 1. **Test Contact Form**
- Fill out contact form with test data
- Check email inbox (might go to spam first time)
- Verify Formspree dashboard shows submission

### 2. **SEO Verification**
- Submit sitemap to Google Search Console: `https://yourdomain.com/sitemap.xml`
- Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
- Validate meta tags with [OpenGraph Debugger](https://www.opengraph.xyz/)

### 3. **Performance Check**
- Run [Google PageSpeed Insights](https://pagespeed.web.dev/)
- Target: 90+ score on all metrics
- Fix any issues flagged

### 4. **Browser Testing**
Test on:
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari (Desktop & iOS)
- ✅ Edge

### 5. **Social Preview Testing**
Share on:
- LinkedIn (verify card displays correctly)
- Twitter/X
- Facebook

---

## 📝 Content Updates

### Quick Content Changes
All content is in `assets/content.json` - no code changes needed!

**Common updates:**
1. **Add new project:**
   - Add object to `projects` array in content.json
   - Push to GitHub (auto-deploys if using Netlify/Vercel)

2. **Update experience:**
   - Modify `experience` array
   - Add new highlights

3. **Change social links:**
   - Update `hero.social` URLs

### Pushing Updates
```bash
git add .
git commit -m "Update project portfolio"
git push origin main
```
(Auto-deploys if using GitHub Pages/Netlify/Vercel)

---

## 🔒 Security Best Practices

1. **Never commit sensitive data**
   - No API keys in public repos
   - Formspree endpoint is safe (it's meant to be public)

2. **HTTPS Only**
   - Always use HTTPS (automatic with modern hosts)
   - Update meta tags to reflect HTTPS URLs

3. **Content Security**
   - Keep dependencies updated
   - Validate form inputs (already done in JS)

---

## 📊 Analytics Setup (Optional)

### Google Analytics 4
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to `<head>` in `index.html`:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

### Plausible Analytics (Privacy-Friendly)
1. Sign up at [plausible.io](https://plausible.io)
2. Add script to `<head>`:
   ```html
   <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
   ```

---

## 🐛 Troubleshooting

### Issue: Contact form not working
- **Solution:** Verify Formspree endpoint in content.json is correct
- Check browser console for errors
- Test Formspree endpoint directly

### Issue: Images not loading
- **Solution:** Check file paths are correct (`/assets/...`)
- Verify images exist in assets folder
- Check file extensions match (case-sensitive on Linux)

### Issue: Theme not persisting
- **Solution:** Clear browser cache and localStorage
- Check browser console for errors

### Issue: Mobile menu stuck open
- **Solution:** Hard refresh page (Ctrl+Shift+R)
- Check JavaScript console for errors

---

## 📞 Support Resources

- **Formspree Issues:** [https://help.formspree.io](https://help.formspree.io)
- **GitHub Pages:** [https://docs.github.com/pages](https://docs.github.com/pages)
- **Netlify Support:** [https://docs.netlify.com](https://docs.netlify.com)
- **HTML/CSS/JS Reference:** [MDN Web Docs](https://developer.mozilla.org)

---

## ✅ Final Checklist Before Going Live

- [ ] Formspree endpoint configured and tested
- [ ] All icons generated and uploaded
- [ ] Social preview image created
- [ ] Domain URLs updated everywhere
- [ ] Contact form tested successfully
- [ ] All sections display correctly
- [ ] Mobile responsiveness verified
- [ ] Theme switching works
- [ ] All external links open in new tab
- [ ] SEO meta tags verified
- [ ] sitemap.xml submitted to Google
- [ ] Performance score > 90
- [ ] Shared on LinkedIn to verify preview card

---

## 🎉 You're Ready to Launch!

Once all checklist items are complete, your portfolio is production-ready. Share it proudly on LinkedIn, GitHub profile, and resume!

**Live URL Pattern Examples:**
- GitHub Pages: `https://amospeteralex.github.io/portfolio/`
- Netlify: `https://amospalex.netlify.app`
- Custom Domain: `https://amospalex.com`

Good luck! 🚀