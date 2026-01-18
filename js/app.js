// Main Application Logic for Academic Planner

const app = {
    /**
     * Initialize the application
     */
    init() {
        console.log('🎓 Academic Planner initialized!');
        
        // Load theme
        UI.loadTheme();
        
        // Initialize UI
        UI.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Set minimum date for deadline input to current date/time
        this.setMinDate();

        checkDeadlineNotifications(); // run once immediately
        setInterval(checkDeadlineNotifications, 60000); // run every minute
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                UI.switchView(e.target.dataset.view);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            UI.toggleTheme();
        });

        // Add deadline button
        document.getElementById('addDeadlineBtn')?.addEventListener('click', () => {
            UI.showModal('deadlineModal');
        });

        // Add course button
        document.getElementById('addCourseBtn')?.addEventListener('click', () => {
            UI.showModal('courseModal');
        });

        // Close modal buttons
        document.getElementById('closeDeadlineModal')?.addEventListener('click', () => {
            UI.hideModal('deadlineModal');
            UI.resetForm('deadlineForm');
        });

        document.getElementById('closeCourseModal')?.addEventListener('click', () => {
            UI.hideModal('courseModal');
            UI.resetForm('courseForm');
        });

        // Cancel buttons
        document.getElementById('cancelDeadline')?.addEventListener('click', () => {
            UI.hideModal('deadlineModal');
            UI.resetForm('deadlineForm');
        });

        document.getElementById('cancelCourse')?.addEventListener('click', () => {
            UI.hideModal('courseModal');
            UI.resetForm('courseForm');
        });

        // Form submissions
        document.getElementById('deadlineForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddDeadline();
        });

        document.getElementById('courseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCourse();
        });

        // Search and filters
        document.getElementById('searchInput')?.addEventListener('input', debounce(() => {
            UI.applyFilters();
        }, 300));

        document.getElementById('filterPriority')?.addEventListener('change', () => {
            UI.applyFilters();
        });

        document.getElementById('filterCourse')?.addEventListener('change', () => {
            UI.applyFilters();
        });

        document.getElementById('filterStatus')?.addEventListener('change', () => {
            UI.applyFilters();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                UI.hideModal('deadlineModal');
                UI.hideModal('courseModal');
                UI.resetForm('deadlineForm');
                UI.resetForm('courseForm');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                UI.hideModal('deadlineModal');
                UI.hideModal('courseModal');
            }
            
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
        });
    },

    /**
     * Set minimum date for deadline input
     */
    setMinDate() {
        const dateInput = document.getElementById('taskDate');
        if (dateInput) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            dateInput.min = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    },

    /**
     * Handle adding a new deadline with loading state
     */
    handleAddDeadline() {
        const submitBtn = document.querySelector('#deadlineForm button[type="submit"]');
        
        // Show loading state
        UI.setButtonLoading(submitBtn, true);

        const title = document.getElementById('taskTitle').value.trim();
        const courseId = document.getElementById('taskCourse').value;
        const dueDate = document.getElementById('taskDate').value;
        const priority = document.getElementById('taskPriority').value;
        const description = document.getElementById('taskDescription').value.trim();

        // Validation
        if (!title || !courseId || !dueDate) {
            alert('Please fill in all required fields!');
            // Remove loading state
            UI.setButtonLoading(submitBtn, false);
            return;
        }

        // Create task object
        const task = {
            title,
            courseId,
            dueDate,
            priority,
            description
        };

        // Simulate API delay for better UX
        setTimeout(() => {
            // Add to storage
            StorageManager.addTask(task);

            // Update UI
            UI.init();

            // Close modal and reset form
            UI.hideModal('deadlineModal');
            UI.resetForm('deadlineForm');

            console.log('✅ Deadline added successfully!');
            
            // Remove loading state
            UI.setButtonLoading(submitBtn, false);
        }, 600);
    },

    /**
     * Handle adding a new course with loading state
     */
    handleAddCourse() {
        const submitBtn = document.querySelector('#courseForm button[type="submit"]');
        
        // Show loading state
        UI.setButtonLoading(submitBtn, true);

        const name = document.getElementById('courseName').value.trim();
        const code = document.getElementById('courseCode').value.trim();
        const instructor = document.getElementById('courseInstructor').value.trim();
        const color = document.getElementById('courseColor').value;

        // Validation
        if (!name) {
            alert('Please enter a course name!');
            UI.setButtonLoading(submitBtn, false);
            return;
        }

        // Create course object
        const course = {
            name,
            code,
            instructor,
            color
        };

        // Simulate API delay
        setTimeout(() => {
            // Add to storage
            StorageManager.addCourse(course);

            // Update UI
            UI.init();

            // Close modal and reset form
            UI.hideModal('courseModal');
            UI.resetForm('courseForm');

            console.log('✅ Course added successfully!');
            
            // Remove loading state
            UI.setButtonLoading(submitBtn, false);
        }, 600);
    },

    /**
     * Toggle task completion
     * @param {string} taskId - ID of task to toggle
     */
    toggleTask(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"] .icon-btn.complete`);
        if (taskElement) {
            const originalText = taskElement.textContent;
            taskElement.classList.add('btn-loading');
            taskElement.disabled = true;
            
            setTimeout(() => {
                StorageManager.toggleTaskCompletion(taskId);
                UI.init();
                console.log('✅ Task status updated!');
            }, 300);
        }
    },

    /**
     * Delete a task
     * @param {string} taskId - ID of task to delete
     */
    deleteTask(taskId) {
        // 1. Find the task to get its title
        const tasks = StorageManager.getTasks();
        const taskToDelete = tasks.find(t => t.id === taskId);
        
        if (!taskToDelete) return;

        // 2. Prepare message
        const message = `Are you sure you want to delete the deadline: "${taskToDelete.title}"?`;

        // 3. Use the new Custom Modal with your loading animation inside
        UI.showConfirmModal(message, () => {
            const taskElement = document.querySelector(`[data-task-id="${taskId}"] .icon-btn.delete`);
            if (taskElement) {
                taskElement.classList.add('btn-loading');
                taskElement.disabled = true;
            }
            
            setTimeout(() => {
                StorageManager.deleteTask(taskId);
                UI.init();
                console.log('🗑️ Task deleted!');
            }, 300);
        });
    },

    /**
     * Delete a course
     * @param {string} courseId - ID of course to delete
     */
    deleteCourse(courseId) {
        // Check if course has tasks
        const tasks = StorageManager.getTasks().filter(t => t.courseId === courseId);
        
        if (tasks.length > 0) {
            if (!confirm(`This course has ${tasks.length} task(s). Deleting it will also delete all associated tasks. Continue?`)) {
                return;
            }
        
        } else {
            if (!confirm('Are you sure you want to delete this course?')) {
                return;
            }
        }

        // Find and show loading on delete button
        const courseElement = document.querySelector(`.course-card [onclick*="${courseId}"]`);
        if (courseElement) {
            const originalText = courseElement.textContent;
            courseElement.classList.add('btn-loading');
            courseElement.disabled = true;
            
            setTimeout(() => {
                // Delete all tasks for this course if any
                tasks.forEach(task => StorageManager.deleteTask(task.id));
                StorageManager.deleteCourse(courseId);
                UI.init();
                console.log('🗑️ Course deleted!');
            }, 300);
        }
    },

    /**
     * Export all data
     */
    exportData() {
        const exportBtn = document.querySelector('[onclick*="exportData"]');
        if (exportBtn) {
            const originalText = exportBtn.textContent;
            exportBtn.classList.add('btn-loading');
            exportBtn.disabled = true;
            
            setTimeout(() => {
                const data = StorageManager.exportAll();
                exportToJSON(data, `academic-planner-backup-${new Date().toISOString().split('T')[0]}.json`);
                console.log('📥 Data exported successfully!');
                
                exportBtn.classList.remove('btn-loading');
                exportBtn.disabled = false;
                exportBtn.textContent = originalText;
            }, 300);
        }
    },

    /**
     * Import data from file
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('This will replace all current data. Continue?')) {
                        // Show loading
                        const importBtn = document.querySelector('[onclick*="importData"]');
                        if (importBtn) {
                            const originalText = importBtn.textContent;
                            importBtn.classList.add('btn-loading');
                            importBtn.disabled = true;
                            
                            setTimeout(() => {
                                StorageManager.importData(data);
                                UI.init();
                                console.log('📤 Data imported successfully!');
                                
                                importBtn.classList.remove('btn-loading');
                                importBtn.disabled = false;
                                importBtn.textContent = originalText;
                            }, 300);
                        }
                    }
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Make app available globally
window.app = app;

// Deadline notification for 24h 
function checkDeadlineNotifications(){
    const tasks = StorageManager.getTasks();
    const now = new Date();
    let updated = false;

    tasks.forEach(task => {
        if(task.completed) return;
        const deadline = new Date(task.dueDate);
        const diffHours = (deadline - now) / (1000 * 60 * 60);
        const hoursLeft = Math.floor(diffHours);
        const minutesLeft = Math.floor((diffHours - hoursLeft) * 60);

        if(diffHours <= 24 && diffHours > 23 && !task.notifiedDay){
            alert(`⏰ "${task.title}" is due tomorrow You have ${hoursLeft} hours left and ${minutesLeft} minutes left.`);
            task.notifiedDay = true;
            updated = true;
        }

        if(diffHours <= 1 && diffHours > 0 && !task.notifiedHour){
            alert(`🔥 "${task.title}" is due in ${hoursLeft} hours and ${minutesLeft} minutes`)
            task.notifiedHour = true;
            updated = true;
        }
    })

    if(updated){
        StorageManager.saveTasks(tasks);
    }
}