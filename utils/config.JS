require('dotenv').config();

module.exports = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost/botDB',
    BITQUERY_ENDPOINT: "https://graphql.bitquery.io",
    BITQUERY_API_KEY: process.env.BITQUERY_API_KEY
};
