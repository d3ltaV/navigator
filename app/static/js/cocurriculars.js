let allCocurriculars = [];
let currentCocurriculars = [];
let viewMode = localStorage.getItem('cocurricularsView') || 'list';
let hasRevealed = false;
let searchDebounce = null;

function loadCocurriculars() {
    fetch('/api/search?s=cocurriculars')
        .then(r => r.json())
        .then(data => {
            allCocurriculars = data;
            currentCocurriculars = data;
            displayCocurriculars(currentCocurriculars);
            updateResultsInfo(currentCocurriculars.length, allCocurriculars.length);
        });
}

function searchCocurriculars(query) {
    fetch('/api/search?q=' + encodeURIComponent(query) + '&s=cocurriculars')
        .then(r => r.json())
        .then(results => {
            currentCocurriculars = results;
            displayCocurriculars(currentCocurriculars);
            updateResultsInfo(currentCocurriculars.length, allCocurriculars.length);
        });
}

function renderCards(items) {
    let html = '';
    for (const c of items) {
        html += '<div class="cocurricular-card">';
        html += '<div class="cocurricular-title">' + (c.name || 'Untitled Position') + '</div>';
        html += '<div class="card-divider"></div>';
        html += '<div class="card-meta">';
        html += '<div class="cocurricular-info"><strong>Category</strong><span>' + (c.category || '—') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Season</strong><span>' + (c.season || '—') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Prereq</strong><span>' + (c.prerequisites || 'None') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Location</strong><span>' + (c.location || 'TBD') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Schedule</strong><span>' + (c.schedule || 'TBD') + '</span></div>';
        html += '</div></div>';
    }
    return '<div class="dir-grid">' + html + '</div>';
}

function renderList(items) {
    let html = '<div class="dir-list">';
    for (let i = 0; i < items.length; i++) {
        const c = items[i];
        const rowId = 'co-row-' + i;
        html += '<div class="dir-list-item">';
        html += '<button class="dir-list-row" type="button" aria-expanded="false" aria-controls="' + rowId + '">';
        html += '<span class="dir-list-title">' + (c.name || 'Untitled Position') + '</span>';
        html += '<span class="dir-list-meta">';
        if (c.category) html += '<span class="pill">' + c.category + '</span>';
        html += '</span>';
        html += '<span class="dir-list-arrow" aria-hidden="true">&rarr;</span>';
        html += '</button>';
        html += '<div class="dir-list-detail" id="' + rowId + '" hidden>';
        html += '<div class="card-meta">';
        html += '<div class="cocurricular-info"><strong>Category</strong><span>' + (c.category || '—') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Season</strong><span>' + (c.season || '—') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Prereq</strong><span>' + (c.prerequisites || 'None') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Location</strong><span>' + (c.location || 'TBD') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Schedule</strong><span>' + (c.schedule || 'TBD') + '</span></div>';
        html += '</div>';
        html += '</div></div>';
    }
    return html + '</div>';
}

function displayCocurriculars(items) {
    const grid = document.getElementById('cocurricularsGrid');
    if (items.length === 0) {
        grid.innerHTML = '<div class="no-results"><h2>No cocurriculars found</h2><p>Try adjusting your search terms</p></div>';
        return;
    }
    grid.innerHTML = viewMode === 'grid' ? renderCards(items) : renderList(items);
    wireListToggles(grid);
    if (!hasRevealed && viewMode === 'grid') {
        revealCards(grid.querySelectorAll('.cocurricular-card'));
        hasRevealed = true;
    }
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

function revealCards(cards) {
    if (!window.gsap || !cards.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(cards, { opacity: 0, y: 8, duration: 0.35, stagger: 0.025, ease: 'power2.out' });
}

function updateResultsInfo(shown, total) {
    const info = document.getElementById('resultsInfo');
    if (shown === total) {
        info.textContent = 'Showing all cocurriculars!';
    } else {
        info.textContent = 'Showing ' + shown + ' of ' + total + ' cocurricular' + (total !== 1 ? 's' : '');
    }
}

function handleSearch() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        const query = document.getElementById('searchBox').value.trim();
        if (query) {
            searchCocurriculars(query);
        } else {
            currentCocurriculars = allCocurriculars;
            displayCocurriculars(currentCocurriculars);
            updateResultsInfo(currentCocurriculars.length, allCocurriculars.length);
        }
    }, 200);
}

function setViewMode(mode) {
    viewMode = mode;
    localStorage.setItem('cocurricularsView', mode);
    document.getElementById('viewList').setAttribute('aria-pressed', String(mode === 'list'));
    document.getElementById('viewGrid').setAttribute('aria-pressed', String(mode === 'grid'));
    if (currentCocurriculars.length) displayCocurriculars(currentCocurriculars);
}

async function bootstrap() {
    if (window.customElements) {
        await customElements.whenDefined('sl-input');
    }
    document.getElementById('searchBox').addEventListener('sl-input', handleSearch);
    document.getElementById('viewList').addEventListener('click', () => setViewMode('list'));
    document.getElementById('viewGrid').addEventListener('click', () => setViewMode('grid'));
    setViewMode(viewMode);
    loadCocurriculars();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
