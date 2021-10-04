import { LexicalCategory } from "./enums";
import { IDefinitionLexicalEntry, IOxfordDefinitionData, IDefinitionResult, IDefinitionSense } from "./interfaces";

export function formatOxfordDefinitionData(data: IOxfordDefinitionData) {
    let definitionResult = '';
    const resultsLength = data.results.length;
    for (let i = 0; i < resultsLength; i++) {
        const result = data.results[i];
        definitionResult += getTitleLine(result, i, resultsLength);
        definitionResult += getDefinitions(result);
    }
    return definitionResult;
}

function getPhoneticSpelling(result: IDefinitionResult) {
    let phoneticSpelling = '';
    if (!result.lexicalEntries[0].entries[0].pronunciations) {
        return '';
    }

    result.lexicalEntries[0].entries[0].pronunciations.forEach(i => {
        if (i.audioFile) {
            phoneticSpelling = i.phoneticSpelling;
        }
    });
    if (!phoneticSpelling && result.lexicalEntries[0].entries[0].pronunciations) {
        phoneticSpelling = result.lexicalEntries[0].entries[0].pronunciations[0].phoneticSpelling;
    }

    return phoneticSpelling;
}

function getTitleLine(result: IDefinitionResult, index: number, totalLength: number) {
    const superfix = totalLength > 1 ? index + 1 : '';
    const phoneticSpelling = getPhoneticSpelling(result);
    return `<div class='rowContainer word'><h2 class='black'>${result.word}<sup>${superfix}</sup></h2><h3 class='grey bold phoneticText'>&nbsp;|${phoneticSpelling}|</h3></div>`;
}

function getDefinitions(result: IDefinitionResult) {
    const blackList = [LexicalCategory.residual, LexicalCategory.other];
    let definitions = "<div class='lexicalEntries'>";
    for (const lexEntry of result.lexicalEntries) {
        if (blackList.includes(lexEntry.lexicalCategory.id)) {
            continue;
        }
        definitions += `<h4 class='lexicalCategory'>${lexEntry.lexicalCategory.id}</h4>`;
        definitions += "<div class='definitionContainer'>";
        definitions += getLexicalCategoryDefinitions(lexEntry);
        definitions += "</div>";
    }
    definitions += '</div>';

    return definitions;
}

function getLexicalCategoryDefinitions(lexicalEntry: IDefinitionLexicalEntry) {
    let lexicalCategoryDefinitions = '';
    for (const entry of lexicalEntry.entries) {
        const numSenses = entry.senses.length;
        for (let i = 0; i < numSenses; i++) {
            const sense = entry.senses[i];
            if (!sense.definitions || !sense.definitions[0]) {
                continue;
            }
            const indexToDisplay = numSenses > 1 ? `${i + 1}&nbsp;` : '';
            const definition = sense.definitions[0].replace(/\.$/, '');
            lexicalCategoryDefinitions += `<div class='rowContainer senseContainer'><div class='grey'>${indexToDisplay}</div><div class='senseAndSubsenseContainer'><div class='rowContainer'><p>${getDomainsAndRegisters(sense)}${definition}${getExamples(sense)}.</p></div>${getSubsenses(sense)}</div></div>`;
        }
    }

    return lexicalCategoryDefinitions;
}

function getDomainsAndRegisters(sense: IDefinitionSense) {
    if (!sense.domains && !sense.registers) {
        return '';
    }

    const domains: string[] = [];
    const registers: string[] = [];

    if (sense.domains) {
        sense.domains.forEach(domain => {
            domains.push(domain.text);
        });
    }
    if (sense.registers) {
        sense.registers.forEach(register => {
            registers.push(register.id);
        });
    }

    const domainsAndRegisters = domains.concat(registers).join(', ');
    const result = `<em class='grey bold'>${domainsAndRegisters}</em>&nbsp;`;
    return result;
}

function getExamples(sense: IDefinitionSense) {
    if (!sense.examples) {
        return '';
    }

    const examples = [];
    for (const example of sense.examples) {
        let text = '';
        if (example.registers) {
            text += `<em class='grey bold'>${example.registers[0].id}&nbsp;:&nbsp;</em>`;
        }
        text += `<em class='grey'>${example.text.replace(/\.$/, '')}</em>`;
        examples.push(text);
    }

    return ': ' + examples.join(' | ');
}

function getSubsenses(sense: IDefinitionSense) {
    let text = '';
    if (!sense.subsenses) {
        return text;
    }

    for (const subsense of sense.subsenses) {
        const definition = subsense.definitions[0].replace(/\.$/, '');
        text += "<div class='rowContainer'>";
        text += "<p><em class='grey'>&bull;</em>&nbsp;";
        text += getDomainsAndRegisters(subsense);
        text += definition;
        text += getExamples(subsense);
        text += ".</p></div>";
    }

    return text;
}
