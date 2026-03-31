/* Core finance helpers split from monolith index script. */
(function(){
  if(!window.S) return;

  function num(v){
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function getBank(id){
    return (window.S.bankAccounts || []).find(a => a.id === id);
  }

  function getCard(id){
    return (window.S.creditCards || []).find(c => c.id === id);
  }

  function ensureOpeningBalances(){
    (window.S.bankAccounts || []).forEach(acc => {
      if(typeof acc.openingBalance !== 'number'){
        acc.openingBalance = num(acc.balance);
      }
    });
  }

  function applyTransactionEffect(txn, direction){
    if(!txn || !txn.accountId) return;
    const dir = direction === -1 ? -1 : 1;
    const amount = num(txn.amount);
    if(amount <= 0) return;

    if(txn.acctType === 'bank'){
      const acc = getBank(txn.accountId);
      if(!acc) return;
      const signed = txn.type === 'cr' ? amount : -amount;
      acc.balance = Math.max(0, num(acc.balance) + (signed * dir));
      return;
    }

    if(txn.acctType === 'cc'){
      const card = getCard(txn.accountId);
      if(!card) return;
      const signed = txn.type === 'cr' ? -amount : amount;
      card.bill = Math.max(0, num(card.bill) + (signed * dir));
    }
  }

  function adjustExpenseBalance(oldExp, newExp){
    const oldAmount = num(oldExp && oldExp.amount);
    const newAmount = num(newExp && newExp.amount);
    const delta = newAmount - oldAmount;
    if(delta === 0) return;

    const acctType = newExp && newExp.acctType;
    const accountId = newExp && newExp.accountId;

    if(acctType === 'bank' && accountId){
      const acc = getBank(accountId);
      if(acc) acc.balance = Math.max(0, num(acc.balance) - delta);
    } else if(acctType === 'cc' && accountId){
      const card = getCard(accountId);
      if(card) card.bill = Math.max(0, num(card.bill) + delta);
    } else if((newExp && newExp.payMethod) === 'Cash'){
      window.S.cashInHand = Math.max(0, num(window.S.cashInHand) - delta);
    }
  }

  window.AppCore = {
    num,
    getBank,
    getCard,
    ensureOpeningBalances,
    applyTransactionEffect,
    adjustExpenseBalance
  };

  ensureOpeningBalances();
})();
