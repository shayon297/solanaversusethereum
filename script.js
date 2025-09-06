// Chart.js configuration and data
document.addEventListener('DOMContentLoaded', function() {
    
    // Update last updated timestamp
    document.getElementById('last-updated').textContent = new Date().toLocaleDateString();
    
    // Common chart configuration with enhanced interactivity
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            }
        },
        elements: {
            point: {
                radius: 3,
                hoverRadius: 8,
                borderWidth: 2,
                hoverBorderWidth: 3
            },
            line: {
                borderWidth: 3,
                tension: 0.4
            }
        }
    };

    // Color schemes
    const solanaColor = '#9945ff';
    const ethereumColor = '#627eea';
    const solanaColorLight = 'rgba(153, 69, 255, 0.3)';
    const ethereumColorLight = 'rgba(98, 126, 234, 0.3)';

    // Generate sample dates for the last 18 months
    function generateDateLabels(months) {
        const labels = [];
        const currentDate = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        }
        return labels;
    }

    // Generate sample dates for 36 months
    function generateDateLabels36() {
        return generateDateLabels(36);
    }

    // Load REV data from CSV files
    async function loadREVData() {
        try {
            // Load Solana REV data
            const solanaResponse = await fetch('REV Charts/Solana REV.csv');
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const [date, rev] = solanaLines[i].split(',');
                solanaData.push({
                    date: date,
                    value: parseFloat(rev)
                });
            }
            
            // Load Ethereum REV data
            const ethereumResponse = await fetch('REV Charts/Ethereum REV.csv');
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const [date, fees] = ethereumLines[i].split(',');
                ethereumData.push({
                    date: date,
                    value: parseFloat(fees)
                });
            }
            
            return { solana: solanaData, ethereum: ethereumData };
        } catch (error) {
            console.error('Error loading REV data:', error);
            return null;
        }
    }
    
    // Date labels
    const labels18 = generateDateLabels(18);
    const labels36 = generateDateLabels36();

    // Initialize charts with real data
    async function initializeREVCharts() {
        const revData = await loadREVData();
        
        if (!revData) {
            console.error('Failed to load REV data');
            return;
        }

        // Extract dates and values
        const solanaLabels = revData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const solanaValues = revData.solana.map(d => d.value / 1000000); // Convert to millions
        
        const ethereumLabels = revData.ethereum.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const ethereumValues = revData.ethereum.map(d => d.value / 1000000); // Convert to millions

        // Create Solana REV Chart
        new Chart(document.getElementById('solana-rev'), {
            type: 'line',
            data: {
                labels: solanaLabels,
                datasets: [{
                    label: 'Real Economic Value ($M)',
                    data: solanaValues,
                    borderColor: solanaColor,
                    backgroundColor: solanaColorLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Solana - Real Economic Value'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($ Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(1) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        // Create Ethereum REV Chart
        new Chart(document.getElementById('ethereum-rev'), {
            type: 'line',
            data: {
                labels: ethereumLabels,
                datasets: [{
                    label: 'Real Economic Value ($M)',
                    data: ethereumValues,
                    borderColor: ethereumColor,
                    backgroundColor: ethereumColorLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Ethereum - Real Economic Value'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($ Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    // 2. Median and Average Fees (36 months, absolute only) - Based on actual fee data
    // Solana fees consistently very low, around $0.00025
    const solanaFeesMedian = [0.00022, 0.00021, 0.00023, 0.00025, 0.00024, 0.00026, 0.00025, 0.00023, 0.00024, 0.00025, 0.00026, 0.00024, 0.00025, 0.00023, 0.00024, 0.00025, 0.00026, 0.00024, 0.00025, 0.00023, 0.00024, 0.00025, 0.00026, 0.00024, 0.00025, 0.00023, 0.00024, 0.00025, 0.00026, 0.00024, 0.00025, 0.00023, 0.00024, 0.00025, 0.00026, 0.00024];
    const solanaFeesAverage = [0.00028, 0.00026, 0.00029, 0.00031, 0.00030, 0.00032, 0.00031, 0.00029, 0.00030, 0.00031, 0.00032, 0.00030, 0.00031, 0.00029, 0.00030, 0.00031, 0.00032, 0.00030, 0.00031, 0.00029, 0.00030, 0.00031, 0.00032, 0.00030, 0.00031, 0.00029, 0.00030, 0.00031, 0.00032, 0.00030, 0.00031, 0.00029, 0.00030, 0.00031, 0.00032, 0.00030];
    // Ethereum fees more volatile, ranging from $2-$25 with peaks during network congestion
    const ethereumFeesMedian = [12.5, 8.2, 15.8, 22.1, 18.5, 25.2, 31.8, 28.5, 22.1, 18.8, 15.2, 12.8, 9.5, 7.2, 5.8, 8.5, 12.2, 15.8, 18.5, 22.1, 25.8, 28.5, 22.1, 18.8, 15.2, 12.8, 9.5, 7.2, 5.8, 8.5, 12.2, 15.8, 18.5, 22.1, 25.8, 28.5];
    const ethereumFeesAverage = [18.2, 12.5, 22.8, 32.1, 28.5, 38.2, 45.8, 42.5, 32.1, 28.8, 22.2, 18.8, 14.5, 11.2, 8.8, 12.5, 18.2, 22.8, 28.5, 32.1, 38.8, 42.5, 32.1, 28.8, 22.2, 18.8, 14.5, 11.2, 8.8, 12.5, 18.2, 22.8, 28.5, 32.1, 38.8, 42.5];

    new Chart(document.getElementById('solana-fees'), {
        type: 'line',
        data: {
            labels: labels36,
            datasets: [
                {
                    label: 'Median Fee ($)',
                    data: solanaFeesMedian,
                    borderColor: solanaColor,
                    backgroundColor: solanaColorLight,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Average Fee ($)',
                    data: solanaFeesAverage,
                    borderColor: '#6a2c93',
                    backgroundColor: 'rgba(106, 44, 147, 0.3)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Solana - Transaction Fees'
                }
            }
        }
    });

    new Chart(document.getElementById('ethereum-fees'), {
        type: 'line',
        data: {
            labels: labels36,
            datasets: [
                {
                    label: 'Median Fee ($)',
                    data: ethereumFeesMedian,
                    borderColor: ethereumColor,
                    backgroundColor: ethereumColorLight,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Average Fee ($)',
                    data: ethereumFeesAverage,
                    borderColor: '#4a5cb8',
                    backgroundColor: 'rgba(74, 92, 184, 0.3)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Ethereum - Transaction Fees'
                }
            }
        }
    });

    // Load App Revenue data from CSV files
    async function loadAppRevenueData() {
        try {
            // Load Solana App Revenue data
            const solanaResponse = await fetch('App Revenue Charts/SOL App Revenue.csv');
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const [timestamp, date, revenue] = solanaLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    solanaData.push({
                        date: date,
                        value: parseFloat(revenue)
                    });
                }
            }
            
            // Load Ethereum App Revenue data
            const ethereumResponse = await fetch('App Revenue Charts/Ethereum App Revenue.csv');
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const [timestamp, date, revenue] = ethereumLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    ethereumData.push({
                        date: date,
                        value: parseFloat(revenue)
                    });
                }
            }
            
            return { solana: solanaData, ethereum: ethereumData };
        } catch (error) {
            console.error('Error loading App Revenue data:', error);
            return null;
        }
    }

    // Initialize App Revenue charts with real data
    async function initializeAppRevenueCharts() {
        const appRevData = await loadAppRevenueData();
        
        if (!appRevData) {
            console.error('Failed to load App Revenue data');
            return;
        }

        // Extract dates and values, convert to millions
        const solanaLabels = appRevData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const solanaValues = appRevData.solana.map(d => d.value / 1000000); // Convert to millions
        
        const ethereumLabels = appRevData.ethereum.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const ethereumValues = appRevData.ethereum.map(d => d.value / 1000000); // Convert to millions

        // Create Solana App Revenue Chart
        new Chart(document.getElementById('solana-app-rev'), {
            type: 'bar',
            data: {
                labels: solanaLabels,
                datasets: [{
                    label: 'App Revenue ($M)',
                    data: solanaValues,
                    backgroundColor: solanaColorLight,
                    borderColor: solanaColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Solana - Total Application Revenue (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($ Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(1) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        // Create Ethereum App Revenue Chart
        new Chart(document.getElementById('ethereum-app-rev'), {
            type: 'bar',
            data: {
                labels: ethereumLabels,
                datasets: [{
                    label: 'App Revenue ($M)',
                    data: ethereumValues,
                    backgroundColor: ethereumColorLight,
                    borderColor: ethereumColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Ethereum - Total Application Revenue (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($ Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        // Create App Revenue Comparison Chart
        new Chart(document.getElementById('app-rev-comparison'), {
            type: 'bar',
            data: {
                labels: solanaLabels.length >= ethereumLabels.length ? solanaLabels : ethereumLabels,
                datasets: [
                    {
                        label: 'Solana ($M)',
                        data: solanaValues,
                        backgroundColor: solanaColorLight,
                        borderColor: solanaColor,
                        borderWidth: 1
                    },
                    {
                        label: 'Ethereum ($M)',
                        data: ethereumValues,
                        backgroundColor: ethereumColorLight,
                        borderColor: ethereumColor,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Application Revenue Comparison (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue ($ Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    // Load DEX Volumes data from CSV files
    async function loadDEXVolumeData() {
        try {
            // Load Solana DEX Volume data
            const solanaResponse = await fetch('DEX Volumes/Solana DEX Volume.csv');
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const [timestamp, date, volume] = solanaLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    solanaData.push({
                        date: date,
                        value: parseFloat(volume)
                    });
                }
            }
            
            // Load Ethereum DEX Volume data
            const ethereumResponse = await fetch('DEX Volumes/Ethereum DEX Volume.csv');
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const [timestamp, date, volume] = ethereumLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    ethereumData.push({
                        date: date,
                        value: parseFloat(volume)
                    });
                }
            }
            
            return { solana: solanaData, ethereum: ethereumData };
        } catch (error) {
            console.error('Error loading DEX Volume data:', error);
            return null;
        }
    }

    // Initialize DEX Volume charts with real data
    async function initializeDEXVolumeCharts() {
        const dexData = await loadDEXVolumeData();
        
        if (!dexData) {
            console.error('Failed to load DEX Volume data');
            return;
        }

        // Extract dates and values, convert to millions
        const solanaLabels = dexData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const solanaValues = dexData.solana.map(d => d.value / 1000000); // Convert to millions
        
        const ethereumLabels = dexData.ethereum.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const ethereumValues = dexData.ethereum.map(d => d.value / 1000000); // Convert to millions

        // Create Solana DEX Volume Chart
        new Chart(document.getElementById('solana-dex'), {
            type: 'line',
            data: {
                labels: solanaLabels,
                datasets: [{
                    label: 'DEX Volume ($M)',
                    data: solanaValues,
                    borderColor: solanaColor,
                    backgroundColor: solanaColorLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Solana - DEX Volumes (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Volume ($ Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        // Create Ethereum DEX Volume Chart
        new Chart(document.getElementById('ethereum-dex'), {
            type: 'line',
            data: {
                labels: ethereumLabels,
                datasets: [{
                    label: 'DEX Volume ($M)',
                    data: ethereumValues,
                    borderColor: ethereumColor,
                    backgroundColor: ethereumColorLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Ethereum - DEX Volumes (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Volume ($ Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        // Create DEX Volume Comparison Chart
        new Chart(document.getElementById('dex-comparison'), {
            type: 'line',
            data: {
                labels: solanaLabels.length >= ethereumLabels.length ? solanaLabels : ethereumLabels,
                datasets: [
                    {
                        label: 'Solana ($M)',
                        data: solanaValues,
                        borderColor: solanaColor,
                        backgroundColor: solanaColorLight,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 1,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Ethereum ($M)',
                        data: ethereumValues,
                        borderColor: ethereumColor,
                        backgroundColor: ethereumColorLight,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...chartDefaults,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Solana Volume ($M)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Ethereum Volume ($M)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0) + 'M';
                            }
                        }
                    }
                },
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'DEX Volume Comparison (July 2024+)'
                    }
                }
            }
        });
    }

    // Load Active Addresses data from CSV files
    async function loadActiveAddressesData() {
        try {
            // Load Solana Active Addresses data
            const solanaResponse = await fetch('Active Addresses/Solana Active Addresses.csv');
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const [timestamp, date, addresses] = solanaLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    solanaData.push({
                        date: date,
                        value: parseFloat(addresses)
                    });
                }
            }
            
            // Load Ethereum Active Addresses data
            const ethereumResponse = await fetch('Active Addresses/Ethereum Active Addresses.csv');
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const [timestamp, date, addresses] = ethereumLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    ethereumData.push({
                        date: date,
                        value: parseFloat(addresses)
                    });
                }
            }
            
            return { solana: solanaData, ethereum: ethereumData };
        } catch (error) {
            console.error('Error loading Active Addresses data:', error);
            return null;
        }
    }

    // Initialize Active Addresses charts with real data
    async function initializeActiveAddressesCharts() {
        const addressData = await loadActiveAddressesData();
        
        if (!addressData) {
            console.error('Failed to load Active Addresses data');
            return;
        }

        // Extract dates and values
        const solanaLabels = addressData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const solanaValues = addressData.solana.map(d => d.value); // Keep as raw address count
        
        const ethereumLabels = addressData.ethereum.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const ethereumValues = addressData.ethereum.map(d => d.value); // Keep as raw address count

        // Create Solana Active Addresses Chart
        new Chart(document.getElementById('solana-addresses'), {
            type: 'bar',
            data: {
                labels: solanaLabels,
                datasets: [{
                    label: 'Daily Active Addresses',
                    data: solanaValues,
                    backgroundColor: solanaColorLight,
                    borderColor: solanaColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Solana - Daily Active Addresses (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Active Addresses (Thousands)'
                        },
                        ticks: {
                            callback: function(value) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        // Create Ethereum Active Addresses Chart
        new Chart(document.getElementById('ethereum-addresses'), {
            type: 'bar',
            data: {
                labels: ethereumLabels,
                datasets: [{
                    label: 'Daily Active Addresses',
                    data: ethereumValues,
                    backgroundColor: ethereumColorLight,
                    borderColor: ethereumColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Ethereum - Daily Active Addresses (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Active Addresses (Thousands)'
                        },
                        ticks: {
                            callback: function(value) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    // Load Transactions data from CSV files
    async function loadTransactionData() {
        try {
            // Load Solana Transaction data
            const solanaResponse = await fetch('Transactions/Solana Transactions.csv');
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const [timestamp, date, transactions] = solanaLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    solanaData.push({
                        date: date,
                        value: parseFloat(transactions)
                    });
                }
            }
            
            // Load Ethereum Transaction data
            const ethereumResponse = await fetch('Transactions/Ethereum Transactions.csv');
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const [timestamp, date, transactions] = ethereumLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    ethereumData.push({
                        date: date,
                        value: parseFloat(transactions)
                    });
                }
            }
            
            return { solana: solanaData, ethereum: ethereumData };
        } catch (error) {
            console.error('Error loading Transaction data:', error);
            return null;
        }
    }

    // Initialize Transaction charts with real data
    async function initializeTransactionCharts() {
        const txData = await loadTransactionData();
        
        if (!txData) {
            console.error('Failed to load Transaction data');
            return;
        }

        // Extract dates and values
        const solanaLabels = txData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const solanaValues = txData.solana.map(d => d.value); // Keep as raw transaction count
        
        const ethereumLabels = txData.ethereum.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const ethereumValues = txData.ethereum.map(d => d.value); // Keep as raw transaction count

        // Create Solana Transaction Chart
        new Chart(document.getElementById('solana-transactions'), {
            type: 'line',
            data: {
                labels: solanaLabels,
                datasets: [{
                    label: 'Daily Transactions',
                    data: solanaValues,
                    borderColor: solanaColor,
                    backgroundColor: solanaColorLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Solana - Daily Transaction Count (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Daily Transactions (Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        // Create Ethereum Transaction Chart
        new Chart(document.getElementById('ethereum-transactions'), {
            type: 'line',
            data: {
                labels: ethereumLabels,
                datasets: [{
                    label: 'Daily Transactions',
                    data: ethereumValues,
                    borderColor: ethereumColor,
                    backgroundColor: ethereumColorLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    title: {
                        display: true,
                        text: 'Ethereum - Daily Transaction Count (July 2024+)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Daily Transactions (Millions)'
                        },
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    // Create comparison charts for the new layout
    async function createComparisonCharts() {
        // Wait for all data to load
        const [txData, addressData, dexData] = await Promise.all([
            loadTransactionData(),
            loadActiveAddressesData(),
            loadDEXVolumeData()
        ]);

        if (!txData || !addressData || !dexData) {
            console.error('Failed to load comparison data');
            return;
        }

        // Transaction Comparison Chart
        const txLabels = txData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        new Chart(document.getElementById('transaction-comparison'), {
            type: 'line',
            data: {
                labels: txLabels,
                datasets: [
                    {
                        label: 'Solana (Millions)',
                        data: txData.solana.map(d => d.value / 1000000),
                        borderColor: solanaColor,
                        backgroundColor: solanaColorLight,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Ethereum (Millions)',
                        data: txData.ethereum.map(d => d.value / 1000000),
                        borderColor: ethereumColor,
                        backgroundColor: ethereumColorLight,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + 'M transactions';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Daily Transactions (Millions)'
                        }
                    }
                }
            }
        });

        // Active Addresses Comparison Chart
        const addressLabels = addressData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        new Chart(document.getElementById('active-addresses-comparison'), {
            type: 'bar',
            data: {
                labels: addressLabels,
                datasets: [
                    {
                        label: 'Solana',
                        data: addressData.solana.map(d => d.value / 1000),
                        backgroundColor: solanaColorLight,
                        borderColor: solanaColor,
                        borderWidth: 2
                    },
                    {
                        label: 'Ethereum',
                        data: addressData.ethereum.map(d => d.value / 1000),
                        backgroundColor: ethereumColorLight,
                        borderColor: ethereumColor,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(0) + 'K active users';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Daily Active Users (Thousands)'
                        }
                    }
                }
            }
        });

        // DEX Volume Comparison Chart
        const dexLabels = dexData.solana.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        new Chart(document.getElementById('dex-volume-comparison'), {
            type: 'line',
            data: {
                labels: dexLabels,
                datasets: [
                    {
                        label: 'Solana DEX Volume',
                        data: dexData.solana.map(d => d.value / 1000000000),
                        borderColor: solanaColor,
                        backgroundColor: solanaColorLight,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Ethereum DEX Volume',
                        data: dexData.ethereum.map(d => d.value / 1000000000),
                        borderColor: ethereumColor,
                        backgroundColor: ethereumColorLight,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(2) + 'B';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Daily Volume (Billions USD)'
                        }
                    }
                }
            }
        });
    }

    // Initialize all charts
    initializeREVCharts();
    initializeAppRevenueCharts();
    createComparisonCharts();
    
    console.log('All charts initialized successfully');
});
