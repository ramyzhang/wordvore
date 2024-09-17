// If the popup was opened from the context menu, we want to put the word into the input right away
document.addEventListener('DOMContentLoaded', () => {
    // Request the selected text from the background script
    browser.runtime.sendMessage({ action: "getWord" }).then((response) => {
        if (response.text) {
            document.getElementById("textField").value = response.text;
        }
    }).catch(() => {
        console.log("Didn't get a word.");
    });
})

document.getElementById("wordvore").addEventListener("submit", getDefinition);

function getDefinition(event) {
    event.preventDefault();
    var word = document.getElementById("textField").value;
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => {
            if (response) {
                return response.json();
            } else {
                console.log("No definitions found.");
            }
        }).then((res) => {
            var definition = res[0].meanings[0].definitions[0].definition
            console.log(definition);
            addDefinition(definition);
        })
        .catch(error => {
            console.error(error);
        });
    
    return false;
}

function addDefinition(definition) {
    document.getElementById("definition").textContent = definition;
}