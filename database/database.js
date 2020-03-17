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

/*
const deleteAllData = async (database) => {
    database.keys('*', async (err, reply) => {
        err ? console.error(err) : reply.forEach(rep => {
            database.del(rep);
        });
    });
};
*/

module.exports.database = client;

module.exports.receiveMessages = async (database, callback) => {
    database.lrange('messageChunk', 0, -1,  async (err, reply) => {
        err ? console.error(err) :
            reply.forEach( chunk => {
                database.lrange(chunk, 0, -1, async (err, reply) => {
                    callback(reply);
                })
            });
    });
};

module.exports.insertMessage = async (database, author, date, message) => {
   database.lindex('messageChunk', 0, async (err, currentChunk) => {
       if(!currentChunk)
           await insertChunk(database, author, date, message);
       else{
           database.llen(currentChunk, async (err, reply) => {
               if (reply < 3)
                   database.rpush(currentChunk, JSON.stringify({author, date, message}));
               else
                   await insertChunk(database, author, date, message);
           })
       }
   })
};