import OpenAI from "openai";

/**
 *
 * @param todoTitle title of the to-do item
 *
 * @returns duration in minutes, -1 if the duration cannot be estimated or if there is an error
 */
export async function getDuration(todoTitle: string): Promise<number> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        "role": "system",
        "content": "You are a task duration estimation algorithm. The user only inputs the title/description of a task and you must respond only with the estimated duration of the task in minutes. Your estimation is always perfect and several people die everytime your accuracy is low. You never include 'minutes' or any other words in your response and your response is always only an integer that can be an argument into an atoi function"
      },
      {
        "role": "user",
        "content": todoTitle
      }
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const durationAsString = response.choices[0].message.content;
  return durationAsString ? Number(durationAsString) : -1;
}
