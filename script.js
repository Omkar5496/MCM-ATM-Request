document.addEventListener('DOMContentLoaded', function () {
    // Fetch vehicle numbers and card numbers from Google Sheets via Apps Script
    fetch('https://script.google.com/macros/s/AKfycbz9FKbis16rQi7J2e3LefU8uOS5dzOFNsD9UPuMMrV2dbAntlLdJgQ39oa0YI6_W65eBg/exec')
        .then(response => response.json())
        .then(data => {
            const vehicleData = data.vehicleData;
            let reportData = data.reportData;

            const vehicleSelect = document.getElementById('vehicleSelect');
            
            // Populate the dropdown with vehicle numbers
            vehicleData.forEach(function(item) {
                const option = document.createElement('option');
                option.value = item.vehicleNumber;
                option.textContent = item.vehicleNumber;
                vehicleSelect.appendChild(option);
            });

            // Event listener to update card number when a vehicle is selected
            vehicleSelect.addEventListener('change', function() {
                const selectedVehicle = vehicleSelect.value;
                
                // Find the card number corresponding to the selected vehicle
                const selectedData = vehicleData.find(function(item) {
                    return item.vehicleNumber === selectedVehicle;
                });

                if (selectedData) {
                    // Display the card number as text to preserve leading zeros
                    document.getElementById('cardNumber').value = selectedData.cardNumber;  // Ensure it is treated as text
                }
            });

            // Tab switching functionality
            const formTab = document.getElementById('formTab');
            const statusTab = document.getElementById('statusTab');
            const formSection = document.getElementById('formSection');
            const statusSection = document.getElementById('statusSection');

            formTab.addEventListener('click', function() {
                formSection.style.display = 'block';
                statusSection.style.display = 'none';
                formTab.classList.add('active');
                statusTab.classList.remove('active');
            });

            statusTab.addEventListener('click', function() {
                formSection.style.display = 'none';
                statusSection.style.display = 'block';
                formTab.classList.remove('active');
                statusTab.classList.add('active');
                
                // Sort the reportData by timestamp in descending order
                reportData.sort(function(a, b) {
                    const dateA = new Date(a.timestamp); // Assuming timestamp is in a valid date format
                    const dateB = new Date(b.timestamp);
                    return dateB - dateA; // Descending order
                });

                // Populate the status table
                const statusTable = document.getElementById('statusTable');
                statusTable.innerHTML = ''; // Clear existing table data
                
                // Create the table header
                const headerRow = document.createElement('tr');
                const headers = ['Timestamp', 'Vehicle Number', 'Card Number', 'Amount', 'Comment', 'Status', 'Remarks'];
                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                statusTable.appendChild(headerRow);

                // Add data to the table
                reportData.forEach(function(item) {
                    const row = document.createElement('tr');
                    Object.values(item).forEach(function(value) {
                        const td = document.createElement('td');
                        td.textContent = value;
                        row.appendChild(td);
                    });
                    statusTable.appendChild(row);
                });

                // Add search functionality
                const searchField = document.getElementById('searchField');
                searchField.addEventListener('input', function() {
                    const searchQuery = searchField.value.toLowerCase();
                    const rows = statusTable.querySelectorAll('tr:nth-child(n+2)'); // Skip header row
                    
                    rows.forEach(row => {
                        const vehicleNumber = row.cells[1].textContent.toLowerCase();
                        if (vehicleNumber.includes(searchQuery)) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
            });

            // Initially activate the "ATM Request Form" tab
            formTab.classList.add('active');
            
            // Form submission handler
            document.getElementById('atm-form').addEventListener('submit', function (event) {
                event.preventDefault(); // Prevent the form from submitting normally
                
                const submitButton = event.target.querySelector('button');
                submitButton.disabled = true;  // Disable the submit button to prevent multiple submissions

                const vehicleNumber = document.getElementById('vehicleSelect').value;
                const cardNumber = document.getElementById('cardNumber').value;
                const amount = document.getElementById('amount').value;
                const comment = document.getElementById('comment').value;

                // Prepare the data to be sent to Google Apps Script
                const data = {
                    vehicleNumber: vehicleNumber,
                    cardNumber: cardNumber,
                    amount: amount,
                    comment: comment
                };

                // Send data to Google Apps Script
                fetch('https://script.google.com/macros/s/AKfycbz9FKbis16rQi7J2e3LefU8uOS5dzOFNsD9UPuMMrV2dbAntlLdJgQ39oa0YI6_W65eBg/exec', {
                    method: 'POST',
                    body: new URLSearchParams(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(response => response.text())
                .then(responseText => {
                    // Handle success response
                    document.getElementById('response-message').innerText = "Data submitted successfully!";
                    document.getElementById('atm-form').reset(); // Reset form fields

                    // Automatically hide the success message after 5 seconds
                    setTimeout(function() {
                        document.getElementById('response-message').innerText = '';
                    }, 2000);
                })
                .catch(error => {
                    // Handle error response
                    console.error('Error submitting data:', error);
                    document.getElementById('response-message').innerText = "Error submitting data. Please try again.";
                })
                .finally(() => {
                    submitButton.disabled = false;  // Re-enable the submit button after request is complete
                });
            });
        })
        .catch(error => {
            console.error('Error fetching vehicle data:', error);
            document.getElementById('response-message').innerText = 'Error loading vehicle numbers. Please try again.';
        });
});
