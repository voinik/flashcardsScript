import _ from 'lodash';
const { uniqBy } = _;
import { LexicalCategory } from './enums';
import { IOxfordLemmaData } from "./interfaces";

export function filterOxfordLemmaData(data: IOxfordLemmaData) {
    if (data.results.length < 1) {
        return data;
    }
    const filteredData = { ...data };
    for (let i = 0; i < filteredData.results[0].lexicalEntries.length; i++) {
        const blackList = [LexicalCategory.residual, LexicalCategory.other];
        filteredData.results[0].lexicalEntries =
            filteredData.results[0].lexicalEntries.filter(lexEntry => !blackList.includes(lexEntry.lexicalCategory.id));

        filteredData.results[0].lexicalEntries =
            uniqBy(filteredData.results[0].lexicalEntries, 'inflectionOf[0].id');
    }

    filteredData.results = filteredData.results.filter(result => result.lexicalEntries.length > 0);
    return filteredData;
}