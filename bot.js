const Telegram = require('node-telegram-bot-api');
const axios = require('axios');

const token = '6895299176:AAHLERqbcRrBElADEx3O24mPeGgEleJMC30';
const weatherAPIKey = 'bae2894f2b5a72db6ed038c33f7e9957';

const bot = new Telegram(token,{polling:true});

// Keep Track of messages
const conversationState = {};

bot.on('message',async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;

    // Respond to the incoming message
    if (message.startsWith('/weather')) {
        bot.sendMessage(chatId, `Enter city name to get the weather report.. `);
        // Set the conversation state to 'awaitingCity'
        conversationState[chatId] = 'awaitingCity';
    }
    // Check if the conversation state is 'awaitingCity'
    else if (conversationState[chatId] === 'awaitingCity') {
        const city = message; // Get the city from the user's message

        try {
            // Call OpenWeatherMap API
            const response = await axios.
            get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=metric`);

            // Extract weather information
            const weatherDescription = response.data.weather[0].description;
            const temperature = response.data.main.temp;
            console.log(response.data);

            // Send weather report
            bot.sendMessage(chatId, `Weather in ${city}: ${weatherDescription}\n, Temperature: ${temperature}°C`);

            // Reset conversation state
            delete conversationState[chatId];
        } catch (error) {
            console.error('Error fetching weather:', error);
            bot.sendMessage(chatId, 'Error fetching weather. Please try again.');
        }
    } else {
        // Respond to other messages
        bot.sendMessage(chatId, `Enter /weather to start conversation`);
    }
})