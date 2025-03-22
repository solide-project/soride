import { rpc } from "@stellar/stellar-sdk";
import { getRPC } from "../chains/rpc";
const { Server } = rpc;

export const BASE_FEE = "100";
export const XLM_DECIMALS = 7;
/**
 * The placeholder account used calling gasless methods.
 */
export const PLACEHOLDER_ACCOUNT = "GDLEI7MS6EMTGHB7N5YHSVEMEWSWNUM4T77VDEGNTXSBRTIGMXUCE5GF"

export const getServer = (chainId: string) =>
    new Server(getRPC(chainId), {
        allowHttp: false,
    });