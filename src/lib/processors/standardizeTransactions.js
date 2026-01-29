import { v4 as uuidv4 } from 'uuid';
import bankConfigs from '../rules/bankConfig.json' with { type: 'json' };


const getVal = (row, field) => (row && row[field] !== undefined ? row[field] : field);
const parseNum = (val) => parseFloat(String(val).replace(/[$,]/g, '')) || 0;

const transforms = {
    // Joins multiple fields
    CONCAT: (row, ...fields) => fields.map(f => row[f]).filter(Boolean).join(' ').trim(),

    // Returns the first non-null/empty field value found
    EITHER: (row, ...fields) => {
        const found = fields.find(f => row[f] != null && row[f] !== '');
        return found ? row[found] : null;
    },

    // Checks a field, returns trueVal or falseVal
    CONDITIONAL: (row, field, trueVal, falseVal) => {
        return (row[field] != null && row[field] !== '') ? trueVal : falseVal;
    },

    // Cleans currency strings
    PARSE_CURRENCY: (row, input) => parseNum(getVal(row, input)),

    // Determines Credit/Debit based on numeric sign
    // Polymorphic: input can be a calculated number (from pipe) or a field name
    AMOUNT_SIGN: (row, input) => {
        const val = typeof input === 'number' ? input : parseNum(row[input]);
        return val >= 0 ? 'credit' : 'debit';
    },

    // Maps values (e.g., DEPOSIT=credit)
    TYPE_MAP: (row, input, ...mappings) => {
        const val = getVal(row, input);
        const map = Object.fromEntries(mappings.map(m => m.split('=')));
        return map[val] || 'debit'; // Default to debit if not found
    }
};

export function processMapping(mapping, row) {
    if (typeof mapping !== 'string') return mapping;

    // Simple Field Mapping (No transform)
    if (!mapping.includes(':')) {
        return row[mapping];
    }

    // Pipeline Parsing: "OUTER:INNER:arg1,arg2"
    // Split by ':' then treat the last element as args, and the rest as a function chain
    const parts = mapping.split(':');
    const initialArgs = parts.pop().split(','); 
    const pipeline = parts.reverse(); // [INNER, OUTER]

    // 3. Execute Pipeline
    return pipeline.reduce((currentVal, transformName, index) => {
        const fn = transforms[transformName];
        if (!fn) throw new Error(`Transform ${transformName} not found`);
        
        if (index === 0) {
            return fn(row, ...currentVal);
        } 

        return fn(row, currentVal);
    }, initialArgs);
}

export function standardizeTransaction(row, bankKey) {
    const config = bankConfigs[bankKey];
    if (!config) throw new Error(`Bank config not found for: ${bankKey}`);

    const result = {
        id: uuidv4(),
        bankSource: bankKey,
        ...Object.keys(config.fieldMappings).reduce((acc, key) => {
            acc[key] = processMapping(config.fieldMappings[key], row);
            return acc;
        }, {}),
        rawData: row
    };

    if (result.amount) result.amount = parseNum(result.amount);
    
    return result;
}

export function standardizeTransactions(rows, bankKey) {
    return rows.map(row => standardizeTransaction(row, bankKey));
}