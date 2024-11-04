let distributionChart;

// Function to initialize an empty chart
function initializeEmptyChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // No labels initially
            datasets: [{
                label: 'Frequency',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: { display: true, text: 'Values' },
                    beginAtZero: false,
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

// Function to update the chart with new data
function updateDistributionChart(data) {
    // Check if chart exists, if not, initialize it
    if (!distributionChart) {
        initializeEmptyChart();
    }

    // Destroy and reinitialize the chart with updated data if it's not empty
    if (data.length > 0) {
        const numBins = Math.ceil(Math.sqrt(data.length) * 1.5);
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

        // Calculate normal distribution curve for overlay
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((a, b) => a + (b - mean) ** 2, 0) / data.length;
        const stddev = Math.sqrt(variance);
        const normalCurve = labels.map(x => {
            const value = parseFloat(x);
            const normalDensity = (1 / (stddev * Math.sqrt(2 * Math.PI))) * 
                                  Math.exp(-0.5 * ((value - mean) / stddev) ** 2);
            return normalDensity * data.length * binWidth;
        });

        // Update the chart data
        distributionChart.data.labels = labels;
        distributionChart.data.datasets[0].data = bins;
        
        // If you'd like the normal curve overlay, uncomment below:
        // if (distributionChart.data.datasets.length === 1) {
        //     distributionChart.data.datasets.push({
        //         label: 'Normal Distribution',
        //         data: normalCurve,
        //         type: 'line',
        //         fill: false,
        //         borderColor: 'rgba(255, 99, 132, 1)',
        //         borderWidth: 2,
        //         pointRadius: 0,
        //     });
        // } else {
        //     distributionChart.data.datasets[1].data = normalCurve;
        // }

        // Update the chart display
        distributionChart.update();
    } else {
        // If data is empty, reset the chart to empty state
        distributionChart.data.labels = [];
        distributionChart.data.datasets[0].data = [];
        distributionChart.update();
    }
}

// Initialize with an empty chart when the page loads
initializeEmptyChart();
