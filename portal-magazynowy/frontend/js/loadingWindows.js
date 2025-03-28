class LoadingWindowManager {
    constructor() {
        this.windows = [];
        this.availableHours = [
            '06:00', '07:00', '08:00', '09:00', 
            '10:30', '11:00', '12:00', '13:00', 
            '14:00', '15:00', '16:00', '17:00',
            '18:30', '19:00', '20:00', '21:00'
        ];
        this.capacity = {
            fullTruck: 2,
            smallTruck: 1,
            fullTruckPallets: 33,
            smallTruckPallets: 15
        };
        this.init();
    }

    init() {
        console.log('Manager okien załadunkowych zainicjalizowany');
        this.loadFromLocalStorage();
        this.renderWindowsList();
    }

    addWindow(windowData) {
        if (!this.availableHours.includes(windowData.startTime)) {
            alert('Ta godzina nie jest dostępna w harmonogramie magazynu');
            return null;
        }

        const newWindow = {
            id: Date.now(),
            ...windowData,
            status: 'available',
            capacity: {
                fullTruck: this.capacity.fullTruck,
                smallTruck: this.capacity.smallTruck,
                remainingFull: this.capacity.fullTruck,
                remainingSmall: this.capacity.smallTruck
            }
        };
        this.windows.push(newWindow);
        this.saveToLocalStorage();
        this.renderWindowsList();
        return newWindow;
    }

    updateWindow(id, updatedData) {
        const index = this.windows.findIndex(w => w.id === id);
        if (index !== -1) {
            this.windows[index] = { ...this.windows[index], ...updatedData };
            this.saveToLocalStorage();
            this.renderWindowsList();
            return true;
        }
        return false;
    }

    removeWindow(id) {
        this.windows = this.windows.filter(w => w.id !== id);
        this.saveToLocalStorage();
        this.renderWindowsList();
    }

    loadFromLocalStorage() {
        const savedWindows = localStorage.getItem('loadingWindows');
        if (savedWindows) {
            this.windows = JSON.parse(savedWindows);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('loadingWindows', JSON.stringify(this.windows));
    }

    showReservationForm(hour) {
        const modalHtml = `
            <div class="modal fade" id="reservationModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Rezerwacja na godzinę ${hour}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="reservationForm">
                                <div class="mb-3">
                                    <label class="form-label">Liczba pełnych aut (33 palety)</label>
                                    <input type="number" class="form-control" id="fullTrucks" min="0" max="2" value="0">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Liczba małych aut (15 palet)</label>
                                    <input type="number" class="form-control" id="smallTrucks" min="0" max="1" value="0">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
                            <button type="button" class="btn btn-primary" id="confirmReservation">Potwierdź</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
        modal.show();

        document.getElementById('confirmReservation').addEventListener('click', () => {
            const fullTrucks = parseInt(document.getElementById('fullTrucks').value);
            const smallTrucks = parseInt(document.getElementById('smallTrucks').value);
            
            if (fullTrucks > 0 || smallTrucks > 0) {
                this.addWindow({
                    startTime: hour,
                    endTime: this.getEndTime(hour),
                    fullTrucks,
                    smallTrucks
                });
                modal.hide();
            } else {
                alert('Proszę wybrać przynajmniej jedno auto!');
            }
        });

        modal._element.addEventListener('hidden.bs.modal', () => {
            modal._element.remove();
        });
    }

    getEndTime(startTime) {
        // Konwersja czasu na minutę dnia
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + 60; // Dodajemy 60 minut (1 godzina)
        
        // Konwersja z powrotem na format HH:MM
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    renderWindowsList() {
        const container = document.getElementById('windows-container');
        if (!container) return;

        // Sprawdź które godziny są już zarezerwowane
        const reservedHours = this.windows.map(w => w.startTime);
        
        container.innerHTML = `
            <div class="mb-4">
                <h4 class="text-center mb-4">Dostępne okna załadunkowe</h4>
                <div class="row g-3">
                    ${this.availableHours.map(hour => {
                        const isReserved = reservedHours.includes(hour);
                        return `
                        <div class="col-md-3">
                            <div class="card ${isReserved ? 'border-danger' : 'border-success'} h-100">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title text-center">${hour}</h5>
                                    <div class="card-text mb-3">
                                        <div class="d-flex justify-content-between">
                                            <span>Pełne auta:</span>
                                            <strong>${this.capacity.fullTruck} × 33 palety</strong>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Małe auta:</span>
                                            <strong>${this.capacity.smallTruck} × 15 palet</strong>
                                        </div>
                                    </div>
                                    <button class="btn btn-sm mt-auto ${isReserved ? 'btn-outline-secondary disabled' : 'btn-primary'}" 
                                            data-hour="${hour}"
                                            ${isReserved ? 'disabled' : ''}>
                                        ${isReserved ? 'Zarezerwowane' : 'Dodaj rezerwację'}
                                    </button>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            <div class="mb-4">
                <h4>Aktywne rezerwacje</h4>
                ${this.windows.map(window => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Rezerwacja #${window.id}</h5>
                            <p class="card-text">
                                <strong>Godzina:</strong> ${window.startTime}<br>
                                <strong>Pozostała pojemność:</strong><br>
                                - ${window.capacity.remainingFull} z ${window.capacity.fullTruck} pełnych aut (33 palety)<br>
                                - ${window.capacity.remainingSmall} z ${window.capacity.smallTruck} małych aut (15 palet)
                            </p>
                            <button class="btn btn-sm btn-outline-primary edit-window" data-id="${window.id}">Edytuj</button>
                            <button class="btn btn-sm btn-outline-danger delete-window" data-id="${window.id}">Usuń</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Dodaj obsługę przycisków dodawania rezerwacji
        document.querySelectorAll('.add-specific-hour').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showReservationForm(e.target.dataset.hour);
            });
        });

        // Dodanie event listenerów do przycisków
        document.querySelectorAll('.edit-window').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditWindow(e.target.dataset.id));
        });

        document.querySelectorAll('.delete-window').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeleteWindow(e.target.dataset.id));
        });
    }

    getStatusBadgeClass(status) {
        const statusClasses = {
            'available': 'bg-success',
            'reserved': 'bg-warning text-dark',
            'completed': 'bg-secondary',
            'cancelled': 'bg-danger'
        };
        return statusClasses[status] || 'bg-info';
    }

    handleEditWindow(id) {
        const windowToEdit = this.windows.find(w => w.id === id);
        if (windowToEdit) {
            // Tutaj można dodać logikę otwierania formularza edycji
            console.log('Edytowanie okna:', windowToEdit);
            alert(`Edytowanie okna ID: ${id}`);
        }
    }

    handleDeleteWindow(id) {
        if (confirm('Czy na pewno chcesz usunąć to okno załadunkowe?')) {
            this.removeWindow(id);
        }
    }
}

// Inicjalizacja managera
const windowManager = new LoadingWindowManager();

// Funkcje dostępne globalnie
function addNewWindow() {
    // Utwórz modal do wprowadzania danych
    const modalHtml = `
        <div class="modal fade" id="windowModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Dodaj nowe okno załadunkowe</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="windowForm">
                            <div class="mb-3">
                                <label class="form-label">Godzina rozpoczęcia</label>
                                <input type="time" class="form-control" id="startTime" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Godzina zakończenia</label>
                                <input type="time" class="form-control" id="endTime" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
                        <button type="button" class="btn btn-primary" id="saveWindow">Zapisz</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Dodaj modal do DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Inicjalizacja modala
    const modal = new bootstrap.Modal(document.getElementById('windowModal'));
    modal.show();

    // Obsługa zapisywania
    document.getElementById('saveWindow').addEventListener('click', () => {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;

        if (!startTime || !endTime) {
            alert('Proszę wypełnić wszystkie pola!');
            return;
        }

        if (startTime >= endTime) {
            alert('Godzina zakończenia musi być późniejsza niż rozpoczęcia!');
            return;
        }

        windowManager.addWindow({
            startTime,
            endTime
        });

        // Usuń modal po zapisaniu
        modal.hide();
        document.getElementById('windowModal').remove();
    });

    // Usuń modal przy zamknięciu
    document.getElementById('windowModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('windowModal').remove();
    });
}
