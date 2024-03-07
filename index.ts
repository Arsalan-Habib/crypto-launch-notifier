import * as dotenv from "dotenv";

dotenv.config();
import { initializeServer } from "./server";
import { BOT_TOKEN } from "./config";
import { CHAINS } from "./constants/chains";
import { createPublicClient, http } from "viem";
import factoryAbi from "./constants/abis/factoryAbi";
import TelegramBot from "node-telegram-bot-api";
console.log("initing");
initializeServer();

// const bot = new TelegramBot(BOT_TOKEN, {
//   polling: true,
// });

const CHAIN_ID = 1;

let chatId = 5342316799;

// bot.sendMessage(5342316799, "hello me");

// bot.on("message", (msg: TelegramBot.Message) => {
//   console.log("setting chat id...");
//   chatId = msg.chat.id;
// });

// const publicClient = createPublicClient({
//   chain: CHAINS[CHAIN_ID].chain,
//   transport: http(CHAINS[CHAIN_ID].rpcUrl),
// });

// function sendMessageHandler(msg: string) {
//   if (chatId) {
//     console.log("chatId =>", chatId);

//     bot
//       .sendMessage(chatId, `PairCreated`)
//       .then((msg: TelegramBot.Message) => {
//         console.log("msg =>", msg);
//       })
//       .catch((err) => {
//         console.log("err =>", err);
//       });
//   }
// }

// function logHandler(logs) {
//   console.log("logs =>", logs);

//   logs.map((log) => {});
// }

// publicClient.watchContractEvent({
//   address: CHAINS[CHAIN_ID].factoryAddress,
//   abi: factoryAbi,
//   eventName: "PairCreated",
//   onLogs: logHandler,
// });
