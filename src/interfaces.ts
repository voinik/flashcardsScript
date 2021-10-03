import { LexicalCategory } from "./enums";

export interface IOxfordData {
    results: IResult[];
    word: string;
}

export interface IResult {
    id: string;
    language: string;
    lexicalEntries: ILexicalEntry[];
    type: string;
    word: string;
}

export interface ILexicalEntry {
    entries: IEntry[];
    language: string;
    lexicalCategory: ILexicalCategory;
    text: string;
}

interface IEntry {
    pronunciations?: { phoneticSpelling: string; audioFile?: string }[];
    senses: ISense[];
}

export interface ISense extends ISubsense {
    subsenses?: ISubsense[];
}

interface ISubsense {
    definitions: string[];
    examples?: IExample[];
    registers?: { id: string }[];
    domains?: { text: string }[];
    id: string;
}

interface IExample {
    text: string;
    registers?: {
        id: string;
    }[];
}

interface ILexicalCategory {
    id: LexicalCategory;
    text: string;
}
