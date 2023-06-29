// Select the necessary elements from the DOM
const chatBox = document.querySelector('#chatBox');
const chatForm = document.querySelector('#chatForm');
const userInput = document.querySelector('#userInput');
const exportBtn = document.querySelector('#exportBtn');
const importBtn = document.querySelector('#importBtn');
const spinner = document.querySelector('#spinner');
const toggleDarkModeBtn = document.querySelector('#toggleDarkModeBtn');
const exportMdBtn = document.querySelector('#exportMdBtn');

// Initialize variables
let conversation = [];
let isConversationSaved = true;
let isFirstMessage = true;
let pinnedMessages = [];

// Add event listener for form submission
// Add event listener for form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value;

    if (isFirstMessage) {
        const gameTypeSelect = document.querySelector('#gameType');
        const gameType = gameTypeSelect.value;
        const systemRoleSelect = document.querySelector('#systemRole');
        const systemRole = systemRoleSelect.value;
        const systemMessage = `${systemRole} Provide assistance on ${gameType}.`;
        if (systemMessage) {
            conversation.push({ role: 'system', content: systemMessage });
        }
        gameTypeSelect.disabled = true;
        systemRoleSelect.disabled = true;
        isFirstMessage = false;
    }

    addMessageToChatBox('user', message);
    conversation.push({ role: 'user', content: message });

    userInput.value = '';
    spinner.style.display = 'block';

    try {
        const res = await fetch('http://localhost:8089/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversation })
        });

        if (res.ok) {
            const data = await res.json();
            const aiMessage = data.response.content;;

            addMessageToChatBox('assistant', aiMessage);
            conversation.push({ role: 'assistant', content: aiMessage });
        } else {
            throw new Error('Response not ok');
        }

    } catch (error) {
        console.error(error);
        addMessageToChatBox('assistant', 'Sorry, there was an error. Please try again.');
        conversation.push({ role: 'assistant', content: 'Sorry, there was an error. Please try again.' });
    } finally {
        spinner.style.display = 'none';
    }
    isConversationSaved = false;
});


// Add event listener for export button click
exportBtn.addEventListener('click', () => {
    // Create a download link for the conversation JSON file and click it
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(conversation)], { type: 'application/json' }));
    a.download = 'conversation.json';
    a.click();
    isConversationSaved = true;
});

// Add event listener for import button change
importBtn.addEventListener('change', async (e) => {
    // Read the selected file and replace the conversation with its contents
    const file = e.target.files[0];
    const text = await file.text();
    conversation = JSON.parse(text);
    chatBox.innerHTML = '';
    conversation.forEach(msg => addMessageToChatBox(msg.role, msg.content));
    isFirstMessage = false;
});

// Add function to add a message to the chat box
function addMessageToChatBox(role, message) {
    const messageElem = document.createElement('p');
    const roleElem = document.createElement('span');
    roleElem.textContent = `${role === 'user' ? 'You' : 'Bob'}: `;
    roleElem.style.color = role === 'user' ? 'yellow' : 'green';
    roleElem.style.fontWeight = 'bold';

    messageElem.appendChild(roleElem);
    messageElem.innerHTML += message.replace(/\n/g, '<br>');
    messageElem.style.whiteSpace = 'pre-wrap';
    chatBox.appendChild(messageElem);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Store the original message content along with its paragraph element
    messageElem.messageContent = message;

    // Add pin button to assistant messages
    if (role === 'assistant') {
        const pinBtn = document.createElement('button');
        pinBtn.textContent = '📌'; // pin emoji
        pinBtn.style.border = 'none';
        pinBtn.style.background = 'none';
        pinBtn.style.cursor = 'pointer';
        pinBtn.addEventListener('click', () => pinMessage(messageElem));
        messageElem.appendChild(pinBtn);
    }
}

// Add a function to add a message to the pinned messages
function addMessageToPinnedMessages(message) {

    if (pinnedMessages.indexOf(message) > -1) {
        alert('This message is already pinned.');
        return;
    }

    pinnedMessages.push(message);
    const pinnedMessageElem = document.createElement('p');
    pinnedMessageElem.textContent = '📍' + message;
    pinnedMessageElem.style.cursor = 'pointer';
    pinnedMessageElem.className = 'pinned-message'; // Assign the pinned-message class

    // Add right-click event listener
    pinnedMessageElem.addEventListener('contextmenu', function (event) {
        event.preventDefault(); // Prevent the default right-click menu from showing

        // Confirm with the user that they want to remove the pin
        let confirmRemove = confirm('Are you sure you want to remove this pin?');

        if (confirmRemove) {
            // Remove the message from the array
            const index = pinnedMessages.indexOf(message);
            if (index > -1) {
                pinnedMessages.splice(index, 1);
            }

            // Remove the message from the display
            pinnedMessageElem.remove();
        }
    });

    document.querySelector('#pinnedMessages').appendChild(pinnedMessageElem);
}

// Add function to handle pinning of messages
function pinMessage(messageElem) {
    const messageContent = messageElem.messageContent;
    addMessageToPinnedMessages(messageContent);
}

// Add an event listener to the pinned messages div
document.querySelector('#pinnedMessages').addEventListener('click', function (event) {
    if (event.target.tagName === 'P') {
        showOverlay(event.target.textContent);
    }
});

// Add a function to show the overlay
function showOverlay(content) {
    document.querySelector('#overlayContent').textContent = content;
    document.querySelector('#overlay').style.display = 'block';
}

// Add a function to hide the overlay
function hideOverlay() {
    document.querySelector('#overlayContent').textContent = '';
    document.querySelector('#overlay').style.display = 'none';
}

// Add an event listener to the overlay to hide it when clicked
document.querySelector('#overlay').addEventListener('click', hideOverlay);

// Add event listener for beforeunload to prompt the user to save the conversation
window.addEventListener('beforeunload', (event) => {
    if (!isConversationSaved) {
        event.preventDefault();
        event.returnValue = '';
    }
});

// Add event listener for toggle dark mode button click
toggleDarkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
});

// Add event listener for export Markdown button click
exportMdBtn.addEventListener('click', () => {
    // Convert the conversation to Markdown
    const markdownConversation = conversation.map(messageToMarkdown).join('\n\n');

    // Create a download link for the Markdown file and click it
    const blob = new Blob([markdownConversation], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'conversation.md';
    a.click();

    isConversationSaved = true;
});

// Helper function to convert a message object to a Markdown string
function messageToMarkdown(message) {
    const speaker = message.role === 'user' ? 'You' : 'GPT-3';
    return `**${speaker}**: ${message.content.replace(/\n/g, '  \n')}`;
}
