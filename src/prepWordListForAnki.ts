import fs from 'fs';
import util from 'util';
import fetch from 'node-fetch';
import { formatOxfordData } from './formatter';
import { IOxfordData } from './interfaces';
import { filterOxfordData } from './filter';

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
    console.log(`Word list loaded. Looking up ${wordListLength}`);

    for (let i = 0; i < wordListLength; i++) {
        const word = wordList[i];
        let jsonResult;
        try {
            jsonResult = await getWordData(word);
        } catch (e: any) {
            console.error(`Failed to get word ${word} from API: ${e}\n Skipping to next word...`);
            continue;
        }

        const filteredData = filterOxfordData(jsonResult);
        const formattedData = formatOxfordData(filteredData);
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
    const arr = wordList.split('\n').filter(i => i !== '');
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

    return jsonResult as IOxfordData;
}

async function createResultFile(resultFileName: string) {
    await fsWriteFile(resultFileName, '');
}

async function appendToResultFile(resultFileName: string, data: string) {
    await fsAppendFile(resultFileName, data);
}

start();
