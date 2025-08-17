<!doctype html>
<html lang="mr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>रद्दी संकलन माहिती फॉर्म</title>
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#57d0c3" />
  <meta name="mobile-web-app-capable" content="yes" />
  <link rel="apple-touch-icon" href="logo.png" />
  <link rel="icon" href="favicon.ico" />
  <style>
    /* ... (style code same as previous, for brevity skipped) ... */
  </style>
</head>
<body>
  <div class="color-strip" aria-hidden="true"></div>
  <header>
    <img src="logo.png" alt="Logo">
    <h1>रद्दी संकलनातून सामाजिक दिवाळी 2025</h1>
  </header>
  <main class="container" role="main">
    <p class="lead">उपक्रमाकरीता आपल्याकडील वर्तमान पत्राची रद्दी दान करावयाची असल्यास खालील माहिती भरा.</p>
    <div id="messages">
      <div id="success" class="success" role="status">🙏 रद्दी संकलनाकरीता आपण दिलेल्या वेळेत लवकरच जागर फाउंडेशनचे संयोजक तुमच्याशी संपर्क साधतील. सहकार्याबद्दल मन:पूर्वक आभार!</div>
      <div id="error" class="error" role="alert">⚠️ कृपया सर्व फील्ड तपासा.</div>
    </div>
    <form id="main-form" autocomplete="on" novalidate>
      <div class="row col-full">
        <div style="flex:1">
          <label for="name">आपले नांव</label>
          <input id="name" name="name" type="text" required placeholder="नाव..." />
        </div>
      </div>
      <div class="row col-full">
        <div style="flex:1">
          <label for="address">पत्ता</label>
          <textarea id="address" name="address" placeholder="(गांव/रोड/बिल्डिंग)" required></textarea>
        </div>
      </div>
      <div class="row">
        <div class="col-2">
          <label for="location">शक्य असल्यास लोकेशन शेअर करा.</label>
          <div class="location-field">
            <button id="locBtn" type="button"><img src="location-icon.png" alt="Get location"></button>
            <input id="location" name="location" type="text" placeholder="← चिन्हावर टच करा" readonly />
          </div>
        </div>
        <div class="col-2">
          <label for="mobile">मोबाईल नंबर</label>
          <input id="mobile" name="mobile" type="tel" inputmode="numeric" maxlength="10" pattern="[0-9]{10}" autocomplete="tel" placeholder="98*******" required />
        </div>
      </div>
      <div class="row">
        <div class="col-2">
          <label for="waste">रद्दी (किलो)</label>
          <input id="waste" name="waste" type="number" min="0" step="1" placeholder="उदा. 25" required />
        </div>
        <div class="col-2">
          <label for="datetime">तारीख व वेळ</label>
          <input id="datetime" name="datetime" type="datetime-local" required style="display:none;" />
          <div class="date-time-row">
            <div>
              <input id="date" name="date" type="date" min="2025-09-15" max="2025-10-15" />
            </div>
            <div>
              <select id="timeslot" name="timeslot" disabled>
                <option value="">-- वेळ निवडा --</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="row col-full">
        <div style="flex:1">
          <label for="reference">संयोजक</label>
          <select id="reference" name="reference">
            <option value="">-- संयोजक निवडा --</option>
          </select>
        </div>
      </div>
      <div class="qr-section">
        <p>देणगीसाठी QR कोड स्कॅन करा:</p>
        <img src="qr-code.png" alt="QR Code" id="qrCodeImg">
      </div>
      <div class="actions">
        <button id="submitBtn" type="submit">सबमिट करा</button>
        <button id="exitBtn" type="button" style="display:none;">बाहेर पडा</button>
      </div>
    </form>
    <div class="thankyou" id="thankyouMessage">
      🙏 तुमच्या सहकार्याबद्दल आभार!
      <br>
      <button id="thankyouExitBtn" class="exit-thankyou-btn" type="button">बाहेर पडा</button>
    </div>
  </main>
  <div class="color-strip" aria-hidden="true"></div>
  <footer class="bottom">@जागर फाउंडेशन</footer>
  <script src="script.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      const SLOTS = [
        { label: "08:00 AM - 10:00 AM", start: "08:00" },
        { label: "10:00 AM - 12:00 PM", start: "10:00" },
        { label: "12:00 PM - 02:00 PM", start: "12:00" },
        { label: "02:00 PM - 04:00 PM", start: "14:00" },
        { label: "04:00 PM - 06:00 PM", start: "16:00" },
        { label: "05:00 PM - 07:00 PM", start: "17:00" }
      ];
      const dateInput = document.getElementById('date');
      const timeslotSelect = document.getElementById('timeslot');
      const datetimeHidden = document.getElementById('datetime');
      dateInput.addEventListener('change', function () {
        timeslotSelect.innerHTML = '<option value="">-- वेळ निवडा --</option>';
        if (!this.value) {
          timeslotSelect.disabled = true;
          datetimeHidden.value = '';
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
      timeslotSelect.addEventListener('change', function () {
        if (!this.value || !dateInput.value) {
          datetimeHidden.value = '';
          return;
        }
        datetimeHidden.value = dateInput.value + 'T' + this.value;
      });
      // Exit बटण - "thankyou" message बंद करण्यासाठी
      const thankyouExitBtn = document.getElementById('thankyouExitBtn');
      const thankyouMessage = document.getElementById('thankyouMessage');
      const mainForm = document.getElementById('main-form');
      thankyouExitBtn.addEventListener('click', function () {
        thankyouMessage.style.display = 'none';
        mainForm.style.display = 'block';
        mainForm.reset();
      });
    });
  </script>
</body>
</html>
