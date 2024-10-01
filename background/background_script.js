chrome.runtime.onInstalled.addListener(() => {
    // Callback reads runtime.lastError to prevent an unchecked error from being 
    // logged when the extension attempt to register the already-registered menu 
    // again.
    chrome.contextMenus.create({
        id: "add-to-wordvore",
        title: "Vore Word",
        contexts: ["selection", "editable"],
    },
    () => void chrome.runtime.lastError,
    );  
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "add-to-wordvore") {
        const tempWord = { 
            text: `${info.selectionText}`
        };

        // choose the word of the day to send, then open the extension popup 
        // and send the current selected text to it
        getWordOfTheDay().then((res) => {
            var wordOfTheDay = res;
            if (wordOfTheDay) {
                return chrome.storage.local.set({ wordOfTheDay });
            }
        }).then(() => {
            return chrome.storage.local.set({ tempWord });
        }).then(() => {
            return chrome.action.openPopup();
        }).catch((error) => {
            console.error(error);
        });
    }
});  

// Listen for requests from the popup once it's open to get the stored selected text (if any)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message.action);
    switch (message.action) {
        case "getWord":
            chrome.storage.local.get("tempWord").then((res) => {
                if (res.tempWord) {
                    return sendResponse(res.tempWord);
                } else {
                    return Promise.reject("No TempWord available.");
                }
            }).then(() => {
                // We don't want it to be passing one repeatedly if it was already sent to the popup
                return chrome.storage.local.remove("tempWord");
            }).catch((error) => {
                console.log(error);
                return false;
            });

            return true;
        case "saveWord":
            chrome.storage.local.get(message.word.word).then((res) => {                
                if (!res[message.word.word]) {
                    return chrome.storage.local.set({ [message.word.word]: message.word });
                }
                // otherwise, do nothing because the word's already saved.
            }).catch((err) => {
                console.error("Couldn't save new word: " + err);
            });

            return true;
        case "getWordOfTheDay":
            getWordOfTheDay().then((res) => {
                if (res) {
                    return sendResponse(res);
                }
            }).catch((err) => {
                console.log("Couldn't get word of the day.");
            });
            
            return true;
        default:
            return true;
    }
});

function getWordOfTheDay() {
    let wordOfTheDay = chrome.storage.local.get().then((res) => {
        if (res.length == 0) {
            wordOfTheDay = null;
        } else {
            var keys = Object.keys(res);
            wordOfTheDay = res[keys[keys.length * Math.random() << 0]];
        }
        return wordOfTheDay;
    });

    return wordOfTheDay;
}