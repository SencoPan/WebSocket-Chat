const redis = require('redis');

let secretConf;

if ( process.env.DEV === "true" ) {
    secretConf = require('../config/secretConfig');
} else {
    secretConf = { redis: {} }
}

const url = process.env.REDISCLOUD_URL || secretConf.redis.url;
const client = redis.createClient(url, {no_ready_check: true});

client.auth(secretConf.redis.secretKey || process.env.REDISCLOUD_SECRETKEY);

const insertChunk = async (database, author, date, message) => {
    const currentChunk = `messageChunk_${Math.random().toString().substr(2)}`;

    database.lpush('messageChunk', currentChunk);
    database.lpush(currentChunk, JSON.stringify({author, date, message}))
};

const deleteAllData = async (database) => {
    database.keys('*', async (err, reply) => {
        err ? console.error(err) : reply.forEach(rep => {
            database.del(rep);
        });
    });
};

module.exports.database = client;

module.exports.receiveMessages = async (database, callback) => {
    database.lrange('messageChunk', 0, 1,  async (err, reply) => {
        err ? console.error(err) :
            reply.forEach( chunk => {
                database.lrange(chunk, 0, -1, async (err, reply) => {
                    callback(reply);
                })
            });
    });
};

module.exports.insertMessage = async (database, userObj) => {
   database.lindex('messageChunk', 0, async (err, currentChunk) => {
       let { type, time, text, author } = userObj;
       if(!currentChunk)
           await insertChunk(database, type, author, time, text);
       else{
           database.llen(currentChunk, async (err, reply) => {
               if (reply < 100)
                   database.rpush(currentChunk, JSON.stringify({ type, author, time, text }));
               else
                   await insertChunk(database, type, author, time, text);
           })
       }
   })
};

module.exports.deleteAllData = deleteAllData;