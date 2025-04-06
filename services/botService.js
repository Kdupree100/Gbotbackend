// services/botService.js

const timestamp = () => new Date().toISOString(); // Function to get current timestamp

let isBotRunning = false;

function startTradingBot() {
    if (!isBotRunning) {
        isBotRunning = true;
        console.log(`[${timestamp()}] ✅ Trading bot started.`);
    } else {
        console.log(`[${timestamp()}] ⚠️ Trading bot is already running.`);
    }
}

function stopTradingBot() {
    if (isBotRunning) {
        isBotRunning = false;
        console.log(`[${timestamp()}] 🛑 Trading bot stopped.`);
    } else {
        console.log(`[${timestamp()}] ⚠️ Trading bot is already stopped.`);
    }
}

function checkBotStatus() {
    return { running: isBotRunning, timestamp: timestamp() };
}

function getBotStatus() {
    return { status: isBotRunning ? "Bot is running" : "Bot is stopped", timestamp: timestamp() };
}

function executeTrade(tradeData) {
    console.log(`[${timestamp()}] 💰 Executing trade:`, tradeData);
    return { success: true, tradeId: Math.floor(Math.random() * 10000) };
}

module.exports = { 
    startTradingBot, 
    stopTradingBot, 
    checkBotStatus, 
    getBotStatus, 
    executeTrade 
};
