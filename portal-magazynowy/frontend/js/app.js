// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplikacja została załadowana');
    
    // Obsługa nawigacji
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Usuń klasę active ze wszystkich linków
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Dodaj klasę active do klikniętego linku
            this.classList.add('active');
            
            const contentTitle = document.getElementById('content-title');
            const addWindowBtn = document.getElementById('add-window-btn');
            const defaultContent = document.getElementById('default-content');
            const windowsContainer = document.getElementById('windows-container');
            
            contentTitle.textContent = this.textContent.trim();
            defaultContent.style.display = 'none';
            windowsContainer.innerHTML = '';
            
            if (this.textContent.includes('Okna załadunkowe')) {
                addWindowBtn.style.display = 'block';
                addWindowBtn.onclick = addNewWindow;
                windowsContainer.style.display = 'block';
                windowManager.renderWindowsList();
            } else {
                addWindowBtn.style.display = 'none';
                windowsContainer.style.display = 'none';
                defaultContent.style.display = 'block';
                defaultContent.innerHTML = `<p>${this.textContent.trim()} - ta funkcjonalność jest w trakcie rozwoju.</p>`;
            }
        });
    });
    
    // Inicjalizacja tooltipów Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Funkcje zarządzania oknami załadunkowymi
const LoadingWindows = {
    init: function() {
        console.log('Moduł okien załadunkowych zainicjalizowany');
    },
    
    addWindow: function(data) {
        console.log('Dodawanie nowego okna załadunkowego', data);
    },
    
    removeWindow: function(id) {
        console.log('Usuwanie okna załadunkowego o ID:', id);
    }
};

// Inicjalizacja modułu
LoadingWindows.init();