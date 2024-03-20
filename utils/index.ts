import { CategorizedLinks, OPENAI_API_KEY } from "../config";
import { CHAINS, defaultChain } from "../constants/chains";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getSourceCode } from "../config/api";
import { Address, createPublicClient, erc20Abi, http } from "viem";
import uniswapPairAbi from "../constants/abis/uniswapPairAbi";
import { LINKS_ORDER, KEYWORDS_TO_IGNORE } from "../constants/links";

export const CHAIN_ID = 1;

export const publicClient = createPublicClient({
  chain: CHAINS[CHAIN_ID].chain,
  transport: http(CHAINS[CHAIN_ID].rpcUrl),
});

export const getURL = async (chainId: number = defaultChain.chainId) => {
  return CHAINS[chainId].api;
};

const model = new ChatOpenAI({
  modelName: "gpt-4",
  openAIApiKey: OPENAI_API_KEY,
});

const template = `
You are a helpful AI assistant with expertise in finding the correct link for a given cryptocurrency project. You are given the token symbol of the project and some links. You need to return the link that is most likely to be the official website of the project. If no link is the official website, you should return false. Do not return any link that is not from the provided links.

<tokenSymbol>
  {tokenSymbol}
</tokenSymbol>

<links>
  {links}
</links>

Your response must either be a single link or a false in the case that no links match the project. Do not add any additional information to your response. You should only return the link or false.
`;

export async function getOfficialWebsiteFromLinks(contractName: string, links: string[]) {
  const promptTemplate = PromptTemplate.fromTemplate(template);

  const chain = promptTemplate.pipe(model);

  const res = await chain.invoke({
    tokenSymbol: JSON.stringify(contractName),
    links: JSON.stringify(links),
  });

  console.log("Respsonse From OPENAI:", res.content);

  return res.content;
}

const cleanLink = (link: string) => {
  const spaceIndex = link.indexOf(" ");

  if (spaceIndex !== -1) {
    link = link.slice(0, spaceIndex);
  }

  const bracketIndex = link.indexOf("[");

  if (bracketIndex !== -1) {
    link = link.slice(0, bracketIndex);
  }

  return link;
};

export function extractLinks(contractCode: string) {
  console.log("contractCode =>", contractCode);
  const matches = contractCode.matchAll(/(?<links>https?:\/\/.+)\n?\s?/gm);
  console.log("matches =>", matches);

  const links: string[] = [];
  for (var item of matches) {
    console.log("item =>", item.groups);

    if (item.groups) {
      links.push(cleanLink(item.groups.links));
    }
  }

  return links;
}

export const getContractSrcCode = async (address: Address): Promise<{ sourceCode: string; name: string } | null> => {
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

export const getTokenAddress = async (address: Address): Promise<Address | null> => {
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
    _links = "Links: \n\n";
    for (let [key, value] of Object.entries(data.links)) {
      if (key !== "PDF" && key !== "Unknown") {
        _links += `${key}: ${value}\n`;
      }
    }

    if (data.links["PDF"] && data.links["PDF"].length > 0) {
      _links += "PDF: \n";
      data.links["PDF"].forEach((link) => {
        _links += `${link}\n`;
      });
    }

    if (data.links["Unknown"] && data.links["Unknown"].length > 0) {
      _links += "Others: \n";
      data.links["Unknown"].forEach((link) => {
        _links += `${link}\n`;
      });
    }
  }

  const m = `🔥 <b>Exchange Created</b>

🪙  Token: <b>${data.name}</b>
🗒   Address: <b><a href="${CHAINS[CHAIN_ID].blockExplorerUrls[0]}/address/${data.token}">${data.token}</a></b>
🔗  Chain: <b>${data.chain}</b>
💰  Liquidity: <b>${data.liquidity} ETH</b>

${_links}
`;

  return m;
};

export const includesAny = (str: string, testers: string[]) => {
  let found = false;

  for (let regex of testers) {
    if (str.toLowerCase().includes(regex.toLowerCase())) {
      found = true;
      break;
    }
  }

  return found;
};

export const getCategorizedLinksObject = async (links: string[], contractName: string): Promise<CategorizedLinks> => {
  const categorizedLinks: CategorizedLinks = {};

  // filtering out any links that contain the strings in LINKS_TO_IGNORE.
  const filteredLinks = links.filter((link) => !includesAny(link.toLowerCase(), KEYWORDS_TO_IGNORE));

  // categorizing results.
  filteredLinks.forEach((link) => {
    if (link.toLowerCase().endsWith(".pdf")) {
      if (!categorizedLinks["PDF"]) {
        categorizedLinks["PDF"] = [];
      }
      categorizedLinks["PDF"].push(link);
    } else if (includesAny(link.toLowerCase(), ["twitter.com", "x.com"])) {
      categorizedLinks["X"] = link;
    } else if (includesAny(link.toLowerCase(), ["t.me", "telegram"])) {
      categorizedLinks["Telegram"] = link;
    } else if (includesAny(link.toLowerCase(), ["facebook.com", "facebook"])) {
      categorizedLinks["Facebook"] = link;
    } else if (includesAny(link.toLowerCase(), ["instagram.com", "instagram"])) {
      categorizedLinks["Instagram"] = link;
    } else if (includesAny(link.toLowerCase(), ["discord.com", "discord"])) {
      categorizedLinks["Discord"] = link;
    } else if (includesAny(link.toLowerCase(), ["coingecko.com", "coingecko"])) {
      categorizedLinks["Coingecko"] = link;
    } else if (includesAny(link.toLowerCase(), ["github.com", "github"])) {
      categorizedLinks["Github"] = link;
    } else {
      if (!categorizedLinks["Unknown"]) {
        categorizedLinks["Unknown"] = [];
      }
      categorizedLinks["Unknown"].push(link);
    }
  });

  if (categorizedLinks.Unknown?.length) {
    let res = await getOfficialWebsiteFromLinks(contractName, categorizedLinks.Unknown);
    if (res !== "false") {
      // @ts-ignore
      categorizedLinks.Website = res.replace(/"/g, "");
    }
  }

  // reorder the links based on the order in LINKS_ORDER
  const orderedLinks: CategorizedLinks = {};
  Object.keys(LINKS_ORDER).forEach((key) => {
    if (categorizedLinks[key]) {
      orderedLinks[key] = categorizedLinks[key];
    }
  });

  return orderedLinks;
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
