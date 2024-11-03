let columnCount = 0;

function addColumn() {
    columnCount++;
    const container = document.getElementById("columnContainer");

    const div = document.createElement("div");
    div.classList.add("column-settings");

    div.innerHTML = `
        <h3>Column ${columnCount}</h3>
        <label>Column Name:</label>
        <input type="text" name="colName${columnCount}" placeholder="Enter column name" oninput="generatePreview()" aria-label="Column name">

        <label>Data Type:</label>
        <select name="colType${columnCount}" onchange="configureColumnOptions(${columnCount}, this.value); generatePreview();" aria-label="Data type">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="category">Category</option>
        </select>

        <div id="colOptions${columnCount}" class="options-container"></div>
    `;
    container.appendChild(div);
    generatePreview();
}

function configureColumnOptions(colNum, type) {
    const optionsDiv = document.getElementById(`colOptions${colNum}`);
    optionsDiv.innerHTML = "";

    if (type === "text") {
        optionsDiv.innerHTML = `
            <label>Sample Text Values (comma-separated):</label>
            <input type="text" name="textValues${colNum}" placeholder="e.g., Alice, Bob, Charlie" oninput="generatePreview()">
        `;
    } else if (type === "number") {
        optionsDiv.innerHTML = `
            <label>Mode:</label>
            <select name="mode${colNum}" onchange="generatePreview()">
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
            </select>
            <div id="basicOptions${colNum}" class="basic-options">
                <label>Range:</label>
                <input type="number" name="minNum${colNum}" placeholder="Min" oninput="generatePreview()">
                <input type="number" name="maxNum${colNum}" placeholder="Max" oninput="generatePreview()">
            </div>
            <div id="advancedOptions${colNum}" class="advanced-options" style="display: none;">
                <label>Mean:</label>
                <input type="number" name="mean${colNum}" placeholder="Mean" oninput="generatePreview()">
                <label>Standard Deviation:</label>
                <input type="number" name="stddev${colNum}" placeholder="Standard Deviation" oninput="generatePreview()">
            </div>
        `;
        
        const modeSelector = optionsDiv.querySelector(`select[name="mode${colNum}"]`);
        modeSelector.addEventListener('change', () => {
            const basicOptions = document.getElementById(`basicOptions${colNum}`);
            const advancedOptions = document.getElementById(`advancedOptions${colNum}`);
            if (modeSelector.value === "basic") {
                basicOptions.style.display = "block";
                advancedOptions.style.display = "none";
            } else {
                basicOptions.style.display = "none";
                advancedOptions.style.display = "block";
            }
        });
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

function generateCell(col) {
    if (col.type === "text") {
        const values = col.options.querySelector(`input[name="textValues${col.colNum}"]`)?.value.split(',').map(v => v.trim());
        return values?.[Math.floor(Math.random() * values.length)] || 'Sample Text';
    } else if (col.type === "number") {
        const mode = col.options.querySelector(`select[name="mode${col.colNum}"]`).value;
        if (mode === "basic") {
            const min = parseFloat(col.options.querySelector(`[name="minNum${col.colNum}"]`)?.value) || 0;
            const max = parseFloat(col.options.querySelector(`[name="maxNum${col.colNum}"]`)?.value) || 100;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else if (mode === "advanced") {
            const mean = parseFloat(col.options.querySelector(`[name="mean${col.colNum}"]`)?.value) || 0;
            const stddev = parseFloat(col.options.querySelector(`[name="stddev${col.colNum}"]`)?.value) || 1;
            return Math.round((Math.random() * stddev) + mean);
        }
    }
    return 'N/A';
}

function generatePreview() {
    const numPreviewRows = 15;
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

    const previewRows = Array.from({ length: numPreviewRows }, () => columns.map(generateCell));
    displayPreviewTable(columns.map(c => c.name), previewRows);
}

function displayPreviewTable(columns, rows) {
    const table = document.getElementById('previewTable');
    table.innerHTML = '';

    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col || 'Column';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

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
    const spinner = document.getElementById("loadingSpinner");
    spinner.style.display = "block";

    const totalRecords = parseInt(document.getElementById('numRecords').value);
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

    const fullDataset = Array.from({ length: totalRecords }, () => columns.map(generateCell));
    const csvContent = [columns.map(c => c.name).join(','), ...fullDataset.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dataset.csv';
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => spinner.style.display = "none", 500);
}
