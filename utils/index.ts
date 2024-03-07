import { OPENAI_API_KEY } from "../config";
import { CHAINS, defaultChain } from "../constants/chains";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getSourceCode } from "../config/api";
import { Address } from "viem";

export const getURL = async (chainId: number = defaultChain.chainId) => {
  return CHAINS[chainId].api;
};

// export const getAbi = async (contractAddress: string) => {
//   const url = await getURL();
//   const response = await axios.get(url, {
//     params: {
//       module: "contract",
//       action: "getabi",
//       address: contractAddress,
//       apiKey: ETHERSCAN_API_KEY,
//     },
//   });

//   return response.data.result;
// };

// export const isERC20Token = async (
//   tokenAddress: string,
//   publicClient?: PublicClient
// ) => {
//   // const provider = new ethers.providers.JsonRpcProvider(defaultChain.rpcUrl);
//   try {
//     let _publicClient = publicClient;
//     if (!publicClient) {
//       _publicClient =
//     }

//     _publicClient;
//     // let abi = await getAbi(tokenAddress);
//     // const contract = new ethers.Contract(tokenAddress, abi, provider);

//     // Check if the contract implements essential ERC-20 functions
//     const requiredFunctions = [
//       "name",
//       "symbol",
//       "decimals",
//       "balanceOf",
//       "transfer",
//       "approve",
//     ];
//     // const hasRequiredFunctions = requiredFunctions.every(
//     //   (funcName) => contract.functions[funcName]
//     // );

//     // return hasRequiredFunctions;
//   } catch (error) {
//     throw new Error(`${tokenAddress} is not an ERC-20 token`);
//   }
// };

const model = new ChatOpenAI({
  modelName: "gpt-4",
  openAIApiKey: OPENAI_API_KEY,
});

const template = `
You are a helpful AI assistant with expertise in extracting Urls from the comments of smart contracts code.
You will be given a smart contract solidity code to extract the Urls from and you have to search every comment in the code for the Urls.

<contractCode>
  {contractCode}
</contractCode>

Your response must only contain array of string and give only null string value (in case of no link). 
`;

// export async function extractLinks(contractCode: string) {

//   const promptTemplate = PromptTemplate.fromTemplate(template);

//   const chain = promptTemplate.pipe(model);

//   const res = await chain.invoke({
//     contractCode: JSON.stringify(contractCode),
//   });

//   console.log("Respsonse From OPENAI:", res.content);

//   return res.content;
// }

export function extractLinks(contractCode: string) {
  const matches = contractCode.matchAll(/(?<links>https:\/\/.+)\n?\s?/gm);
  console.log("matches =>", matches);

  const links: string[] = [];
  for (var item of matches) {
    // console.log("item =>", item.groups);

    if (item.groups) {
      links.push(item.groups.links);
    }
  }

  return links;
}

export const getContractSrcCode = async (address: Address) => {
  console.log("extracting source code from contract...");
  const code = await getSourceCode(address);

  if (code) {
    return code;
  }

  return null;
};

export const renderMessage = (message: string) => {};
