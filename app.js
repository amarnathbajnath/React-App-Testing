// --- Global Data Storage ---
let materialData = []; 

// --- Element References ---
const statusElement = document.getElementById('sheet-status');
const refreshButton = document.getElementById('refresh-btn');

// ====================================================
// PART 1: CSV PARSING & FETCH
// ====================================================

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQF-dVNCimVYFht-LgwEeKT4rEtW-IDphibc5oSV60YBjLxGn4KGT45nU2U58EfBCYbF0UdDxdoe88r/pub?gid=0&single=true&output=csv";

/**
 * Converts CSV text into a structured Array of Objects.
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        
        const row = {
            sku: values[0] ? values[0].trim() : null,
            itemName: values[1] ? values[1].trim() : null,
            unitType: values[2] ? values[2].trim() : 'EA',
            unitCost: parseFloat(values[3] ? values[3].trim() : 0),
        };
        data.push(row);
    }
    return data;
}

/**
 * Main function to fetch and parse the Google Sheet data.
 */
async function loadSheetData() {
    statusElement.textContent = '⏳ Loading data...';
    statusElement.style.color = 'orange';
    
    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const csvText = await response.text();
        
        materialData = parseCSV(csvText);
        
        statusElement.textContent = `✅ Loaded ${materialData.length} items successfully!`;
        statusElement.style.color = 'green';
        
        // Clear tables when data is reloaded
       // document.getElementById('search-results-body').innerHTML = '';
        // document.getElementById('final-materials-body').innerHTML = '';
        
    } catch (error) {
        console.error("Error loading Google Sheet data:", error);
        statusElement.textContent = `❌ Error: ${error.message}`;
        statusElement.style.color = 'red';
        materialData = [];
    }
}

// ====================================================
// PART 2: CLONING LOGIC (Step 6)
// ====================================================

function addNewScopeBlock() {
    const parentContainer = document.getElementById('scope-block-container');
    // Clone the entire block
    const newBlock = document.getElementById('scope-block-container').cloneNode(true);
    parentContainer.appendChild(newBlock);
}

// ====================================================
// PART 3: MATERIAL SEARCH (Step 4)
// ====================================================

/**
 * Filters the global materialData array based on user input and displays results in the search table.
 */
function searchMaterials() {
    const input = document.getElementById('material-search-input').value.toLowerCase();
    const searchResultsBody = document.getElementById('search-results-body');
    searchResultsBody.innerHTML = ''; 
    
    const filteredItems = materialData.filter(item => 
        item.sku.toLowerCase().includes(input) || 
        item.itemName.toLowerCase().includes(input)
    );

    if (filteredItems.length === 0) {
        searchResultsBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No matching materials found.</td></tr>';
        return;
    }

    // Populate the search table with results
    filteredItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.sku}</td>
            <td>${item.itemName}</td>
            <td>${item.unitType}</td>
            <td>$${item.unitCost.toFixed(2)}</td>
            <td><input type="number" id="qty-${item.sku}" class="material-qty" value="1" min="1" style="width: 50px;"></td>
            <td><button class="btn-add-search" onclick="addToFinalList('${item.sku}')">Add to List</button></td>
        `;
        searchResultsBody.appendChild(row);
    });
}

/**
 * Moves a selected item from the search results into the final output table.
 * @param {string} sku - The SKU of the item to add.
 */
function addToFinalList(sku) {
    const row = document.querySelector(`#material-search-table tr:has(button[onclick*="'${sku}'"])`);
    if (!row) return;

    const qtyInput = row.querySelector('.material-qty');
    const qty = parseInt(qtyInput.value);
    
    const item = materialData.find(d => d.sku === sku);

    if (item && !isNaN(qty)) {
        const totalCost = (qty * item.unitCost).toFixed(2);
        
        // Create the new row structure for the final list
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${item.sku}</td>
            <td>${qty}</td>
            <td>${item.unitType}</td>
            <td>${item.itemName}</td>            
            <td>$${item.unitCost.toFixed(2)}</td>            
            <td class="total-cost">$${totalCost}</td>
            <td><button class="btn-remove" onclick="removeFinalRow(this)">Remove</button></td>
        `;
        // Append to the final list
        document.getElementById('final-materials-body').appendChild(newRow);
    }
}

/**
 * Removes a row from the Final Material List.
 */
function removeFinalRow(button) {
    const row = button.parentNode.parentNode;
    row.remove();
}


// ====================================================
// PART 4: MANUAL ITEM ADD (Step 5)
// ====================================================

function addItemToTable() {
    const form = document.getElementById('add-item-form');
    const tableBody = document.getElementById('final-materials-body');

    const sku = document.getElementById('temp-sku').value.toUpperCase();
    const qty = parseInt(document.getElementById('add-qty').value);
    const unitType = document.getElementById('add-unit-type').value;
    const itemName = document.getElementById('add-item-name').value;
    const unitCost = parseFloat(document.getElementById('add-unit-cost').value);
    
    if (!sku || isNaN(qty) || !itemName || isNaN(unitCost)) {
        alert("Please fill out all required fields (SKU, Qty, Item Name, Unit Cost) correctly.");
        return;
    }

    const totalCost = (qty * unitCost).toFixed(2);
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${item.sku}</td>
        <td>${qty}</td>
        <td>${item.unitType}</td>
        <td>${item.itemName}</td>            
        <td>$${item.unitCost.toFixed(2)}</td>  
        <td class="total-cost">$${totalCost}</td>
        <td><button class="btn-remove" onclick="removeFinalRow(this)">Remove</button></td>
    `;
    
    tableBody.appendChild(newRow);

    // Clear form
    form.reset();
}


// ====================================================
// INITIALIZATION & LISTENERS
// ====================================================

function loadInitialData() {
    loadSheetData();
}

// Attach listeners
refreshButton.addEventListener('click', loadSheetData);
document.getElementById('clone-scope-button').addEventListener('click', addNewScopeBlock);
