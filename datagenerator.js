let columnCount = 0;

function addColumn() {
    columnCount++;
    const container = document.getElementById("columnContainer");

    const div = document.createElement("div");
    div.classList.add("column-settings");

    div.innerHTML = `
        <h3>Column ${columnCount}</h3>
        <label>Column Name:</label>
        <input type="text" name="colName${columnCount}" placeholder="Enter column name" oninput="generateFullDataset()" aria-label="Column name">

        <label>Data Type:</label>
        <select name="colType${columnCount}" onchange="configureColumnOptions(${columnCount}, this.value);" aria-label="Data type">
            <option value="textCategory">Text/Category</option>
            <option value="integer">Integer</option>
            <option value="float">Float</option>
            <option value="date">Date</option>
        </select>

        <div id="colOptions${columnCount}" class="options-container"></div>
    `;
    container.appendChild(div);
    generateFullDataset(); // Generate dataset preview on column addition
}

function configureColumnOptions(colNum, type) {
    const optionsDiv = document.getElementById(`colOptions${colNum}`);
    optionsDiv.innerHTML = ""; // Clear previous options

    // Display relevant options based on selected data type
    if (type === "textCategory") {
        optionsDiv.innerHTML = `
            <label>Values (comma-separated):</label>
            <input type="text" name="values${colNum}" placeholder="e.g., A, B, C" oninput="generateFullDataset()">
            <label>Probabilities (comma-separated, matching values):</label>
            <input type="text" name="probabilities${colNum}" placeholder="e.g., 0.5, 0.3, 0.2" oninput="generateFullDataset()">
        `;
    } else if (type === "integer" || type === "float") {
        optionsDiv.innerHTML = `
            <label>Distribution:</label>
            <select name="distribution${colNum}" onchange="configureDistributionOptions(${colNum}, this.value); generateFullDataset();">
                <option value="uniform">Uniform</option>
                <option value="normal">Normal</option>
                <option value="exponential">Exponential</option>
                <option value="binomial">Binomial</option>
            </select>
            <div id="distributionOptions${colNum}" class="distribution-options"></div>
        `;
        configureDistributionOptions(colNum, "uniform"); // Default to uniform distribution
    } else if (type === "date") {
        optionsDiv.innerHTML = `
            <label>Start Date:</label>
            <input type="date" name="startDate${colNum}" oninput="generateFullDataset()">
            <label>End Date:</label>
            <input type="date" name="endDate${colNum}" oninput="generateFullDataset()">
        `;
    }
}

function configureDistributionOptions(colNum, distribution) {
    const distributionDiv = document.getElementById(`distributionOptions${colNum}`);
    distributionDiv.innerHTML = ""; // Clear previous distribution options

    // Show additional fields based on the chosen distribution
    if (distribution === "uniform") {
        distributionDiv.innerHTML = `
            <label>Min:</label>
            <input type="number" name="min${colNum}" placeholder="Minimum value" oninput="generateFullDataset()">
            <label>Max:</label>
            <input type="number" name="max${colNum}" placeholder="Maximum value" oninput="generateFullDataset()">
        `;
    } else if (distribution === "normal") {
        distributionDiv.innerHTML = `
            <label>Mean:</label>
            <input type="number" name="mean${colNum}" placeholder="Mean" oninput="generateFullDataset()">
            <label>Standard Deviation:</label>
            <input type="number" name="stddev${colNum}" placeholder="Standard Deviation" oninput="generateFullDataset()">
        `;
    } else if (distribution === "exponential") {
        distributionDiv.innerHTML = `
            <label>Rate (λ):</label>
            <input type="number" name="rate${colNum}" placeholder="Rate (lambda)" oninput="generateFullDataset()">
        `;
    } else if (distribution === "binomial") {
        distributionDiv.innerHTML = `
            <label>Trials (n):</label>
            <input type="number" name="trials${colNum}" placeholder="Number of trials" oninput="generateFullDataset()">
            <label>Probability of Success (p):</label>
            <input type="number" name="probability${colNum}" placeholder="Probability" step="0.01" oninput="generateFullDataset()">
        `;
    }
}

// The rest of your code for generating cells, previewing, and updating the distribution chart remains the same
// Replace 'generatePreview()' calls with 'generateFullDataset()' for updating previews and charts based on the full dataset


function generateCell(col) {
    // Implementation of generateCell remains the same
    // Generates values based on column type and distribution
}

function generateFullDataset() {
    const numObservations = parseInt(document.getElementById("numObservations").value) || 50;
    const columns = [];
    let distributionData = [];

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

    // Generate the full dataset for all specified observations
    const fullDataset = Array.from({ length: numObservations }, () => {
        return columns.map(col => {
            const cellValue = generateCell(col);
            if (col.type === 'integer' || col.type === 'float') {
                distributionData.push(cellValue); // Collect numerical data for the chart
            }
            return cellValue;
        });
    });

    // Display preview of the first 15 rows
    displayPreviewTable(columns.map(c => c.name), fullDataset.slice(0, 15));

    // Update chart with the complete dataset
    if (distributionData.length > 0) {
        updateDistributionChart(distributionData);
    }
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
