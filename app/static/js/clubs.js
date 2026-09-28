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

let hasRevealed = false;
let searchDebounce = null;
let viewMode = localStorage.getItem('clubsView') || 'list';
let currentClubs = [];

function renderClubCards(clubs) {
    let html = '';
    for (const c of clubs) {
        const name = c['Name of Club'];
        if (!name) continue;
        const type = c['Type of Club'];
        const desc = c['Description of Club'];
        const meeting = c['Club Meeting Time and Location'];
        html += '<div class="class-card">';
        html += '<div class="class-title">' + name + '</div>';
        html += '<div class="tags">';
        if (type) html += '<button type="button">' + type + '</button>';
        html += '</div>';
        if (meeting) {
            html += '<div class="card-meta"><div class="class-info"><strong>Meeting</strong><span>' + meeting + '</span></div></div>';
        }
        if (desc) {
            html += '<div class="card-description"><strong>Description:</strong> ' + desc + '</div>';
        }
        html += '</div>';
    }
    return '<div class="dir-grid">' + html + '</div>';
}

function renderClubList(clubs) {
    let html = '<div class="dir-list">';
    let idx = 0;
    for (const c of clubs) {
        const name = c['Name of Club'];
        if (!name) continue;
        const type = c['Type of Club'];
        const desc = c['Description of Club'];
        const meeting = c['Club Meeting Time and Location'];
        const rowId = 'club-row-' + idx++;
        html += '<div class="dir-list-item">';
        html += '<button class="dir-list-row" type="button" aria-expanded="false" aria-controls="' + rowId + '">';
        html += '<span class="dir-list-title">' + name + '</span>';
        html += '<span class="dir-list-meta">';
        if (type) html += '<span class="pill">' + type + '</span>';
        html += '</span>';
        html += '<span class="dir-list-arrow" aria-hidden="true">&rarr;</span>';
        html += '</button>';
        html += '<div class="dir-list-detail" id="' + rowId + '" hidden>';
        if (meeting) {
            html += '<div class="card-meta"><div class="class-info"><strong>Meeting</strong><span>' + meeting + '</span></div></div>';
        }
        if (desc) {
            html += '<div class="card-description"><strong>Description:</strong> ' + desc + '</div>';
        }
        html += '</div></div>';
    }
    return html + '</div>';
}

function wireListToggles(grid) {
    grid.querySelectorAll('.dir-list-row').forEach(row => {
        row.addEventListener('click', () => {
            const isOpen = row.getAttribute('aria-expanded') === 'true';
            row.setAttribute('aria-expanded', String(!isOpen));
            const detail = row.parentElement.querySelector('.dir-list-detail');
            if (detail) detail.hidden = isOpen;
        });
    });
}

function displayClubs(clubs) {
    currentClubs = clubs;
    const grid = document.getElementById('classesGrid');

    if (clubs.length === 0) {
        grid.innerHTML =
            '<div class="no-results"><h2>No clubs found</h2><p>Try adjusting your search terms</p></div>';
        return;
    }
    grid.innerHTML = viewMode === 'grid' ? renderClubCards(clubs) : renderClubList(clubs);
    wireListToggles(grid);
    if (!hasRevealed && viewMode === 'grid') {
        revealCards(grid.querySelectorAll('.class-card'));
        hasRevealed = true;
    }
}

function setViewMode(mode) {
    viewMode = mode;
    localStorage.setItem('clubsView', mode);
    document.getElementById('viewList').setAttribute('aria-pressed', String(mode === 'list'));
    document.getElementById('viewGrid').setAttribute('aria-pressed', String(mode === 'grid'));
    if (currentClubs.length) displayClubs(currentClubs);
}

function revealCards(cards) {
    if (!window.gsap || !cards.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(cards, { opacity: 0, y: 8, duration: 0.35, stagger: 0.025, ease: 'power2.out' });
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
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        const query = document.getElementById('searchBox').value.trim();
        if (query) {
            searchClubs(query);
        } else {
            sortAndDisplay();
        }
    }, 200);
}

function handleSort() {
    currentSort = document.getElementById('sortSelect').value;
    isDescending = document.getElementById('descendingCheck').checked;
    handleSearch();
}

async function bootstrap() {
    if (window.customElements) {
        await Promise.all([
            customElements.whenDefined('sl-input'),
            customElements.whenDefined('sl-select'),
            customElements.whenDefined('sl-checkbox'),
        ]);
    }
    document.getElementById('searchBox').addEventListener('sl-input', handleSearch);
    document.getElementById('sortSelect').addEventListener('sl-change', handleSort);
    document.getElementById('descendingCheck').addEventListener('sl-change', handleSort);
    document.getElementById('viewList').addEventListener('click', () => setViewMode('list'));
    document.getElementById('viewGrid').addEventListener('click', () => setViewMode('grid'));
    setViewMode(viewMode);
    loadClubs();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}