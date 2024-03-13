const express = require('express');
const Telegram = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();

const token = '6895299176:AAHLERqbcRrBElADEx3O24mPeGgEleJMC30';
const weatherAPIKey = 'bae2894f2b5a72db6ed038c33f7e9957';

const bot = new Telegram(token,{polling:true});

// Keep Track of messages
const conversationState = {};

app.get('/',(req,res) => {
    console.log('hello to weather bot..');
})

bot.on('message',async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    // Respond to the incoming message
    if (message.toLowerCase() === '/start') {
        bot.sendMessage(chatId, `Welcome! Here are the available commands:\n\n/weather - Get weather report for a city\n/exit - Exit conversation`);
    } else if (message.toLowerCase().startsWith('/weather')) {
        bot.sendMessage(chatId, `Enter your city.. `);
        // Set the conversation state to 'awaitingCity'
        conversationState[chatId] = 'awaitingCity';
    }
    // Check if the conversation state is 'awaitingCity'
    else if (conversationState[chatId] === 'awaitingCity') {
        if (message.toLowerCase() === '/exit') {
            bot.sendMessage(chatId, 'Conversation ended. Type /weather to start a new conversation.');
            delete conversationState[chatId]; 
        }
        else {
            const city = message; // Get the city from the user's message

            try {
                // Call OpenWeatherMap API
                const response = await axios.
                get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=metric`);

                // Extract weather information
                const weatherDescription = response.data.weather[0].description;
                const mainDetails = response.data.main;
                const temperature = mainDetails.temp;
                // Send weather report
                bot.sendMessage(chatId, `Weather in ${city}: ${weatherDescription}
                Temperature: ${temperature}°C
                Humidity: ${mainDetails.humidity}
                Min Temp: ${mainDetails.temp_min}
                Max Temp: ${mainDetails.temp_max}`);
            
            }
            catch (error) {
             console.error('Error fetching weather:', error);
             bot.sendMessage(chatId, 'Error fetching weather. Please try again.');
            }
        }
    } else {
        // Respond to other messages
        bot.sendMessage(chatId, `Enter /weather to start conversation`);
    }
})

const port = process.env.PORT || 3000;
app.listen(port,() => {
    console.log('Telegram bot is running on '+port);
})

