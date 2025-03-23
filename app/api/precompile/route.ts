import path from "path"
import fs from "fs"
import { NextRequest, NextResponse } from "next/server"
import JSZip from "jszip";

export async function POST(request: NextRequest) {
    const contract = "soroban_increment_with_pause_contract"
    const wasmDirectory = path.resolve('./public/precompile', `${contract}.wasm`);
    const wasm: Buffer = fs.readFileSync(wasmDirectory);

    const zip = new JSZip();
    zip.file(`contract.wasm`, new Uint8Array(wasm));

    // Generate the zip file as a Blob (Node.js environment uses Buffers)
    const content: Blob = await zip.generateAsync({ type: 'blob' })
    return new NextResponse(content, {
        headers: {
            "Content-Type": "application/blob",
            "Content-Disposition": `attachment; filename=${contract}.zip`
        }
    });

}
