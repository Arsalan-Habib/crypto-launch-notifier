export const DefillmaEndpoint = "https://coins.llama.fi";
export const RPC = "https://polygon-mumbai-bor.publicnode.com";
export const BOT_TOKEN = `${process.env.BOT_TOKEN}` || "";
export const OPENAI_API_KEY = `${process.env.OPENAI_API_KEY}` || "";
export const ETHERSCAN_API_KEY = `${process.env.ETHERSCAN_API_KEY}` || "";
export const PORT = 3000;

export type CategorizedLinks = {
  X: string;
  Telegram: string;
  Facebook: string;
  Instagram: string;
  Discord: string;
  Coingecko: string;
  Github: string;
  PDF: string[];
  Unknown: string[];
};
