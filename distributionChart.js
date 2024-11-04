let distributionChart;

function updateDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Destroy the chart if it already exists (for updates)
    if (distributionChart) {
        distributionChart.destroy();
    }

    // Set up histogram-style data for the distribution
    const labels = Array.from(new Set(data)).sort((a, b) => a - b);
    const counts = labels.map(label => data.filter(value => value === label).length);

    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: counts,
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
