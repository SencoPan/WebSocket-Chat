const messageBox = document.getElementsByClassName('messages')[0];
const input      = document.getElementsByClassName('input');

const addMessage = async (message) => {
    const newMessage = `
        <div class="message">
            <p class="name"> ${message.author} </p>
            <p > ${message.text} </p>
        </div>
    `;
    messageBox.appendChild(newMessage)
};

let user = false;

window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    messageBox.innerHTML = '<p class="message"> Sorry, but your browser doesn\'t</p>';
    input.style.display = 'none';
} else {
    const connection = new WebSocket('ws://127.0.0.1:3000')

    connection.onmessage = async (receivedMessage) => {
        let message = JSON.parse(receivedMessage.data);

        message ? true : throw Error('Bad data');

        if(message.type === 'message'){
            addMessage(message)
        }


    }

};