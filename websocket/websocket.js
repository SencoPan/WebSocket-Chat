const WebSocket = require('websocket').server;

const { database, receiveMessages, insertMessage } = require('../database/database');

let connections = [];
let names = [];

const currentTime = async () => {
    const today = new Date();

    let date = today.getFullYear() + '.' + (today.getMonth()+1) + '.' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    return `${date} - ${time}`;
};


module.exports.webSocket = async server => {
    const wsServer = new WebSocket({
        httpServer: server,
        maxReceivedFrameSize: 30 * 1024 * 1024,
        maxReceivedMessageSize: 10 * 1024 * 1024
    });

    // Test
    // await insertMessage(database, 'Danny', 'some date', `${Math.random()}`);
    // const showMeAlready = (text) => { console.log( text ) };
    // await receiveMessages(database, showMeAlready);


    wsServer.on('request', async (request) => {
        console.log(`WS - ${await currentTime()} - Request from origin: ${request.origin}`);

        let connection = request.accept(null, request.origin);
        let username = false;

        connections.push(connection);

        connection.on('message', async (message) => {
            message.type === 'utf8' ?
                console.log(`WS - ${await currentTime()} - Got message - type - ${message.type}`) :
                console.log(`WS - ${await currentTime()} - Got bad message`);

            let data = {};

            try{
                data = JSON.parse(message.utf8Data)
            }catch (e) {
                data.type = false;
            }

            if(data.type === 'image'){
                for (let client of connections) {
                    client.sendUTF( JSON.stringify({ type: 'image', data: data.data, author: username, date: await currentTime()}));
                }
            }
            else if (data.type === 'disconnect'){
                names.splice(names.indexOf(data.data), 1);

                username = false;

                for (let client of connections) {
                    client.sendUTF( JSON.stringify({ type: 'name', data: names }));
                }
            }
            else if( username === false ) {
                username = message.utf8Data;

                names.push(username);

                const sendData = async (reply) => {
                    connection.sendUTF(JSON.stringify( {type: 'chunk', data: reply} ));
                };

                await receiveMessages(database, sendData);

                for (let client of connections) {
                    client.sendUTF( JSON.stringify({ type: 'name', data: names }));
                }

                console.log("WS -" + (await currentTime()) + '- User is known as: ' + username);
            } else {
                console.log(`WS - ${await currentTime()} - Received message from: ${username} : ${message.utf8Data}`);

                const json = {
                    type: 'message',
                    time: await currentTime(),
                    text: message.utf8Data,
                    author: username
                };

                await insertMessage(database, json);

                for (let client of connections) {
                    client.sendUTF(JSON.stringify(json))
                }
            }
        });

        connection.on('close', async (connection) => {

            if (username !== false) {
                console.log("WS - " + (await currentTime()) + " Peer "
                    + connection + " disconnected.");
            }
            connections.forEach( client => {
                if(client.state === 'closed')
                    connections.splice(connections.indexOf(client), 1)
            })
        });

        connection.on('error', async error => {
            console.error(`${Date.now()} Error occur:  ${error}`);
        })
    });
};

module.exports.currentTime = currentTime;