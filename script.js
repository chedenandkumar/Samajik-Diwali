const SHEET_ID = '1W059r6QUWecU8WY5OdLLybCMkPOPr_K5IXXEETUbrn4'; // <-- तुमचा Google Sheet ID
const CONVENERS_TAB = 'Conveners';
const RESPONSES_TAB = 'Responses';

const villageSelect = document.getElementById('village');
const referenceSelect = document.getElementById('reference');
const mainForm = document.getElementById('main-form');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const thankyouMsg = document.getElementById('thankyouMessage');
const thankyouExitBtn = document.getElementById('thankyouExitBtn');
const totalsSection = document.getElementById('totalsSection');
const submitBtn = document.getElementById('submitBtn');
const wasteInput = document.getElementById('waste');
const dateInput = document.getElementById('date');
const timeslotSelect = document.getElementById('timeslot');
const locBtn = document.getElementById('locBtn');
const locationInput = document.getElementById('location');
const qrPayBtn = document.getElementById('qrPayBtn');

let convenerData = [];
let villageMap = {};
let isDateInputEnabled = true;

// --- गाव/संयोजक populate ---
// Dummy data: इथेच तुमचे संयोजक, गाव hardcode करा किंवा Apps Script/Web App वापरून आणा.
const DUMMY_CONVENERS = [
  { village: 'सावरगांव', name: 'रामदास पवार', mobile: '9123456789', info: '' },
  { village: 'पिंपळगांव', name: 'शिवाजी शिंदे', mobile: '9876543210', info: '' },
  // आणखी संयोजक इथे टाका...
];

function loadConveners() {
  convenerData = DUMMY_CONVENERS;
  villageMap = {};
  convenerData.forEach(row => {
    if (!villageMap[row.village]) villageMap[row.village] = [];
    villageMap[row.village].push(row);
  });

  villageSelect.innerHTML = '<option value="">गांव निवडा</option>';
  Object.keys(villageMap).sort().forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    villageSelect.appendChild(opt);
  });

  villageSelect.addEventListener('change', populateReference);
  populateReference();
}

function populateReference() {
  const selectedVillage = villageSelect.value;
  let refs = [];
  if (selectedVillage && villageMap[selectedVillage]) {
    refs = villageMap[selectedVillage];
  } else {
    refs = convenerData;
  }
  referenceSelect.innerHTML = '<option value="">संयोजक निवडा</option>';
  refs.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.name;
    opt.textContent = r.name + (r.mobile ? ' (' + r.mobile + ')' : '');
    referenceSelect.appendChild(opt);
  });
}

// --- तारीख लॉजिक ---
function setupDateLogic() {
  // 15 Sept 2025 ते 15 Oct 2025
  const minDate = new Date('2025-09-15');
  const maxDate = new Date('2025-10-15');
  let now = new Date();

  let min, max;
  if (now < minDate) {
    min = minDate;
  } else if (now > maxDate) {
    min = maxDate;
  } else {
    min = now;
    min.setHours(0,0,0,0);
  }
  max = maxDate;

  function fmt(d) {
    return d.toISOString().split('T')[0];
  }

  if (now > maxDate) {
    dateInput.disabled = true;
    submitBtn.disabled = true;
    isDateInputEnabled = false;
    dateInput.value = '';
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'ही मोहीम संपली आहे.';
    return;
  } else {
    isDateInputEnabled = true;
    dateInput.disabled = false;
    submitBtn.disabled = false;
    errorDiv.style.display = 'none';
  }

  dateInput.setAttribute('min', fmt(min));
  dateInput.setAttribute('max', fmt(max));
}

// --- वेळेचा स्लॉट ---
function populateTimeSlots() {
  const slots = [
    'सकाळी 8 ते 10',
    'सकाळी 10 ते 12',
    'दुपारी 12 ते 2',
    'दुपारी 2 ते 4',
    'संध्याकाळी 4 ते 6',
    'रात्री 6 नंतर'
  ];
  timeslotSelect.innerHTML = '';
  slots.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    timeslotSelect.appendChild(opt);
  });
}

// --- लोकेशन बटन ---
locBtn.addEventListener('click', function(e) {
  e.preventDefault();
  locationInput.value = 'मिळवत आहे...';
  if (!navigator.geolocation) {
    locationInput.value = 'लोकेशन मिळाले नाही';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    },
    err => {
      locationInput.value = 'लोकेशन मिळाले नाही';
    }
  );
});

// --- रद्दी फक्त आकडे ---
wasteInput.addEventListener('input', function() {
  this.value = this.value.replace(/[^\d]/g, '');
});

// --- फॉर्म सबमिट ---
mainForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  errorDiv.style.display = 'none';
  if (!isDateInputEnabled) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'ही मोहीम संपली आहे.';
    return;
  }
  let name = mainForm.name.value.trim();
  let village = mainForm.village.value.trim();
  let address = mainForm.address.value.trim();
  let location = mainForm.location.value.trim();
  let mobile = mainForm.mobile.value.trim();
  let waste = mainForm.waste.value.trim();
  let date = mainForm.date.value.trim();
  let timeslot = mainForm.timeslot.value.trim();
  let reference = mainForm.reference.value.trim();

  if (!name || !village || !address || !mobile || !waste || !date || !timeslot || !reference) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'सर्व आवश्यक माहिती भरा.';
    return;
  }
  if (!/^[0-9]{10}$/.test(mobile)) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'वैध मोबाईल नंबर लिहा.';
    return;
  }
  if (!/^\d+$/.test(waste) || waste === '0') {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'रद्दी (किलो) फक्त आकड्यात द्या.';
    return;
  }

  let timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace('T', ' ');

  const row = [
    timestamp, name, address, location, mobile, reference, waste, date, timeslot, ""
  ];

  try {
    // ---- येथे तुमचा Web App URL वापरा ----
    const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxC0VqwFA4Bm8dszZytkhTCVSlQwrpZ9lZkKe7CrX10Rid62NqzK2JOeDiXnNTVIa_mSg/exec';
    const response = await fetch(WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row })
    });
    const result = await response.json();
    if (result.success) {
      mainForm.reset();
      successDiv.style.display = 'block';
      setTimeout(() => { successDiv.style.display = 'none'; }, 2000);
      showThankYou();
    } else {
      throw new Error(result.message || 'error');
    }
  } catch (err) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'सबमिट अयशस्वी. कृपया पुन्हा प्रयत्न करा.';
    return;
  }
});

// --- Thank you logic ---
function showThankYou() {
  mainForm.style.display = 'none';
  thankyouMsg.style.display = 'block';
}
thankyouExitBtn.addEventListener('click', () => {
  thankyouMsg.style.display = 'none';
  mainForm.style.display = '';
});

// --- QR Pay button ---
qrPayBtn.addEventListener('click', function() {
  window.open('upi://pay?pa=nandkishorchipade@okicici&pn=SamajikDiwali&am=&cu=INR', '_blank');
});

// --- On page load setup ---
window.addEventListener('DOMContentLoaded', function() {
  loadConveners();
  setupDateLogic();
  populateTimeSlots();
});

// --- तारीख लॉजिक अपडेट होत राहावे ---
setInterval(setupDateLogic, 60*1000);
