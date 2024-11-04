let distributionChart;

function updateDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Destroy the existing chart if it exists
    if (distributionChart) {
        distributionChart.destroy();
    }

    // Set a fixed number of bins for the histogram
    const numBins = 20; // You can adjust this to control the resolution of the histogram
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

    // Create the chart with no dynamic scaling
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
                    max: Math.max(...bins), // Fixed y-axis based on the highest bin count
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}
