# WEALTH OS — check7.0 Complete Architecture
**Version:** 7.0.0 | **Role:** Senior Computer Architect + Full-Stack Lead  
**Classification:** Master Reference Document — All Roles (Dev, QA, Designer, PM, Finance Domain)

---

## 1. Project Identity

| Field | Value |
|---|---|
| App Name | WEALTH OS |
| Bundle ID | com.wealthos.app |
| Target Platform | PWA + Android (Capacitor) |
| Architecture Style | Modular Vanilla JS (IIFE), Offline-First, LocalStorage |
| Design Language | Dark Luxury · Gold/Indigo/Emerald · Deep Space Palette |
| Primary Currency | INR (₹) |
| Offline Capable | 100% — no server, no sync |

---

## 2. Folder Structure — check7.0 (Full Path Reference)

```
check7.0/
│
├── index.html                        ← Shell only: meta, layout HTML, zero inline JS logic
│
├── manifest.json                     ← PWA manifest (renamed from manifestNew.json)
├── sw.js                             ← Service Worker v5 (renamed from swNew.js)
├── capacitor.config.json             ← Capacitor Android config
├── package.json                      ← Build scripts + Capacitor deps
│
├── assets/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── fonts/                        ← (empty, system fonts used — no external deps)
│
├── css/
│   ├── tokens.css                    ← All :root CSS variables (colors, radius, spacing, fonts)
│   ├── base.css                      ← Reset, html/body, scrollbar, noise overlay
│   ├── layout.css                    ← App shell, screens, topbar, nav, modals, sheets
│   ├── components.css                ← Cards, badges, pills, inputs, buttons, toast, confetti
│   ├── screens/
│   │   ├── home.css                  ← Hero, streak, stat-grid, alloc-section, achievements
│   │   ├── add.css                   ← Add tabs, cat-btn grid, expense/debt/inv forms
│   │   ├── goals.css                 ← Goal cards, progress, countdowns
│   │   └── analysis.css             ← Analysis modal, anl-tabs, kpis, bar charts
│   └── modules/
│       ├── bank.css                  ← Bank card, txn-item, txn-row
│       ├── credit.css                ← CC card skins (purple/green/red), cc-chip, cibil
│       ├── debt.css                  ← Debt card, owe/lent colors, net bar
│       ├── calculator.css            ← Slider-wrap, calc-result, chart-bars
│       ├── expense.css               ← exp-item, exp-cats grid, budget bar
│       ├── history.css               ← hist-item, hi-icon, fadeInUp
│       ├── settings.css              ← setting-item, reminder-card, rm-toggle
│       └── ai.css                    ← advice-card, score-ring, ai-msg, ai-chip
│
├── js/
│   ├── core/
│   │   ├── constants.js              ← DEFAULT_INSTRUMENTS, EXP_CATS, ACHIEVEMENTS, MARKET_NEWS, REMINDERS, TICKER_DATA
│   │   ├── state.js                  ← S (global state object), defaultState(), migrateState()
│   │   ├── storage.js                ← save(), load(), exportData(), importData(), resetData()
│   │   ├── utils.js                  ← uid(), num(), fmt(), fmtDate(), debounce(), deepClone()
│   │   └── architecture-core.js     ← getBank(), getCard(), ensureOpeningBalances(), applyTransactionEffect(), adjustExpenseBalance()
│   │
│   ├── ui/
│   │   ├── navigation.js             ← showNav(), activeScreen tracking, topbar updates
│   │   ├── sheets.js                 ← openSheet(), closeSheet(), hideSheet() — all bottom sheet logic
│   │   ├── modals.js                 ← showModal(), closeModal() — all full-screen modal logic
│   │   ├── toast.js                  ← showToast(), queue management
│   │   ├── confetti.js               ← spawnConfetti() — particle system
│   │   └── ticker.js                 ← Market ticker rendering + auto-scroll
│   │
│   ├── features/
│   │   ├── onboarding.js             ← obNext(), obFinish(), step management
│   │   ├── home.js                   ← refreshHome(), totalInvested(), byInstrument(), netWorth calc
│   │   ├── investments.js            ← addInvestment(), renderAllocSection(), renderInstrumentModal()
│   │   ├── expenses.js               ← addExpense(), renderExpenseModal(), renderAnalysis(), selPay()
│   │   ├── goals.js                  ← addGoal(), renderGoalsScreen(), selEmoji(), goal countdown
│   │   ├── debt.js                   ← addDebt(), settleDebt(), deleteDebt(), renderDebtModal(), setDebtType()
│   │   ├── bank.js                   ← addBankAccount(), renderBankModal(), openTxnSheet()
│   │   ├── credit.js                 ← addCreditCard(), renderCreditModal(), openCCSheet(), updateCibil()
│   │   ├── calculator.js             ← SIP calc, net worth calc, renderCalcResult(), chart bar render
│   │   ├── ai-advisor.js             ← aiSend(), aiTap(), nlp parser, generateAdvice(), scoreCalc()
│   │   ├── history.js                ← renderHistory(), filter/search, export CSV
│   │   ├── settings.js               ← openSettings(), saveSettings(), toggle reminders, backup/restore
│   │   └── streak.js                 ← touchStreak(), renderStreakBars(), achievement check
│   │
│   ├── records/
│   │   └── finance-editable-records.js  ← Edit/delete transactions + expenses (CRUD overlay layer)
│   │
│   └── boot.js                       ← DOMContentLoaded entry: load() → onboarding check → render chain → SW register
│
├── android/                          ← Capacitor-generated Android project (gitignored in most setups)
│   └── app/src/main/...
│
└── docs/
    ├── ARCHITECTURE.md               ← This file
    ├── CHANGELOG.md                  ← Version history (6.2 → 7.0 delta)
    ├── QA_TEST_PLAN.md               ← Full QA matrix (see Section 6)
    ├── COLOR_SYSTEM.md               ← Design token reference + color psychology notes
    └── FUTURE_ROADMAP.md             ← v7.1, v8.0 planned features
```

---

## 3. Module Dependency Map

```
boot.js
  └─ load() [storage.js]
       └─ S [state.js]
            └─ constants.js
  └─ architecture-core.js  (AppCore.*) ← used by ALL feature modules
  └─ finance-editable-records.js       ← patches renderBankModal / renderExpenseModal
  └─ onboarding.js → home.js → [all feature renders]
```

**Load Order in index.html `<body>` (bottom, in sequence):**
```html
<!-- Core -->
<script src="js/core/constants.js"></script>
<script src="js/core/state.js"></script>
<script src="js/core/storage.js"></script>
<script src="js/core/utils.js"></script>
<script src="js/core/architecture-core.js"></script>
<!-- UI -->
<script src="js/ui/navigation.js"></script>
<script src="js/ui/sheets.js"></script>
<script src="js/ui/modals.js"></script>
<script src="js/ui/toast.js"></script>
<script src="js/ui/confetti.js"></script>
<script src="js/ui/ticker.js"></script>
<!-- Features -->
<script src="js/features/onboarding.js"></script>
<script src="js/features/streak.js"></script>
<script src="js/features/home.js"></script>
<script src="js/features/investments.js"></script>
<script src="js/features/expenses.js"></script>
<script src="js/features/goals.js"></script>
<script src="js/features/debt.js"></script>
<script src="js/features/bank.js"></script>
<script src="js/features/credit.js"></script>
<script src="js/features/calculator.js"></script>
<script src="js/features/ai-advisor.js"></script>
<script src="js/features/history.js"></script>
<script src="js/features/settings.js"></script>
<!-- Records / CRUD Overlay -->
<script src="js/records/finance-editable-records.js"></script>
<!-- Boot (last) -->
<script src="js/boot.js"></script>
```

---

## 4. State Schema — `S` Object (state.js)

```js
const defaultState = () => ({
  // Identity
  name: '',
  onboarded: false,
  
  // Financial targets
  target: 10000,        // monthly investment target ₹
  budget: 15000,        // monthly expense budget ₹
  income: 0,            // declared monthly income ₹
  cashInHand: 0,        // physical cash balance ₹

  // Collections
  investments: [],      // { id, instr, amount, date, note, platform }
  expenses: [],         // { id, type, cat, amount, note, date, payMethod, accountId, acctType, platform, merchant }
  goals: [],            // { id, emoji, name, target, saved, date }
  debts: [],            // { id, type:'owe'|'lent', person, amount, note, due, rate, payMethod, accountId, acctType, date, settled }
  creditCards: [],      // { id, name, bank, lastFour, network, limit, bill, billDate, dueAfter, cibil, color }
  bankAccounts: [],     // { id, bank, type, balance, openingBalance, note, upiId }
  transactions: [],     // { id, accountId, acctType, type:'cr'|'db', amount, desc, date, platform, merchant, cat }
  netWorth: {
    assets: [],         // { id, name, value, type }
    liabilities: []     // { id, name, value, type }
  },
  
  // Engagement
  streak: 0,
  lastStreakDate: '',
  achievements: [],     // [ achievementId, ... ]
  reminders: {},        // { sip: true, ppf: true, rd: true, ... }
  
  // Instrument config
  instruments: {},      // custom instrument settings (name, rate, target, emoji, color)
  
  // Schema version (for migrations)
  _v: 7
});
```

---

## 5. Data Flow: Adding an Expense

```
User taps "Log Expense" button
  → addExpense() [expenses.js]
      → reads form fields (cat, amount, payMethod, accountId, acctType, platform, merchant, note)
      → validates: amount > 0
      → pushes to S.expenses[]
      → if acctType === 'bank':
            getBank(accountId) [architecture-core.js]
            acc.balance = Math.max(0, balance - amount)
            pushes auto-transaction to S.transactions[]
      → if acctType === 'cc':
            getCard(accountId) [architecture-core.js]
            card.bill += amount
            pushes auto-transaction to S.transactions[]
      → if payMethod === 'Cash':
            S.cashInHand = Math.max(0, cashInHand - amount)
      → touchStreak() [streak.js]
      → save() [storage.js]  → localStorage.setItem('wealthos', JSON.stringify(S))
      → renderExpenseModal() [expenses.js]
      → renderBankModal() [bank.js]      ← patched by finance-editable-records.js
      → refreshHome() [home.js]
      → showToast('💸 Expense logged!')
      → spawnConfetti() [confetti.js]
```

---

## 6. QA Test Plan — Key Scenarios

### 6.1 Data Integrity Tests
| Test ID | Scenario | Expected | Priority |
|---|---|---|---|
| DI-01 | Add bank debit expense | Bank balance decreases exactly by amount | P0 |
| DI-02 | Add CC expense | card.bill increases by amount | P0 |
| DI-03 | Add Cash expense | S.cashInHand decreases | P0 |
| DI-04 | Edit transaction amount | Old effect reversed, new applied | P0 |
| DI-05 | Delete transaction | Balance restored to pre-transaction value | P0 |
| DI-06 | Bank balance never goes below 0 | Math.max(0, ...) guard active | P0 |
| DI-07 | CC bill never goes below 0 | Math.max(0, ...) guard active | P0 |
| DI-08 | Reload app, all data persists | localStorage survives full reload | P0 |
| DI-09 | Add debt (owe) via bank account | Account balance increases (borrowed = money in) | P1 |
| DI-10 | Add debt (lent) via bank | Account balance decreases | P1 |
| DI-11 | Settle debt | marks settled:true, does NOT auto-adjust balance (manual) | P1 |
| DI-12 | Import/export data round-trip | Exported JSON re-imports identically | P1 |

### 6.2 UI/UX Tests
| Test ID | Scenario | Expected | Priority |
|---|---|---|---|
| UX-01 | Bottom sheet swipe-to-close | Sheet closes, overlay fades | P0 |
| UX-02 | Toast duration | Shows for 2.2s, fades out | P1 |
| UX-03 | Confetti on expense/debt add | Particles fire and clean up | P2 |
| UX-04 | Nav active state | Correct nav item highlights on screen change | P0 |
| UX-05 | Streak increments only once/day | Second log same day: no streak change | P1 |
| UX-06 | Achievement unlocks | Banner + badge appear on first qualifying action | P1 |
| UX-07 | Onboarding skips if done | S.onboarded === true → direct to home | P0 |
| UX-08 | Ticker auto-scrolls | Market ticker scrolls infinitely without pause | P2 |

### 6.3 PWA / Offline Tests
| Test ID | Scenario | Expected | Priority |
|---|---|---|---|
| PWA-01 | Install prompt appears | App installable on Android Chrome | P0 |
| PWA-02 | Fully offline after first load | All screens work with network disabled | P0 |
| PWA-03 | SW caches index.html | Returns from cache on offline reload | P0 |
| PWA-04 | SW updates on new deploy | Old cache purged on activate | P1 |

---

## 7. Color System & Psychology

### 7.1 Palette Tokens
| Token | Hex | Psychology / Usage |
|---|---|---|
| `--gold` | #f0b429 | **Ambition · Wealth** — CTAs, active nav, hero values. Gold triggers aspiration and status desire. Used for all primary actions. |
| `--green` | #3ecf8e | **Growth · Safety** — Credit/income values, "lent" debts, positive deltas. Green = financial gain, biological growth. |
| `--red` | #f87171 | **Urgency · Loss** — Expenses, "I owe" debts, negative balances. Coral-red (not pure red) reduces anxiety vs blood-red. |
| `--blue` | #818cf8 | **Intelligence · Trust** — AI Advisor, bank balances, info states. Indigo-blue signals technology and reliability. |
| `--purple` | #c084fc | **Premium · Mystery** — Credit card dues, premium features. Purple historically = royalty and luxury. |
| `--orange` | #fb923c | **Energy · Caution** — Warning states, overdue debts. Orange bridges gold (desire) and red (danger). |
| `--bg` | #050508 | **Deep Space** — Base background. Near-black with blue undertone reduces eye strain and enhances gold contrast. |
| `--text` | #f0eeff | **Warm White** — Primary text. Slight warm/lavender tint prevents harshness of pure white on dark bg. |
| `--text2` | #9896b8 | **Muted Lavender** — Secondary text. Maintains readability while clearly receding in hierarchy. |
| `--text3` | #4a4870 | **Ghost** — Labels, mono metadata. Very low contrast — used only for structural labels, never content. |

### 7.2 Color Rules
- **Gold = action**: Every interactive primary button is gold. Users learn: gold = do something.
- **Green = gain, red = loss**: Consistent across ALL screens. Never invert this.
- **Blue = information**: AI Advisor, tips, market data — blue signals "neutral data, not a judgment".
- **Purple = credit/liability**: CC-related UIs use purple to signal "borrowed money" — distinct from green (own money) and gold (aspirational).
- **Noise overlay**: `opacity: 0.4` film-grain texture prevents the dark background from feeling "digital flat". Adds perceived depth and premium feel.
- **Ambient glows**: Static radial gradients (blue top-right, gold bottom-left) — subconsciously signal "technology" and "wealth" without moving elements.

---

## 8. Known Bugs Fixed in 7.0

| Bug ID | Description | Fix |
|---|---|---|
| BUG-01 | `addAccount()` + `renderAccounts()` at bottom of index.html reference undefined `accounts` var | Removed dead code block — superseded by `bankAccounts` in state |
| BUG-02 | `finance-editable-records.js` patches `renderBankModal` before it's defined if scripts load out of order | Fix: load feature scripts before records overlay, boot.js last |
| BUG-03 | `ensureOpeningBalances()` runs at IIFE init in `architecture-core.js` before `S` is loaded | Fix: call `ensureOpeningBalances()` in `boot.js` after `load()` |
| BUG-04 | `num()` used before `AppCore` available in some feature IIFEs | Fix: import `num` from `utils.js` directly in each module |
| BUG-05 | Transactions auto-generated from `quickAddExpense()` use `Date.now()+1/+2` as IDs — collision risk within same ms | Fix: use `uid()` from `utils.js` (timestamp + random suffix) |
| BUG-06 | Copyright notice absent from codebase | Added to all file headers |

---

## 9. Future Roadmap

### v7.1 (Next Sprint)
- [ ] Monthly budget rollover logic
- [ ] Export to CSV (history screen)
- [ ] Debt interest auto-calculation on settle
- [ ] Dark/light theme toggle (system preference detection)
- [ ] Haptic feedback on native (Capacitor Haptics plugin)

### v7.2
- [ ] Category budget limits with overspend alerts
- [ ] Bank account opening balance correction UI
- [ ] Recurring expense templates (rent, subscriptions)
- [ ] Widget (Android) showing net worth

### v8.0 (Major)
- [ ] Multi-currency support (USD, EUR alongside INR)
- [ ] Cloud sync option (opt-in, E2E encrypted)
- [ ] Shared household accounts (invite by QR)
- [ ] AI Advisor upgrade: real NLP parsing with regex fallback
- [ ] Advanced charts (D3.js, lazy-loaded)

---

## 10. Developer Conventions (check7.0)

### Naming
- All feature functions: `camelCase`, verb-first: `addExpense`, `renderBankModal`, `openTxnSheet`
- All IDs in HTML: `kebab-case`: `txn-sheet`, `exp-amt-inp`
- CSS classes: `BEM-light` with module prefix: `.bank-card`, `.cc-chip`, `.debt-avatar`
- State keys: `camelCase`, singular for objects, plural for arrays: `bankAccounts`, `creditCards`, `S.name`

### JS Module Pattern
Every feature file uses IIFE and registers to `window`:
```js
// js/features/expenses.js
(function(){
  if(!window.S || !window.AppCore) return;
  
  function addExpense(){ ... }
  
  window.addExpense = addExpense;
  window.renderExpenseModal = renderExpenseModal;
})();
```

### Git Commit Convention
```
feat(bank): add opening balance correction UI
fix(debt): interest calc on partial settle
style(tokens): rename --gold-dim to --gold-surface
docs(qa): add PWA offline test matrix
```

---

*Document generated: check7.0 migration from check6.2 monolith*  
*Architecture reviewed for: correctness, modularity, future maintainability, QA coverage, design system integrity*
