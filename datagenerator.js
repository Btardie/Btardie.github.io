let columnCount = 0;

function addColumn() {
    columnCount++;
    const container = document.getElementById("columnContainer");

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
    const numRecords = parseInt(document.getElementById('numRecords').value);
    const columns = [];

    // Collect column configurations
    for (let i = 1; i <= columnCount; i++) {
        const colName = document.querySelector(`[name=colName${i}]`).value;
        const colType = document.querySelector(`[name=colType${i}]`).value;
        const colOptions = document.querySelector(`#colOptions${i}`);
        
        columns.push({
            name: colName,
            type: colType,
            options: colOptions,
            colNum: i
        });
    }

    // Generate rows of data based on column settings
    const rows = Array.from({ length: numRecords }, () => columns.map(generateCell));
    displayPreviewTable(columns.map(c => c.name), rows);
}

function generateCell(col) {
    if (col.type === "text") {
        const values = col.options.querySelector("input[name='textValues" + col.colNum + "']").value.split(',').map(v => v.trim());
        return values[Math.floor(Math.random() * values.length)] || 'Sample Text';
    } else if (col.type === "number") {
        const min = parseFloat(col.options.querySelector(`[name=minNum${col.colNum}]`).value) || 0;
        const max = parseFloat(col.options.querySelector(`[name=maxNum${col.colNum}]`).value) || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else if (col.type === "date") {
        const start = new Date(col.options.querySelector(`[name=startDate${col.colNum}]`).value).getTime();
        const end = new Date(col.options.querySelector(`[name=endDate${col.colNum}]`).value).getTime();
        if (isNaN(start) || isNaN(end)) return '2023-01-01';
        return new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
    } else if (col.type === "category") {
        const categories = col.options.querySelector("input[name='categories" + col.colNum + "']").value.split(',').map(c => c.trim());
        return categories[Math.floor(Math.random() * categories.length)] || 'Category';
    }
    return 'N/A';
}

function displayPreviewTable(columns, rows) {
    const table = document.getElementById('previewTable');
    table.innerHTML = '';
    
    // Create header row
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col || 'Column';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate data rows
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
    const table = document.getElementById('previewTable');
    const csvContent = Array.from(table.querySelectorAll('tr'))
        .map(row => Array.from(row.querySelectorAll('td, th'))
        .map(cell => cell.textContent).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dataset.csv';
    a.click();
    URL.revokeObjectURL(url);
}
