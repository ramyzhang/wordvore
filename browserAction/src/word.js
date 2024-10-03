export function Word(_word, _phonetics, _meanings) {
    this.word = _word;
    this.phonetics = _phonetics;
    this.meanings = _meanings;
}

export function Meaning(_partOfSpeech, _gender, _definitions) {
    this.partOfSpeech = _partOfSpeech;
    this.gender = _gender;
    this.definitions = _definitions;
}

export function Definition(_def, _tl, _example, _exampletl) {
    this.def = _def;
    this.translation = _tl;
    this.example = _example;
    this.exampleTranslation = _exampletl
}