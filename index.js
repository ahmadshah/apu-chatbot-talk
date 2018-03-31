require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const DialogFlow = require('apiai');

const Firebase = require('firebase');
require("firebase/firestore");

const TelegramToken = process.env.TELEGRAM_TOKEN;
const DialogFlowToken = process.env.DIALOGFLOW_TOKEN;
const NlpSessionID = process.env.DIALOGFLOW_SESSION_ID;
const Bot = new TelegramBot(TelegramToken, {polling: true});
const Nlp = DialogFlow(DialogFlowToken);

Firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID
});
const DB = Firebase.firestore();

Bot.onText(/\/start/, (msg) => {
    Bot.sendMessage(msg.chat.id, "Hello there, Let's chat!");
});

Bot.onText(/\/intake (.+)/, (msg, match) => {
    var programme = match[1].toLowerCase().replace(/ /g, '-');
    
    DB.collection('intakes')
        .doc(programme)
        .get()
        .then((doc) => {
            if(doc.exists) {
                Bot.sendMessage(msg.chat.id, "Commencement dates for the programe are " + doc.data().commencement_date.join(", "));
            } else {
                Bot.sendMessage(msg.chat.id, "Sorry, I cant seem to find the related programme.");
            }
        })
        .catch((error) => {
            console.log('Error querying document');
        });
});

Bot.on('message', (msg) => {
    var text = msg.text.toString();
    if (text.indexOf('/') == -1) {
        var request = Nlp.textRequest(msg.text.toString(), {
            sessionId: NlpSessionID
        });

        request.on('response', function (response) {
            var answer = response.result.fulfillment.speech;

            if (answer == '') {
                Bot.sendMessage(msg.chat.id, "Sorry, I can't answer that. Let's talk about something else.");
            } else {
                Bot.sendMessage(msg.chat.id, answer);
            }
        });

        request.on('error', function (error) {
            Bot.sendMessage(msg.chat.id, "Sorry, I can't answer that.");
        });

        request.end();
    }
});
