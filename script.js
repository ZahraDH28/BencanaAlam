var map = L.map('map').setView([-2.5, 118], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

function icon(name) {
    return L.divIcon({
        html: `<img src="icons/${name}" class="disaster-icon">`,
        iconSize: [42, 42],
        className: ""
    });
}

const iconMap = {
    "gempa": icon("gempa.png"),
    "banjir": icon("flood.png"),
    "letusan": icon("eruption.png"),
    "longsor": icon("longsor.png"),
    "tornado": icon("tornado.png"),
    "hurricane": icon("hurricane.png"),
    "wildfire": icon("wildfire.png")
};

var clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true
});

let allMarkers = [];

fetch("data/incidents.geojson")
.then(r => r.json())
.then(data => {

    data.features.forEach(f => {
        let type = f.properties.type.toLowerCase();
        let ic = iconMap[type] || iconMap["wildfire"];

        let marker = L.marker(
            [f.geometry.coordinates[1], f.geometry.coordinates[0]],
            { icon: ic }
        );

        marker.bindPopup(`
            <b>${f.properties.title}</b><br>
            <b>Jenis:</b> ${f.properties.type}<br>
            <b>Tanggal:</b> ${f.properties.date}<br>
            <b>Deskripsi:</b> ${f.properties.desc}
        `, { autoPan: false });

        marker.type = type;
        marker.feature = f;

        allMarkers.push(marker);
        clusterGroup.addLayer(marker);

        addToList(f, marker);
    });

    map.addLayer(clusterGroup);
});

// SIDEBAR LIST
function addToList(feature, marker) {
    const list = document.getElementById("incident-list");

    // FIX: Jika elemen tidak ditemukan, cegah error
    if (!list) {
        console.error("ERROR: #incident-list tidak ditemukan!");
        return;
    }

    let box = document.createElement("div");
    box.className = "incident-card";
    box.innerHTML = `
        <div class="incident-title">${feature.properties.title}</div>
        <div class="incident-type">${feature.properties.type} • ${feature.properties.date}</div>
    `;

    box.onclick = () => {
        map.setView([
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0]
        ], 10);

        marker.openPopup();
    };

    list.appendChild(box);  // Aman
}

// FILTER
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelector(".filter-btn.active").classList.remove("active");
        btn.classList.add("active");

        let type = btn.dataset.type;

        clusterGroup.clearLayers();

        allMarkers.forEach(m => {
            if (type === "all" || m.type === type) {
                clusterGroup.addLayer(m);
            }
        });
    };
});
