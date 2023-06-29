const chatBox = document.querySelector('#chatBox');
const chatForm = document.querySelector('#chatForm');
const userInput = document.querySelector('#userInput');
const exportBtn = document.querySelector('#exportBtn');
const importBtn = document.querySelector('#importBtn');

let conversation = [];


const spinner = document.querySelector('#spinner');

let isConversationSaved = true;

let isFirstMessage = true;



chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value;

    if (isFirstMessage) {
        // Get the selected game type and system role
        const gameTypeSelect = document.querySelector('#gameType');
        const gameType = gameTypeSelect.value;

        const systemRoleSelect = document.querySelector('#systemRole');
        const systemRole = systemRoleSelect.value;

        // Create a unified system role message
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
    spinner.style.display = 'block'; // show the spinner

    try {
        console.log(conversation)
        const res = await fetch('http://localhost:8089/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversation })
        });
        const data = await res.json();
        const aiMessage = data.response.content;;

        addMessageToChatBox('assistant', aiMessage);
        conversation.push({ role: 'assistant', content: aiMessage });

    } catch (error) {
        console.error(error);
    } finally {
        spinner.style.display = 'none'; // hide the spinner
    }
    isConversationSaved = false;
});



exportBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(conversation)], { type: 'application/json' }));
    a.download = 'conversation.json';
    a.click();
    isConversationSaved = true;
});

importBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    conversation = JSON.parse(text);
    chatBox.innerHTML = '';
    conversation.forEach(msg => addMessageToChatBox(msg.role, msg.content));
    isFirstMessage = false; // set the flag to false because we're importing a conversation
});

function addMessageToChatBox(role, message) {
    const messageElem = document.createElement('p');
    messageElem.innerHTML = `${role === 'user' ? 'You' : 'GPT-3'}: ${message.replace(/\n/g, '<br>')}`;
    messageElem.style.whiteSpace = 'pre-wrap';  // This line will make sure line breaks are preserved
    chatBox.appendChild(messageElem);
    chatBox.scrollTop = chatBox.scrollHeight;
}

window.addEventListener('beforeunload', (event) => {
    if (!isConversationSaved) {
        event.preventDefault();
        event.returnValue = '';
    }
});





const toggleDarkModeBtn = document.querySelector('#toggleDarkModeBtn');

toggleDarkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
});

const exportMdBtn = document.querySelector('#exportMdBtn');

exportMdBtn.addEventListener('click', () => {
    // Convert the conversation to Markdown
    const markdownConversation = conversation.map(messageToMarkdown).join('\n\n');

    // Create a blob from the Markdown string
    const blob = new Blob([markdownConversation], { type: 'text/markdown' });

    // Create a download link and click it
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
