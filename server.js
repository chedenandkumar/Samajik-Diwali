const express = require('express');
let fetchFn;

// Node.js v18+ मध्ये fetch बिल्ट-इन आहे
if (typeof fetch === 'function') {
  fetchFn = fetch;
} else {
  // जुने Node.js वर्जन असल्यास node-fetch वापरा
  fetchFn = require('node-fetch');
}

const app = express();

app.use(express.json());
app.use(express.static(__dirname, { index: 'index.html' }));

// CORS सेटिंग
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// POST proxy
app.post('/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL parameter is missing" });
    }

    console.log(`POST proxy request to: ${url}`);

    const response = await fetchFn(decodeURIComponent(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }

  } catch (error) {
    console.error("Proxy POST error:", error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

// GET proxy
app.get('/proxy', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL parameter is missing" });
    }

    console.log(`GET proxy request to: ${url}`);

    const response = await fetchFn(decodeURIComponent(url));
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }

  } catch (error) {
    console.error("Proxy GET error:", error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`प्रॉक्सी सर्व्हर ${PORT} पोर्टवर चालू आहे`);
});
