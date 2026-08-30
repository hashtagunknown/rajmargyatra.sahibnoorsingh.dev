/* REFAB — synthetic demo data (no real citizen or government data) */
window.REFAB_MOCK = {
  user: {
    name: 'Rahul Sharma',
    vehicle: 'DL12XX0000',
    demoAccount: true
  },
  vehicle: {
    registration: 'DL12XX0000',
    owner: 'Rahul Sharma',
    address: 'Murthal, Haryana'
  },
  fastag: {
    balance: 1240,
    active: true,
    issuer: 'Demo Bank'
  },
  annualPass: {
    active: true,
    crossings: 125,
    validUntil: '11 September 2026',
    validShort: '11 Sep 2026',
    vehicle: 'DL12XX0000',
    coverage: 'National Highway toll plazas on eligible routes'
  },
  localPass: {
    monthlyPayment: 340,
    validityDays: 30,
    ruleKm: 20,
    location: 'Murthal',
    nearestPlaza: 'Murthal Toll Plaza',
    distanceKm: 8.4
  },
  tollPlazas: [
    { name: 'Murthal Toll Plaza', highway: 'NH-44', distance: '0 km' },
    { name: 'Panipat Toll Plaza', highway: 'NH-44', distance: '42 km' },
    { name: 'Karnal Toll Plaza', highway: 'NH-44', distance: '78 km' },
    { name: 'Ambala Toll Plaza', highway: 'NH-44', distance: '185 km' },
    { name: 'Zirakpur Toll Plaza', highway: 'NH-44', distance: '238 km' }
  ],
  amenities: [
    { id: 'fuel-1', name: 'HPCL Fuel Station', category: 'Fuel', distance: '2.1 km', highway: 'NH-44' },
    { id: 'ev-1', name: 'EV Charging Hub', category: 'EV charging', distance: '4.8 km', highway: 'NH-44' },
    { id: 'food-1', name: 'Murthal Food Court', category: 'Food', distance: '5.2 km', highway: 'NH-44' },
    { id: 'rest-1', name: 'Highway Restrooms', category: 'Restrooms', distance: '3.6 km', highway: 'NH-44' },
    { id: 'med-1', name: 'NH Medical Aid', category: 'Medical', distance: '7.1 km', highway: 'NH-44' },
    { id: 'park-1', name: 'Service Parking Bay', category: 'Parking', distance: '2.8 km', highway: 'NH-44' },
    { id: 'area-1', name: 'Murthal Rest Area', category: 'Rest areas', distance: '5.5 km', highway: 'NH-44' }
  ],
  amenityCategories: ['Fuel', 'EV charging', 'Food', 'Restrooms', 'Medical', 'Parking', 'Rest areas'],
  route: {
    from: 'Delhi',
    to: 'Chandigarh',
    distance: '245 km',
    duration: '4h 30m',
    tollPlazas: 5,
    estimatedToll: 780,
    along: { tollPlazas: 5, fuelStations: 3, evChargers: 2, restStops: 2 }
  },
  weather: {
    location: 'NH-44 · Panipat',
    temp: 32,
    condition: 'Partly cloudy',
    icon: '⛅',
    visibility: 'Good'
  },
  emergency: {
    hospital: { name: 'Murthal Community Hospital', distance: '6.2 km' }
  },
  location: {
    highway: 'NH-44',
    place: 'Murthal',
    label: 'NH-44 · Murthal',
    onHighway: true
  },
  outsideLocation: {
    place: 'Connaught Place, Delhi',
    onHighway: false
  },
  issueTypes: [
    'Pothole / damaged road',
    'Road obstruction',
    'Lighting issue',
    'Toll plaza issue',
    'Facility issue',
    'Safety concern',
    'Other'
  ],
  rechargeAmounts: [500, 1000, 2000],
  paymentMethods: ['UPI', 'Card', 'Net Banking'],
  statusCheckVehicle: 'DL12AB0000'
};
