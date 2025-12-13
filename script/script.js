// ========================================
// PORTFOLIO INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  loadPortfolioContent();
  initInteractions();
  initObservers();
  initFormHandling();
});

// ========================================
// THEME MANAGEMENT
// ========================================

function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (prefersDark ? 'dark-mode' : 'light-mode');
  applyTheme(theme);
  
  // Theme toggle button
  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle.addEventListener('click', toggleTheme);
  
  updateThemeIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
  const newTheme = currentTheme === 'dark-mode' ? 'light-mode' : 'dark-mode';
  
  applyTheme(newTheme);
  localStorage.setItem('portfolio-theme', newTheme);
  updateThemeIcon(newTheme);
}

function applyTheme(theme) {
  document.body.classList.remove('light-mode', 'dark-mode');
  document.body.classList.add(theme);
  
  // Update meta theme-color
  const themeColor = theme === 'dark-mode' ? '#0f172a' : '#ffffff';
  document.getElementById('theme-color-meta').setAttribute('content', themeColor);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-toggle .material-icons');
  icon.textContent = theme === 'dark-mode' ? 'light_mode' : 'dark_mode';
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Update active nav link
    updateActiveNavLink();
    
    lastScroll = currentScroll;
  });
  
  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isExpanded = navLinks.classList.contains('active');
    mobileToggle.setAttribute('aria-expanded', isExpanded);
    mobileToggle.querySelector('.material-icons').textContent = isExpanded ? 'close' : 'menu';
  });
  
  // Close mobile menu on link click
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.querySelector('.material-icons').textContent = 'menu';
    });
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 150) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// ========================================
// CONTENT LOADING
// ========================================

let portfolioData = null;

async function loadPortfolioContent() {
  try {
    const response = await fetch('assets/content.json');
    if (!response.ok) throw new Error('Failed to load content');
    
    const data = await response.json();
    portfolioData = data;
    
    populateHero(data.hero);
    populateAbout(data.about, data.valuesGoals);
    populateExperience(data.experience);
    populateProjects(data.projects);
    populateContact(data.contact);
    populateFooter(data.footer);
    
  } catch (error) {
    console.error('Content loading error:', error);
    showContentError();
  }
}

function populateHero(data) {
  document.querySelector('.hero-greeting').textContent = data.greeting;
  document.querySelector('.hero-title').textContent = data.name;
  document.querySelector('.hero-description').textContent = data.description;
  
  // Typing animation
  const typingElement = document.querySelector('.typing-text');
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function typeText() {
    const currentText = data.typingText[textIndex];
    
    if (isDeleting) {
      typingElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % data.typingText.length;
      typeSpeed = 500;
    }
    
    setTimeout(typeText, typeSpeed);
  }
  
  typeText();
  
  // Social links
  document.querySelectorAll('.hero-social a, .footer-social a').forEach(link => {
    const social = link.dataset.social;
    if (data.social[social]) {
      link.href = data.social[social];
    }
  });
  
  // CTA button
  const ctaButton = document.querySelector('.cta-button.primary');
  ctaButton.textContent = data.cta.label;
  ctaButton.href = `#${data.cta.targetId}`;
}

function populateAbout(aboutData, valuesData) {
  const aboutContainer = document.querySelector('.about-paragraphs');
  aboutContainer.innerHTML = aboutData.paragraphsHtml.join('');
  
  document.querySelector('.values-content').innerHTML = valuesData.valuesHtml;
  document.querySelector('.goals-content').innerHTML = valuesData.goalsHtml;
}

function populateExperience(experiences) {
  const tabButtons = document.querySelector('.tab-buttons');
  const tabContent = document.querySelector('.tab-content');
  
  tabButtons.innerHTML = '';
  tabContent.innerHTML = '';
  
  experiences.forEach((exp, index) => {
    // Create tab button
    const button = document.createElement('button');
    button.className = `tab-button ${index === 0 ? 'active' : ''}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', index === 0);
    button.setAttribute('data-tab', exp.tabId);
    button.textContent = exp.companyShort;
    tabButtons.appendChild(button);
    
    // Create tab panel
    const panel = document.createElement('div');
    panel.className = `tab-panel ${index === 0 ? 'active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('data-tab', exp.tabId);
    
    panel.innerHTML = `
      <div class="experience-header">
        <h3 class="experience-title">${exp.title}</h3>
        <p class="experience-company">${exp.company}</p>
        <p class="experience-duration">${exp.duration}</p>
      </div>
      <ul class="experience-highlights">
        ${exp.highlights.join('')}
      </ul>
    `;
    
    tabContent.appendChild(panel);
  });
  
  // Tab switching
  tabButtons.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Update buttons
      tabButtons.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      
      // Update panels
      tabContent.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      tabContent.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    });
  });
}
function populateSkills(skills) {
  const root = document.getElementById('skills-root');
  if (!root) return;
  const chips = skills.map(skill => `
    <button type="button" class="skill-chip fade-in" aria-label="${skill.label}">
      <span class="material-icons">${skill.icon}</span>
      <span class="skill-chip-label">${skill.label}</span>
    </button>
  `).join('');
  root.innerHTML = `<div class="skills-chips">${chips}</div>`;
  root.querySelectorAll('.skills-chips, .skill-chip').forEach(el => el.classList.add('appear'));
  initObservers();
}

function populateProjects(projects) {
  const projectsGrid = document.querySelector('.projects-grid');
  
  projectsGrid.innerHTML = projects.map(project => `
    <div class="project-card fade-in">
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        
        <ul class="project-features">
          ${project.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        
        <div class="project-tech">
          ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        
        <div class="project-links">
          ${project.links.github ? `
            <a href="${project.links.github}" class="project-link primary" target="_blank" rel="noopener">
              <span class="material-icons">code</span>
              View Code
            </a>
          ` : ''}
          ${project.links.live ? `
            <a href="${project.links.live}" class="project-link secondary" target="_blank" rel="noopener">
              <span class="material-icons">launch</span>
              Live Demo
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function populateContact(data) {
  document.querySelector('.contact-title').textContent = data.title;
  document.querySelector('.contact-description').textContent = data.description;
  
  // Direct contact info
  document.querySelector('.contact-email').textContent = data.directContact.email;
  document.querySelector('.contact-email').href = `mailto:${data.directContact.email}`;
  
  document.querySelector('.contact-phone').textContent = data.directContact.phone;
  document.querySelector('.contact-phone').href = `tel:${data.directContact.phone.replace(/\s/g, '')}`;
  
  document.querySelector('.contact-location').textContent = data.directContact.location;
  
  // Form placeholders
  document.getElementById('name').placeholder = data.formFields.namePlaceholder;
  document.getElementById('email').placeholder = data.formFields.emailPlaceholder;
  document.getElementById('message').placeholder = data.formFields.messagePlaceholder;
  document.querySelector('.contact-form button .button-text').textContent = data.formFields.submitText;
  
  // Store Formspree endpoint for form submission
  document.getElementById('contact-form').dataset.formspreeEndpoint = data.formspreeEndpoint;
}

function populateFooter(data) {
  document.querySelector('.footer-copyright').textContent = data.copyright;
  document.querySelector('.footer-tagline').textContent = data.tagline;
}

function showContentError() {
  const hero = document.querySelector('.hero-content');
  hero.innerHTML = `
    <h1>Content Loading Error</h1>
    <p>Unable to load portfolio content. Please refresh the page or contact support.</p>
  `;
}

// ========================================
// INTERSECTION OBSERVER (ANIMATIONS)
// ========================================

function initObservers() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all animated elements
  document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
  });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (portfolioData) {
            populateSkills(portfolioData.skills, portfolioData.skillCategories);
          }
          skillsObserver.unobserve(skillsSection);
        }
      });
    }, { threshold: 0.15 });
    skillsObserver.observe(skillsSection);
  }
}

// ========================================
// FORM HANDLING (FORMSPREE)
// ========================================

function initFormHandling() {
  const form = document.getElementById('contact-form');
  const status = document.querySelector('.form-status');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formspreeEndpoint = form.dataset.formspreeEndpoint;
    
    // Validation check
    if (!formspreeEndpoint || formspreeEndpoint === 'YOUR_FORMSPREE_ENDPOINT_HERE') {
      showFormStatus('error', 'Formspree endpoint not configured. Please update content.json with your Formspree endpoint.');
      return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.querySelector('.button-text').textContent;
    
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.querySelector('.button-text').textContent = 'Sending...';
    
    const formData = new FormData(form);
    
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        showFormStatus('success', 'Thank you for your message! I\'ll get back to you soon.');
        form.reset();
      } else {
        const data = await response.json();
        if (data.errors) {
          showFormStatus('error', data.errors.map(err => err.message).join(', '));
        } else {
          showFormStatus('error', 'Something went wrong. Please try again or email directly.');
        }
      }
    } catch (error) {
      showFormStatus('error', 'Network error. Please check your connection and try again.');
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector('.button-text').textContent = originalText;
    }
  });
}

function showFormStatus(type, message) {
  const status = document.querySelector('.form-status');
  status.className = `form-status ${type}`;
  status.textContent = message;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    status.style.display = 'none';
  }, 5000);
}

// ========================================
// ADDITIONAL INTERACTIONS
// ========================================

function initInteractions() {
  // Prevent FOUC (Flash of Unstyled Content)
  document.body.style.visibility = 'visible';
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape') {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        document.querySelector('.mobile-menu-toggle').setAttribute('aria-expanded', 'false');
        document.querySelector('.mobile-menu-toggle .material-icons').textContent = 'menu';
      }
    }
  });
  
  // External links security
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!link.hasAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
  
  // Add loading indicator for async operations
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ========================================
// PERFORMANCE MONITORING
// ========================================

if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page load time: ${pageLoadTime}ms`);
  });
}

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});
