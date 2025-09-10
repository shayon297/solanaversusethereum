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

    // Helper function to calculate rolling 90-day average
    function calculateRolling90DayAverage(data) {
        if (data.length < 90) return data; // Return original if not enough data
        
        const rollingData = [];
        for (let i = 89; i < data.length; i++) { // Start from 90th element (index 89)
            const sum = data.slice(i - 89, i + 1).reduce((acc, item) => acc + item.value, 0);
            const average = sum / 90;
            rollingData.push({
                date: data[i].date,
                value: average
            });
        }
        return rollingData;
    }

    // Helper function to format labels with year changes
    function formatLabelsWithYear(dates) {
        if (dates.length === 0) return [];
        
        const seenYears = new Set();
        
        return dates.map((dateStr, index) => {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0 = January
            const isFirstOccurrenceOfYear = !seenYears.has(year);
            
            if (isFirstOccurrenceOfYear) {
                seenYears.add(year);
                // Always show year for first occurrence of any year
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } else {
                // Regular format without year for subsequent dates in same year
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        });
    }

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
            // Load Solana REV data with cache busting
            const timestamp = new Date().getTime();
            const solanaResponse = await fetch(`REV Charts/Solana REV.csv?t=${timestamp}`);
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const line = solanaLines[i].trim();
                if (!line) continue;
                
                // Handle CSV parsing more carefully for quoted values
                const parts = line.split(',');
                if (parts.length < 2) continue;
                
                const time = parts[0].trim();
                const rev = parts[1].trim();
                const dateObj = new Date(time);
                
                // Filter to start from June 2024 (H1 2024)
                if (dateObj >= new Date('2024-06-01')) {
                    // Convert ISO date to YYYY-MM-DD format
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    // Parse dollar value by removing $ and commas and quotes
                    const cleanValue = rev.replace(/[$,"\s]/g, '');
                    const numericValue = parseFloat(cleanValue);
                    
                    if (!isNaN(numericValue)) {
                        solanaData.push({
                            date: formattedDate,
                            value: numericValue
                        });
                    }
                }
            }
            
            // Load Ethereum REV data with cache busting
            const ethereumResponse = await fetch(`REV Charts/Ethereum REV.csv?t=${timestamp}`);
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const line = ethereumLines[i].trim();
                if (!line) continue;
                
                // Handle CSV parsing more carefully for quoted values
                const parts = line.split(',');
                if (parts.length < 2) continue;
                
                const time = parts[0].trim();
                const rev = parts[1].trim();
                const dateObj = new Date(time);
                
                // Filter to start from June 2024 (H1 2024)
                if (dateObj >= new Date('2024-06-01')) {
                    // Convert ISO date to YYYY-MM-DD format
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    // Parse dollar value by removing $ and commas and quotes
                    const cleanValue = rev.replace(/[$,"\s]/g, '');
                    const numericValue = parseFloat(cleanValue);
                    
                    if (!isNaN(numericValue)) {
                        ethereumData.push({
                            date: formattedDate,
                            value: numericValue
                        });
                    }
                }
            }
            
            // Sort by date (oldest first) for proper rolling average calculation
            solanaData.sort((a, b) => new Date(a.date) - new Date(b.date));
            ethereumData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Apply rolling 90-day averages
            const solanaRolling = calculateRolling90DayAverage(solanaData);
            const ethereumRolling = calculateRolling90DayAverage(ethereumData);
            
            // Debug logging
            console.log('REV Data loaded:');
            console.log('Solana raw data points:', solanaData.length);
            console.log('Ethereum raw data points:', ethereumData.length);
            if (solanaData.length > 0) {
                console.log('Solana sample raw values:', solanaData.slice(-3));
            }
            if (ethereumData.length > 0) {
                console.log('Ethereum sample raw values:', ethereumData.slice(-3));
            }
            console.log('Solana rolling data points:', solanaRolling.length);
            console.log('Ethereum rolling data points:', ethereumRolling.length);
            if (solanaRolling.length > 0) {
                console.log('Sample Solana rolling value:', JSON.stringify(solanaRolling[solanaRolling.length - 1]));
                console.log('Solana rolling value type:', typeof solanaRolling[solanaRolling.length - 1].value);
            }
            if (ethereumRolling.length > 0) {
                console.log('Sample Ethereum rolling value:', JSON.stringify(ethereumRolling[ethereumRolling.length - 1]));
                console.log('Ethereum rolling value type:', typeof ethereumRolling[ethereumRolling.length - 1].value);
            }
            
            return { solana: solanaRolling, ethereum: ethereumRolling };
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

        // Check if chart element exists
        const chartElement = document.getElementById('combined-rev');
        if (!chartElement) {
            console.error('REV Chart element "combined-rev" not found in DOM');
            return;
        }

        // Extract dates and values with year-aware formatting
        const solanaLabels = formatLabelsWithYear(revData.solana.map(d => d.date));
        const solanaValues = revData.solana.map(d => d.value / 1000000); // Convert to millions
        
        const ethereumLabels = formatLabelsWithYear(revData.ethereum.map(d => d.date));
        const ethereumValues = revData.ethereum.map(d => d.value / 1000000); // Convert to millions

        // Debug the chart data
        console.log('REV Chart data:');
        console.log('Solana labels length:', solanaLabels.length);
        console.log('Solana values length:', solanaValues.length);
        console.log('Solana sample values:', solanaValues.slice(-3));
        console.log('Ethereum labels length:', ethereumLabels.length);
        console.log('Ethereum values length:', ethereumValues.length);
        console.log('Ethereum sample values:', ethereumValues.slice(-3));

        // Use linear Y-axis for standard comparison
        const yAxisConfig = {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Revenue ($ Millions)'
            },
            ticks: {
                maxTicksLimit: 5, // Reduce tick density by half
                callback: function(value) {
                    return '$' + value.toFixed(1) + 'M';
                }
            }
        };

        // Create Combined REV Chart
        new Chart(document.getElementById('combined-rev'), {
            type: 'bar',
            data: {
                labels: solanaLabels, // Use Solana labels as primary
                datasets: [{
                    label: 'Solana REV ($M)',
                    data: solanaValues,
                    backgroundColor: solanaColorLight,
                    borderColor: solanaColor,
                    borderWidth: 1
                }, {
                    label: 'Ethereum REV ($M)',
                    data: ethereumValues,
                    backgroundColor: ethereumColorLight,
                    borderColor: ethereumColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartDefaults,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(1) + 'M';
                            }
                        }
                    }
                },
                scales: {
                    y: yAxisConfig,
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
            
            // Apply rolling 90-day averages
            const solanaRolling = calculateRolling90DayAverage(solanaData);
            const ethereumRolling = calculateRolling90DayAverage(ethereumData);
            
            return { solana: solanaRolling, ethereum: ethereumRolling };
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
        const solanaLabels = formatLabelsWithYear(appRevData.solana.map(d => d.date));
        const solanaValues = appRevData.solana.map(d => d.value / 1000000); // Convert to millions
        
        const ethereumLabels = formatLabelsWithYear(appRevData.ethereum.map(d => d.date));
        const ethereumValues = appRevData.ethereum.map(d => d.value / 1000000); // Convert to millions

        // Use linear Y-axis for standard comparison
        const yAxisConfig = {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Revenue ($ Millions)'
            },
            ticks: {
                maxTicksLimit: 5, // Reduce tick density by half
                callback: function(value) {
                    return '$' + value.toFixed(1) + 'M';
                }
            }
        };

        // Create Combined App Revenue Chart
        new Chart(document.getElementById('combined-app-rev'), {
            type: 'bar',
            data: {
                labels: solanaLabels, // Use Solana labels as primary
                datasets: [{
                    label: 'Solana App Revenue ($M)',
                    data: solanaValues,
                    backgroundColor: solanaColorLight,
                    borderColor: solanaColor,
                    borderWidth: 1
                }, {
                    label: 'Ethereum App Revenue ($M)',
                    data: ethereumValues,
                    backgroundColor: ethereumColorLight,
                    borderColor: ethereumColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartDefaults,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(1) + 'M';
                            }
                        }
                    }
                },
                scales: {
                    y: yAxisConfig,
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
                            text: 'REV - 90-Day Rolling Average ($ Millions)'
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
            const solanaResponse = await fetch('DEX Volumes/Solana DEX Volumes.csv');
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const columns = solanaLines[i].split(',');
                const timestamp = columns[0];
                const date = columns[1];
                
                // Sum all DEX volumes (columns 2 onwards)
                let totalVolume = 0;
                for (let j = 2; j < columns.length; j++) {
                    const volume = parseFloat(columns[j]);
                    if (!isNaN(volume)) {
                        totalVolume += volume;
                    }
                }
                
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    solanaData.push({
                        date: date,
                        value: totalVolume
                    });
                }
            }
            
            // Load Ethereum DEX Volume data
            const ethereumResponse = await fetch('DEX Volumes/Ethereum DEX Volumes.csv');
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const columns = ethereumLines[i].split(',');
                const timestamp = columns[0];
                const date = columns[1];
                
                // Sum all DEX volumes (columns 2 onwards)
                let totalVolume = 0;
                for (let j = 2; j < columns.length; j++) {
                    const volume = parseFloat(columns[j]);
                    if (!isNaN(volume)) {
                        totalVolume += volume;
                    }
                }
                
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    ethereumData.push({
                        date: date,
                        value: totalVolume
                    });
                }
            }
            
            // Apply rolling 90-day averages
            const solanaRolling = calculateRolling90DayAverage(solanaData);
            const ethereumRolling = calculateRolling90DayAverage(ethereumData);
            
            return { solana: solanaRolling, ethereum: ethereumRolling };
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

        // Extract dates and values with year-aware formatting
        const solanaLabels = formatLabelsWithYear(dexData.solana.map(d => d.date));
        const solanaValues = dexData.solana.map(d => d.value / 1000000); // Convert to millions
        
        const ethereumLabels = formatLabelsWithYear(dexData.ethereum.map(d => d.date));
        const ethereumValues = dexData.ethereum.map(d => d.value / 1000000); // Convert to millions

        // Use linear Y-axis with reduced ticks
        const yAxisConfig = {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Volume ($ Millions)'
            },
            ticks: {
                maxTicksLimit: 5, // Reduce tick density by half
                callback: function(value) {
                    return '$' + value.toFixed(1) + 'M';
                }
            }
        };

        // Create Combined DEX Volume Chart
        new Chart(document.getElementById('combined-dex'), {
            type: 'bar',
            data: {
                labels: solanaLabels, // Use Solana labels as primary
                datasets: [{
                    label: 'Solana DEX Volume ($M)',
                    data: solanaValues,
                    backgroundColor: solanaColorLight,
                    borderColor: solanaColor,
                    borderWidth: 1
                }, {
                    label: 'Ethereum DEX Volume ($M)',
                    data: ethereumValues,
                    backgroundColor: ethereumColorLight,
                    borderColor: ethereumColor,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartDefaults,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(1) + 'M';
                            }
                        }
                    }
                },
                scales: {
                    y: yAxisConfig,
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
    // Load AFPU data from CSV files
    async function loadAFPUData() {
        try {
            // Load Solana AFPU data
            const solanaResponse = await fetch('AFPU/Average Transaction Fee Solana.csv');
            const solanaText = await solanaResponse.text();
            const solanaLines = solanaText.trim().split('\n');
            
            const solanaData = [];
            for (let i = 1; i < solanaLines.length; i++) {
                const [date, afpu] = solanaLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    solanaData.push({
                        date: date,
                        value: parseFloat(afpu)
                    });
                }
            }

            // Load Ethereum AFPU data
            const ethereumResponse = await fetch('AFPU/Average transaction fee Ethereum.csv');
            const ethereumText = await ethereumResponse.text();
            const ethereumLines = ethereumText.trim().split('\n');
            
            const ethereumData = [];
            for (let i = 1; i < ethereumLines.length; i++) {
                const [date, afpu] = ethereumLines[i].split(',');
                const dateObj = new Date(date);
                // Filter to start from July 2024
                if (dateObj >= new Date('2024-07-01')) {
                    ethereumData.push({
                        date: date,
                        value: parseFloat(afpu)
                    });
                }
            }

            return { solana: solanaData, ethereum: ethereumData };
        } catch (error) {
            console.error('Error loading AFPU data:', error);
            return null;
        }
    }

    // Initialize AFPU charts
    async function initializeAFPUCharts() {
        const data = await loadAFPUData();
        if (!data) {
            console.error('Failed to load AFPU data');
            return;
        }

        // Use linear Y-axis with reduced ticks
        const yAxisConfig = {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Average Transaction Cost ($)'
            },
            ticks: {
                maxTicksLimit: 5, // Reduce tick density by half
                callback: function(value) {
                    return '$' + value.toFixed(3);
                }
            }
        };

        // Create Combined AFPU Chart
        const solanaLabels = formatLabelsWithYear(data.solana.map(d => d.date));
        new Chart(document.getElementById('combined-afpu'), {
            type: 'line',
            data: {
                labels: solanaLabels, // Use Solana labels as primary
                datasets: [{
                    label: 'Solana Avg Transaction Cost ($)',
                    data: data.solana.map(d => d.value),
                    borderColor: solanaColor,
                    backgroundColor: solanaColorLight,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6
                }, {
                    label: 'Ethereum Avg Transaction Cost ($)',
                    data: data.ethereum.map(d => d.value),
                    borderColor: ethereumColor,
                    backgroundColor: ethereumColorLight,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...chartDefaults,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(3);
                            }
                        }
                    }
                },
                scales: {
                    y: yAxisConfig,
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

    // Initialize individual Transaction charts
    async function initializeTransactionCharts() {
        const data = await loadTransactionData();
        if (!data) {
            console.error('Failed to load transaction data');
            return;
        }

        // Use linear Y-axis with reduced ticks
        const yAxisConfig = {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Daily Transactions (Millions)'
            },
            ticks: {
                maxTicksLimit: 5, // Reduce tick density by half
                callback: function(value) {
                    return value.toFixed(1) + 'M';
                }
            }
        };

        // Create Combined Transactions Chart
        const solanaLabels = formatLabelsWithYear(data.solana.map(d => d.date));
        new Chart(document.getElementById('combined-transactions'), {
            type: 'line',
            data: {
                labels: solanaLabels, // Use Solana labels as primary
                datasets: [{
                    label: 'Solana Transactions (M)',
                    data: data.solana.map(d => d.value / 1000000),
                    borderColor: solanaColor,
                    backgroundColor: solanaColorLight,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6
                }, {
                    label: 'Ethereum Transactions (M)',
                    data: data.ethereum.map(d => d.value / 1000000),
                    borderColor: ethereumColor,
                    backgroundColor: ethereumColorLight,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...chartDefaults,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + 'M';
                            }
                        }
                    }
                },
                scales: {
                    y: yAxisConfig,
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

    // Initialize individual Active Addresses charts
    async function initializeActiveAddressesCharts() {
        const data = await loadActiveAddressesData();
        if (!data) {
            console.error('Failed to load active addresses data');
            return;
        }

        // Use linear Y-axis with reduced ticks and smart formatting
        const yAxisConfig = {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Daily Active Addresses'
            },
            ticks: {
                maxTicksLimit: 5, // Reduce tick density by half
                callback: function(value) {
                    if (value >= 1000) {
                        return (value / 1000).toFixed(1) + 'M';
                    } else {
                        return value.toFixed(0) + 'K';
                    }
                }
            }
        };

        // Create Combined Active Addresses Chart
        const solanaLabels = formatLabelsWithYear(data.solana.map(d => d.date));
        new Chart(document.getElementById('combined-addresses'), {
            type: 'line',
            data: {
                labels: solanaLabels, // Use Solana labels as primary
                datasets: [{
                    label: 'Solana Active Addresses',
                    data: data.solana.map(d => d.value / 1000),
                    borderColor: solanaColor,
                    backgroundColor: solanaColorLight,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6
                }, {
                    label: 'Ethereum Active Addresses',
                    data: data.ethereum.map(d => d.value / 1000),
                    borderColor: ethereumColor,
                    backgroundColor: ethereumColorLight,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...chartDefaults,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                if (value >= 1000) {
                                    return context.dataset.label + ': ' + (value / 1000).toFixed(1) + 'M';
                                } else {
                                    return context.dataset.label + ': ' + value.toFixed(0) + 'K';
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: yAxisConfig,
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
                            text: 'DEX Volume - 90-Day Rolling Average (Billions USD)'
                        }
                    }
                }
            }
        });
    }

    // Initialize all charts
    initializeREVCharts();
    initializeAppRevenueCharts();
    initializeAFPUCharts();
    initializeTransactionCharts();
    initializeActiveAddressesCharts();
    initializeDEXVolumeCharts();
    
    console.log('All charts initialized successfully');
});
