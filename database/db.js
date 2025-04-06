const mongoose = require('mongoose');
const config = require('../utils/config');

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
