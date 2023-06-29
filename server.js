import * as dotenv from 'dotenv';
dotenv.config();

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI,
});

const openai = new OpenAIApi(configuration);

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let conversation = []; // Initialize an empty conversation array to store the messages.

app.post('/chat', async (req, res) => {
    try {
        console.log(req.body);
        const messages = req.body.messages;
        console.log(messages);

        conversation = messages; // Here's the updated line

        const aiResponse = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo-16k',
            messages: conversation,
        });

        const response = aiResponse.data.choices[0].message;
        console.log(response);

        conversation.push({ role: 'assistant', content: response.content });

        res.send({ response });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .send(error?.response.data.error.message || 'Something went wrong');
    }
});


app.listen(8089, () => console.log('make conversation on http://localhost:8089/chat'));
