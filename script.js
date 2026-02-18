// Global variables
let qaData = [];
let filteredData = [];

// DOM elements
let searchInput, sourceFilter, tagFilter, resetButton, qaContainer, resultsCount;

// Initialize DOM elements (for browser environment)
function initializeDOMElements() {
    searchInput = document.getElementById('search');
    sourceFilter = document.getElementById('source-filter');
    tagFilter = document.getElementById('tag-filter');
    resetButton = document.getElementById('reset-filters');
    qaContainer = document.getElementById('qa-container');
    resultsCount = document.getElementById('results-count');
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }

    return data;
}

// Parse a single CSV line, handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Load CSV file
async function loadCSV() {
    try {
        const response = await fetch('rules-qa.csv');
        const csvText = await response.text();
        qaData = parseCSV(csvText);
        filteredData = qaData;
        
        populateFilterOptions();
        renderQA();
        updateResultsCount();
    } catch (error) {
        qaContainer.innerHTML = '<div class="no-results">Error loading data. Please make sure rules-qa.csv is in the same directory.</div>';
        console.error('Error loading CSV:', error);
    }
}

// Populate filter dropdowns
function populateFilterOptions() {
    const sources = new Set();
    const tags = new Set();

    qaData.forEach(item => {
        if (item['Source Text']) sources.add(item['Source Text']);
        if (item.tags) tags.add(item.tags);
    });

    // Populate source filter
    sourceFilter.innerHTML = '<option value="">All Sources</option>';
    Array.from(sources).sort().forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        sourceFilter.appendChild(option);
    });

    // Populate tag filter
    tagFilter.innerHTML = '<option value="">All Tags</option>';
    Array.from(tags).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

// Filter data
function filterData() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedSource = sourceFilter.value;
    const selectedTag = tagFilter.value;

    filteredData = qaData.filter(item => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            item.question.toLowerCase().includes(searchTerm) ||
            item.answer.toLowerCase().includes(searchTerm);

        // Source filter
        const matchesSource = selectedSource === '' || 
            item['Source Text'] === selectedSource;

        // Tag filter
        const matchesTag = selectedTag === '' || 
            item.tags === selectedTag;

        return matchesSearch && matchesSource && matchesTag;
    });

    renderQA();
    updateResultsCount();
}

// Render Q&A cards
function renderQA() {
    if (filteredData.length === 0) {
        qaContainer.innerHTML = '<div class="no-results">No results found. Try adjusting your filters.</div>';
        return;
    }

    qaContainer.innerHTML = '';
    
    filteredData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'qa-card';
        
        const question = document.createElement('div');
        question.className = 'question';
        question.textContent = item.question;
        
        const answer = document.createElement('div');
        answer.className = 'answer';
        answer.textContent = item.answer;
        
        const metadata = document.createElement('div');
        metadata.className = 'metadata';
        
        if (item.tags) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = item.tags;
            metadata.appendChild(tag);
        }
        
        if (item['Source Text']) {
            const source = document.createElement('span');
            source.className = 'source';
            
            if (item['Source Link']) {
                const link = document.createElement('a');
                link.href = item['Source Link'];
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = `Source: ${item['Source Text']}`;
                source.appendChild(link);
            } else {
                source.textContent = `Source: ${item['Source Text']}`;
            }
            
            metadata.appendChild(source);
        }
        
        card.appendChild(question);
        card.appendChild(answer);
        card.appendChild(metadata);
        qaContainer.appendChild(card);
    });
}

// Update results count
function updateResultsCount() {
    const total = qaData.length;
    const showing = filteredData.length;
    
    if (total === showing) {
        resultsCount.textContent = `Showing all ${total} Q&A entries`;
    } else {
        resultsCount.textContent = `Showing ${showing} of ${total} Q&A entries`;
    }
}

// Reset filters
function resetFilters() {
    searchInput.value = '';
    sourceFilter.value = '';
    tagFilter.value = '';
    filterData();
}

// Event listeners
function initializeEventListeners() {
    searchInput.addEventListener('input', filterData);
    sourceFilter.addEventListener('change', filterData);
    tagFilter.addEventListener('change', filterData);
    resetButton.addEventListener('click', resetFilters);
}

// Initialize
function initialize() {
    if (typeof document === 'undefined') return; // Skip if not in browser
    initializeDOMElements();
    initializeEventListeners();
    loadCSV();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // Use setTimeout to allow tests to set up DOM first
        setTimeout(initialize, 0);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseCSV,
        parseCSVLine,
        filterData,
        resetFilters,
        qaData,
        filteredData,
        setQAData: (data) => { qaData = data; filteredData = data; },
        getFilteredData: () => filteredData
    };
}
