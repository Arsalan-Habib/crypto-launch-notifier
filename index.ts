import * as dotenv from "dotenv";

dotenv.config();
import { initializeServer } from "./server";
import { BOT_TOKEN, CategorizedLinks } from "./config";
import { CHAINS } from "./constants/chains";
import { Address, createPublicClient, http } from "viem";
import factoryAbi from "./constants/abis/factoryAbi";
import TelegramBot from "node-telegram-bot-api";
import {
  CHAIN_ID,
  extractLinks,
  getCategorizeLinks,
  getContractSrcCode,
  getLiquidity,
  getTokenAddress,
  publicClient,
  renderMessage,
} from "./utils";
console.log("initing");
initializeServer();

const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

let chatId = 5342316799;

// bot.sendMessage(-4154609412, "hello me");

bot.on("message", (msg: TelegramBot.Message) => {
  console.log("setting chat id...", msg.chat.id);
  chatId = msg.chat.id;

  bot.sendMessage(chatId, "🤖 Bot set On this Group/Chat");
});

function sendMessageHandler(msg: string) {
  if (chatId) {
    console.log("chatId =>", chatId);
    console.log("msg =>", msg);

    bot
      .sendMessage(chatId, msg)
      .then((msg: TelegramBot.Message) => {
        console.log("msg => Done");
      })
      .catch((err) => {
        console.log("err =>", err);
      });
  }
}

function logHandler(logs) {
  //   console.log("logs =>", logs);

  logs.map(async (log) => {
    console.log("log =>", log);
    const pair = log.args[0];

    const token = await getTokenAddress(pair);

    if (!token) {
      console.log("token not found");
      return;
    }

    console.log("token =>", token);

    setTimeout(async () => {
      const contractCodeRes = await getContractSrcCode(token as Address);
      // console.log("contractCode =>", contractCode);
      let rawLinks: string[] = [];

      let categorizedLinks: CategorizedLinks | null = null;

      let name = "-";

      if (contractCodeRes) {
        const { sourceCode: contractCode, name: tokenName } = contractCodeRes;
        name = tokenName;
        rawLinks = extractLinks(contractCode);
      }

      if (rawLinks.length > 0) {
        categorizedLinks = getCategorizeLinks(rawLinks);
      }

      if (categorizedLinks) {
        console.log("categorizedLinks =>", categorizedLinks);
      }
      let message = renderMessage({
        token: token as Address,
        name,
        chain: CHAINS[CHAIN_ID].chain.name,
        links: categorizedLinks,
        liquidity: await getLiquidity(pair),
      });

      console.log("rawLinks =>", rawLinks);

      sendMessageHandler(message);
    }, 30000);
  });
}

publicClient.watchContractEvent({
  address: CHAINS[CHAIN_ID].factoryAddress,
  abi: factoryAbi,
  eventName: "PairCreated",
  onLogs: logHandler,
});
