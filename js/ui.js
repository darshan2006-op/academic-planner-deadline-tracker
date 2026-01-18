// UI Management for Academic Planner

const UI = {
    /**
     * Initialize UI components
     */
    init() {
        this.updateStats();
        this.renderDeadlines();
        this.renderCourses();
        this.populateCourseSelects();
    },

    /**
     * Step 2: Form Validation Logic for rtCamp Issue #46
     * Validates the task form before submission
     * @returns {boolean} - True if valid, false if errors found
     */
    validateTaskForm() {
        const titleInput = document.getElementById('taskTitle');
        const courseInput = document.getElementById('taskCourse');
        const dateInput = document.getElementById('taskDate');
        
        let isValid = true;

        // 1. Clear previous errors
        this.clearErrors();

        // 2. Title Validation: Required & min 3 characters
        if (!titleInput.value.trim() || titleInput.value.trim().length < 3) {
            this.showInputError(titleInput, "Title must be at least 3 characters.");
            isValid = false;
        }

        // 3. Course Validation: Required
        if (!courseInput.value) {
            this.showInputError(courseInput, "Please select a course.");
            isValid = false;
        }

        // 4. Date Validation: Required & Past Date Warning
        if (!dateInput.value) {
            this.showInputError(dateInput, "Date is required.");
            isValid = false;
        } else {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                // Task rule: allow but warn in orange
                this.showInputError(dateInput, "Warning: This deadline is in the past.", "warning");
            }
        }

        return isValid;
    },

    /**
     * Displays error messages in red as requested
     */
    showInputError(inputElement, message, type = "error") {
        const errorDisplay = document.createElement('span');
        errorDisplay.className = 'error-message'; // Matches Step 1 CSS
        if (type === "warning") errorDisplay.style.color = "orange";
        errorDisplay.textContent = message;
        inputElement.parentElement.appendChild(errorDisplay);
        inputElement.style.borderColor = type === "error" ? "red" : "orange";
    },

    /**
     * Clears error messages when user fixes them
     */
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('input, select').forEach(el => el.style.borderColor = "");
    },

    /**
     * Update statistics cards
     */
    updateStats() {
        const tasks = StorageManager.getTasks();
        const stats = calculateStatistics(tasks);

        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('upcomingTasks').textContent = stats.pending;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('overdueTasks').textContent = stats.overdue;
    },

    /**
     * Render all deadlines
     */
    renderDeadlines(tasks = null) {
        const deadlinesList = document.getElementById('deadlinesList');
        const tasksToRender = tasks || StorageManager.getTasks();
        const sortedTasks = sortTasksByDate(tasksToRender, 'asc');

        if (sortedTasks.length === 0) {
            deadlinesList.innerHTML = `
                <div class="empty-state">
                    <p>📚 No deadlines yet. Add your first one to get started!</p>
                </div>
            `;
            return;
        }

        deadlinesList.innerHTML = sortedTasks.map(task => this.createDeadlineCard(task)).join('');
    },

    createDeadlineCard(task) {
        const course = StorageManager.getCourses().find(c => c.id === task.courseId);
        const courseName = course ? course.name : 'Unknown Course';
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';

        return `
            <div class="deadline-card ${priorityClass} ${completedClass}" data-task-id="${task.id}">
                <div class="deadline-info">
                    <h4 class="deadline-title">${task.title}</h4>
                    <div class="deadline-meta">
                        <span>📚 ${courseName}</span>
                        <span>📅 ${formatDate(task.dueDate)}</span>
                        <span>⏰ ${formatRelativeTime(task.dueDate)}</span>
                        <span class="priority-badge" style="color: var(--${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}-color)">
                            ${task.priority.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div class="deadline-actions">
                    <button class="icon-btn complete" onclick="app.toggleTask('${task.id}')">
                        ${task.completed ? '↺' : '✓'}
                    </button>
                    <button class="icon-btn delete" onclick="app.deleteTask('${task.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },

    renderCourses() {
        const coursesList = document.getElementById('coursesList');
        const courses = StorageManager.getCourses();

        if (courses.length === 0) {
            coursesList.innerHTML = '<div class="empty-state"><p>📖 No courses added yet.</p></div>';
            return;
        }

        coursesList.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
    },

    createCourseCard(course) {
        const tasks = StorageManager.getTasks().filter(t => t.courseId === course.id);
        const stats = calculateStatistics(tasks);

        return `
            <div class="course-card" style="--course-color: ${course.color}">
                <div class="course-header">
                    <h3 class="course-name">${course.name}</h3>
                </div>
                <div class="course-stats">
                    <div class="course-stat"><span>Total:</span> <strong>${stats.total}</strong></div>
                    <div class="course-stat"><span>Completed:</span> <strong style="color: var(--success-color)">${stats.completed}</strong></div>
                </div>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="app.deleteCourse('${course.id}')" style="width: 100%;">Delete</button>
                </div>
            </div>
        `;
    },

    populateCourseSelects() {
        const courses = StorageManager.getCourses();
        const selects = [document.getElementById('taskCourse'), document.getElementById('filterCourse')];

        selects.forEach((select, index) => {
            if (!select) return;
            const currentValue = select.value;
            if (index === 0) {
                select.innerHTML = '<option value="">Select a course</option>' +
                    courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            } else {
                select.innerHTML = '<option value="all">All Courses</option>' +
                    courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }
            if (currentValue) select.value = currentValue;
        });
    },

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            this.clearErrors();
            modal.classList.add('active');
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    },

    switchView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const selectedView = document.getElementById(`${viewName}View`);
        if (selectedView) selectedView.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewName) btn.classList.add('active');
        });
    },

    applyFilters() {
        const search = document.getElementById('searchInput').value;
        const priority = document.getElementById('filterPriority').value;
        const course = document.getElementById('filterCourse').value;
        const status = document.getElementById('filterStatus').value;

        const filteredTasks = filterTasks(StorageManager.getTasks(), { search, priority, course, status });
        this.renderDeadlines(filteredTasks);
    },

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
        const settings = StorageManager.getSettings();
        settings.theme = isDark ? 'dark' : 'light';
        StorageManager.saveSettings(settings);
    },

    loadTheme() {
        const settings = StorageManager.getSettings();
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').textContent = '☀️';
        }
    },

    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }
};

window.UI = UI;