browser.runtime.onMessage.addListener((message) => {
    console.log(message);
    if (message.action === "sendWord" && message.text) {
        // document.getElementById("textField").value = message.text;
        console.log("Text received: " + message.text);
    }
})