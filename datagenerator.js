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

    if (type === "integer" || type === "float") {
        optionsDiv.innerHTML = `
            <label>Distribution:</label>
            <select name="distribution${colNum}" onchange="configureDistributionOptions(${colNum}, this.value)">
                <option value="uniform">Uniform</option>
                <option value="normal">Normal</option>
                <option value="exponential">Exponential</option>
                <option value="binomial">Binomial</option>
            </select>
            <div id="distributionOptions${colNum}" class="distribution-options"></div>
        `;
        configureDistributionOptions(colNum, "uniform"); // Default to uniform distribution
    } else if (type === "text" || type === "category") {
        optionsDiv.innerHTML = `
            <label>Values (comma-separated):</label>
            <input type="text" name="values${colNum}" placeholder="e.g., A, B, C" oninput="generatePreview()">
            <label>Probabilities (comma-separated, matching values):</label>
            <input type="text" name="probabilities${colNum}" placeholder="e.g., 0.5, 0.3, 0.2" oninput="generatePreview()">
        `;
    } else if (type === "date") {
        optionsDiv.innerHTML = `
            <label>Start Date:</label>
            <input type="date" name="startDate${colNum}" oninput="generatePreview()">
            <label>End Date:</label>
            <input type="date" name="endDate${colNum}" oninput="generatePreview()">
        `;
    }
}

function configureDistributionOptions(colNum, distribution) {
    const distributionDiv = document.getElementById(`distributionOptions${colNum}`);
    distributionDiv.innerHTML = "";

    if (distribution === "uniform") {
        distributionDiv.innerHTML = `
            <label>Min:</label>
            <input type="number" name="min${colNum}" placeholder="Minimum value" oninput="generatePreview()">
            <label>Max:</label>
            <input type="number" name="max${colNum}" placeholder="Maximum value" oninput="generatePreview()">
        `;
    } else if (distribution === "normal") {
        distributionDiv.innerHTML = `
            <label>Mean:</label>
            <input type="number" name="mean${colNum}" placeholder="Mean" oninput="generatePreview()">
            <label>Standard Deviation:</label>
            <input type="number" name="stddev${colNum}" placeholder="Standard Deviation" oninput="generatePreview()">
        `;
    } else if (distribution === "exponential") {
        distributionDiv.innerHTML = `
            <label>Rate (λ):</label>
            <input type="number" name="rate${colNum}" placeholder="Rate (lambda)" oninput="generatePreview()">
        `;
    } else if (distribution === "binomial") {
        distributionDiv.innerHTML = `
            <label>Trials (n):</label>
            <input type="number" name="trials${colNum}" placeholder="Number of trials" oninput="generatePreview()">
            <label>Probability of Success (p):</label>
            <input type="number" name="probability${colNum}" placeholder="Probability" step="0.01" oninput="generatePreview()">
        `;
    }
}

function generateCell(col) {
    const distribution = col.options.querySelector(`select[name="distribution${col.colNum}"]`)?.value;
    const isInteger = col.type === "integer";

    if (distribution === "uniform") {
        const min = parseFloat(col.options.querySelector(`[name="min${col.colNum}"]`)?.value) || 0;
        const max = parseFloat(col.options.querySelector(`[name="max${col.colNum}"]`)?.value) || 100;
        const value = Math.random() * (max - min) + min;
        return isInteger ? Math.floor(value) : parseFloat(value.toFixed(2));
    } else if (distribution === "normal") {
        const mean = parseFloat(col.options.querySelector(`[name="mean${col.colNum}"]`)?.value) || 0;
        const stddev = parseFloat(col.options.querySelector(`[name="stddev${col.colNum}"]`)?.value) || 1;
        const value = mean + (randomNormal() * stddev);
        return isInteger ? Math.round(value) : parseFloat(value.toFixed(2));
    } else if (distribution === "exponential") {
        const rate = parseFloat(col.options.querySelector(`[name="rate${col.colNum}"]`)?.value) || 1;
        const value = -Math.log(1 - Math.random()) / rate;
        return isInteger ? Math.floor(value) : parseFloat(value.toFixed(2));
    } else if (distribution === "binomial") {
        const trials = parseInt(col.options.querySelector(`[name="trials${col.colNum}"]`)?.value) || 1;
        const probability = parseFloat(col.options.querySelector(`[name="probability${col.colNum}"]`)?.value) || 0.5;
        const value = randomBinomial(trials, probability);
        return isInteger ? Math.floor(value) : parseFloat(value.toFixed(2));
    }
    return 'N/A';
}

// Helper function to generate a normally distributed random number using Box-Muller transform
function randomNormal() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Helper function to generate a binomially distributed random number
function randomBinomial(trials, probability) {
    let successes = 0;
    for (let i = 0; i < trials; i++) {
        if (Math.random() < probability) successes++;
    }
    return successes;
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
