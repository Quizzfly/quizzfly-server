import { ErrorCode } from '@core/constants/error-code/error-code.constant';

export const RoomErrorCode: Record<string, string> = {
  [ErrorCode.ROOM_NOT_FOUND]: 'room.error.not_found',
  [ErrorCode.ROOM_PIN_ALREADY_EXISTS]: 'room.error.pin_already_exists',
  [ErrorCode.PARTICIPANT_NOT_FOUND]: 'room.error.participant_not_found',
  [ErrorCode.ONLY_HOST_CAN_KICK_PARTICIPANT]:
    'room.error.only_host_can_kick_participant',
  [ErrorCode.ONLY_HOST_CAN_LOCK_ROOM]: 'room.error.only_host_can_lock_room',
  [ErrorCode.ONLY_HOST_CAN_UNLOCK_ROOM]: 'room.error.only_host_can_unlock_room',
  [ErrorCode.ONLY_HOST_CAN_SETTING_ROOM]:
    'room.error.only_host_can_setting_room',
  [ErrorCode.QUIZ_SESSION_ENDED_CANNOT_MODIFY_SETTINGS]:
    'room.error.quiz_session_ended_cannot_modify_settings',
  [ErrorCode.ONLY_HOST_CAN_START_QUIZ]: 'room.error.only_host_can_start_quiz',
  [ErrorCode.QUIZ_ALREADY_STARTED]: 'room.error.quiz_already_started',
  [ErrorCode.QUESTION_SET_NOT_FOUND]: 'room.error.question_set_not_found',
  [ErrorCode.ONLY_HOST_CAN_GET_NEXT_QUESTION]:
    'room.error.only_host_can_get_next_question',
  [ErrorCode.QUIZ_NOT_STARTED]: 'room.error.quiz_not_started',
  [ErrorCode.PREVIOUS_QUESTION_NOT_FINISHED]:
    'room.error.previous_question_not_finished',
  [ErrorCode.QUIZ_OUT_OF_QUESTIONS]: 'room.error.quiz_out_of_questions',
  [ErrorCode.PARTICIPANT_INVALID]: 'room.error.participant_invalid',
  [ErrorCode.NOT_ALLOWED]: 'room.error.not_allowed',
  [ErrorCode.QUESTION_OVER]: 'room.error.question_over',
  [ErrorCode.QUESTION_ALREADY_ANSWERED]: 'room.error.question_already_answered',
  [ErrorCode.ONLY_OWNER_CAN_PERFORM_ACTION]:
    'room.error.only_owner_can_perform_action',
  [ErrorCode.UNFINISHED_QUESTION]: 'room.error.unfinished_question',
  [ErrorCode.ROOM_LOCKED]: 'room.error.room_locked',
  [ErrorCode.PARTICIPANT_INVALID_OR_TIMEOUT]:
    'room.error.participant_invalid_or_timeout',
};
