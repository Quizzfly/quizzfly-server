import {
  AnswerStatistic,
  ResultAnswer,
} from '@modules/room/model/participant.model';

export const calculateResult = (resultAnswer: ResultAnswer) => {
  const statistic: AnswerStatistic = {
    correctCount: 0,
    incorrectCount: 0,
    unansweredCount: 0,
  };

  Object.values(resultAnswer).forEach((result) => {
    if (result.isCorrect) {
      statistic.correctCount++;
    } else {
      statistic.incorrectCount++;
    }

    if (!result.chosenAnswerId) statistic.unansweredCount++;
  });

  return statistic;
};
