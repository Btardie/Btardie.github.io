let columnCount = 0;
let distributionChart;

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
            <option value="textCategory">Text/Category</option>
            <option value="integer">Integer</option>
            <option value="float">Float</option>
            <option value="date">Date</option>
        </select>

        <div id="colOptions${columnCount}" class="options-container"></div>
    `;
    container.appendChild(div);
    generatePreview();
}

function configureColumnOptions(colNum, type) {
    const optionsDiv = document.getElementById(`colOptions${colNum}`);
    optionsDiv.innerHTML = "";

    if (type === "textCategory") {
        optionsDiv.innerHTML = `
            <label>Values (comma-separated):</label>
            <input type="text" name="values${colNum}" placeholder="e.g., A, B, C" oninput="generatePreview()">
            <label>Probabilities (comma-separated, matching values):</label>
            <input type="text" name="probabilities${colNum}" placeholder="e.g., 0.5, 0.3, 0.2" oninput="generatePreview()">
        `;
    } else if (type === "integer" || type === "float") {
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
        configureDistributionOptions(colNum, "uniform");
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

function generatePreview() {
    const numObservations = parseInt(document.getElementById('numObservations').value) || 50; // Use all specified observations
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

    const dataset = Array.from({ length: numObservations }, () => {
        const row = columns.map(col => {
            const cellValue = generateCell(col);
            if (col.type === 'integer' || col.type === 'float') {
                distributionData.push(cellValue);
            }
            return cellValue;
        });
        return row;
    });
    
    displayPreviewTable(columns.map(c => c.name), dataset.slice(0, 15)); // Show first 15 rows for table preview only

    // Use the full dataset for distribution chart
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

function updateDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Destroy the existing chart if it exists
    if (distributionChart) {
        distributionChart.destroy();
    }

    // Define the number of bins for the histogram
    const numBins = 20;
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const binWidth = (maxValue - minValue) / numBins;

    // Create bins and populate frequencies
    const bins = Array(numBins).fill(0);
    data.forEach(value => {
        const binIndex = Math.min(numBins - 1, Math.floor((value - minValue) / binWidth));
        bins[binIndex]++;
    });

    // Define bin labels as midpoints for the bins
    const labels = Array.from({ length: numBins }, (_, i) => 
        (minValue + binWidth * i + binWidth / 2).toFixed(2)
    );

    // Create the chart
    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: bins,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: 'Values' },
                    beginAtZero: true,
                },
                y: {
                    title: { display: true, text: 'Frequency' },
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}
