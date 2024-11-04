let distributionChart;

function updateDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Destroy the existing chart if it exists
    if (distributionChart) {
        distributionChart.destroy();
    }

    // Dynamically calculate the number of bins based on the data length (Sturges' Rule)
    const numBins = Math.ceil(Math.log2(data.length) + 1);
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const binWidth = (maxValue - minValue) / numBins;

    // Create bins and populate frequencies
    const bins = Array(numBins).fill(0);
    data.forEach(value => {
        const binIndex = Math.min(numBins - 1, Math.floor((value - minValue) / binWidth));
        bins[binIndex]++;
    });

    // Filter out empty bins and labels
    const filteredBins = bins.filter(count => count > 0);
    const labels = Array.from({ length: numBins }, (_, i) =>
        (minValue + binWidth * i + binWidth / 2).toFixed(2)
    ).filter((_, i) => bins[i] > 0);

    // Create the chart with filtered data
    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: filteredBins,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: 'Values' },
                    beginAtZero: false,
                    ticks: {
                        autoSkip: false, // Show all labels for better granularity
                    }
                },
                y: {
                    title: { display: true, text: 'Frequency' },
                    beginAtZero: true,
                    suggestedMax: Math.max(...filteredBins) + 1, // Adjust the y-axis max for better spacing
                }
            },
            plugins: {
                legend: { display: false }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
