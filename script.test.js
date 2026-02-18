/**
 * @jest-environment jsdom
 */

const { parseCSV, parseCSVLine } = require('./script.js');

describe('CSV Parsing', () => {
    describe('parseCSVLine', () => {
        test('should parse simple CSV line', () => {
            const line = 'field1,field2,field3';
            const result = parseCSVLine(line);
            expect(result).toEqual(['field1', 'field2', 'field3']);
        });

        test('should parse CSV line with quoted fields', () => {
            const line = '"field1","field2","field3"';
            const result = parseCSVLine(line);
            expect(result).toEqual(['field1', 'field2', 'field3']);
        });

        test('should handle commas inside quoted fields', () => {
            const line = '"field1, with comma","field2","field3"';
            const result = parseCSVLine(line);
            expect(result).toEqual(['field1, with comma', 'field2', 'field3']);
        });

        test('should handle escaped quotes inside quoted fields', () => {
            const line = '"field with ""quotes""","normal field"';
            const result = parseCSVLine(line);
            expect(result).toEqual(['field with "quotes"', 'normal field']);
        });

        test('should handle empty fields', () => {
            const line = 'field1,,field3';
            const result = parseCSVLine(line);
            expect(result).toEqual(['field1', '', 'field3']);
        });

        test('should trim whitespace from fields', () => {
            const line = ' field1 , field2 , field3 ';
            const result = parseCSVLine(line);
            expect(result).toEqual(['field1', 'field2', 'field3']);
        });
    });

    describe('parseCSV', () => {
        test('should parse complete CSV with headers', () => {
            const csv = `question,answer,tags
"Question 1","Answer 1","TAG1"
"Question 2","Answer 2","TAG2"`;
            
            const result = parseCSV(csv);
            
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                question: 'Question 1',
                answer: 'Answer 1',
                tags: 'TAG1'
            });
            expect(result[1]).toEqual({
                question: 'Question 2',
                answer: 'Answer 2',
                tags: 'TAG2'
            });
        });

        test('should handle CSV with all fields from problem statement', () => {
            const csv = `question,answer,tags,Source Text,Source Link
"Are the ""0"" faces of the ten-sided dice included with the game intended to represent the result of a ""10""? ","Yes, the ""0"" face is a ""10"" result. ",GENERAL,Living Rules Reference,https://example.com`;
            
            const result = parseCSV(csv);
            
            expect(result).toHaveLength(1);
            expect(result[0].question).toContain('ten-sided dice');
            expect(result[0].answer).toContain('"0" face is a "10" result');
            expect(result[0].tags).toBe('GENERAL');
            expect(result[0]['Source Text']).toBe('Living Rules Reference');
            expect(result[0]['Source Link']).toBe('https://example.com');
        });

        test('should skip empty lines', () => {
            const csv = `question,answer
"Question 1","Answer 1"

"Question 2","Answer 2"`;
            
            const result = parseCSV(csv);
            expect(result).toHaveLength(2);
        });

        test('should handle CSV with different number of fields gracefully', () => {
            const csv = `question,answer,tags
"Question 1","Answer 1","TAG1"
"Question 2","Answer 2"
"Question 3","Answer 3","TAG3"`;
            
            const result = parseCSV(csv);
            // Should only include rows with matching field count
            expect(result).toHaveLength(2);
        });
    });
});

describe('DOM Filtering Functions', () => {
    let mockSearchInput, mockSourceFilter, mockTagFilter, mockQAContainer, mockResultsCount;

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <input id="search" type="text" />
            <select id="source-filter">
                <option value="">All Sources</option>
            </select>
            <select id="tag-filter">
                <option value="">All Tags</option>
            </select>
            <div id="qa-container"></div>
            <span id="results-count"></span>
        `;

        // Mock the module to reinitialize with test DOM
        jest.resetModules();
    });

    test('should have DOM elements available', () => {
        expect(document.getElementById('search')).toBeTruthy();
        expect(document.getElementById('source-filter')).toBeTruthy();
        expect(document.getElementById('tag-filter')).toBeTruthy();
    });
});

describe('Data Structure Validation', () => {
    test('should validate expected CSV structure from problem statement', () => {
        const expectedHeaders = ['question', 'answer', 'tags', 'Source Text', 'Source Link'];
        const csv = `${expectedHeaders.join(',')}\n"Q1","A1","TAG1","Source1","http://example.com"`;
        
        const result = parseCSV(csv);
        
        expect(result).toHaveLength(1);
        expectedHeaders.forEach(header => {
            expect(result[0]).toHaveProperty(header);
        });
    });

    test('should handle real-world TI4 Q&A data', () => {
        const csv = `question,answer,tags,Source Text,Source Link
"How should a space combat be resolved if it is mathematically impossible for either side to win for example, certain configurations of ships using the ""Non-Euclidean Shielding"" and ""Duranium Armor"" technologies in concert? ","If neither side has the potential to win, the attacker must retreat. If they cannot retreat, their units in the combat are destroyed. ",GENERAL,Living Rules Reference,https://images-cdn.fantasyflightgames.com/filer_public/da/df/dadf9f07-78f3-43ac-9cce-dd6b55b24ec2/ti4_living_rules_reference_v1_3_web.pdf`;
        
        const result = parseCSV(csv);
        
        expect(result).toHaveLength(1);
        expect(result[0].question).toContain('Non-Euclidean Shielding');
        expect(result[0].answer).toContain('attacker must retreat');
        expect(result[0].tags).toBe('GENERAL');
    });
});
