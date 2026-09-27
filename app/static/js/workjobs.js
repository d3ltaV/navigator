let allWorkjobs = [];
let currentWorkjobs = [];
let viewMode = localStorage.getItem('workjobsView') || 'list';
let hasRevealed = false;
let searchDebounce = null;

function loadWorkjobs() {
    fetch('/api/search?s=workjobs')
        .then(response => response.json())
        .then(data => {
            allWorkjobs = data;
            currentWorkjobs = data;
            displayWorkjobs(currentWorkjobs);
            updateResultsInfo(currentWorkjobs.length, allWorkjobs.length);
        });
}

function searchWorkjobs(query) {
    fetch('/api/search?q=' + encodeURIComponent(query) + '&s=workjobs')
        .then(response => response.json())
        .then(results => {
            currentWorkjobs = results;
            displayWorkjobs(currentWorkjobs);
            updateResultsInfo(currentWorkjobs.length, allWorkjobs.length);
        });
}

function renderCards(workjobs) {
    let html = '';
    for (const job of workjobs) {
        html += '<div class="workjob-card">';
        html += '<div class="workjob-title">' + (job.name || 'Untitled Position') + '</div>';
        html += '<span class="workjob-location">' + (job.location || 'Location TBD') + '</span>';
        if (job.description) {
            html += '<div class="workjob-description"><strong>Description:</strong> ' + job.description + '</div>';
        }
        if (job.notes) {
            html += '<div class="workjob-info"><strong>Note:</strong> ' + job.notes + '</div>';
        }
        html += '</div>';
    }
    return '<div class="dir-grid">' + html + '</div>';
}

function renderList(workjobs) {
    let html = '<div class="dir-list">';
    for (let i = 0; i < workjobs.length; i++) {
        const job = workjobs[i];
        const rowId = 'wj-row-' + i;
        html += '<div class="dir-list-item">';
        html += '<button class="dir-list-row" type="button" aria-expanded="false" aria-controls="' + rowId + '">';
        html += '<span class="dir-list-title">' + (job.name || 'Untitled Position') + '</span>';
        html += '<span class="dir-list-meta">';
        if (job.location) html += '<span class="pill">' + job.location + '</span>';
        html += '</span>';
        html += '<svg class="dir-list-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        html += '</button>';
        html += '<div class="dir-list-detail" id="' + rowId + '" hidden>';
        if (job.description) {
            html += '<div class="workjob-description"><strong>Description:</strong> ' + job.description + '</div>';
        }
        if (job.notes) {
            html += '<div class="workjob-info" style="margin-top:8px"><strong>Note:</strong> ' + job.notes + '</div>';
        }
        html += '</div>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function displayWorkjobs(workjobs) {
    const grid = document.getElementById('workjobsGrid');
    if (workjobs.length === 0) {
        grid.innerHTML = '<div class="no-results"><h2>No workjobs found</h2><p>Try adjusting your search terms</p></div>';
        return;
    }
    grid.innerHTML = viewMode === 'grid' ? renderCards(workjobs) : renderList(workjobs);
    wireListToggles(grid);

    if (!hasRevealed && viewMode === 'grid') {
        revealCards(grid.querySelectorAll('.workjob-card'));
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
        info.textContent = 'Showing all workjobs!';
    } else {
        info.textContent = 'Showing ' + shown + ' of ' + total + ' workjob' + (total !== 1 ? 's' : '');
    }
}

function handleSearch() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        const query = document.getElementById('searchBox').value.trim();
        if (query) {
            searchWorkjobs(query);
        } else {
            currentWorkjobs = allWorkjobs;
            displayWorkjobs(currentWorkjobs);
            updateResultsInfo(currentWorkjobs.length, allWorkjobs.length);
        }
    }, 200);
}

function setViewMode(mode) {
    viewMode = mode;
    localStorage.setItem('workjobsView', mode);
    document.getElementById('viewList').setAttribute('aria-pressed', String(mode === 'list'));
    document.getElementById('viewGrid').setAttribute('aria-pressed', String(mode === 'grid'));
    if (currentWorkjobs.length) displayWorkjobs(currentWorkjobs);
}

async function bootstrap() {
    if (window.customElements) {
        await customElements.whenDefined('sl-input');
    }
    document.getElementById('searchBox').addEventListener('sl-input', handleSearch);
    document.getElementById('viewList').addEventListener('click', () => setViewMode('list'));
    document.getElementById('viewGrid').addEventListener('click', () => setViewMode('grid'));
    setViewMode(viewMode);
    loadWorkjobs();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
