const redis = require('redis');
const secretConf = require('../config/secretConfig') || {redis: { url : undefined }};

const url = process.env.REDISCLOUD_URL || secretConf.redis.url;

const client = redis.createClient(url, {no_ready_check: true});

client.on('connect', async () => {
   console.log('connected')
});

module.exports = client;