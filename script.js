// Todo List App JavaScript
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        this.isDarkMode = this.loadTheme();
        
        this.initializeElements();
        this.bindEvents();
        this.applyTheme();
        this.render();
    }

    initializeElements() {
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.prioritySelect = document.getElementById('priority-select');
        this.todoList = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        this.todoCount = document.getElementById('todo-count');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.searchInput = document.getElementById('search-input');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Modal elements
        this.editModal = document.getElementById('edit-modal');
        this.editInput = document.getElementById('edit-input');
        this.closeModalBtn = document.getElementById('close-modal');
        this.cancelEditBtn = document.getElementById('cancel-edit');
        this.saveEditBtn = document.getElementById('save-edit');
    }

    bindEvents() {
        // Form submission
        this.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        // Clear completed
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        
        // Modal events
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        
        // Close modal when clicking outside
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    handleAddTodo(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();
        const priority = this.prioritySelect.value;
        
        if (!text) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }
        
        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: priority
        };
        
        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.prioritySelect.value = 'normal'; // Reset to default
        this.saveTodos();
        this.render();
        this.showNotification('Task added successfully!', 'success');
        
        // Focus back to input
        this.todoInput.focus();
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.render();
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        this.render(searchTerm);
    }

    handleKeyboard(e) {
        // Escape key to close modal
        if (e.key === 'Escape' && this.editModal.style.display === 'block') {
            this.closeModal();
        }
        
        // Enter key to add todo (when input is focused)
        if (e.key === 'Enter' && document.activeElement === this.todoInput) {
            this.todoForm.dispatchEvent(new Event('submit'));
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            
            const message = todo.completed ? 'Task completed!' : 'Task marked as active!';
            this.showNotification(message, 'success');
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            this.editInput.value = todo.text;
            this.editInput.select();
            this.showModal();
        }
    }

    saveEdit() {
        const text = this.editInput.value.trim();
        
        if (!text) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }
        
        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            todo.text = text;
            this.saveTodos();
            this.render();
            this.closeModal();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.showNotification('Task deleted!', 'success');
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.showNotification(`${completedCount} completed task(s) cleared!`, 'success');
        }
    }

    showModal() {
        this.editModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.editInput.focus();
    }

    closeModal() {
        this.editModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.editingId = null;
        this.editInput.value = '';
    }

    getFilteredTodos(searchTerm = '') {
        let filtered = this.todos;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply status/priority filter
        switch (this.currentFilter) {
            case 'active':
                return filtered.filter(todo => !todo.completed);
            case 'completed':
                return filtered.filter(todo => todo.completed);
            case 'high':
                return filtered.filter(todo => todo.priority === 'high');
            default:
                return filtered;
        }
    }

    render(searchTerm = '') {
        const filteredTodos = this.getFilteredTodos(searchTerm);
        const activeTodos = this.todos.filter(t => !t.completed);
        
        // Update todo count
        this.todoCount.textContent = `${activeTodos.length} task${activeTodos.length !== 1 ? 's' : ''} remaining`;
        
        // Show/hide empty state
        if (filteredTodos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
            
            // Update empty state message based on filter/search
            const emptyStateIcon = this.emptyState.querySelector('i');
            const emptyStateTitle = this.emptyState.querySelector('h3');
            const emptyStateText = this.emptyState.querySelector('p');
            
            if (searchTerm) {
                emptyStateIcon.className = 'fas fa-search';
                emptyStateTitle.textContent = 'No tasks found';
                emptyStateText.textContent = `No tasks match "${searchTerm}"`;
            } else if (this.currentFilter === 'active') {
                emptyStateIcon.className = 'fas fa-check-circle';
                emptyStateTitle.textContent = 'All tasks completed!';
                emptyStateText.textContent = 'Great job! You\'ve completed all your tasks.';
            } else if (this.currentFilter === 'completed') {
                emptyStateIcon.className = 'fas fa-clock';
                emptyStateTitle.textContent = 'No completed tasks';
                emptyStateText.textContent = 'Complete some tasks to see them here.';
            } else {
                emptyStateIcon.className = 'fas fa-clipboard-list';
                emptyStateTitle.textContent = 'No tasks yet';
                emptyStateText.textContent = 'Add your first task above to get started!';
            }
        } else {
            this.todoList.style.display = 'block';
            this.emptyState.style.display = 'none';
        }
        
        // Render todo items
        this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        
        // Bind events to new elements
        this.bindTodoEvents();
    }

    createTodoHTML(todo) {
        const createdDate = new Date(todo.createdAt).toLocaleDateString();
        const createdTime = new Date(todo.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}" data-id="${todo.id}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                >
                <div class="todo-content">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-meta">
                        <small class="todo-date">Created: ${createdDate} at ${createdTime}</small>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="priority-badge ${todo.priority}">${todo.priority}</div>
            </li>
        `;
    }

    bindTodoEvents() {
        // Checkbox events
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoId = e.target.closest('.todo-item').dataset.id;
                this.toggleTodo(todoId);
            });
        });
        
        // Edit button events
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = e.target.closest('.todo-item').dataset.id;
                this.editTodo(todoId);
            });
        });
        
        // Delete button events
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = e.target.closest('.todo-item').dataset.id;
                this.deleteTodo(todoId);
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '250px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || icons.info;
    }

    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving todos:', error);
            this.showNotification('Error saving tasks!', 'error');
        }
    }

    loadTodos() {
        try {
            const saved = localStorage.getItem('todos');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showNotification('Error loading tasks!', 'error');
            return [];
        }
    }

    // Theme management methods
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    saveTheme() {
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.saveTheme();
        this.applyTheme();
        this.showNotification(
            `Switched to ${this.isDarkMode ? 'dark' : 'light'} mode!`, 
            'success'
        );
    }

    updateThemeIcon() {
        const icon = this.themeToggle.querySelector('i');
        if (this.isDarkMode) {
            icon.className = 'fas fa-sun';
            this.themeToggle.title = 'Switch to light mode';
        } else {
            icon.className = 'fas fa-moon';
            this.themeToggle.title = 'Switch to dark mode';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add some demo data if no todos exist
document.addEventListener('DOMContentLoaded', () => {
    const app = new TodoApp();
    
    // Add demo todos if none exist
    if (app.todos.length === 0) {
        const demoData = [
            {
                id: '1',
                text: 'Welcome to your Todo List!',
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'high'
            },
            {
                id: '2',
                text: 'Click the checkbox to mark tasks as complete',
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'normal'
            },
            {
                id: '3',
                text: 'Use the edit button to modify tasks',
                completed: true,
                createdAt: new Date().toISOString(),
                priority: 'low'
            },
            {
                id: '4',
                text: 'Try filtering by All, Active, Completed, or High Priority',
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'normal'
            },
            {
                id: '5',
                text: 'Search for specific tasks using the search box',
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'high'
            },
            {
                id: '6',
                text: 'Notice the color-coded priority indicators!',
                completed: false,
                createdAt: new Date().toISOString(),
                priority: 'low'
            }
        ];
        
        app.todos = demoData;
        app.saveTodos();
        app.render();
    }
});
