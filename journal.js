// Journal JavaScript

// Tab switching
function initializeJournalTabs() {
    const tabs = document.querySelectorAll('.tab-btn[data-frequency]');
    const contents = document.querySelectorAll('.journal-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const frequency = this.getAttribute('data-frequency');

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and show corresponding content
            this.classList.add('active');
            document.querySelector(`.journal-content[data-frequency="${frequency}"]`).classList.add('active');
        });
    });
}

// Save entry functionality
function initializeSaveEntry() {
    const saveButtons = document.querySelectorAll('.journal-content .btn-primary');

    saveButtons.forEach(button => {
        button.addEventListener('click', function () {
            const content = this.closest('.journal-content');
            const frequency = content.getAttribute('data-frequency');
            const textareas = content.querySelectorAll('.journal-textarea');

            let hasContent = false;
            textareas.forEach(textarea => {
                if (textarea.value.trim()) {
                    hasContent = true;
                }
            });

            if (hasContent) {
                alert(`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} journal entry saved!`);
                // Here you would normally save to a database or local storage
            } else {
                alert('Please write something before saving.');
            }
        });
    });
}

// Auto-save on change (optional)
function initializeAutoSave() {
    const textareas = document.querySelectorAll('.journal-textarea');

    textareas.forEach(textarea => {
        let timeout;
        textarea.addEventListener('input', function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Auto-save logic here
                console.log('Auto-saving...');
            }, 2000);
        });
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    initializeJournalTabs();
    initializeSaveEntry();
    initializeAutoSave();
});
