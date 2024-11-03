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
            <option value="integer">Integer</option>
            <option value="float">Float</option>
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
            <label>Probabilities (comma-separated, matching text values):</label>
            <input type="text" name="textProbabilities${colNum}" placeholder="e.g., 0.5, 0.3, 0.2" oninput="generatePreview()">
        `;
    } else if (type === "integer" || type === "float") {
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
            <label>Categories:</label>
            <div id="categoryOptions${colNum}"></div>
            <button type="button" onclick="addCategoryOption(${colNum})">Add Category</button>
        `;
        addCategoryOption(colNum); // Add the first category option by default
    }
}

function addCategoryOption(colNum) {
    const categoryContainer = document.getElementById(`categoryOptions${colNum}`);
    const categoryCount = categoryContainer.children.length + 1;
    
    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("category-option");
    categoryDiv.innerHTML = `
        <label>Category ${categoryCount}:</label>
        <input type="text" name="categoryValue${colNum}_${categoryCount}" placeholder="Category value" oninput="generatePreview()">
        <label>Probability:</label>
        <input type="number" step="0.01" name="categoryProbability${colNum}_${categoryCount}" placeholder="e.g., 0.5" oninput="generatePreview()">
    `;
    categoryContainer.appendChild(categoryDiv);
}

function generateCell(col) {
    if (col.type === "text") {
        const values = col.options.querySelector(`input[name="textValues${col.colNum}"]`)?.value.split(',').map(v => v.trim());
        const probabilities = col.options.querySelector(`input[name="textProbabilities${col.colNum}"]`)?.value.split(',').map(p => parseFloat(p.trim()));
        return selectRandomValue(values, probabilities) || 'Sample Text';
    } else if (col.type === "integer" || col.type === "float") {
        const mode = col.options.querySelector(`select[name="mode${col.colNum}"]`).value;
        const isInteger = col.type === "integer";
        if (mode === "basic") {
            const min = parseFloat(col.options.querySelector(`[name="minNum${col.colNum}"]`)?.value) || 0;
            const max = parseFloat(col.options.querySelector(`[name="maxNum${col.colNum}"]`)?.value) || 100;
            const value = Math.random() * (max - min) + min;
            return isInteger ? Math.floor(value) : parseFloat(value.toFixed(2));
        } else if (mode === "advanced") {
            const mean = parseFloat(col.options.querySelector(`[name="mean${col.colNum}"]`)?.value) || 0;
            const stddev = parseFloat(col.options.querySelector(`[name="stddev${col.colNum}"]`)?.value) || 1;
            const value = (Math.random() * stddev) + mean;
            return isInteger ? Math.round(value) : parseFloat(value.toFixed(2));
        }
    } else if (col.type === "date") {
        const startDate = new Date(col.options.querySelector(`[name="startDate${col.colNum}"]`)?.value);
        const endDate = new Date(col.options.querySelector(`[name="endDate${col.colNum}"]`)?.value);
        if (isNaN(startDate) || isNaN(endDate)) return '2023-01-01';
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        return randomDate.toISOString().split('T')[0];
    } else if (col.type === "category") {
        const values = [];
        const probabilities = [];
        const categoryOptions = col.options.querySelectorAll(".category-option");
        categoryOptions.forEach(option => {
            const value = option.querySelector(`input[name^="categoryValue"]`).value.trim();
            const probability = parseFloat(option.querySelector(`input[name^="categoryProbability"]`).value) || 0;
            values.push(value);
            probabilities.push(probability);
        });
        return selectRandomValue(values, probabilities) || 'Category';
    }
    return 'N/A';
}

function selectRandomValue(values, probabilities) {
    if (!values || !probabilities || values.length !== probabilities.length) return null;
    const totalProbability = probabilities.reduce((a, b) => a + b, 0);
    const random = Math.random() * totalProbability;
    let cumulativeProbability = 0;
    for (let i = 0; i < values.length; i++) {
        cumulativeProbability += probabilities[i];
        if (random < cumulativeProbability) {
            return values[i];
        }
    }
    return values[values.length - 1];
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

