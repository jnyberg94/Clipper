import Papa from 'papaparse';
import fs from 'fs';
import { standardizeTransactions } from '../processors/transactionUnify.js';

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

//console.log(await processTransactions('./transactions-account.csv'))

console.log(standardizeTransactions(await processTransactions('./transactions-account.csv'), "loop"))
//processTransactions('../download-transactions.csv')