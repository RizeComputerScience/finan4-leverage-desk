/* The Leverage Desk: FINAN IV Unit 12 (debt, equity and payouts). Config for lib/coursedev/desk-engine.
   Owners' return as debt rises in a good and a bad year, interest coverage, how much to borrow, and a dividend
   against a buyback for the same cash. Worked example = the reading's food truck.
   Names swept for reuse 2026-11-04 (case_reuse.py): Cragline Climbing, Cragline, Pilar Zamora, Pilar, Zamora, all clean. */
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

  function buildTasks(rng, h) {
    const T = []; let I, r, G, B, D1, D2;
    for (let tries = 0; tries < 80; tries++) {   // redraw until no answer sits on a knife edge
      I = h.between(rng, 10000000, 30000000, 1000000); r = h.pick(rng, [0.06, 0.07, 0.08, 0.09]);
      G = h.round(I * (0.12 + 0.08 * rng()), 10000); B = h.round(I * (0.02 + 0.03 * rng()), 10000);
      D1 = h.round(0.2 * I, 100000); D2 = h.round(0.6 * I, 100000);
      const cA = B / (D1 * r), cB = B / (D2 * r);
      if (Math.abs(cA - COVER) > 0.2 && Math.abs(cB - 1) > 0.08 && Math.abs((B - D1 * r) / (I - D1)) > 0.008) break; }
    const plan = (D) => { const E = I - D, int = D * r; return { D, E, int, gRet: (G - int) / E, bRet: (B - int) / E, gCov: G / int, bCov: B / int }; };
    const A = plan(D1), Bp = plan(D2), none = { gRet: G / I, bRet: B / I };
    const base = { I, r, G, B, A, Bp, none };
    T.push(Object.assign({ id: 't1', P: A }, base));
    T.push(Object.assign({ id: 't2', P: Bp, decision: B >= Bp.int ? 'yes' : 'no' }, base));
    const passA = A.bCov >= COVER, passB = Bp.bCov >= COVER;
    T.push(Object.assign({ id: 't3', decision: passA && passB ? 'both' : passA ? 'onlyA' : passB ? 'onlyB' : 'neither' }, base));
    const maxInt = B / COVER;
    T.push(Object.assign({ id: 't4', maxInt, answer: maxInt / r }, base));
    // Part 2: a year later, spare cash to hand back
    const N = h.between(rng, 1000000, 3000000, 250000); const P = h.between(rng, 20, 50, 2);
    const d = h.pick(rng, [0.50, 0.75, 1.00, 1.25, 1.50]); const C = N * d; const eps0 = h.between(rng, 100, 300, 10) / 100; const E = N * eps0;
    const part2 = { N, P, d, C, E, eps0 };
    T.push(Object.assign({ id: 't5', px: P - d, owner: 100 * P }, base, part2));
    const bought = C / P, left = N - bought;
    T.push(Object.assign({ id: 't6', bought, left, eps1: E / left, decision: 'same' }, base, part2));
    return T;
  }

  const m = (x, dp) => root.DeskEngine.h.money(x, dp);
  const n0 = (x) => Math.round(x).toLocaleString('en-US');
  const pc = (x) => Math.round(x * 100) + '%';
  const p1 = (x) => (x < 0 ? '−' : '') + (Math.round(Math.abs(x) * 1000) / 10).toFixed(1) + '%';
  const x1 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  const sgn = (x) => (x >= 0 ? '' : '−') + m(Math.abs(x));
  const cell = (L, y, label, ph) => `<label class="sr-only" for="r${y}">${label}</label><input id="r${y}" class="rowin" data-row="${y}" inputmode="decimal" autocomplete="off"${ph ? ` placeholder="${ph}"` : ''} value="${(L.rows || [])[y] ? String(L.rows[y]).replace(/"/g, '') : ''}"><span class="mark" id="mk${y}"></span>`;

  // Percentages: "23%", "23" and "23.0" all mean 23%. A bare decimal like 0.23 is read as 0.23% and gets a hint.
  function judgePct(h, raw, exact, diag, opts) {
    const s = String(raw == null ? '' : raw); const v = h.parseMoney(s); const frac = s.includes('%') ? v : v / 100;
    const res = h.judgeNumber(frac, exact, (diag || []).map(([val, c, msg]) => [val, c, msg]), Object.assign({ tol: 0.0006, unreadable: 'Type a percentage, like 12.5%.' }, opts || {}));
    if (!res.ok && isFinite(v) && !s.includes('%') && Math.abs(v - exact) <= 0.0006) return { ok: false, code: 'decimal', msg: `Type it as a percentage: ${s} as a decimal is ${p1(v)}.` };
    return res;
  }
  const judgeX = (h, raw, exact, diag, otherMsg) => h.judgeNumber(h.parseMoney(String(raw == null ? '' : raw).replace(/x$/i, '')), exact, diag, { tol: 0.006, unreadable: 'Type a number of times, like 2.5.', otherMsg });

  const facts = (t) => `<div class="tw"><table class="cf"><caption>Cragline’s new gyms</caption><tbody>
    <tr><td class="lbl">Cost of the new gyms, paid today</td><td>${m(t.I)}</td></tr>
    <tr><td class="lbl">Interest rate on the bank loan</td><td>${pc(t.r)}</td></tr>
    <tr><td class="lbl">Operating profit in a good year</td><td>${m(t.G)}</td></tr>
    <tr><td class="lbl">Operating profit in a bad year</td><td>${m(t.B)}</td></tr></tbody></table></div>`;
  const planTable = (L, cap) => `<div class="tw"><table class="cf"><caption>${cap}</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
    <tr><td class="lbl">Interest a year (loan × rate)</td><td>${cell(L, 1, 'Interest a year')}</td></tr>
    <tr><td class="lbl">Owners’ money (cost − loan)</td><td>${cell(L, 2, 'Owners’ money')}</td></tr>
    <tr><td class="lbl">Owners’ return in a good year</td><td>${cell(L, 3, 'Owners’ return in a good year', '0.0%')}</td></tr>
    <tr class="total hl"><td class="lbl">Owners’ return in a bad year</td><td>${cell(L, 4, 'Owners’ return in a bad year', '0.0%')}</td></tr></tbody></table></div>`;

  function taskView(t, L, h) {
    if (t.id === 't1' || t.id === 't2') {
      const lot = t.id === 't2';
      return { title: lot ? 'Plan B: a lot of debt' : 'Plan A: a little debt',
        place: lot ? 'One board member wants to borrow most of the money and keep the owners’ stake small.' : 'Cragline is opening a group of new gyms, and the board must decide how to pay for them.',
        body: `<p>${lot ? 'Plan B' : 'Plan A'} borrows <b>${m(t.P.D)}</b> from the bank. The owners put in the rest. Ignore taxes in this desk.</p>${facts(t)}
          <p>Fill in the four rows. Owners’ return = (operating profit − interest) ÷ owners’ money. Type returns as percentages, like 12.5%.</p>`,
        table: planTable(L, `${lot ? 'Plan B' : 'Plan A'}: borrow ${m(t.P.D)}`),
        choice: lot ? { legend: 'In the bad year, does Cragline’s operating profit cover the interest?', options: [['yes', 'Yes, operating profit is at least the interest'], ['no', 'No, the interest is more than the operating profit']] } : null,
        helpLabels: ['Show me the interest and owners’ money', 'Show me every row'] };
    }
    if (t.id === 't3') return { title: 'What the bank checks', place: 'Before it lends, Cragline’s bank asks how many times operating profit covers the interest.',
      body: `<p><b>Interest coverage</b> = operating profit ÷ interest. The bank cares most about a bad year, because the interest is due either way. It wants coverage of at least <b>${COVER}</b> in a bad year.</p>
        <div class="tw"><table class="cf"><caption>What you know from Plans A and B</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Plan A</th><th scope="col">Plan B</th></tr></thead><tbody>
        <tr><td class="lbl">Bank loan</td><td>${m(t.A.D)}</td><td>${m(t.Bp.D)}</td></tr><tr><td class="lbl">Interest a year</td><td>${m(t.A.int)}</td><td>${m(t.Bp.int)}</td></tr>
        <tr><td class="lbl">Operating profit in a bad year</td><td>${m(t.B)}</td><td>${m(t.B)}</td></tr></tbody></table></div><p>Work out each plan’s bad-year coverage to two decimal places, then say which plans the bank would accept.</p>`,
      table: `<div class="tw"><table class="cf"><caption>Interest coverage in a bad year</caption><thead><tr><th scope="col" style="text-align:left">Plan</th><th scope="col">Coverage (times)</th></tr></thead><tbody>
        <tr><td class="lbl">Plan A</td><td>${cell(L, 1, 'Plan A coverage in a bad year', '0.00')}</td></tr><tr><td class="lbl">Plan B</td><td>${cell(L, 2, 'Plan B coverage in a bad year', '0.00')}</td></tr></tbody></table></div>`,
      choice: { legend: `Which plans give coverage of at least ${COVER} in a bad year?`, options: [['both', 'Both plans'], ['onlyA', 'Only Plan A'], ['onlyB', 'Only Plan B'], ['neither', 'Neither plan']] },
      helpLabels: ['Show me Plan A', 'Show me both plans'] };
    if (t.id === 't4') return { title: 'How much can Cragline borrow?', place: 'Pilar wants the largest loan the bank would still accept.',
      body: `<p>The bank wants interest coverage of at least <b>${COVER}</b> even in a bad year, when operating profit is <b>${m(t.B)}</b>. The loan’s interest rate is <b>${pc(t.r)}</b>.</p>
        <p>First find the most interest Cragline can pay and still have coverage of ${COVER} (bad-year operating profit ÷ ${COVER}). Then find the loan that costs exactly that much interest (interest ÷ rate).</p>`,
      value: { label: 'The largest loan the bank would accept' } };
    if (t.id === 't5') return { title: 'Hand the cash back as a dividend', place: 'A year later the new gyms are open, and Cragline has spare cash it does not need.',
      body: `<p>Cragline’s shares trade on the stock market. The board has <b>${m(t.C)}</b> of spare cash to hand back to its owners. Ignore taxes.</p>
        <div class="tw"><table class="cf"><caption>Cragline today</caption><tbody><tr><td class="lbl">Shares</td><td>${n0(t.N)}</td></tr><tr><td class="lbl">Share price</td><td>${m(t.P, 2)}</td></tr><tr><td class="lbl">Spare cash to hand back</td><td>${m(t.C)}</td></tr></tbody></table></div>
        <p>First try a dividend: the cash is split evenly across every share. Once the cash leaves the company, each share is worth that much less.</p>`,
      table: `<div class="tw"><table class="cf"><caption>A dividend of ${m(t.C)}</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Dividend per share (cash ÷ shares)</td><td>${cell(L, 1, 'Dividend per share', '$0.00')}</td></tr>
        <tr><td class="lbl">Share price right after the dividend</td><td>${cell(L, 2, 'Share price right after the dividend', '$0.00')}</td></tr>
        <tr class="total hl"><td class="lbl">An owner of 100 shares now has (the shares + the cash)</td><td>${cell(L, 3, 'What an owner of 100 shares has')}</td></tr></tbody></table></div>`,
      helpLabels: ['Show me the dividend per share', 'Show me every row'] };
    if (t.id === 't6') return { title: 'Or hand it back as a buyback', place: 'A board member asks what happens if Cragline buys back shares with the same cash instead.',
      body: `<p>In a <b>buyback</b>, Cragline uses the <b>${m(t.C)}</b> to buy its own shares at <b>${m(t.P, 2)}</b> each from owners who want to sell. Cragline earns <b>${m(t.E)}</b> a year, so its earnings per share (EPS) today are ${m(t.eps0, 2)} on ${n0(t.N)} shares. Ignore the interest the cash would have earned.</p>`,
      table: `<div class="tw"><table class="cf"><caption>A buyback of ${m(t.C)}</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Shares bought back (cash ÷ share price)</td><td>${cell(L, 1, 'Shares bought back', '0')}</td></tr>
        <tr><td class="lbl">Shares left</td><td>${cell(L, 2, 'Shares left', '0')}</td></tr>
        <tr class="total hl"><td class="lbl">EPS after the buyback (earnings ÷ shares left)</td><td>${cell(L, 3, 'EPS after the buyback', '$0.00')}</td></tr></tbody></table></div>`,
      choice: { legend: `After the buyback, what is each remaining share worth? (The company is worth ${m(t.C)} less, and there are fewer shares.)`, options: [['same', `About ${m(t.P, 2)}, the same as before`], ['more', `More than ${m(t.P, 2)}, because EPS went up`], ['less', `Less than ${m(t.P, 2)}, because the cash is gone`]] },
      helpLabels: ['Show me the shares', 'Show me every row'] };
  }

  function judgeTask(t, e, h) {
    const rows = e.rows || [];
    if (t.id === 't1' || t.id === 't2') {
      const P = t.P, rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), P.int, [[P.D, 'loan', 'That is the loan itself. Interest is the loan × the rate.'], [t.I * t.r, 'whole', `Charge interest on the loan only, ${m(P.D)}, not on the whole cost.`]],
        { minTol: 1, otherMsg: `${m(P.D)} × ${pc(t.r)}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), P.E, [[P.D, 'loan', 'That is the bank’s money. The owners put in the cost minus the loan.'], [t.I, 'cost', 'That is the whole cost. Subtract the loan.']], { otherMsg: `${m(t.I)} − ${m(P.D)}.` });
      rr[3] = judgePct(h, rows[3], P.gRet, [[t.G / P.E, 'noint', 'Subtract the interest from the operating profit first.'], [(t.G - P.int) / t.I, 'whole', 'Divide by the owners’ money, not the whole cost.'], [t.G / t.I, 'none', 'That is the return with no loan at all. Subtract the interest and divide by the owners’ money.']],
        { otherMsg: `(${m(t.G)} − interest) ÷ owners’ money.` });
      rr[4] = judgePct(h, rows[4], P.bRet, [[t.B / P.E, 'noint', 'Subtract the interest from the bad-year operating profit first.'], [(t.B - P.int) / t.I, 'whole', 'Divide by the owners’ money, not the whole cost.'], [P.gRet, 'good', 'That is the good year. Use the bad-year operating profit.'], [-P.bRet, 'sign', 'Check the sign: is the operating profit bigger or smaller than the interest?']],
        { otherMsg: `(${m(t.B)} − interest) ÷ owners’ money. It can be negative.` });
      const names = ['', 'Interest', 'Owners’ money', 'Good year', 'Bad year'];
      const bad = [1, 2, 3, 4].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${names[bad]}: ${rr[bad].msg}` };
      if (t.id === 't2' && e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Answer the question about the bad year as well.' : `Compare the bad-year operating profit, ${m(t.B)}, with the interest, ${m(P.int)}.` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't3') {
      const rr = [];
      rr[1] = judgeX(h, rows[1], t.A.bCov, [[t.G / t.A.int, 'good', 'That uses the good year. The bank checks the bad year.'], [t.A.int / t.B, 'flip', 'That is upside down. Divide the operating profit by the interest.']], `${m(t.B)} ÷ ${m(t.A.int)}.`);
      rr[2] = judgeX(h, rows[2], t.Bp.bCov, [[t.G / t.Bp.int, 'good', 'That uses the good year. The bank checks the bad year.'], [t.Bp.int / t.B, 'flip', 'That is upside down. Divide the operating profit by the interest.']], `${m(t.B)} ÷ ${m(t.Bp.int)}.`);
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `Plan ${bad === 1 ? 'A' : 'B'}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Say which plans the bank would accept as well.' : `Compare each plan’s coverage with ${COVER}. A plan passes only if its coverage is ${COVER} or more.` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't4') return h.judgeNumber(h.parseMoney(e.value), t.answer, [[t.G / COVER / t.r, 'good', 'That uses the good year. The bank wants coverage of 2 even in a bad year.'],
      [t.maxInt, 'int', `That is the most interest Cragline can pay. Turn it into a loan: ${m(t.maxInt)} ÷ ${pc(t.r)}.`], [t.B / t.r, 'cov1', `That loan gives coverage of only 1. Divide the operating profit by ${COVER} first.`], [t.B * COVER / t.r, 'mult', `Divide the bad-year operating profit by ${COVER}; do not multiply.`]],
      { otherMsg: `Most interest = ${m(t.B)} ÷ ${COVER}. Largest loan = that ÷ ${pc(t.r)}.` });
    if (t.id === 't5') {
      const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.d, [[t.C, 'total', 'That is the whole amount. Divide it by the number of shares.']], { tol: 0.0051, otherMsg: `${m(t.C)} ÷ ${n0(t.N)}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.px, [[t.P, 'same', 'The cash has left the company, so each share is worth less. Subtract the dividend per share.'], [t.P + t.d, 'add', 'Subtract the dividend per share from the price; do not add it.']], { tol: 0.0051, otherMsg: `${m(t.P, 2)} − dividend per share.` });
      rr[3] = h.judgeNumber(h.parseMoney(rows[3]), t.owner, [[100 * t.px, 'noCash', 'Add the cash the owner received: 100 × the dividend per share.'], [100 * t.d, 'cashOnly', 'Add the value of the 100 shares as well.']], { tol: 0.5, otherMsg: '100 × the new price + 100 × the dividend per share.' });
      const bad = [1, 2, 3].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${['', 'Dividend per share', 'Price after', 'Owner of 100 shares'][bad]}: ${rr[bad].msg}` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't6') {
      const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.bought, [[t.C / t.d, 'perShare', 'Divide the cash by the share price, not by the dividend per share.'], [t.C, 'cash', 'That is the cash. Divide it by the share price to get shares.']], { tol: Math.max(1, 0.001 * t.bought), otherMsg: `${m(t.C)} ÷ ${m(t.P, 2)}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.left, [[t.N, 'none', 'Subtract the shares bought back.'], [t.N + t.bought, 'add', 'Subtract the shares bought back; do not add them.']], { tol: Math.max(1, 0.001 * t.bought), otherMsg: `${n0(t.N)} − shares bought back.` });
      rr[3] = h.judgeNumber(h.parseMoney(rows[3]), t.eps1, [[t.eps0, 'before', 'That is EPS before the buyback. Divide the earnings by the shares left.'], [t.E / t.bought, 'bought', 'Divide by the shares left, not the shares bought back.']], { tol: 0.0051, otherMsg: `${m(t.E)} ÷ shares left.` });
      const bad = [1, 2, 3].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${['', 'Shares bought back', 'Shares left', 'EPS after'][bad]}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Answer the question about the share’s value as well.' : `Work it out: the company is worth ${m(t.N * t.P)} − ${m(t.C)}, spread over the shares left. EPS went up, but each share is worth the same.` };
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
    if (t.id === 't4') return lvl === 1 ? `Most interest: ${m(t.B)} ÷ ${COVER} = ${m(t.maxInt)} a year.` : `Largest loan: ${m(t.maxInt)} ÷ ${pc(t.r)} = ${m(t.answer)}. In the calculator: <code>${t.B}/${COVER}/${t.r}</code>.`;
    if (t.id === 't5') return lvl === 1 ? `${m(t.C)} ÷ ${n0(t.N)} = ${m(t.d, 2)} a share.` : `Dividend: ${m(t.d, 2)}. Price after: ${m(t.P, 2)} − ${m(t.d, 2)} = ${m(t.px, 2)}.<br>Owner of 100 shares: 100 × ${m(t.px, 2)} + 100 × ${m(t.d, 2)} = ${m(t.owner, 2)}.`;
    if (t.id === 't6') return lvl === 1 ? `Shares bought back: ${m(t.C)} ÷ ${m(t.P, 2)} = ${n0(t.bought)}. Shares left: ${n0(t.N)} − ${n0(t.bought)} = ${n0(t.left)}.`
      : `EPS after: ${m(t.E)} ÷ ${n0(t.left)} = ${m(t.eps1, 2)}.<br>Each share is worth (${m(t.N * t.P)} − ${m(t.C)}) ÷ ${n0(t.left)} = ${m(t.P, 2)}, the same as before.`;
  }
  function praise(t) {
    if (t.id === 't1') return `With a little debt the owners earn ${p1(t.A.gRet)} in a good year and ${p1(t.A.bRet)} in a bad one. With no loan at all they would earn ${p1(t.none.gRet)} and ${p1(t.none.bRet)}.`;
    if (t.id === 't2') return `More debt widens the swing: ${p1(t.Bp.gRet)} in a good year, ${p1(t.Bp.bRet)} in a bad one. ${t.decision === 'no' ? 'In the bad year the interest is more than the gyms earn, so the owners have to find the cash elsewhere.' : 'Even so, the bad year leaves very little room before the interest is more than the gyms earn.'}`;
    if (t.id === 't3') return `Plan A covers its interest ${x1(t.A.bCov)} times in a bad year and Plan B only ${x1(t.Bp.bCov)} times. ${t.decision === 'onlyA' ? 'The bank would lend for Plan A only.' : 'Neither plan meets the bank’s test, so Cragline would have to borrow less.'}`;
    if (t.id === 't4') return `The bank would lend up to about ${m(t.answer)}, ${t.answer > t.A.D ? 'more than Plan A borrows' : 'less than even Plan A borrows'} and well below Plan B’s ${m(t.Bp.D)}.`;
    if (t.id === 't5') return `Each owner gets ${m(t.d, 2)} a share in cash, and each share is worth ${m(t.d, 2)} less. The owner of 100 shares has ${m(t.owner, 2)} either way.`;
    if (t.id === 't6') return `EPS rises from ${m(t.eps0, 2)} to ${m(t.eps1, 2)}, but each share is still worth ${m(t.P, 2)}. The owners who sold got the cash; the rest own a slightly bigger slice of a smaller company.`;
  }
  function selfAnswer(t) {
    if (t.id === 't1' || t.id === 't2') return { rows: [null, String(Math.round(t.P.int)), String(Math.round(t.P.E)), p1(t.P.gRet).replace('−', '-'), p1(t.P.bRet).replace('−', '-')], choice: t.decision || null };
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
    intro: '<p>Here is the food truck from the reading, worked from start to finish. It cost <b>$100,000</b> to set up. In a good year it earns <b>$20,000</b> of operating profit (profit before interest and taxes). In a bad year, with a rainy spring, it earns only <b>$4,000</b>. Rates have risen since Unit 11, and the bank now charges <b>8%</b> interest.</p>',
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
      { t: 'Good year and bad year', p: 'The interest is the same whether or not it rained. In a good year the heavily borrowed owners earn 68.0% on their money, against 23.0% with a little debt. In a bad year they lose 12.0%: the truck earned $4,000 but owed the bank $6,400.' },
      { t: 'Interest coverage', p: '<b>Interest coverage</b> is operating profit ÷ interest, the number of times the business could pay its interest. Lenders look hardest at the bad year. With a lot of debt the truck covers its interest only 0.63 times, so the owners have to find the rest of the payment themselves.' },
      { t: 'How much to borrow', p: 'Suppose the bank wants coverage of at least 2 even in a bad year. The truck can then pay at most $4,000 ÷ 2 = $2,000 of interest, and at 8% that is a loan of $2,000 ÷ 0.08 = $25,000. Borrowing more than that leaves too little room for a bad year.' },
    ],
  };

  root.DESK = {
    app: 'finan4-u12-leverage-desk', version: 1, seedVersion: 1, salt: 'rize-finan4-u12-leverage:c41d07', points: 20,
    storageKey: 'rize-finan4-u12-leverage-v1', filePrefix: 'LeverageDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-leverage-desk/verify.html',
    calcPlaceholder: '(20000-6400)/20000*100',
    calcHint: 'Type or tap. Use * to multiply and parentheses to group, so (20000-6400)/20000*100 is the food truck’s 68% owners’ return with a lot of debt.',
    story: { title: 'The Leverage Desk', kicker: 'Corporate Finance, Unit 12', company: 'Cragline Climbing', team: 'Finance Team',
      from: 'Pilar Zamora', fromTitle: 'chief financial officer, Cragline Climbing',
      dek: 'You have joined the finance team at Cragline Climbing, a chain of indoor climbing gyms. Pilar Zamora, the chief financial officer, has to tell the board how much to borrow for a group of new gyms, and later how to hand spare cash back to the owners.',
      whatBox: '<b>Borrowing works like buying stock with borrowed money.</b> The owners keep more of a good year and lose more in a bad one, because the interest is due either way. Lenders check how many times profit covers the interest. When cash is left over, a dividend and a buyback are two ways to hand it back.',
      stepsLine: 'There are twelve steps: a worked example, six problems with three one-question checks between them, one exam-style question, and a short note to Pilar.' },
    steps: STEPS, quiz: QUIZ, walk: WALK, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'A note for the board', label: 'Your note to Pilar', minWords: 30, receiptHeading: 'Note to the chief financial officer',
      prompt: 'The board votes next week. How much should Cragline borrow for the new gyms: Plan A, Plan B or a different amount? Use the bad-year coverage. Then say whether you would hand next year’s spare cash back as a dividend or a buyback, and give one reason.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
