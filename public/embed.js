(function() {
    // Encontra o próprio script para obter o configId
    const scriptTag = document.currentScript;
    const configId = scriptTag.getAttribute('data-config-id');

    if (!configId) {
        console.error('Chatbot Error: Missing data-config-id in script tag.');
        return;
    }

    const chatIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>`;

    const closeIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;

    // Cria o botão flutuante
    const chatButton = document.createElement('div');
    chatButton.id = 'chatbot-bubble-button';
    chatButton.innerHTML = chatIcon;

    // Cria o container do iframe
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'chatbot-iframe-container';
    iframeContainer.style.display = 'none'; // Começa escondido

    const iframe = document.createElement('iframe');
    iframe.src = scriptTag.src.replace('/embed.js', `/chat.html?configId=${configId}`);
    iframe.id = 'chatbot-iframe';
    iframeContainer.appendChild(iframe);

    // Adiciona os elementos ao body
    document.body.appendChild(chatButton);
    document.body.appendChild(iframeContainer);

    // Adiciona o CSS para posicionamento e estilo
    const style = document.createElement('style');
    style.textContent = `
        #chatbot-bubble-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #007bff;
            color: white;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 9998;
            transition: transform 0.2s;
        }
        #chatbot-bubble-button:hover {
            transform: scale(1.1);
        }
        #chatbot-iframe-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 370px;
            height: 70vh;
            max-height: 600px;
            border: none;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            overflow: hidden;
            z-index: 9999;
            transform-origin: bottom right;
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
            transform: scale(0.5);
            opacity: 0;
            pointer-events: none;
        }
        #chatbot-iframe-container.open {
            transform: scale(1);
            opacity: 1;
            pointer-events: auto;
        }
        #chatbot-iframe {
            width: 100%;
            height: 100%;
            border: 0;
        }
    `;
    document.head.appendChild(style);

    // Adiciona o evento de clique para abrir/fechar o chat
    chatButton.addEventListener('click', () => {
        const isOpen = iframeContainer.classList.toggle('open');
        iframeContainer.style.display = 'block';
        chatButton.innerHTML = isOpen ? closeIcon : chatIcon;
    });
})();
