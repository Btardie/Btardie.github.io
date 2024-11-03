let columnCount = 0;

function addColumn() {
    columnCount++;
    const container = document.getElementById("columnContainer");

    // Create a new div for each column's settings
    const div = document.createElement("div");
    div.classList.add("column-settings");

    div.innerHTML = `
        <h3>Column ${columnCount}</h3>
        <label>Column Name:</label>
        <input type="text" name="colName${columnCount}" placeholder="Enter column name" oninput="generatePreview()">

        <label>Data Type:</label>
        <select name="colType${columnCount}" onchange="configureColumnOptions(${columnCount}, this.value); generatePreview();">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="category">Category</option>
        </select>

        <div id="colOptions${columnCount}" class="options-container">
            <!-- Additional options will appear here based on selected data type -->
        </div>
    `;
    container.appendChild(div);
    generatePreview(); // Update preview whenever a column is added
}

function configureColumnOptions(colNum, type) {
    const optionsDiv = document.getElementById(`colOptions${colNum}`);
    optionsDiv.innerHTML = ""; // Clear previous options

    if (type === "text") {
        optionsDiv.innerHTML = `
            <label>Sample Text Values (comma-separated):</label>
            <input type="text" name="textValues${colNum}" placeholder="e.g., Alice, Bob, Charlie" oninput="generatePreview()">
        `;
    } else if (type === "number") {
        optionsDiv.innerHTML = `
            <label>Range:</label>
            <input type="number" name="minNum${colNum}" placeholder="Min" oninput="generatePreview()">
            <input type="number" name="maxNum${colNum}" placeholder="Max" oninput="generatePreview()">
        `;
    } else if (type === "date") {
        optionsDiv.innerHTML = `
            <label>Start Date:</label>
            <input type="date" name="startDate${colNum}" oninput="generatePreview()">
            <label>End Date:</label>
            <input type="date" name="endDate${colNum}" oninput="generatePreview()">
        `;
    } else if (type === "category") {
        optionsDiv.innerHTML = `
            <label>Categories (comma-separated):</label>
            <input type="text" name="categories${colNum}" placeholder="e.g., Red, Blue, Green" oninput="generatePreview()">
        `;
    }
}

function generatePreview() {
    const numPreviewRows = 5; // Number of rows to display in the interactive preview
    const columns = [];

    // Collect column configurations
    for (let i = 1; i <= columnCount; i++) {
        const colName = document.querySelector(`[name=colName${i}]`).value || `Column ${i}`;
        const colType = document.querySelector(`[name=colType${i}]`).value;
        const colOptions = document.querySelector(`#colOptions${i}`);
        
        columns.push({
            name: colName,
            type: colType,
            options: colOptions,
            colNum: i
        });
    }

    // Generate a limited number of preview rows based on column settings
    const rows = Array.from({ length: numPreviewRows }, () => columns.map(generateCell));
    displayPreviewTable(columns.map(c => c.name), rows);
}

function generateCell(col) {
    if (col.type === "text") {
        const values = col.options.querySelector(`input[name="textValues${col.colNum}"]`)?.value.split(',').map(v => v.trim());
        return values?.[Math.floor(Math.random() * values.length)] || 'Sample Text';
    } else if (col.type === "number") {
        const min = parseFloat(col.options.querySelector(`[name="minNum${col.colNum}"]`)?.value) || 0;
        const max = parseFloat(col.options.querySelector(`[name="maxNum${col.colNum}"]`)?.value) || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else if (col.type === "date") {
        const startDate = new Date(col.options.querySelector(`[name="startDate${col.colNum}"]`)?.value);
        const endDate = new Date(col.options.querySelector(`[name="endDate${col.colNum}"]`)?.value);
        if (isNaN(startDate) || isNaN(endDate)) return '2023-01-01';
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        return randomDate.toISOString().split('T')[0];
    } else if (col.type === "category") {
        const categories = col.options.querySelector(`input[name="categories${col.colNum}"]`)?.value.split(',').map(c => c.trim());
        return categories?.[Math.floor(Math.random() * categories.length)] || 'Category';
    }
    return 'N/A';
}

function displayPreviewTable(columns, rows) {
    const table = document.getElementById('previewTable');
    table.innerHTML = ''; // Clear previous content

    // Create header row
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col || 'Column';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate data rows for preview
    rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}

function downloadDataset() {
    const numRecords = parseInt(document.getElementById('numRecords').value);
    const columns = [];

    for (let i = 1; i <= columnCount; i++) {
        const colName = document.querySelector(`[name=colName${i}]`).value || `Column ${i}`;
        const colType = document.querySelector(`[name=colType${i}]`).value;
        const colOptions = document.querySelector(`#colOptions${i}`);
        
        columns.push({
            name: colName,
            type: colType,
            options: colOptions,
            colNum: i
        });
    }

    // Generate full dataset for download
    const rows = Array.from({ length: numRecords }, () => columns.map(generateCell));
    const csvContent = [columns.map(c => c.name).join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dataset.csv';
    a.click();
    URL.revokeObjectURL(url);
}
