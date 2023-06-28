import './style.css';

const form = document.querySelector('form');
let conversation = []; // Initialize an empty conversation array to store the messages.

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const response = await fetch('http://localhost:8089/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
      context: conversation, // Pass the conversation array as the context.
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const result = document.querySelector('#result');
    result.innerHTML = `<p class="error">${error.error}</p>`;
    return;
  }

  const message = await response.json();

  // Add the user's message to the conversation array.
  conversation.push({ role: 'user', content: data.get('prompt') });

  // Add the AI's response to the conversation array.
  conversation.push({ role: 'assistant', content: message.response.content });

  console.log(message.response.content);
  const result = document.querySelector('#result');
  //result.innerHTML = `<p class="message">${message.response.content}</p>`;
  displayMessageWithTyping(message.response.content, 'assistant', 'slow')
  form.reset(); // Reset the form after sending the message.

  // Scroll to the bottom of the result container to show the latest message.
  result.scrollTop = result.scrollHeight;
});

function showSpinner() {
  const button = document.querySelector('button');
  button.disabled = true;
  button.innerHTML = 'Dreaming... <span class="spinner">🧠</span>';
}

function hideSpinner() {
  const button = document.querySelector('button');
  button.disabled = false;
  button.innerHTML = 'Dream';
}

// Example code to display messages with typing animation
function displayMessageWithTyping(message, role, speed = 'normal') {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');

  const words = message.split(' ');
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    messageContent.appendChild(span);

    const delay = (index + 1) * (speed === 'fast' ? 100 : 200); // Adjust the delay timing as per your preference

    setTimeout(() => {
      span.classList.add(speed === 'fast' ? 'typing-animation-fast' : 'typing-animation');
    }, delay);
  });

  messageContainer.appendChild(messageContent);

  if (role === 'user') {
    messageContainer.classList.add('user-message');
  } else if (role === 'assistant') {
    messageContainer.classList.add('assistant-message');
  } else if (role === 'error') {
    messageContainer.classList.add('error-message');
  }

  const result = document.querySelector('#result');
  result.appendChild(messageContainer);
}
