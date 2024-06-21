const faqContainer = document.getElementById('faq-container');
const loadingDiv = document.getElementById('loading');

// Fetch the FAQ data and categories from the JSON files
Promise.all([
    fetch('json/faq.json'),
    fetch('json/categories.json')
])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([faqData, categoriesData]) => {
        // Hide loading spinner
        loadingDiv.style.display = 'none';

        // Generate category containers dynamically
        categoriesData.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('faq-category');

            const categoryHeading = document.createElement('h2');
            categoryHeading.textContent = category;

            const arrowIcon = document.createElement('i');
            arrowIcon.classList.add('fas', 'fa-chevron-right');
            categoryHeading.appendChild(arrowIcon);

            const categoryContent = document.createElement('div');
            categoryContent.classList.add('faq-category-content');
            categoryContent.id = category.toLowerCase().replace(/\s+/g, '-');

            categoryDiv.appendChild(categoryHeading);
            categoryDiv.appendChild(categoryContent);
            faqContainer.appendChild(categoryDiv);

            // Add click event listener to toggle category visibility
            categoryHeading.addEventListener('click', () => {
                categoryContent.classList.toggle('expanded');
                categoryHeading.classList.toggle('expanded');
                
                // Toggle between right and down arrow
                arrowIcon.classList.toggle('fa-chevron-right');
                arrowIcon.classList.toggle('fa-chevron-down');
            });
        });

        // Group FAQ items by category
        const categories = {};
        categoriesData.forEach(category => {
            categories[category] = [];
        });
        faqData.forEach(faq => {
            categories[faq.category].push(faq);
        });

        // Generate FAQ elements dynamically for each category
        Object.entries(categories).forEach(([category, faqs]) => {
            const categoryContent = document.getElementById(`${category.toLowerCase().replace(/\s+/g, '-')}`);
            faqs.forEach(faq => {
                const faqElement = document.createElement('div');
                faqElement.classList.add('faq-item');

                const questionElement = document.createElement('h3');
                questionElement.textContent = faq.question;

                const arrowIcon = document.createElement('i');
                arrowIcon.classList.add('fas', 'fa-chevron-down');
                questionElement.appendChild(arrowIcon);

                const answerElement = document.createElement('p');
                answerElement.innerHTML = faq.answer.replace(/\n/g, '<br>');

                faqElement.appendChild(questionElement);
                faqElement.appendChild(answerElement);

                // Add click event listener to toggle answer visibility
                questionElement.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent category from toggling when clicking question
                    faqElement.classList.toggle('expanded');
                    arrowIcon.classList.toggle('fa-chevron-down');
                    arrowIcon.classList.toggle('fa-chevron-up');
                });

                categoryContent.appendChild(faqElement);
            });
        });

        // Show FAQ container
        faqContainer.style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage('Failed to load FAQ data. Please try again later.');
    });

function displayErrorMessage(message) {
    faqContainer.innerHTML = `
        <p>${message}</p>
        <button id="retryButton" class="button">Retry</button>
    `;
    faqContainer.style.display = 'block';
    const retryButton = document.getElementById('retryButton');
    retryButton.addEventListener('click', () => {
        location.reload();
    });
}
