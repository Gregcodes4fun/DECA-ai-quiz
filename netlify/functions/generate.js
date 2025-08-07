const fetch = require("node-fetch");

exports.handler = async function (event) {
  const { messages } = JSON.parse(event.body);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "ft:gpt-3.5-turbo-0125:personal::C1PvYFmr",
        messages: messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI API failed" }),
    };
  }
};
