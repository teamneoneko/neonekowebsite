class SupportersManager {
    constructor() {
        this.supportersContainer = document.getElementById('supporters-grid');
        this.loadingElement = document.getElementById('loading');
        this.searchInput = document.getElementById('supporter-search');
        this.supportersUrl = 'https://raw.githubusercontent.com/teamneoneko/neonekowebsite/main/data/supporters.json';
        this.retryDelay = 3000;
        this.maxRetries = 3;
        this.supporters = [];
        
        // Add search event listener
        this.searchInput.addEventListener('input', () => this.handleSearch());
    }

    async init() {
        try {
            await this.loadSupporters();
        } catch (error) {
            console.error('Failed to initialize supporters:', error);
        }
    }

    async loadSupporters(retryCount = 0) {
        try {
            this.showLoading(true);
            const response = await fetch(this.supportersUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Direct assignment since JSON is already an array
            this.supporters = await response.json();
            this.renderSupporters(this.supporters);
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading supporters:', error);
            
            if (retryCount < this.maxRetries) {
                setTimeout(() => {
                    this.loadSupporters(retryCount + 1);
                }, this.retryDelay);
            } else {
                this.showError();
            }
        }
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredSupporters = this.supporters.filter(supporter => 
            supporter.name.toLowerCase().includes(searchTerm)
        );
        this.renderSupporters(filteredSupporters);
    }

    showLoading(show) {
        this.loadingElement.style.display = show ? 'block' : 'none';
    }

    renderSupporters(supporters) {
        this.supportersContainer.innerHTML = '';
        
        const sortedSupporters = supporters.sort((a, b) => b.amount - a.amount);
        
        if (sortedSupporters.length === 0) {
            this.supportersContainer.innerHTML = '<div class="no-results">No supporters found</div>';
            return;
        }

        sortedSupporters.forEach(supporter => {
            const card = this.createSupporterCard(supporter);
            this.supportersContainer.appendChild(card);
        });
    }

    createSupporterCard(supporter) {
        const card = document.createElement('div');
        card.className = 'supporter-card';
        
        // Split the date string and rearrange it to MM/DD/YYYY format
        const [day, month, year] = supporter.date.split('/');
        const formattedDate = new Date(`${month}/${day}/${year}`);
        
        const date = formattedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        card.innerHTML = `
            <div class="supporter-name">${this.escapeHtml(supporter.name)}</div>
            <div class="supporter-amount">${supporter.amount.toFixed(2)}</div>
            ${supporter.message ? `<div class="supporter-message">"${this.escapeHtml(supporter.message)}"</div>` : ''}
            <div class="supporter-date">Donated on ${date}</div>
        `;
        
        return card;
    }     

    showError() {
        this.showLoading(false);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>Failed to load supporters data.</p>
            <button class="primary-button" onclick="location.reload()">Try Again</button>
        `;
        this.supportersContainer.appendChild(errorDiv);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const supportersManager = new SupportersManager();
    supportersManager.init();
});
