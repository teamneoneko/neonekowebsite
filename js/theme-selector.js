document.addEventListener('DOMContentLoaded', () => {
    const themeSelects = document.querySelectorAll('#theme-select, .mobile-theme-selector select');
    const themeStylesheet = document.createElement('link');
    themeStylesheet.rel = 'stylesheet';
    document.head.appendChild(themeStylesheet);

    const THEME_VERSION = '3.0';
    const savedThemeVersion = localStorage.getItem('themeVersion');
    
    if (!savedThemeVersion || savedThemeVersion !== THEME_VERSION) {
        localStorage.setItem('selectedTheme', 'christmas');
        localStorage.setItem('themeVersion', THEME_VERSION);
    }

    const themeHint = document.querySelector('.theme-hint');
    if (!localStorage.getItem('themeHintSeen')) {
        themeHint.classList.add('flash-animation');
        
        setTimeout(() => {
            themeHint.classList.remove('flash-animation');
        }, 10000);
        
        setTimeout(() => {
            themeHint.style.setProperty('--hint-opacity', '0');
        }, 30000);
        
        localStorage.setItem('themeHintSeen', 'true');
    } else {
        themeHint.style.setProperty('--hint-opacity', '0');
    }
    
    function addRandomPumpkins() {
        const pumpkinContainer = document.createElement('div');
        pumpkinContainer.id = 'halloween-pumpkins';
        pumpkinContainer.style.position = 'absolute';
        pumpkinContainer.style.width = '100%';
        pumpkinContainer.style.height = '100%';
        pumpkinContainer.style.pointerEvents = 'none';
        pumpkinContainer.style.zIndex = '-1';
        document.body.appendChild(pumpkinContainer);

        const numPumpkins = 25;
        const pumpkinSize = 40;
        const minDistance = 70;
        const positions = [];
        
        function getDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
        
        function isValidPosition(x, y) {
            for (const pos of positions) {
                if (getDistance(x, y, pos.x, pos.y) < minDistance) {
                    return false;
                }
            }
            return true;
        }
        
        for (let i = 0; i < numPumpkins; i++) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 50;
            
            do {
                x = Math.random() * (window.innerWidth - pumpkinSize);
                y = Math.random() * (window.innerHeight - pumpkinSize);
                attempts++;
            } while (!isValidPosition(x, y) && attempts < maxAttempts);
            
            positions.push({ x, y });
            
            const pumpkin = document.createElement('img');
            pumpkin.src = './images/pumpkin.png';
            pumpkin.className = 'random-pumpkin';
            pumpkin.style.position = 'absolute';
            pumpkin.style.left = `${x}px`;
            pumpkin.style.top = `${y}px`;
            pumpkin.style.width = `${pumpkinSize}px`;
            pumpkin.style.opacity = '0.5';
            
            const duration = 3 + Math.random() * 2;
            const delay = Math.random() * 2;
            pumpkin.style.animation = `floatPumpkin ${duration}s ease-in-out ${delay}s infinite`;
            
            pumpkinContainer.appendChild(pumpkin);
        }
    }

    function addChristmasDecorations() {
        const decorContainer = document.createElement('div');
        decorContainer.id = 'christmas-decorations';
        decorContainer.style.position = 'absolute';
        decorContainer.style.width = '100%';
        decorContainer.style.height = '100%';
        decorContainer.style.pointerEvents = 'none';
        decorContainer.style.zIndex = '-1';
        document.body.appendChild(decorContainer);
    
        for (let i = 0; i < 100; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.style.left = `${Math.random() * 100}vw`;
            const size = Math.random() * 0.5 + 0.5;
            snowflake.style.fontSize = `${size}em`;
            const duration = Math.random() * 8 + 4;
            const delay = Math.random() * -20;
            
            snowflake.style.animationDuration = `${duration}s`;
            snowflake.style.animationDelay = `${delay}s`;
            snowflake.style.opacity = Math.random() * 0.7 + 0.3;
            
            snowflake.addEventListener('animationend', () => {
                snowflake.style.left = `${Math.random() * 100}vw`;
                snowflake.style.animationDelay = '0s';
            });
            
            decorContainer.appendChild(snowflake);
        }
    }

    function addNewYearDecorations() {
        const decorContainer = document.createElement('div');
        decorContainer.id = 'new-year-decorations';
        decorContainer.style.position = 'fixed';
        decorContainer.style.width = '100%';
        decorContainer.style.height = '100%';
        decorContainer.style.pointerEvents = 'none';
        decorContainer.style.zIndex = '-1';
        document.body.appendChild(decorContainer);
    
        function createFirework() {
            const colors = ['#ffd700', '#00ffff', '#ff3366', '#33ff66', '#ff66ff'];
            const x = Math.random() * window.innerWidth;
            // Set maximum height for fireworks to explode below the nav bar
            const maxHeight = window.innerHeight * 0.7; 
            const y = maxHeight - (Math.random() * (maxHeight * 0.4));
            const color = colors[Math.floor(Math.random() * colors.length)];
        
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = `${x}px`;
            firework.style.top = `${y}px`;
            firework.style.backgroundColor = color;
    
            const particles = 40;
            for (let i = 0; i < particles; i++) {
                const particle = document.createElement('div');
                particle.className = 'firework-particle';
                particle.style.backgroundColor = color;
                
                const angle = (i * 360) / particles;
                const velocity = 100 + Math.random() * 50;
                particle.style.setProperty('--tx', `${Math.cos(angle * Math.PI / 180) * velocity}px`);
                particle.style.setProperty('--ty', `${Math.sin(angle * Math.PI / 180) * velocity}px`);
                
                firework.appendChild(particle);
            }
    
            decorContainer.appendChild(firework);
            setTimeout(() => firework.remove(), 1500);
        }
    
        function createSparkle() {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}vw`;
            sparkle.style.animationDelay = `${Math.random() * 4}s`;
            decorContainer.appendChild(sparkle);
            
            sparkle.addEventListener('animationend', () => sparkle.remove());
        }
    
        setInterval(createFirework, 1000);
        setInterval(createSparkle, 200);
    
        // Add floating "2024" text
        const yearContainer = document.createElement('div');
        yearContainer.style.cssText = `
            position: fixed;
            right: 30px;
            bottom: 30px;
            text-align: right;
            pointer-events: none;
        `;
        
        const welcomeText = document.createElement('div');
        welcomeText.textContent = 'Welcome to';
        welcomeText.style.cssText = `
            font-size: 40px;
            font-weight: bold;
            color: #ffd700;
            margin-bottom: 10px;
            opacity: 0.8;
        `;
        
        const yearText = document.createElement('div');
        yearText.textContent = '2025';
        yearText.style.cssText = `
            font-size: 120px;
            font-weight: bold;
            color: transparent;
            background: linear-gradient(45deg, #ffd700, #00ffff);
            -webkit-background-clip: text;
            opacity: 0.3;
            animation: float 3s ease-in-out infinite;
        `;
        
        yearContainer.appendChild(welcomeText);
        yearContainer.appendChild(yearText);
        decorContainer.appendChild(yearContainer);
    }    

    function removeRandomPumpkins() {
        const pumpkinContainer = document.getElementById('halloween-pumpkins');
        if (pumpkinContainer) {
            pumpkinContainer.remove();
        }
    }

    function removeChristmasDecorations() {
        const decorContainer = document.getElementById('christmas-decorations');
        if (decorContainer) {
            decorContainer.remove();
        }
    }

    function removeNewYearDecorations() {
        const decorContainer = document.getElementById('new-year-decorations');
        if (decorContainer) {
            decorContainer.remove();
        }
    }

    window.setTheme = function(theme) {
        if (theme === 'default') {
            themeStylesheet.href = '';
        } else {
            themeStylesheet.href = `./css/themes/${theme}-theme.css`;
        }
        localStorage.setItem('selectedTheme', theme);
        
        // Handle theme messages
        const introContainer = document.querySelector('.intro-container');
        if (introContainer) {
            const existingMessage = document.getElementById('theme-message');
            
            if (existingMessage) {
                existingMessage.remove();
            }
            
            if (theme === 'new-year') {
                const newYearMessage = document.createElement('p');
                newYearMessage.id = 'theme-message';
                newYearMessage.style.cssText = `
                    text-align: center;
                    font-size: 1.2em;
                    margin-top: 20px;
                    color: var(--text-color);
                    animation: fadeIn 1s ease-in;
                    background: linear-gradient(45deg, #ffd700, #00ffff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 500;
                `;
                newYearMessage.textContent = "Welcome to 2025! The Neoneko Team wishes you an extraordinary year ahead! Please note that our development team will be taking a well-deserved break from December 18th until January 3rd. During this time, support responses may be delayed. Happy Holidays!";
                introContainer.insertBefore(newYearMessage, introContainer.querySelector('.feature-box'));
            } else if (theme === 'christmas') {
                const christmasMessage = document.createElement('p');
                christmasMessage.id = 'theme-message';
                christmasMessage.style.cssText = `
                    text-align: center;
                    font-size: 1.2em;
                    margin-top: 20px;
                    color: var(--text-color);
                    animation: fadeIn 1s ease-in;
                    background: linear-gradient(45deg, #ff1f1f, #00ff7f);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 500;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                    z-index: 1;
                `;
                christmasMessage.textContent = "The Neoneko Team wishes you a joyful Christmas season! Please note that our development team will be taking a well-deserved break from December 18th until January 3rd. During this time, support responses may be delayed. Happy Holidays!";
                introContainer.insertBefore(christmasMessage, introContainer.querySelector('.feature-box'));
            }
        }
        
        removeRandomPumpkins();
        removeChristmasDecorations();
        removeNewYearDecorations();
        
        if (theme === 'halloween') {
            addRandomPumpkins();
        } else if (theme === 'christmas') {
            addChristmasDecorations();
        } else if (theme === 'new-year') {
            addNewYearDecorations();
        }
        
        themeSelects.forEach(select => {
            const selectedOption = select.querySelector(`[data-theme="${theme}"]`);
            if (selectedOption) {
                selectedOption.selected = true;
            }
        });
    }    

    themeSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            setTheme(e.target.selectedOptions[0].getAttribute('data-theme'));
        });
    });

    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('main-site');
    }
});
