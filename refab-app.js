(() => {
  const MOCK = window.REFAB_MOCK;
  const SVC = window.REFAB_SVC;
  const root = document.querySelector('.app');
  if (!root) return;

  document.title = 'REFAB — Highway companion';

  let state = SVC.load();
  let screen = 'home';
  let overlay = null;
  let localForm = {
    vehicle: MOCK.vehicle.registration,
    owner: MOCK.user.name,
    address: MOCK.vehicle.address,
    tollPlaza: MOCK.localPass.nearestPlaza
  };
  let portForm = { newVehicle: 'DL12YY0000' };
  let statusVehicle = MOCK.statusCheckVehicle;
  let routeFrom = MOCK.route.from;
  let routeTo = MOCK.route.to;
  let routePlanned = false;
  let paymentMethod = 'UPI';
  let submitting = false;
  let toast = '';

  const icons = {
    pass: '▣', local: '⌂', pay: '₹', report: '⚠', track: '▤',
    amenity: '⌖', route: '⌘', weather: '☀', emergency: '✚',
    profile: '●', menu: '☰', back: '←'
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

  const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  const progress = (step, total = 4) =>
    Array.from({ length: total }, (_, i) => `<b class="${i < step ? 'on' : ''}"></b>`).join('');

  const titles = {
    home: 'Home', menu: 'Menu', passes: 'My Passes', annual: 'Annual Toll Pass',
    passDetails: 'Pass details', tollPlazas: 'Eligible Toll Plazas',
    local: 'Local Pass', localEligible: 'Local Pass', localForm: 'Local Pass',
    localReview: 'Review', localSuccess: 'Local Pass',
    recharge: 'Buy / Recharge', payment: 'Demo Payment', rechargeSuccess: 'Recharge',
    reportLocation: 'Report an Issue', reportIssue: 'Report an Issue',
    reportDetails: 'Report an Issue', reportReview: 'Review report',
    reportSuccess: 'Report submitted', reports: 'Report Summary', track: 'Track report',
    locationOutside: 'Location', highwaySupport: 'Highway Support',
    amenities: 'Highway Amenities', amenityDetail: 'Amenity',
    route: 'Route Planner', weather: 'Weather', emergency: 'Emergency',
    status: 'FASTag Status', port: 'Annual Pass Porting', portReview: 'Review',
    portSuccess: 'Porting', profile: 'Profile', help: 'Help & FAQs',
    about: 'About REFAB', knowHighway: 'Know Your Highway',
    orderHistory: 'Order History'
  };

  const logo = `<span class="rf-logo" aria-hidden="true"><svg viewBox="0 0 32 32" width="22" height="22"><path d="M4 24c6-12 8-16 12-16s6 4 12 16" fill="none" stroke="#0755a0" stroke-width="2.6" stroke-linecap="round"/><path d="M8 24c4-8 6-11 8-11s4 3 8 11" fill="none" stroke="#0755a0" stroke-width="2.2" stroke-linecap="round"/></svg></span>`;

  const top = (back = true) =>
    `<header class="rf-top">
      ${back
        ? `<button class="rf-icon" aria-label="Go back" data-action="back">${icons.back}</button>`
        : `<button class="rf-icon" aria-label="Open menu" data-go="menu">${icons.menu}</button>`}
      ${logo}
      <div class="rf-title">${titles[screen] || 'REFAB'}</div>
      <button class="rf-avatar" aria-label="Demo profile" data-go="profile">${icons.profile}</button>
    </header>
    <div class="rf-demo" role="status">DEMO MODE · Simulated data only · Independent prototype</div>`;

  const bottom = () =>
    `<nav class="rf-bottom" aria-label="Main navigation">
      <button data-go="home" aria-current="${screen === 'home' ? 'page' : 'false'}">⌂<span>Home</span></button>
      <button data-go="reports" aria-current="${screen === 'reports' ? 'page' : 'false'}">▤<span>Reports</span></button>
      <button data-go="amenities" aria-current="${screen === 'amenities' ? 'page' : 'false'}">⌖<span>Amenities</span></button>
      <button data-go="profile" aria-current="${screen === 'profile' ? 'page' : 'false'}">●<span>Profile</span></button>
    </nav>`;

  const card = (icon, title, copy, go, cls = '') =>
    `<button class="rf-card ${cls}" data-go="${go}" aria-label="${esc(title)}">
      <i aria-hidden="true">${icon}</i><b>${title}</b><small>${copy}</small><em aria-hidden="true">›</em>
    </button>`;

  const primary = (label, action, extra = '') =>
    `<button class="rf-primary" ${extra} data-action="${action}">${label}</button>`;

  const secondary = (label, action, extra = '') =>
    `<button class="rf-secondary" ${extra} data-action="${action}">${label}</button>`;

  const note = (text) => `<p class="rf-note">${text}</p>`;

  const showBottom = () =>
    !['localForm', 'localSuccess', 'payment', 'rechargeSuccess', 'reportLocation',
      'reportIssue', 'reportDetails', 'reportReview', 'reportSuccess',
      'locationOutside', 'highwaySupport', 'portReview', 'portSuccess',
      'amenityDetail', 'passDetails', 'tollPlazas', 'passes'].includes(screen);

  /* ── Screens ── */

  function home() {
    const lp = state.localPass;
    return `<main class="rf-home">${top(false)}
      <section class="rf-plaza" aria-hidden="true">
        <div class="rf-plaza-sky"></div>
        <div class="rf-plaza-booths">
          <span></span><span class="fast">FASTag</span><span></span><span></span>
        </div>
        <div class="rf-plaza-road">
          <i class="car dark"></i><i class="car yellow"></i>
        </div>
      </section>
      <div class="rf-alertbar"><span aria-hidden="true">✦</span><div><b>Travel update</b><small>Your saved highway services and quick actions are ready.</small></div></div>
      <section class="rf-panel">
        <h2>Toll Road Information</h2>
        <button class="rf-offer blue" data-go="annual">
          <i aria-hidden="true">▣</i>
          <span><b>Annual Toll Pass</b><small>${state.annualPass.crossings} crossings remaining · Valid till ${esc(state.annualPass.validShort)}</small></span>
          <em>›</em>
        </button>
        <button class="rf-offer navy" data-go="local">
          <i aria-hidden="true">⌂</i>
          <span><b>Local Pass</b><small>${lp?.active ? 'Active · monthly unlimited trips' : 'Monthly unlimited trips for local residents'}</small></span>
          <em>›</em>
        </button>
        <button class="rf-offer white" data-go="amenities">
          <i aria-hidden="true">⌖</i>
          <span><b>Highway Amenities</b><small>Medical · Fuel · Food</small></span>
          <span class="rf-amenity-icons" aria-hidden="true"><b>+</b><b>⛽</b><b>🍽</b></span>
        </button>
        <button class="rf-offer white" data-go="recharge">
          <i aria-hidden="true">₹</i>
          <span><b>Buy / Recharge</b><small>FASTag balance ${inr(state.fastag.balance)}</small></span>
          <strong class="rf-fastag-mark">FASTag</strong>
        </button>
        <div class="rf-minirow">
          <button class="rf-mini" data-go="route"><i aria-hidden="true">⌘</i>Route Planner</button>
          <button class="rf-mini" data-go="knowHighway"><i aria-hidden="true">⌁</i>Know Your Highway</button>
        </div>
        <div class="rf-findbox">
          <b>Check FASTag and e-Notice Status</b>
          <small>ENTER VEHICLE REGISTRATION NUMBER</small>
          <div class="rf-search">
            <span class="rf-plate" aria-hidden="true">IND</span>
            <input data-status-vehicle value="${esc(statusVehicle)}" aria-label="Vehicle registration">
            <button data-action="check-status-home" aria-label="Search FASTag status">⌕</button>
          </div>
        </div>
      </section>
      <section class="rf-actiongrid">
        <button class="rf-tool" data-go="reportLocation"><i aria-hidden="true">⚠</i>Report An Issue On NH</button>
        <button class="rf-tool" data-go="reports"><i aria-hidden="true">▤</i>Report Summary</button>
        <button class="rf-tool" data-action="open-emergency"><i aria-hidden="true">✚</i>Emergency</button>
        <button class="rf-tool" data-go="weather"><i aria-hidden="true">☀</i>Weather</button>
      </section>
      <p class="rf-legal">REFAB is an independent prototype, not an official NHAI product. Services and data shown are simulated.</p>
      ${bottom()}
    </main>`;
  }

  function menu() {
    const items = [
      ['Home', 'home'], ['My Passes', 'passes'], ['Report Summary', 'reports'],
      ['Highway Amenities', 'amenities'], ['Route Planner', 'route'],
      ['Buy / Recharge', 'recharge'], ['Help & FAQs', 'help'], ['About REFAB', 'about']
    ];
    return `<main>${top()}<section class="rf-section rf-menu">
      <h1>Explore REFAB</h1>
      ${items.map(([label, go]) => `<button data-go="${go}"><span>${label}</span>›</button>`).join('')}
    </section>${showBottom() ? bottom() : ''}</main>`;
  }

  function passes() {
    const lp = state.localPass;
    return `<main>${top()}<section class="rf-section">
      <h1>My passes</h1>
      <div class="rf-pass rf-pass-compact">
        <span>ANNUAL PASS</span>
        <h2>${state.annualPass.active ? 'ACTIVE' : 'Inactive'}</h2>
        <b>${state.annualPass.crossings} crossings remaining</b>
        <small>Valid until ${esc(state.annualPass.validUntil)}</small>
        <button class="rf-inline" data-go="annual">View details ›</button>
      </div>
      ${lp?.active
        ? `<div class="rf-pass rf-pass-compact rf-pass-local">
            <span>LOCAL PASS</span>
            <h2>ACTIVE</h2>
            <b>Unlimited eligible crossings</b>
            <small>Valid for ${lp.validDays} days · Next payment ${inr(lp.nextPayment)}</small>
          </div>`
        : `<div class="rf-empty rf-empty-small">
            <b>No local pass yet</b>
            <small>Check eligibility if you live within 20 km of a toll plaza.</small>
            <button class="rf-primary" data-go="local">CHECK ELIGIBILITY</button>
          </div>`}
    </section>${bottom()}</main>`;
  }

  function annual() {
    return `<main>${top()}<section class="rf-section">
      <div class="rf-pass">
        <span>ANNUAL PASS</span>
        <h1>ACTIVE</h1>
        <b>${state.annualPass.crossings} crossings remaining</b>
        <small>Valid until ${esc(state.annualPass.validUntil)}</small>
        <hr>
        <small>Vehicle</small>
        <strong>${esc(state.annualPass.vehicle)}</strong>
      </div>
      <h2>Your pass</h2>
      <button class="rf-option" data-go="tollPlazas">
        <i aria-hidden="true">⌖</i>
        <span><b>Where can I use it?</b><small>See eligible toll plazas on this demo route</small></span>›
      </button>
      <button class="rf-option" data-go="passDetails">
        <i aria-hidden="true">▤</i>
        <span><b>Pass details</b><small>View validity and coverage</small></span>›
      </button>
      <button class="rf-option" data-go="port">
        <i aria-hidden="true">⇄</i>
        <span><b>Move to another vehicle</b><small>Start a demo porting request</small></span>›
      </button>
    </section>${bottom()}</main>`;
  }

  function passDetails() {
    const p = SVC.getPassDetails(state);
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">PASS DETAILS</p>
      <h1>${p.type}</h1>
      <div class="rf-review">
        <span>Status<b>${p.status}</b></span>
        <span>Crossings left<b>${p.crossings}</b></span>
        <span>Valid until<b>${esc(p.validUntil)}</b></span>
        <span>Vehicle<b>${esc(p.vehicle)}</b></span>
        <span>Coverage<b>${esc(p.coverage)}</b></span>
      </div>
      ${note('Synthetic demo information only.')}
      <button class="rf-primary" data-go="annual">BACK TO PASS</button>
    </section></main>`;
  }

  function tollPlazas() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">COVERAGE</p>
      <h1>Where can I use it?</h1>
      <p class="rf-copy">Eligible toll plazas on your demo NH-44 route.</p>
      ${MOCK.tollPlazas.map((p) =>
        `<article class="rf-place">
          <i aria-hidden="true">⌖</i>
          <div><b>${esc(p.name)}</b><small>${esc(p.highway)} · ${esc(p.distance)}</small></div>
        </article>`
      ).join('')}
      ${note('Plaza list is synthetic demo data.')}
      <button class="rf-primary" data-go="annual">BACK TO PASS</button>
    </section></main>`;
  }

  function local() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">LOCAL PASS</p>
      <h1>Unlimited travel for eligible local residents.</h1>
      <p class="rf-copy">If you live within <strong>${MOCK.localPass.ruleKm} km</strong> of an eligible National Highway toll plaza, a Local Pass can cover your eligible crossings for one monthly amount.</p>
      <div class="rf-location">
        <span aria-hidden="true">📍</span>
        <div>
          <b>Your location: ${esc(MOCK.localPass.location)}</b>
          <small>Nearest eligible toll plaza · ${MOCK.localPass.distanceKm} km away</small>
          <em>✓ You appear eligible</em>
        </div>
      </div>
      <button class="rf-primary" data-go="localEligible">CHECK ELIGIBILITY</button>
      ${note('Demo location only. Eligibility is simulated and no address verification is requested.')}
    </section></main>`;
  }

  function localEligible() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">YOU'RE ELIGIBLE</p>
      <h1>Your Local Pass benefits</h1>
      <div class="rf-benefits">
        <b>Unlimited eligible crossings</b>
        <span>Monthly demo payment · ${inr(MOCK.localPass.monthlyPayment)}</span>
        <span>Covered toll plaza · ${esc(MOCK.localPass.nearestPlaza)}</span>
        <span>Vehicle · ${esc(state.user.vehicle)}</span>
      </div>
      <button class="rf-primary" data-go="localForm">APPLY FOR LOCAL PASS</button>
      ${note('No Aadhaar, PAN or OTP is requested in this demo.')}
    </section></main>`;
  }

  function localFormScreen() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">APPLICATION</p>
      <h1>Apply for Local Pass</h1>
      <label>Vehicle registration
        <input value="${esc(localForm.vehicle)}" data-field="vehicle" aria-label="Vehicle registration">
      </label>
      <label>Owner name
        <input value="${esc(localForm.owner)}" data-field="owner" aria-label="Owner name">
      </label>
      <label>Address
        <input value="${esc(localForm.address)}" data-field="address" aria-label="Address">
      </label>
      <label>Toll plaza
        <select data-field="tollPlaza" aria-label="Toll plaza">
          <option ${localForm.tollPlaza === MOCK.localPass.nearestPlaza ? 'selected' : ''}>${esc(MOCK.localPass.nearestPlaza)}</option>
        </select>
      </label>
      <button class="rf-primary" data-action="local-review">REVIEW APPLICATION</button>
      ${note('Demo application only. No real identity or payment is collected.')}
    </section></main>`;
  }

  function localReview() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">REVIEW</p>
      <h1>Confirm your application</h1>
      <div class="rf-review">
        <span>Vehicle<b>${esc(localForm.vehicle)}</b></span>
        <span>Owner<b>${esc(localForm.owner)}</b></span>
        <span>Address<b>${esc(localForm.address)}</b></span>
        <span>Toll plaza<b>${esc(localForm.tollPlaza)}</b></span>
        <span>Monthly fee<b>${inr(MOCK.localPass.monthlyPayment)}</b></span>
      </div>
      <button class="rf-primary" data-action="local-submit">CONFIRM APPLICATION</button>
      <button class="rf-secondary" data-go="localForm">EDIT DETAILS</button>
    </section></main>`;
  }

  function localSuccess() {
    return `<main>${top()}<section class="rf-success">
      <i aria-hidden="true">✓</i>
      <p class="rf-kicker">APPLICATION COMPLETE</p>
      <h1>LOCAL PASS ACTIVATED</h1>
      <div class="rf-ticket">
        <b>ACTIVE</b>
        <span>Valid for ${MOCK.localPass.validityDays} days</span>
        <span>Next payment: ${inr(MOCK.localPass.monthlyPayment)}</span>
      </div>
      <p>Demo transaction — no real payment has been made.</p>
      <button class="rf-primary" data-go="home">BACK TO HOME</button>
    </section></main>`;
  }

  function recharge() {
    return `<main>${top()}<section class="rf-section">
      <div class="rf-balance">
        <small>DEMO FASTag BALANCE</small>
        <h1>${inr(state.fastag.balance)}</h1>
        <span>${esc(state.user.vehicle)} · ACTIVE</span>
      </div>
      <h2>Choose an amount</h2>
      <div class="rf-amounts" role="group" aria-label="Recharge amount">
        ${MOCK.rechargeAmounts.map((n) =>
          `<button class="${state.rechargeAmount === n ? 'active' : ''}" data-amount="${n}" aria-pressed="${state.rechargeAmount === n}">${inr(n)}</button>`
        ).join('')}
      </div>
      <label>Custom amount
        <input type="number" min="100" step="100" value="${state.rechargeAmount}" data-custom aria-label="Custom recharge amount">
      </label>
      <button class="rf-primary" data-go="payment">CONTINUE</button>
      ${note('Demo recharge only. No money will be collected.')}
    </section>${bottom()}</main>`;
  }

  function payment() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">DEMO PAYMENT</p>
      <h1>How would you like to pay?</h1>
      <p class="rf-copy">Paying ${inr(state.rechargeAmount)} to your demo FASTag. Do not enter real payment details.</p>
      ${MOCK.paymentMethods.map((x, i) =>
        `<button class="rf-option ${paymentMethod === x ? 'selected' : ''}" data-pay="${x}">
          <i aria-hidden="true">${i === 0 ? '◉' : i === 1 ? '▣' : '▤'}</i>
          <span><b>${x}</b><small>Demo payment method</small></span>›
        </button>`
      ).join('')}
      <button class="rf-primary" data-action="recharge-confirm">CONFIRM DEMO PAYMENT</button>
    </section></main>`;
  }

  function rechargeSuccess() {
    const added = state.lastRechargeAmount || state.rechargeAmount;
    return `<main>${top()}<section class="rf-success">
      <i aria-hidden="true">✓</i>
      <p class="rf-kicker">DEMO PAYMENT COMPLETE</p>
      <h1>RECHARGE SUCCESSFUL</h1>
      <div class="rf-ticket">
        <b>${inr(added)} added</b>
        <span>New demo FASTag balance</span>
        <strong>${inr(state.fastag.balance)}</strong>
      </div>
      <p>No real payment has been made.</p>
      <button class="rf-primary" data-go="home">BACK TO HOME</button>
    </section></main>`;
  }

  function reportLocation() {
    if (state.useOutsideLocation) return locationOutside();
    const loc = MOCK.location;
    return `<main>${top()}<section class="rf-section">
      <div class="rf-progress" aria-hidden="true">${progress(1)}</div>
      <p class="rf-kicker">STEP 1 OF 4</p>
      <h1>Where is the problem?</h1>
      <div class="rf-map">
        <span>Location detected</span>
        <i aria-hidden="true">📍</i>
        <b>${esc(loc.highway)} · Near ${esc(loc.place)}</b>
      </div>
      <div class="rf-location">
        <span aria-hidden="true">📍</span>
        <div>
          <b>${esc(loc.label)}</b>
          <small>Synthetic location used for this demo</small>
          <em>✓ National Highway detected</em>
        </div>
      </div>
      <button class="rf-secondary" data-action="toggle-location">CHANGE LOCATION</button>
      <button class="rf-primary" data-go="reportIssue">CONTINUE</button>
    </section></main>`;
  }

  function locationOutside() {
    return `<main>${top()}<section class="rf-section rf-alert">
      <p class="rf-kicker">LOCATION CHECK</p>
      <h1>This service is for National Highways</h1>
      <p class="rf-copy">Your current location doesn't appear to be on a National Highway.</p>
      <div class="rf-location rf-location-warn">
        <span aria-hidden="true">📍</span>
        <div>
          <b>${esc(MOCK.outsideLocation.place)}</b>
          <small>Not on an eligible National Highway segment</small>
        </div>
      </div>
      <button class="rf-primary" data-action="use-nh-location">USE ANOTHER LOCATION</button>
      <button class="rf-secondary" data-go="highwaySupport">CONTACT HIGHWAY SUPPORT</button>
      ${note('No complaint can be submitted from this location in the demo.')}
    </section></main>`;
  }

  function highwaySupport() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">HIGHWAY SUPPORT</p>
      <h1>Need help?</h1>
      <div class="rf-support-card">
        <button class="rf-support-btn" data-action="call1033">
          <b>Call 1033</b>
          <small>NHAI highway helpline · simulated call</small>
        </button>
      </div>
      ${note('Calls are not placed from this prototype. For real emergencies, call 112.')}
      <button class="rf-secondary" data-go="home">BACK TO HOME</button>
    </section></main>`;
  }

  function reportIssue() {
    const d = state.draftReport;
    return `<main>${top()}<section class="rf-section">
      <div class="rf-progress" aria-hidden="true">${progress(2)}</div>
      <p class="rf-kicker">STEP 2 OF 4</p>
      <h1>What happened?</h1>
      <div class="rf-issues" role="listbox" aria-label="Issue type">
        ${MOCK.issueTypes.map((x) =>
          `<button class="${d.issue === x ? 'active' : ''}" data-issue="${esc(x)}" role="option" aria-selected="${d.issue === x}">${x}<span aria-hidden="true">›</span></button>`
        ).join('')}
      </div>
      <button class="rf-primary" data-go="reportDetails">CONTINUE</button>
    </section></main>`;
  }

  function reportDetails() {
    const d = state.draftReport;
    return `<main>${top()}<section class="rf-section">
      <div class="rf-progress" aria-hidden="true">${progress(3)}</div>
      <p class="rf-kicker">STEP 3 OF 4</p>
      <h1>Tell us more</h1>
      <label>What should the road team know?
        <textarea data-description aria-label="Problem description">${esc(d.description)}</textarea>
      </label>
      <input id="photo" type="file" accept="image/*" hidden>
      <button class="rf-upload" data-upload type="button">＋ Add photo <small>Optional demo evidence</small></button>
      <div class="rf-photo">
        <span aria-hidden="true">▧</span>
        <div>
          <b>${d.photo ? esc(d.photoName || 'Photo attached') : 'No photo attached'}</b>
          <small>Images stay in this browser demo only</small>
        </div>
      </div>
      <button class="rf-primary" data-go="reportReview">REVIEW REPORT</button>
    </section></main>`;
  }

  function reportReview() {
    const d = state.draftReport;
    const loc = d.location;
    return `<main>${top()}<section class="rf-section">
      <div class="rf-progress" aria-hidden="true">${progress(4)}</div>
      <p class="rf-kicker">STEP 4 OF 4</p>
      <h1>Ready to submit?</h1>
      <div class="rf-review">
        <span>Location<b>${esc(loc.label)}</b></span>
        <span>Issue<b>${esc(d.issue)}</b></span>
        <span>Description<b>${esc(d.description)}</b></span>
        <span>Photo<b>${d.photo ? '1 demo photo' : 'None'}</b></span>
      </div>
      ${note('This creates a simulated report record. It will not contact NHAI or any government system.')}
      <button class="rf-primary" data-action="submit-report" ${submitting ? 'disabled' : ''}>
        ${submitting ? 'SUBMITTING…' : 'SUBMIT REPORT'}
      </button>
      ${submitting ? '<p class="rf-loading" role="status">Submitting report…</p>' : ''}
    </section></main>`;
  }

  function reportSuccess() {
    const r = state.reports.find((x) => x.id === state.selectedReportId) || state.reports[0];
    return `<main>${top()}<section class="rf-success">
      <i aria-hidden="true">✓</i>
      <p class="rf-kicker">REPORT SUBMITTED</p>
      <h1>We've received your highway issue report.</h1>
      <div class="rf-ticket">
        <small>Reference</small>
        <b>${esc(r?.id || 'REFAB-2026-000000')}</b>
        <span><span aria-hidden="true">🟡</span> Submitted</span>
        <span>${esc(r?.location || MOCK.location.label)}</span>
      </div>
      <button class="rf-primary" data-go="track">TRACK REPORT</button>
      <button class="rf-secondary" data-go="home">BACK TO HOME</button>
      ${note('Simulated prototype workflow. No report was sent to NHAI.')}
    </section></main>`;
  }

  function reports() {
    const list = state.reports;
    return `<main>${top()}<section class="rf-section">
      <h1>My reports</h1>
      ${list.length
        ? list.map((r) =>
            `<button class="rf-report" data-report="${esc(r.id)}">
              <span aria-hidden="true">🟡</span>
              <div>
                <b>${esc(r.id)}</b>
                <small>${esc(r.issue)} · ${esc(r.location)}</small>
                <em>${SVC.formatSubmittedDate(r.submittedAt)}</em>
              </div>›
            </button>`
          ).join('')
        : `<div class="rf-empty">
            <i aria-hidden="true">▤</i>
            <b>You haven't reported anything yet.</b>
            <small>When you do, each update will appear here.</small>
            <button class="rf-primary" data-go="reportLocation">REPORT A HIGHWAY PROBLEM</button>
          </div>`}
      ${note('Simulated prototype workflow — not live NHAI complaint status.')}
    </section>${bottom()}</main>`;
  }

  function track() {
    const r = state.reports.find((x) => x.id === state.selectedReportId) || state.reports[0];
    if (!r) return reports();
    const timeline = r.timeline || [];
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">YOUR REPORT</p>
      <h1>${esc(r.id)}</h1>
      <p class="rf-copy">${esc(r.issue)} · ${esc(r.location)}</p>
      <div class="rf-timeline" aria-label="Report timeline">
        ${timeline.map((t) =>
          `<div class="${t.complete ? 'done' : ''}">
            <i aria-hidden="true">${t.complete ? '✓' : '○'}</i>
            <b>${esc(t.label)}</b>
            <small>${esc(t.detail)}</small>
          </div>`
        ).join('')}
      </div>
      ${note('This is a simulated workflow, not a live NHAI complaint status.')}
      <button class="rf-secondary" data-go="reports">ALL REPORTS</button>
    </section>${bottom()}</main>`;
  }

  function amenities() {
    const filter = state.amenityFilter;
    const items = filter === 'All'
      ? MOCK.amenities
      : MOCK.amenities.filter((a) => a.category === filter);
    return `<main>${top()}<section class="rf-section">
      <h1>What do you need?</h1>
      <div class="rf-chips" role="group" aria-label="Amenity categories">
        <button class="${filter === 'All' ? 'active' : ''}" data-filter="All">All</button>
        ${MOCK.amenityCategories.map((c) =>
          `<button class="${filter === c ? 'active' : ''}" data-filter="${esc(c)}">${esc(c)}</button>`
        ).join('')}
      </div>
      <h2>Near you</h2>
      ${items.length
        ? items.map((a) =>
            `<article class="rf-place">
              <i aria-hidden="true">⌖</i>
              <div><b>${esc(a.name)}</b><small>${esc(a.category)} · ${esc(a.distance)}</small></div>
              <div class="rf-place-actions">
                <button data-amenity="${esc(a.id)}" data-action="amenity-detail">DETAILS</button>
                <button data-action="directions">DIRECTIONS</button>
              </div>
            </article>`
          ).join('')
        : '<p class="rf-copy">No amenities in this category nearby.</p>'}
      ${note('Locations and directions are synthetic; no map service is connected.')}
    </section>${bottom()}</main>`;
  }

  function amenityDetail() {
    const a = MOCK.amenities.find((x) => x.id === state.selectedAmenityId) || MOCK.amenities[0];
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">${esc(a.category).toUpperCase()}</p>
      <h1>${esc(a.name)}</h1>
      <div class="rf-review">
        <span>Highway<b>${esc(a.highway)}</b></span>
        <span>Distance<b>${esc(a.distance)}</b></span>
        <span>Status<b>Open · demo data</b></span>
      </div>
      <button class="rf-primary" data-action="directions">GET DIRECTIONS</button>
      <button class="rf-secondary" data-go="amenities">BACK</button>
    </section></main>`;
  }

  function route() {
    const r = routePlanned ? SVC.calculateRoute(routeFrom, routeTo) : null;
    return `<main>${top()}<section class="rf-section">
      <h1>Plan your route</h1>
      <label>From
        <input value="${esc(routeFrom)}" data-route="from" aria-label="Route from">
      </label>
      <label>To
        <input value="${esc(routeTo)}" data-route="to" aria-label="Route to">
      </label>
      <button class="rf-primary" data-action="plan-route">PLAN ROUTE</button>
      ${r ? `<div class="rf-route-card">
        <b>${esc(r.from)} → ${esc(r.to)}</b>
        <div>
          <span>${esc(r.distance)}</span>
          <span>${esc(r.duration)}</span>
          <span>${r.tollPlazas} toll plazas</span>
        </div>
        <small>Estimated toll: ${inr(r.estimatedToll)} · Synthetic route plan</small>
      </div>
      <div class="rf-along">
        <h2>Along your route</h2>
        <span>${r.along.tollPlazas} toll plazas</span>
        <span>${r.along.fuelStations} fuel stations</span>
        <span>${r.along.evChargers} EV chargers</span>
        <span>${r.along.restStops} rest stops</span>
      </div>` : ''}
      ${note('Route data is synthetic demo information.')}
    </section>${bottom()}</main>`;
  }

  function weather() {
    const w = MOCK.weather;
    return `<main>${top()}<section class="rf-section">
      <div class="rf-weather">
        <p>${esc(w.location)}</p>
        <h1>${w.temp}°C</h1>
        <b>${w.icon} ${esc(w.condition)}</b>
        <span>Visibility: ${esc(w.visibility)}</span>
      </div>
      ${note('Weather is synthetic demo data, not a live forecast.')}
    </section>${bottom()}</main>`;
  }

  function emergency() {
    const h = MOCK.emergency.hospital;
    return `<main>${top()}<section class="rf-section">
      <div class="rf-emergency">
        <p>EMERGENCY</p>
        <h1>Need urgent help?</h1>
        <button data-action="call112">
          <b>Call 112</b>
          <small>Emergency services · simulated call</small>
        </button>
        <button data-action="call1033">
          <b>Call 1033</b>
          <small>NHAI highway support · simulated call</small>
        </button>
        <article>
          <b>Nearest hospital</b>
          <span>${esc(h.name)} · ${esc(h.distance)}</span>
        </article>
      </div>
      ${note('Calls are not placed from this prototype.')}
    </section>${bottom()}</main>`;
  }

  function status() {
    const checked = state.statusChecked;
    const s = checked ? SVC.getFastagStatus(statusVehicle, state) : null;
    return `<main>${top()}<section class="rf-section">
      <h1>Check FASTag status</h1>
      <label>Vehicle registration
        <input value="${esc(statusVehicle)}" data-status-vehicle aria-label="Vehicle registration">
      </label>
      <button class="rf-primary" data-action="check-status">CHECK STATUS</button>
      ${s ? `<div class="rf-status-card" role="status">
        <b>FASTag: ${s.fastag}</b>
        <span>Balance: ${inr(state.fastag.balance)}</span>
        <span>Annual Pass: ${s.annualPass}</span>
        <span>e-Notice: ${s.eNotice}</span>
      </div>` : ''}
      ${note('Synthetic demo information only.')}
    </section>${bottom()}</main>`;
  }

  function port() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">MOVE PASS TO ANOTHER VEHICLE</p>
      <h1>Enter a new vehicle</h1>
      <label>Current vehicle
        <input value="${esc(state.annualPass.vehicle)}" disabled aria-label="Current vehicle">
      </label>
      <label>New vehicle
        <input value="${esc(portForm.newVehicle)}" data-port-vehicle aria-label="New vehicle">
      </label>
      <button class="rf-primary" data-go="portReview">REVIEW &amp; CONFIRM</button>
      ${note('This is a simulated request. No real pass is moved.')}
    </section></main>`;
  }

  function portReview() {
    return `<main>${top()}<section class="rf-section">
      <p class="rf-kicker">REVIEW</p>
      <h1>Confirm porting request</h1>
      <div class="rf-review">
        <span>Pass<b>Annual Pass</b></span>
        <span>From<b>${esc(state.annualPass.vehicle)}</b></span>
        <span>To<b>${esc(portForm.newVehicle)}</b></span>
        <span>Status after submit<b>Processing</b></span>
      </div>
      <button class="rf-primary" data-action="port-submit">CONFIRM PORTING</button>
      <button class="rf-secondary" data-go="port">EDIT</button>
    </section></main>`;
  }

  function portSuccess() {
    const req = state.portingRequests[0];
    return `<main>${top()}<section class="rf-success">
      <i aria-hidden="true">✓</i>
      <p class="rf-kicker">REQUEST CREATED</p>
      <h1>PORTING REQUEST SUBMITTED</h1>
      <div class="rf-ticket">
        <small>Reference</small>
        <b>${esc(req?.id || 'PORT-2026-000000')}</b>
        <span>Processing</span>
      </div>
      <p>Simulated request only.</p>
      <button class="rf-primary" data-go="annual">BACK TO PASS</button>
    </section></main>`;
  }

  function profile() {
    const lp = state.localPass;
    return `<main>${top()}<section class="rf-section">
      <div class="rf-profile">
        <i aria-hidden="true">●</i>
        <h1>${esc(state.user.name)}</h1>
        <p>DEMO ACCOUNT</p>
      </div>
      <div class="rf-review">
        <span>Vehicle<b>${esc(state.user.vehicle)}</b></span>
        <span>FASTag<b>${state.fastag.active ? 'Active' : 'Inactive'} · ${inr(state.fastag.balance)}</b></span>
        <span>Annual Pass<b>${state.annualPass.active ? 'Active' : 'Inactive'}</b></span>
        <span>Local Pass<b>${lp?.active ? 'Active' : 'Not applied'}</b></span>
      </div>
      ${note('No sensitive personal data is collected in this demo.')}
    </section>${bottom()}</main>`;
  }

  function help() {
    return `<main>${top()}<section class="rf-section">
      <h1>Help &amp; FAQs</h1>
      <p class="rf-copy">Quick answers for the demo prototype.</p>
      <button class="rf-option" data-go="reportLocation">
        <i aria-hidden="true">⚠</i>
        <span><b>How do I report a highway problem?</b><small>Tap Report → choose location, issue and details</small></span>›
      </button>
      <button class="rf-option" data-go="recharge">
        <i aria-hidden="true">₹</i>
        <span><b>How does recharge work?</b><small>Demo payment only — balance updates in this browser</small></span>›
      </button>
      <button class="rf-option" data-go="emergency">
        <i aria-hidden="true">✚</i>
        <span><b>Need immediate help?</b><small>See emergency support options</small></span>›
      </button>
      <button class="rf-secondary" data-go="about">ABOUT REFAB</button>
    </section>${bottom()}</main>`;
  }

  function about() {
    return `<main>${top()}<section class="rf-section">
      <h1>About REFAB</h1>
      <p class="rf-copy">REFAB is an independent prototype for Indian National Highway users. It brings fragmented journeys for tolls, passes, road reports and amenities into one clearer mobile experience.</p>
      <div class="rf-arch">
        <h2>Today · Prototype</h2>
        <ul>
          <li>Mock government data</li>
          <li>Simulated payments</li>
          <li>Simulated identity verification</li>
          <li>Simulated complaint workflow</li>
          <li>Synthetic locations</li>
        </ul>
        <h2>Production</h2>
        <p class="rf-copy">Potential integrations could include NHAI APIs, FASTag infrastructure, approved payment gateways, GIS/location services and government complaint workflows — with authorised access, consent and security review.</p>
      </div>
      <div class="rf-note rf-note-box">
        <b>Demo disclosure</b><br>
        REFAB is an independent prototype and is not an official NHAI product. Government services, payments, identity verification and complaint workflows shown here use simulated data.
      </div>
    </section>${bottom()}</main>`;
  }

  const screens = {
    home, menu, passes, annual, passDetails, tollPlazas,
    local, localEligible, localForm: localFormScreen, localReview, localSuccess,
    recharge, payment, rechargeSuccess,
    reportLocation, locationOutside, highwaySupport,
    reportIssue, reportDetails, reportReview, reportSuccess,
    reports, track,
    amenities, amenityDetail,
    route, weather, emergency, status,
    port, portReview, portSuccess,
    profile, help, about
  };

  const backMap = {
    menu: 'home', passes: 'menu', annual: 'home', passDetails: 'annual', tollPlazas: 'annual',
    local: 'home', localEligible: 'local', localForm: 'localEligible', localReview: 'localForm',
    recharge: 'home', payment: 'recharge',
    reportLocation: 'home', reportIssue: 'reportLocation', reportDetails: 'reportIssue',
    reportReview: 'reportDetails', locationOutside: 'reportLocation', highwaySupport: 'locationOutside',
    amenities: 'home', amenityDetail: 'amenities',
    route: 'home', weather: 'home', emergency: 'home', status: 'home',
    port: 'annual', portReview: 'port',
    help: 'menu', about: 'help', track: 'reports',
    reportSuccess: 'home', localSuccess: 'home', rechargeSuccess: 'home', portSuccess: 'annual'
  };

  function render(next = screen) {
    screen = next;
    const fn = screens[screen] || home;
    root.innerHTML = `<div class="rf-app">${fn()}${toast ? `<div class="rf-toast" role="status">${esc(toast)}</div>` : ''}</div>`;
    wire();
    window.scrollTo(0, 0);
  }

  function showToast(msg) {
    toast = msg;
    render(screen);
    setTimeout(() => { toast = ''; render(screen); }, 2200);
  }

  function wire() {
    root.querySelectorAll('[data-go]').forEach((el) => {
      el.onclick = () => {
        if (el.dataset.go === 'reportLocation') state.useOutsideLocation = false;
        render(el.dataset.go);
      };
    });

    root.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      if (screen === 'locationOutside') state.useOutsideLocation = false;
      render(backMap[screen] || 'home');
    });

    root.querySelectorAll('[data-amount]').forEach((el) => {
      el.onclick = () => {
        state.rechargeAmount = Number(el.dataset.amount);
        SVC.save(state);
        render('recharge');
      };
    });

    const custom = root.querySelector('[data-custom]');
    if (custom) {
      custom.oninput = () => {
        state.rechargeAmount = Number(custom.value) || 0;
        SVC.save(state);
      };
    }

    root.querySelectorAll('[data-issue]').forEach((el) => {
      el.onclick = () => {
        state.draftReport.issue = el.dataset.issue;
        render('reportIssue');
      };
    });

    const desc = root.querySelector('[data-description]');
    if (desc) {
      desc.oninput = () => { state.draftReport.description = desc.value; };
    }

    root.querySelector('[data-upload]')?.addEventListener('click', () => {
      root.querySelector('#photo')?.click();
    });

    root.querySelector('#photo')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      state.draftReport.photo = !!file;
      state.draftReport.photoName = file?.name || 'demo-photo.jpg';
      render('reportDetails');
    });

    root.querySelectorAll('[data-field]').forEach((el) => {
      el.oninput = () => { localForm[el.dataset.field] = el.value; };
      el.onchange = () => { localForm[el.dataset.field] = el.value; };
    });

    root.querySelector('[data-port-vehicle]')?.addEventListener('input', (e) => {
      portForm.newVehicle = e.target.value;
    });

    root.querySelector('[data-status-vehicle]')?.addEventListener('input', (e) => {
      statusVehicle = e.target.value;
      state.statusChecked = false;
    });

    root.querySelectorAll('[data-route]').forEach((el) => {
      el.oninput = () => {
        if (el.dataset.route === 'from') routeFrom = el.value;
        else routeTo = el.value;
        routePlanned = false;
      };
    });

    root.querySelectorAll('[data-pay]').forEach((el) => {
      el.onclick = () => {
        paymentMethod = el.dataset.pay;
        render('payment');
      };
    });

    root.querySelectorAll('[data-filter]').forEach((el) => {
      el.onclick = () => {
        state.amenityFilter = el.dataset.filter;
        SVC.save(state);
        render('amenities');
      };
    });

    root.querySelectorAll('[data-report]').forEach((el) => {
      el.onclick = () => {
        state.selectedReportId = el.dataset.report;
        SVC.save(state);
        render('track');
      };
    });

    root.querySelectorAll('[data-action]').forEach((el) => {
      const action = el.dataset.action;
      if (el.dataset.go || el.dataset.amount || el.dataset.issue || el.dataset.pay || el.dataset.filter || el.dataset.report) return;
      el.onclick = (e) => handleAction(action, el, e);
    });
  }

  async function handleAction(action, el, e) {
    switch (action) {
      case 'open-emergency':
        render('emergency');
        break;
      case 'check-status-home':
        state.statusChecked = true;
        SVC.save(state);
        render('status');
        break;
      case 'toggle-location':
        state.useOutsideLocation = true;
        render('locationOutside');
        break;
      case 'use-nh-location':
        state.useOutsideLocation = false;
        render('reportLocation');
        break;
      case 'local-review':
        render('localReview');
        break;
      case 'local-submit':
        SVC.createLocalPassApplication(state, localForm);
        render('localSuccess');
        break;
      case 'recharge-confirm':
        SVC.simulateRecharge(state, state.rechargeAmount);
        render('rechargeSuccess');
        break;
      case 'submit-report':
        if (submitting) return;
        submitting = true;
        render('reportReview');
        try {
          await SVC.submitReport(state, state.draftReport);
          submitting = false;
          render('reportSuccess');
        } catch {
          submitting = false;
          showToast('Could not save report. Please try again.');
        }
        break;
      case 'plan-route':
        routePlanned = true;
        render('route');
        break;
      case 'check-status':
        state.statusChecked = true;
        render('status');
        break;
      case 'port-submit':
        SVC.simulatePorting(state, portForm.newVehicle);
        render('portSuccess');
        break;
      case 'amenity-detail':
        state.selectedAmenityId = el?.dataset?.amenity || MOCK.amenities[0]?.id;
        SVC.save(state);
        render('amenityDetail');
        break;
      case 'directions':
        showToast('Directions are simulated in REFAB demo mode.');
        break;
      case 'call112':
      case 'call1033':
        showToast(`Simulated call to ${action === 'call112' ? '112' : '1033'}. No call was placed.`);
        break;
      default:
        break;
    }
  }

  root.classList.add('refab-root');
  render('home');
})();
