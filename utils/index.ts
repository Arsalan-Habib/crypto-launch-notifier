import { CategorizedLinks, OPENAI_API_KEY } from "../config";
import { CHAINS, defaultChain } from "../constants/chains";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getSourceCode } from "../config/api";
import { Address, createPublicClient, erc20Abi, http } from "viem";
import uniswapPairAbi from "../constants/abis/uniswapPairAbi";

export const CHAIN_ID = 1;

export const publicClient = createPublicClient({
  chain: CHAINS[CHAIN_ID].chain,
  transport: http(CHAINS[CHAIN_ID].rpcUrl),
});

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
  console.log("contractCode =>", contractCode);
  const matches = contractCode.matchAll(
    /(?<links>https?:\/\/.+)\n?\s?\[?\\?/gm
  );
  console.log("matches =>", matches);

  const links: string[] = [];
  for (var item of matches) {
    console.log("item =>", item.groups);

    if (item.groups) {
      links.push(item.groups.links);
    }
  }

  return links;
}

export const getContractSrcCode = async (
  address: Address
): Promise<{ sourceCode: string; name: string } | null> => {
  console.log("extracting source code from contract...");
  const code = await getSourceCode(address);

  console.log("code =>", code);

  if (
    code &&
    code.message !== "NOTOK" &&
    code.result.length > 0 &&
    code.result[0].SourceCode &&
    code.result[0].SourceCode !== ""
  ) {
    return {
      sourceCode: code.result[0].SourceCode.replaceAll(/\\n/g, "\n"),
      name: code.result[0].ContractName,
    };
  }

  return null;
};

export const getTokenAddress = async (
  address: Address
): Promise<Address | null> => {
  const token0 = await publicClient.readContract({
    abi: uniswapPairAbi,
    address,
    functionName: "token0",
  });

  const token1 = await publicClient.readContract({
    abi: uniswapPairAbi,
    address,
    functionName: "token1",
  });

  if (token0 == CHAINS[CHAIN_ID].wethAddress) {
    return token1;
  }

  if (token1 == CHAINS[CHAIN_ID].wethAddress) {
    return token0;
  }

  return null;
};

export const renderMessage = (data: {
  token: Address;
  name: string;
  chain: string;
  links: CategorizedLinks | null;
  liquidity: string;
}) => {
  let _links = "";

  if (data.links) {
    _links = "Links: \n";
    for (let [key, value] of Object.entries(data.links)) {
      if (key === "PDF") {
        _links += `PDF: `;

        (value as string[]).forEach((item) => {
          _links += `${item},\n `;
        });
      } else if (key === "Unknown") {
        _links += `OtherLinks: \n`;

        (value as string[]).forEach((item) => {
          _links += `${item},\n `;
        });
      } else {
        _links += `${key}: ${value}\n`;
      }
    }
  }

  const m = `🔥Exchange Created
🪙 Token: ${data.name}
🗒 Address: ${data.token}
🔗 Chain: ${data.chain}
💰 liquidity: ${data.liquidity}

${_links}
`;

  return m;
};

export const getCategorizeLinks = (links: string[]): CategorizedLinks => {
  const categorizedLinks: CategorizedLinks = {
    X: "-",
    Telegram: "-",
    Facebook: "-",
    Instagram: "-",
    Discord: "-",
    Coingecko: "-",
    Github: "-",
    PDF: [],
    Unknown: [],
  };

  links.forEach((link) => {
    if (link.includes("twitter.com") || link.includes("x.com")) {
      categorizedLinks["X"] = link;
    } else if (
      link.includes("t.me") ||
      link.toLowerCase().includes("telegram")
    ) {
      categorizedLinks["Telegram"] = link;
    } else if (
      link.includes("facebook.com") ||
      link.toLowerCase().includes("facebook")
    ) {
      categorizedLinks["Facebook"] = link;
    } else if (
      link.includes("instagram.com") ||
      link.toLowerCase().includes("instagram")
    ) {
      categorizedLinks["Instagram"] = link;
    } else if (
      link.includes("discord.com") ||
      link.toLowerCase().includes("discord")
    ) {
      categorizedLinks["Discord"] = link;
    } else if (
      link.includes("coingecko.com") ||
      link.toLowerCase().includes("coingecko")
    ) {
      categorizedLinks["Coingecko"] = link;
    } else if (
      link.includes("github.com") ||
      link.toLowerCase().includes("github")
    ) {
      categorizedLinks["Github"] = link;
    } else if (link.toLowerCase().endsWith(".pdf")) {
      categorizedLinks["PDF"].push(link);
    } else {
      categorizedLinks["Unknown"].push(link);
    }
  });

  return categorizedLinks;
};

export const getLiquidity = async (pairAddress: Address) => {
  const decimals = await publicClient.readContract({
    abi: erc20Abi,
    address: CHAINS[CHAIN_ID].wethAddress,
    functionName: "decimals",
  });

  const token0 = await publicClient.readContract({
    abi: uniswapPairAbi,
    address: pairAddress,
    functionName: "token0",
  });
  let i = 1;

  if (token0 == CHAINS[CHAIN_ID].wethAddress) {
    i = 0;
  }

  const _reserves = await publicClient.readContract({
    abi: uniswapPairAbi,
    address: pairAddress,
    functionName: "getReserves",
  });

  const liquidity = (_reserves[i] as bigint) / BigInt(10 ** decimals);

  return liquidity.toString(3);
};
