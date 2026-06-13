// --- GLOBAL STATE ---
let globalMaterialData = []; // This array will hold ALL data fetched from the Google Sheet.
let nextTempSkuIndex = 1;

// --- CORE FUNCTIONS ---

/**
 * Parses the CSV text into an array of JavaScript objects.
 * Assumes the first row is the header.
 * @param {string} csvText - The raw text content of the CSV file.
 * @returns {Array<Object>} - An array of objects.
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    // Extract headers from the first line
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Map the rest of the lines to objects
    const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        let obj = {};
        
        // Iterate over headers and values simultaneously
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        return obj;
    });
    return data;
}


/**
 * Renders the material table based on the provided filtered data.
 * @param {Array<Object>} dataToShow - The subset of data to display.
 */
function renderMaterialTable(dataToShow) {
    const tableBody = document.getElementById('material-table-body');
    tableBody.innerHTML = ''; // Clear the existing table content

    if (dataToShow.length === 0) {
        // If no data is found, show a placeholder row
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #999;">No materials match your criteria.</td></tr>`;
        return;
    }

    dataToShow.forEach(item => {
        // Calculate total cost dynamically if unit cost and quantity exist
        const unitCost = parseFloat(item.unit_cost) || 0;
        const qty = parseFloat(item.qty) || 0;
        const totalCost = (unitCost * qty).toFixed(2);

        const row = `<tr>
            <td>${item.sku || ''}</td>
            <td>${item.item_name || ''}</td>
            <td>${item.unit_type || ''}</td>
            <td>${item.qty || ''}</td>
            <td>$${unitCost.toFixed(2)}</td>
            <td><strong>$${totalCost}</strong></td>
        </tr>`;
        
        tableBody.innerHTML += row;
    });
}


/**
 * Main function to fetch the CSV and populate the global data array.
 */
async function loadSheetData() {
    const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQF-dVNCimVYFht-LgwEeKT4rEtW-IDphibc5oSV60YBjLxGn4KGT45nU2U58EfBCYbF0UdDxdoe88r/pub?gid=0&single=true&output=csv";
    const statusElement = document.getElementById('sheet-status');
    statusElement.textContent = '⏳ Fetching and parsing data...';
    statusElement.style.color = 'orange';

    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const csvText = await response.text();

        // STEP 1: Parse the data
        globalMaterialData = parseCSV(csvText);
        console.log("Successfully loaded and parsed data:", globalMaterialData);

        // STEP 2: Display all data by default (no search filter yet)
        renderMaterialTable(globalMaterialData);

        statusElement.textContent = `✅ Loaded ${globalMaterialData.length} items`;
        statusElement.style.color = 'green';

    } catch (error) {
        console.error("Error loading Google Sheet:", error);
        statusElement.textContent = `❌ Error: ${error.message}`;
        statusElement.style.color = 'red';
    }
}

/**
 * Handles the filtering of the material list based on the search input.
 * @param {Event} e - The input event object.
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    // Filter the global data array
    const filteredData = globalMaterialData.filter(item => {
        // Check if SKU or Item Name contains the search term
        const skuMatch = (item.sku || '').toLowerCase().includes(searchTerm);
        const nameMatch = (item.item_name || '').toLowerCase().includes(searchTerm);
        return skuMatch || nameMatch;
    });

    // Re-render the table with the filtered data
    renderMaterialTable(filteredData);
}

/**
 * Adds a new item manually to the material list.
 */
function addItem() {
    // Get values from the form fields
    const sku = document.getElementById('temp-sku').value.toUpperCase();
    const qty = parseFloat(document.getElementById('add-qty').value);
    const unitType = document.getElementById('add-unit-type').value;
    const itemName = document.getElementById('add-item-name').value;
    const unitCost = parseFloat(document.getElementById('add-unit-cost').value);
    const totalCost = (qty * unitCost).toFixed(2);

    if (!sku || isNaN(qty) || qty <= 0 || !itemName || isNaN(unitCost) || unitCost < 0) {
        alert("Please fill out all fields correctly (Quantity must be > 0, Cost must be valid).");
        return;
    }
    
    // Create the new item object
    const newItem = {
        sku: sku,
        item_name: itemName,
        unit_type: unitType,
        qty: qty,
        unit_cost: unitCost,
        total_cost: totalCost // Store calculated cost
    };

    // 1. Add the new item to our global list
    globalMaterialData.push(newItem);

    // 2. Re-render the table (to include the new item)
    // 3. Re-apply the current search filter, if one is active
    const currentSearchTerm = document.getElementById('sku-search').value.toLowerCase();
    const filteredData = globalMaterialData.filter(item => 
        (item.sku || '').toLowerCase().includes(currentSearchTerm) || 
        (item.item_name || '').toLowerCase().includes(currentSearchTerm)
    );
    renderMaterialTable(filteredData);

    // 4. Reset the form for the next entry
    document.getElementById('temp-sku').value = 'TMP-' + String(nextTempSkuIndex).padStart(3, '0');
    document.getElementById('add-qty').value = 1;
    document.getElementById('add-item-name').value = '';
    document.getElementById('add-unit-cost').value = '0.00';
    nextTempSkuIndex++;

    alert(`Item ${sku} added successfully!`);
}


/**
 * Adds a new block/template for a complete Quote/Job.
 */
function addTemplateBlock() {
    const templateContainer = document.getElementById('dashboard-main');
    
    // Create the structure (Customer Info, Scope, Material List)
    const newBlock = document.createElement('div');
    newBlock.className = 'info-section new-quote-block';
    newBlock.style.marginTop = '50px';
    newBlock.innerHTML = `
        <h2 style="border-bottom: none; background-color: #f0f8ff;">--- New Quote Block ---</h2>
        
        <section class="info-section customer-info" style="background-color: #fff;">
            <h2>Customer Information</h2>
            <div class="form-row">
                <div class="form-group"><label>Customer Name:</label><input type="text" placeholder="Name"></div>
                <div class="form-group"><label>Quote No.:</label><input type="text" placeholder="Q-000"></div>
            </div>
            <div class="form-row">
                <div class="form-group full-width"><label>Address:</label><textarea placeholder="Address"></textarea></div>
                <div class="form-group"><label>Date:</label><input type="date" value="${new Date().toISOString().substring(0, 10)}"></div>
            </div>
        </section>

        <section class="info-section job-details" style="background-color: #f0f8ff;">
            <h2>Scope of Work / Job Details</h2>
            <textarea rows="5" placeholder="Describe the job scope..."></textarea>
        </section>

        <section class="info-section material-management" style="background-color: #fff; border: 1px dashed #aaa;">
            <h2>Material List</h2>
            <div class="search-area">
                <input type="text" id="temp-search-sku" placeholder="Search by SKU or Item Description...">
            </div>
            <div class="table-container">
                <table id="temp-material-table">
                    <thead>
                        <tr>
                            <th>SKU</th><th>Item Name</th><th>Unit Type</th><th>Qty</th><th>Unit Cost</th><th>Total Cost</th>
                        </tr>
                    </thead>
                    <tbody id="temp-material-table-body">
                         <tr><td colspan="6" style="text-align: center; color: #aaa;">No items added yet.</td></tr>
                    </tbody>
                </table>
            </div>
            
            <h3>Add Custom Item Manually</h3>
            <div class="form-row add-item-row">
                <!-- NOTE: For simplicity, I am only cloning the form inputs, not the full JS logic. -->
                <div class="form-group"><label>Temp SKU</label><input type="text" placeholder="TMP-001"></div>
                <div class="form-group"><label>Quantity</label><input type="number" value="1" min="1"></div>
                <div class="form-group"><label>Unit Type</label><input type="text" placeholder="pcs"></div>
                <div class="form-group"><label>Item Name</label><input type="text" placeholder="Item"></div>
                <div class="form-group"><label>Unit Cost ($)</label><input type="number" value="0.00" min="0" step="0.01"></div>
                <div class="form-group"><button class="action-btn">Add Item</button></div>
            </div>
        </section>
    `;

    // Append the new block to the main dashboard
    templateContainer.appendChild(newBlock);

    // Optional: Scroll to the new block
    newBlock.scrollIntoView({ behavior: 'smooth' });
}


// --- INITIALIZATION & EVENT LISTENERS ---

function initializeApp() {
    // 1. Load Data when page starts
    loadSheetData();

    // 2. Attach the CSV Refresh Listener
    document.getElementById('refresh-btn').addEventListener('click', loadSheetData);

    // 3. Attach the Search Listener
    document.getElementById('sku-search').addEventListener('input', handleSearch);

    // 4. Attach the Add Item Listener
    document.getElementById('add-item-btn').addEventListener('click', addItem);

    // 5. Attach the Template Adder
    document.getElementById('add-template-btn').addEventListener('click', addTemplateBlock);
}
