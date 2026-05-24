// ====================== DATA ======================
const usersData = [
    { id: "24-BGU-0318", name: "Joshua Vince Junio II",   course: "BSIT Web and Mobile Technologies", year: "2nd", email: "junio.joshua@psublgu.edu.ph",  status: "Active"   },
    { id: "24-BGU-0362", name: "Aleah Mae T. Valdez",     course: "BSIT Data Analytics",              year: "2nd", email: "valdez.aleah@psublgu.edu.ph",  status: "Active"   },
    { id: "24-BGU-0369", name: "Aehri Vien Valdez Junio", course: "BPA",                              year: "1st", email: "junio.aehri@psublgu.edu.ph",   status: "Inactive" },
    { id: "24-BGU-0366", name: "Vinvin Valdez Junio",     course: "BSIT Data Analytics",              year: "1st", email: "junio.vinvin@psublgu.edu.ph",  status: "Inactive" },
    { id: "24-BGU-0475", name: "Viktor Isaac Arcega",      course: "BSBA",                             year: "2nd", email: "arcega.viktor@psublgu.edu.ph", status: "Active"   },
    { id: "24-BGU-0320", name: "Elijah Josh Fajardo",     course: "BSIT Web and Mobile Technologies", year: "2nd", email: "fajardo.elijah@psublgu.edu.ph",status: "Active"   },
    { id: "24-BGU-0318", name: "Joshua Vince Junio II",   course: "BPA",                              year: "2nd", email: "junio.joshua@psublgu.edu.ph",  status: "Active"   },
    { id: "24-BGU-0475", name: "Viktor Isaac Arcega",      course: "ABEL",                             year: "2nd", email: "arcega.viktor@psublgu.edu.ph", status: "Active"   },
];

const roomsData = [
    { number: "Lab 1",  building: "CAST", floor: "1", type: "Computer Lab", capacity: "40",  status: "Available" },
    { number: "Lab 2",  building: "CAST", floor: "1", type: "Computer Lab", capacity: "44",  status: "Occupied"  },
    { number: "Lab 3",  building: "CAST", floor: "1", type: "Computer Lab", capacity: "45",  status: "Available" },
    { number: "Rm 106", building: "CAST", floor: "1", type: "Lecture",      capacity: "143", status: "Available" },
];

// ====================== LOADING SCREEN ======================
const loadingSteps = [
    { pct: 18,  label: "Initializing"    },
    { pct: 38,  label: "Loading modules"  },
    { pct: 58,  label: "Fetching data"    },
    { pct: 78,  label: "Preparing portal" },
    { pct: 92,  label: "Almost ready"     },
    { pct: 100, label: "Done"             },
];

let stepIndex = 0;

function runLoadingStep() {
    if (stepIndex >= loadingSteps.length) return;
    const step = loadingSteps[stepIndex];
    document.getElementById('progress-fill').style.width = step.pct + '%';
    document.getElementById('pct-text').textContent = step.pct + '%';
    document.getElementById('status-text').textContent = step.label;
    stepIndex++;

    if (stepIndex < loadingSteps.length) {
        setTimeout(runLoadingStep, Math.random() * 250 + 160);
    } else {
        setTimeout(finishLoading, 350);
    }
}

function finishLoading() {
    const screen = document.getElementById('loading-screen');
    screen.classList.add('fade-out');
    setTimeout(() => {
        screen.style.display = 'none';
        document.getElementById('admin-panel').classList.remove('hidden');
        // FIX 3: call renderTables() (not renderUsers) since the Users page
        // now uses department-split tables
        renderTables();
        renderRooms();
        renderSchedules();
        showPage('dashboard');
    }, 680);
}

// Single authoritative onload — kicks off the loading animation
// FIX 1: removed the bare renderTables() call that ran before the DOM existed
window.onload = function () {
    setTimeout(runLoadingStep, 600);
};

// ====================== PAGE NAVIGATION ======================
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + page).classList.remove('hidden');
    document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
    const activeLink = Array.from(document.querySelectorAll('.admin-nav-item'))
        .find(item => item.getAttribute('onclick')?.includes("'" + page + "'"));
    if (activeLink) activeLink.classList.add('active');
}

// ====================== LOGOUT ======================
function logout() {
    if (confirm("Logout from Admin Portal?")) {
        window.location.reload();
    }
}

// ====================== USERS — department tables ======================
function buildRow(user) {
    const statusClass = user.status === 'Active'
        ? 'bg-green-500/20 text-green-400'
        : 'bg-red-500/20 text-red-400';
    return `
        <tr class="border-b border-white/5 hover:bg-white/5 transition text-white/80">
            <td class="p-6 font-mono text-sm">${user.id}</td>
            <td class="p-6 font-semibold">${user.name}</td>
            <td class="p-6">${user.course}</td>
            <td class="p-6">${user.year}</td>
            <td class="p-6 text-white/60">${user.email}</td>
            <td class="p-6 text-center">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">
                    ${user.status}
                </span>
            </td>
            <td class="p-6 text-center">
                <button class="text-[#E8B923] hover:underline text-sm font-medium mx-2"
                        onclick="viewUser('${user.id}')">Edit</button>
                <button class="text-red-400 hover:underline text-sm font-medium mx-2">Delete</button>
            </td>
        </tr>
    `;
}

function renderTables(list) {
    // FIX 2: declared bpaBody correctly (was "bsn-body" before, which doesn't exist in the HTML)
    const bsitBody = document.getElementById("bsit-body");
    const bsbaBody = document.getElementById("bsba-body");
    const bpaBody  = document.getElementById("bpa-body");   // ← correct ID
    const abelBody = document.getElementById("abel-body");

    if (!bsitBody || !bsbaBody || !bpaBody || !abelBody) return;

    bsitBody.innerHTML = "";
    bsbaBody.innerHTML = "";
    bpaBody.innerHTML  = "";
    abelBody.innerHTML = "";

    const source = list || usersData;
    const EMPTY  = '<tr><td colspan="7" class="p-6 text-center text-white/30 italic">No students found.</td></tr>';

    const buckets = { bsit: [], bsba: [], bpa: [], abel: [] };

    source.forEach(user => {
        const c = user.course.toUpperCase();
        if      (c.includes("BSIT")) buckets.bsit.push(user);
        else if (c.includes("BSBA")) buckets.bsba.push(user);
        else if (c.includes("BPA"))  buckets.bpa.push(user);
        else if (c.includes("ABEL")) buckets.abel.push(user);
    });

    bsitBody.innerHTML = buckets.bsit.length ? buckets.bsit.map(buildRow).join('') : EMPTY;
    bsbaBody.innerHTML = buckets.bsba.length ? buckets.bsba.map(buildRow).join('') : EMPTY;
    bpaBody.innerHTML  = buckets.bpa.length  ? buckets.bpa.map(buildRow).join('')  : EMPTY;
    abelBody.innerHTML = buckets.abel.length ? buckets.abel.map(buildRow).join('') : EMPTY;
}

function searchUsers() {
    const query = document.getElementById('user-search').value.toLowerCase().trim();
    const filtered = usersData.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
    renderTables(filtered);
}

function addNewUser() {
    const name = prompt("Enter Full Name:");
    if (name && name.trim()) {
        alert('New user "' + name.trim() + '" has been added successfully!');
    }
}

function viewUser(id) {
    const user = usersData.find(u => u.id === id);
    if (user) {
        alert(
            '📋 User Profile\n\n' +
            'Student ID : ' + user.id + '\n' +
            'Name       : ' + user.name + '\n' +
            'Course     : ' + user.course + '\n' +
            'Year       : ' + user.year + '\n' +
            'Email      : ' + user.email + '\n' +
            'Status     : ' + user.status
        );
    }
}

// ====================== ROOMS ======================
function renderRooms() {
    const tbody = document.getElementById('rooms-body');
    if (!tbody) return;
    tbody.innerHTML = roomsData.map(room => {
        const avail = room.status === 'Available';
        return `
            <tr class="border-b border-white/5 hover:bg-white/5 transition">
                <td class="p-6 font-medium">${room.number}</td>
                <td class="p-6 text-white/70">${room.building}</td>
                <td class="p-6 text-white/70">${room.floor}</td>
                <td class="p-6 text-white/70">${room.type}</td>
                <td class="p-6 text-white/70">${room.capacity}</td>
                <td class="p-6 text-center">
                    <span class="${avail ? 'text-emerald-400' : 'text-amber-400'}">${room.status}</span>
                </td>
                <td class="p-6 text-center">
                    <button class="edit-btn" onclick="editRoom('${room.number}')">Edit</button>
                </td>
            </tr>
        `;
    }).join('');
}

function addNewRoom() { alert("➕ Add New Room form would open here."); }
function editRoom(number) { alert("✏️ Editing Room: " + number); }

// ====================== SCHEDULES ======================
function renderSchedules() {
    const container = document.getElementById('schedule-list');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white/10 rounded-3xl p-6 flex justify-between items-center">
            <div>
                <p class="font-medium">MT-101 • Multi Media Technology</p>
                <p class="text-white/60 text-sm mt-1">Lab 1 • 8:00 AM – 9:30 AM • Prof. Wendell</p>
            </div>
            <span class="text-emerald-400 text-sm font-medium shrink-0">Today</span>
        </div>
        <div class="bg-white/10 rounded-3xl p-6 flex justify-between items-center">
            <div>
                <p class="font-medium">HCI-102 • Human Computer Interaction</p>
                <p class="text-white/60 text-sm mt-1">Lab 2 • 10:00 AM – 11:30 AM • Prof. Sharyll</p>
            </div>
            <span class="text-emerald-400 text-sm font-medium shrink-0">Today</span>
        </div>
    `;
}

function addNewSchedule() {
    const subject = prompt("Enter Subject Code (e.g. CC-101):");
    if (subject && subject.trim()) {
        alert('✅ New schedule for "' + subject.trim() + '" added successfully!');
    }
}