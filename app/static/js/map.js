const mapElement = document.querySelector('gmp-map');

async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    const bounds = {
        north: 42.7200,
        south: 42.6200,
        west: -72.5450,
        east: -72.4300
    };

    const locations = [
        { title: "Gilder", position: { lat: 42.667144, lng: -72.481665 } },
        { title: "Dorms", position: { lat: 42.6676204, lng: -72.4838411 } },
        { title: "Admissions (Bolger)", position: { lat: 42.66644601940982 , lng:-72.48515196277874 } },
        { title: "Alumni Hall", position: { lat:42.66748046088102 , lng:-72.48557843400381 } },
        { title: "Schauffler Library", position: { lat: 42.66899511246868, lng:-72.48312287168545 } },
        { title: "Gym", position: { lat:42.66622766388029 , lng:-72.48156656247123 } },
        { title: "RAC", position: { lat: 42.66798729516262, lng: -72.4816328964554 } },
        { title: "O'Connor Health Center", position: { lat: 42.66725816449024, lng: -72.4867499314032} },
        { title: "Communications office", position: { lat: 42.67012671214381, lng: -72.48195950620217} },
        { title: "Early Childhood Center", position: { lat:42.66832414764135, lng:-72.47894604438869 } },
        { title: "Farm", position: { lat:42.670343686705166, lng:-72.48129390883983 } },
        { title: "Plant Facilities", position: { lat: 42.66961202001847, lng: -72.48068772960862 } },
        { title: "BEV", position: { lat:42.66896317632714 , lng: -72.48240568446545} },
        { title: "Forest", position: {lat: 42.67102844380024, lng: -72.48804669028948} },
        { title: "Blake", position: {lat: 42.66851986413596, lng: -72.4847851241787} },
    ];

    await mapElement.innerMap;
    mapElement.innerMap.setOptions({
        restriction: {
            latLngBounds: bounds,
            strictBounds: true
        }
    });

    locations.forEach(({ title, position }, i) => {
        const el = document.createElement("div");
        el.className = "rect-pin";
        el.textContent = title;

        const marker = new AdvancedMarkerElement({
            map: mapElement.innerMap,
            position,
            title,
            content: el
        });

        marker.addListener("click", () => {
            fetch(`/api/workjobs/${encodeURIComponent(title)}`)
                .then(r => r.json())
                .then(data => {
                    const popup = document.getElementById("popup");
                    const popupContent = document.getElementById("popup-content");

                    let html = `<h3>${title}</h3>`;

                    if (!data.error && data.length) {
                        html += `<p class="popup__section-label">Workjobs at this location</p>`;
                        html += `<div class="popup__list">`;
                        data.forEach(job => {
                            const sJob = encodeURIComponent(JSON.stringify(job));
                            const sData = encodeURIComponent(JSON.stringify(data));
                            const name = job.name ?? "Unnamed Workjob";
                            html += `<a href="#" class="workjob-link" data-job="${sJob}" data-all="${sData}">${name}</a>`;
                        });
                        html += `</div>`;
                    } else {
                        html += `<p class="popup__empty">No workjobs found at this location.</p>`;
                    }

                    popupContent.innerHTML = html;
                    popup.classList.add("is-open");
                    if (window.gsap) {
                        gsap.fromTo(popup,
                            { opacity: 0, y: 8 },
                            { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', clearProps: 'transform' }
                        );
                    }

                    document.querySelectorAll('.workjob-link').forEach(link => {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            const target = e.target.closest('.workjob-link');
                            const dwj = decodeURIComponent(target.dataset.job);
                            const aj = decodeURIComponent(target.dataset.all);
                            const workjob = JSON.parse(dwj);
                            const allJobs = JSON.parse(aj);
                            showWorkJobDetail(workjob, allJobs);
                        });
                    });
                })
                .catch(err => console.error(err));
        });
    });

    document.getElementById("popup-close").addEventListener("click", () => {
        document.getElementById("popup").classList.remove("is-open");
    });

    document.getElementById("workjob-detail-close").addEventListener("click", () => {
        document.getElementById("workjob-detail").classList.remove("is-open");
    });

    // Pins drop in from a few pixels above with a tight stagger, once the map has
    // placed their content. Runs on next tick so the DOM has all .rect-pin nodes.
    if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        requestAnimationFrame(() => {
            gsap.from('.rect-pin', {
                opacity: 0, y: -8, duration: 0.45,
                ease: 'power2.out', stagger: 0.025, delay: 0.1
            });
        });
    }
}

function showWorkJobDetail(workjob, allJobs) {
    const detail = document.getElementById("workjob-detail");
    const detailContent = document.getElementById("workjob-detail-content");

    let html = '';

    if (allJobs && allJobs.length > 1) {
        html += '<div class="workjob-tabs">';
        allJobs.forEach((j, idx) => {
            const active = j.name === workjob.name ? 'active' : '';
            html += `<button class="workjob-tab ${active}" data-index="${idx}">${j.name}</button>`;
        });
        html += '</div>';
    }

    html += `<h3 class="workjob-title">${workjob.name ?? 'Untitled Workjob'}</h3>`;
    html += `<div class="popup__meta">`;
    if (workjob.location)            html += `<div class="workjob-info"><strong>Location</strong><span>${workjob.location}</span></div>`;
    if (workjob.supervisor)          html += `<div class="workjob-info"><strong>Supervisor</strong><span>${workjob.supervisor}</span></div>`;
    if (workjob.supervisor_email)    html += `<div class="workjob-info"><strong>Email</strong><span><a href="mailto:${workjob.supervisor_email}">${workjob.supervisor_email}</a></span></div>`;
    if (workjob.spots)               html += `<div class="workjob-info"><strong>Spots</strong><span>${workjob.spots}</span></div>`;
    if (workjob.blocks)              html += `<div class="workjob-info"><strong>Blocks</strong><span>${workjob.blocks}</span></div>`;
    if (workjob.selected_or_assigned)html += `<div class="workjob-info"><strong>Type</strong><span>${workjob.selected_or_assigned}</span></div>`;
    html += `</div>`;
    if (workjob.description) html += `<div class="workjob-description">${workjob.description}</div>`;
    if (workjob.notes)       html += `<div class="workjob-note"><strong>Note</strong> ${workjob.notes}</div>`;

    detailContent.innerHTML = html;
    detail.classList.add("is-open");
    if (window.gsap) {
        // Only opacity — the modal's CSS translate(-50%, -50%) keeps it centered.
        gsap.fromTo(detail, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' });
    }

    document.querySelectorAll('.workjob-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            showWorkJobDetail(allJobs[idx], allJobs);
        });
    });
}

initMap();