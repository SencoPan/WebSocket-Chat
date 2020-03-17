const http = require('http');
const pug = require('pug');
const fs = require('fs');

const {database} = require('./database/database');
const { webSocket, currentTime } = require('./websocket/websocket');

const port = process.env.PORT || require('./config/config').server.port;

let template;

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} - ${await currentTime()} - ${req.url}`);
    if(req.url === '/'){
        res.writeHeader(200, {'Content-type':'text/html'});

        template = pug.compileFile('./public/webSocket.pug');

        res.end(template());
    } else if(req.url === '/chatStyle.css'){
        res.writeHeader(200, {'Content-type':'text/css'});

        fs.readFile('./public/chatStyle.css', async (err, file) => {
            if (err) console.error(err);

            await res.end(file);
        });
    } else if (req.url === '/client.js'){
        res.writeHeader(200, {'Content-type':'text/javascript'});

        fs.readFile('./public/client.js', async (err, file) => {
            if (err) console.error(err);

            await res.end(file);
        });
    } else{
        res.end()
    }
});

database.on('connect', async () => {
    console.log(`${await currentTime()} - database is running`);

    server.listen(port, async () => {
        console.log(`${await currentTime()} - Server is launched at localhost:${port}`)
    });

    webSocket(server);
});