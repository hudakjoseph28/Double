// Glow trail effect for CTA button
const btn = document.querySelector('.btn-glow-trail');
if (btn) {
  btn.style.position = 'relative';
  const trail = document.createElement('span');
  trail.className = 'glow-trail';
  btn.appendChild(trail);

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    trail.style.setProperty('--x', `${x}px`);
    trail.style.setProperty('--y', `${y}px`);
    trail.style.opacity = '1';
  });
  btn.addEventListener('mouseleave', () => {
    trail.style.opacity = '0';
  });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  handleScrollAnimations();
});

// Sidebar animation and interaction logic
document.addEventListener('DOMContentLoaded', () => {
  const sidebarHeartTrigger = document.getElementById('sidebarHeartTrigger');
  const sidebar = document.getElementById('infoSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarSections = document.querySelectorAll('.sidebar-section');

  // Set up section animation delays
  sidebarSections.forEach((section, index) => {
    section.style.setProperty('--section-index', index);
  });

  function openSidebar() {
    sidebar.style.transform = 'translateX(0)';
    sidebar.setAttribute('aria-hidden', 'false');
    sidebarHeartTrigger.setAttribute('aria-expanded', 'true');
    sidebarBackdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Reset and trigger animations
    sidebarSections.forEach(section => {
      section.style.animation = 'none';
      section.offsetHeight; // Force reflow
      section.style.animation = null;
    });
    
    // Initialize sidebar heart logo animation
    initSidebarHeartLogo();
    
    sidebar.focus();
  }

  function closeSidebar() {
    sidebar.style.transform = 'translateX(100%)';
    sidebar.setAttribute('aria-hidden', 'true');
    sidebarHeartTrigger.setAttribute('aria-expanded', 'false');
    sidebarBackdrop.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (sidebarHeartTrigger && sidebar && sidebarBackdrop && sidebarClose) {
    sidebarHeartTrigger.addEventListener('click', (e) => {
      if (sidebar.getAttribute('aria-hidden') === 'true') {
        openSidebar();
      } else {
        closeSidebar();
      }
    });

    sidebarClose.addEventListener('click', closeSidebar);
    sidebarBackdrop.addEventListener('click', closeSidebar);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });

    // Trap focus in sidebar
    sidebar.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusable = sidebar.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    });
  }

  // Initialize sidebar heart logo
  function initSidebarHeartLogo() {
    const canvas = document.getElementById('sidebarHeartLogo');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Animation parameters
    const DURATION = 1200; // ms
    const SCALE_MIN = 1.0;
    const SCALE_MAX = 1.1;
    const GLOW_MIN = 8;
    const GLOW_MAX = 24;
    const LINE_MIN = 3;
    const LINE_MAX = 5;

    // Heart positions
    const cx1 = w / 2 - 22;
    const cy1 = h / 2 - 8;
    const cx2 = w / 2 + 22;
    const cy2 = h / 2 - 8;
    const size = 28;

    function drawHeartOutline(ctx, color, cx, cy, size, lineWidth, glow) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.25);
      ctx.bezierCurveTo(
        cx, cy,
        cx - size, cy,
        cx - size, cy + size * 0.6
      );
      ctx.bezierCurveTo(
        cx - size, cy + size * 1.1,
        cx, cy + size * 1.4,
        cx, cy + size * 1.8
      );
      ctx.bezierCurveTo(
        cx, cy + size * 1.4,
        cx + size, cy + size * 1.1,
        cx + size, cy + size * 0.6
      );
      ctx.bezierCurveTo(
        cx + size, cy,
        cx, cy,
        cx, cy + size * 0.25
      );
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
      ctx.stroke();
      ctx.restore();
    }

    function getPulse(t) {
      const phase = (t % DURATION) / DURATION;
      const scale = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
      const glow = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
      const line = LINE_MIN + (LINE_MAX - LINE_MIN) * 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
      return { scale, glow, line };
    }

    function render() {
      const now = performance.now();
      const { scale, glow, line } = getPulse(now);
      ctx.clearRect(0, 0, w, h);

      // Draw left (blue) heart
      ctx.save();
      ctx.translate(cx1, cy1);
      ctx.scale(scale, scale);
      drawHeartOutline(ctx, '#2B3F87', 0, 0, size, line, glow);
      ctx.restore();

      // Draw right (pink) heart
      ctx.save();
      ctx.translate(cx2, cy2);
      ctx.scale(scale, scale);
      drawHeartOutline(ctx, '#ff407f', 0, 0, size, line, glow);
      ctx.restore();

      requestAnimationFrame(render);
    }

    render();
  }
});

const stepCards = [
  `<div class="sidebar-step-card"><span style='font-size:1.13em; color:#ff407f; font-weight:700;'>Double</span> is the fun, safe, and social way to meet new people – bring your best friend and team up for authentic double dates on campus.</div>`,
  `<div class="sidebar-step-card" style='color:#FFD700;'>79%<span style='display:block;font-size:0.8em;color:#fff;font-weight:400;'>don't use dating apps</span></div>`,
  `<div class="sidebar-step-card" style='color:#ff407f;'>84%<span style='display:block;font-size:0.8em;color:#fff;font-weight:400;'>have been ghosted</span></div>`,
  `<div class="sidebar-step-card" style='color:#2B3F87;'>48%<span style='display:block;font-size:0.8em;color:#fff;font-weight:400;'>say double dates ease anxiety</span></div>`,
  `<div class="sidebar-step-card"><ul style='list-style:none; padding:0; margin:0;'><li style='margin-bottom: 6px;'><span style='color:#ff407f; font-weight:700;'>Safer, more comfortable, and more genuine dating experience</span></li><li style='margin-bottom: 6px;'>Meet <span style='color:#FFD700; font-weight:700;'>twice the singles</span> in half the time</li><li style='margin-bottom: 6px;'>Dating with a <span style='color:#2B3F87; font-weight:700;'>built-in safety net</span></li></ul></div>`,
  `<div class="sidebar-step-card"><span style='color:#ff407f; font-weight:700;'>Team up. Match up. Double up.</span> <br/><span style='color:#FFD700; font-weight:600;'>Less awkward. More awesome.</span></div>`
];
let currentStep = 0;

function renderStep() {
  sidebarSteps.innerHTML = stepCards.map((card, i) =>
    card.replace('sidebar-step-card"', `sidebar-step-card${i === currentStep ? ' active' : ''}"`)
  ).join('');
  sidebarPrev.disabled = currentStep === 0;
  sidebarNext.disabled = currentStep === stepCards.length - 1;
}

// Heart Navigation Logic
document.addEventListener('DOMContentLoaded', () => {
  const heartBtns = document.querySelectorAll('.heart-btn');
  const sections = document.querySelectorAll('section[id]');
  
  // Smooth scroll to section
  heartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-section');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });

    // Add entrance animation
    btn.style.opacity = '0';
    btn.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      btn.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      btn.style.opacity = '1';
      btn.style.transform = 'translateX(0)';
    }, 300 + Array.from(heartBtns).indexOf(btn) * 100);
  });

  // Intersection Observer for scroll spy
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeSection = entry.target.id;
        heartBtns.forEach(btn => {
          btn.classList.toggle('active', 
            btn.getAttribute('data-section') === activeSection
          );
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
});

// Scroll Indicator Logic
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const heartSteps = document.querySelectorAll('.heart-step');
  let lastScrollTop = 0;
  let ticking = false;

  function updateActiveStep() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        heartSteps.forEach(step => step.classList.remove('active'));
        heartSteps[index]?.classList.add('active');
      }
    });

    lastScrollTop = window.scrollY;
    ticking = false;
  }

  // Smooth scroll to section
  heartSteps.forEach(step => {
    step.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = step.getAttribute('data-section');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });

    // Add entrance animation
    step.style.opacity = '0';
    step.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      step.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      step.style.opacity = '1';
      step.style.transform = 'translateX(0)';
    }, 300 + Array.from(heartSteps).indexOf(step) * 100);
  });

  // Optimize scroll performance with requestAnimationFrame
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveStep();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial state
  updateActiveStep();
});

// Floating Nav Logic
document.addEventListener('DOMContentLoaded', () => {
  const floatingNav = document.querySelector('.floating-nav');
  const navToggle = floatingNav.querySelector('.floating-nav-toggle');
  const navItems = floatingNav.querySelectorAll('.nav-item');
  
  // Toggle nav menu
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    floatingNav.querySelector('.floating-nav-menu').setAttribute('aria-hidden', isExpanded);
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!floatingNav.contains(e.target)) {
      navToggle.setAttribute('aria-expanded', 'false');
      floatingNav.querySelector('.floating-nav-menu').setAttribute('aria-hidden', 'true');
    }
  });

  // Smooth scroll to sections
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-section');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navToggle.setAttribute('aria-expanded', 'false');
        floatingNav.querySelector('.floating-nav-menu').setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Hide/show nav based on scroll direction
  let lastScroll = window.scrollY;
  let isNavVisible = true;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > lastScroll && currentScroll > 100) {
      // Scrolling down & not at top
      if (isNavVisible) {
        floatingNav.style.transform = 'translateY(100px)';
        isNavVisible = false;
      }
    } else {
      // Scrolling up or at top
      if (!isNavVisible) {
        floatingNav.style.transform = 'translateY(0)';
        isNavVisible = true;
      }
    }
    
    lastScroll = currentScroll;
  });
});

// Neon glow/flicker for 'double date' in hero subtitle
(function() {
  const subtitle = document.querySelector('.subtitle');
  if (!subtitle) return;
  const highlight = subtitle.querySelector('.highlight-glow');
  if (!highlight) return;
  let triggered = false;
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !triggered) {
        highlight.classList.add('glow');
        triggered = true;
        setTimeout(() => highlight.classList.remove('glow'), 1100);
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(subtitle);
})();

// Handle scroll animations
function handleScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);
        
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });
  
  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// Heart Navigation Scroll Functionality
document.addEventListener('DOMContentLoaded', () => {
  // Get elements
  const navSidebarTrigger = document.getElementById('navSidebarTrigger');
  const sidebarHeartTrigger = document.getElementById('sidebarHeartTrigger');
  const sidebar = document.getElementById('infoSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  
  // Connect the new nav sidebar trigger to the sidebar toggle functionality
  if (navSidebarTrigger && sidebar && sidebarBackdrop) {
    navSidebarTrigger.addEventListener('click', (e) => {
      const isHidden = sidebar.getAttribute('aria-hidden') === 'true';
      
      if (isHidden) {
        // Open sidebar
        sidebar.style.transform = 'translateX(0)';
        sidebar.setAttribute('aria-hidden', 'false');
        navSidebarTrigger.setAttribute('aria-expanded', 'true');
        sidebarBackdrop.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Initialize sidebar heart logo animation
        initSidebarHeartLogo();
        
        sidebar.focus();
      } else {
        // Close sidebar
        sidebar.style.transform = 'translateX(100%)';
        sidebar.setAttribute('aria-hidden', 'true');
        navSidebarTrigger.setAttribute('aria-expanded', 'false');
        sidebarBackdrop.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
  
  // Hide the old sidebar heart trigger if it exists (we're replacing it with the nav trigger)
  if (sidebarHeartTrigger) {
    sidebarHeartTrigger.style.display = 'none';
  }
  
  // Initialize the visibility of the nav button
  const updateButtonVisibility = () => {
    if (!navSidebarTrigger) return;
    
    const scrollPosition = window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    
    // Always show the button, but handle edge cases
    navSidebarTrigger.style.opacity = '1';
    navSidebarTrigger.style.pointerEvents = 'auto';
    
    // Hide button near the bottom of the page
    if (scrollPosition + viewportHeight > pageHeight - 100) {
      navSidebarTrigger.style.opacity = '0.5';
    }
  };
  
  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateButtonVisibility);
  });
  
  // Initial visibility check
  updateButtonVisibility();
}); 