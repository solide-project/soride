import { Contract, Memo, rpc, TimeoutInfinite, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { getRPC } from "../chains/rpc";
const { Server } = rpc;

export const BASE_FEE = "100";
export const XLM_DECIMALS = 7;
/**
 * The placeholder account used calling gasless methods.
 */
export const PLACEHOLDER_ACCOUNT = "GDSCPUSWDYPLGY3OPRFWREJHDE2KNPTWBZDKW4FG64LQPY6YIRMQDCBW"

export const getServer = (chainId: string) =>
    new Server(getRPC(chainId), {
        allowHttp: false,
    });

export const getEstimatedFee = async (
    contractAddress: string,
    txBuilder: TransactionBuilder,
    server: rpc.Server,
    memo: string,
    method: string,
    params: xdr.ScVal[],
) => {
    const contract = new Contract(contractAddress);

    const tx = txBuilder
        .addOperation(contract.call(method, ...params))
        .setTimeout(TimeoutInfinite);

    if (memo.length > 0) {
        tx.addMemo(Memo.text(memo));
    }

    const raw = tx.build();
    console.log("raw", raw)

    let response = await server.simulateTransaction(raw);
    console.log("response", response)

    if (rpc.Api.isSimulationError(response)) {
        throw new Error(`Simulation Error: ${response.error}`);
    }

    // response = response as SorobanRpc.SimulateTransactionSuccessResponse;
    const classicFeeNum = parseInt(raw.fee, 10) || 0;
    const minResourceFeeNum = parseInt(response.minResourceFee, 10) || 0;
    const fee = (classicFeeNum + minResourceFeeNum).toString();

    return fee;
};