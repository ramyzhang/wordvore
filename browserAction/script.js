import { Word, Meaning, Definition } from "./src/word.js";

let currentWord;

document.getElementById("wordvore").addEventListener("submit", getDefinition);
document.getElementById("saveWord").addEventListener("click", sendWordToBackground);
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

// Make dictionary API call to get definition
function getDefinition(event) {
    event.preventDefault();
    var word = document.getElementById("textField").value;

    if (!word) {
        displayError("err-noWord", true);
        return;
    } else {
        displayError("err-noWord", false);
    }

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => {
            return response.json();
        })
        .then(res => {
            if (!res[0]) {
                displayError("err-wrongWord", true);
                return false;
            } else {
                displayError("err-wrongWord", false);

                var meanings = [];
                res[0].meanings.forEach(element => {
                    // we only want the top three definitions for each meaning
                    var newDefinitions = element.definitions.slice(0, 3).map((x) => new Definition(x.definition, x.example));
                    meanings.push(new Meaning(element.partOfSpeech, newDefinitions));
                });
                var newWord = new Word(res[0].word, res[0].phonetic, meanings);
                addDefinitions(newWord);
                currentWord = newWord;
                document.getElementById("saveWord").style.display = "block";
            }
        })
        .catch(error => {
            console.error(error);
        });
    
    return false;
}

// Display the definition in the popup
function addDefinitions(definitions) {
    document.getElementById("word").textContent = definitions.word;
    document.getElementById("phonetics").textContent = definitions.phonetics;
    const meaningsComponent = document.getElementById("meanings");

    // wipe any existing word first
    meaningsComponent.innerHTML = '';

    definitions.meanings.forEach(meaning => {
        const newPoS = document.createElement("p");
        newPoS.className = "pos";
        newPoS.textContent = meaning.partOfSpeech;
        meaningsComponent.appendChild(newPoS);
        const meaningsList = document.createElement("ol");
        meaning.definitions.forEach(defn => {
            const li = document.createElement("li");
            const newDef = document.createTextNode("def. " + defn.def);
            li.appendChild(newDef);

            if (defn.example) {
                const ul = document.createElement("ul");
                const subli = document.createElement("li");
                subli.textContent = "ex. " + defn.example;
                ul.appendChild(subli);
                li.appendChild(ul);
            }

            meaningsList.appendChild(li);
        })
        meaningsComponent.appendChild(meaningsList);
    });
}

// Send a message to the background script to save the current word to storage!
function sendWordToBackground() {
    if (!currentWord) {
        displayError("err-noWord", true);
        return;
    } else {
        displayError("err-noWord", false);
    }

    browser.runtime.sendMessage({ action: "saveWord", word: currentWord }).catch((err) => {
        console.error("Wasn't able to send word to background script: " + err);
    });
}

function displayError(errorCode, displayBool) {
    var errorComponent = document.getElementById(errorCode);

    if (displayBool) {
        errorComponent.style.display = "block";
        return;
    } else {
        errorComponent.style.display = "none";
    }
}