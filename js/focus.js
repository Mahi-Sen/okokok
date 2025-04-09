const Focus = {
    state: {
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedTime: 0,
        timer: null,
        currentTask: '',
        records: []
    },

    elements: {
        timerDisplay: document.getElementById('focus-time'),
        taskInput: document.getElementById('focus-task'),
        startBtn: document.getElementById('focus-start'),
        pauseBtn: document.getElementById('focus-pause'),
        resumeBtn: document.getElementById('focus-resume'),
        stopBtn: document.getElementById('focus-stop'),
        recordsTable: document.getElementById('focus-records')
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
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        
        this.elements.taskInput.addEventListener('input', (e) => {
            this.state.currentTask = e.target.value;
        });
    },

    loadState: function() {
        const saved = Storage.load(Storage.keys.FOCUS);
        if (saved) {
            this.state.records = saved.records || [];
        }
    },

    saveState: function() {
        Storage.save(Storage.keys.FOCUS, {
            records: this.state.records
        });
    },

    start: function() {
        if (!this.state.currentTask.trim()) {
            UI.showToast('Please enter a task name', 'error');
            return;
        }

        this.state.isRunning = true;
        this.state.startTime = new Date();
        this.state.pausedTime = 0;
        
        this.updateButtons();
        this.startTimer();
    },

    pause: function() {
        this.state.isPaused = true;
        this.state.isRunning = false;
        clearInterval(this.state.timer);
        this.state.pausedTime += (new Date() - this.state.startTime);
        this.updateButtons();
    },

    resume: function() {
        this.state.isPaused = false;
        this.state.isRunning = true;
        this.state.startTime = new Date();
        this.startTimer();
        this.updateButtons();
    },

    stop: function() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        clearInterval(this.state.timer);
        
        const totalTime = this.state.pausedTime + (new Date() - this.state.startTime);
        this.addRecord(totalTime);
        
        UI.showModal('remarks-modal');
        this.reset();
    },

    startTimer: function() {
        clearInterval(this.state.timer);
        
        const updateTimer = () => {
            const now = new Date();
            const totalTime = this.state.pausedTime + (now - this.state.startTime);
            this.updateDisplay(totalTime);
        };

        updateTimer();
        this.state.timer = setInterval(updateTimer, 1000);
    },

    updateDisplay: function(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));

        this.elements.timerDisplay.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    updateButtons: function() {
        this.elements.startBtn.classList.toggle('hidden', this.state.isRunning || this.state.isPaused);
        this.elements.pauseBtn.classList.toggle('hidden', !this.state.isRunning || this.state.isPaused);
        this.elements.resumeBtn.classList.toggle('hidden', !this.state.isPaused);
        this.elements.stopBtn.classList.toggle('hidden', !this.state.isRunning && !this.state.isPaused);
        this.elements.taskInput.disabled = this.state.isRunning || this.state.isPaused;
    },

    reset: function() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.state.startTime = null;
        this.state.pausedTime = 0;
        this.state.currentTask = '';
        this.elements.taskInput.value = '';
        this.elements.taskInput.disabled = false;
        this.updateDisplay(0);
        this.updateButtons();
    },

    addRecord: function(duration) {
        const record = {
            id: Date.now(),
            task: this.state.currentTask,
            duration: duration,
            date: new Date().toISOString(),
            remark: ''
        };

        this.state.records.unshift(record);
        this.saveState();
        this.renderRecords();
    },

    setRemark: function(recordId, remark) {
        const record = this.state.records.find(r => r.id === recordId);
        if (record) {
            record.remark = remark;
            this.saveState();
            this.renderRecords();
        }
    },

    renderRecords: function() {
        const tbody = this.elements.recordsTable.querySelector('tbody');
        tbody.innerHTML = '';

        this.state.records.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.task}</td>
                <td>${UI.formatTime(record.duration)}</td>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.remark || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};