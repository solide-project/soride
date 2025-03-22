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

    /**
     * Retrieves the WebAssembly (Wasm) ID of the contract from the Soroban RPC server.
     *
     * This method fetches the Wasm ID of the contract from the Soroban RPC server
     * using the provided server instance.
     *
     * @param {rpc.Server} server - The Soroban RPC server instance from which to fetch the Wasm ID.
     * @returns {Promise<Buffer>} - A promise that resolves to the Wasm ID of the contract.
     * 
     * @example
     * const server: rpc.Server;
     * const contractAddress: string;
     * const contract = new SorosanContract(contractAddress);
     * const wasmId = await contract.wasmId(server);
     * console.log(`Wasm ID: ${wasmId.toString('hex')}`);
     */
    async wasmId(server: rpc.Server): Promise<Buffer> {
        const ledgerEntry = await this.ledgerEntry(server)
        if (!ledgerEntry) {
            return Buffer.from([]);
        }

        // const codeData = xdr.LedgerEntryData
        //     .fromXDR(ledgerEntry.xdr, 'base64')
        //     .contractData();
        const codeData = ledgerEntry.val.contractData();
        const contractInstance = codeData.val().instance();
        return contractInstance.executable().wasmHash();
    }

    /**
     * Retrieves the last modified ledger sequence number associated with the WebAssembly (Wasm) ID of the contract from the Soroban RPC server.
     *
     * This method fetches the last modified ledger sequence number associated with the Wasm ID of the contract from the Soroban RPC server
     * using the provided server instance.
     *
     * @param {rpc.Server} server - The Soroban RPC server instance from which to fetch the last modified ledger sequence number.
     * @returns {Promise<number>} - A promise that resolves to the last modified ledger sequence number associated with the Wasm ID of the contract.
     * 
     * @example
     * const server: rpc.Server;
     * const contract: string;
     * const ledgerSeq = await contract.wasmIdLedgerSeq(server);
     * console.log(`Last modified ledger sequence number: ${ledgerSeq}`);
     */
    async wasmIdLedgerSeq(server: rpc.Server): Promise<number> {
        const ledgerEntry = await this.ledgerEntry(server)
        if (!ledgerEntry) {
            return 0;
        }

        return ledgerEntry.lastModifiedLedgerSeq || 0;
    }

    /**
     * Retrieves the storage elements associated with the contract from the Soroban RPC server.
     *
     * This method fetches the storage elements associated with the contract from the Soroban RPC server
     * using the provided server instance.
     *
     * @param {rpc.Server} server - The Soroban RPC server instance from which to fetch the storage elements.
     * @returns {Promise<ReadonlyArray<StorageElement>>} - A promise that resolves to an array of storage elements associated with the contract.
     * 
     * @example
     * const server: rpc.Server;
     * const contract: string;
     * const storageElements = await contract.storage(server);
     * console.log('Storage elements:', storageElements);
     */
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

    /**
     * Retrieves the contract code associated with the contract from the Soroban RPC server.
     *
     * This method fetches the contract code associated with the contract from the Soroban RPC server
     * using the provided server instance.
     *
     * @param {rpc.Server} server - The Soroban RPC server instance from which to fetch the contract code.
     * @returns {Promise<string>} - A promise that resolves to the contract code associated with the contract.
     * 
     * @example
     * const server: rpc.Server;
     * const contract: string;
     * const code = await contract.code(server);
     * console.log('Contract code:', code);
     */
    async code(server: rpc.Server): Promise<string> {
        const wasmId = await this.wasmId(server);
        return await this._code(server, wasmId);
    }

    private async _code(server: rpc.Server, wasmId: Buffer) {
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

    /**
     * Retrieves the last modified ledger sequence number associated with the contract code from the Soroban RPC server.
     *
     * This method fetches the last modified ledger sequence number associated with the contract code from the Soroban RPC server
     * using the provided server instance.
     *
     * @param {rpc.Server} server - The Soroban RPC server instance from which to fetch the last modified ledger sequence number.
     * @returns {Promise<number>} - A promise that resolves to the last modified ledger sequence number associated with the contract code.
     * 
     * @example
     * const server: rpc.Server;
     * const contract: string;
     * const ledgerSeq = await contract.wasmCodeLedgerSeq(server);
     * console.log(`Last modified ledger sequence number: ${ledgerSeq}`);
     */
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
        return await this._specs(code);
    }

    private async _specs(code: string) {
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

    async abi(server: rpc.Server) {
        const entries = await this.specs(server);
        return this._abi(entries);
    }

    private async _abi(entries: xdr.ScSpecEntry[]) {
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
        const code = await this._code(server, wasmId);
        const specs = await this._specs(code);
        const abi = await this._abi(specs);
        return { code, wasmId, abi };
    }
}

export interface StorageElement {
    key: string
    keyType: string
    value: string
    valueType: string
}
