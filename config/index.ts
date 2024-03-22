import { ChatOpenAI } from "@langchain/openai";

export const DefillmaEndpoint = "https://coins.llama.fi";
export const RPC = "https://polygon-mumbai-bor.publicnode.com";
export const BOT_TOKEN = `${process.env.BOT_TOKEN}` || "";
export const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}` || "";
export const ETHERSCAN_API_KEY = `${process.env.ETHERSCAN_API_KEY}` || "";
export const PORT = process.env.PORT || 3000;
export const MONGO_URI = `${process.env.MONGO_URI}` || "";

export type CategorizedLinks = {
  Website?: string;
  X?: string;
  Gitbook?: string;
  Telegram?: string;
  Facebook?: string;
  Instagram?: string;
  Discord?: string;
  Coingecko?: string;
  Github?: string;
  LinkedIn?: string;
  PDF?: string[];
  Unknown?: string[];
};

export const model = new ChatOpenAI({
  modelName: "gpt-4",
  openAIApiKey: OPENAI_API_KEY,
});

export const templateForWebsiteLink = `
You are a helpful AI assistant with expertise in finding the correct link for a given cryptocurrency project. You are given the token symbol of the project and some links. You need to return the link that is most likely to be the official website of the project. If no link is the official website, you should return false. Do not return any link that is not from the provided links.

<tokenSymbol>
  {tokenSymbol}
</tokenSymbol>

<links>
  {links}
</links>

Your response must either be a single link or a false in the case that no links match the project. Do not add any additional information to your response. You should only return the link or false.
`;

export const templateForDescription = `
You are a helpful AI assistant with expertise in extracting the description of the website given its HTML markup and website name. 
Your task is to extract a brief description related to the given website name from the given markup without changing/adding your own words to the orginal text and if the description is more than 25 words then summarize it in to 25 words.

<websiteName>
  {websiteName}
</websiteName>

<markup>
  {markup}
</markup>

If you don't find any description then you response must be -.
`;
