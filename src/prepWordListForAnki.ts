import fs from 'fs';
import util from 'util';
import fetch from 'node-fetch';
import { formatOxfordDefinitionData } from './definitionFormatter';
import { IOxfordDefinitionData, IOxfordLemmaData } from './interfaces';
import { filterOxfordDefinitionData } from './definitionFilter';
import { filterOxfordLemmaData } from './lemmaFilter';

const fsAppendFile = util.promisify(fs.appendFile);
const fsWriteFile = util.promisify(fs.writeFile);
const fsReadFile = util.promisify(fs.readFile);

const inputWordListPath = new URL('../inputData/wordList.txt', import.meta.url).pathname;

async function start() {
    const wordList = await getWordList();
    if (wordList.length < 1) {
        throw new Error('Please put some words in the wordList.txt file, separated by newlines!');
    }

    const now = new Date().toISOString();
    const resultFilePath = new URL(`../outputData/htmlFormattedDefinitions-${now}.txt`, import.meta.url).pathname;
    await createResultFile(resultFilePath);

    const wordListLength = wordList.length;
    console.log(`Word list loaded. Looking up ${wordListLength} words`);

    for (let i = 0; i < wordListLength; i++) {
        const word = wordList[i];
        let lemmasJsonResult;
        try {
            lemmasJsonResult = await getLemmasData(word);
        } catch (e: any) {
            console.error(`Failed to get lemmas for word ${word} from API: ${e}\n Skipping to next word...`);
            appendWithoutDefinition(word, resultFilePath);
            continue;
        }

        const filteredData = filterOxfordLemmaData(lemmasJsonResult);
        if (!filteredData.results) {
            console.error(`Could not find lemmas for ${word}, skipping to next word...`);
            appendWithoutDefinition(word, resultFilePath);
            continue;
        }
        
        let formattedData = '"';
        for (const lemmaLexicalEntry of filteredData.results[0].lexicalEntries) {
            formattedData += "<div class='lemmaContainer'>";
            formattedData += await getLemmaDefinitionAndFormat(lemmaLexicalEntry.inflectionOf[0].id);
            formattedData += "</div>";
        }
        formattedData += '"';

        const record = `${word},${formattedData}\n`;
        await appendToResultFile(resultFilePath, record);

        if (i % 10 === 0) {
            console.log(`Processed ${i} words of ${wordListLength}...`);
        }
    }

    console.log(`Finished defining and formatting ${wordListLength} words!`);
}

async function getWordList() {
    const wordList = await fsReadFile(inputWordListPath, 'utf-8');
    const arr = wordList.split('\n').filter(i => i !== '').map(i => i.toLocaleLowerCase());
    return arr;
}

async function getWordData(wordId: string) {
    if (!process.env.APP_ID || !process.env.APP_KEY) {
        throw new Error('This program needs an APP_ID and APP_KEY in the env variables to be able to use the Oxford dictionary API');
    }

    const url = `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${wordId}?strictMatch=false`;
    let oxfordResult;
    oxfordResult = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'app_id': process.env.APP_ID, 'app_key': process.env.APP_KEY },
    });

    const jsonResult = await oxfordResult.json();
    if (!jsonResult) {
        throw new Error(`No json in response: ${JSON.stringify(oxfordResult)}`);
    }
    if (oxfordResult.status === 404) {
        throw new Error(`No definition for word ${wordId}: ${JSON.stringify(jsonResult, null, 4)}`);
    }

    return jsonResult as IOxfordDefinitionData;
}

async function getLemmasData(wordId: string) {
    if (!process.env.APP_ID || !process.env.APP_KEY) {
        throw new Error('This program needs an APP_ID and APP_KEY in the env variables to be able to use the Oxford dictionary API');
    }

    const url = `https://od-api.oxforddictionaries.com/api/v2/lemmas/en/${wordId}`;
    let oxfordResult;
    oxfordResult = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'app_id': process.env.APP_ID, 'app_key': process.env.APP_KEY },
    });

    const jsonResult = await oxfordResult.json();
    if (!jsonResult) {
        throw new Error(`No json in response: ${JSON.stringify(oxfordResult)}`);
    }
    if (oxfordResult.status === 404) {
        throw new Error(`No definition for word ${wordId}: ${JSON.stringify(jsonResult, null, 4)}`);
    }

    return jsonResult as IOxfordLemmaData;
}

async function createResultFile(resultFileName: string) {
    await fsWriteFile(resultFileName, '');
}

async function appendToResultFile(resultFileName: string, data: string) {
    await fsAppendFile(resultFileName, data);
}

async function appendWithoutDefinition(word: string, resultFilePath: string) {
    const record = `${word},No definition found\n`;
    await appendToResultFile(resultFilePath, record);
}

async function getLemmaDefinitionAndFormat(lemma: string) {
    let definitionJsonResult;
    try {
        definitionJsonResult = await getWordData(lemma);
    } catch (e: any) {
        console.error(`Failed to get word ${lemma} from API: ${e}\n Skipping to next word...`);
        return '';
    }
    
    const filteredData = filterOxfordDefinitionData(definitionJsonResult);
    if (!filteredData.results) {
        console.error(`Could not find definition for ${lemma}`);
        return '';
    }

    const formattedData = formatOxfordDefinitionData(filteredData);
    return formattedData;
}

start();
