const http = require('http');
const pug = require('pug');
const fs = require('fs');
const WebSocket = require('websocket').server;

const port = require('./config').server.port;

let template;
let connections = [];

const server = http.createServer((req, res) => {
    console.log(`GET - ${Date().toString()} - ${req.url}`);
    if(req.url === '/'){
        template = pug.compileFile('./webSocket.pug');

        res.end(template());
    } else if(req.url === '/chatStyle.css'){
        res.writeHeader(200, {'Content-type':'text/css'});

        fs.readFile('./chatStyle.css', async (err, file) => {
            if (err) console.error(err);

            await res.end(file);
        });
    } else if (req.url === '/client.js'){
        res.writeHeader(200, {'Content-type':'text/javascript'});

        fs.readFile('./client.js', async (err, file) => {
            if (err) console.error(err);

            await res.end(file);
        });
    }
});


server.listen(3000, () => {
    console.log(`${Date().toString()} - Server is launched at localhost:${port}`)
});

const wsServer = new WebSocket({ httpServer: server });

wsServer.on('request', function(request) {
    console.log(`WS - ${Date().toString()} - Request from origin: ${request.origin}`);

    let connection = request.accept(null, request.origin);
    let username = false;

    connection.on('message', async (message) => {
        message.type === 'utf8' ?
            console.log(`WS - ${Date().toString()} - Got message - ${message.utf8Data}`) :
            console.log(`WS - ${Date().toString()} - Got bad message`);

        if( username === false ) {
            username = message.utf8Data;

            for (let client of connections) {
                client.sendUTF( JSON.stringify({ type: 'name', data: username }));
            }

            console.log("WS -" + (Date().toString()) + '- User is known as: ' + username);
        } else {
            console.log(`WS - ${Date().toString()} - Received message from: ${username} : ${message.utf8Data}`);

            const json = {
                type: 'message',
                time: Date().toString(),
                text: message.utf8Data,
                author: username
            };

            for (let client of connections) {
                await client.sendUTF(JSON.stringify(json))
            }
        }
    });

    connection.on('close', async (connection) => {

        if (username !== false) {
            console.log("WS - " + (Date().toString()) + " Peer "
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