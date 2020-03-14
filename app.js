const http = require('http');
const pug = require('pug');
const fs = require('fs');

const webSocket = require('./websocket/websocket');

const port = process.env.PORT || require('./config/config').server.port;

let template;

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} - ${Date().toString()} - ${req.url}`);
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

server.listen(port, () => {
    console.log(`${Date().toString()} - Server is launched at localhost:${port}`)
});

webSocket(server);