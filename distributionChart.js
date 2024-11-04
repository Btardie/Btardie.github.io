let distributionChart;

function initializeEmptyChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
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
                    max: 10 // Set fixed maximum for y-axis, adjust as needed
                }
            },
            plugins: {
                legend: { display: true }
            }
        }
    });
}

function updateDistributionChart(data) {
    if (!distributionChart) {
        initializeEmptyChart();
    }

    if (data.length > 0) {
        const numBins = Math.ceil(Math.sqrt(data.length) * 1.5);
        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const binWidth = (maxValue - minValue) / numBins;

        const bins = Array(numBins).fill(0);
        data.forEach(value => {
            const binIndex = Math.min(numBins - 1, Math.floor((value - minValue) / binWidth));
            bins[binIndex]++;
        });

        const labels = Array.from({ length: numBins }, (_, i) => 
            (minValue + binWidth * i + binWidth / 2).toFixed(2)
        );

        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((a, b) => a + (b - mean) ** 2, 0) / data.length;
        const stddev = Math.sqrt(variance);
        const normalCurve = labels.map(x => {
            const value = parseFloat(x);
            const normalDensity = (1 / (stddev * Math.sqrt(2 * Math.PI))) * 
                                  Math.exp(-0.5 * ((value - mean) / stddev) ** 2);
            return normalDensity * data.length * binWidth;
        });

        distributionChart.data.labels = labels;
        distributionChart.data.datasets[0].data = bins;

        // Optional: Normal curve overlay
        if (distributionChart.data.datasets.length === 1) {
            distributionChart.data.datasets.push({
                label: 'Normal Distribution',
                data: normalCurve,
                type: 'line',
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                pointRadius: 0,
            });
        } else {
            distributionChart.data.datasets[1].data = normalCurve;
        }

        distributionChart.update();
    } else {
        distributionChart.data.labels = [];
        distributionChart.data.datasets[0].data = [];
        distributionChart.update();
    }
}

// Initialize with an empty chart on load
initializeEmptyChart();
