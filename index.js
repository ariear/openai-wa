const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { Client, LocalAuth } = require("whatsapp-web.js");
const { OPEN_AI_API_KEY } = require('./env');

const client = new Client({
    authStrategy: new LocalAuth()
})

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('message', async (message) => {
    if (message.body.toLowerCase() === '#help' || message.body.toLowerCase() === '#h') {
        message.reply(" SELAMAT DATANG DI CHAT BOT OPENAI-WA \n \n Ketik #nanya/pertanyaan kamu \n \n Follow github saya :) \n https://github.com/ariear")
    }else if (message.body.toLowerCase().includes('#nanya/')) {
        const cmd = message.body.toLowerCase().split('/');

        message.reply('sedang diproses, cotto mattene');

        const question = cmd[1];
        const response = await RequestChat(question)

        if (!response.success) {
            return message.reply(response.message);
        }

        return message.reply(response.data);
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
});

const RequestChat = async (text) => {

    const result = {
        success: false,
        data: "",
        message: "",
    }

    return await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        data: {
            model: "text-davinci-003",
            prompt: text,
            max_tokens: 1000,
            temperature: 0
        },
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Accept-Language": "in-ID",
            "Authorization": `Bearer ${OPEN_AI_API_KEY}`,
        },
    })
        .then((response) => {
            if (response.status == 200) {

                const { choices } = response.data;

                if (choices && choices.length) {
                    result.success = true;
                    result.data = choices[0].text;
                }

            } else {
                result.message = "Failed response";
            }

            return result;
        })
        .catch((error) => {
            result.message = "Error : " + error.message;
            return result;
        });
}

client.initialize();
 