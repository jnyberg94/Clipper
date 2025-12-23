//NOT APPROVED


export function detectInterCorporateTransfers(allTransactions, rules) {
  const ictRule = rules.interCorporateTransfers;
  const maxDays = ictRule.maxDaysApart;
  const maxDiff = ictRule.maxDifference;
  

  const debits = allTransactions.filter(t => t.type === 'debit');
  const credits = allTransactions.filter(t => t.type === 'credit');
  
  const ictPairs = [];
  const matchedIds = new Set();
  
  for (const debit of debits) {
    if (matchedIds.has(debit.id)) continue; // Already matched
    
    for (const credit of credits) {
      if (matchedIds.has(credit.id)) continue; // Already matched
      
      if (debit.bankSource === credit.bankSource) continue;
      
      const daysDiff = Math.abs(
        (new Date(debit.date) - new Date(credit.date)) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > maxDays) continue;
      
      const amountDiff = Math.abs(Math.abs(debit.amount) - Math.abs(credit.amount));
      if (amountDiff > maxDiff) continue;
      
      ictPairs.push({
        debit: debit,
        credit: credit,
        daysDiff: daysDiff,
        amountDiff: amountDiff,
        confidence: calculateConfidence(daysDiff, amountDiff, maxDays, maxDiff)
      });
      
      matchedIds.add(debit.id);
      matchedIds.add(credit.id);
      break;
    }
  }
  
  return ictPairs;
}

function calculateConfidence(daysDiff, amountDiff, maxDays, maxDiff) {
  const dateScore = (maxDays - daysDiff) / maxDays;
  const amountScore = (maxDiff - amountDiff) / maxDiff;
  return ((dateScore + amountScore) / 2) * 100;
}



// processors/ruleEngine.js

export function applyRules(allTransactions, rules) {
  // 1. Detect ICTs first (needs all transactions)
  const ictPairs = detectInterCorporateTransfers(allTransactions, rules);
  
  // Mark ICT transactions
  const ictTransactionIds = new Set();
  ictPairs.forEach(pair => {
    ictTransactionIds.add(pair.debit.id);
    ictTransactionIds.add(pair.credit.id);
  });
  
  // 2. Apply other rules to remaining transactions
  const categorized = allTransactions.map(transaction => {
    // Skip if already categorized as ICT
    if (ictTransactionIds.has(transaction.id)) {
      return {
        ...transaction,
        autoCategory: 'Inter-Corporate Transfer',
        ictPairId: findPairId(transaction.id, ictPairs)
      };
    }
    
    // Apply simple rules
    if (transaction.type === 'credit') {
      if (Math.abs(transaction.amount) <= rules.interest.maxAmount) {
        return { ...transaction, autoCategory: 'Interest' };
      } else {
        return { ...transaction, autoCategory: 'Income' };
      }
    }
    
    if (transaction.type === 'debit') {
      if (Math.abs(transaction.amount) <= rules.bankFees.maxAmount) {
        return { ...transaction, autoCategory: 'Bank Fee' };
      } else {
        return { ...transaction, autoCategory: 'Expense' };
      }
    }
    
    return transaction;
  });
  
  return {
    transactions: categorized,
    ictPairs: ictPairs
  };
}

function findPairId(transactionId, ictPairs) {
  for (let i = 0; i < ictPairs.length; i++) {
    if (ictPairs[i].debit.id === transactionId || ictPairs[i].credit.id === transactionId) {
      return i;
    }
  }
  return null;
}