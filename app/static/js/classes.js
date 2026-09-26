let allClasses = [];
let currentSort = 'name';
let isDescending = false;
let currentSubjectFilter = '';
let currentDepartmentFilter = '';

function loadClasses() {
    fetch('/api/search?s=classes')
        .then(response => response.json())
        .then(data => {
            allClasses = data;
            populateSubjectFilter();
            populateDepartmentFilter();
            sortAndDisplay();
            updateResultsInfo(allClasses.length, allClasses.length);
        });
}

function extractSubject(code) {
    if (!code) return '';
    const match = code.match(/^[A-Z_]+/);
    return match ? match[0] : '';
}

function populateSubjectFilter() {
    const subjects = new Set();
    allClasses.forEach(c => {
        const subject = extractSubject(c.code);
        if (subject) subjects.add(subject);
    });
    const filterSelect = document.getElementById('subjectFilter');
    Array.from(subjects).sort().forEach(subject => {
        const option = document.createElement('sl-option');
        option.value = subject;
        option.textContent = subject;
        filterSelect.appendChild(option);
    });
}

function populateDepartmentFilter() {
    const departments = new Set();
    allClasses.forEach(c => {
        if (c.dpt) departments.add(c.dpt);
    });
    const filterSelect = document.getElementById('departmentFilter');
    Array.from(departments).sort().forEach(dpt => {
        const option = document.createElement('sl-option');
        option.value = dpt;
        option.textContent = dpt;
        filterSelect.appendChild(option);
    });
}

function searchClasses(query) {
    fetch('/api/search?q=' + encodeURIComponent(query) + '&s=classes')
        .then(response => response.json())
        .then(results => {
            const filtered = filterByDepartment(filterBySubject(results));
            displayClasses(sortClasses(filtered));
            updateResultsInfo(filtered.length, allClasses.length);
        });
}

function filterBySubject(classes) {
    if (!currentSubjectFilter) return classes;
    return classes.filter(c => extractSubject(c.code) === currentSubjectFilter);
}

function filterByDepartment(classes) {
    if (!currentDepartmentFilter) return classes;
    return classes.filter(c => c.dpt === currentDepartmentFilter);
}

function sortClasses(classes) {
    const sorted = [...classes];
    switch (currentSort) {
        case 'name':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'code':
            sorted.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
            break;
        case 'credit':
            sorted.sort((a, b) => (parseFloat(a.credit) || 0) - (parseFloat(b.credit) || 0));
            break;
        case 'ncaa':
            sorted.sort((a, b) => (b.ncaa ? 1 : 0) - (a.ncaa ? 1 : 0));
            break;
    }
    if (isDescending) sorted.reverse();
    return sorted;
}

function sortAndDisplay() {
    const filtered = filterByDepartment(filterBySubject(allClasses));
    displayClasses(sortClasses(filtered));
    updateResultsInfo(filtered.length, allClasses.length);
}

function displayClasses(classes) {
    const grid = document.getElementById('classesGrid');
    if (classes.length === 0) {
        grid.innerHTML = '<div class="no-results"><h2>No classes found</h2><p>Try adjusting your search terms or filters</p></div>';
        return;
    }

    let html = '';
    for (let i = 0; i < classes.length; i++) {
        const c = classes[i];
        if (!c.name) continue;

        html += '<div class="class-card">';
        html += '<div class="class-title">' + c.name + '</div>';

        html += '<div class="tags">';
        if (c.nine)   html += '<button type="button">9th</button>';
        if (c.ten)    html += '<button type="button">10th</button>';
        if (c.eleven) html += '<button type="button">11th</button>';
        if (c.twelve) html += '<button type="button">12th</button>';
        if (c.pg)     html += '<button type="button">PG</button>';
        if (c.ncaa)   html += '<button type="button" class="n">NCAA</button>';
        html += '</div>';

        html += '<div class="card-meta">';
        html += '<div class="class-info"><strong>Code</strong><span>' + (c.code || 'Unknown') + '</span></div>';
        html += '<div class="class-info"><strong>Credit</strong><span>' + (c.credit || 'Unknown') + '</span></div>';
        html += '<div class="class-info"><strong>Department</strong><span>' + (c.dpt || 'Unknown') + '</span></div>';
        html += '<div class="class-info"><strong>Prereq</strong><span>' + (c.prereq || 'None') + '</span></div>';
        html += '</div>';

        if (c.desc) {
            html += '<div class="card-description"><strong>Description:</strong> ' + c.desc + '</div>';
        }

        html += '</div>';
    }

    grid.innerHTML = html;
    revealCards(grid.querySelectorAll('.class-card'));
}

function revealCards(cards) {
    if (!window.gsap || !cards.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from(cards, { opacity: 0, y: 8, duration: 0.35, stagger: 0.025, ease: 'power2.out' });
}

function updateResultsInfo(shown, total) {
    const info = document.getElementById('resultsInfo');
    if (shown === total) {
        info.textContent = 'Showing all classes!';
    } else {
        info.textContent = 'Showing ' + shown + ' of ' + total + ' class' + (total !== 1 ? 'es' : '');
    }
}

function handleSearch() {
    const query = document.getElementById('searchBox').value.trim();
    if (query) {
        searchClasses(query);
    } else {
        sortAndDisplay();
    }
}

function handleSubjectFilter() {
    currentSubjectFilter = document.getElementById('subjectFilter').value;
    handleSearch();
}

function handleDepartmentFilter() {
    currentDepartmentFilter = document.getElementById('departmentFilter').value;
    handleSearch();
}

function handleSort() {
    currentSort = document.getElementById('sortSelect').value;
    isDescending = document.getElementById('descendingCheck').checked;
    handleSearch();
}

// Shoelace's custom elements upgrade asynchronously via the autoloader. Wait
// until they're all defined before wiring events + kicking off the first fetch.
async function bootstrap() {
    if (window.customElements) {
        await Promise.all([
            customElements.whenDefined('sl-input'),
            customElements.whenDefined('sl-select'),
            customElements.whenDefined('sl-checkbox'),
        ]);
    }

    document.getElementById('searchBox').addEventListener('sl-input', handleSearch);
    document.getElementById('subjectFilter').addEventListener('sl-change', handleSubjectFilter);
    document.getElementById('departmentFilter').addEventListener('sl-change', handleDepartmentFilter);
    document.getElementById('sortSelect').addEventListener('sl-change', handleSort);
    document.getElementById('descendingCheck').addEventListener('sl-change', handleSort);

    loadClasses();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
