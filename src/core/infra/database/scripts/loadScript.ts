import fs from 'node:fs/promises';
import path from 'node:path';

async function loadScript(isSqlite = false) {
    const scriptFile = isSqlite ? 'script.sqlite.sql' : 'script.sql';
    const bruteScript = (await fs.readFile(path.resolve(__dirname, `../scripts/${scriptFile}`))).toString();
    const cleanedScript = bruteScript.replace(/(\r\n|\n|\r)/gm, '');
    const scriptSplittedByCommand = cleanedScript.split(';');
    const validCommandScriptArray = scriptSplittedByCommand.filter((s) => s.trim());
    return validCommandScriptArray;
}

export default loadScript;
