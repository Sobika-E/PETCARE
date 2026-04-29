// Animation utilities for professional UI interactions

// Intersection Observer for scroll animations
export const observeElements = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe all elements with fade-in class
  const elements = document.querySelectorAll('.fade-in');
  elements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });

  return observer;
};

// Stagger animation for multiple elements
export const staggerAnimation = (elements, delay = 100) => {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * delay);
  });
};

// Smooth scroll to element
export const smoothScrollTo = (elementId, offset = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// Loading animation
export const showLoadingAnimation = (element) => {
  element.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--gray-600);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="animation: spin 1s linear infinite">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      Loading...
    </div>
  `;
};

// Success animation
export const showSuccessAnimation = (element, message) => {
  element.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #10b981;
      font-weight: 600;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4"></path>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.9.37 4.13 1.02"></path>
      </svg>
      ${message}
    </div>
  `;
};

// Error animation
export const showErrorAnimation = (element, message) => {
  element.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #ef4444;
      font-weight: 600;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      ${message}
    </div>
  `;
};

// Parallax effect
export const initParallax = () => {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach((element) => {
      const speed = element.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
};

// Typing animation
export const typeWriter = (element, text, speed = 50) => {
  let i = 0;
  element.innerHTML = '';
  
  const timer = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
};

// Counter animation
export const animateCounter = (element, target, duration = 2000) => {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    element.textContent = Math.floor(start);
    
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, 16);
};

// CSS Animation keyframes
export const addAnimationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translateY(0);
      }
      40%, 43% {
        transform: translateY(-30px);
      }
      70% {
        transform: translateY(-15px);
      }
      90% {
        transform: translateY(-4px);
      }
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out;
    }
    
    .animate-fade-in-left {
      animation: fadeInLeft 0.6s ease-out;
    }
    
    .animate-fade-in-right {
      animation: fadeInRight 0.6s ease-out;
    }
    
    .animate-scale-in {
      animation: scaleIn 0.4s ease-out;
    }
    
    .animate-slide-in-down {
      animation: slideInDown 0.5s ease-out;
    }
    
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    
    .animate-bounce {
      animation: bounce 1s infinite;
    }
    
    .animate-delay-100 {
      animation-delay: 0.1s;
    }
    
    .animate-delay-200 {
      animation-delay: 0.2s;
    }
    
    .animate-delay-300 {
      animation-delay: 0.3s;
    }
    
    .animate-delay-400 {
      animation-delay: 0.4s;
    }
    
    .animate-delay-500 {
      animation-delay: 0.5s;
    }
  `;
  document.head.appendChild(style);
};

// Initialize all animations
export const initAnimations = () => {
  addAnimationStyles();
  observeElements();
  initParallax();
};
