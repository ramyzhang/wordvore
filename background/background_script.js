browser.runtime.onInstalled.addListener(() => {
    // Callback reads runtime.lastError to prevent an unchecked error from being 
    // logged when the extension attempt to register the already-registered menu 
    // again.
    browser.contextMenus.create({
        id: "add-to-wordvore",
        title: "Vore Word",
        contexts: ["selection", "editable"],
    },
    () => void browser.runtime.lastError,
    );  
});

browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "add-to-wordvore") {
        const tempWord = { 
            text: `${info.selectionText}`
        };

        // choose the word of the day to send
        var wordOfTheDay;
        browser.storage.local.get().then((res) => {
            if (res.length == 0) {
                wordOfTheDay = null;
            } else {
                var keys = Object.keys(res);
                wordOfTheDay = res[keys[keys.length * Math.random() << 0]];
            }

            return wordOfTheDay;
        });
        
        // Open the extension popup and send the current selection to it
        browser.action.openPopup().then(() => {
            return browser.storage.local.set({ tempWord });
        }).then(() => {
            if (wordOfTheDay) {
                return browser.storage.local.set({ wordOfTheDay });
            }
        }).catch((error) => {
            console.error(error);
        });
    }
});  

// Listen for requests from the popup once it's open to get the stored selected text (if any)
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "getWord":
            browser.storage.local.get("tempWord").then((res) => {
                if (res.tempWord) {
                    return sendResponse(res.tempWord);
                }
            }).then(() => {
                // We don't want it to be passing one repeatedly if it was already sent to the popup
                return browser.storage.local.remove("tempWord");
            }).catch((error) => {
                console.log(error);
            });

            return true;
        case "saveWord":
            browser.storage.local.get(message.word.word).then((res) => {                
                if (!res[message.word.word]) {
                    return browser.storage.local.set({ [message.word.word]: message.word });
                }
                // otherwise, do nothing because the word's already saved.
            }).catch((err) => {
                console.error("Couldn't save new word: " + err);
            });

            return true;
        case "getWordOfTheDay":
            browser.storage.local.get("wordOfTheDay").then((res) => {
                if (res.wordOfTheDay) {
                    return sendResponse(res.wordOfTheDay);
                }
            }).catch((err) => {
                console.log("Couldn't get word of the day.");
            });
        default:
            return true;
    }
});

