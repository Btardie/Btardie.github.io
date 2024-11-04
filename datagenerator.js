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
        <select name="colType${columnCount}" onchange="configureColumnOptions(${columnCount}, this.value); generateFullDataset();" aria-label="Data type">
            <option value="textCategory">Text/Category</option>
            <option value="integer">Integer</option>
            <option value="float">Float</option>
            <option value="date">Date</option>
        </select>

        <div id="colOptions${columnCount}" class="options-container"></div>
    `;
    container.appendChild(div);
    generateFullDataset();
}

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
