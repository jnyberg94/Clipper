import Papa from 'papaparse';
import fs from 'fs';
import { standardizeTransactions } from '../processors/standardizeTransactions.js';
import { ruleEngine } from '../processors/ruleEngine.js';

async function processTransactions(csvFilePath) {
    const text = fs.readFileSync(csvFilePath, 'utf-8');

    const result = await Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
            const trimmed = header.trim();

            if (!/[\s_-]/.test(trimmed)) {
                return trimmed;
            }

            const words = trimmed.split(/[\s_-]+/);

            return words
                .map((word, index) => {
                    const match = word.match(/^([a-zA-Z0-9]+)([$€£¥]*)$/);
                    if (!match) return word.toLowerCase();

                    const [, text, symbols] = match;

                    if (index === 0) {
                        return text.toLowerCase() + symbols;
                    }
                    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() + symbols;
                })
                .join('');
        }
    });

    //console.log(result.data)
    return result.data;
}



async function pipeline() {
    const csvs = [
        {
            file: './transactions-account.csv',
            bank: 'loop'
        },
        {
            file: './download-transactions.csv',
            bank: 'rbcUsd'
        }
    ]
    const nestedData = await Promise.all(csvs.map(async (csv) => {
        const processedCsv = await processTransactions(csv.file)
        const standardizedCsv = standardizeTransactions(processedCsv, csv.bank)
        return standardizedCsv
    }))

    const cleanedData = nestedData.flat()

    const rules = await ruleEngine(cleanedData)
    
    console.log('========== rules stuff ==========', JSON.stringify(rules, null, 2))
}

pipeline()

//console.log(standardizeTransactions(await processTransactions('./transactions-account.csv'), "loop"))
//processTransactions('../download-transactions.csv')