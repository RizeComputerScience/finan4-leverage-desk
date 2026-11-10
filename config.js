/* The Leverage Desk: FINAN IV Unit 12 (debt, equity and payouts). Config for lib/coursedev/desk-engine.
   Owners' return as debt rises in a good and a bad year, interest coverage, how much to borrow, and a dividend
   against a buyback for the same cash. Worked example = the reading's food truck.
   Names swept for reuse 2026-11-04 (case_reuse.py): Cragline Climbing, Cragline, Pilar Zamora, Pilar, Zamora, all clean.
   Rework 2026-11-06 (Samuel's Unit 10 review, design/course-principles.md; standards rules 17 to 23):
   - Round seeds. The gyms cost a round $10M to $30M, the rate is 5, 8 or 10% (never the exam-style question's 7%, and the largest loan is whole dollars),
     good- and bad-year profit are whole or half percents of the cost. Part 2 uses round share counts, prices that
     divide the cash evenly, and dividends in half dollars.
   - A 2 to 4 line worked `example` on every task, at 4% and on a $1,000,000 gym or a 2,000,000-share company, so it never
     matches a task, the reading or the exam-style question.
   - `parts` on Plan B (table, then the bad-year question), coverage (table, then which plans pass) and the buyback
     (table, then what a share is worth).
   - Every row names its cells; feedback quotes the student's own numbers; the engine's tolerance sentence is overridden.
   - No step lacks a right answer, so none uses `autosave`. Every number is fictional, so there are no `sources`.
   seedVersion and version moved to 2, so saved progress and receipts from v1 do not carry over. */
(function (root) {
  'use strict';
  const QUIZ = [
    { title: 'Quick win: borrowing to own more',
      q: 'Buying stock with money borrowed from a broker and starting a business with a bank loan have the same effect on the owner’s return. What is it?',
      options: ['Good years get better and bad years get worse', 'Every year gets better', 'The owner’s risk goes down', 'Nothing changes, because the loan is paid back'],
      answer: 0,
      why: ['Right. The loan stays the same size whatever happens, so the owner keeps all the gain above the interest and takes all the loss below it.',
        'Only good years get better. In a bad year the interest is still due, so the owner’s return falls further than it would with no loan.',
        'Borrowing raises the owner’s risk. The owner’s return swings more widely, in both directions.',
        'The interest is due every year, and the owner keeps every dollar of gain or loss on the borrowed money. That changes the owner’s return a lot.'] },
    { title: 'Quick win: interest and taxes',
      q: 'Cragline pays $400,000 of interest this year, and its tax rate is 25%. Interest comes off profit before tax is worked out. How much lower is Cragline’s tax bill because of the interest?',
      options: ['$100,000', '$400,000', '$300,000', '$0'],
      answer: 0,
      why: ['Right. Every $100 of interest cuts a 25% tax bill by $25, so $400,000 of interest saves $100,000 of tax. That is one reason companies borrow.',
        '$400,000 is the interest itself. The tax saving is the tax rate times the interest: 25% × $400,000.',
        '$300,000 is what the interest costs Cragline after the tax saving. The saving itself is 25% × $400,000.',
        'Interest is taken off before tax is worked out, so it does lower the tax bill: by 25% × $400,000.'] },
    { title: 'Quick win: dividends and buybacks',
      q: 'Cragline can hand cash back to its owners as a regular dividend or as a buyback. Which one is harder to cut back next year without upsetting investors?',
      options: ['A regular dividend', 'A buyback', 'Both are equally hard to cut', 'Neither, because investors ignore both'],
      answer: 0,
      why: ['Right. Investors treat a regular dividend as a promise, so a cut reads as bad news. Buybacks can grow or stop from year to year.',
        'Buybacks rise and fall from year to year, and investors expect that. A regular dividend is the one investors count on.',
        'Investors count on a regular dividend in a way they do not count on a buyback, so cutting the dividend is harder.',
        'Investors watch both closely. A regular dividend is the one they count on, so cutting it is harder.'] },
    { title: 'Exam-style question',
      q: 'A gym chain cost $5,000,000. It borrowed $3,000,000 at 7% interest, and its owners put in the other $2,000,000. In a bad year it earns $150,000 of operating profit. What is the owners’ return that year?',
      options: ['−3.0%', '3.0%', '7.5%', '−1.2%'],
      answer: 0,
      why: ['Right. Interest is 7% × $3,000,000 = $210,000. The owners’ profit is $150,000 − $210,000 = −$60,000, and −$60,000 ÷ $2,000,000 = −3.0%. Questions on the exams look like this one.',
        '3.0% divides the operating profit by the whole $5,000,000 and ignores the loan. Subtract the interest, then divide by the owners’ money.',
        '7.5% divides the operating profit by the owners’ money but forgets the $210,000 of interest. Subtract it first.',
        '−1.2% divides the owners’ loss by the whole $5,000,000. The owners only put in $2,000,000, so divide by that.'] },
  ];

  const STEPS = [
    { id: 'walk', label: 'Worked example', kind: 'walk' },
    { id: 'q1', label: 'Check 1', kind: 'check', quiz: 0 },
    { id: 't1', label: 'A little debt', kind: 'task' },
    { id: 't2', label: 'A lot of debt', kind: 'task' },
    { id: 'q2', label: 'Check 2', kind: 'check', quiz: 1 },
    { id: 't3', label: 'Interest coverage', kind: 'task' },
    { id: 't4', label: 'How much to borrow', kind: 'task' },
    { id: 'q3', label: 'Check 3', kind: 'check', quiz: 2 },
    { id: 't5', label: 'A dividend', kind: 'task' },
    { id: 't6', label: 'A buyback', kind: 'task' },
    { id: 'q4', label: 'Exam-style question', kind: 'check', quiz: 3 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];
  const COVER = 2;   // the bank's minimum interest coverage in a bad year

  // Round seed sets (the tests read these). Percents are of the gyms' cost.
  const ROUND = {
    I: [10000000, 15000000, 20000000, 25000000, 30000000], r: [0.05, 0.08, 0.10],
    gp: [12, 13, 14, 15, 16, 17, 18, 19, 20], bp: [2, 2.5, 3, 3.5, 4, 4.5, 5],
    N: [1000000, 1500000, 2500000, 4000000, 5000000], P: [20, 25, 40, 50], d: [0.5, 1, 1.5, 2], eps0: [1, 1.5, 2, 2.5, 3],
  };

  function buildTasks(rng, h) {
    const T = [];
    // Part 1: the new gyms. Redraw until no answer sits on a knife edge (Plan B coverage of 0.5 makes a dropped
    // minus sign look like a forgotten interest charge); the fallback is a valid draw.
    let I = 20000000, r = 0.08, G = 3000000, B = 600000;
    for (let tries = 0; tries < 200; tries++) {
      const i = h.pick(rng, ROUND.I), rr = h.pick(rng, ROUND.r), g = i * h.pick(rng, ROUND.gp) / 100, b = i * h.pick(rng, ROUND.bp) / 100;
      const cA = b / (0.2 * i * rr), cB = b / (0.6 * i * rr), aBad = (b - 0.2 * i * rr) / (0.8 * i);
      if (Math.abs(cA - COVER) > 0.2 && Math.abs(cB - 1) > 0.08 && Math.abs(cB - 0.5) > 0.05 && Math.abs(aBad) > 0.008 && rr - b / i >= 0.01) { I = i; r = rr; G = g; B = b; break; } }
    const D1 = 0.2 * I, D2 = 0.6 * I;
    const plan = (D) => { const E = I - D, int = D * r; return { D, E, int, gRet: (G - int) / E, bRet: (B - int) / E, gCov: G / int, bCov: B / int }; };
    const A = plan(D1), Bp = plan(D2), none = { gRet: G / I, bRet: B / I };
    const base = { I, r, G, B, A, Bp, none };
    T.push(Object.assign({ id: 't1', P: A }, base));
    T.push(Object.assign({ id: 't2', P: Bp, decision: B >= Bp.int ? 'yes' : 'no' }, base));
    const passA = A.bCov >= COVER, passB = Bp.bCov >= COVER;
    T.push(Object.assign({ id: 't3', decision: passA && passB ? 'both' : passA ? 'onlyA' : passB ? 'onlyB' : 'neither' }, base));
    const maxInt = B / COVER;
    T.push(Object.assign({ id: 't4', maxInt, answer: maxInt / r }, base));
    // Part 2: a year later, spare cash to hand back. The cash always buys a whole number of shares.
    let N = 2500000, P = 40, d = 1, eps0 = 2;
    for (let tries = 0; tries < 200; tries++) {
      const n = h.pick(rng, ROUND.N), p = h.pick(rng, ROUND.P), dd = h.pick(rng, ROUND.d), e0 = h.pick(rng, ROUND.eps0);
      const bought = n * dd / p, gap = e0 * n / (n - bought) - e0;
      if (gap >= 0.03 && p / e0 >= 8 && p / e0 <= 40) { N = n; P = p; d = dd; eps0 = e0; break; } }
    const C = N * d, E = N * eps0;
    const part2 = { N, P, d, C, E, eps0 };
    T.push(Object.assign({ id: 't5', px: P - d, owner: 100 * P }, base, part2));
    const bought = C / P, left = N - bought;
    T.push(Object.assign({ id: 't6', bought, left, eps1: E / left, decision: 'same' }, base, part2));
    return T;
  }

  const m = (x, dp) => root.DeskEngine.h.money(x, dp);
  const n0 = (x) => Math.round(x).toLocaleString('en-US');
  const pc = (x) => (Math.round(x * 1000) / 10) + '%';
  const p1 = (x) => (x < 0 ? '−' : '') + (Math.round(Math.abs(x) * 1000) / 10).toFixed(1) + '%';
  const p2 = (x) => (x < 0 ? '−' : '') + (Math.round(Math.abs(x) * 10000) / 100).toFixed(2) + '%';
  const x1 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  const cell = (L, y, label, ph) => `<label class="sr-only" for="r${y}">${label}</label><input id="r${y}" class="rowin" data-row="${y}" inputmode="decimal" autocomplete="off"${ph ? ` placeholder="${ph}"` : ''} value="${(L.rows || [])[y] ? String(L.rows[y]).replace(/"/g, '') : ''}"><span class="mark" id="mk${y}"></span>`;
  const kv = (rows, caption) => `<div class="tw"><table class="cf"><caption>${caption}</caption><tbody>${rows.map((x) => `<tr><td class="lbl">${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</tbody></table></div>`;

  // Percentages: "23%", "23" and "23.0" all mean 23%. A bare decimal like 0.23 is read as 0.23% and gets a hint.
  function judgePct(h, raw, exact, diag, opts) {
    const s = String(raw == null ? '' : raw); const v = h.parseMoney(s); const frac = s.includes('%') ? v : v / 100;
    const res = h.judgeNumber(frac, exact, diag || [], Object.assign({ tol: 0.0006, unreadable: 'Type a percentage, like 12.5%.' }, opts || {}));
    if (!res.ok && isFinite(v) && !s.includes('%') && Math.abs(v - exact) <= 0.0006) return { ok: false, code: 'decimal', msg: `Type it as a percentage: ${s} as a decimal is ${p1(v)}.` };
    return res;
  }
  const judgeX = (h, raw, exact, diag, otherMsg) => h.judgeNumber(h.parseMoney(String(raw == null ? '' : raw).replace(/x$/i, '')), exact, diag, { tol: 0.006, unreadable: 'Type a number of times, like 2.5.', otherMsg });

  const facts = (t) => kv([['Cost of the new gyms, paid today', m(t.I)], ['Interest rate on the bank loan', pc(t.r)], ['Operating profit in a good year', m(t.G)], ['Operating profit in a bad year', m(t.B)]], 'Cragline’s new gyms');
  const planTable = (L, cap) => `<div class="tw"><table class="cf"><caption>${cap}</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
    <tr><td class="lbl">Interest a year (loan × interest rate)</td><td>${cell(L, 1, 'Interest a year', '$0')}</td></tr>
    <tr><td class="lbl">Owners’ money (cost − loan)</td><td>${cell(L, 2, 'Owners’ money', '$0')}</td></tr>
    <tr><td class="lbl">Owners’ return in a good year: (good-year operating profit − interest) ÷ owners’ money</td><td>${cell(L, 3, 'Owners’ return in a good year', '0.0%')}</td></tr>
    <tr class="total hl"><td class="lbl">Owners’ return in a bad year: (bad-year operating profit − interest) ÷ owners’ money</td><td>${cell(L, 4, 'Owners’ return in a bad year', '0.0%')}</td></tr></tbody></table></div>
    <p class="small">Type the returns as percentages, like 12.5%. Start a loss with a minus sign.</p>`;

  function taskView(t, L, h) {
    if (t.id === 't1') return { title: 'Plan A: a little debt', place: 'Cragline is opening a group of new gyms, and the board must decide how to pay for them.',
      body: `<p>Plan A borrows <b>${m(t.P.D)}</b> from the bank. The owners put in the rest. Ignore taxes in this desk.</p>${facts(t)}`,
      example: `<p>A $1,000,000 gym borrows $200,000 at 4%. Interest = $200,000 × 4% = $8,000 a year.</p>
        <p>Owners’ money = $1,000,000 − $200,000 = $800,000.</p>
        <p>Good year, $128,000 of operating profit: ($128,000 − $8,000) ÷ $800,000 = 15.0%.</p>
        <p>Bad year, $24,000 of operating profit: ($24,000 − $8,000) ÷ $800,000 = 2.0%.</p>`,
      table: planTable(L, `Plan A: borrow ${m(t.P.D)}`),
      helpLabels: ['Show me the interest and owners’ money', 'Show me every row'] };
    if (t.id === 't2') return { title: 'Plan B: a lot of debt', place: 'One board member wants to borrow most of the money and keep the owners’ stake small.',
      body: `<p>Plan B borrows <b>${m(t.P.D)}</b> from the bank. The owners put in the rest.</p>${facts(t)}`,
      example: `<p>A $1,000,000 gym borrows $600,000 at 4%. Interest = $600,000 × 4% = $24,000 a year.</p>
        <p>Owners’ money = $1,000,000 − $600,000 = $400,000.</p>
        <p>Bad year, $16,000 of operating profit: ($16,000 − $24,000) ÷ $400,000 = −2.0%.</p>
        <p>$16,000 is less than the $24,000 of interest, so operating profit does not cover the interest.</p>`,
      parts: [{ html: '', field: 'table' }, { html: '', field: 'choice' }],
      table: planTable(L, `1. Plan B: borrow ${m(t.P.D)}`),
      choice: { legend: `2. In a bad year Cragline earns ${m(t.B)} of operating profit. Does that cover Plan B’s interest?`, options: [['yes', 'Yes, operating profit is at least the interest'], ['no', 'No, the interest is more than the operating profit']] },
      helpLabels: ['Show me the interest and owners’ money', 'Show me every row'] };
    if (t.id === 't3') return { title: 'What the bank checks', place: 'Before it lends, Cragline’s bank asks how many times operating profit covers the interest.',
      body: `<p><b>Interest coverage</b> = operating profit ÷ interest. The bank looks at a bad year, because the interest is due either way, and wants coverage of at least <b>${COVER}</b>.</p>
        <div class="tw"><table class="cf"><caption>What you know from Plans A and B</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Plan A</th><th scope="col">Plan B</th></tr></thead><tbody>
        <tr><td class="lbl">Bank loan</td><td>${m(t.A.D)}</td><td>${m(t.Bp.D)}</td></tr><tr><td class="lbl">Interest a year</td><td>${m(t.A.int)}</td><td>${m(t.Bp.int)}</td></tr>
        <tr><td class="lbl">Operating profit in a bad year</td><td>${m(t.B)}</td><td>${m(t.B)}</td></tr></tbody></table></div>`,
      example: `<p>A gym earns $80,000 of operating profit in a bad year, and its bank wants coverage of at least 2.</p>
        <p>With $20,000 of interest: $80,000 ÷ $20,000 = 4.00. That is at least 2, so it passes.</p>
        <p>With $50,000 of interest: $80,000 ÷ $50,000 = 1.60. That is below 2, so it fails.</p>`,
      parts: [{ html: '', field: 'table' }, { html: '', field: 'choice' }],
      table: `<div class="tw"><table class="cf"><caption>1. Interest coverage in a bad year, to two decimal places</caption><thead><tr><th scope="col" style="text-align:left">Plan</th><th scope="col">Coverage (times)</th></tr></thead><tbody>
        <tr><td class="lbl">Plan A (bad-year operating profit ÷ Plan A interest)</td><td>${cell(L, 1, 'Plan A coverage in a bad year', '0.00')}</td></tr><tr><td class="lbl">Plan B (bad-year operating profit ÷ Plan B interest)</td><td>${cell(L, 2, 'Plan B coverage in a bad year', '0.00')}</td></tr></tbody></table></div>`,
      choice: { legend: `2. Which plans give coverage of at least ${COVER} in a bad year?`, options: [['both', 'Both plans'], ['onlyA', 'Only Plan A'], ['onlyB', 'Only Plan B'], ['neither', 'Neither plan']] },
      helpLabels: ['Show me Plan A', 'Show me both plans'] };
    if (t.id === 't4') return { title: 'How much can Cragline borrow?', place: 'Pilar wants the largest loan the bank would still accept.',
      body: kv([['Operating profit in a bad year', m(t.B)], ['Coverage the bank wants, at least', String(COVER)], ['Interest rate on the loan', pc(t.r)]], 'What the bank asks'),
      example: `<p>A gym earns $80,000 in a bad year. Its bank wants coverage of 2 and charges 4%.</p>
        <p>Most interest = $80,000 ÷ 2 = $40,000 a year.</p>
        <p>Largest loan = $40,000 ÷ 4% = $1,000,000.</p>`,
      value: { label: `The largest loan the bank would accept (bad-year operating profit ÷ ${COVER} ÷ interest rate)`, help: 'Round to the nearest dollar.' } };
    if (t.id === 't5') return { title: 'Hand the cash back as a dividend', place: 'A year later the new gyms are open, and Cragline has spare cash it does not need.',
      body: `<p>Cragline’s shares trade on the stock market. In a <b>dividend</b>, the cash is split evenly across every share, and once it leaves the company each share is worth that much less. Ignore taxes.</p>
        ${kv([['Shares', n0(t.N)], ['Share price', m(t.P, 2)], ['Spare cash to hand back', m(t.C)]], 'Cragline today')}`,
      example: `<p>A company has 2,000,000 shares at $30 and hands back $1,000,000.</p>
        <p>Dividend per share = $1,000,000 ÷ 2,000,000 = $0.50.</p>
        <p>Price after = $30.00 − $0.50 = $29.50.</p>
        <p>An owner of 100 shares has 100 × $29.50 + 100 × $0.50 = $3,000.</p>`,
      table: `<div class="tw"><table class="cf"><caption>A dividend of ${m(t.C)}</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Dividend per share (cash ÷ shares)</td><td>${cell(L, 1, 'Dividend per share', '$0.00')}</td></tr>
        <tr><td class="lbl">Share price right after the dividend (share price − dividend per share)</td><td>${cell(L, 2, 'Share price right after the dividend', '$0.00')}</td></tr>
        <tr class="total hl"><td class="lbl">An owner of 100 shares now has (100 × price after + 100 × dividend per share)</td><td>${cell(L, 3, 'What an owner of 100 shares has', '$0')}</td></tr></tbody></table></div>`,
      helpLabels: ['Show me the dividend per share', 'Show me every row'] };
    if (t.id === 't6') return { title: 'Or hand it back as a buyback', place: 'A board member asks what happens if Cragline buys back shares with the same cash instead.',
      body: `<p>In a <b>buyback</b>, Cragline uses the cash to buy its own shares from owners who want to sell. Ignore the interest the cash would have earned.</p>
        ${kv([['Shares today', n0(t.N)], ['Share price', m(t.P, 2)], ['Cash spent on the buyback', m(t.C)], ['Earnings a year', m(t.E)], ['Earnings per share (EPS) today', m(t.eps0, 2)]], 'Cragline today')}`,
      example: `<p>A company with 2,000,000 shares at $30 spends $1,200,000: $1,200,000 ÷ $30 = 40,000 shares bought back.</p>
        <p>Shares left = 2,000,000 − 40,000 = 1,960,000.</p>
        <p>EPS after = $4,900,000 of earnings ÷ 1,960,000 = $2.50.</p>`,
      parts: [{ html: '', field: 'table' }, { html: '', field: 'choice' }],
      table: `<div class="tw"><table class="cf"><caption>1. A buyback of ${m(t.C)}</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Shares bought back (cash spent ÷ share price)</td><td>${cell(L, 1, 'Shares bought back', '0')}</td></tr>
        <tr><td class="lbl">Shares left (shares today − shares bought back)</td><td>${cell(L, 2, 'Shares left', '0')}</td></tr>
        <tr class="total hl"><td class="lbl">EPS after the buyback (earnings ÷ shares left)</td><td>${cell(L, 3, 'EPS after the buyback', '$0.00')}</td></tr></tbody></table></div>`,
      choice: { legend: `2. After the buyback, what is each remaining share worth? The company is worth ${m(t.C)} less, and there are fewer shares.`, options: [['same', `About ${m(t.P, 2)}, the same as before`], ['more', `More than ${m(t.P, 2)}, because EPS went up`], ['less', `Less than ${m(t.P, 2)}, because the cash is gone`]] },
      helpLabels: ['Show me the shares', 'Show me every row'] };
  }

  function judgeTask(t, e, h) {
    const rows = e.rows || []; const rr = [];
    const firstBad = (names) => { const b = Object.keys(names).map(Number).find((y) => !rr[y].ok); return b ? { ok: false, rowRes: rr, msg: `${names[b]}: ${rr[b].msg}` } : null; };
    if (t.id === 't1' || t.id === 't2') {
      const P = t.P, intWay = `${m(P.D)} × ${pc(t.r)}`, eqWay = `${m(t.I)} − ${m(P.D)}`;
      const gWay = `(${m(t.G)} − ${m(P.int)}) ÷ ${m(P.E)}`, bWay = `(${m(t.B)} − ${m(P.int)}) ÷ ${m(P.E)}`;
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), P.int, [[P.D, 'loan', `That is the loan itself. Interest = loan × interest rate: ${intWay}.`],
        [t.I * t.r, 'whole', `Charge interest on the ${m(P.D)} loan only, not on the whole ${m(t.I)}: ${intWay}.`],
        [P.D * t.r * 100, 'pct', `Turn ${pc(t.r)} into ${t.r} before multiplying: ${m(P.D)} × ${t.r}.`]],
        { minTol: 1, otherMsg: `${intWay}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), P.E, [[P.D, 'loan', `That is the bank’s money. Owners’ money = cost − loan: ${eqWay}.`], [t.I, 'cost', `That is the whole cost. Subtract the loan: ${eqWay}.`]], { otherMsg: `${eqWay}.` });
      rr[3] = judgePct(h, rows[3], P.gRet, [[t.G / P.E, 'noint', `Subtract the ${m(P.int)} of interest first: ${gWay}.`], [(t.G - P.int) / t.I, 'whole', `Divide by the owners’ ${m(P.E)}, not the whole ${m(t.I)}: ${gWay}.`],
        [t.G / t.I, 'none', `That is the return with no loan at all, ${m(t.G)} ÷ ${m(t.I)}. With the loan: ${gWay}.`], [P.bRet, 'bad', `That uses the bad year. This row uses the good year: ${gWay}.`]],
        { otherMsg: `${gWay}.` });
      const sign = t.B < P.int ? `${m(t.B)} is less than the ${m(P.int)} of interest, so the owners lose money and the return starts with a minus sign` : `${m(t.B)} is more than the ${m(P.int)} of interest, so the return is above zero`;
      rr[4] = judgePct(h, rows[4], P.bRet, [[t.B / P.E, 'noint', `Subtract the ${m(P.int)} of interest first: ${bWay}.`], [(t.B - P.int) / t.I, 'whole', `Divide by the owners’ ${m(P.E)}, not the whole ${m(t.I)}: ${bWay}.`],
        [P.gRet, 'good', `That is the good year. Use the bad-year operating profit: ${bWay}.`], [t.B / t.I, 'none', `That is the return with no loan at all. With the loan: ${bWay}.`], [-P.bRet, 'sign', `Check the sign. ${sign}.`]],
        { otherMsg: `${bWay}. It can be negative.` });
      const bad = firstBad({ 1: 'Interest', 2: 'Owners’ money', 3: 'Good year', 4: 'Bad year' }); if (bad) return bad;
      if (t.id === 't2' && e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Now answer question 2, about the bad year.' : `Question 2: compare the bad-year operating profit, ${m(t.B)}, with Plan B’s interest, ${m(P.int)}. Your bad-year return of ${p1(P.bRet)} is ${P.bRet < 0 ? 'below' : 'above'} zero for the same reason.` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't3') {
      const aWay = `${m(t.B)} ÷ ${m(t.A.int)}`, bWay = `${m(t.B)} ÷ ${m(t.Bp.int)}`;
      rr[1] = judgeX(h, rows[1], t.A.bCov, [[t.G / t.A.int, 'good', `That uses the good year, ${m(t.G)}. The bank checks the bad year: ${aWay}.`], [t.A.int / t.B, 'flip', `That is upside down. Divide the operating profit by the interest: ${aWay}.`],
        [t.Bp.bCov, 'swap', `That is Plan B’s coverage. Plan A pays ${m(t.A.int)} of interest: ${aWay}.`]], `${aWay}.`);
      rr[2] = judgeX(h, rows[2], t.Bp.bCov, [[t.G / t.Bp.int, 'good', `That uses the good year, ${m(t.G)}. The bank checks the bad year: ${bWay}.`], [t.Bp.int / t.B, 'flip', `That is upside down. Divide the operating profit by the interest: ${bWay}.`],
        [t.A.bCov, 'swap', `That is Plan A’s coverage. Plan B pays ${m(t.Bp.int)} of interest: ${bWay}.`]], `${bWay}.`);
      const bad = firstBad({ 1: 'Plan A', 2: 'Plan B' }); if (bad) return bad;
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Now answer question 2: which plans would the bank accept?' : `Question 2: Plan A’s coverage is ${x1(t.A.bCov)} and Plan B’s is ${x1(t.Bp.bCov)}. A plan passes only if its coverage is ${COVER} or more.` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't4') {
      const way = `${m(t.B)} ÷ ${COVER} ÷ ${pc(t.r)}`;
      return h.judgeNumber(h.parseMoney(e.value), t.answer, [[t.G / COVER / t.r, 'good', `That uses the good year, ${m(t.G)}. The bank wants coverage of ${COVER} even in a bad year: ${way}.`],
        [t.maxInt, 'int', `${m(t.maxInt)} is the most interest Cragline can pay. Turn it into a loan: ${m(t.maxInt)} ÷ ${pc(t.r)}.`], [t.B / t.r, 'cov1', `That loan gives coverage of only 1. Divide ${m(t.B)} by ${COVER} first: ${way}.`],
        [t.B * COVER / t.r, 'mult', `Divide ${m(t.B)} by ${COVER}; do not multiply: ${way}.`], [t.maxInt / (t.r * 100), 'pct', `Divide by ${t.r}, not by ${Math.round(t.r * 100)}: ${m(t.maxInt)} ÷ ${t.r}.`]],
        { otherMsg: `Most interest = ${m(t.B)} ÷ ${COVER} = ${m(t.maxInt)}. Largest loan = that ÷ ${pc(t.r)}.` });
    }
    if (t.id === 't5') {
      const dWay = `${m(t.C)} ÷ ${n0(t.N)}`, pxWay = `${m(t.P, 2)} − ${m(t.d, 2)}`, oWay = `100 × ${m(t.px, 2)} + 100 × ${m(t.d, 2)}`;
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.d, [[t.C, 'total', `That is the whole amount. Divide it by the number of shares: ${dWay}.`], [t.N / t.C, 'flip', `That is upside down. Divide the cash by the shares: ${dWay}.`]], { tol: 0.0051, otherMsg: `${dWay}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.px, [[t.P, 'same', `The cash has left the company, so each share is worth less: ${pxWay}.`], [t.P + t.d, 'add', `Subtract the dividend per share; do not add it: ${pxWay}.`]], { tol: 0.0051, otherMsg: `${pxWay}.` });
      rr[3] = h.judgeNumber(h.parseMoney(rows[3]), t.owner, [[100 * t.px, 'noCash', `That is the shares alone. Add the cash the owner received: ${oWay}.`], [100 * t.d, 'cashOnly', `That is the cash alone. Add the value of the 100 shares: ${oWay}.`],
        [t.px + t.d, 'one', `That is for one share. The owner has 100: ${oWay}.`]], { tol: 0.5, otherMsg: `${oWay}.` });
      return firstBad({ 1: 'Dividend per share', 2: 'Price after', 3: 'Owner of 100 shares' }) || { ok: true, rowRes: rr };
    }
    if (t.id === 't6') {
      const tolS = { tol: Math.max(1, 0.001 * t.bought) };
      const bWay = `${m(t.C)} ÷ ${m(t.P, 2)}`, lWay = `${n0(t.N)} − ${n0(t.bought)}`, eWay = `${m(t.E)} ÷ ${n0(t.left)}`;
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.bought, [[t.C, 'cash', `That is the cash. Divide it by the share price to get shares: ${bWay}.`], [t.C / t.eps0, 'eps', `Divide by the share price, not by EPS: ${bWay}.`]], Object.assign({ otherMsg: `${bWay}.` }, tolS));
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.left, [[t.N, 'none', `Subtract the shares bought back: ${lWay}.`], [t.N + t.bought, 'add', `Subtract the shares bought back; do not add them: ${lWay}.`]], Object.assign({ otherMsg: `${lWay}.` }, tolS));
      rr[3] = h.judgeNumber(h.parseMoney(rows[3]), t.eps1, [[t.eps0, 'before', `That is EPS before the buyback. Divide the earnings by the shares left: ${eWay}.`], [t.E / t.bought, 'bought', `Divide by the shares left, not the shares bought back: ${eWay}.`]], { tol: 0.0051, otherMsg: `${eWay}.` });
      const bad = firstBad({ 1: 'Shares bought back', 2: 'Shares left', 3: 'EPS after' }); if (bad) return bad;
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Now answer question 2, about what each share is worth.' : `Question 2: the company is now worth ${m(t.N * t.P)} − ${m(t.C)} = ${m(t.N * t.P - t.C)}, spread over ${n0(t.left)} shares. Work out ${m(t.N * t.P - t.C)} ÷ ${n0(t.left)}. EPS went up, but the company shrank as well.` };
      return { ok: true, rowRes: rr };
    }
  }

  function helpText(t, lvl) {
    if (t.id === 't1' || t.id === 't2') { const P = t.P;
      const one = `Interest: ${m(P.D)} × ${pc(t.r)} = ${m(P.int)}. Owners’ money: ${m(t.I)} − ${m(P.D)} = ${m(P.E)}.`;
      return lvl === 1 ? one : `${one}<br>Good year: (${m(t.G)} − ${m(P.int)}) ÷ ${m(P.E)} = ${p1(P.gRet)}.<br>Bad year: (${m(t.B)} − ${m(P.int)}) ÷ ${m(P.E)} = ${p1(P.bRet)}.` +
        (t.id === 't2' ? `<br>The bad-year operating profit of ${m(t.B)} is ${t.decision === 'yes' ? 'at least' : 'less than'} the interest of ${m(P.int)}.` : ''); }
    if (t.id === 't3') { const a = `Plan A: ${m(t.B)} ÷ ${m(t.A.int)} = ${x1(t.A.bCov)}.`;
      return lvl === 1 ? a : `${a}<br>Plan B: ${m(t.B)} ÷ ${m(t.Bp.int)} = ${x1(t.Bp.bCov)}.<br>A plan passes if its coverage is at least ${COVER}.`; }
    if (t.id === 't4') return lvl === 1 ? `Most interest: ${m(t.B)} ÷ ${COVER} = ${m(t.maxInt)} a year.` : `Largest loan: ${m(t.maxInt)} ÷ ${pc(t.r)} = ${m(t.answer)}. In Desmos, two lines: <code>${t.B}/${COVER}</code>, then <code>ans/${t.r}</code>.`;
    if (t.id === 't5') return lvl === 1 ? `${m(t.C)} ÷ ${n0(t.N)} = ${m(t.d, 2)} a share.` : `Dividend: ${m(t.d, 2)}. Price after: ${m(t.P, 2)} − ${m(t.d, 2)} = ${m(t.px, 2)}.<br>Owner of 100 shares: 100 × ${m(t.px, 2)} + 100 × ${m(t.d, 2)} = ${m(t.owner, 2)}.`;
    if (t.id === 't6') return lvl === 1 ? `Shares bought back: ${m(t.C)} ÷ ${m(t.P, 2)} = ${n0(t.bought)}. Shares left: ${n0(t.N)} − ${n0(t.bought)} = ${n0(t.left)}.`
      : `EPS after: ${m(t.E)} ÷ ${n0(t.left)} = ${m(t.eps1, 2)}.<br>Each share is worth (${m(t.N * t.P)} − ${m(t.C)}) ÷ ${n0(t.left)} = ${m(t.P, 2)}, the same as before.`;
    return '';
  }
  function praise(t) {
    if (t.id === 't1') return `With a little debt the owners earn ${p1(t.A.gRet)} in a good year and ${p1(t.A.bRet)} in a bad one. With no loan at all they would earn ${p1(t.none.gRet)} and ${p1(t.none.bRet)}.`;
    if (t.id === 't2') return `More debt widens the swing: ${p1(t.Bp.gRet)} in a good year, ${p1(t.Bp.bRet)} in a bad one. ${t.decision === 'no' ? 'In the bad year the interest is more than the gyms earn, so the owners have to find the cash elsewhere.' : 'Even so, the bad year leaves very little room before the interest is more than the gyms earn.'}`;
    if (t.id === 't3') return `Plan A covers its interest ${x1(t.A.bCov)} times in a bad year and Plan B only ${x1(t.Bp.bCov)} times. ${t.decision === 'onlyA' ? 'The bank would lend for Plan A only.' : 'Neither plan meets the bank’s test, so Cragline would have to borrow less.'}`;
    if (t.id === 't4') return `The bank would lend up to ${m(t.answer)}, ${t.answer > t.A.D ? 'more than Plan A borrows' : 'less than even Plan A borrows'} and well below Plan B’s ${m(t.Bp.D)}.`;
    if (t.id === 't5') return `Each owner gets ${m(t.d, 2)} a share in cash, and each share is worth ${m(t.d, 2)} less. The owner of 100 shares has ${m(t.owner, 2)} either way.`;
    if (t.id === 't6') return `EPS rises from ${m(t.eps0, 2)} to ${m(t.eps1, 2)}, but each share is still worth ${m(t.P, 2)}. The owners who sold got the cash; the rest own a slightly bigger slice of a smaller company.`;
  }
  const pctStr = (x) => (Math.round(x * 10000) / 100).toString() + '%';
  function selfAnswer(t) {
    if (t.id === 't1' || t.id === 't2') return { rows: [null, String(Math.round(t.P.int)), String(Math.round(t.P.E)), pctStr(t.P.gRet), pctStr(t.P.bRet)], choice: t.decision || null };
    if (t.id === 't3') return { rows: [null, x1(t.A.bCov), x1(t.Bp.bCov)], choice: t.decision };
    if (t.id === 't4') return { value: String(Math.round(t.answer)) };
    if (t.id === 't5') return { rows: [null, t.d.toFixed(2), t.px.toFixed(2), t.owner.toFixed(2)] };
    if (t.id === 't6') return { rows: [null, String(Math.round(t.bought)), String(Math.round(t.left)), t.eps1.toFixed(2)], choice: 'same' };
  }
  function selfWrong(t) {
    if (t.id === 't1' || t.id === 't2') { const a = selfAnswer(t); a.rows[3] = (100 * t.G / t.P.E).toFixed(1) + '%'; return a; }
    if (t.id === 't3') return { rows: [null, x1(t.G / t.A.int), x1(t.Bp.bCov)], choice: t.decision };
    if (t.id === 't4') return { value: String(Math.round(t.maxInt)) };
    if (t.id === 't5') return { rows: [null, t.d.toFixed(2), t.P.toFixed(2), t.owner.toFixed(2)] };
    if (t.id === 't6') { const a = selfAnswer(t); a.choice = 'more'; return a; }
  }

  const WALK = {
    title: 'The food truck, with a little debt and a lot',
    intro: '<p>The food truck from the reading cost <b>$100,000</b>. It earns <b>$20,000</b> of operating profit (profit before interest and taxes) in a good year and <b>$4,000</b> in a bad one. The bank charges <b>8%</b>.</p>',
    render(stage) {
      const head = '<thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">A little debt</th><th scope="col">A lot of debt</th></tr></thead>';
      if (stage < 2) {
        const rows = [['Bank loan', '$20,000', '$80,000', 0], ['Interest a year (loan × 8%)', '$1,600', '$6,400', 0], ['Owners’ money (cost − loan)', '$80,000', '$20,000', 0],
          ['Owners’ return in a good year: ($20,000 − interest) ÷ owners’ money', '23.0%', '68.0%', 1], ['Owners’ return in a bad year: ($4,000 − interest) ÷ owners’ money', '3.0%', '−12.0%', 1]];
        return `<div class="tw"><table class="cf"><caption>Owners’ return with each loan</caption>${head}<tbody>${rows.filter((r) => r[3] <= stage).map((r) => `<tr class="${r[3] === stage && stage ? 'reveal' : ''}"><td class="lbl">${r[0]}</td><td>${r[1]}</td><td class="${r[2][0] === '−' ? 'neg' : ''}">${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
      }
      if (stage === 2) {
        return `<div class="tw"><table class="cf"><caption>Interest coverage: operating profit ÷ interest</caption>${head}<tbody>
          <tr><td class="lbl">Good year</td><td>$20,000 ÷ $1,600 = 12.50</td><td>$20,000 ÷ $6,400 = 3.13</td></tr>
          <tr class="hl"><td class="lbl">Bad year</td><td>$4,000 ÷ $1,600 = 2.50</td><td class="neg">$4,000 ÷ $6,400 = 0.63</td></tr></tbody></table></div>`;
      }
      return `<div class="tw"><table class="cf"><caption>The largest loan with bad-year coverage of 2</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col" style="text-align:left">Working</th><th scope="col">Result</th></tr></thead><tbody>
        <tr><td class="lbl">Most interest the truck can pay</td><td class="lbl">$4,000 ÷ 2</td><td>$2,000</td></tr><tr class="hl"><td class="lbl">Largest loan</td><td class="lbl">$2,000 ÷ 8%</td><td>$25,000</td></tr></tbody></table></div>`;
    },
    stages: [
      { t: 'Interest and the owners’ money', p: 'With a little debt the owners borrow $20,000, pay $1,600 of interest a year and put in $80,000 of their own. With a lot of debt they borrow $80,000, pay $6,400 a year and put in only $20,000.' },
      { t: 'Good year and bad year', p: 'The interest is the same whether or not it rained. In a good year the heavily borrowed owners earn 68.0% on their money, against 23.0% with a little debt. In a bad year they lose 12.0%, because the truck earned $4,000 but owed the bank $6,400.' },
      { t: 'Interest coverage', p: '<b>Interest coverage</b> is operating profit ÷ interest, the number of times the business could pay its interest. Lenders look hardest at the bad year. With a lot of debt the truck covers its interest only 0.63 times, so the owners have to find the rest of the payment themselves.' },
      { t: 'How much to borrow', p: 'Suppose the bank wants coverage of at least 2 even in a bad year. The truck can then pay at most $4,000 ÷ 2 = $2,000 of interest, and at 8% that is a loan of $2,000 ÷ 0.08 = $25,000. Borrowing more than that leaves too little room for a bad year.' },
    ],
  };

  root.DESK = {
    app: 'finan4-u12-leverage-desk', version: 2, seedVersion: 2, salt: 'rize-finan4-u12-leverage:c41d07', points: 20,
    storageKey: 'rize-finan4-u12-leverage-v1', filePrefix: 'LeverageDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-leverage-desk/verify.html',
    calcPlaceholder: '100*(20000-6400)/20000',
    calcHint: 'Type or tap. Use * to multiply and parentheses to group, so 100*(20000-6400)/20000 is the food truck’s 68% owners’ return with a lot of debt.',
    story: { title: 'The Leverage Desk', kicker: 'Corporate Finance, Unit 12', company: 'Cragline Climbing', team: 'Finance Team',
      from: 'Pilar Zamora', fromTitle: 'chief financial officer, Cragline Climbing',
      dek: 'You have joined the finance team at Cragline Climbing, a chain of indoor climbing gyms. Pilar Zamora, the chief financial officer, has to tell the board how much to borrow for a group of new gyms, and later how to hand spare cash back to the owners.',
      whatBox: '<b>Borrowing works like buying stock with borrowed money.</b> The owners keep more of a good year and lose more in a bad one, because the interest is due either way. Lenders check how many times profit covers the interest. When cash is left over, a dividend and a buyback are two ways to hand it back.',
      stepsLine: 'There are twelve steps: a worked example, six problems with three one-question checks between them, one exam-style question, and a short note to Pilar.' },
    steps: STEPS, quiz: QUIZ, walk: WALK, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong, ROUND,
    note: { title: 'A note for the board', label: 'Your note to Pilar', minWords: 30, receiptHeading: 'Note to the chief financial officer',
      prompt: 'The board votes next week. How much should Cragline borrow for the new gyms: Plan A, Plan B or a different amount? Use the bad-year coverage. Then say whether you would hand next year’s spare cash back as a dividend or a buyback, and give one reason.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
