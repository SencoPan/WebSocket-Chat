const messageBox = document.getElementsByClassName('messages')[0];
const inputAuth = document.getElementsByTagName('input')[0];
const input = document.getElementsByTagName('input')[2];
const authBlock = document.getElementsByClassName('auth')[0];
const messageBlock = document.getElementsByClassName('message-sender')[0];

const addMessage = async (message) => {
    console.log('message added')
    console.log(message)
    const newMessage = `
        <div class="message">
            <p class="name"> ${message.author} </p>
            <p > ${message.text} </p>
        </div>
    `;
    messageBox.prepend(newMessage)
};

let user = false;

window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    messageBox.innerHTML = '<p class="message"> Sorry, but your browser doesn\'t</p>';
    input.style.display = 'none';
} else {
    const connection = new WebSocket('ws://127.0.0.1:3000');

    connection.onopen = async () => {
       alert('Opened')
    };

    connection.onerror = async (error) => {
        alert('Error');
        console.log(error)
    };

    connection.onmessage = async (receivedMessage) => {
        const message =  JSON.parse(receivedMessage.data);
        console.log(message)

        message ? true : console.error('Bad message');

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
}
