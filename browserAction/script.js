import { Word, Meaning, Definition } from "./src/word.js";

const errors = {
    "err-noWord": "i'm hungry... gimme a word!",
    "err-wrongWord": "that one doesn't taste right... try again!"
}

let currentWord;

document.getElementById("wordvore").addEventListener("submit", getDefinition);
document.getElementById("saveWord").addEventListener("click", sendWordToBackground);

// If the popup was opened from the context menu, we want to put the word into the input right away
if (document.readyState !== 'loading') {
    chrome.runtime.sendMessage({ action: "getWord" }).then((response) => {
        console.log(response);
        if (response.text) {
            document.getElementById("textField").value = response.text;
        }
    }).catch((err) => {
        console.log("Didn't get a word: " + err);
    });

    chrome.runtime.sendMessage({ action: "getWordOfTheDay" }).then((res) => {
        if (res) {
            return addWordOfTheDay(res);
        }
    }).catch((err) => {
        console.log("Couldn't get WotD: " + err);
    })
} 

// Make dictionary API call to get definition
function getDefinition(event) {
    event.preventDefault();
    var lang = document.getElementById("langs").value;
    var word = document.getElementById("textField").value;

    if (!word) {
        displayError("err-noWord", true);
        return;
    } else {
        displayError("err-noWord", false);
    }

    switch (lang) {
        case "en":
            getEnglishDefinition(word);
            return true;
        case "fr":
            getLanguageDefinition(word, "fr", true);
            return true;
        case "zh":
            getLanguageDefinition(word, "zh");
            return true;
        case "ru":
            getLanguageDefinition(word, "ru", true);
            return true;
        case "es":
            getLanguageDefinition(word, "es", true);
            return true;
        case "ja":
            // TODO: JAPANESE PARSING SUPPORT
            return true;
        default:
            return false;
    }
}

function getEnglishDefinition(word) {
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
                    var newDefinitions = element.definitions.slice(0, 3).map((x) => new Definition(x.definition, "", x.example, ""));
                    meanings.push(new Meaning(element.partOfSpeech, "", newDefinitions));
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
}

function getLanguageDefinition(word, language, phonetics = false) {
    var text = encodeURI(word);
    fetch(`https://lexicala1.p.rapidapi.com/search-entries?text=${text}&language=${language}`, {
        headers: {
            "x-rapidapi-key": "YOUR-KEY-HERE",
            "x-rapidapi-host": "lexicala1.p.rapidapi.com"
        }
    })
        .then(response => {
            return response.json();
        })
        .then(res => {
            console.log(res);
            if (!res.results || !res.results[0]) {
                displayError("err-wrongWord", true);
                return false;
            } else {
                displayError("err-wrongWord", false);

                var meanings = [];
                res.results.forEach(element => {
                    // we only want the top three definitions for each meaning
                    var newDefinitions = element.senses.slice(0, 3).map((x) => { 
                            if (!x.definition) {
                                return null;
                            }

                            var tl = "";
                            if (x.translations && x.translations.en) {
                                tl = x.translations.en.text ?? x.translations.en[0].text;
                            }

                            var extl = "";
                            if (x.examples && x.examples[0].translations && x.examples[0].translations.en) {
                                extl = x.examples[0].translations.en.text ?? x.examples[0].translations.en[0].text;
                            }

                            return new Definition(
                                x.definition,
                                tl,
                                x.examples ? x.examples[0].text : "",
                                extl,
                            );
                        });
                    newDefinitions = newDefinitions.filter((x) => x !== null);
                    meanings.push(new Meaning(element.headword.pos, element.headword.gender ?? "", newDefinitions));
                });
                
                var pronounciation = "";
                if (phonetics) {
                    if (res.results[0].headword.pronunciation) {
                        pronounciation = res.results[0].headword.pronunciation.value;
                    }
                } else {
                    if (res.results[0].headword.alternative_scripts) {
                        pronounciation = res.results[0].headword.alternative_scripts[0].text;
                    }
                }

                var newWord = new Word(res.results[0].headword.text, pronounciation, meanings);
                addDefinitions(newWord);
                currentWord = newWord;
                document.getElementById("saveWord").style.display = "block";
            }
        })
        .catch(error => {
            console.error("Failed to retrieve word from Lexicala: " + error);
        });
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
        newPoS.textContent = meaning.gender ? meaning.partOfSpeech + ", " + meaning.gender : meaning.partOfSpeech;
        meaningsComponent.appendChild(newPoS);
        const meaningsList = document.createElement("ol");
        meaning.definitions.forEach(defn => {
            const li = document.createElement("li");
            var defString = defn.translation ? "def. " + defn.def + " // " + defn.translation : "def. " + defn.def;
            const newDef = document.createTextNode(defString);
            li.appendChild(newDef);

            if (defn.example) {
                const ul = document.createElement("ul");
                const subli = document.createElement("li");
                var exString = defn.exampleTranslation ? "ex. " + defn.example + " // " + defn.exampleTranslation : "ex. " + defn.example;
                subli.textContent = exString;
                ul.appendChild(subli);
                li.appendChild(ul);
            }

            meaningsList.appendChild(li);
        })
        meaningsComponent.appendChild(meaningsList);
    });
    
    document.getElementById("definition").style.display = "block";
    document.getElementById("definitionHeader").scrollIntoView({ block: 'start',  behavior: 'smooth' });
}

function addWordOfTheDay(wordObject) {
    const wotdMeaning = document.getElementById("wotdMeaning");
    document.getElementById("wotdDefinition").textContent = wordObject.word;
    document.getElementById("wotdPhonetics").textContent = wordObject.phonetics;

    wotdMeaning.innerHTML = '';

    var randomMeaning = wordObject.meanings[wordObject.meanings.length * Math.random() << 0];
    var randomDefn = randomMeaning.definitions[randomMeaning.definitions.length * Math.random() << 0];

    var posHtml = randomMeaning.gender ? `<i>${randomMeaning.partOfSpeech}, ${randomMeaning.gender}</i> | ` : `<i>${randomMeaning.partOfSpeech}</i> | `;
    wotdMeaning.innerHTML += posHtml;
    
    var defString = randomDefn.translation ? "def. " + randomDefn.def + " // " + randomDefn.translation : "def. " + randomDefn.def;
    const defComponent = document.createTextNode(defString);
    wotdMeaning.appendChild(defComponent);

    if (randomDefn.example) {
        const ul = document.createElement("ul");
        const subli = document.createElement("li");
        var exString = randomDefn.exampleTranslation ? "ex. " + randomDefn.example + " // " + randomDefn.exampleTranslation : "ex. " + randomDefn.example;
        subli.textContent = exString;
        ul.appendChild(subli);
        wotdMeaning.appendChild(ul);
    }

    document.getElementById("logo").style.display = "block";
    document.getElementById("wordOfTheDay").style.display = "flex";
    document.getElementById("wordLogo").style.display = "none";
}

// Send a message to the background script to save the current word to storage!
function sendWordToBackground() {
    console.log("SaveWord was called!");
    if (!currentWord) {
        displayError("err-noWord", true);
        return;
    } else {
        displayError("err-noWord", false);
    }

    chrome.runtime.sendMessage({ action: "saveWord", word: currentWord }).catch((err) => {
        console.error("Wasn't able to send word to background script: " + err);
    });

    document.getElementById("textField").value = "";
    document.body.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setTimeout(() => {
        document.getElementById("definition").style.display = "none";
    }, 500);
}

function displayError(errorCode, displayBool) {
    var errorComponent = document.getElementById('error');

    if (displayBool) {
        errorComponent.textContent = errors[errorCode];
        errorComponent.style.display = "block";
        return;
    } else {
        errorComponent.style.display = "none";
    }
}