document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hide');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Update copyright year
    const copyrightYear = document.getElementById('current-year');
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.innerHTML = currentYear;
    }

    // Theme toggle initialization (moved here to ensure DOM is ready)
    function updateThemeIcon(theme) {
        const icon = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        const themeToggleEl = document.getElementById('theme-toggle');
        if (themeToggleEl) themeToggleEl.innerHTML = icon;
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            try { localStorage.setItem('theme', newTheme); } catch (e) { console.warn('Failed to save theme preference'); }
            updateThemeIcon(newTheme);
            try { if (typeof trackAnalytics === 'function') trackAnalytics('theme_toggle', { theme: newTheme }); } catch (e) {}
        });

        // Check saved theme on load
        try {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        } catch (e) {
            console.warn('Failed to load theme preference');
        }
    }
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if(targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight current section in navigation and handle back-to-top
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a');

            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;
                if(window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if(link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });

            // Handle back-to-top button visibility
            const backToTopBtn = document.getElementById('back-to-top');
            if (backToTopBtn) {
                if (window.pageYOffset > 300) {
                    backToTopBtn.style.display = 'flex';
                } else {
                    backToTopBtn.style.display = 'none';
                }
            }
        }, 100);
    });

    // Add active class to navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('nav a').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
});
        // Dark Mode Toggle
// Search Functionality
function performSearch(query) {
    const sections = document.querySelectorAll('.section');
    const results = [];
    
    sections.forEach(section => {
        const title = section.querySelector('h2')?.textContent || '';
        const content = section.textContent;
        
        if (title.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
            results.push({
                title: title,
                section: section.id,
                content: content.substring(0, 200) + '...'
            });
        }
    });
    
    return results;
}

// Search Overlay Toggle
const searchToggle = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const overlaySearchInput = document.getElementById('search-input');
const overlaySearchClear = document.getElementById('search-clear');
const overlaySearchClose = document.getElementById('search-close');
const overlaySearchResults = document.getElementById('search-results');

if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', () => {
        searchOverlay.classList.toggle('active');
        if (searchOverlay.classList.contains('active')) {
            if (overlaySearchInput) overlaySearchInput.focus();
        }
    });
    
    if (overlaySearchClose) {
        overlaySearchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }

    if (overlaySearchClear) {
        overlaySearchClear.addEventListener('click', () => {
            if (overlaySearchInput) {
                overlaySearchInput.value = '';
                overlaySearchInput.dispatchEvent(new Event('input'));
                overlaySearchInput.focus();
            }
        });
    }
    
    // Use the global performSearch function defined above; ensure inputs exist before wiring listeners
    if (overlaySearchInput) {
        overlaySearchInput.addEventListener('input', debounce(function() {
            const query = this.value.toLowerCase().trim();
            
            if (!overlaySearchResults) return;
            
            if (query.length < 2) {
                overlaySearchResults.innerHTML = '';
                return;
            }
            
            const results = performSearch(query);
            
            // Clear previous results
            overlaySearchResults.innerHTML = '';
            
            // Create elements safely
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.setAttribute('data-section', result.section);
                
                const title = document.createElement('h4');
                title.textContent = result.title;
                
                const content = document.createElement('p');
                // Sanitize query for regex
                const safeQuery = query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
                content.innerHTML = result.content.replace(new RegExp(safeQuery, 'gi'), match => `<mark>${match}</mark>`);
                
                item.appendChild(title);
                item.appendChild(content);
                overlaySearchResults.appendChild(item);
            });
        }, 300));
    }
    
    if (overlaySearchResults) {
        overlaySearchResults.addEventListener('click', (e) => {
            const item = e.target.closest('.search-result-item');
            if (item) {
                const section = item.getAttribute('data-section');
                if (section) {
                    scrollToSection(section);
                }
            }
        });
    }
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
        }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!searchToggle.contains(e.target) && !searchOverlay.contains(e.target)) {
            searchOverlay.classList.remove('active');
        }
    });
}

// Make close function global
window.closeSearchOverlay = () => {
    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.classList.remove('active');
};

window.scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        closeSearchOverlay();
    }
};

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    
    const nav = document.querySelector('nav ul');
    
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            nav.classList.remove('active');
        }
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    });
}
// Debounce function for search
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

// Lazy load images and handle loading/error states
document.addEventListener("DOMContentLoaded", function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        img.classList.add('loading-img');
        img.addEventListener('load', () => {
            img.classList.remove('loading-img');
            img.classList.add('loaded-img');
        });
        img.addEventListener('error', () => {
            img.classList.remove('loading-img');
            img.classList.add('error-img');
            img.alt = 'Image failed to load';
        });
    });
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            }
        });
    });
    lazyImages.forEach(img => imageObserver.observe(img));
});

// Interactive Quiz Functionality
function initQuiz() {
    const quizOptions = document.querySelectorAll('.option');
    const quizFeedback = document.querySelector('.quiz-feedback');
    
    if (quizOptions.length === 0 || !quizFeedback) return;
    
    quizOptions.forEach(option => {
        option.addEventListener('click', () => {
            const isCorrect = option.dataset.correct === 'true';
            
            // Reset previous selections
            quizOptions.forEach(opt => {
                opt.classList.remove('correct', 'incorrect');
            });
            
            if (isCorrect) {
                option.classList.add('correct');
                quizFeedback.textContent = 'Correct! This is the professional way to handle frustrated users.';
                quizFeedback.className = 'quiz-feedback success';
            } else {
                option.classList.add('incorrect');
                quizFeedback.textContent = 'Not quite. Remember to stay professional and ask for specific details.';
                quizFeedback.className = 'quiz-feedback error';
            }
            
            quizFeedback.style.display = 'block';
        });
    });
}

// Quick Reference Sidebar
function initQuickRef() {
    const refToggle = document.querySelector('.ref-toggle');
    const quickRef = document.querySelector('.quick-ref');
    
    if (!refToggle || !quickRef) return;
    
    refToggle.addEventListener('click', () => {
        quickRef.classList.toggle('open');
    });
    
    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            let text = '';
            
            switch(template) {
                case 'ask-info':
                    text = 'Could you please provide more details about the issue you\'re experiencing? This will help me assist you better.';
                    break;
                case 'disable-adblock':
                    text = 'Please disable your adblocker and refresh the page. This often resolves subtitle and other display issues.';
                    break;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                showCopyNotice('Template copied to clipboard!');
            }).catch(() => {
                showCopyNotice('Failed to copy. Please copy manually.');
            });
        });
    });
}

// Animated Flowchart
function initFlowchart() {
    const flowSteps = document.querySelectorAll('.flow-step');
    
    if (flowSteps.length === 0) return;
    
    flowSteps.forEach((step, index) => {
        step.addEventListener('click', () => {
            // Animate to next step or reset
            if (index < flowSteps.length - 1) {
                flowSteps[index + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}

// Real-time Code Formatter
function initCodeFormatter() {
    const input = document.getElementById('discord-input');
    const output = document.getElementById('formatted-output');
    const formatButtons = document.querySelectorAll('.format-buttons button');
    
    if (!input || !output || formatButtons.length === 0) return;
    
    const discordMarkdown = {
        bold: (text) => `**${text}**`,
        italic: (text) => `*${text}*`,
        code: (text) => `\`${text}\``,
        codeblock: (text, lang = '') => `\`\`\`${lang}\n${text}\n\`\`\``
    };
    
    function updateOutput() {
        output.textContent = input.value;
    }
    
    input.addEventListener('input', updateOutput);
    
 formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            const selectedText = input.value.substring(input.selectionStart, input.selectionEnd);
            
            if (selectedText) {
                let formatted = '';
                switch(format) {
                    case 'bold':
                        formatted = discordMarkdown.bold(selectedText);
                        break;
                    case 'italic':
                        formatted = discordMarkdown.italic(selectedText);
                        break;
                    case 'code':
                        formatted = discordMarkdown.code(selectedText);
                        break;
                    case 'codeblock':
                        formatted = discordMarkdown.codeblock(selectedText);
                        break;
                }
                
                const before = input.value.substring(0, input.selectionStart);
                const after = input.value.substring(input.selectionEnd);
                input.value = before + formatted + after;
                updateOutput();
            }
        });
    });

// Progress Tracker
function initProgressTracker() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (!progressFill || !progressText) return;
    
    const progressData = {
        'user-guidelines': { read: false, quizPassed: false },
        'helper-guidelines': { read: false, quizPassed: false },
        'support-forums': { read: false },
        'faq': { read: false }
    };
    
    function updateProgress() {
        const totalSections = Object.keys(progressData).length;
        const completedSections = Object.values(progressData).filter(section => section.read).length;
        const progressPercent = (completedSections / totalSections) * 100;
        
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `${completedSections}/${totalSections} sections completed`;
        
        try {
            localStorage.setItem('progressData', JSON.stringify(progressData));
        } catch (e) {
            console.warn('Failed to save progress data');
        }
    }
    
    // Load saved progress
    try {
        const savedProgress = localStorage.getItem('progressData');
        if (savedProgress) {
            Object.assign(progressData, JSON.parse(savedProgress));
            updateProgress();
        }
    } catch (e) {
        console.warn('Failed to load progress data');
    }
    
    // Track section views
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                if (progressData[sectionId] && !progressData[sectionId].read) {
                    progressData[sectionId].read = true;
                    updateProgress();
                    trackEvent('section_view', { section: sectionId });
                }
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
    });
}

// Feedback System
function initFeedbackSystem() {
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.closest('section').id;
            const helpful = btn.dataset.helpful;
            
            try {
                const feedbackData = JSON.parse(localStorage.getItem('feedback') || '{}');
                if (!feedbackData[section]) feedbackData[section] = { yes: 0, no: 0 };
                feedbackData[section][helpful]++;
                
                localStorage.setItem('feedback', JSON.stringify(feedbackData));
            } catch (e) {
                console.warn('Failed to save feedback');
            }
            
            // Show thank you
            const widget = btn.closest('.feedback-widget');
            widget.innerHTML = '<div class="feedback-thanks">Thank you for your feedback!</div>';
            
            trackEvent('feedback', { section, helpful });
        });
    });
}

// Time Estimate Badges
function calculateReadingTime(text) {
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / 200); // 200 wpm average
    return minutes;
}

function initReadingTimes() {
    document.querySelectorAll('.section').forEach(section => {
        const text = section.textContent;
        const minutes = calculateReadingTime(text);
        const title = section.querySelector('.section-title');
        if (title && !title.querySelector('.reading-time')) {
            const timeBadge = document.createElement('span');
            timeBadge.className = 'reading-time';
            timeBadge.textContent = `⏱️ ${minutes} min read`;
            title.appendChild(timeBadge);
        }
    });
}

// Dynamic Table of Contents
function generateTOC() {
    const tocList = document.getElementById('toc-list');
    if (!tocList) return;
    
    const headings = document.querySelectorAll('section[id] h2');
    
    headings.forEach((heading, index) => {
        const id = heading.closest('section').id;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.innerHTML = `<i class="fas fa-chevron-right"></i> ${heading.textContent.replace(/⏱️ \d+ min read/, '').trim()}`;
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

// Enhanced Copy-to-Clipboard
function initEnhancedCopy() {
    document.querySelectorAll('code, .tag, .command, .copy-discord').forEach(element => {
        element.addEventListener('click', async (e) => {
            if (e.target.classList.contains('copy-discord')) {
                // Special handling for Discord copy
                const faqItem = e.target.closest('.faq-answer');
                if (!faqItem) return;
                const cause = faqItem.querySelector('p strong').nextSibling.textContent.trim();
                const solution = faqItem.querySelector('p:last-child').textContent.replace('Solution:', '').trim();
                const text = `**Issue:** ${cause}\n**Solution:** ${solution}`;
                try {
                    await navigator.clipboard.writeText(text);
                    showCopyNotice('Discord response copied!');
                    trackEvent('copy', { type: 'discord' });
                } catch (err) {
                    showCopyNotice('Failed to copy. Please copy manually.');
                }
            } else {
                const text = element.textContent;
                try {
                    await navigator.clipboard.writeText(text);
                    showCopyNotice('Copied to clipboard!');
                    trackEvent('copy', { type: 'code' });
                } catch (err) {
                    showCopyNotice('Failed to copy. Please copy manually.');
                }
            }
        });
    });
}

function showCopyNotice(message) {
    const notice = document.createElement('div');
    notice.className = 'copy-notice';
    notice.textContent = message;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 2000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + / to focus search
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
    }
    
    // Ctrl + D for dark mode
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.click();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
    }
});

// Analytics & Gamification
const achievements = {
    'first_search': { earned: false, title: 'First Search' },
    'quiz_master': { earned: false, title: 'Quiz Master' },
    'dark_mode': { earned: false, title: 'Dark Mode User' }
};

function trackEvent(event, data) {
    try {
        const events = JSON.parse(localStorage.getItem('analytics') || '[]');
        events.push({
            event,
            data,
            timestamp: new Date().toISOString(),
            page: window.location.hash || 'home'
        });
        localStorage.setItem('analytics', events.slice(-100)); // Keep last 100
    } catch (e) {
        console.warn('Failed to track event');
    }
}

function checkAchievements() {
    // Check and award achievements
    if (!achievements.dark_mode.earned && document.documentElement.getAttribute('data-theme') === 'dark') {
        showAchievement('Dark Mode User', 'You activated dark mode!');
        achievements.dark_mode.earned = true;
    }
    
    // Load saved achievements
    try {
        const savedAchievements = localStorage.getItem('achievements');
        if (savedAchievements) {
            Object.assign(achievements, JSON.parse(savedAchievements));
        }
    } catch (e) {
        console.warn('Failed to load achievements');
    }
}

function showAchievement(title, description) {
    const achievement = document.createElement('div');
    achievement.className = 'achievement-notice';
    achievement.innerHTML = `
        <div class="achievement-content">
            <h4>🏆 ${title}</h4>
            <p>${description}</p>
        </div>
    `;
    document.body.appendChild(achievement);
    setTimeout(() => achievement.remove(), 5000);
    
    try {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (e) {
        console.warn('Failed to save achievements');
    }
}

// Enhanced Analytics System
function trackAnalytics(event, data = {}) {
    try {
        const analyticsData = {
            event: event,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            theme: document.documentElement.getAttribute('data-theme') || 'light',
            ...data
        };
        
        // Store locally for demo purposes (replace with actual analytics service)
        const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
        analytics.push(analyticsData);
        
        // Keep only last 100 events
        if (analytics.length > 100) {
            analytics.splice(0, analytics.length - 100);
        }
        
        localStorage.setItem('analytics', JSON.stringify(analytics));
        
        // console.log('Analytics tracked:', analyticsData);
    } catch (e) {
        console.warn('Analytics tracking failed:', e);
    }
}

// Performance Monitoring
function initPerformanceMonitoring() {
    // Track page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                trackAnalytics('page_load', {
                    loadTime: perfData.loadEventEnd - perfData.fetchStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart
                });
            }
        }, 0);
    });
    
    // Track user engagement
    let lastActivity = Date.now();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
        document.addEventListener(event, () => {
            lastActivity = Date.now();
        }, { passive: true });
    });
    
    // Track session duration
    window.addEventListener('beforeunload', () => {
        const sessionDuration = Date.now() - (parseInt(localStorage.getItem('sessionStart')) || Date.now());
        trackAnalytics('session_end', { duration: sessionDuration });
    });
    
    // Set session start
    if (!localStorage.getItem('sessionStart')) {
        try {
            localStorage.setItem('sessionStart', Date.now());
        } catch (e) {
            console.warn('Failed to save session start');
        }
        trackAnalytics('session_start');
    }
}

// Lazy Loading for Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Error Boundary
function initErrorBoundary() {
    window.addEventListener('error', (event) => {
        trackAnalytics('javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        });
        
        // Show user-friendly error message
        showNotification('Something went wrong. Please refresh the page.', 'error');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        trackAnalytics('unhandled_promise_rejection', {
            reason: event.reason?.toString()
        });
    });
}

// Progressive Web App Features
function initPWAFeatures() {
    // Add to home screen prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button if not already installed
        if (!localStorage.getItem('pwaInstalled')) {
            showInstallPrompt();
        }
    });
    
    function showInstallPrompt() {
        const installBtn = document.createElement('button');
        installBtn.className = 'install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    try {
                        localStorage.setItem('pwaInstalled', 'true');
                    } catch (e) {
                        console.warn('Failed to save PWA install status');
                    }
                    trackAnalytics('pwa_installed');
                }
                deferredPrompt = null;
                installBtn.remove();
            }
        };
        
        document.body.appendChild(installBtn);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (installBtn.parentElement) {
                installBtn.remove();
            }
        }, 10000);
    }
    
    // Add install button styles
    if (!document.getElementById('install-styles')) {
        const style = document.createElement('style');
        style.id = 'install-styles';
        style.textContent = `
            .install-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background-color: var(--primary-pink);
                color: var(--white);
                border: none;
                padding: 0.75rem 1rem;
                border-radius: var(--border-radius);
                cursor: pointer;
                font-weight: 500;
                box-shadow: var(--box-shadow);
                z-index: 1000;
                transition: var(--transition);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .install-btn:hover {
                background-color: var(--primary-pink-dark);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize all new features
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    const currentYear = document.getElementById('current-year');
    if (currentYear) currentYear.textContent = new Date().getFullYear();
    
    initQuiz();
    initQuickRef();
    initFlowchart();
    initCodeFormatter();
    initProgressTracker();
    initFeedbackSystem();
    initReadingTimes();
    generateTOC();
    initEnhancedCopy();
    checkAchievements();
    initContactForm();
    initNewsletter();
    initBackToTop();
    initThemeIndicator();
    initPerformanceMonitoring();
    initLazyLoading();
    initErrorBoundary();
    initPWAFeatures();
});

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contact-name').value.trim(),
            email: document.getElementById('contact-email').value.trim(),
            subject: document.getElementById('contact-subject').value,
            message: document.getElementById('contact-message').value.trim()
        };
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showFormStatus('Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(formData.email)) {
            showFormStatus('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo purposes, show success
            showFormStatus('Thank you for your message! We\'ll get back to you soon.', 'success');
            contactForm.reset();
            
            // Track contact form submission
            trackAnalytics('contact_form_submitted', { subject: formData.subject });
            
        } catch (error) {
            showFormStatus('Failed to send message. Please try again later.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Newsletter Subscription
function initNewsletter() {
    const newsletterBtn = document.getElementById('newsletter-subscribe');
    const newsletterEmail = document.getElementById('newsletter-email');
    
    if (!newsletterBtn || !newsletterEmail) return;
    
    newsletterBtn.addEventListener('click', async () => {
        const email = newsletterEmail.value.trim();
        
        if (!email) {
            showNotification('Please enter your email address.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Check if already subscribed
        let subscriptions = [];
        try {
            const saved = localStorage.getItem('newsletter_subscriptions');
            if (saved) subscriptions = JSON.parse(saved);
        } catch (e) {
            console.warn('Failed to load newsletter subscriptions');
        }
        if (subscriptions.includes(email)) {
            showNotification('You\'re already subscribed!', 'info');
            return;
        }
        
        // Show loading state
        const originalText = newsletterBtn.innerHTML;
        newsletterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        newsletterBtn.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Add to subscriptions
            subscriptions.push(email);
            try {
                localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
            } catch (e) {
                console.warn('Failed to save newsletter subscription');
            }
            
            showNotification('Successfully subscribed! Welcome to our newsletter.', 'success');
            newsletterEmail.value = '';
            
            // Track newsletter subscription
            trackAnalytics('newsletter_subscribed');
            
        } catch (error) {
            showNotification('Failed to subscribe. Please try again later.', 'error');
        } finally {
            newsletterBtn.innerHTML = originalText;
            newsletterBtn.disabled = false;
        }
    });
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Back to Top Button
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (!backToTopBtn) return;
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Track back to top usage
        trackAnalytics('back_to_top_clicked');
    });
}

// Theme Indicator
function initThemeIndicator() {
    const themeIndicator = document.getElementById('theme-indicator-text');
    
    if (!themeIndicator) return;
    
    function updateThemeIndicator() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        themeIndicator.textContent = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }
    
    // Update on theme change
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(updateThemeIndicator, 100); // Small delay to ensure theme has changed
        });
    }
    
    // Initial update
    updateThemeIndicator();
}

// Enhanced Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add close event listener
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Add CSS for notifications if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification-content {
                background-color: var(--white);
                color: var(--primary-grey);
                padding: 1rem;
                border-radius: var(--border-radius);
                box-shadow: var(--box-shadow);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                border-left: 4px solid;
            }
            
            .notification.success .notification-content {
                border-left-color: #28a745;
            }
            
            .notification.error .notification-content {
                border-left-color: #dc3545;
            }
            
            .notification.info .notification-content {
                border-left-color: var(--primary-pink);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--secondary-grey);
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                transition: var(--transition);
            }
            
            .notification-close:hover {
                background-color: var(--light-grey);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            [data-theme="dark"] .notification-content {
                background-color: var(--dark-grey);
                color: var(--primary-grey);
            }
        `;
        document.head.appendChild(style);
    }
}

function getIconForType(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}


// Global error boundary
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global Error:', message, 'at', source + ':' + lineno + ':' + colno, error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
    return false; // Let default handler run as well
};

// localStorage wrapper with availability check
const safeStorage = {
    get(key) {
        try {
            if (window.localStorage) return localStorage.getItem(key);
        } catch (e) {
            console.error('localStorage get error:', e);
        }
        return null;
    },
    set(key, value) {
        try {
            if (window.localStorage) localStorage.setItem(key, value);
        } catch (e) {
            console.error('localStorage set error:', e);
        }
    },
    remove(key) {
        try {
            if (window.localStorage) localStorage.removeItem(key);
        } catch (e) {
            console.error('localStorage remove error:', e);
        }
    }
};

// Standardize error handling for localStorage usage in the rest of the file
// ...existing code...
initMobileMenu();

// Service Worker Registration (for offline-first)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Hide loading screen
        const loader = document.getElementById('loading-screen');
        if (loader) loader.style.display = 'none';
        
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                // Service worker registered successfully
            })
            .catch(error => {
                // Service worker registration failed
            });
    });
}}