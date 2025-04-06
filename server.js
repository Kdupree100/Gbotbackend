const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process'); // To run Python process
const botRoutes = require('./routes/botRoutes');  
const dexRoutes = require('./routes/dexRoutes');
const aRoutes = require('./routes/aRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const connectDB = require('./database/db');  // Import the connection function
const arbDexRoutes = require("./routes/arbDexRoutes");


const app = express();
const port = 3000;

connectDB();


console.log('✅ Middleware initialized');
// ✅ Middleware

app.use(express.json()); 
app.use(cors());


// ✅ Register API Routes
app.use("/api", arbDexRoutes);
app.use('/api/dex', dexRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/analytics', aRoutes);
app.use('/api/trades', tradeRoutes);

console.log('✅ All routes registered');
// ✅ Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the GBotBackend API Backend!');
});

// ✅ Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ message: 'API is running smoothly!' });
});

// ✅ Start the Python Trading Bot
app.get('/start-bot', (req, res) => {
    const pythonProcess = spawn('python', ['Gbot.py']);
    
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python bot process closed with code ${code}`);
    });

    res.json({ message: 'Bot started!' });
});

// ✅ Start Server
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});

