// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    UI.init();

    // Initialize features
    Tasks.init();
    Pomodoro.init();
    Focus.init();

    // Apply saved theme
    const savedTheme = Storage.load(Storage.keys.THEME);
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme ? 'dark' : 'light');
    }

    // Initialize data management
    document.getElementById('data-management-btn').addEventListener('click', () => {
        UI.showModal('data-modal');
    });

    document.getElementById('export-data-btn').addEventListener('click', () => {
        const data = Storage.export();
        document.getElementById('data-textarea').value = JSON.stringify(data, null, 2);
    });

    document.getElementById('import-data-btn').addEventListener('click', () => {
        const textarea = document.getElementById('data-textarea');
        try {
            const data = JSON.parse(textarea.value);
            if (Storage.import(data)) {
                UI.showToast('Data imported successfully!', 'success');
                window.location.reload();
            } else {
                UI.showToast('Error importing data', 'error');
            }
        } catch (error) {
            UI.showToast('Invalid data format', 'error');
        }
    });
});