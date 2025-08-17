document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('main-form');
  const successMsg = document.getElementById('success');
  const errorMsg = document.getElementById('error');
  const thankyouMessage = document.getElementById('thankyouMessage');
  const locBtn = document.getElementById('locBtn');
  const locationField = document.getElementById('location');
  const referenceSelect = document.getElementById('reference');
  const exitBtn = document.getElementById('exitBtn');

  // 1️⃣ लोकेशन मिळवणे
  locBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          locationField.value = `https://maps.google.com/?q=${lat},${lon}`;
        },
        () => alert('लोकेशन मिळवण्यात अडचण आली. कृपया परवानगी द्या.')
      );
    } else {
      alert('तुमचा ब्राउझर लोकेशन सपोर्ट करत नाही.');
    }
  });

  // 2️⃣ Google Sheet मधून संयोजकांची यादी (नाव + मोबाईल नंबर) लोड करणे — sorted alphabetically ignoring honorifics
  const SHEET_URL = 'https://opensheet.elk.sh/1W059r6QUWecU8WY5OdLLybCMkPOPr_K5IXXEETUbrn4/Conveners';

  fetch(SHEET_URL)
    .then(res => res.json())
    .then(data => {
      const HONORIFICS_REGEX = /^(श्री\.?\s*|श्रीमती\.?\s*|डॉ\.?\s*|डॉ\s*|Dr\.?\s*|Dr\s*|Mr\.?\s*|Mrs\.?\s*)/i;

      const items = data.map(row => {
        const rawName = (row.name || row[0] || '').toString().trim();
        const mobile = (row.mobile || row[1] || '').toString().trim();
        const sortKey = rawName.replace(HONORIFICS_REGEX, '').trim();
        return { displayName: rawName, sortKey, mobile };
      }).filter(it => it.displayName);

      const collator = new Intl.Collator('mr', { sensitivity: 'base', numeric: true });
      items.sort((a, b) => collator.compare(a.sortKey, b.sortKey));

      referenceSelect.innerHTML = '<option value="">-- संयोजक निवडा --</option>';
      items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.displayName;
        opt.textContent = item.displayName;
        opt.setAttribute('data-mobile', item.mobile);
        referenceSelect.appendChild(opt);
      });
    })
    .catch(err => console.error('संयोजक लोड करताना त्रुटी:', err));

  // 3️⃣ फॉर्म सबमिशन
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    if (!form.checkValidity()) {
      errorMsg.style.display = 'block';
      return;
    }

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    if (!data.quantity && data.waste) {
      data.quantity = data.waste;
    }

    const selectedOption = referenceSelect.options[referenceSelect.selectedIndex];
    const coordinatorMobile = selectedOption ? selectedOption.getAttribute('data-mobile') : '';

    // ✅ UPDATED SCRIPT_URL (Google Apps Script)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxC0VqwFA4Bm8dszZytkhTCVSlQwrpZ9lZkKe7CrX10Rid62NqzK2JOeDiXnNTVIa_mSg/exec';
    const bodyData = new URLSearchParams(data).toString();

    fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyData
    })
      .then(res => res.json().catch(() => ({ success: true })))
      .then(response => {
        if (response.success) {
          successMsg.style.display = 'block';
          form.style.display = 'none';
          thankyouMessage.style.display = 'block';

          if (response.whatsappUrl) {
            window.open(response.whatsappUrl, '_blank');
          }
        } else {
          throw new Error('सबमिशन अयशस्वी');
        }
      })
      .catch(err => {
        console.error(err);
        errorMsg.style.display = 'block';
      });
  });

  // 5️⃣ Exit बटण
  exitBtn.addEventListener('click', function () {
    form.reset();
    form.style.display = 'block';
    thankyouMessage.style.display = 'none';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
  });
});
