document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('main-form');
  const successMsg = document.getElementById('success');
  const errorMsg = document.getElementById('error');
  const thankyouMessage = document.getElementById('thankyouMessage');
  const locBtn = document.getElementById('locBtn');
  const locationField = document.getElementById('location');
  const referenceSelect = document.getElementById('reference');
  const timeslotSelect = document.getElementById('timeslot');
  const dateInput = document.getElementById('date');
  const thankyouExitBtn = document.getElementById('thankyouExitBtn');
  const qrPayBtn = document.getElementById('qrPayBtn');
  const villageSelect = document.getElementById('village');

  // आवश्यकता 11: तारीख लॉजिक
  const today = new Date();
  const sept15_2025 = new Date('2025-09-15');
  const oct15_2025 = new Date('2025-10-15');
  const oct16_2025 = new Date('2025-10-16');
  let minDate, maxDate;

  if (today < sept15_2025) {
    minDate = '2025-09-15';
    maxDate = '2025-10-15';
  } else if (today >= sept15_2025 && today < oct16_2025) {
    minDate = today.toISOString().split('T')[0];
    maxDate = '2025-10-15';
  } else if (today >= oct16_2025) {
    dateInput.disabled = true;
    form.querySelector('#submitBtn').disabled = true;
    dateInput.style.background = '#f0f0f0';
    form.querySelector('#submitBtn').style.background = '#cccccc';
    form.querySelector('#submitBtn').style.cursor = 'not-allowed';
  }

  dateInput.setAttribute('min', minDate);
  dateInput.setAttribute('max', maxDate);

  // आवश्यकता 2: Google Sheets मधून गाव आणि संयोजक डेटा
  const SHEET_URL = 'https://opensheet.elk.sh/1W059r6QUWecU8WY5OdLLybCMkPOPr_K5IXXEETUbrn4/Conveners';
  let organizersData = [];

  fetch(SHEET_URL)
    .then(res => {
      if (!res.ok) throw new Error('Google Sheets डेटा लोड करताना त्रुटी: ' + res.status);
      return res.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Google Sheets मधून डेटा रिक्त आहे');
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'गाव आणि संयोजक यादी लोड करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.';
        return;
      }

      organizersData = data.map(row => ({
        village: (row.village || row.Village || '').toString().trim(), // लवचिक कॉलम नाव
        name: (row.name || row.Name || row[0] || '').toString().trim(),
        mobile: (row.mobile || row.Mobile || row[1] || '').toString().trim(),
      })).filter(it => it.name && it.village);

      if (organizersData.length === 0) {
        console.error('व्हॅलिड डेटा आढळला नाही');
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'गाव आणि संयोजक यादी उपलब्ध नाही.';
        return;
      }

      // गांव ड्रॉपडाऊन भरा
      const villages = [...new Set(organizersData.map(item => item.village))];
      const collator = new Intl.Collator('mr', { sensitivity: 'base', numeric: true });
      villages.sort((a, b) => collator.compare(a, b));
      villageSelect.innerHTML = '<option value="">-- गांव निवडा --</option>';
      villages.forEach(village => {
        const opt = document.createElement('option');
        opt.value = village;
        opt.textContent = village;
        villageSelect.appendChild(opt);
      });

      // गांव निवडल्यानंतर संयोजक अपडेट करा
      villageSelect.addEventListener('change', () => {
        const selectedVillage = villageSelect.value;
        referenceSelect.innerHTML = '<option value="">-- संयोजक निवडा --</option>';
        if (selectedVillage) {
          const organizers = organizersData.filter(item => item.village === selectedVillage);
          const HONORIFICS_REGEX = /^(श्री\.?\s*|श्रीमती\.?\s*|डॉ\.?\s*|डॉ\s*|Dr\.?\s*|Dr\s*|Mr\.?\s*|Mrs\.?\s*)/i;
          organizers.sort((a, b) => {
            const sortKeyA = a.name.replace(HONORIFICS_REGEX, '').trim();
            const sortKeyB = b.name.replace(HONORIFICS_REGEX, '').trim();
            return collator.compare(sortKeyA, sortKeyB);
          });
          organizers.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.name;
            opt.textContent = item.name;
            opt.setAttribute('data-mobile', item.mobile);
            referenceSelect.appendChild(opt);
          });
          const otherOpt = document.createElement('option');
          otherOpt.value = 'यापैकी कोणीही नाही अन्य मार्ग';
          otherOpt.textContent = 'यापैकी कोणीही नाही अन्य मार्ग';
          referenceSelect.appendChild(otherOpt);
        }
      });
    })
    .catch(err => {
      console.error('संयोजक लोड करताना त्रुटी:', err);
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'गाव आणि संयोजक यादी लोड करताना त्रुटी. कृपया नेटवर्क तपासा.';
      setTimeout(() => errorMsg.style.display = 'none', 3000);
    });

  // तारीख आणि वेळ स्लॉट्स
  const SLOTS = [
    { label: "08:00 AM - 10:00 AM", start: "08:00" },
    { label: "10:00 AM - 12:00 PM", start: "10:00" },
    { label: "12:00 PM - 02:00 PM", start: "12:00" },
    { label: "02:00 PM - 04:00 PM", start: "14:00" },
    { label: "04:00 PM - 06:00 PM", start: "16:00" },
    { label: "05:00 PM - 07:00 PM", start: "17:00" }
  ];

  dateInput.addEventListener('change', function () {
    timeslotSelect.innerHTML = '<option value="">-- वेळ निवडा --</option>';
    if (!this.value) {
      timeslotSelect.disabled = true;
      return;
    }
    if (this.value < minDate || this.value > maxDate) {
      timeslotSelect.disabled = true;
      timeslotSelect.innerHTML = '<option value="">तारीख योग्य नाही</option>';
      return;
    }
    timeslotSelect.disabled = false;
    SLOTS.forEach(slot => {
      const opt = document.createElement('option');
      opt.value = slot.start;
      opt.textContent = slot.label;
      timeslotSelect.appendChild(opt);
    });
  });

  // आवश्यकता 7: लोकेशन पर्यायी
  locationField.removeAttribute('required');

  // आवश्यकता 4: लोकेशन बटण (प्लेसहोल्डर HTML मध्ये जोडला आहे)
  locBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          locationField.value = `https://maps.google.com/?q=${lat},${lon}`;
        },
        () => {
          errorMsg.style.display = 'block';
          errorMsg.textContent = 'लोकेशन मिळवण्यात अडचण आली. कृपया परवानगी द्या
