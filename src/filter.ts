import { IOxfordData } from "./interfaces";

export function filterOxfordData(data: IOxfordData) {
    const filteredData = { ...data };
    for (let i = 0; i < filteredData.results.length; i++) {
        filteredData.results[i].lexicalEntries =
            filteredData.results[i].lexicalEntries.filter(lexEntry => lexEntry.lexicalCategory.id !== 'residual');
    }

    filteredData.results = filteredData.results.filter(result => result.lexicalEntries.length > 0);
    return filteredData;
}