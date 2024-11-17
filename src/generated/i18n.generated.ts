/* DO NOT EDIT, file generated by nestjs-i18n */
  
/* eslint-disable */
/* prettier-ignore */
import { Path } from "nestjs-i18n";
/* prettier-ignore */
export type I18nTranslations = {
    "auth": {
        "error": {
            "invalid_credentials": string;
            "unauthorized": string;
            "token_expired": string;
            "token_invalid": string;
            "access_denied": string;
            "refresh_token_invalid": string;
            "account_locked": string;
            "account_disabled": string;
            "forbidden": string;
            "account_not_registered": string;
            "account_not_activated": string;
            "account_already_activated": string;
            "old_password_is_incorrect": string;
        };
    };
    "common": {
        "validation": {
            "error": string;
        };
        "error": {
            "internal_server_error": string;
            "entity_not_found": string;
        };
    };
    "group": {
        "error": {
            "not_found": string;
            "user_is_already_in_group": string;
        };
    };
    "quiz": {
        "error": {
            "not_found": string;
        };
    };
    "quizzfly": {
        "error": {
            "not_found": string;
        };
    };
    "room": {
        "error": {
            "not_found": string;
        };
    };
    "slide": {
        "error": {
            "not_found": string;
        };
    };
    "user": {
        "unique": {
            "username": string;
            "email": string;
        };
        "validation": {
            "is_empty": string;
        };
        "error": {
            "username_or_email_exists": string;
            "email_exists": string;
            "not_found": string;
            "code_is_incorrect": string;
            "invalid_password": string;
            "invalid_token": string;
            "request_delete_account_is_invalid": string;
        };
    };
};
/* prettier-ignore */
export type I18nPath = Path<I18nTranslations>;
