// ==================== SMOOTH SCROLL & ANIMATIONS ====================

// Animazione di scroll reveal per le card
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Osserva tutte le card
document.querySelectorAll('.feature-card, .travel-card, .about-card, .testimonial-card, .step').forEach(card => {
  card.style.opacity = '0';
  observer.observe(card);
});

// Aggiunta animazione CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
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
`;
document.head.appendChild(style);

// ==================== NAVBAR ACTIVE LINK ====================

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ==================== BUTTON INTERACTIONS ====================

const buttons = document.querySelectorAll('.btn-card');

buttons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Effetto click
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    // Toast notification
    showNotification('Itinerario aggiunto ai preferiti! 🎉');
  });
});

// ==================== NEWSLETTER FORM ====================

const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = newsletterForm.querySelector('.newsletter-input').value;
    
    if (email) {
      showNotification(`Ti sei iscritto con ${email}! ✨`);
      newsletterForm.reset();
    }
  });
}

// ==================== NOTIFICATION SYSTEM ====================

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: #1a4d5c;
    color: white;
    padding: 1rem 1.5rem;
    border: 3px solid #000;
    border-radius: 0;
    box-shadow: 4px 4px 0 #000;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Aggiungi animazioni di notification
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(notificationStyle);

// ==================== PARALLAX EFFECT ====================

const heroSection = document.querySelector('.hero');

if (heroSection) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroCard = document.querySelector('.hero-card');
    
    if (heroCard && scrollY < 600) {
      heroCard.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  });
}

// ==================== COUNTER ANIMATION ====================

const statsSection = document.querySelector('.stats');
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
      animateCounters();
      entry.target.classList.add('counted');
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

if (statsSection) {
  counterObserver.observe(statsSection);
}

function animateCounters() {
  statNumbers.forEach(stat => {
    const text = stat.textContent;
    const number = parseInt(text.replace(/[^0-9]/g, ''));
    const suffix = text.replace(/[0-9]/g, '');
    const target = stat;
    
    let current = 0;
    const increment = number / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= number) {
        target.textContent = number + suffix;
        clearInterval(timer);
      } else {
        target.textContent = Math.floor(current) + suffix;
      }
    }, 30);
  });
}

// ==================== ACTIVE NAV STYLE ====================

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Aggiungi stile per active
const navStyle = document.createElement('style');
navStyle.textContent = `
  .nav-link.active {
    color: #ff6b35;
    border-bottom-color: #ff6b35;
  }
`;
document.head.appendChild(navStyle);

// ==================== MOBILE MENU (OPTIONAL) ====================

// Se desideri aggiungere un menu mobile hamburger in futuro,
// puoi utilizzare questo template:

function setupMobileMenu() {
  const navbar = document.querySelector('.navbar');
  const navMenu = document.querySelector('.navbar-menu');
  
  // Crea il button hamburger
  const hamburger = document.createElement('button');
  hamburger.innerHTML = '☰';
  hamburger.style.cssText = `
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    @media (max-width: 768px) {
      display: block;
    }
  `;
  
  // Toggle menu su mobile
  hamburger.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
  });
}

// ==================== INIT ====================

console.log('🌍 TravelBuddy JavaScript caricato con successo!');
console.log('✨ Animazioni e interazioni attive');