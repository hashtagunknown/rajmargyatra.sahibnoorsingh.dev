/* REFAB — mock service layer with localStorage persistence */
(() => {
  const STORAGE_KEY = 'refab-demo-v2';
  const MOCK = window.REFAB_MOCK;

  const defaults = () => ({
    user: { ...MOCK.user },
    fastag: { ...MOCK.fastag },
    annualPass: { ...MOCK.annualPass },
    localPass: null,
    reports: [],
    rechargeAmount: 1000,
    lastRechargeAt: null,
    portingRequests: [],
    draftReport: {
      issue: 'Pothole / damaged road',
      description: 'Deep pothole in the left lane near the service road.',
      photo: false,
      photoName: null,
      location: MOCK.location
    },
    useOutsideLocation: false,
    selectedReportId: null,
    selectedAmenityId: null,
    amenityFilter: 'All'
  });

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaults(), ...saved };
    } catch {
      return defaults();
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function generateId(prefix, seq) {
    const n = String(seq || Math.floor(100000 + Math.random() * 900000));
    return `${prefix}-2026-${n.slice(-6)}`;
  }

  function getReports(state) {
    return state.reports || [];
  }

  function getPassDetails(state) {
    return {
      type: 'Annual Pass',
      status: state.annualPass.active ? 'ACTIVE' : 'Inactive',
      crossings: state.annualPass.crossings,
      validUntil: state.annualPass.validUntil,
      vehicle: state.annualPass.vehicle,
      coverage: MOCK.annualPass.coverage,
      tollPlazas: MOCK.tollPlazas
    };
  }

  function calculateRoute(from, to) {
    const base = { ...MOCK.route };
    if (from) base.from = from;
    if (to) base.to = to;
    return base;
  }

  async function submitReport(state, draft) {
    const reference = generateId('REFAB', Date.now());
    const payload = {
      reference,
      issue: draft.issue,
      location: draft.location.label,
      highway: draft.location.highway,
      place: draft.location.place,
      description: draft.description,
      photo: draft.photo ? draft.photoName || 'demo-photo.jpg' : null
    };

    let apiCase = null;
    try {
      const res = await fetch('/api/road-reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        apiCase = data.case;
      }
    } catch {
      /* offline fallback */
    }

    const report = {
      id: apiCase?.id || reference,
      issue: draft.issue,
      location: draft.location.label,
      highway: draft.location.highway,
      place: draft.location.place,
      description: draft.description,
      photo: draft.photo,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      timeline: [
        { label: 'Report submitted', detail: 'We saved your location and details.', complete: true },
        { label: 'Location verified', detail: `${draft.location.label} matched in this demo.`, complete: true },
        { label: 'Assigned to field team', detail: 'Simulated next step.', complete: false },
        { label: 'Resolution', detail: 'Update will appear here.', complete: false }
      ]
    };

    state.reports.unshift(report);
    state.selectedReportId = report.id;
    save(state);
    return report;
  }

  function createLocalPassApplication(state, form) {
    state.localPass = {
      active: true,
      vehicle: form.vehicle || MOCK.vehicle.registration,
      owner: form.owner || MOCK.user.name,
      address: form.address || MOCK.vehicle.address,
      tollPlaza: form.tollPlaza || MOCK.localPass.nearestPlaza,
      validDays: MOCK.localPass.validityDays,
      nextPayment: MOCK.localPass.monthlyPayment,
      activatedAt: new Date().toISOString()
    };
    save(state);
    return state.localPass;
  }

  function simulateRecharge(state, amount) {
    const value = Number(amount) || state.rechargeAmount || 1000;
    state.fastag.balance += value;
    state.lastRechargeAt = new Date().toISOString();
    state.lastRechargeAmount = value;
    save(state);
    return { added: value, balance: state.fastag.balance };
  }

  function simulatePorting(state, newVehicle) {
    const request = {
      id: generateId('PORT', 182),
      fromVehicle: state.annualPass.vehicle,
      toVehicle: newVehicle,
      status: 'Processing',
      submittedAt: new Date().toISOString()
    };
    state.portingRequests.unshift(request);
    save(state);
    return request;
  }

  function getFastagStatus(vehicle, state) {
    const balance = state?.fastag?.balance ?? MOCK.fastag.balance;
    return {
      vehicle: vehicle || MOCK.statusCheckVehicle,
      fastag: 'ACTIVE',
      balance,
      annualPass: 'ACTIVE',
      eNotice: 'No pending notices',
      demo: true
    };
  }

  function formatSubmittedDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) return 'Submitted today';
    return `Submitted ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  }

  window.REFAB_SVC = {
    STORAGE_KEY,
    load,
    save,
    getReports,
    getPassDetails,
    calculateRoute,
    submitReport,
    createLocalPassApplication,
    simulateRecharge,
    simulatePorting,
    getFastagStatus,
    formatSubmittedDate,
    generateId
  };
})();
