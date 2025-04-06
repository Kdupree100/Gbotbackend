const express = require('express');
const app = express();
const port = 3001;  // Using a different port to avoid conflicts

app.use(express.json()); // ✅ Middleware for JSON Parsing

app.get('/', (req, res) => {
    console.log("✅ GET /test route hit"); // Log to consolenpm list express mongoose

    res.json({ message: "Express is working fine!" });
});

app.listen(port, () => {
    console.log(`✅ Test server running at http://localhost:${port}`);
});
