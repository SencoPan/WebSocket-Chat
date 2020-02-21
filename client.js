const messageBox = document.getElementsByClassName('messages')[0];
const inputAuth = document.getElementsByTagName('input')[0];
const input = document.getElementsByTagName('input')[2];
const authBlock = document.getElementsByClassName('auth')[0];
const messageBlock = document.getElementsByClassName('message-sender')[0];
const firstUser = document.body.querySelector('.first-user .info');
const secondUser = document.body.querySelector('.second-user .info');

const createMessage = async (info) => {
    const newMessage = document.createElement('div');

    newMessage.className = 'message';

    newMessage.insertAdjacentHTML('beforeend', `
            <p class="name"> ${info.author} : &nbsp </p>
            <p > ${info.text} </p>
    `);

    return newMessage;
};

const addMessage = async (message) => {
    console.log('message added');

    const newMessage = await createMessage(message);

    messageBox.append(newMessage)
};

let user = false;

window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    messageBox.innerHTML = '<p class="message"> Sorry, but your browser doesn\'t</p>';
    input.style.display = 'none';
} else {
    const connection = new WebSocket('ws://127.0.0.1:3000');

    connection.onopen = async () => {


    connection.onerror = async (error) => {
        console.error(error)
    };

    connection.onmessage = async (receivedMessage) => {
        const message =  JSON.parse(receivedMessage.data);

        message ? true : console.error('Bad message');

        if (message.type === 'name') {
            if( firstUser.lastChild.nodeName === 'SPAN'  )
                firstUser.innerHTML = message.data;
            else if(secondUser.lastChild.nodeName === 'SPAN')
                secondUser.innerHTML =  message.data;
        }

        if(message.type === 'message'){
            await addMessage(message)
        }
    };

    inputAuth.onkeypress = async event => {
        if (event.keyCode === 13 && inputAuth.value) {
            user = inputAuth.value;

            connection.send(user);

            authBlock.style.display = 'none';
            messageBlock.style.display = 'flex';
        }
    };

    input.onkeypress = async event => {
        if (event.keyCode === 13 && inputAuth.value) {
            connection.send(input.value);

            input.value = '';
        }
    };

    window.onbeforeunload = async () => {
        connection.close();
    }
}}
