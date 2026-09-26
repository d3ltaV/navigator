let allWorkjobs = [];

function loadWorkjobs() {
    fetch('/api/search?s=workjobs')
        .then(response => response.json())
        .then(data => {
            allWorkjobs = data;
            displayWorkjobs(allWorkjobs);
            updateResultsInfo(allWorkjobs.length, allWorkjobs.length);
        });
}

function searchWorkjobs(query) {
    fetch('/api/search?q=' + encodeURIComponent(query) + '&s=workjobs')
        .then(response => response.json())
        .then(results => {
            displayWorkjobs(results);
            updateResultsInfo(results.length, allWorkjobs.length);
        });
}

function displayWorkjobs(workjobs) {
    const grid = document.getElementById('workjobsGrid');

    if (workjobs.length === 0) {
        grid.innerHTML = '<div class="no-results"><h2>No workjobs found</h2><p>Try adjusting your search terms</p></div>';
        return;
    }

    let html = '';
    for (let i = 0; i < workjobs.length; i++) {
        const job = workjobs[i];
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
    grid.innerHTML = html;
    revealCards(grid.querySelectorAll('.workjob-card'));
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
    const query = document.getElementById('searchBox').value.trim();
    if (query) {
        searchWorkjobs(query);
    } else {
        displayWorkjobs(allWorkjobs);
        updateResultsInfo(allWorkjobs.length, allWorkjobs.length);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchBox').addEventListener('input', handleSearch);
    loadWorkjobs();
});