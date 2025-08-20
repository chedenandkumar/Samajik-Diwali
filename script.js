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
        village: (row['गाव'] || '').toString().trim(),
        name: (row['संयोजकाचे नाव'] || '').toString().trim(),
        mobile: (row['मोबाईल नंबर'] || '').toString().trim(),
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
          errorMsg.textContent = 'लोकेशन मिळवण्यात अडचण आली. कृपया परवानगी द्या.';
          setTimeout(() => errorMsg.style.display = 'none', 3000);
        }
      );
    } else {
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'तुमचा ब्राउझर लोकेशन सपोर्ट करत नाही.';
      setTimeout(() => errorMsg.style.display = 'none', 3000);
    }
  });

  // आवश्यकता 5 आणि 8: Google Sheets मध्ये सबमिशन आणि स्टॅट्स
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    thankyouMessage.style.display = 'none';

    // तारीख योग्य आहे का?
    const dateVal = dateInput.value;
    if (!form.checkValidity() || !dateVal || dateVal < minDate || dateVal > maxDate) {
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'सर्व आवश्यक फिल्ड्स भरा किंवा योग्य तारीख निवडा';
      return;
    }

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // तारीख आणि वेळ स्लॉट
    data.date = dateInput.value || "";
    data.timeslotLabel = timeslotSelect.options[timeslotSelect.selectedIndex]?.textContent || "";
    data.email = formData.get('email') || 'N/A'; // आवश्यकता 5: ईमेल

    // Google Apps Script वेब अ‍ॅप URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxC0VqwFA4Bm8dszZytkhTCVSlQwrpZ9lZkKe7CrX10Rid62NqzK2JOeDiXnNTVIa_mSg/exec';
    const bodyData = new URLSearchParams(data).toString();
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
      });
      const result = await response.json().catch(() => ({ success: true }));

      if (result.success) {
        form.style.display = 'none';
        thankyouMessage.style.display = 'block';
        successMsg.style.display = 'block';

        // आवश्यकता 8: स्टॅट्स मिळवा आणि दाखवा ("Responses" टॅबमधून)
        const statsResponse = await fetch('https://opensheet.elk.sh/1W059r6QUWecU8WY5OdLLybCMkPOPr_K5IXXEETUbrn4/Responses');
        const statsData = await statsResponse.json();
        let totalWaste = 0;
        let totalFunds = 0;

        if (statsData && statsData.length) {
          totalWaste = statsData.reduce((sum, row) => sum + parseFloat(row.Waste || 0), 0);
          totalFunds = statsData.reduce((sum, row) => sum + parseFloat(row.funds || 0), 0);
        }

        document.getElementById('totalWaste').textContent = totalWaste.toFixed(2);
        document.getElementById('totalFunds').textContent = totalFunds.toFixed(2);

        setTimeout(() => successMsg.style.display = 'none', 3000);
      } else {
        throw new Error('सबमिशन अयशस्वी');
      }
    } catch (err) {
      console.error(err);
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'सबमिशनमध्ये त्रुटी आली';
      setTimeout(() => errorMsg.style.display = 'none', 3000);
    }
  });

  // Thankyou मध्ये Exit बटण
  thankyouExitBtn && thankyouExitBtn.addEventListener('click', function () {
    thankyouMessage.style.display = 'none';
    form.style.display = 'block';
    form.reset();
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    timeslotSelect.innerHTML = '<option value="">-- वेळ निवडा --</option>';
    timeslotSelect.disabled = true;
  });

  // QR/R-logo बटणवर क्लिक केल्यावर पेमेंट ॲप उघडा
  qrPayBtn && qrPayBtn.addEventListener('click', function () {
    const upiLink = 'upi://pay?pa=nandkishorchipade@okicici&pn=SamajikDiwali&cu=INR&am=0';
    try {
      window.location.href = upiLink;
      // फॉल बॅक: जर UPI लिंक 2 सेकंदात काम करत नसेल, तर अलर्ट दाखवा
      setTimeout(() => {
        alert('UPI ॲप उघडत नसेल, तर कृपया QR कोड स्कॅन करा किंवा Google Pay/PhonePe सारखे ॲप इन्स्टॉल करा.');
      }, 2000);
    } catch (err) {
      console.error('UPI लिंक त्रुटी:', err);
      alert('UPI पेमेंट ॲप उघडण्यात त्रुटी. कृपया QR कोड स्कॅन करा किंवा दुसरे डिव्हाइस वापरा.');
    }
  });
});
