// Utility functions
const utils = {
    async copyToClipboard(text, successCallback) {
        try {
            await navigator.clipboard.writeText(text);
            successCallback?.();
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    },

    debounce(func, wait) {
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
};

// Class to handle custom cursors
class CustomCursor {
    constructor(cursorSelector, triggerSelectors) {
        this.cursor = document.querySelector(cursorSelector);
        this.triggers = document.querySelectorAll(triggerSelectors);
        
        if (!this.cursor || !this.triggers.length) return;
        
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isHovering = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        requestAnimationFrame(this.animate.bind(this));
    }

    updatePosition(e) {
        this.targetX = e.clientX;
        this.targetY = e.clientY;
        this.cursor.style.setProperty('--mouse-x', `${this.targetX}px`);
        this.cursor.style.setProperty('--mouse-y', `${this.targetY}px`);
    }

    animate() {
        if (this.isHovering) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            this.currentX += dx / 8;
            this.currentY += dy / 8;
            this.cursor.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
        }
        requestAnimationFrame(this.animate.bind(this));
    }

    bindEvents() {
        document.addEventListener('mousemove', this.updatePosition.bind(this));
        
        this.triggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                this.isHovering = true;
                this.cursor.classList.remove('leaving');
                this.cursor.classList.add('active');
                this.cursor.style.display = 'block';
                this.cursor.style.opacity = '1';
            });

            trigger.addEventListener('mouseleave', () => {
                this.isHovering = false;
                this.cursor.classList.remove('active');
                this.cursor.classList.add('leaving');
                
                const handleAnimationEnd = () => {
                    if (!this.isHovering) {
                        this.cursor.style.display = 'none';
                        this.cursor.classList.remove('leaving');
                    }
                    this.cursor.removeEventListener('animationend', handleAnimationEnd);
                };
                
                this.cursor.addEventListener('animationend', handleAnimationEnd);
            });
        });
    }
}

// Class to handle email button state
class EmailButton {
    constructor(buttonSelector, email) {
        this.button = document.querySelector(buttonSelector);
        this.wrapper = this.button?.querySelector('.text-wrapper');
        this.texts = this.button?.querySelectorAll('.text');
        this.email = email;
        this.copyTimeout = null;
        
        if (!this.button || !this.wrapper || !this.texts) return;
        
        this.init();
    }

    init() {
        this.updateWrapperWidth(this.texts[0]);
        this.bindEvents();
    }

    updateWrapperWidth(activeText) {
        this.wrapper.style.width = `${activeText.offsetWidth}px`;
    }

    setActiveText(type) {
        this.texts.forEach(text => {
            if (text.dataset.text === type) {
                text.classList.add('active');
                text.classList.remove('exit');
                this.updateWrapperWidth(text);
            } else if (text.classList.contains('active')) {
                text.classList.remove('active');
                text.classList.add('exit');
            } else {
                text.classList.remove('active', 'exit');
            }
        });
    }

    bindEvents() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.button.classList.add('scrolled');
                this.setActiveText('email');
            } else {
                this.button.classList.remove('scrolled');
                this.setActiveText('initial');
            }
        });

        this.button.addEventListener('click', async () => {
            if (!this.button.classList.contains('scrolled')) return;
            
            await utils.copyToClipboard(this.email, () => {
                this.setActiveText('copied');
                clearTimeout(this.copyTimeout);
                this.copyTimeout = setTimeout(() => {
                    if (this.button.classList.contains('scrolled')) {
                        this.setActiveText('email');
                    }
                }, 2000);
            });
        });
    }
}

// Class to handle testimonials
class TestimonialsCarousel {
    constructor(containerSelector, itemSelector, rotationInterval = 6400) {
        this.container = document.querySelector(containerSelector);
        this.testimonials = document.querySelectorAll(itemSelector);
        this.currentIndex = 0;
        this.rotationInterval = rotationInterval;
        
        if (!this.container || !this.testimonials.length) return;
        
        this.init();
    }

    init() {
        this.setContainerHeight();
        this.changeTestimonial();
        window.addEventListener('resize', utils.debounce(() => this.setContainerHeight(), 250));
        setInterval(() => this.changeTestimonial(), this.rotationInterval);
    }

    setContainerHeight() {
        const maxHeight = Math.max(...Array.from(this.testimonials).map(item => item.offsetHeight));
        this.container.style.height = `${maxHeight}px`;
    }

    changeTestimonial() {
        const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.testimonials[this.currentIndex]?.classList.remove('testimonial-state-active');
        this.testimonials[nextIndex]?.classList.add('testimonial-state-active');
        this.currentIndex = nextIndex;
    }
}

// Class to handle FAQ
class FAQ {
    constructor() {
        this.init();
    }

    init() {
        // Initialize all answers with 0 height and transition
        document.querySelectorAll('.answer-item').forEach(answer => {
            answer.style.height = '0px';
            answer.style.transition = 'height 0.3s ease-in-out';
        });

        document.querySelectorAll('.question-item').forEach(question => {
            question.addEventListener('click', () => {
                const container = question.closest('.faq-item-container');
                const answer = container.querySelector('.answer-item');
                const icon = question.querySelector('.question-icon');
                
                // Close all other answers
                document.querySelectorAll('.answer-item').forEach(item => {
                    if (item !== answer && item.classList.contains('active')) {
                        const otherIcon = item.closest('.faq-item-container').querySelector('.question-icon');
                        item.style.height = '0px';
                        item.classList.remove('active');
                        otherIcon.textContent = '+';
                    }
                });
                
                // Toggle current answer with height animation
                if (!answer.classList.contains('active')) {
                    answer.classList.add('active');
                    answer.style.height = answer.scrollHeight + 'px';
                    icon.textContent = '-';
                } else {
                    answer.style.height = '0px';
                    answer.classList.remove('active');
                    icon.textContent = '+';
                }
            });
        });
    }
}

// Class to handle trail effect
class TrailEffect {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            images: options.images || [],
            numberOfImages: options.numberOfImages || 5,
            delay: options.delay || 80,
            duration: options.duration || 800
        };
        
        if (!this.container || !this.options.images.length) return;
        
        this.imageSequence = this.options.images;
        this.images = [];
        this.currentIndex = 0;
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        // Pre-create all trail elements
        for (let i = 0; i < this.options.numberOfImages; i++) {
            const img = document.createElement('img');
            img.src = this.imageSequence[i % this.imageSequence.length];
            img.className = 'trail-image';
            img.setAttribute('aria-hidden', 'true');
            img.setAttribute('role', 'presentation');
            this.container.appendChild(img);
            this.images.push({
                element: img,
                isActive: false
            });
        }
        
        // Throttled mousemove handler
        const throttledUpdate = this.throttle((e) => {
            const rect = this.container.getBoundingClientRect();
            this.updateTrail(e.clientX - rect.left, e.clientY - rect.top);
        }, this.options.delay);
        
        this.container.addEventListener('mousemove', throttledUpdate);
    }
    
    updateTrail(x, y) {
        const currentImage = this.images[this.currentIndex];
        
        // Reset animation
        currentImage.element.classList.remove('animate');
        void currentImage.element.offsetHeight; // Force reflow
        
        // Position image
        currentImage.element.style.left = `${x}px`;
        currentImage.element.style.top = `${y}px`;
        
        // Start new animation
        currentImage.element.classList.add('animate');
        
        // Update index
        this.currentIndex = (this.currentIndex + 1) % this.options.numberOfImages;
    }
    
    // Throttle utility to limit execution rate
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const marqueeTrack = document.querySelector('.header-marquee-track');
    const marqueeContainer = document.querySelector('.header-marquee-container');
    
    // Configuration
    let animationId;
    let trackPosition = 0;
    const normalSpeed = 1; // pixels per frame
    const hoverSpeed = 0.1; // extremely slow speed on hover
    let currentSpeed = normalSpeed;
    let targetSpeed = normalSpeed;
    const speedTransitionFactor = 0.08; // Controls how quickly the speed transitions (lower = smoother)
    
    // Intro animation variables
    let isIntroPlaying = true;
    let introProgress = 0;
    const introDuration = 1400; // milliseconds
    let introStartTime;
    
    // Clone images for infinite scrolling
    function createDuplicates() {
      // Add intro animation class
      marqueeTrack.classList.add('intro-animation');
      
      // Get all original items
      const originalItems = document.querySelectorAll('.header-marquee-item');
      
      // Create three copies to ensure enough content for seamless infinite scrolling
      for (let i = 0; i < 4; i++) {
        originalItems.forEach(item => {
          const clone = item.cloneNode(true);
          marqueeTrack.appendChild(clone);
        });
      }
      
      // Set initial opacity
      marqueeTrack.style.opacity = '1';
    }
    
    // Intro animation
    function playIntroAnimation(timestamp) {
      if (!introStartTime) introStartTime = timestamp;
      const elapsed = timestamp - introStartTime;
      introProgress = Math.min(elapsed / introDuration, 1);
      
      // Easing function for smooth acceleration
      const easeOutQuad = t => t * (2 - t);
      const easedProgress = easeOutQuad(introProgress);
      
      // Calculate intro position (moves from right to left)
      const startX = window.innerWidth;
      const targetX = 0;
      const currentX = startX - (startX - targetX) * easedProgress;
      
      // Get the original items (first set only)
      const items = Array.from(document.querySelectorAll('.header-marquee-item')).slice(0, 8);
      
      // Apply dynamic margins during animation
      items.forEach((item, index) => {
        // Get the standard margin (10px)
        const standardMargin = 6;
        
        // Define custom starting margins for the first few items
        let startMargin = standardMargin;
        if (index === 0) startMargin = 320;
        else if (index === 1) startMargin = 160;
        else if (index === 2) startMargin = 80;
        
        // Interpolate between custom and standard margin
        const rightMargin = startMargin - (startMargin - standardMargin) * easedProgress;
        
        // Apply the calculated margin (keeping left margin standard)
        item.style.marginRight = `${rightMargin}px`;
        item.style.marginLeft = `${standardMargin}px`;
      });
      
      // Apply transformations for the entire track
      marqueeTrack.style.transform = `translateX(${currentX}px)`;
      
      if (introProgress < 1) {
        // Continue intro animation
        requestAnimationFrame(playIntroAnimation);
      } else {
        // Intro complete, reset margins to standard
        items.forEach(item => {
          item.style.margin = `0 ${6}px`;
        });
        
        // Start normal marquee
        isIntroPlaying = false;
        marqueeTrack.classList.remove('intro-animation');
        trackPosition = 0; // Reset position for marquee start
        animateMarquee();
      }
    }
    
    // Regular marquee animation
    function animateMarquee() {
        // Smooth transition between speeds
        if (currentSpeed !== targetSpeed) {
            currentSpeed += (targetSpeed - currentSpeed) * speedTransitionFactor;
            
            if (Math.abs(currentSpeed - targetSpeed) < 0.001) {
                currentSpeed = targetSpeed;
            }
        }
        
        trackPosition -= currentSpeed;
        
        // Calculate the total width including margins
        const items = document.querySelectorAll('.header-marquee-item');
        const itemStyle = window.getComputedStyle(items[0]);
        const itemWidth = items[0].offsetWidth;
        const itemMarginLeft = parseInt(itemStyle.marginLeft);
        const itemMarginRight = parseInt(itemStyle.marginRight);
        const itemTotalWidth = itemWidth + itemMarginLeft + itemMarginRight;
        
        // Calculate single set width (original items only)
        const originalItemCount = items.length / 4; // Divide by 4 (original + 3 copies)
        const singleSetWidth = originalItemCount * itemTotalWidth;
        
        // Reset position when a complete set has scrolled
        if (Math.abs(trackPosition) >= singleSetWidth) {
            trackPosition = 0;
        }
        
        marqueeTrack.style.transform = `translateX(${trackPosition}px)`;
        animationId = requestAnimationFrame(animateMarquee);
    }
    
    // Initialize
    createDuplicates();
    requestAnimationFrame(playIntroAnimation);
    
    // Set target speed on hover (will transition smoothly)
    marqueeContainer.addEventListener('mouseenter', () => {
      if (!isIntroPlaying) {
        targetSpeed = hoverSpeed; // Target the super slow speed
      }
    });
    
    // Set target speed on mouse leave (will transition smoothly)
    marqueeContainer.addEventListener('mouseleave', () => {
      if (!isIntroPlaying) {
        targetSpeed = normalSpeed; // Target the normal speed
      }
    });
  });




  const config = {
    repetitions: 16,
    delay: 200,
    animationDuration: 3000 // Duration in milliseconds
};

function createAnimations() {
    const container = document.getElementById('animation-helix');
    const template = `
        <div class="vertical-line"></div>
        <div class="circle top"></div>
        <div class="circle bottom"></div>
    `;

    for (let i = 0; i < config.repetitions; i++) {
        const div = document.createElement('div');
        div.className = 'helix-container';
        div.innerHTML = template;

        const delayTime = -(config.repetitions - 1) * (config.delay/1000) + (i * (config.delay/1000));
        
        div.querySelector('.vertical-line').style.animation = `helix-scaleLine ${config.animationDuration/4}ms ease-in infinite ${delayTime}s alternate`;
        div.querySelector('.top').style.animation = `helix-moveTop ${config.animationDuration}ms ease-in-out infinite ${delayTime}s`;
        div.querySelector('.bottom').style.animation = `helix-moveBottom ${config.animationDuration}ms ease-in-out infinite ${delayTime}s`;
        
        container.appendChild(div);
    }
}

createAnimations();










// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize custom cursors
    new CustomCursor('.cursor-animation-flame', '.flask-container');
    new CustomCursor('.cursor-animation-eye', '.project-item');
    
    // Initialize email button
    new EmailButton('.content-email-button', 'hello@adriengervaix.com');
    
    // Initialize testimonials
    new TestimonialsCarousel('.clients-testimonials-container', '.testimonial-item');
    
    // Initialize FAQ
    new FAQ();
    
    // Initialize trail effect
    new TrailEffect(document.querySelector('.stickers-container'), {
        images: [
            'assets/footer/stickers_triangle.svg',
            'assets/footer/stickers_glass.svg',
            'assets/footer/stickers_dna.svg',
            'assets/footer/stickers_globe.svg'
        ],
        numberOfImages: 4,
        delay: 100,
        duration: 2000
    });
    
    // Initialize copy to clipboard in header
    const contactItems = document.querySelectorAll('.copy-item');
    contactItems?.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const contactDesc = item.querySelector('.contact-desc .tag');
            const originalText = contactDesc?.textContent;
            
            utils.copyToClipboard('hello@adriengervaix.com', () => {
                if (contactDesc && originalText) {
                    contactDesc.textContent = 'Ready to paste!';
                    setTimeout(() => {
                        contactDesc.textContent = originalText;
                    }, 2000);
                }
            });
        });
    });
});