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
  extractDescription,
  extractLinks,
  extractWebSiteLink,
  getCategorizedLinksObject,
  getContractSrcCode,
  getLiquidity,
  getTokenAddress,
  publicClient,
  renderMessage,
} from "./utils";
import { connectDb } from "./config/db";
import { Config } from "./models/Config";

console.log("initializing...");
connectDb();
initializeServer();

let chatIds: number[];

const refreshChatId = async () => {
  try {
    const config = await Config.findOne({});
    console.log("configs =>", config);

    if (config) {
      chatIds = config.chatIds;
    }
  } catch (error) {
    console.log("error =>", error);
  }
};

refreshChatId();

const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

bot.on("message", async (msg: TelegramBot.Message) => {
  console.log("setting chat id...", msg.chat.id);

  const config = await Config.findOne({});

  if (!config) {
    await Config.create({ chatIds: [msg.chat.id] });
  } else {
    const idExist = config.chatIds.includes(msg.chat.id);
    if (!idExist) {
      config.chatIds.push(msg.chat.id);
      await config.save();
    }
  }
  await refreshChatId();
  if (msg.text === "/active") {
    bot.sendMessage(msg.chat.id, "🤖 Bot is now Active");
  }
});

function sendMessageHandler(msg: string) {
  if (chatIds.length > 0) {
    console.log("msg =>", msg);

    chatIds.forEach((chatId) => {
      console.log("chatId =>", chatId);

      bot
        .sendMessage(chatId, msg, {
          parse_mode: "HTML",
        })
        .then((msg: TelegramBot.Message) => {
          console.log("msg => Done");
        })
        .catch((err) => {
          console.log("err =>", err.message);
        });
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

      let categorizedLinks: CategorizedLinks = {};

      let name = "-";

      if (!contractCodeRes) {
        console.log("contractCodeRes not found");
        return;
      }

      const { sourceCode: contractCode, name: tokenName } = contractCodeRes;
      name = tokenName;
      let websiteLink = extractWebSiteLink(contractCode);

      rawLinks = extractLinks(contractCode);

      if (rawLinks.length > 0) {
        categorizedLinks = await getCategorizedLinksObject(rawLinks, name, websiteLink);
      }

      if (Object.keys(categorizedLinks).length > 0) {
        let description: string | null = "-";

        if (categorizedLinks.Website) {
          description = await extractDescription(name, categorizedLinks.Website);

          if (!description) {
            description = "-";
          }
        }

        let message = renderMessage({
          token: token as Address,
          name,
          description,
          chain: CHAINS[CHAIN_ID].chain.name,
          links: categorizedLinks,
          liquidity: await getLiquidity(pair),
        });

        sendMessageHandler(message);
      } else {
        console.log("contract with no useful info found!");
        return;
      }
    }, 30000);
  });
}

publicClient.watchContractEvent({
  address: CHAINS[CHAIN_ID].factoryAddress,
  abi: factoryAbi,
  eventName: "PairCreated",
  onLogs: logHandler,
});
