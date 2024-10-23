## Meet Wordvore!

Wordvore is an extension I made for personal & friends-and-family use. The version in the repo currently works for Chrome only, but I have tested and run a version for Firefox as well (it just uses different variable names for the extension API endpoints). I haven't tested the logic with other browsers.

### Usage
This can be used as-is for English words, but if you want to save words in other languages, you'll have to get your own Lexicala API key (the free tier offers 50 calls per day).
1. Navigate to the directory that you want to save this extension in, and clone the repo there: `git clone https://github.com/ramyzhang/wordvore.git`.
2. Enter the directory and navigate to `browserAction/script.js`.
3. In line 103, where it says `"YOUR-KEY-HERE"`, replace the contents inside the quotation marks with your own key from [Lexicala](https://api.lexicala.com/).
4. Save, then load it unpacked into Chrome.

### Features
- Uses Manifest V3
- Adds a context menu item to Chrome and Firefox so you can automatically send selected words on any webpage to Wordvore
- Multi-language support: EN, FR, ES, RU, ZH (limited and doesn't work super reliably); includes grammatical gender and phonetics
- Saves words exclusively in browser local storage
- Chooses one word at random on each startup
- Handmade Wordvore monster animation drawn by me! :P

### Screenshots
<img src="https://github.com/user-attachments/assets/a6c5292d-09f5-48e9-b94e-a3814c3fd0f3" alt="sc-1" width="400px"/>
<img src="https://github.com/user-attachments/assets/be028ebf-b348-401c-9661-0a8f2026b78d" alt="sc-2" width="400px"/>
<img src="https://github.com/user-attachments/assets/6d640b54-add2-403c-8791-202fe3447a45" alt="sc-3" width="400px"/>
