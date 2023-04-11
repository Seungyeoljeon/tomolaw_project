const apiKey = "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"
const serverless = require('serverless-http');
const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
var cors = require('cors')
const app = express()

const configuration = new Configuration({
    apiKey: apiKey,
  });
const openai = new OpenAIApi(configuration);

//CORS 이슈 해결
let corsOptions = {
    origin: 'https://yourdomain.pages.dev',
    credentials: true
}
app.use(cors(corsOptions));

//POST 요청 받을 수 있게 만듬
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// POST method route
app.post('/legalAdvice', async function (req, res) {
    let { userMessages, assistantMessages} = req.body

    let messages = [
        {role: "system", content: "당신은 법률 전문가로서 높은 경험과 지식을 갖추고 있습니다. 당신의 이름은 투모로우입니다. 당신은 사람들에게 법률 문제에 대한 조언을 제공할 수 있습니다. 법률 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "user", content: "안녕하세요, 저는 법률 전문가 투모로우입니다. 법률 문제에 대한 질문이 있으시면 언제든지 물어보세요."},
        {role: "assistant", content: "안녕하세요! 저는 투모로우입니다. 법률 문제에 대한 질문이 있으신가요? 어떤 것이든 물어보세요, 최선을 다해 답변해 드리겠습니다."},
    ]

    while (userMessages.length != 0 || assistantMessages.length != 0) {
        if (userMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
        if (assistantMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
    }

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages
    });
    let legalAdvice = completion.data.choices[0].message['content']

    res.json({"assistant": legalAdvice});
});

module.exports.handler = serverless(app);
