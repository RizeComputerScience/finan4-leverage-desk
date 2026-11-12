/* The Leverage Desk: FINAN IV Unit 12 (debt and payouts). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-04 (case_reuse.py): Cragline Climbing, Cragline, Pilar Zamora, Pilar, Zamora, all clean.
   Version 3 (2026-11-12), rebuilt to the Unit 9 pattern (process/standards/interactive-assignments.md rules 25 to 39;
   u12/TEACHING-MAP.md; design/scope-2026-11-11.md):
   - The reading teaches; the desk has no walkthrough of its own (rule 32).
   - Four calculations, each as a faded step then the student's own, on h.ladder: the owners' return in a good and a bad
     year, the interest tax saving, interest coverage before and after a new loan, and the payout share against free cash flow.
     Every task states the problem first, then shows a worked example drawn as the SAME table, read-only, with another
     company and numbers (rule 29).
   - Cut from the desk: the walkthrough, the largest loan for a coverage target, the dividend and the buyback tasks (EPS),
     the dividends-or-buybacks check.
   The previous version is in v2-archive/. seedVersion 3 and version 3: progress and receipts from v2 do not carry over. */
(function (root) {
  'use strict';
  const QUIZ = [
    { title: 'Quick check: why the swing',
      q: 'Plan B made the owners’ good year better and their bad year worse than Plan A. Why?',
      options: ['The interest is due in good years and bad, so the owners keep every dollar above it and lose every dollar below it', 'The bank takes a bigger share of the profit in good years', 'Borrowed money always costs more than the owners’ money', 'The gyms earn less operating profit under Plan B'],
      answer: 0,
      why: ['Right. The interest is the same whatever happens, so a bigger loan makes the owners’ return swing more in both directions.',
        'A bank is paid a fixed amount of interest, not a share of the profit. That fixed payment is what makes the owners’ return swing.',
        'In a good year the loan costs less than the gyms earn on it, which is why Plan B’s good year is better. The trouble is that the interest is due in bad years too.',
        'The gyms earn the same operating profit under both plans. Only the interest and the owners’ money change.'] },
    { title: 'Exam-style question',
      q: 'A gym chain cost $5,000,000. It borrowed $3,000,000 at 7% interest, and its owners put in the other $2,000,000. In a bad year it earns $150,000 of operating profit. What is the owners’ return that year?',
      options: ['−3.0%', '3.0%', '7.5%', '−1.2%'],
      answer: 0,
      why: ['Right. Interest is $3,000,000 × 0.07 = $210,000. The owners’ profit is $150,000 − $210,000 = −$60,000, and −$60,000 ÷ $2,000,000 = −3.0%. Exam questions look like this one.',
        '3.0% divides the operating profit by the whole $5,000,000 and ignores the loan. Subtract the interest, then divide by the owners’ money.',
        '7.5% divides the operating profit by the owners’ money but leaves out the $210,000 of interest. Subtract it first.',
        '−1.2% divides the owners’ loss by the whole $5,000,000. The owners put in only $2,000,000, so divide by that.'] },
  ];

  const STEPS = [
    { id: 'or1', label: 'A little debt', kind: 'task' },
    { id: 'or2', label: 'A lot of debt', kind: 'task' },
    { id: 'q1', label: 'Quick check', kind: 'check', quiz: 0 },
    { id: 'tx1', label: 'Tax saving', kind: 'task' },
    { id: 'tx2', label: 'Plan B’s tax saving', kind: 'task' },
    { id: 'cv1', label: 'Coverage, Plan A', kind: 'task' },
    { id: 'cv2', label: 'Coverage, Plan B', kind: 'task' },
    { id: 'ps1', label: 'Last year’s payouts', kind: 'task' },
    { id: 'ps2', label: 'Next year’s payouts', kind: 'task' },
    { id: 'q2', label: 'Exam-style question', kind: 'check', quiz: 1 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];
  const COVER = 2;   // the bank's minimum interest coverage after a new loan, in a bad year

  // Round seed sets (the tests read these). gp and bp are good- and bad-year operating profit as a percent of the gyms' cost.
  // c is coverage now; existing debt is half the gyms' cost, so Plan A's coverage after is 5c/7 and Plan B's is 5c/11.
  const ROUND = {
    I: [4000000, 5000000, 6000000, 8000000, 10000000], r: [0.05, 0.06, 0.08, 0.10], tax: [0.20, 0.21, 0.25],
    gp: [12, 13, 14, 15, 16, 17, 18, 19, 20], bp: [2.5, 3, 3.5, 4, 4.5, 5], c: [3, 4, 5, 5.5, 6],
    fcf: [1600000, 2000000, 2400000, 3000000, 4000000], capex: [1000000, 1500000, 2000000, 2500000],
    s: [0.6, 0.7, 0.8, 1.25, 1.3, 1.4], divShare: [0.25, 0.4, 0.5],
  };

  function buildTasks(rng, h) {
    const T = [], P = (a) => h.pick(rng, a);
    // Part 1: the new gyms. Plan A borrows 20% of the cost, Plan B 60%.
    let I, r, gp, bp;
    for (let k = 0; k < 200; k++) {
      I = P(ROUND.I); r = P(ROUND.r); gp = P(ROUND.gp); bp = P(ROUND.bp);
      const aBad = (bp / 100 - 0.2 * r) / 0.8, bBad = (bp / 100 - 0.6 * r) / 0.4;
      // Plan A keeps a small profit in a bad year; Plan B is never near zero, nor the worked example's −2%
      if (aBad >= 0.005 && Math.abs(bBad) >= 0.005 && Math.abs(bBad + 0.02) > 1e-9) break;
    }
    const G = I * gp / 100, B = I * bp / 100, LA = 0.2 * I, LB = 0.6 * I;
    T.push({ id: 'or1', I, r, L: LA, own: I - LA, G, B, answer: (B - LA * r) / (I - LA) });
    T.push({ id: 'or2', I, r, L: LB, own: I - LB, G, B, answer: (B - LB * r) / (I - LB) });
    // Tax saving on each plan's interest
    const tax = P(ROUND.tax);
    T.push({ id: 'tx1', r, L: LA, tax, answer: LA * r * tax });
    T.push({ id: 'tx2', r, L: LB, tax, answer: LB * r * tax });
    // Coverage: Cragline already owes half the gyms' cost at the same rate; bad-year operating profit = c × interest now
    const D0 = I / 2, c = P(ROUND.c), OI = c * D0 * r;
    T.push({ id: 'cv1', r, D0, OI, L: LA, answer: OI / (D0 * r + LA * r) });
    { const after = OI / (D0 * r + LB * r); T.push({ id: 'cv2', r, D0, OI, L: LB, answer: after, decision: after >= COVER ? 'yes' : 'no' }); }
    // Payouts: last year (faded), then next year's plan (own). Payout share is exact by construction.
    const pay = (id, notS) => {
      let f, s; do { f = P(ROUND.fcf); s = P(ROUND.s); } while (s === notS);
      const capex = P(ROUND.capex), ret = Math.round(f * s), div = Math.round(ret * P(ROUND.divShare) / 10000) * 10000;
      return { id, cfo: f + capex, capex, div, buy: ret - div, answer: s, decision: s <= 1 ? 'yes' : 'no' };
    };
    const p1 = pay('ps1', null); T.push(p1); T.push(pay('ps2', p1.answer));
    delete T[T.length - 2].decision;   // the faded step asks no question
    return T;
  }

  const m0 = (x) => root.DeskEngine.h.money(x);
  const pc = (x) => (Math.round(x * 1000) / 10) + '%';
  const p2 = (x) => String(+(x * 100).toFixed(2)) + '%';
  const dec = (x) => String(+x.toFixed(4));
  const cv = (x) => String(+x.toFixed(2));
  // A percent typed with a % sign means that percent. Without one, 17.25 and 0.1725 both mean 17.25%: take whichever reading is
  // nearer the answer (every percent on this desk is between −20% and 150%, so the two readings never compete).
  const pctIn = (h, s, target) => { const v = h.parseMoney(s); if (!isFinite(v) || /%/.test(String(s))) return v; return Math.abs(v - target) <= Math.abs(v / 100 - target) ? v : v / 100; };
  const show = (l) => (l.fmt === 'pct' ? p2(l.value) : l.fmt === 'num' ? cv(l.value) : l.fmt === 'text' ? l.value : m0(l.value));

  /* Each table is a list of line specs. calc(ref) builds the Calculation cell; ref(i, word) shows line i's result when that line
     is given, or the word when the student fills it in. mode: 'ex' (worked example, every line filled), 'faded' (only the lines
     in `blanks` are inputs), 'own' (every line an input). The worked example uses the same function on other numbers. */
  function table(specs, mode, blanks) {
    const isIn = (i) => mode === 'own' || (mode === 'faded' && blanks.includes(i));
    const ref = (i, word) => (isIn(i) ? word : show(specs[i]));
    return specs.map((s, i) => {
      const l = { label: s.label, calc: s.calc(ref), value: s.value, fmt: s.fmt, input: isIn(i) };
      return l.input ? l : { label: l.label, calc: l.calc, value: show(l), fmt: 'text', input: false };
    });
  }
  const SPEC = {
    or: (L, r, own, G, B) => { const i = L * r; return [
      { label: 'Interest', value: i, fmt: 'money', calc: () => `${m0(L)} × ${dec(r)}` },
      { label: 'Owners’ profit, good year', value: G - i, fmt: 'money', calc: (f) => `${m0(G)} − ${f(0, 'interest')}` },
      { label: 'Owners’ return, good year', value: (G - i) / own, fmt: 'pct', calc: (f) => `${f(1, 'good-year profit')} ÷ ${m0(own)}` },
      { label: 'Owners’ profit, bad year', value: B - i, fmt: 'money', calc: (f) => `${m0(B)} − ${f(0, 'interest')}` },
      { label: 'Owners’ return, bad year', value: (B - i) / own, fmt: 'pct', calc: (f) => `${f(3, 'bad-year profit')} ÷ ${m0(own)}` }]; },
    tx: (L, r, tax) => { const i = L * r; return [
      { label: 'Interest', value: i, fmt: 'money', calc: () => `${m0(L)} × ${dec(r)}` },
      { label: 'Interest tax saving', value: i * tax, fmt: 'money', calc: (f) => `${f(0, 'interest')} × ${dec(tax)}` },
      { label: 'Interest after the tax saving', value: i * (1 - tax), fmt: 'money', calc: (f) => `${f(0, 'interest')} − ${f(1, 'tax saving')}` }]; },
    cv: (D0, r, OI, L) => { const i0 = D0 * r, x = L * r; return [
      { label: 'Interest now', value: i0, fmt: 'money', calc: () => `${m0(D0)} × ${dec(r)}` },
      { label: 'Coverage now', value: OI / i0, fmt: 'num', calc: (f) => `${m0(OI)} ÷ ${f(0, 'interest now')}` },
      { label: 'Extra interest', value: x, fmt: 'money', calc: () => `${m0(L)} × ${dec(r)}` },
      { label: 'Coverage after the new loan', value: OI / (i0 + x), fmt: 'num', calc: (f) => `${m0(OI)} ÷ (${f(0, 'interest now')} + ${f(2, 'extra interest')})` }]; },
    ps: (cfo, capex, div, buy) => { const f0 = cfo - capex, ret = div + buy; return [
      { label: 'Free cash flow', value: f0, fmt: 'money', calc: () => `${m0(cfo)} − ${m0(capex)}` },
      { label: 'Cash returned to owners', value: ret, fmt: 'money', calc: () => `${m0(div)} + ${m0(buy)}` },
      { label: 'Payout share', value: ret / f0, fmt: 'pct', calc: (f) => `${f(1, 'cash returned')} ÷ ${f(0, 'free cash flow')}` },
      { label: 'Cash left after payouts', value: f0 - ret, fmt: 'money', calc: (f) => `${f(0, 'free cash flow')} − ${f(1, 'cash returned')}` }]; },
  };
  const FADED = { or1: [3, 4], tx1: [1, 2], cv1: [2, 3], ps1: [2, 3] };
  function linesFor(t) {
    const mode = FADED[t.id] ? 'faded' : 'own', b = FADED[t.id];
    if (/^or/.test(t.id)) return table(SPEC.or(t.L, t.r, t.own, t.G, t.B), mode, b);
    if (/^tx/.test(t.id)) return table(SPEC.tx(t.L, t.r, t.tax), mode, b);
    if (/^cv/.test(t.id)) return table(SPEC.cv(t.D0, t.r, t.OI, t.L), mode, b);
    if (/^ps/.test(t.id)) return table(SPEC.ps(t.cfo, t.capex, t.div, t.buy), mode, b);
  }
  // Worked examples: every rate is 4%, which no task uses. Built on first use (money() is not loaded with this file).
  const EXAMPLES = () => ({
    or1: { cap: 'A bowling chain’s new alleys cost $1,000,000. It borrows $200,000 at 4%, and its owners put in $800,000. Good year $160,000, bad year $24,000.',
      lines: table(SPEC.or(200000, 0.04, 800000, 160000, 24000), 'ex') },
    or2: { cap: 'The same bowling chain borrows $600,000 at 4% instead, and its owners put in $400,000. Good year $160,000, bad year $16,000.',
      lines: table(SPEC.or(600000, 0.04, 400000, 160000, 16000), 'ex'),
      after: 'The bigger loan lifts the good year from 19% to 34% and turns the bad year into a loss.' },
    tx1: { cap: 'A bowling chain borrows $500,000 at 4%. Its tax rate is 25%.', lines: table(SPEC.tx(500000, 0.04, 0.25), 'ex') },
    tx2: { cap: 'A trampoline park borrows $800,000 at 4%. Its tax rate is 30%.', lines: table(SPEC.tx(800000, 0.04, 0.30), 'ex') },
    cv1: { cap: 'A bowling chain owes $500,000 at 4% and earns $90,000 of operating profit in a bad year. It borrows $250,000 more.',
      lines: table(SPEC.cv(500000, 0.04, 90000, 250000), 'ex'), after: 'Coverage after the loan is 3, above the bank’s 2, so the bank would lend.' },
    cv2: { cap: 'A trampoline park owes $500,000 at 4% and earns $70,000 of operating profit in a bad year. It asks for $1,000,000 more.',
      lines: table(SPEC.cv(500000, 0.04, 70000, 1000000), 'ex'), after: 'Coverage after the loan is 1.17, below 2, so the bank would say no.' },
    ps1: { cap: 'A bowling chain made $900,000 of cash from operations and spent $300,000 on new lanes. It paid $150,000 of dividends and bought back $300,000 of shares.',
      lines: table(SPEC.ps(900000, 300000, 150000, 300000), 'ex') },
    ps2: { cap: 'A trampoline park expects $1,000,000 of cash from operations and $600,000 of capital spending. It plans $150,000 of dividends and $450,000 of buybacks.',
      lines: table(SPEC.ps(1000000, 600000, 150000, 450000), 'ex'),
      after: 'At 150%, the park would hand back more than it brings in, so it would have to borrow or spend its savings.' },
  });

  const PROBLEM = {
    or1: (t) => ({ title: 'Plan A: a little debt', place: 'Pilar wants to know what the owners earn if Cragline borrows a little for the new gyms.',
      body: `<p>Plan A borrows <b>${m0(t.L)}</b> at <b>${pc(t.r)}</b>, and the owners put in <b>${m0(t.own)}</b>. The gyms earn <b>${m0(t.G)}</b> of operating profit in a good year and <b>${m0(t.B)}</b> in a bad one. What do the owners earn in a bad year? The good year is filled in.</p>` }),
    or2: (t) => ({ title: 'Plan B: a lot of debt', place: 'Now Pilar wants the same numbers if Cragline borrows a lot.',
      body: `<p>Plan B borrows <b>${m0(t.L)}</b> at <b>${pc(t.r)}</b>, and the owners put in <b>${m0(t.own)}</b>. The gyms earn the same <b>${m0(t.G)}</b> in a good year and <b>${m0(t.B)}</b> in a bad one. What do the owners earn in each year?</p>` }),
    tx1: (t) => ({ title: 'Interest lowers the tax bill', place: 'Pilar wants to know what Plan A’s interest really costs once taxes count.',
      body: `<p>Plan A borrows <b>${m0(t.L)}</b> at <b>${pc(t.r)}</b>. Cragline’s tax rate is <b>${pc(t.tax)}</b>. How much tax does the interest save, and what does the interest cost after the saving? The interest is filled in.</p>` }),
    tx2: (t) => ({ title: 'Plan B’s tax saving', place: 'Now the same question for Plan B.',
      body: `<p>Plan B borrows <b>${m0(t.L)}</b> at <b>${pc(t.r)}</b>, and the tax rate is still <b>${pc(t.tax)}</b>. What are the interest, the tax saving and the interest after the saving?</p>` }),
    cv1: (t) => ({ title: 'Will the bank lend for Plan A?', place: 'Cragline’s bank lends only if interest coverage stays at 2 or more in a bad year.',
      body: `<p>Cragline already owes <b>${m0(t.D0)}</b> at <b>${pc(t.r)}</b>. In a bad year, the gyms it runs today earn <b>${m0(t.OI)}</b> of operating profit. Plan A borrows <b>${m0(t.L)}</b> more at the same rate. What is the coverage after the loan? The first two lines are filled in.</p>` }),
    cv2: (t) => ({ title: 'Will the bank lend for Plan B?', place: 'The bank runs the same check on Plan B.',
      body: `<p>Plan B borrows <b>${m0(t.L)}</b> instead, at the same <b>${pc(t.r)}</b>. Cragline still owes <b>${m0(t.D0)}</b>, and its gyms still earn <b>${m0(t.OI)}</b> in a bad year. What is the coverage before and after the loan?</p>`,
      choice: { legend: 'The bank wants coverage of at least 2 after the loan. Would it lend for Plan B?', options: [['yes', 'Yes: coverage after the loan is 2 or more'], ['no', 'No: coverage after the loan is below 2']] } }),
    ps1: (t) => ({ title: 'Cash handed back last year', place: 'The board also asks how much cash Cragline hands back to its owners.',
      body: `<p>Last year Cragline made <b>${m0(t.cfo)}</b> of cash from operations and spent <b>${m0(t.capex)}</b> on gyms and equipment. It paid <b>${m0(t.div)}</b> of dividends and bought back <b>${m0(t.buy)}</b> of its shares. What was its payout share? The first two lines are filled in.</p>` }),
    ps2: (t) => ({ title: 'Next year’s payout plan', place: 'The board has a payout plan for next year and wants to know if Cragline can afford it.',
      body: `<p>Next year Cragline expects <b>${m0(t.cfo)}</b> of cash from operations and <b>${m0(t.capex)}</b> of capital spending. The board plans <b>${m0(t.div)}</b> of dividends and <b>${m0(t.buy)}</b> of buybacks. What payout share does that plan mean?</p>`,
      choice: { legend: 'Can Cragline pay for this plan from its own cash, without borrowing?', options: [['yes', 'Yes: the payout share is 100% or less'], ['no', 'No: the payout share is above 100%']] } }),
  };

  function taskView(t, L, h) {
    const P = PROBLEM[t.id], E = EXAMPLES()[t.id], v = P(t), lines = linesFor(t);
    const example = h.ladder(E.lines, { filled: true, caption: E.cap }) + (E.after ? `<p>${E.after}</p>` : '');
    const table = h.ladder(lines, { rows: L.rows, caption: 'Your turn' })
      + (lines.some((l) => l.input && l.fmt === 'pct') ? '<p class="small">Type a percentage like 4.5%. Start a negative number with a minus sign.</p>' : '');
    const parts = [{ html: '', field: 'table' }];
    if (v.choice) parts.push({ html: '', field: 'choice' });
    return { title: v.title, place: v.place, body: v.body, example, table, parts, choice: v.choice,
      helpLabels: ['Show me the first blank', 'Show me every line'] };
  }

  // Common slips, per line, phrased with the student's own numbers.
  function diagFor(t, l) {
    const D = [], r = t.r, rr = dec(r || 0);
    if (l.label === 'Interest' || l.label === 'Interest now' || l.label === 'Extra interest') {
      const base = l.label === 'Interest now' ? t.D0 : t.L;
      D.push([base * r * 100, 'whole', `Use the rate as a decimal: ${pc(r)} = ${rr}. ${m0(base)} × ${rr}.`]);
      if (t.I) D.push([t.I * r, 'cost', `Charge interest only on the loan, ${m0(t.L)}, not on the gyms’ whole cost.`]);
      if (t.own) D.push([t.own * r, 'own', `Charge interest on the loan, ${m0(t.L)}, not on the owners’ money.`]);
      if (l.label === 'Extra interest') D.push([(t.D0 + t.L) * r, 'total', `That is all the interest after the loan. The extra interest is on the new loan alone: ${m0(t.L)} × ${rr}.`]);
      if (l.label === 'Interest now') D.push([(t.D0 + t.L) * r, 'total', `That includes the new loan. Interest now is on what Cragline owes today: ${m0(t.D0)} × ${rr}.`]);
    }
    if (/^Owners’ profit/.test(l.label)) { const i = t.L * r, op = /good/.test(l.label) ? t.G : t.B;
      D.push([op, 'noint', `Subtract the interest, ${m0(i)}, from ${m0(op)}.`], [op + i, 'plus', `Subtract the interest, don’t add it: ${m0(op)} − ${m0(i)}.`]);
      if (/bad/.test(l.label)) D.push([t.G - i, 'good', `That uses the good year. In a bad year the gyms earn ${m0(t.B)}.`]); }
    if (/^Owners’ return/.test(l.label)) { const i = t.L * r, op = /good/.test(l.label) ? t.G : t.B, prof = op - i;
      D.push([prof / t.I, 'cost', `Divide by the owners’ money, ${m0(t.own)}, not by the whole cost.`], [op / t.own, 'noint', `Take the interest off first: (${m0(op)} − ${m0(i)}) ÷ ${m0(t.own)}.`],
        [prof / t.L, 'loan', `Divide by the owners’ money, ${m0(t.own)}, not by the loan.`]); }
    if (l.label === 'Interest tax saving') { const i = t.L * r;
      D.push([i, 'int', `That is the interest itself. The saving is the interest × the tax rate: ${m0(i)} × ${dec(t.tax)}.`], [i * (1 - t.tax), 'after', `That is the interest after the saving. The saving itself is ${m0(i)} × ${dec(t.tax)}.`],
        [i * t.tax * 100, 'whole', `Use the tax rate as a decimal: ${pc(t.tax)} = ${dec(t.tax)}.`]); }
    if (l.label === 'Interest after the tax saving') { const i = t.L * r;
      D.push([i * (1 + t.tax), 'plus', 'Subtract the tax saving from the interest, don’t add it.'], [i * t.tax, 'saving', `That is the saving. Take it off the interest: ${m0(i)} − ${m0(i * t.tax)}.`]); }
    if (l.label === 'Coverage now') D.push([t.D0 * r / t.OI, 'flip', `Divide operating profit by interest: ${m0(t.OI)} ÷ ${m0(t.D0 * r)}.`]);
    if (l.label === 'Coverage after the new loan') { const i0 = t.D0 * r, x = t.L * r;
      D.push([t.OI / x, 'newonly', `Divide by all the interest after the loan, the interest now plus the extra: ${m0(t.OI)} ÷ (${m0(i0)} + ${m0(x)}).`],
        [t.OI / i0, 'now', 'That is the coverage now. After the loan, add the extra interest to the interest now.'],
        [(i0 + x) / t.OI, 'flip', `Divide operating profit by interest: ${m0(t.OI)} ÷ ${m0(i0 + x)}.`]); }
    if (l.label === 'Free cash flow') D.push([t.cfo + t.capex, 'plus', 'Subtract capital spending from cash from operations, don’t add it.'], [t.cfo, 'cfo', `Take capital spending, ${m0(t.capex)}, off cash from operations.`]);
    if (l.label === 'Cash returned to owners') D.push([t.div, 'div', `Add the buybacks, ${m0(t.buy)}, to the dividends.`], [t.buy, 'buy', `Add the dividends, ${m0(t.div)}, to the buybacks.`],
      [Math.abs(t.buy - t.div), 'minus', 'Add dividends and buybacks together.']);
    if (l.label === 'Payout share') { const f = t.cfo - t.capex, ret = t.div + t.buy;
      D.push([f / ret, 'flip', `Divide cash returned by free cash flow: ${m0(ret)} ÷ ${m0(f)}.`], [ret / t.cfo, 'cfo', `Divide by free cash flow, ${m0(f)}, not by cash from operations.`]); }
    return D;
  }

  const plain = (s) => String(s).replace(/<[^>]+>/g, '');
  function judgeTask(t, e, h) {
    const lines = linesFor(t), rows = e.rows || [], rowRes = [];
    lines.forEach((l, i) => {
      if (!l.input) return;
      const other = `${plain(l.calc)}.`;
      const neg = l.value < 0 ? 'The owners lose money here, so the answer is negative. Start it with a minus sign.' : undefined;
      const opts = l.fmt === 'pct' ? { tol: 0.0006, scale: Math.abs(l.value), unreadable: 'Type a percentage, like 4.5%.', closeMsg: 'Close. Keep two decimal places in the percentage.', otherMsg: other, signMsg: neg }
        : l.fmt === 'num' ? { tol: 0.051, scale: 100, unreadable: 'Type the coverage as a number, like 2.5.', otherMsg: other }
          : { tol: Math.max(1, 0.001 * Math.abs(l.value)), scale: Math.abs(l.value), otherMsg: other,
            signMsg: l.label === 'Cash left after payouts' ? 'Free cash flow minus cash returned. When more cash goes out than came in, the answer is negative.' : neg };
      const v = l.fmt === 'pct' ? pctIn(h, rows[i], l.value) : h.parseMoney(rows[i]);
      rowRes[i] = h.judgeNumber(v, l.value, diagFor(t, l), opts);
    });
    const bad = rowRes.findIndex((x) => x && !x.ok);
    if (bad >= 0) return { ok: false, rowRes, msg: `${plain(lines[bad].label)}: ${rowRes[bad].msg}` };
    if (t.decision && e.choice !== t.decision) {
      if (!e.choice) return { ok: false, rowRes, msg: 'Now answer the question under the table.' };
      return { ok: false, rowRes, msg: t.id === 'cv2' ? `Compare your coverage after the loan, ${cv(t.answer)}, with the bank’s 2. Which is bigger?`
        : `Compare your payout share, ${p2(t.answer)}, with 100%. Which is bigger?` };
    }
    return { ok: true, rowRes };
  }

  function helpText(t, lvl) {
    const lines = linesFor(t), blanks = lines.filter((l) => l.input);
    const say = (l) => `${l.label}: ${l.calc} = ${show(l)}`;
    return lvl === 1 ? say(blanks[0]) : lines.map(say).join('<br>');
  }
  function praise(t) {
    const L = linesFor(t), v = (i) => (L[i].input ? show(L[i]) : L[i].value);
    if (t.id === 'or1') return `With a little debt, the owners earn ${v(2)} in a good year and ${v(4)} in a bad one.`;
    if (t.id === 'or2') return `With a lot of debt, the owners earn ${v(2)} in a good year and ${v(4)} in a bad one. The interest is due either way, so the swing is wider than Plan A’s.`;
    if (t.id === 'tx1') return `The government pays ${pc(t.tax)} of Plan A’s interest, so the loan really costs ${v(2)} a year.`;
    if (t.id === 'tx2') return `Plan B’s interest saves ${v(1)} of tax, so it really costs ${v(2)} a year.`;
    if (t.id === 'cv1') return `After Plan A, a bad year’s profit still covers the interest ${v(3)} times, so the bank would lend.`;
    if (t.id === 'cv2') return `After Plan B, a bad year’s profit covers the interest ${v(3)} times, ${t.decision === 'yes' ? 'so the bank would lend' : 'below the bank’s 2, so the bank would say no'}.`;
    if (t.id === 'ps1') return `Cragline handed back ${v(2)} of its free cash flow last year${t.answer > 1 ? ', more than it brought in' : ''}.`;
    if (t.id === 'ps2') return `The plan hands back ${v(2)} of free cash flow. ${t.decision === 'yes' ? 'Cragline can pay for it from its own cash.' : 'Cragline would have to borrow or spend its savings to pay for it.'}`;
  }
  const typed = (l, k) => (l.fmt === 'pct' ? p2(l.value * k) : l.fmt === 'num' ? cv(l.value * k) : String(Math.round(l.value * k)));
  function selfAnswer(t) { const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = typed(l, 1); }); return { rows, choice: t.decision || null }; }
  function selfWrong(t) { const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = typed(l, 1.3); }); return { rows, choice: t.decision || null }; }

  root.DESK = {
    app: 'finan4-u12-leverage-desk', version: 3, seedVersion: 3, salt: 'rize-finan4-u12-leverage:c41d07', points: 20,
    storageKey: 'rize-finan4-u12-leverage-v3', filePrefix: 'LeverageDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-leverage-desk/verify.html',
    calcPlaceholder: '(150000-60000)/4000000',
    story: { title: 'The Leverage Desk', kicker: 'Corporate Finance, Unit 12', company: 'Cragline Climbing', team: 'Finance Team',
      from: 'Pilar Zamora', fromTitle: 'chief financial officer, Cragline Climbing',
      dek: 'Cragline Climbing, a chain of indoor climbing gyms, wants to open new gyms and also has cash to spare. Pilar Zamora, its chief financial officer, has to tell the board how much to borrow for the new gyms and how much cash to hand back to the owners. You run the numbers with her.',
      whatBox: '',
      stepsLine: 'Eleven short steps. Each shows a worked example in the same table you fill in, then you do the same calculation with your own numbers.' },
    steps: STEPS, quiz: QUIZ, walk: null, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong, ROUND, linesFor, EXAMPLES,
    note: { title: 'A note for the board', label: 'Your note to Pilar', minWords: 30, receiptHeading: 'Note to the chief financial officer',
      prompt: 'The board votes next week. Should Cragline borrow for the new gyms with Plan A or Plan B? Use the owners’ bad-year return and the bank’s coverage check. Then say whether next year’s payout plan can go ahead, using its payout share.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
