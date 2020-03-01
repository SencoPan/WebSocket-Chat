const messageBox = document.getElementsByClassName('messages')[0];
const inputAuth = document.getElementsByTagName('input')[0];
const input = document.getElementsByTagName('input')[2];
const fileinput = document.getElementsByTagName('input')[4];
const submitButton = document.getElementsByTagName('input')[1];
const authBlock = document.getElementsByClassName('auth')[0];
const messageBlock = document.getElementsByClassName('message-sender')[0];
const userBlock = document.getElementsByClassName('users')[0];
const logBlock = document.getElementsByClassName('log-user')[0];
const icon = document.getElementsByTagName('i')[0];

const reader = new FileReader();

console.log(document.getElementsByTagName('input'));

const createUser = async (info) => {
    const newUser = document.createElement('div');
    const name = document.createTextNode(`${info}`);

    newUser.className = 'user';

    newUser.insertAdjacentHTML('beforeend', `
            <i class="far fa-user"></i>
            <p> </p>
    `);

    newUser.children[1].appendChild(name);

    return newUser;
};

const createMessage = async (info) => {
    const newMessage = document.createElement('div');

    const name = document.createTextNode(`${info.author}`);

    newMessage.insertAdjacentHTML('beforeend', `
            <p class="name"></p>
            <p></p>
    `);

    newMessage.children[0].appendChild(name);

    return newMessage;
};

const addImage = async (imageInfo) => {
    const newImage = await createMessage(imageInfo);
    const image = document.createElement('img');

    image.src = imageInfo.data;

    newImage.children[1].appendChild(image);
    newImage.className = 'message';
    messageBox.append(newImage);
    messageBox.scrollTop = messageBox.scrollHeight;
};

const addMessage = async (message) => {
    console.log('message added');
    const text = document.createTextNode(`${message.text}`);
    const newMessage = await createMessage(message);

    newMessage.className = 'message';
    newMessage.children[1].appendChild(text);

    messageBox.append(newMessage);
    messageBox.scrollTop = messageBox.scrollHeight;
};

const addUser = async user => {
    console.log('User added', user);
    const newUser = await createUser(user);
    userBlock.append(newUser);
};

const addLog = async (user, logType) => {
    const newUser = await createUser(user);

    newUser.style.color = logType;
    newUser.className = 'log';

    logBlock.append(newUser);
    setTimeout(() => {
        newUser.style.display = 'none'
    }, 5000)
};

const removeUser = async (user, connection) => {
    connection.send(JSON.stringify({type: 'disconnect', data: user}))
};

const HOST = location.origin.replace(/^http/, 'ws');

window.WebSocket = window.WebSocket || window.MozWebSocket;

if (!window.WebSocket) {
    messageBox.innerHTML = '<p class="message"> Sorry, but your browser doesn\'t</p>';
    input.style.display = 'none';
} else {
    let user = false;
    let names = [];
    let connection = new WebSocket(HOST);

    connection.onopen = async () => {
        console.log('User connected')
    };

    connection.onerror = async (error) => {
        console.dir(error);
        connection.close();
    };

    connection.onclose = async (data) => {
        console.log('User disconnected');
    };

    connection.onmessage = async (receivedMessage) => {
        const message =  JSON.parse(receivedMessage.data);

        message ? true : console.error('Bad message');

        if (message.type === 'name') {
            const initialUsers = document.getElementsByClassName('user');

            for (const user of initialUsers){
                if( message.data.indexOf(user.children[0].innerText) === -1){
                    names.splice(names.indexOf(user.children[0].innerHTML.substr(1)), 1)
                    userBlock.removeChild(user)
                } else if(names.indexOf(user.children[0].innerText) === -1){
                    names.push(name);
                }
            }

            for (const name of message.data) {
                if(names.indexOf(name) === -1){
                    names.push(name);
                    await addUser(name)
                }
            }
        }
        if(message.type === 'image'){
            await addImage(message);
        }
        if(message.type === 'message'){
            await addMessage(message)
        }
    };

    inputAuth.onkeypress = async event => {
        if (event.keyCode === 13 && inputAuth.value) {
            if (inputAuth.value.length > 15){
                inputAuth.setCustomValidity('Слишком большое имя.');
                await addLog('Слишком большое имя.', 'red');
            }
            else {
                user = inputAuth.value.toString();

                await connection.send(user);

                authBlock.style.display = 'none';
                messageBlock.style.display = 'flex';
            }
        }
    };

    input.onkeypress = async event => {
        if (event.keyCode === 13 && input.value) {
            await connection.send(input.value.toString());

            input.value = '';
        }
    };

    icon.onclick = async event => {
        fileinput.click()
    };

    fileinput.onchange = async event => {
        reader.readAsDataURL(fileinput.files[0]);

        reader.onloadend = async () => {
            connection.send(JSON.stringify({type: 'image', data: reader.result}));
        }
    };

    window.onbeforeunload = async () => {
        await removeUser(user, connection);
    };
    window.onunload = async () =>  {
        await removeUser(user, connection);
    };
}
