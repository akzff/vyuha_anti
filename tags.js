// Tag Manager JavaScript

// Tab switching
function initializeTagTabs() {
    const tabs = document.querySelectorAll('.tag-category-tab');
    const contents = document.querySelectorAll('.tag-category-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const category = this.getAttribute('data-category');

            // Remove active class from all tabs and hide all content
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');

            // Add active class to clicked tab and show corresponding content
            this.classList.add('active');
            document.querySelector(`[data-category="${category}"].tag-category-content`).style.display = 'block';
        });
    });
}

// Add tag functionality
function initializeTagAdd() {
    const addButtons = document.querySelectorAll('.tag-add-container .btn');

    addButtons.forEach(button => {
        button.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const tagText = input.value.trim();

            if (tagText) {
                const category = input.closest('.tag-category-content').getAttribute('data-category');
                addTagToList(tagText, category);
                input.value = '';
            }
        });
    });
}

function addTagToList(tagText, category) {
    const container = document.querySelector(`[data-category="${category}"].tag-category-content`);
    const addContainer = container.querySelector('.tag-add-container');

    const tagItem = document.createElement('div');
    tagItem.className = 'tag-item';
    tagItem.innerHTML = `
    <div class="tag-item-content">
      <span class="tag-badge entry-tag">${tagText}</span>
    </div>
    <div class="tag-item-actions">
      <button class="icon-btn" title="Edit">✏️</button>
      <button class="icon-btn delete-tag" title="Delete">🗑️</button>
    </div>
  `;

    container.insertBefore(tagItem, addContainer);

    // Add delete functionality to new tag
    tagItem.querySelector('.delete-tag').addEventListener('click', function () {
        if (confirm(`Delete tag "${tagText}"?`)) {
            tagItem.remove();
        }
    });
}

// Delete tag functionality
function initializeTagDelete() {
    const deleteButtons = document.querySelectorAll('.delete-tag');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tagItem = this.closest('.tag-item');
            const tagText = tagItem.querySelector('.tag-badge').textContent;

            if (confirm(`Delete tag "${tagText}"?`)) {
                tagItem.remove();
            }
        });
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    initializeTagTabs();
    initializeTagAdd();
    initializeTagDelete();
});
