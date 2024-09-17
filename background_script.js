// Put all the javascript code here, that you want to execute in background.
browser.runtime.onInstalled.addListener(() => {
    // Callback reads runtime.lastError to prevent an unchecked error from being 
    // logged when the extension attempt to register the already-registered menu 
    // again.
    browser.contextMenus.create({
        id: "add-to-wordvore",
        title: "Vore Word",
        contexts: ["selection", "editable"],
    },
    // See https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/#event-pages-and-backward-compatibility
    // for information on the purpose of this error capture.
    () => void browser.runtime.lastError,
    );
})

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "add-to-wordvore") {
        // Examples: text and HTML to be copied.
        const tempWord = { 
            text: `${info.selectionText}`
        };

        // The example will show how data can be copied, but since background
        // pages cannot directly write to the clipboard, we will run a content
        // script that copies the actual content.

        // Open the extension popup
        browser.action.openPopup().then(() => {
            return browser.storage.local.set({ tempWord });
        }).catch((error) => {
            console.error(error);
        })

        // Alternatively, also copy it to your clipboard
        browser.scripting.executeScript({
            target: {
                tabId: tab.id,
            },
            files: ["./clipboard_helper.js"]
        }).then(() => {
            // The content script's last expression will be true if the function
            // has been defined. If this is not the case, then we need to run
            // clipboard-helper.js to define function copyToClipboard.
            browser.scripting.executeScript({
                target: {
                    tabId: tab.id,
                },
                args: [tempWord.text],
                func: (...args) => copyToClipboard(...args),
            });
        }).catch((error) => {
            // This could happen if the extension is not allowed to run code in
            // the page, for example if the tab is a privileged page.
            console.error("Failed to copy text: " + error);
        });
    }
});

// Listen for requests from the popup once it's open to get the stored selected text (if any)
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getWord") {
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
    }
});