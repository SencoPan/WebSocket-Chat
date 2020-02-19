const http = require('http');
const pug = require('pug');
const WebSocket = require('ws').Server;

const port = 3000;
const htmlEntities = async str => {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

let template;
let connections = [];

const server = http.createServer((req, res) => {
    console.log(`GET - ${Date().toString()} - Main path is reached`);

    template = pug.compileFile('./webSocket.pug');

    res.write(template());
    res.end();
});


server.listen(3000, () => {
    console.log(`${Date().toString()} - Server is launched at localhost:${port}`)
});

const wsServer = new WebSocket({ server });

wsServer.on('request', async request => {
    console.log(`${Date.now().toString()} - Request from origin: ${request.origin}`);

    let connection = request.accept(null, request.origin);
    let username = false;

    const index = connections.push(connection) - 1;

    connection.on('message', async (message) => {
        message.type === 'UTF-8' ? console.log(`${Date.now().toString()} - got message - ${message}`) : console.log(`${Date.now().toString()} - Got bad message`);

        if( username === false ) {
            username = await htmlEntities(message.utf8date);

            connection.sendUTF( JSON.stringify({ type: 'test', data: username }));

            console.log((Date().toString()) + '- User is known as: ' + username);
        } else {
            console.log(`${Date.now().toString()} - Received message from: ${username} : ${message}`)

            const data = {
                time: Date().toString(),
                text: htmlEntities(message.utf8date),
                author: username
            };
            const json = { type: 'message', text: message }

            for (const client of connections) {
                await client.sendUTF(json)
            }
        }
    });

    connection.on('close', async (connection) => {
        if (username !== false) {
            console.log((Date().toString()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            connections.splice(index, 1);
        }
    });

    connection.on('error', async error => {
        console.error(`${Date.now()} Error occur:  ${error}`);
    })
});