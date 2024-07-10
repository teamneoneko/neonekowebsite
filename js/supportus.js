function fetchAndDisplaySupporters() {
    fetch('https://raw.githubusercontent.com/teamneoneko/neonekowebsite/main/json/supporters.json')
        .then(response => response.json())
        .then(supporters => {
            const supportersList = document.getElementById('supporters-list');
            supporters.forEach(supporter => {
                const listItem = document.createElement('li');
                listItem.textContent = `${supporter.name} donated $${supporter.amount}`;
                if (supporter.message) {
                    listItem.textContent += `: "${supporter.message}"`;
                }
                supportersList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching supporters:', error);
        });
}

document.addEventListener('DOMContentLoaded', fetchAndDisplaySupporters);
