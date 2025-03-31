import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProgram } from "@/components/soroban/provider";
import { Input } from "@/components/ui/input";
import { useLogger } from "@/components/core/providers/logger-provider";
import { CollapsibleChevron } from "@/components/core/components/collapsible-chevron";
import { Title } from "@/components/core/components/title";
import { useWeb3Hook } from "./hook-web3";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTransactionExplorer } from "@/lib/chains/explorer";
import { ConnectWallet } from "../wallet";
import { getContractHash, getContractId, hexToByte, isContractHash, isContractId, scSpecTypeToScVal, toScVal } from "@/lib/stellar/utils";
import { Abi, AbiConstructor, AbiFunction, AbiParameter } from "@/lib/stellar/abi";
import { xdr } from "@stellar/stellar-sdk";
import { getAddress, getNetwork } from "@stellar/freighter-api";
import { _code, _specs, _abi } from "@/lib/stellar/soroban-contract";

interface ContractInvokeProps extends React.HTMLAttributes<HTMLDivElement> { }

const CONSTRUCTOR_METHOD = "__constructor"
const CONSTRUCTOR_TYPE = "constructor"

export function ContractInvoke({ className }: ContractInvokeProps) {
    const web3Hook = useWeb3Hook();
    const soroban = useProgram();
    const logger = useLogger();

    const [msgValue, setMsgValue] = useState<number>(0)
    const [contractAddress, setContractAddress] = useState<string>("")
    const [ret, setRet] = useState<{
        [key: string]: any
    }>({})

    //#region Deploy
    const [isDeploying, setIsDeploying] = useState(false)

    const handleDeploy = async () => {
        try {
            setIsDeploying(true)
            await doDeploy();
        } catch (e: any) {
            logger.error(e.message || "Error deploying contract")
            console.error(e)
        } finally {
            setSelectedConstructor(null)
            setIsDeploying(false)
        }
    }

    const doDeploy = async () => {
        const { address } = await getAddress()
        if (!address) {
            throw new Error("Please install Freighter to deploy contract");
        }

        logger.info("Deploying contract...")

        // CBKGPQUWV55UPWCMQ4CZP3BU3RANV7TKKI2OOMRMII7YPGKOCXKHACFL
        // 9477b807cb752af9f1e63062e6fbe75156401af3e87f71813574884f4f800ef5
        // Do some verification of input if deploying existing contract
        let contractId = contractAddress
        let args: xdr.ScVal[] = []
        if (contractId) {
            if (isContractHash(contractId)) {
                contractId = getContractId(contractId)
            }

            if (!isContractId(contractId)) {
                throw new Error("Invalid Contract ID or Contract Hash");
            }
        } else {
            if (!contractWasm) {
                throw new Error("Unable to found contract. Make sure to deploy a Wasm from the contract");
            }

            const contractConstructor = soroban.abi.find((abi) => abi.type === CONSTRUCTOR_TYPE)
            args = contractAddress || !contractConstructor
                ? []
                : formatParameters(contractConstructor)
        }
        const result = await web3Hook.doDeploy({ contractId, wasmId: contractWasm, userAddress: address, args });
        if (result.contract) {
            setContractAddress(result.contract)
            logger.success(`Contract deployed at ${result.contract}`)
            if (result.transactionHash) {
                const { network } = await getNetwork()
                const txExplorer = getTransactionExplorer(network, result.transactionHash)
                logger.success(
                    <a className="underline" href={txExplorer} target="_blank">
                        {result.transactionHash}
                    </a>
                )
            }
            setContractArguments({
                ...contractArguments,
                [result.contract]: {},
            })
        } else {
            logger.error(`Error deploying contract: ${result.transactionHash}`)
        }
    }
    //#endregion

    //#region Params State
    /**
     * Note we are storing constructor arguments in here as method name "constructor"
     */
    const [contractArguments, setContractArguments] = useState<{
        [contractAddress: string]: {
            [method: string]: { [parameter: string]: any }
        }
    }>({})
    const handleArgumentChange = (
        contractAddress: string,
        method: string,
        name: string,
        value: string
    ) => {
        setContractArguments((prevArgs) => ({
            ...prevArgs,
            [contractAddress]: {
                ...prevArgs[contractAddress],
                [method]: {
                    ...prevArgs[contractAddress]?.[method],
                    [name]: value,
                },
            },
        }))
    }

    const formatParameters = (entry: AbiFunction | AbiConstructor): xdr.ScVal[] => {
        if (!entry) return []

        const method =
            entry.type === CONSTRUCTOR_TYPE ? CONSTRUCTOR_METHOD : entry.name
        const selected =
            entry.type === CONSTRUCTOR_TYPE
                ? CONSTRUCTOR_METHOD
                : selectedContractAddress

        const methodArgs = contractArguments[selected]?.[method]
        if (!methodArgs) return []

        return entry.inputs.map((input: AbiParameter, index: number) => {
            const value = methodArgs[input.name || index.toString()]
            if (scSpecTypeToScVal(input.type.name).toLocaleLowerCase() === xdr.ScValType.scvVec().name.toLocaleLowerCase()) {
                const items: xdr.ScVal[] = value.split(",").map((el: any) =>
                    toScVal(el));
                return xdr.ScVal.scvVec(items);
            }

            return toScVal(value, input.type.name)
        })
    }
    //#endregion

    //#region Contract Calls
    const [isInvoking, setIsInvoking] = useState<boolean>(false)

    const initialiseInvocation = (method: string) => {
        if (!selectedAbiParameter) {
            throw new Error("No method selected")
        }

        setIsInvoking(true)
        logger.info(
            <div className="flex items-center gap-2">
                <ArrowRight size={18} /> <div>{method}()</div>
            </div>
        )
    }

    const invokeSend = async (method: string) => {
        try {
            const { address } = await getAddress()
            if (!address) {
                throw new Error("Please install Freighter to deploy contract");
            }

            initialiseInvocation(method)

            // This should be the transaction hash
            const result = await web3Hook.executeSend(
                selectedContractAddress,
                method,
                formatParameters(selectedAbiParameter!),
                msgValue,
                address
            )

            if (result.txHash) {
                const { network } = await getNetwork()
                const txExplorer = getTransactionExplorer(network, result.txHash)
                logger.success(
                    <a className="underline" href={txExplorer} target="_blank">
                        {result.txHash}
                    </a>
                )
            } else {
                logger.success(JSON.stringify(result))
            }
        } catch (error: any) {
            logger.error(handleError(error), true)
        } finally {
            setSelectedAbiParameter(null)
            setIsInvoking(false)
        }
    }

    const invokeCall = async (method: string) => {
        try {
            initialiseInvocation(method)

            const { address } = await getAddress()
            if (!address) {
                throw new Error("Please install Freighter to deploy contract");
            }

            const result = await web3Hook.executeCall(
                selectedContractAddress,
                method,
                formatParameters(selectedAbiParameter!),
                address
            )

            formatOutput(selectedAbiParameter!, result)
        } catch (error: any) {
            logger.error(handleError(error), true)
        } finally {
            setSelectedAbiParameter(null)
            setIsInvoking(false)
        }
    }

    const formatOutput = (entry: AbiFunction, result: any) => {
        if (typeof result === "object") {
            result = JSON.stringify(result, (_, v) =>
                typeof v === "bigint" ? v.toString() : v
            )
        } else if (typeof result === "bigint") {
            result = result.toString()
        } else {
            result = result as string
        }

        logger.info(
            <div className="flex items-center gap-2">
                <ArrowLeft size={18} /> <div>{result}</div>
            </div>
        )
        setRet({ ...ret, [entry.name]: result })
    }
    //#endregion

    const handleError = (error: any) => {
        let msg = error && error.toString()
        if (typeof error === "object") {
            msg = error?.message.toString() || "Error deploying contract"
        }

        return `${msg.toString()}`
    }

    const [selectedContractAddress, setSelectedContractAddress] =
        useState<string>("")
    const [selectedAbiParameter, setSelectedAbiParameter] =
        useState<AbiFunction | null>(null)

    const [selectedConstructor, setSelectedConstructor] =
        useState<AbiConstructor | null>(null)

    const handleRemoveContract = (contractAddress: string) => {
        web3Hook.removeContract(contractAddress)
    }

    //#region Deploy Wasm
    const [contractWasm, setContractWasm] = useState<string>("")
    const [isDeployingWasm, setIsDeployingWasm] = useState(false)

    const handleDeployWasm = async () => {
        try {
            setIsDeployingWasm(true)
            await doDeployWasm();
        } catch (e: any) {
            logger.error(e.message || "Error deploying contract")
            console.error(e)
        } finally {
            setIsDeployingWasm(false)
        }
    }

    const doDeployWasm = async () => {
        const { address } = await getAddress()
        if (!address) {
            throw new Error("Please install Freighter to deploy contract");
        }

        logger.info("Deploying wasm...")

        if (!soroban.wasm) {
            return Promise.reject("Invalid or Missing WebAssembly (wasm)");
        }

        if (soroban.wasm.type !== "application/wasm") {
            throw new Error("Invalid wasm type. Expected 'application/wasm'.");
        }

        const result = await web3Hook.doDeployWasm({ wasmData: soroban.wasm, userAddress: address })

        if (!result.wasmId) {
            throw new Error("Wasm Deploy Failed. Please recompile to ensure Wasm is valid")
        }

        setContractWasm(result.wasmId)

        // Get constructor if exist
        const code = await _code(soroban.networkServer, hexToByte(result.wasmId));
        const specs = await _specs(code);
        const abi = await _abi(specs);
        soroban.setABI(abi)

        logger.success(`Contract Wasm deployed at ${result.wasmId}`)
        if (result.transactionHash) {
            const { network } = await getNetwork()
            const txExplorer = getTransactionExplorer(network, result.transactionHash)
            logger.success(
                <a className="underline" href={txExplorer} target="_blank">
                    {result.transactionHash}
                </a>
            )
        }
    }
    //#endregion

    return <div>
        <div className="flex items-center justify-center my-2">
            <ConnectWallet />
        </div>
        <div className="flex break-all my-2">
            <Button
                size="sm"
                onClick={handleDeployWasm}
                variant="default"
                disabled={isDeployingWasm}
            >
                Deploy Wasm
            </Button>

            {contractWasm && <div>
                Selected Wasm: {contractWasm}
            </div>}
        </div>
        <div className="flex my-2">
            <Button
                size="sm"
                onClick={handleDeploy}
                variant="default"
                disabled={isDeploying}
            >
                Deploy
            </Button>
            <Input
                className="h-9 rounded-md px-3"
                placeholder="Contract Address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
            />
        </div>

        {(soroban.abi as Abi)
            .filter((abi) => abi.type === "constructor")
            .map((abi, index: number) => {
                return (
                    <div key={index}>
                        <Button onClick={() => setSelectedConstructor(abi)}>
                            Deploy New Contract
                        </Button>
                    </div>
                )
            })}

        <div className="flex items-center justify-center">
            <div className="py-2 font-semibold text-grayscale-350">Value (stroop)</div>
            <Input
                className="h-9 rounded-md px-3"
                placeholder="Value"
                type="number"
                value={msgValue}
                onChange={(e) => setMsgValue(parseInt(e.target.value) || 0)}
            />
        </div>

        <Title text="Deployed Contracts" />
        {Object.entries(web3Hook.contracts).map(([key, val], index) => {
            return (
                <CollapsibleChevron
                    key={index}
                    name={key}
                    onClosed={() => handleRemoveContract(key)}
                >
                    <div>
                        <div className="flex items-center gap-2 truncate">
                            <div>
                                Wasm Hash:
                            </div>
                            <div>
                                {val.wasmHash}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 truncate">
                            <div>
                                Contract Id:
                            </div>
                            <div>
                                {getContractHash(val.contractAddress) || ""}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(val.abi as Abi)
                            .filter((abi) => abi.type === "function")
                            .map((abi: AbiFunction, methodsIndex: number) => {
                                return (
                                    <Button
                                        key={methodsIndex}
                                        onClick={() => {
                                            setSelectedContractAddress(key)
                                            setSelectedAbiParameter(abi)
                                        }}
                                        size="sm"
                                    >
                                        {abi.name}
                                    </Button>
                                )
                            })}
                    </div>
                </CollapsibleChevron>
            )
        })}

        <Dialog
            open={!!selectedAbiParameter}
            onOpenChange={() => {
                setSelectedContractAddress("")
                setSelectedAbiParameter(null)
            }}
        >
            <DialogContent className="max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selectedAbiParameter?.name || "Unknown"}
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {selectedAbiParameter && (
                    <>
                        {selectedAbiParameter.inputs.map(
                            (input: AbiParameter, abiIndex: number) => {
                                return (
                                    <div
                                        key={abiIndex}
                                        className="flex items-center space-x-2 py-1"
                                    >
                                        <div>{input.name}</div>

                                        <Input
                                            value={
                                                contractArguments[selectedContractAddress]?.[
                                                selectedAbiParameter.name
                                                ]?.[input.name || abiIndex.toString()]
                                            }
                                            placeholder={scSpecTypeToScVal(input.type.name)}
                                            onChange={(e) =>
                                                handleArgumentChange(
                                                    selectedContractAddress,
                                                    selectedAbiParameter.name,
                                                    input.name || abiIndex.toString(),
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                )
                            }
                        )}

                        <div className="flex items-center justify-center gap-2 w-full">
                            <Button className="w-full"
                                onClick={() => {
                                    invokeCall(selectedAbiParameter.name)
                                }}
                                disabled={isInvoking}
                            >
                                {isInvoking ? "Invoking..." : "Call"}
                            </Button>
                            <Button className="w-full"
                                onClick={() => {
                                    invokeSend(selectedAbiParameter.name)
                                }}
                                disabled={isInvoking}
                            >
                                {isInvoking ? "Invoking..." : "Send"}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>

        <Dialog
            open={!!selectedConstructor}
            onOpenChange={() => {
                setSelectedConstructor(null)
            }}
        >
            <DialogContent className="max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Deploy</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {selectedConstructor && (
                    <>
                        {selectedConstructor.inputs.map(
                            (input: AbiParameter, abiIndex: number) => {
                                return (
                                    <div
                                        key={abiIndex}
                                        className="flex items-center space-x-2 py-1"
                                    >
                                        <div>{input.name}</div>

                                        <Input
                                            value={
                                                contractArguments[CONSTRUCTOR_METHOD]?.[
                                                CONSTRUCTOR_METHOD
                                                ]?.[input.name || abiIndex.toString()]
                                            }
                                            placeholder={scSpecTypeToScVal(input.type.name)}
                                            onChange={(e) =>
                                                handleArgumentChange(
                                                    CONSTRUCTOR_METHOD,
                                                    CONSTRUCTOR_METHOD,
                                                    input.name || abiIndex.toString(),
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                )
                            }
                        )}

                        <Button onClick={handleDeploy} disabled={isDeploying}>
                            {isDeploying ? "Deploying ..." : "Deploy"}
                        </Button>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </div>
}
