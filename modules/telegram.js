import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.TG_TOKEN

console.log('starting bot...')
let bot = new TelegramBot(token, { polling: false });

export {bot};

