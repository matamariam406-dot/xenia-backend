import axios from 'axios';

const API_URL = "https://api.openai.com/v1/chat/completions";

export const sendMessage = async (messages) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4o-mini",
        messages
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`

        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    console.log("ERROR IA:", error?.response?.data || error.message);
    return "Error conectando con IA";
  }
};
