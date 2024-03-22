import { CategorizedLinks, model, templateForDescription, templateForWebsiteLink } from "../config";
import { JSDOM } from "jsdom";
import { CHAINS, defaultChain } from "../constants/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import { getSourceCode } from "../config/api";
import { Address, createPublicClient, erc20Abi, http } from "viem";
import uniswapPairAbi from "../constants/abis/uniswapPairAbi";
import { LINKS_ORDER, KEYWORDS_TO_IGNORE, REGEX_FOR_WEBSITE_URLS } from "../constants/links";

export const CHAIN_ID = 1;

export const publicClient = createPublicClient({
  chain: CHAINS[CHAIN_ID].chain,
  transport: http(CHAINS[CHAIN_ID].rpcUrl),
});

export const getURL = async (chainId: number = defaultChain.chainId) => {
  return CHAINS[chainId].api;
};

export const extractWebSiteLink = (contractCode: string) => {
  for (const pattern of REGEX_FOR_WEBSITE_URLS) {
    // console.log("pattern =>", pattern);
    const match: RegExpExecArray | null = new RegExp(pattern).exec(contractCode);
    // console.log("match =>", match);
    if (match && match.groups && match.groups.links) {
      return match.groups.links;
    }
  }
  return null;
};

export async function getOfficialWebsiteFromLinks(contractName: string, links: string[]) {
  const promptTemplate = PromptTemplate.fromTemplate(templateForWebsiteLink);

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
  // console.log("contractCode =>", contractCode);
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
  description: string;
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

📓  Description: <b>${data.description}</b>

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

export const getCategorizedLinksObject = async (
  links: string[],
  contractName: string,
  websiteLink: string | null = null,
): Promise<CategorizedLinks> => {
  const categorizedLinks: CategorizedLinks = {};

  if (websiteLink) {
    categorizedLinks["Website"] = websiteLink;
  }

  // filtering out any links that contain the strings in LINKS_TO_IGNORE.
  const filteredLinks = links.filter((link) => !includesAny(link.toLowerCase(), KEYWORDS_TO_IGNORE));

  // categorizing results.
  filteredLinks.forEach((link) => {
    if (link.toLowerCase().endsWith(".pdf")) {
      if (!categorizedLinks["PDF"]) {
        categorizedLinks["PDF"] = [];
      }
      categorizedLinks["PDF"].push(link);
    } else if (includesAny(link.toLowerCase(), ["gitbook.com", "gitbook"])) {
      categorizedLinks["Gitbook"] = link;
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

  if (!categorizedLinks["Website"] || categorizedLinks["Website"] == "") {
    if (categorizedLinks.Unknown?.length) {
      let res = await getOfficialWebsiteFromLinks(contractName, categorizedLinks.Unknown);
      if (res !== "false") {
        // @ts-ignore
        let website = res.replace(/"/g, "");

        categorizedLinks.Website = website;

        // remove the website from the unknown category
        categorizedLinks.Unknown = categorizedLinks.Unknown.filter((link) => link !== website);
      }
    }
  } else {
    if (categorizedLinks.Unknown?.length) {
      categorizedLinks.Unknown = categorizedLinks.Unknown.filter((link) => link !== categorizedLinks.Website);
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

export const extractDescription = async (tokenName: string, url: string) => {
  try {
    const res = await fetch(url);

    const domText = await res.text();

    const dom = new JSDOM(domText);

    const desTags = dom.window.document.querySelectorAll("meta[name*='description'], meta[property*='description']");

    const txt = Array.from(desTags).reduce((longestDes, desTag) => {
      const desTxt = desTag.getAttribute("content");

      if (!desTxt) {
        return longestDes;
      }

      if (desTxt.split(" ").length > longestDes.split(" ").length) {
        return desTxt;
      }

      return longestDes;
    }, "");

    if (txt.split(" ").length >= 7) {
      return txt;
    }

    const typography = dom.window.document.body.querySelectorAll("h1, h2, h3, h4, h5, h6, p");

    // console.log("typography =>", Array.from(typography.values()));

    const textContent = Array.from(typography.values()).reduce((acc, ele) => {
      return acc + `\n${ele.textContent}`;
    }, "");

    console.log("textContent =>", textContent);

    const promptTemplate = PromptTemplate.fromTemplate(templateForDescription);

    const chain = promptTemplate.pipe(model);

    const resAI = await chain.invoke({
      websiteName: tokenName,
      markup: JSON.stringify(textContent),
    });

    console.log("Description from AI:", resAI.content);

    return resAI.content.toString();

    // return/ null;
  } catch (err) {
    console.log("err =>", err);

    return null;
  }
};
