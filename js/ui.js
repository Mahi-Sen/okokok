const UI = {
    elements: {
        body: document.body,
        timeRings: document.getElementById('time-rings-container'),
        tabs: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        currentTime: document.getElementById('current-time'),
        modals: document.querySelectorAll('.modal'),
        closeButtons: document.querySelectorAll('.close-modal'),
        themeToggle: document.getElementById('theme-toggle'),
        settingsBtn: document.getElementById('settings-btn'),
        settingsMenu: document.getElementById('settings-menu')
    },

    init: function() {
        this.setupEventListeners();
        this.createTimeRings();
        this.startTimeUpdate();
    },

    setupEventListeners: function() {
        // Tab switching
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Modal handling
        this.elements.closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Theme toggle
        this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Settings menu
        this.elements.settingsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSettingsMenu();
        });

        // Close settings menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.settingsMenu.contains(e.target) && 
                !this.elements.settingsBtn.contains(e.target)) {
                this.elements.settingsMenu.classList.remove('active');
            }
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            this.createTimeRings();
        });
    },

    switchTab: function(tabId) {
        this.elements.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    },

    createTimeRings: function() {
        const container = this.elements.timeRings;
        container.innerHTML = '';

        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        // Create center star
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${centerX}px`;
        star.style.top = `${centerY}px`;
        container.appendChild(star);

        // Create rings
        const ringCount = 6;
        const baseRadius = 50;
        const ringSpacing = 100;

        for (let i = 1; i <= ringCount; i++) {
            const ring = document.createElement('div');
            ring.className = 'time-ring';
            
            const radius = baseRadius + (i * ringSpacing);
            ring.style.width = `${radius * 2}px`;
            ring.style.height = `${radius * 2}px`;
            ring.style.left = `${centerX - radius}px`;
            ring.style.top = `${centerY - radius}px`;
            
            // Alternate rotation direction
            ring.style.animation = `${i % 2 === 0 ? 'rotate' : 'rotateCounter'} ${10 + (i * 5)}s infinite linear`;
            
            container.appendChild(ring);
        }
    },

    startTimeUpdate: function() {
        const updateTime = () => {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            this.elements.currentTime.textContent = now.toLocaleDateString('en-US', options);
        };

        updateTime();
        setInterval(updateTime, 1000);
    },

    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
        }
    },

    closeModal: function(modal) {
        modal.classList.remove('fade-in');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    },

    toggleTheme: function() {
        const isDark = this.elements.body.getAttribute('data-theme') === 'dark';
        this.elements.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        Storage.save(Storage.keys.THEME, !isDark);
    },

    toggleSettingsMenu: function() {
        this.elements.settingsMenu.classList.toggle('active');
    },

    showToast: function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} slide-right`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    showCelebration: function(message, subtext) {
        const overlay = document.getElementById('celebration-overlay');
        const textEl = document.getElementById('celebration-text');
        const subtextEl = document.getElementById('celebration-subtext');
        
        textEl.textContent = message;
        subtextEl.textContent = subtext;
        overlay.classList.add('active');
        
        this.createConfetti();
    },

    createConfetti: function() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.opacity = Math.random();
            
            document.getElementById('celebration-overlay').appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }
    },

    formatTime: function(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        
        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
        
        return parts.join(' ');
    }
};