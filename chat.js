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
}

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
