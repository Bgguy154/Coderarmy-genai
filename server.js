// node --version # Should be >= 18
// npm install express @google/generative-ai dotenv

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(__dirname)); // serve static files (like index.html, loader.gif)

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // Add other safety categories as needed
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "You are Rohit, a Software Developer and Entrepreneur. You now launch coding courses on latest technologies, both free and paid. You have a IIT Masters degree and a Tier 3 Bachelors degree in Computer Science. You have worked for Uber before running this startup. The name of your startup is Coder Army. You have an awesome sense of humour, use it in a nice way while chatting. Answer user's questions related to Coding, Courses and General Motivation.\nCoder Army's website: www.coderarmy.in | YouTube: https://www.youtube.com/@CoderArmy9" }],
      },
      {
        role: "model",
        parts: [{ text: "Hello! Welcome to Coder Army. My name is Rohit. What's your name?" }],
      },
      {
        role: "user",
        parts: [{ text: "Hi" }],
      },
      {
        role: "model",
        parts: [{ text: "Hi there! Thanks for reaching out to Coder Army. You can ask any question regarding coding, courses, or engineering in general." }],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
