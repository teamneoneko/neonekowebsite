const supportersContainer = document.getElementById('manual-supporters');
const loadingDiv = document.getElementById('loading');

// URL for the JSON file on GitHub
const supportersUrl = 'https://raw.githubusercontent.com/teamneoneko/neonekowebsite/main/json/supporters.json';

// Show loading spinner
loadingDiv.style.display = 'block';
supportersContainer.style.display = 'none';

fetch(supportersUrl)
    .then(response => response.json())
    .then(supporters => {
        // Hide loading spinner
        loadingDiv.style.display = 'none';

        const supportersList = document.getElementById('supporters-list');
        supporters.forEach(supporter => {
            const listItem = document.createElement('li');
            listItem.textContent = `${supporter.name} donated $${supporter.amount}`;
            if (supporter.message) {
                listItem.textContent += `: "${supporter.message}"`;
            }
            supportersList.appendChild(listItem);
        });

        // Show supporters container
        supportersContainer.style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        displayErrorMessage('Failed to load supporters data. Please try again later.');
    });

function displayErrorMessage(message) {
    supportersContainer.innerHTML = `
        <p>${message}</p>
        <button id="retryButton" class="button">Retry</button>
    `;
    supportersContainer.style.display = 'block';
    loadingDiv.style.display = 'none';
    const retryButton = document.getElementById('retryButton');
    retryButton.addEventListener('click', () => {
        location.reload();
    });
}
