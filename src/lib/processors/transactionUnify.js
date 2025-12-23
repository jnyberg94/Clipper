import bankConfigs from '../rules/bankConfig.json' with { type: 'json' }

const transforms = {
    CONCAT: (row, ...fields) => {
        return fields.map(f => row[f]).filter(Boolean).join(' ').trim();
    },

    EITHER: (row, ...fields) => {
        for (const field of fields) {
            if (row[field] != null && row[field] !== '') {
                return row[field];
            }
        }
        return null;
    },

    CONDITIONAL: (row, checkField, trueVal, falseVal) => {
        return row[checkField] != null && row[checkField] !== '' ? trueVal : falseVal;
    },

    PARSE_CURRENCY: (row, field) => {
        const value = row[field];
        if (!value) return 0;
        const cleaned = String(value).replace(/[$,]/g, '');
        return parseFloat(cleaned) || 0;
    },

    AMOUNT_SIGN: (row, ...fieldArgs) => {
        let amount;
        if (fieldArgs[0] === 'EITHER') {
            amount = transforms.EITHER(row, ...fieldArgs.slice(1));
        } else {
            amount = row[fieldArgs[0]];
        }
        return amount >= 0 ? 'credit' : 'debit';
    },

    TYPE_MAP: (row, field, ...mappings) => {
        const value = row[field];
        for (const mapping of mappings) {
            const [from, to] = mapping.split('=');
            if (value === from) return to;
        }
        return 'debit';
    }
};

export function processMapping(mapping, row) {
    if (typeof mapping !== 'string') {
        return mapping;
    }


    if (mapping.includes(':')) {
        const parts = mapping.split(':');
        const transform = parts[0];
        const args = parts.slice(1).join(':').split(',');

        if (transforms[transform]) {
            return transforms[transform](row, ...args);
        }
    }

    return row[mapping];
}

export function standardizeTransaction(row, bankKey) {
    const bankConfig = bankConfigs[bankKey]

    if (!bankConfig) {
        throw new Error(`Bank config not found for: ${bankKey}`);
    }

    const standardized = {
        date: processMapping(bankConfig.fieldMappings.date, row),
        description: processMapping(bankConfig.fieldMappings.description, row),
        amount: processMapping(bankConfig.fieldMappings.amount, row),
        currency: processMapping(bankConfig.fieldMappings.currency, row),
        type: processMapping(bankConfig.fieldMappings.type, row),
        //category: processMapping(bankConfig.fieldMappings.category, row) || null,
        //accountNumber: processMapping(bankConfig.fieldMappings.accountNumber, row) || null,
        bankSource: bankKey,
        rawData: row
    };

    if (typeof standardized.amount === 'string') {
        standardized.amount = parseFloat(standardized.amount.replace(/[$,]/g, '')) || 0;
    }

    return standardized;
}

export function standardizeTransactions(rows, bankKey) {
    return rows.map(row => standardizeTransaction(row, bankKey));
}