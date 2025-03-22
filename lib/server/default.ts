import fs from 'fs';
import path from 'path';

export const loadFile = (source: string): string => {
    const wasmDirectory = path.resolve('./public/sample', source);
    return fs.readFileSync(wasmDirectory).toString();
}

export const loadSampleProject = () => {
    const tomlPath = 'Cargo.toml'
    const lockPath = 'Cargo.lock'
    const contractPath1 = 'src/lib.rs'
    const contractPath2 = 'src/test.rs'

    return {
        sources: {
            [tomlPath]: {
                content: loadFile(tomlPath)
            },
            [contractPath1]: {
                content: loadFile(contractPath1)
            },
            [contractPath2]: {
                content: loadFile(contractPath2)
            },
            [lockPath]: {
                content: loadFile(lockPath)
            },
        }
    }
}