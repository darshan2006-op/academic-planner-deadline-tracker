// UI Management for Academic Planner

const UI = {
    /**
     * Initialize UI components with loading animations
     */
    init() {
        // Show skeleton loaders first
        this.showStatsSkeletons();
        this.showDeadlineSkeletons();
        this.showCourseSkeletons();
        
        // Then load data with a small delay to show skeletons
        setTimeout(() => {
            this.updateStats();
            this.renderDeadlines();
            this.renderCourses();
            this.populateCourseSelects();
        }, 500);
    },

    /**
     * Show skeleton loaders for deadlines
     */
    showDeadlineSkeletons() {
        const deadlinesList = document.getElementById('deadlinesList');
        if (!deadlinesList) return;
        
        deadlinesList.innerHTML = `
            <div class="skeleton-deadline-card skeleton">
                <div class="skeleton-deadline-info">
                    <div class="skeleton-title skeleton"></div>
                    <div class="skeleton-meta">
                        <div class="skeleton-meta-item skeleton"></div>
                        <div class="skeleton-meta-item skeleton"></div>
                        <div class="skeleton-meta-item skeleton"></div>
                    </div>
                </div>
            </div>
            <div class="skeleton-deadline-card skeleton">
                <div class="skeleton-deadline-info">
                    <div class="skeleton-title skeleton"></div>
                    <div class="skeleton-meta">
                        <div class="skeleton-meta-item skeleton"></div>
                        <div class="skeleton-meta-item skeleton"></div>
                        <div class="skeleton-meta-item skeleton"></div>
                    </div>
                </div>
            </div>
            <div class="skeleton-deadline-card skeleton">
                <div class="skeleton-deadline-info">
                    <div class="skeleton-title skeleton"></div>
                    <div class="skeleton-meta">
                        <div class="skeleton-meta-item skeleton"></div>
                        <div class="skeleton-meta-item skeleton"></div>
                        <div class="skeleton-meta-item skeleton"></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show skeleton loaders for courses
     */
    showCourseSkeletons() {
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) return;
        
        coursesList.innerHTML = `
            <div class="skeleton-course-card skeleton"></div>
            <div class="skeleton-course-card skeleton"></div>
            <div class="skeleton-course-card skeleton"></div>
        `;
    },

    /**
     * Show skeleton loaders for stats
     */
    showStatsSkeletons() {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;
        
        statsGrid.innerHTML = `
            <div class="skeleton-stat-card skeleton"></div>
            <div class="skeleton-stat-card skeleton"></div>
            <div class="skeleton-stat-card skeleton"></div>
            <div class="skeleton-stat-card skeleton"></div>
        `;
    },

    /**
     * Update statistics cards
     */
    updateStats() {
        const tasks = StorageManager.getTasks();
        const stats = calculateStatistics(tasks);

        // Remove skeletons and show real stats with animation
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card fade-in">
                    <div class="stat-icon">📝</div>
                    <div class="stat-info">
                        <h3 id="totalTasks">${stats.total}</h3>
                        <p>Total Tasks</p>
                    </div>
                </div>
                <div class="stat-card fade-in delay-1">
                    <div class="stat-icon">⏰</div>
                    <div class="stat-info">
                        <h3 id="upcomingTasks">${stats.pending}</h3>
                        <p>Upcoming</p>
                    </div>
                </div>
                <div class="stat-card fade-in delay-2">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                        <h3 id="completedTasks">${stats.completed}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div class="stat-card fade-in delay-3">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-info">
                        <h3 id="overdueTasks">${stats.overdue}</h3>
                        <p>Overdue</p>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Render all deadlines with fade-in animation
     * @param {Array} tasks - Optional filtered tasks array
     */
    renderDeadlines(tasks = null) {
        const deadlinesList = document.getElementById('deadlinesList');
        if (!deadlinesList) return;
        
        const tasksToRender = tasks || StorageManager.getTasks();
        const sortedTasks = sortTasksByDate(tasksToRender, 'asc');

        if (sortedTasks.length === 0) {
            deadlinesList.innerHTML = `
                <div class="empty-state fade-in">
                    <div class="empty-state-icon">📝</div>
                    <h3>No deadlines yet</h3>
                    <p>It looks like your schedule is clear! Start staying on top of your studies by adding your first deadline.</p>
                    <button class="btn btn-primary cta-btn" onclick="UI.showModal('deadlineModal')">
                        + Add Your First Deadline
                    </button>
                </div>
            `;
            return;
        }

        deadlinesList.innerHTML = sortedTasks.map((task, index) => 
            this.createDeadlineCard(task, index)
        ).join('');

        // Trigger animation
        setTimeout(() => {
            deadlinesList.querySelectorAll('.deadline-card').forEach((card, index) => {
                card.classList.add('fade-in');
                card.style.animationDelay = `${Math.min(index, 5) * 0.1}s`;
            });
        }, 10);
    },

    /**
     * Create a deadline card HTML with animation
     * @param {Object} task - Task object
     * @param {number} index - Index for animation delay
     * @returns {string} HTML string
     */
    createDeadlineCard(task, index = 0) {
        const course = StorageManager.getCourses().find(c => c.id === task.courseId);
        const courseName = course ? course.name : 'Unknown Course';
        const status = getTaskStatus(task.completed, task.dueDate);
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';

        return `
            <div class="deadline-card ${priorityClass} ${completedClass}" data-task-id="${task.id}" style="opacity: 0;">
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
                    ${task.description ? `<p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">${task.description}</p>` : ''}
                </div>
                <div class="deadline-actions">
                    <button class="icon-btn complete" onclick="app.toggleTask('${task.id}')" title="Mark as ${task.completed ? 'incomplete' : 'complete'}">
                        ${task.completed ? '↺' : '✓'}
                    </button>
                    <button class="icon-btn delete" onclick="app.deleteTask('${task.id}')" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render all courses with animation
     */
    renderCourses() {
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) return;
        
        const courses = StorageManager.getCourses();

        if (courses.length === 0) {
            coursesList.innerHTML = `
                <div class="empty-state fade-in">
                    <p>📖 No courses added yet. Start by adding your first course!</p>
                </div>
            `;
            return;
        }

        coursesList.innerHTML = courses.map((course, index) => 
            this.createCourseCard(course, index)
        ).join('');

        // Trigger animation
        setTimeout(() => {
            coursesList.querySelectorAll('.course-card').forEach((card, index) => {
                card.classList.add('fade-in-scale');
                card.style.animationDelay = `${Math.min(index, 5) * 0.1}s`;
            });
        }, 10);
    },

    /**
     * Create a course card HTML with animation
     * @param {Object} course - Course object
     * @param {number} index - Index for animation delay
     * @returns {string} HTML string
     */
    createCourseCard(course, index = 0) {
        const tasks = StorageManager.getTasks().filter(t => t.courseId === course.id);
        const stats = calculateStatistics(tasks);

        return `
            <div class="course-card" style="--course-color: ${course.color}; opacity: 0;">
                <div class="course-header">
                    <h3 class="course-name">${course.name}</h3>
                    <p class="course-code">${course.code || 'No code'}</p>
                    ${course.instructor ? `<p class="course-code">👨‍🏫 ${course.instructor}</p>` : ''}
                </div>
                <div class="course-stats">
                    <div class="course-stat">
                        <span>Total Tasks:</span>
                        <strong>${stats.total}</strong>
                    </div>
                    <div class="course-stat">
                        <span>Completed:</span>
                        <strong style="color: var(--success-color)">${stats.completed}</strong>
                    </div>
                    <div class="course-stat">
                        <span>Pending:</span>
                        <strong style="color: var(--info-color)">${stats.pending}</strong>
                    </div>
                    <div class="course-stat">
                        <span>Overdue:</span>
                        <strong style="color: var(--danger-color)">${stats.overdue}</strong>
                    </div>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="app.deleteCourse('${course.id}')" style="flex: 1; font-size: 0.85rem;">
                        Delete
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Populate course select dropdowns
     */
    populateCourseSelects() {
        const courses = StorageManager.getCourses();
        const selects = [
            document.getElementById('taskCourse'),
            document.getElementById('filterCourse')
        ];

        selects.forEach((select, index) => {
            if (!select) return;

            const currentValue = select.value;
            
            if (index === 0) { // taskCourse select
                select.innerHTML = '<option value="">Select a course</option>' +
                    courses.map(course => 
                        `<option value="${course.id}">${course.name}${course.code ? ` (${course.code})` : ''}</option>`
                    ).join('');
            } else { // filterCourse select
                select.innerHTML = '<option value="all">All Courses</option>' +
                    courses.map(course => 
                        `<option value="${course.id}">${course.name}${course.code ? ` (${course.code})` : ''}</option>`
                    ).join('');
            }

            if (currentValue) select.value = currentValue;
        });
    },

    /**
     * Show a modal
     * @param {string} modalId - ID of modal to show
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    /**
     * Hide a modal
     * @param {string} modalId - ID of modal to hide
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * ADDED FOR ISSUE #58: Show a styled confirmation modal
     * @param {string} message - Message to display
     * @param {Function} onConfirm - Callback for when user confirms
     */
    showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const messageElement = document.getElementById('confirmMessage');
        const acceptBtn = document.getElementById('acceptConfirm');
        const cancelBtn = document.getElementById('cancelConfirm');

        if (!modal || !messageElement || !acceptBtn || !cancelBtn) return;

        messageElement.textContent = message;
        this.showModal('confirmModal');

        // Recreate the accept button to clear previous event listeners
        const newAcceptBtn = acceptBtn.cloneNode(true);
        acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);

        newAcceptBtn.addEventListener('click', () => {
            onConfirm();
            this.hideModal('confirmModal');
        });

        cancelBtn.onclick = () => {
            this.hideModal('confirmModal');
        };
    },

    /**
     * Switch between views
     * @param {string} viewName - Name of view to show
     */
    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const selectedView = document.getElementById(`${viewName}View`);
        if (selectedView) {
            selectedView.classList.add('active');
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            }
        });
    },

    /**
     * Apply filters to deadlines
     */
    applyFilters() {
        const search = document.getElementById('searchInput').value;
        const priority = document.getElementById('filterPriority').value;
        const course = document.getElementById('filterCourse').value;
        const status = document.getElementById('filterStatus').value;

        const tasks = StorageManager.getTasks();
        const filteredTasks = filterTasks(tasks, {
            search,
            priority,
            course,
            status
        });

        this.renderDeadlines(filteredTasks);
    },

    /**
     * Toggle theme between light and dark
     */
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');
        const themeToggle = document.getElementById('themeToggle');
        
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        
        // Save theme preference
        const settings = StorageManager.getSettings();
        settings.theme = isDark ? 'dark' : 'light';
        StorageManager.saveSettings(settings);
    },

    /**
     * Load saved theme
     */
    loadTheme() {
        const settings = StorageManager.getSettings();
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');

        if (settings.theme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.textContent = '☀️';
        } else {
            body.classList.remove('dark-theme');
            themeToggle.textContent = '🌙';
        }
    },

    /**
     * Reset a form
     * @param {string} formId - ID of form to reset
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },

    /**
     * Show button loading state
     * @param {HTMLElement} button - Button element
     * @param {boolean} isLoading - Whether to show loading state
     */
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            const originalText = button.textContent;
            button.setAttribute('data-original-text', originalText);
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            const originalText = button.getAttribute('data-original-text') || 'Submit';
            button.classList.remove('btn-loading');
            button.disabled = false;
            button.textContent = originalText;
        }
    }
};

// Make UI available globally
window.UI = UI;