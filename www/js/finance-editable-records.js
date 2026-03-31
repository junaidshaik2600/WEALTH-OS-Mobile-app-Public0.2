/* Adds editable expense/transaction records and account sync. */
(function(){
  if(!window.S || !window.AppCore) return;

  let editingTxnId = null;

  function uid(){
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  function setTxnSheetMode(isEdit){
    const title = document.getElementById('txn-sheet-title');
    const btn = document.getElementById('txn-save-btn');
    if(title) title.textContent = isEdit ? 'Edit Transaction' : 'Log Transaction';
    if(btn) btn.textContent = isEdit ? 'Update Transaction ✓' : 'Log Transaction ✓';
  }

  function findTxn(txnId){
    return (window.S.transactions || []).find(t => t.id === txnId);
  }

  function renderRecordActions(){
    const txns = (window.S.transactions || []).slice(0, 40);
    document.querySelectorAll('#txn-list-wrap .txn-row').forEach((row, idx) => {
      if(row.querySelector('.txn-actions')) return;
      const t = txns[idx];
      if(!t) return;
      const actions = document.createElement('div');
      actions.className = 'txn-actions';
      actions.style.cssText = 'display:flex;gap:8px;margin-top:6px;';
      actions.innerHTML =
        '<button class="ibtn ibtn-gold" style="padding:5px 8px;font-size:10px" type="button">Edit</button>' +
        '<button class="ibtn ibtn-red" style="padding:5px 8px;font-size:10px" type="button">Delete</button>';
      const [editBtn, delBtn] = actions.querySelectorAll('button');
      editBtn.onclick = function(){ window.openTxnSheet(t.id, true); };
      delBtn.onclick = function(){ window.deleteTransactionRecord(t.id); };
      row.appendChild(actions);
    });

    const expenses = (window.S.expenses || []).slice(0, 12);
    document.querySelectorAll('#exp-list .exp-item').forEach((row, idx) => {
      if(row.querySelector('.exp-actions')) return;
      const exp = expenses[idx];
      if(!exp) return;
      const actions = document.createElement('div');
      actions.className = 'exp-actions';
      actions.style.cssText = 'display:flex;gap:8px;margin-top:6px;';
      actions.innerHTML =
        '<button class="ibtn ibtn-gold" style="padding:5px 8px;font-size:10px" type="button">Edit</button>' +
        '<button class="ibtn ibtn-red" style="padding:5px 8px;font-size:10px" type="button">Delete</button>';
      const [editBtn, delBtn] = actions.querySelectorAll('button');
      editBtn.onclick = function(){ window.editExpenseRecord(exp.id); };
      delBtn.onclick = function(){ window.deleteExpenseRecord(exp.id); };
      row.querySelector('.exp-item-info')?.appendChild(actions);
    });
  }

  const _renderBankModal = window.renderBankModal;
  window.renderBankModal = function(){
    _renderBankModal();
    renderRecordActions();
  };

  const _renderExpenseModal = window.renderExpenseModal;
  window.renderExpenseModal = function(){
    _renderExpenseModal();
    renderRecordActions();
  };

  window.openTxnSheet = function(idOrTxn, editMode){
    const sel = document.getElementById('txn-acct-sel');
    if(sel){
      sel.innerHTML = (window.S.bankAccounts || [])
        .map(a => '<option value="' + a.id + '">' + a.bank + (a.note ? ' (' + a.note + ')' : '') + '</option>')
        .join('') || '<option>Add bank accounts first</option>';
    }

    editingTxnId = null;
    setTxnSheetMode(false);
    window.$v('txn-date-inp', new Date().toISOString().split('T')[0]);
    window.$v('txn-amt-inp', '');
    window.$v('txn-merch-inp', '');
    window.$v('txn-desc-inp', '');
    window.$v('txn-type-inp', 'cr');
    window.$v('txn-plat-inp', '');

    if(editMode === true){
      const txn = findTxn(idOrTxn);
      if(txn){
        editingTxnId = txn.id;
        setTxnSheetMode(true);
        window.$v('txn-acct-sel', txn.accountId);
        window.$v('txn-type-inp', txn.type || 'cr');
        window.$v('txn-amt-inp', window.AppCore.num(txn.amount));
        window.$v('txn-merch-inp', txn.merchant || '');
        window.$v('txn-desc-inp', txn.desc || '');
        window.$v('txn-plat-inp', txn.platform || '');
        window.$v('txn-date-inp', new Date(txn.date).toISOString().split('T')[0]);
      }
    } else if(idOrTxn){
      window.$v('txn-acct-sel', idOrTxn);
    }

    window.openSheet('txn-sheet');
  };

  window.saveTransaction = function(){
    const acctId = parseInt(window.$v('txn-acct-sel'), 10);
    const type = window.$v('txn-type-inp');
    const amount = parseFloat(window.$v('txn-amt-inp')) || 0;
    const platform = window.$v('txn-plat-inp') || '';
    const merchant = window.$v('txn-merch-inp').trim();
    const desc = window.$v('txn-desc-inp').trim() || merchant || 'Transaction';
    const dateVal = window.$v('txn-date-inp');
    const date = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

    if(!amount || amount <= 0){ window.showToast('⚠ Enter amount'); return; }
    if(!acctId){ window.showToast('⚠ Select account'); return; }

    if(editingTxnId){
      const txn = findTxn(editingTxnId);
      if(!txn){ window.showToast('⚠ Transaction not found'); return; }
      window.AppCore.applyTransactionEffect(txn, -1);
      txn.accountId = acctId;
      txn.acctType = 'bank';
      txn.type = type;
      txn.amount = amount;
      txn.desc = desc;
      txn.date = date;
      txn.platform = platform;
      txn.merchant = merchant;
      window.AppCore.applyTransactionEffect(txn, 1);
      window.showToast('✓ Transaction updated');
    } else {
      const txn = { id: uid(), accountId: acctId, acctType: 'bank', type, amount, desc, date, platform, merchant };
      window.S.transactions.unshift(txn);
      window.AppCore.applyTransactionEffect(txn, 1);
      window.showToast(type === 'cr' ? '💚 Credit recorded' : '🔴 Debit recorded');
    }

    editingTxnId = null;
    setTxnSheetMode(false);
    window.touchStreak();
    window.save();
    window.hideSheet('txn-sheet');
    window.renderBankModal();
    window.refreshHome();
  };

  window.deleteTransactionRecord = function(txnId){
    const txn = findTxn(txnId);
    if(!txn) return;
    if(!confirm('Delete this transaction?')) return;
    window.AppCore.applyTransactionEffect(txn, -1);
    window.S.transactions = (window.S.transactions || []).filter(t => t.id !== txnId);
    window.save();
    window.renderBankModal();
    window.refreshHome();
    window.showToast('🗑 Transaction removed');
  };

  window.editExpenseRecord = function(expenseId){
    const exp = (window.S.expenses || []).find(e => e.id === expenseId);
    if(!exp) return;

    const nextAmount = parseFloat(prompt('Edit amount (₹):', String(window.AppCore.num(exp.amount))) || '');
    if(!nextAmount || nextAmount <= 0){ window.showToast('⚠ Invalid amount'); return; }
    const nextNoteRaw = prompt('Edit note:', exp.note || '');
    if(nextNoteRaw === null) return;
    const nextNote = nextNoteRaw.trim();

    const oldExp = Object.assign({}, exp);
    exp.amount = nextAmount;
    exp.note = nextNote;

    window.AppCore.adjustExpenseBalance(oldExp, exp);
    window.save();
    window.renderExpenseModal();
    window.renderBankModal();
    window.refreshHome();
    window.showToast('✓ Expense updated');
  };

  window.deleteExpenseRecord = function(expenseId){
    const exp = (window.S.expenses || []).find(e => e.id === expenseId);
    if(!exp) return;
    if(!confirm('Delete this expense?')) return;

    const oldExp = Object.assign({}, exp);
    const zeroed = Object.assign({}, exp, { amount: 0 });
    window.AppCore.adjustExpenseBalance(oldExp, zeroed);
    window.S.expenses = (window.S.expenses || []).filter(e => e.id !== expenseId);
    window.save();
    window.renderExpenseModal();
    window.renderBankModal();
    window.refreshHome();
    window.showToast('🗑 Expense removed');
  };
})();
