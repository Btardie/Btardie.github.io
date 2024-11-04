let distributionChart;

function updateDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Destroy the existing chart if it exists
    if (distributionChart) {
        distributionChart.destroy();
    }

    // Dynamically calculate a higher number of bins based on data size
    const numBins = Math.ceil(Math.sqrt(data.length) * 1.5); // Square root choice, scaled for more bins
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

    // Calculate a normal distribution curve for overlay
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + (b - mean) ** 2, 0) / data.length;
    const stddev = Math.sqrt(variance);
    const normalCurve = labels.map(x => {
        const value = parseFloat(x);
        const normalDensity = (1 / (stddev * Math.sqrt(2 * Math.PI))) * 
                              Math.exp(-0.5 * ((value - mean) / stddev) ** 2);
        return normalDensity * data.length * binWidth; // Scale by bin width and data length for matching frequency
    });

    // Create the chart
    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Frequency',
                    data: bins,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Normal Distribution',
                    data: normalCurve,
                    type: 'line',
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 0, // Smooth curve without points
                }
            ]
        },
        options: {
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
                legend: { display: true }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
