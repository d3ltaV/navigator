let allClubs = [];
let currentSort = 'name';
let isDescending = false;

function loadClubs() {
    fetch('/api/search?s=clubs')
        .then(response => response.json())
        .then(data => {
            allClubs = data;
            sortAndDisplay();
            updateResultsInfo(allClubs.length, allClubs.length);
        });
}

function searchClubs(query) {
    fetch('/api/search?q=' + encodeURIComponent(query) + '&s=clubs')
        .then(response => response.json())
        .then(results => {
            displayClubs(sortClubs(results));
            updateResultsInfo(results.length, allClubs.length);
        });
}

function sortClubs(clubs) {
    const sorted = [...clubs];

    switch (currentSort) {
        case 'name':
            sorted.sort((a, b) =>
                (a['Name of Club'] || '').localeCompare(b['Name of Club'] || '')
            );
            break;
        case 'type':
            sorted.sort((a, b) =>
                (a['Type of Club'] || '').localeCompare(b['Type of Club'] || '')
            );
            break;
    }

    if (isDescending) {
        sorted.reverse();
    }

    return sorted;
}

function sortAndDisplay() {
    const sorted = sortClubs(allClubs);
    displayClubs(sorted);
    updateResultsInfo(allClubs.length, allClubs.length);
}

function displayClubs(clubs) {
    const grid = document.getElementById('classesGrid');

    if (clubs.length === 0) {
        grid.innerHTML =
            '<div class="no-results"><h2>No clubs found</h2><p>Try adjusting your search terms</p></div>';
        return;
    }

    let html = '';
    for (let i = 0; i < clubs.length; i++) {
        const c = clubs[i];
        const name = c['Name of Club'];
        const type = c['Type of Club'];
        const desc = c['Description of Club'];
        const meeting = c['Club Meeting Time and Location'];

        if (!name) continue;

        html += '<div class="class-card">';
        html += '<div class="class-title">' + (name || 'Untitled Club') + '</div>';

        html += '<div class="tags">';
        if (type) {
            html += '<button type="button">' + type + '</button>';
        }
        html += '</div>';

        if (meeting) {
            html += '<div class="class-info"><strong>Meeting: </strong>' + meeting + '</div>';
        }

        if (desc) {
            html += '<div class="class-info"><strong>Description: </strong>' + desc + '</div>';
        }

        html += '</div>';
    }

    grid.innerHTML = html;
}

function updateResultsInfo(shown, total) {
    const info = document.getElementById('resultsInfo');
    if (shown === total) {
        info.textContent = 'Showing all clubs!';
    } else {
        info.textContent = 'Showing ' + shown + ' of ' + total + ' club' + (total !== 1 ? 's' : '');
    }
}

function handleSearch() {
    const query = document.getElementById('searchBox').value.trim();
    if (query) {
        searchClubs(query);
    } else {
        sortAndDisplay();
    }
}

function handleSort() {
    currentSort = document.getElementById('sortSelect').value;
    isDescending = document.getElementById('descendingCheck').checked;
    handleSearch();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchBox').addEventListener('input', handleSearch);
    document.getElementById('sortSelect').addEventListener('change', handleSort);
    document.getElementById('descendingCheck').addEventListener('change', handleSort);
    loadClubs();
});