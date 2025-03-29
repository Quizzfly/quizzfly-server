import { GenerateQuizByAiReqDto } from '@modules/quiz/dto/request/generate-quiz-by-ai.req.dto';
import { OptionDto } from '@modules/quiz/dto/request/option-generate-quiz-by-ai.req.dto';
import OpenAI from 'openai';
import { generateQuiz, generateSummaryPrompt } from './gemini.ai';

export class CommonFunction {
  static async generateCode(lengthCode: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < lengthCode) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  static async generateRoomPin() {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 6) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  static async genByHyperbolic(
    language: string,
    quizzes: string,
    option: OptionDto,
    model: string,
  ) {
    const prompt = generateSummaryPrompt(language, quizzes, option);
    const client = new OpenAI({
      apiKey: process.env.HYPERBOLIC_API_KEY,
      baseURL: 'https://api.hyperbolic.xyz/v1',
    });
    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: model || 'meta-llama/Meta-Llama-3-70B-Instruct',
    });

    const output = response.choices[0].message.content;
    return output;
  }

  static async generateQuizByAI(dto: GenerateQuizByAiReqDto) {
    let responseText = '';

    if (dto.model && dto.model !== 'gemini') {
      responseText =
        (await CommonFunction.genByHyperbolic(
          dto.language,
          dto.quizzes.join(','),
          dto.option,
          dto.model,
        )) || '';
    } else {
      responseText =
        (await generateQuiz(
          dto.language,
          dto.quizzes ? dto.quizzes.join(',') : '',
          dto.option,
        )) || '';
    }

    responseText = responseText
      ?.replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(responseText);
  }
}
