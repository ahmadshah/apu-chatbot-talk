require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const DialogFlow = require('apiai');
const TelegramToken = process.env.TELEGRAM_TOKEN;
const DialogFlowToken = process.env.DIALOGFLOW_TOKEN;
const NlpSessionID = process.env.DIALOGFLOW_SESSION_ID;
const Bot = new TelegramBot(TelegramToken, {polling: true});
const Nlp = DialogFlow(DialogFlowToken);

Bot.onText(/\/start/, (msg) => {
    Bot.sendMessage(msg.chat.id, "Hello there, Let's chat!");
});

Bot.on('message', (msg) => {
    var request = Nlp.textRequest(msg.text.toString(), {
        sessionId: NlpSessionID
    });

    request.on('response', function (response) {
        var answer = response.result.fulfillment.speech;

        if(answer == '') {
            Bot.sendMessage(msg.chat.id, "Sorry, I can't answer that. Let's talk about something else.");
        } else {
            Bot.sendMessage(msg.chat.id, answer);
        }
    });

    request.on('error', function (error) {
        Bot.sendMessage(msg.chat.id, "Sorry, I can't answer that.");
    });

    request.end();
});
