import Papa from 'papaparse';
import fs from 'fs';

async function processTransactions(csvFilePath) {
    //const text = await csvFile.text();
    const text = fs.readFileSync(csvFilePath, 'utf-8');

    const result = Papa.parse(text, {
        header: true,  // Use first row as column names
        dynamicTyping: true,  // Auto-convert numbers
        skipEmptyLines: true,
        transformHeader: (header) => {
            return header
                .trim()
                .split(/\s+/)  // Split on whitespace
                .map((word, index) => {
                    // First word stays lowercase, capitalize first letter of subsequent words
                    if (index === 0) return word.toLowerCase();
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join('');
        }
    });

    console.log(result)

    const transactions = result.data;

    console.log(transactions)
    // Now you have an array of objects like:
    // [
    //   { Date: '2024-12-01', Description: 'Transfer to Corp B', Amount: -5000 },
    //   { Date: '2024-12-02', Description: 'Office Supplies', Amount: -150 },
    //   ...
    // ]

    // Categorize them
    const interCorpTransfers = transactions.filter(t =>
        t.Description.includes('Transfer to') || t.Description.includes('Transfer from')
    );

    const expenses = transactions.filter(t =>
        t.Amount < 0 && !isInterCorp(t)
    );

    return { interCorpTransfers, expenses };
}

processTransactions('./transactions-account.csv')