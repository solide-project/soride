import { execSync } from "child_process";
import stripAnsi from "strip-ansi";
import { cargoFileLower } from "./constants";

export const compile = async (sourcePath: string, toml: string = "", packageName: string = "", contractPath: string = "") => {
    if (toml.startsWith("/")) {
        toml = toml.slice(1);
    }
    if (toml.toLocaleLowerCase().endsWith(`/${cargoFileLower}`)) {
        toml = toml.slice(0, -9);
    }

    const compiledModules = execSync(
        `cd ${sourcePath} && \
            stellar contract build
            `,
        {
            encoding: 'utf-8',
            // stdio: ['pipe', 'pipe', 'ignore'] 
        }
    ).split("\n");

    const data: any = {}
    return data
}