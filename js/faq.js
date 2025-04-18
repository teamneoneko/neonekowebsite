document.addEventListener('DOMContentLoaded', () => {
    // Core DOM elements
    const faqContainer = document.getElementById('faq-container');
    const loadingDiv = document.getElementById('loading');
    const errorContainer = document.getElementById('error-container');
    const searchInput = document.getElementById('faqSearch');
    const categoriesList = document.getElementById('categoriesList');
    
    // Global data storage
    let faqData = [];
    let categoriesData = [];

    // GitHub URLs
    const baseUrl = 'https://raw.githubusercontent.com/teamneoneko/neonekowebsite/main/data';
    const categoriesUrl = `${baseUrl}/categories.json`;
    const faqBaseUrl = `${baseUrl}/faq`;

    // Fetch FAQ data and categories from GitHub
    async function fetchFAQData() {
        try {
            const categoriesResponse = await fetch(categoriesUrl);
            if (!categoriesResponse.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            const categoriesData = await categoriesResponse.json();
            const categories = categoriesData.categories;
            
            // Fetch all category FAQ files in parallel
            const faqPromises = categories.map(category => {
                const fileName = category.toLowerCase().replace(/\s+/g, '-');
                return fetch(`${faqBaseUrl}/${fileName}.json`)
                    .then(response => response.json())
                    .catch(error => {
                        console.warn(`Failed to load ${fileName}.json:`, error);
                        return { faqs: [] };
                    });
            });
    
            const faqResults = await Promise.all(faqPromises);
            
            // Combine all FAQs into one array
            const combinedFaqs = faqResults.reduce((acc, result) => {
                return acc.concat(result.faqs);
            }, []);
    
            return {
                faqData: combinedFaqs,
                categoriesData: categories
            };
        } catch (error) {
            throw new Error('Failed to fetch FAQ data');
        }
    }
    
    // Render FAQ content with enhanced formatting
    function renderFAQ(faqData, categoriesData) {
        loadingDiv.style.display = 'none';
        faqContainer.innerHTML = '';
        categoriesList.innerHTML = '';
        
        // Render categories in sidebar
        categoriesData.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = `#${category.toLowerCase().replace(/\s+/g, '-')}`;
            categoryLink.textContent = category;
            categoriesList.appendChild(categoryLink);
        });
    
        // Render FAQ content by category
        categoriesData.forEach(category => {
            const categoryFAQs = faqData.filter(faq => faq.category === category);
            
            if (categoryFAQs.length > 0) {
                const section = document.createElement('section');
                section.id = category.toLowerCase().replace(/\s+/g, '-');
                section.className = 'markdown-content';
                
                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = category;
                section.appendChild(categoryTitle);
    
                categoryFAQs.forEach(faq => {
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item';
                    faqItem.dataset.keywords = faq.keywords.join(',');
                    faqItem.id = `faq-${faq.id}`; // Add ID for direct linking
                    
                    const question = document.createElement('h3');
                    question.className = 'faq-question';
                    
                    // Create question content with toggle icon and copy link button
                    question.innerHTML = `
                        <span class="question-text">${faq.question}</span>
                        <div class="question-controls">
                            <button class="copy-link-btn" data-faq-id="${faq.id}" title="Copy link to this FAQ">
                                <i class="fas fa-link"></i>
                            </button>
                            <span class="toggle-icon">+</span>
                        </div>
                    `;
                    
                    const answer = document.createElement('div');
                    answer.className = 'faq-content hidden markdown-content';
                    const formattedContent = formatContent(faq.answer);
                    
                    const metadata = `
                    <div class="faq-metadata">
                        <button class="version-history-btn" data-faq-id="${faq.id}">
                            <span class="version-badge">v${faq.version}</span>
                            <span class="last-updated"><i class="fas fa-clock"></i> ${new Date(faq.lastUpdated).toLocaleDateString()}</span>
                            <span class="history-icon"><i class="fas fa-history"></i></span>
                        </button>
                    </div>
                `;
                    
                    answer.innerHTML = formattedContent + metadata;
                    
                    question.addEventListener('click', (e) => {
                        // Don't toggle if clicking the copy link button
                        if (e.target.closest('.copy-link-btn')) {
                            return;
                        }
                        
                        const wasHidden = answer.classList.contains('hidden');
                        
                        document.querySelectorAll('.faq-content').forEach(content => {
                            content.classList.add('hidden');
                            content.previousElementSibling.querySelector('.toggle-icon').textContent = '+';
                        });
                        
                        if (wasHidden) {
                            answer.classList.remove('hidden');
                            question.querySelector('.toggle-icon').textContent = '-';
                        }
                    });
                    
                    faqItem.appendChild(question);
                    faqItem.appendChild(answer);
                    section.appendChild(faqItem);
                });
    
                faqContainer.appendChild(section);
            }
        });
    }    

    function formatContent(content) {
        // Check if content should be displayed as raw markdown
        if (content.includes('[raw-markdown]')) {
            return content
                .replace('[raw-markdown]', '')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>')
                .replace(/`(.*?)`/g, '<code>$1</code>');
        }
    
        // Pre-process content to handle multi-line structures
        let processedContent = content;
        
        // Handle tables
        processedContent = processedContent.replace(/(\|.*\|\n?)+/g, match => {
            const rows = match.trim().split('\n');
            return '<table>' + rows.map(row => {
                const cells = row.split('|').filter(cell => cell.trim().length > 0);
                return '<tr>' + cells.map(cell => `<td>${cell.trim()}</td>`).join('') + '</tr>';
            }).join('') + '</table>';
        });
    
        // Handle ordered lists
        processedContent = processedContent.replace(/(?:^\d+\.\s+.*(?:\n|$))+/gm, match => {
            const items = match.split('\n').filter(item => item.trim());
            return '<ol>' + items.map(item => {
                const content = item.replace(/^\d+\.\s+/, '');
                return `<li>${content}</li>`;
            }).join('') + '</ol>';
        });
    
        // Handle blockquotes
        processedContent = processedContent.replace(/(?:^>\s*.*(?:\n|$))+/gm, match => {
            const lines = match.split('\n').filter(line => line.trim());
            const content = lines.map(line => line.replace(/^>\s*/, '')).join('<br>');
            return `<blockquote>${content}</blockquote>`;
        });
    
        // Main formatting
        return processedContent
            .replace(/\[image:(\d+):(\d+)\](.*?)\[\/image\]/g, '<img loading="lazy" src="$3" width="$1" height="$2" alt="FAQ Image">')
            .replace(/\[image\](.*?)\[\/image\]/g, '<img loading="lazy" src="$1" alt="FAQ Image">')
            .replace(/\[link\](.*?)\|(.*?)\[\/link\]/g, '<a href="$1">$2</a>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
            .replace(/^\- (.*?)$/gm, '• $1')
            .replace(/\[color:(.*?)\](.*?)\[\/color\]/g, '<span style="color: $1">$2</span>')
            .replace(/\[details\]([^|]*?)\|([\s\S]*?)\[\/details\]/gs, '<details class="faq-details"><summary class="faq-summary">$1</summary><div class="faq-details-content">$2</div></details>')
            .replace(/\[info\]([\s\S]*?)\[\/info\]/gs, '<div class="info-callout">$1</div>')
            .replace(/\[warning\]([\s\S]*?)\[\/warning\]/gs, '<div class="warning-callout">$1</div>')
            .replace(/\[note\]([\s\S]*?)\[\/note\]/gs, '<div class="note-callout">$1</div>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }   

    // Initialize with GitHub data
    fetchFAQData()
        .then(({ faqData: data, categoriesData: categories }) => {
            faqData = data;
            categoriesData = categories;
            console.log('Data received:', { faqData, categoriesData });
            renderFAQ(faqData, categoriesData);
        })
        .catch(error => {
            loadingDiv.style.display = 'none';
            errorContainer.style.display = 'block';
            errorContainer.querySelector('#errorMessage').textContent = error.message;
        });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const sections = document.querySelectorAll('.wiki-content section');
        const faqContainer = document.getElementById('faq-container');
        let totalVisibleItems = 0;
        
        // If search is empty, show all content
        if (!searchTerm) {
            renderFAQ(faqData, categoriesData);
            return;
        }
        
        // Clear existing content and re-render sections
        faqContainer.innerHTML = '';
        categoriesData.forEach(category => {
            const categoryFAQs = faqData.filter(faq => faq.category === category);
            const section = document.createElement('section');
            section.id = category.toLowerCase().replace(/\s+/g, '-');
            section.className = 'markdown-content';
            
            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category;
            section.appendChild(categoryTitle);
            
            let visibleItems = 0;
            
            // Check if category matches search term
            const categoryMatches = category.toLowerCase().includes(searchTerm);
            
            categoryFAQs.forEach(faq => {
                const text = `${faq.question} ${faq.answer}`.toLowerCase();
                const keywords = faq.keywords || [];
                
                const matchesText = text.includes(searchTerm);
                const matchesKeywords = keywords.some(keyword => 
                    keyword.toLowerCase().includes(searchTerm)
                );
                
                if (matchesText || matchesKeywords || categoryMatches) {
                    visibleItems++;
                    totalVisibleItems++;
                    
                    const faqItem = document.createElement('div');
                    faqItem.className = 'faq-item';
                    faqItem.dataset.keywords = faq.keywords.join(',');
                    faqItem.id = `faq-${faq.id}`; // Add ID for direct linking
                    
                    const question = document.createElement('h3');
                    question.className = 'faq-question';
                    
                    // Create question content with toggle icon and copy link button
                    question.innerHTML = `
                        <span class="question-text">${faq.question}</span>
                        <div class="question-controls">
                            <button class="copy-link-btn" data-faq-id="${faq.id}" title="Copy link to this FAQ">
                                <i class="fas fa-link"></i>
                            </button>
                            <span class="toggle-icon">+</span>
                        </div>
                    `;
                    
                    const answer = document.createElement('div');
                    answer.className = 'faq-content hidden markdown-content';
                    const formattedContent = formatContent(faq.answer);
                    
                    const metadata = `
                        <div class="faq-metadata">
                            <button class="version-history-btn" data-faq-id="${faq.id}">
                                <span class="version-badge">v${faq.version}</span>
                                <span class="last-updated"><i class="fas fa-clock"></i> ${new Date(faq.lastUpdated).toLocaleDateString()}</span>
                                <span class="history-icon"><i class="fas fa-history"></i></span>
                            </button>
                        </div>
                    `;
                    
                    answer.innerHTML = formattedContent + metadata;
                    
                    question.addEventListener('click', (e) => {
                        // Don't toggle if clicking the copy link button
                        if (e.target.closest('.copy-link-btn')) {
                            return;
                        }
                        
                        const wasHidden = answer.classList.contains('hidden');
                        
                        document.querySelectorAll('.faq-content').forEach(content => {
                            content.classList.add('hidden');
                            content.previousElementSibling.querySelector('.toggle-icon').textContent = '+';
                        });
                        
                        if (wasHidden) {
                            answer.classList.remove('hidden');
                            question.querySelector('.toggle-icon').textContent = '-';
                        }
                    });
                    
                    faqItem.appendChild(question);
                    faqItem.appendChild(answer);
                    section.appendChild(faqItem);
                }
            });
            
            if (visibleItems > 0 || categoryMatches) {
                faqContainer.appendChild(section);
            }
            
            const categoryId = section.id;
            const sidebarLink = document.querySelector(`.wiki-nav a[href="#${categoryId}"]`);
            if (sidebarLink) {
                sidebarLink.style.display = (visibleItems > 0 || categoryMatches) ? 'block' : 'none';
            }
        });
    
        if (totalVisibleItems === 0) {
            faqContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>There are no results for this search. Please try again using different keywords.</p>
                </div>
            `;
        }
    });
        
    // Version history popup handler
    document.addEventListener('click', (e) => {
        if (e.target.closest('.version-history-btn')) {
            const faqId = e.target.closest('.version-history-btn').dataset.faqId;
            const faq = faqData.find(f => f.id === parseInt(faqId));
            
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            
            const modal = document.createElement('div');
            modal.className = 'version-history-modal';
            modal.innerHTML = `
                <h3>Version History</h3>
                ${faq.history.map(h => `
                    <div class="history-item">
                        <div class="history-version">Version ${h.version}</div>
                        <div class="history-date">${new Date(h.date).toLocaleDateString()}</div>
                        <div class="history-changes">${h.changes}</div>
                    </div>
                `).join('')}
                <button class="close-modal">Close</button>
            `;
            
            document.body.appendChild(overlay);
            document.body.appendChild(modal);
            
            const closeModal = () => {
                overlay.remove();
                modal.remove();
            };
            
            overlay.addEventListener('click', closeModal);
            modal.querySelector('.close-modal').addEventListener('click', closeModal);
        }
    });
    
    // Copy link functionality
    document.addEventListener('click', (e) => {
        if (e.target.closest('.copy-link-btn')) {
            const faqId = e.target.closest('.copy-link-btn').dataset.faqId;
            const url = `${window.location.origin}${window.location.pathname}#faq-${faqId}`;
            
            // Copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                // Show a temporary success message
                const button = e.target.closest('.copy-link-btn');
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
            
            // Prevent event bubbling to avoid toggling the FAQ
            e.stopPropagation();
        }
    });
    
    // Check for hash in URL and open corresponding FAQ
    function checkUrlHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#faq-')) {
            const faqId = hash.replace('#faq-', '');
            setTimeout(() => {
                const faqElement = document.getElementById(`faq-${faqId}`);
                if (faqElement) {
                    // Scroll to the element
                    faqElement.scrollIntoView({ behavior: 'smooth' });
                    
                    // Open the FAQ
                    const question = faqElement.querySelector('.faq-question');
                    const answer = faqElement.querySelector('.faq-content');
                    
                    document.querySelectorAll('.faq-content').forEach(content => {
                        content.classList.add('hidden');
                        content.previousElementSibling.querySelector('.toggle-icon').textContent = '+';
                    });
                    
                    answer.classList.remove('hidden');
                    question.querySelector('.toggle-icon').textContent = '-';
                }
            }, 500); // Small delay to ensure content is loaded
        }
    }

    // Check hash when page loads
    checkUrlHash();

    // Listen for hash changes
    window.addEventListener('hashchange', checkUrlHash);
});
