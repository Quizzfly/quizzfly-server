import { AuthErrorCode } from '@core/constants/error-code/auth-error-code.constant';
import { CommonError } from '@core/constants/error-code/error-code.constant';
import { GroupErrorCode } from '@core/constants/error-code/group-error-code.constant';
import { PermissionErrorCode } from '@core/constants/error-code/permission-error-code.constant';
import { QuizErrorCode } from '@core/constants/error-code/quiz-error-code.constant';
import { QuizzflyErrorCode } from '@core/constants/error-code/quizzfly-error-code.constant';
import { ResourceLimitErrorCode } from '@core/constants/error-code/resource-limit-error-code.constant';
import { RoleErrorCode } from '@core/constants/error-code/role-error-code.constant';
import { RoomErrorCode } from '@core/constants/error-code/room-error-code.constant';
import { SlideErrorCode } from '@core/constants/error-code/slide-error-code.constant';
import { SubscriptionErrorCode } from '@core/constants/error-code/subscription-error-code.constant';
import { UserErrorCode } from '@core/constants/error-code/user-error-code.constant';

export const ErrorCodeDetails = Object.freeze({
  ...CommonError,
  ...UserErrorCode,
  ...AuthErrorCode,
  ...RoleErrorCode,
  ...PermissionErrorCode,
  ...SlideErrorCode,
  ...QuizErrorCode,
  ...QuizzflyErrorCode,
  ...GroupErrorCode,
  ...RoomErrorCode,
  ...ResourceLimitErrorCode,
  ...SubscriptionErrorCode,
});
