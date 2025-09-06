const { ipcRenderer } = require('electron');

class VocabularyWidget {
    constructor() {
        this.vocabularies = [];
        this.currentIndex = 0;
        this.rotationTimer = null;
    this.rotationInterval = 3 * 60 * 1000; // 3 minutes
        this.progressTimer = null;
        this.isPaused = false;
        this.isMinimized = false;
        this.alwaysOnTop = true;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadVocabularyData();
        this.startRotationTimer();
    }

    initializeElements() {
        // Main elements
        this.widgetContainer = document.getElementById('widget-container');
        this.widgetContent = document.getElementById('widget-content');
        this.minimizedContent = document.getElementById('minimized-content');
    this.header = document.querySelector('.widget-header');
        
        // Content elements
        this.loading = document.getElementById('loading');
        this.vocabContent = document.getElementById('vocab-content');
        this.errorContent = document.getElementById('error-content');
        
        // Vocabulary display elements
        this.wordEl = document.getElementById('word');
        this.pronunciationEl = document.getElementById('pronunciation');
        this.meaningEl = document.getElementById('meaning');
    // Removed memory tip & example elements in simplified mode
        
        // Control elements
        this.pinBtn = document.getElementById('pin-btn');
        this.minimizeBtn = document.getElementById('minimize-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        
        // Progress elements
        this.timerDisplay = document.getElementById('timer-display');
        this.progressFill = document.getElementById('progress-fill');
    }

    setupEventListeners() {
        // Control buttons
        this.pinBtn.addEventListener('click', () => this.toggleAlwaysOnTop());
        this.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        this.closeBtn.addEventListener('click', () => this.closeApp());
        
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousVocabulary());
        this.nextBtn.addEventListener('click', () => this.nextVocabulary());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        
        // Minimized content click
        this.minimizedContent.addEventListener('click', () => this.toggleMinimize());
        
        // IPC listeners
        ipcRenderer.on('vocabulary-updated', () => {
            this.loadVocabularyData();
        });
    }

    async loadVocabularyData() {
        try {
            this.showLoading();
            
            const result = await ipcRenderer.invoke('get-vocabulary-data');
            
            if (result.success && result.data && result.data.length > 0) {
                this.vocabularies = result.data;
                this.currentIndex = 0;
                this.displayCurrentVocabulary();
                this.hideLoading();
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('Failed to load vocabulary:', error);
            this.showError();
        }
    }

    showLoading() {
        this.loading.style.display = 'flex';
        this.vocabContent.style.display = 'none';
        this.errorContent.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
        this.vocabContent.style.display = 'flex';
        this.errorContent.style.display = 'none';
    }

    showError() {
        this.loading.style.display = 'none';
        this.vocabContent.style.display = 'none';
        this.errorContent.style.display = 'flex';
    }

    displayCurrentVocabulary() {
        if (this.vocabularies.length === 0) {
            this.showError();
            return;
        }

        const vocab = this.vocabularies[this.currentIndex];
        
        // Update display elements
        this.wordEl.textContent = vocab.word || 'Unknown';
        this.pronunciationEl.textContent = vocab.pronunciation ? `/${vocab.pronunciation}/` : '';
        this.meaningEl.textContent = vocab.meaning || 'No meaning available';
        
    // Memory tip & example removed in simplified display

        // Update window title
        document.title = `Vocabulary: ${vocab.word}`;
    }

    // Removed memory tip cleaning (not needed now)

    nextVocabulary() {
        if (this.vocabularies.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.vocabularies.length;
        this.displayCurrentVocabulary();
        this.resetRotationTimer();
    }

    previousVocabulary() {
        if (this.vocabularies.length === 0) return;
        
        this.currentIndex = this.currentIndex === 0 
            ? this.vocabularies.length - 1 
            : this.currentIndex - 1;
        this.displayCurrentVocabulary();
        this.resetRotationTimer();
    }

    startRotationTimer() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
        }
        
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }

        if (this.isPaused) return;

        // Start main rotation timer
        this.rotationTimer = setTimeout(() => {
            this.nextVocabulary();
        }, this.rotationInterval);

        // Start progress timer
        this.startProgressTimer();
    }

    startProgressTimer() {
        const startTime = Date.now();
        
        this.progressTimer = setInterval(() => {
            if (this.isPaused) return;
            
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, this.rotationInterval - elapsed);
            const progress = (elapsed / this.rotationInterval) * 100;
            
            // Update progress bar
            this.progressFill.style.width = `${Math.min(100, progress)}%`;
            
            // Update timer display
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            this.timerDisplay.textContent = `Next: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (remaining <= 0) {
                clearInterval(this.progressTimer);
                this.progressFill.style.width = '0%';
            }
        }, 1000);
    }

    resetRotationTimer() {
        this.startRotationTimer();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
        this.pauseBtn.title = this.isPaused ? 'Resume' : 'Pause';
        
        if (this.isPaused) {
            if (this.rotationTimer) {
                clearTimeout(this.rotationTimer);
                this.rotationTimer = null;
            }
            if (this.progressTimer) {
                clearInterval(this.progressTimer);
                this.progressTimer = null;
            }
        } else {
            this.startRotationTimer();
        }
    }

    async toggleAlwaysOnTop() {
        try {
            this.alwaysOnTop = await ipcRenderer.invoke('toggle-always-on-top');
            this.pinBtn.classList.toggle('active', this.alwaysOnTop);
            this.pinBtn.title = this.alwaysOnTop ? 'Disable Always on Top' : 'Enable Always on Top';
        } catch (error) {
            console.error('Failed to toggle always on top:', error);
        }
    }

    async toggleMinimize() {
        try {
            this.isMinimized = await ipcRenderer.invoke('minimize-window');
            
            if (this.isMinimized) {
                this.widgetContent.style.display = 'none';
                this.minimizedContent.style.display = 'flex';
                if (this.header) this.header.style.display = 'none';
                this.widgetContainer.classList.add('minimized');
                this.minimizeBtn.classList.add('active');
            } else {
                this.widgetContent.style.display = 'flex';
                this.minimizedContent.style.display = 'none';
                if (this.header) this.header.style.display = 'flex';
                this.widgetContainer.classList.remove('minimized');
                this.minimizeBtn.classList.remove('active');
            }
        } catch (error) {
            console.error('Failed to minimize window:', error);
        }
    }

    async closeApp() {
        try {
            await ipcRenderer.invoke('close-app');
        } catch (error) {
            console.error('Failed to close app:', error);
        }
    }

    // Cleanup method
    destroy() {
        if (this.rotationTimer) {
            clearTimeout(this.rotationTimer);
        }
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
        }
    }
}

// Initialize the widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const widget = new VocabularyWidget();
    
    // Cleanup on window unload
    window.addEventListener('beforeunload', () => {
        widget.destroy();
    });
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    // You can add responsive behavior here if needed
});

// Export for debugging purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VocabularyWidget;
}
