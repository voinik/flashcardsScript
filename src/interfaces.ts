import { LexicalCategory } from "./enums";

export interface IOxfordLemmaData {
    results: ILemmaResult[];
}

interface ILemmaResult {
    id: string;
    language: string;
    lexicalEntries: ILemmaLexicalEntries[];
}

interface ILemmaLexicalEntries {
    grammaticalFeatures: {id: string; type: string}[];
    inflectionOf: {id: string; text: string}[];
    lexicalCategory: { id: LexicalCategory};
}

export interface IOxfordDefinitionData {
    results: IDefinitionResult[];
    word: string;
}

export interface IDefinitionResult {
    id: string;
    language: string;
    lexicalEntries: IDefinitionLexicalEntry[];
    type: string;
    word: string;
}

export interface IDefinitionLexicalEntry {
    entries: IDefinitionEntry[];
    language: string;
    lexicalCategory: IDefinitionLexicalCategory;
    text: string;
}

interface IDefinitionEntry {
    pronunciations?: { phoneticSpelling: string; audioFile?: string }[];
    senses: IDefinitionSense[];
}

export interface IDefinitionSense extends IDefinitionSubsense {
    subsenses?: IDefinitionSubsense[];
}

interface IDefinitionSubsense {
    definitions: string[];
    examples?: IDefinitionExample[];
    registers?: { id: string }[];
    domains?: { text: string }[];
    id: string;
}

interface IDefinitionExample {
    text: string;
    registers?: {
        id: string;
    }[];
}

interface IDefinitionLexicalCategory {
    id: LexicalCategory;
    text: string;
}
