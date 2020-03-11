const sqlite3 = require('sqlite3').verbose();

const currentTime = async () => {
    const today = new Date();

    let date = (today.getMonth()+1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    return `${date} - ${time}`;
};

let database = new sqlite3.Database('./database/last-200-messages.db', async (err) => {
    if ( err )
        console.log( err );

    console.log('Connected');
});

const takeMessages = `SELECT * FROM message`;
const insertMessage = `INSERT INTO message(message, data) VALUES(?, ?)`;

const initializeTable = `CREATE TABLE IF NOT EXISTS message (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            message VARCHAR(255) NOT NULL,
                            date VARCHAR(255) NOT NULL DEFAULT ${currentTime()}
                        )`
;

database.serialize(async () => {
    database.prepare(initializeTable).run().finalize();
});

module.exports.database = database;

module.exports.addMessage = async database =>
        database.serialize(async (text, data) => {
                database.prepare(insertMessage, [text, data]).run();
        });

module.exports.getMessage = async database =>
        database.serialize(async () => {
            database.prepare(takeMessages).run();
        });
