export enum RoomEvent {
  // request event
  CREATE_ROOM = 'createRoom',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  KICK_PARTICIPANT = 'kickParticipant',
  LOCK_ROOM = 'lockRoom',
  UNLOCK_ROOM = 'unlockRoom',
  SETTING_ROOM = 'settingRoom',
  START_QUIZ = 'startQuiz',
  NEXT_QUESTION = 'nextQuestion',
  ANSWER_QUESTION = 'answerQuestion',
  FINISH_QUESTION = 'finishQuestion',
  UPDATE_LEADERBOARD = 'updateLeaderboard',

  // response event
  ROOM_CREATED = 'roomCreated',
  PARTICIPANT_JOINED = 'participantJoined',
  PARTICIPANT_LEFT = 'participantLeft',
  PARTICIPANT_KICKED = 'participantKicked',
  ROOM_LOCKED = 'roomLocked',
  QUIZ_STARTED = 'quizStarted',
  RESULT_ANSWER = 'resultAnswer',
  SUMMARY_ANSWER = 'summaryAnswer',
  ROOM_CANCELED = 'roomCanceled',
}
