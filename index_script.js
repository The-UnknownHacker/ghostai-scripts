function handleKeyPress(event) {
    adjustTextareaHeight(); // Call adjustTextareaHeight() whenever a key is pressed
    if (event.shiftKey && event.key === 'Enter') {
        // If Shift + Enter is pressed, add a new line
        event.preventDefault(); // Prevents the default behavior of Shift + Enter
        addNewLine();
    } else if (event.key === 'Enter') {
        // If Enter is pressed without Shift, send the message
        event.preventDefault(); // Prevents the default behavior of the Enter key (e.g., submitting forms)
        sendMessage();
    }
}

function addNewLine() {
    var userMessage = document.getElementById('user-message');
    userMessage.value += '\n'; // Add a new line to the textarea
    userMessage.scrollTop = userMessage.scrollHeight; // Scroll to the bottom of the textarea
}

function sendMessage() {
    var userMessage = document.getElementById('user-message').value;
    appendMessage('You', userMessage);
    document.getElementById('user-message').value = '';

    axios.post('/send_message', 'user_input=' + userMessage, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
        .then(response => {
            var modelResponse = response.data.response;
            appendAIResponse(modelResponse);
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
}

function adjustTextareaHeight() {
    var textarea = document.getElementById('user-message');
    textarea.style.height = 'auto'; // Reset the height to auto to calculate the new height
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to the scroll height
}

// Rest of your JavaScript functions here...

function appendMessage(sender, message, isAI = false) {
    var chatDisplay = document.getElementById('chat-display');
    var messageElement = document.createElement('div');

    if (isAI) {
        // Extract Python code block, but keep other text
        message = message.replace(/```python([\s\S]*?)```/, function(match, code) {
            return `<div style="position: relative;">
                    <div class="code-block"><pre><code>${code}</code></pre></div>
                    <button class="copy-button" style="position: absolute; top: 0; right: 0;" onclick="copyCode(this)">Copy</button>
                    </div>`;
        });

        // Extract generic code block (without copy button), but keep other text
        message = message.replace(/```([\s\S]*?)```/, function(match, code) {
            return `<div class="code-block"><pre><code>${code}</code></pre></div>`;
        });
    }

    messageElement.innerHTML = '<strong>' + sender + ':</strong><br><br>' + message;
    chatDisplay.appendChild(messageElement);

    if (sender === 'You') {
        var emptyMessageContainer = document.createElement('div');
        emptyMessageContainer.innerHTML = '<br>';
        chatDisplay.appendChild(emptyMessageContainer);
    }
    if (sender === 'Ghost AI') {
        var emptyMessageContainer = document.createElement('div');
        emptyMessageContainer.innerHTML = '<br>';
        chatDisplay.appendChild(emptyMessageContainer);
    }
}

function escapeHtml(html) {
    return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatAndAppendMessage(sender, message) {
    var chatDisplay = document.getElementById('chat-display');
    var messageElement = document.createElement('div');

    if (message.includes('You:') && message.includes('Ghost AI:')) {
        messageElement.innerHTML = '<div class="explanation-block">' + parseFullStops(message) + '</div>';
    } else if (message.includes('```python')) {
        messageElement.innerHTML = '<strong>' + sender + ':</strong><div class="code-block">'
            + '<button class="copy-button" onclick="copyCode(this)">Copy</button>'
            + '<pre><code>' + extractCode(message) + '</code></pre></div>';
    } else {
        messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + parseBoldText(parseNumberedList(parseFullStops(message)));
    }

    chatDisplay.appendChild(messageElement);
    scrollToBottom();
}

function formatAIResponse(message) {
    // Add formatting to the AI responses for better readability
    return message.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

function appendAIResponse(message) {
    var formattedMessage = formatAIResponse(message);
    appendMessage('Ghost AI', formattedMessage, true);
}

function parseFullStops(text) {
    text = text.replace('•', '  *');
    return text;
}

function parseExistingMessages() {
    var chatDisplay = document.getElementById('chat-display');

    if (chatDisplay) {
        var messages = chatDisplay.getElementsByTagName('div');

        for (var i = 0; i < messages.length; i++) {
            var message = messages[i].innerText;
            messages[i].innerHTML = parseFullStops(message);
        }
    }
}

function extractCode(message) {
    var match = /```python([\s\S]*?)```/.exec(message);
    return match ? match[1].trim() : '';
}

function copyCode(button) {
    var codeBlock = $(button).next().find('code');
    var codeText = codeBlock.text();

    navigator.clipboard.writeText(codeText)
        .then(() => {
            button.innerText = 'Copied';
            setTimeout(() => {
                button.innerText = 'Copy';
            }, 1500);
        })
        .catch(err => {
            console.error('Unable to copy code to clipboard:', err);
        });
}

function scrollToBottom() {
    var chatDisplay = document.getElementById('chat-display');
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function parseBoldText(message) {
    return message.replace(/\*\*(.*?)\*\*/g, '<br><span class="bold-text">$1</span><br>');
}

function parseNumberedList(message) {
    return message.replace(/(?:^|\n)(\d+\.)\s*(.*?)$/gm, '$1 $2 <br><br>');
}

parseExistingMessages();
