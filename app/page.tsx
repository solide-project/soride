import { InvalidMessage } from "@/components/core/components/invalid-message";
import { SorobanIDE } from "@/components/soroban/ide";
import { LoadContractPage } from "@/components/soroban/load-contract";
import { SorobanProvider } from "@/components/soroban/provider";
import { loadSampleProject, getStylusContract } from "@/lib/server";

interface SearchParams {
  params: { slug: string }
  searchParams?: { [key: string]: string | undefined }
}
export default async function IndexPage({ searchParams }: SearchParams) {
  let url = ""
  searchParams?.url && (url = searchParams.url)

  let data = loadSampleProject()
  if (url) {
    data = await getStylusContract(url)
  }

  if (typeof data === "string") return <LoadContractPage message={data} />

  return <SorobanProvider>
    <SorobanIDE
      content={JSON.stringify(data)}
    />
  </SorobanProvider>
}
