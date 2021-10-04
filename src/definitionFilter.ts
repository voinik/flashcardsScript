import { IOxfordDefinitionData } from "./interfaces";

export function filterOxfordDefinitionData(data: IOxfordDefinitionData) {
    if (data.results.length < 1) {
        return data;
    } 
    const filteredData = { ...data };
    for (let i = 0; i < filteredData.results.length; i++) {
        filteredData.results[i].lexicalEntries =
            filteredData.results[i].lexicalEntries.filter(lexEntry => lexEntry.lexicalCategory.id !== 'residual');
    }

    filteredData.results = filteredData.results.filter(result => result.lexicalEntries.length > 0);
    return filteredData;
}