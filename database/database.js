const redis = require('redis');
const secretConf = require('../config/secretConfig') || {redis: { url : undefined }};

const url = process.env.REDISCLOUD_URL || secretConf.redis.url;

const client = redis.createClient(url, {no_ready_check: true});

client.on('error', error => {
  console.log(`${Date.toString()} - Error occur in database client - ${error}`)
});

client.auth(secretConf.redis.password);

module.exports.database = client;

module.exports.getMessages = async (database, callback) => {
    database.lrange('messages', 0, -1,  async (err, reply) => {
        err ? console.error(err) : callback(reply);
    });
};

module.exports.addMessages = async (database, author, date, message) => {
    database.rpush('messages', JSON.stringify({author, date, message}));
};