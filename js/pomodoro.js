const Pomodoro = {
    state: {
        duration: 25 * 60, // 25 minutes in seconds
        timeLeft: 25 * 60,
        isRunning: false,
        isPaused: false,
        timer: null,
        records: []
    },

    elements: {
        timerDisplay: document.getElementById('pomodoro-time'),
        startBtn: document.getElementById('pomodoro-start'),
        pauseBtn: document.getElementById('pomodoro-pause'),
        resumeBtn: document.getElementById('pomodoro-resume'),
        cancelBtn: document.getElementById('pomodoro-cancel'),
        recordsTable: document.getElementById('pomodoro-records')
    },

    init: function() {
        this.loadState();
        this.setupEventListeners();
        this.render();
    },

    setupEventListeners: function() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resumeBtn.addEventListener('click', () => this.resume());
        this.elements.cancelBtn.addEventListener('click', () => this.cancel());
    },

    loadState: function() {
        const saved = Storage.load(Storage.keys.POMODORO);
        if (saved) {
            this.state.records = saved.records || [];
            this.state.duration = saved.duration || 25 * 60;
        }
    },

    saveState: function() {
        Storage.save(Storage.keys.POMODORO, {
            records: this.state.records,
            duration: this.state.duration
        });
    },

    start: function() {
        this.state.timeLeft = this.state.duration;
        this.state.isRunning = true;
        this.state.startTime = new Date();
        
        this.updateButtons();
        this.startTimer();
    },

    pause: function() {
        this.state.isPaused = true;
        this.state.isRunning = false;
        clearInterval(this.state.timer);
        this.updateButtons();
    },

    resume: function() {
        this.state.isPaused = false;
        this.state.isRunning = true;
        this.startTimer();
        this.updateButtons();
    },

    cancel: function() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        clearInterval(this.state.timer);
        this.addRecord('Cancelled');
        this.reset();
    },

    complete: function() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        clearInterval(this.state.timer);
        this.addRecord('Completed');
        UI.showCelebration('Pomodoro Complete!', 'Time for a break!');
        this.reset();
    },

    startTimer: function() {
        clearInterval(this.state.timer);
        
        this.state.timer = setInterval(() => {
            if (this.state.timeLeft <= 0) {
                this.complete();
                return;
            }
            
            this.state.timeLeft--;
            this.updateDisplay();
        }, 1000);
    },

    updateDisplay: function() {
        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;
        this.elements.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    updateButtons: function() {
        this.elements.startBtn.classList.toggle('hidden', this.state.isRunning || this.state.isPaused);
        this.elements.pauseBtn.classList.toggle('hidden', !this.state.isRunning || this.state.isPaused);
        this.elements.resumeBtn.classList.toggle('hidden', !this.state.isPaused);
        this.elements.cancelBtn.classList.toggle('hidden', !this.state.isRunning && !this.state.isPaused);
    },

    reset: function() {
        this.state.timeLeft = this.state.duration;
        this.updateDisplay();
        this.updateButtons();
    },

    addRecord: function(status) {
        const record = {
            id: Date.now(),
            startTime: this.state.startTime,
            endTime: new Date(),
            duration: this.state.duration - this.state.timeLeft,
            status: status
        };

        this.state.records.unshift(record);
        this.saveState();
        this.renderRecords();
    },

    renderRecords: function() {
        const tbody = this.elements.recordsTable.querySelector('tbody');
        tbody.innerHTML = '';

        this.state.records.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.status}</td>
                <td>${new Date(record.startTime).toLocaleTimeString()}</td>
                <td>${new Date(record.endTime).toLocaleTimeString()}</td>
                <td>${UI.formatTime(record.duration * 1000)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};