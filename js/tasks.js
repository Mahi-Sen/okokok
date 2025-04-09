const Tasks = {
    state: {
        currentTasks: [],
        pastTasks: [],
        isEditing: false
    },

    elements: {
        container: document.getElementById('ongoing-tasks-container'),
        noTasksMessage: document.getElementById('no-tasks-message'),
        pastTasksList: document.getElementById('past-tasks-list'),
        addTaskBtn: document.getElementById('add-task-btn'),
        taskForm: document.getElementById('task-form'),
        taskNameInput: document.getElementById('task-name'),
        taskDurationInputs: {
            years: document.getElementById('task-years'),
            days: document.getElementById('task-days'),
            hours: document.getElementById('task-hours'),
            minutes: document.getElementById('task-minutes'),
            seconds: document.getElementById('task-seconds')
        }
    },

    init: function() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
        setInterval(() => this.updateTasksProgress(), 1000);
    },

    setupEventListeners: function() {
        this.elements.addTaskBtn.addEventListener('click', () => this.openAddTaskModal());
        this.elements.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));

        // Make tasks draggable
        this.elements.container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingTask = document.querySelector('.task-item.dragging');
            if (draggingTask) {
                const afterElement = this.getDragAfterElement(this.elements.container, e.clientY);
                if (afterElement) {
                    this.elements.container.insertBefore(draggingTask, afterElement);
                } else {
                    this.elements.container.appendChild(draggingTask);
                }
            }
        });
    },

    loadTasks: function() {
        const savedTasks = Storage.load(Storage.keys.TASKS);
        if (savedTasks) {
            this.state.currentTasks = savedTasks.currentTasks || [];
            this.state.pastTasks = savedTasks.pastTasks || [];
        }
    },

    saveTasks: function() {
        Storage.save(Storage.keys.TASKS, {
            currentTasks: this.state.currentTasks,
            pastTasks: this.state.pastTasks
        });
    },

    render: function() {
        this.renderCurrentTasks();
        this.renderPastTasks();
        this.updateProgress();
    },

    renderCurrentTasks: function() {
        this.elements.container.innerHTML = '';
        
        if (this.state.currentTasks.length === 0) {
            this.elements.noTasksMessage.style.display = 'block';
            return;
        }
        
        this.elements.noTasksMessage.style.display = 'none';
        
        this.state.currentTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.elements.container.appendChild(taskElement);
        });
    },

    createTaskElement: function(task) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';
        taskEl.id = `task-${task.id}`;
        taskEl.draggable = true;

        const endDate = new Date(task.startTime);
        endDate.setTime(endDate.getTime() + task.durationMs);

        taskEl.innerHTML = `
            <div class="drag-handle">⋮⋮</div>
            <div class="task-header">
                <div class="task-title">${task.name}</div>
                <div class="time-left">--:--:--</div>
            </div>
            <div class="end-date">Ends: ${endDate.toLocaleString()}</div>
            <div class="progress-container">
                <div class="progress-bar"></div>
                <div class="progress-text">0%</div>
            </div>
            <div class="task-actions">
                <button class="btn edit-btn" data-id="${task.id}">Edit</button>
                <button class="btn complete-btn" data-id="${task.id}">Complete</button>
            </div>
        `;

        // Add drag events
        taskEl.addEventListener('dragstart', () => {
            taskEl.classList.add('dragging');
        });

        taskEl.addEventListener('dragend', () => {
            taskEl.classList.remove('dragging');
            this.updateTaskOrder();
        });

        // Add button events
        taskEl.querySelector('.edit-btn').addEventListener('click', () => this.editTask(task.id));
        taskEl.querySelector('.complete-btn').addEventListener('click', () => this.completeTask(task.id));

        return taskEl;
    },

    updateTasksProgress: function() {
        this.state.currentTasks.forEach(task => {
            const taskEl = document.getElementById(`task-${task.id}`);
            if (!taskEl) return;

            const now = new Date();
            const startTime = new Date(task.startTime);
            const elapsedMs = now - startTime;
            const progressPercent = Math.min(100, (elapsedMs / task.durationMs) * 100);

            const progressBar = taskEl.querySelector('.progress-bar');
            const progressText = taskEl.querySelector('.progress-text');
            const timeLeft = taskEl.querySelector('.time-left');

            progressBar.style.width = `${progressPercent}%`;
            progressText.textContent = `${progressPercent.toFixed(1)}%`;

            const remainingMs = Math.max(0, task.durationMs - elapsedMs);
            timeLeft.textContent = UI.formatTime(remainingMs);

            if (remainingMs <= 0) {
                this.completeTask(task.id, false);
            }
        });
    },

    updateTaskOrder: function() {
        const newOrder = [];
        this.elements.container.querySelectorAll('.task-item').forEach(taskEl => {
            const taskId = parseInt(taskEl.id.replace('task-', ''));
            const task = this.state.currentTasks.find(t => t.id === taskId);
            if (task) newOrder.push(task);
        });
        
        this.state.currentTasks = newOrder;
        this.saveTasks();
    },

    getDragAfterElement: function(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },

    addTask: function(taskData) {
        const newTask = {
            id: Date.now(),
            name: taskData.name,
            durationMs: taskData.durationMs,
            startTime: new Date().toISOString()
        };

        this.state.currentTasks.push(newTask);
        this.saveTasks();
        this.render();
        UI.showToast('Task added successfully!', 'success');
    },

    editTask: function(taskId) {
        const task = this.state.currentTasks.find(t => t.id === taskId);
        if (!task) return;

        this.state.isEditing = true;
        UI.showModal('task-modal');
        // Fill form with task data
        // ... implement form filling logic
    },

    completeTask: function(taskId, isManual = true) {
        const taskIndex = this.state.currentTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.state.currentTasks[taskIndex];
        const now = new Date();
        const startTime = new Date(task.startTime);
        const actualDuration = now - startTime;

        const completedTask = {
            ...task,
            completedAt: now.toISOString(),
            actualDuration,
            completedManually: isManual
        };

        this.state.pastTasks.unshift(completedTask);
        this.state.currentTasks.splice(taskIndex, 1);

        this.saveTasks();
        this.render();

        if (isManual) {
            UI.showCelebration(
                'Task Completed!',
                `You completed "${task.name}" ${actualDuration < task.durationMs ? 'early' : 'on time'}!`
            );
        }
    },

    updateProgress: function() {
        const total = this.state.currentTasks.length + this.state.pastTasks.length;
        const completed = this.state.pastTasks.length;
        const progress = total === 0 ? 0 : (completed / total) * 100;

        const progressBar = document.getElementById('overall-progress');
        const progressText = document.getElementById('overall-progress-text');

        progressBar.style.height = `${progress}%`;
        progressText.textContent = `${progress.toFixed(1)}%`;
    }
};