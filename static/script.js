async function sendMessage() {
    const input = document.getElementById("userMessage");
    const chatBox = document.getElementById("chatBox");
    const message = input.value.trim();

    if (message === "") return;

    // Append User Message
    chatBox.innerHTML += `<div class="message user"><b>You:</b> ${message}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Append Typing Indicator
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot";
    typingDiv.id = "typing";
    typingDiv.innerHTML = "IntelliChat is processing...";
    chatBox.appendChild(typingDiv);

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        document.getElementById("typing").remove();

        const newMsgDiv = document.createElement("div");
        newMsgDiv.className = "message bot";
        chatBox.appendChild(newMsgDiv);
        
        typeWriter(newMsgDiv, data.reply);

    } catch (error) {
        document.getElementById("typing").innerHTML = "System Error: Connection failed.";
    }
}

function typeWriter(element, text) {
    let i = 0;
    element.innerHTML = "<b>IntelliChat:</b> ";
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 15);
            document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
        }
    }
    type();
}

// Global Event Listeners
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("userMessage").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});