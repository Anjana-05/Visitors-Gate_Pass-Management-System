document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab functionality
    const tabs = new bootstrap.Tab(document.querySelector('a[data-bs-target="#dashboard"]'));
    tabs.show();

    // Load initial data
    loadDashboardData();
    loadRecentVisitors();
    loadAllVisitors();
    loadRecentCheckIns();

    // Set up event listeners for check-in form
    setupCheckInForm();

    // Set up event listeners for check-out form
    setupCheckOutForm();

    // Set up search functionality
    setupSearch();
});

function loadDashboardData() {
    fetch('/api/visitors/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('todayVisitors').textContent = data.todayVisitors;
            document.getElementById('checkedIn').textContent = data.checkedIn;
            document.getElementById('checkedOut').textContent = data.checkedOut;
        })
        .catch(error => console.error('Error loading dashboard data:', error));
}

function loadRecentVisitors() {
    fetch('/api/visitors/recent')
        .then(response => response.json())
        .then(visitors => {
            const tableBody = document.getElementById('recentVisitorsTable');
            tableBody.innerHTML = '';

            visitors.forEach(visitor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${visitor.name}</td>
                    <td>${visitor.contact}</td>
                    <td>${visitor.purpose}</td>
                    <td>${visitor.host}</td>
                    <td>${new Date(visitor.checkIn).toLocaleString()}</td>
                    <td><span class="badge ${visitor.status === 'checked-in' ? 'bg-success' : 'bg-warning'}">${visitor.status}</span></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading recent visitors:', error));
}

function loadAllVisitors() {
    fetch('/api/visitors')
        .then(response => response.json())
        .then(visitors => {
            const tableBody = document.getElementById('visitorsTable');
            tableBody.innerHTML = '';

            visitors.forEach(visitor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${visitor._id}</td>
                    <td>${visitor.name}</td>
                    <td>${visitor.contact}</td>
                    <td>${visitor.purpose}</td>
                    <td>${visitor.host}</td>
                    <td>${visitor.department}</td>
                    <td>${new Date(visitor.checkIn).toLocaleString()}</td>
                    <td>${visitor.checkOut ? new Date(visitor.checkOut).toLocaleString() : '-'}</td>
                    <td><span class="badge ${visitor.status === 'checked-in' ? 'bg-success' : 'bg-warning'}">${visitor.status}</span></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading all visitors:', error));
}

function loadRecentCheckIns() {
    fetch('/api/visitors/recent')
        .then(response => response.json())
        .then(visitors => {
            const tableBody = document.getElementById('recentCheckInsTable');
            tableBody.innerHTML = '';

            visitors.forEach(visitor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${visitor._id}</td>
                    <td>${visitor._id}</td>
                    <td>${visitor.name}</td>
                    <td>${new Date(visitor.checkIn).toLocaleTimeString()}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading recent check-ins:', error));
}

function setupCheckInForm() {
    const form = document.getElementById('checkInForm');
    const inputs = form.querySelectorAll('input, select');

    // Update visitor pass preview on input change
    inputs.forEach(input => {
        input.addEventListener('input', updateVisitorPassPreview);
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const visitorData = {
            name: document.getElementById('name').value,
            contact: document.getElementById('contact').value,
            purpose: document.getElementById('purpose').value,
            host: document.getElementById('host').value,
            department: document.getElementById('department').value,
            vehicleNumber: document.getElementById('vehicleNumber').value,
            status: 'checked-in'
        };

        fetch('/api/visitors/checkin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(visitorData)
        })
        .then(response => response.json())
        .then(data => {
            alert('Visitor checked in successfully!');
            form.reset();
            updateVisitorPassPreview(); // Reset preview
            loadDashboardData();
            loadRecentVisitors();
            loadAllVisitors();
            loadRecentCheckIns();
        })
        .catch(error => {
            console.error('Error checking in visitor:', error);
            alert('Error checking in visitor. Please try again.');
        });
    });
}

function updateVisitorPassPreview() {
    document.getElementById('previewName').textContent = document.getElementById('name').value || '-';
    document.getElementById('previewContact').textContent = document.getElementById('contact').value || '-';
    document.getElementById('previewPurpose').textContent = document.getElementById('purpose').value || '-';
    document.getElementById('previewHost').textContent = document.getElementById('host').value || '-';
    document.getElementById('previewDepartment').textContent = document.getElementById('department').value || '-';
    document.getElementById('previewVehicle').textContent = document.getElementById('vehicleNumber').value || '-';
    document.getElementById('previewCheckIn').textContent = new Date().toLocaleString();
}

function setupCheckOutForm() {
    const form = document.getElementById('checkOutForm');
    const visitorDetails = document.getElementById('visitorDetails');
    const checkOutButton = document.getElementById('checkOutButton');

    // Handle visitor search
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const visitorId = document.getElementById('visitorId').value;

        fetch(`/api/visitors/${visitorId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Visitor not found');
                }
                return response.json();
            })
            .then(visitor => {
                if (visitor.status === 'checked-out') {
                    throw new Error('Visitor already checked out');
                }

                document.getElementById('detailName').textContent = visitor.name;
                document.getElementById('detailContact').textContent = visitor.contact;
                document.getElementById('detailPurpose').textContent = visitor.purpose;
                document.getElementById('detailHost').textContent = visitor.host;
                document.getElementById('detailCheckIn').textContent = new Date(visitor.checkIn).toLocaleString();
                
                visitorDetails.style.display = 'block';
                
                // Set up check-out button
                checkOutButton.onclick = function() {
                    fetch(`/api/visitors/checkout/${visitorId}`, {
                        method: 'POST'
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert('Visitor checked out successfully!');
                        visitorDetails.style.display = 'none';
                        form.reset();
                        loadDashboardData();
                        loadRecentVisitors();
                        loadAllVisitors();
                        loadRecentCheckIns();
                    })
                    .catch(error => {
                        console.error('Error checking out visitor:', error);
                        alert('Error checking out visitor. Please try again.');
                    });
                };
            })
            .catch(error => {
                console.error('Error fetching visitor:', error);
                alert(error.message);
                visitorDetails.style.display = 'none';
            });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    function performSearch() {
        const query = searchInput.value.trim();
        
        if (query.length === 0) {
            loadAllVisitors();
            return;
        }

        fetch(`/api/visitors/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(visitors => {
                const tableBody = document.getElementById('visitorsTable');
                tableBody.innerHTML = '';

                visitors.forEach(visitor => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${visitor.name}</td>
                        <td>${visitor.contact}</td>
                        <td>${visitor.purpose}</td>
                        <td>${visitor.host}</td>
                        <td>${visitor.department}</td>
                        <td>${new Date(visitor.checkIn).toLocaleString()}</td>
                        <td>${visitor.checkOut ? new Date(visitor.checkOut).toLocaleString() : '-'}</td>
                        <td><span class="badge ${visitor.status === 'checked-in' ? 'bg-success' : 'bg-warning'}">${visitor.status}</span></td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error searching visitors:', error));
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}