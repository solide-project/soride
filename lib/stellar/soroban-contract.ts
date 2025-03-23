import { Contract, rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import { decodeContractSpecBuffer } from './decoder';
import { Buffer } from 'buffer';
import { Abi, AbiConstructor, AbiFunction, AbiItemType } from './abi';

export class SorosanContract extends Contract {
    ledgerKey: xdr.LedgerKey;

    constructor(address: string) {
        super(address);
        this.ledgerKey = xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
                contract: new Contract(address).address().toScAddress(),
                key: xdr.ScVal.scvLedgerKeyContractInstance(),
                durability: xdr.ContractDataDurability.persistent()
            })
        );
    }

    async wasmId(server: rpc.Server): Promise<Buffer> {
        const ledgerEntry = await this.ledgerEntry(server)
        if (!ledgerEntry) {
            return Buffer.from([]);
        }

        const codeData = ledgerEntry.val.contractData();
        const contractInstance = codeData.val().instance();
        return contractInstance.executable().wasmHash();
    }

    async wasmIdLedgerSeq(server: rpc.Server): Promise<number> {
        const ledgerEntry = await this.ledgerEntry(server)
        if (!ledgerEntry) {
            return 0;
        }

        return ledgerEntry.lastModifiedLedgerSeq || 0;
    }

    async storage(server: rpc.Server): Promise<ReadonlyArray<StorageElement>> {
        const ledgerEntry = await this.ledgerEntry(server)
        if (!ledgerEntry) {
            return [];
        }

        const codeData = ledgerEntry.val.contractData();
        const contractInstance = codeData.val().instance();
        const contractStorage = contractInstance.storage();
        return contractStorage ? this.convertStorage(contractStorage) : [];

    }

    async code(server: rpc.Server): Promise<string> {
        const wasmId = await this.wasmId(server);
        return await _code(server, wasmId);
    }

    async wasmCodeLedgerSeq(server: rpc.Server): Promise<number> {
        const wasmId = await this.wasmId(server);
        const ledgerKey = xdr.LedgerKey.contractCode(
            new xdr.LedgerKeyContractCode({
                hash: wasmId
            })
        );

        const ledgerEntries = await server.getLedgerEntries(ledgerKey);

        if (ledgerEntries == null || ledgerEntries.entries == null) {
            return 0;
        }

        const ledgerEntry = ledgerEntries.entries[0] as rpc.Api.LedgerEntryResult;
        return ledgerEntry.lastModifiedLedgerSeq || 0;
    }

    async specs(
        server: rpc.Server,
    ): Promise<xdr.ScSpecEntry[]> {
        const code = await this.code(server);
        return await _specs(code);
    }

    async abi(server: rpc.Server) {
        const entries = await this.specs(server);
        return _abi(entries);
    }

    private convertStorage = (
        storage: ReadonlyArray<xdr.ScMapEntry>
    ): ReadonlyArray<StorageElement> => storage.map(el => ({
        key: scValToNative(el.key()).toString(),
        keyType: el.key().switch().name,
        value: scValToNative(el.val()).toString(),
        valueType: el.val().switch().name,
    }))

    /**
     * @ignore
     * Retrieves a ledger entry result from the server.
     *
     * @param {rpc.Server} server - The Soroban RPC server instance.
     * @returns {Promise<rpc.Api.LedgerEntryResult | null>} - A promise that resolves to a ledger entry result,
     * or `null` if no entry is found.
     */
    private async ledgerEntry(
        server: rpc.Server,
    ): Promise<rpc.Api.LedgerEntryResult | null> {
        const ledgerEntries = await server.getLedgerEntries(this.ledgerKey);
        if (ledgerEntries == null || ledgerEntries.entries == null || ledgerEntries.entries.length == 0) {
            return null;
        }

        return ledgerEntries.entries[0] as rpc.Api.LedgerEntryResult;
    }

    async getContractInfo(
        server: rpc.Server,
    ): Promise<{
        code: string
        wasmId: Buffer,
        abi: any
    }> {
        const wasmId = await this.wasmId(server);
        const code = await _code(server, wasmId);
        const specs = await _specs(code);
        const abi = await _abi(specs);
        return { code, wasmId, abi };
    }
}

export interface StorageElement {
    key: string
    keyType: string
    value: string
    valueType: string
}

export const _code = async (server: rpc.Server, wasmId: Buffer) => {
    const ledgerKey = xdr.LedgerKey.contractCode(
        new xdr.LedgerKeyContractCode({
            hash: wasmId
        })
    );

    const ledgerEntries = await server.getLedgerEntries(ledgerKey);

    if (ledgerEntries == null || ledgerEntries.entries == null) {
        return "";
    }

    const ledgerEntry = ledgerEntries.entries[0] as rpc.Api.LedgerEntryResult;
    const ledgerSeq = ledgerEntry.lastModifiedLedgerSeq as number;
    // const codeEntry = xdr.LedgerEntryData.fromXDR(ledgerEntry.xdr, 'base64');
    const codeEntry = ledgerEntry.val;
    const code = codeEntry.contractCode().code().toString('hex');

    return code;
}

export const _specs = async (code: string) => {
    const buffer = Buffer.from(code || "", "hex");

    const executable = new WebAssembly.Module(buffer);
    const contractSpecificationSection = WebAssembly.Module.customSections(executable, 'contractspecv0');
    let totalEntries: xdr.ScSpecEntry[] = [];
    for (const item of contractSpecificationSection) {
        const entries = await decodeContractSpecBuffer(item);

        entries.forEach((entry: xdr.ScSpecEntry) => {
            totalEntries.push(entry);
        });
    }
    return totalEntries;
}

export const _abi = async (entries: xdr.ScSpecEntry[]) => {
    let abi: (AbiFunction | AbiConstructor)[] = [];
    entries.forEach((entry: xdr.ScSpecEntry) => {
        if (entry.switch() === xdr.ScSpecEntryKind.scSpecEntryFunctionV0()) {
            const functionV0 = entry.value() as xdr.ScSpecFunctionV0;
            const name = functionV0.name().toString();
            const doc = functionV0.doc().toString();
            let type: AbiItemType = "function"
            if (name === "__constructor") {
                type = "constructor"
            }

            const inputs = functionV0.inputs().map((input: xdr.ScSpecFunctionInputV0) => ({
                doc: input.doc().toString(),
                name: input.name().toString(),
                type: input.type().switch()
            }));

            const outputs = functionV0.outputs().map((output: xdr.ScSpecTypeDef) => ({
                type: output.switch()
            }));

            abi.push({ doc, type, name, inputs, outputs });
        }
    });
    return abi as Abi
}