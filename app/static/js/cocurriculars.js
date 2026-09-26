let allCocurriculars = [];

function loadCocurriculars() {
    fetch('/api/search?s=cocurriculars')
        .then(response => response.json())
        .then(data => {
            allCocurriculars = data;
            displayCocurriculars(allCocurriculars);
            updateResultsInfo(allCocurriculars.length, allCocurriculars.length);
        });
}

function searchCocurriculars(query) {
    fetch('/api/search?q=' + encodeURIComponent(query) + '&s=cocurriculars')
        .then(response => response.json())
        .then(results => {
            displayCocurriculars(results);
            updateResultsInfo(results.length, allCocurriculars.length);
        });
}

function displayCocurriculars(cocurriculars) {
    const grid = document.getElementById('cocurricularsGrid');

    if (cocurriculars.length === 0) {
        grid.innerHTML = '<div class="no-results"><h2>No cocurriculars found</h2><p>Try adjusting your search terms</p></div>';
        return;
    }

    let html = '';
    for (let i = 0; i < cocurriculars.length; i++) {
        const cocurricular = cocurriculars[i];
        html += '<div class="cocurricular-card">';
        html += '<div class="cocurricular-title">' + (cocurricular.name || 'Untitled Position') + '</div>';
        html += '<div class="card-divider"></div>';
        html += '<div class="card-meta">';
        html += '<div class="cocurricular-info"><strong>Category</strong><span>' + (cocurricular.category || '—') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Season</strong><span>' + (cocurricular.season || '—') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Prereq</strong><span>' + (cocurricular.prerequisites || 'None') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Location</strong><span>' + (cocurricular.location || 'TBD') + '</span></div>';
        html += '<div class="cocurricular-info"><strong>Schedule</strong><span>' + (cocurricular.schedule || 'TBD') + '</span></div>';
        html += '</div>';
        html += '</div>';
    }
    grid.innerHTML = html;
    revealCards(grid.querySelectorAll('.cocurricular-card'));
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
    const query = document.getElementById('searchBox').value.trim();
    if (query) {
        searchCocurriculars(query);
    } else {
        displayCocurriculars(allCocurriculars);
        updateResultsInfo(allCocurriculars.length, allCocurriculars.length);
    }
}

async function bootstrap() {
    if (window.customElements) {
        await customElements.whenDefined('sl-input');
    }
    document.getElementById('searchBox').addEventListener('sl-input', handleSearch);
    loadCocurriculars();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}