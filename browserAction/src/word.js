export function Word(_word, _phonetics, _meanings) {
    this.word = _word;
    this.phonetics = _phonetics;
    this.meanings = _meanings;
}

export function Meaning(_partOfSpeech, _definitions) {
    this.partOfSpeech = _partOfSpeech;
    this.definitions = _definitions;
}

export function Definition(_def, _example) {
    this.def = _def;
    this.example = _example;
}