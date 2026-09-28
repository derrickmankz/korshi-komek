import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AcceptOfferInput, ActivityEvent, AdminDeleteTask200, AdminDeleteUser200, AdminListTasksParams, AdminListUsersParams, AdminStats, AdminUpdateUserInput, AdminWalletCreditInput, AuthLoginInput, AuthLogout200, AuthRegisterInput, DashboardSummary, EmailVerificationResponse, GetMyNotifications200, HealthStatus, ListTaskMessages200, ListTasksParams, MessageResponse, NewOfferInput, NewReviewInput, NewTaskInput, Offer, ResendVerificationInput, Review, SendMessageInput, Task, TaskDetail, TaskMessage, TelegramStatus, UpdateMeInput, User, UserProfile, VerifyEmailParams, Wallet } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Регистрация нового пользователя
 */
export declare const getAuthRegisterUrl: () => string;
export declare const authRegister: (authRegisterInput: AuthRegisterInput, options?: RequestInit) => Promise<EmailVerificationResponse>;
export declare const getAuthRegisterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authRegister>>, TError, {
        data: BodyType<AuthRegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof authRegister>>, TError, {
    data: BodyType<AuthRegisterInput>;
}, TContext>;
export type AuthRegisterMutationResult = NonNullable<Awaited<ReturnType<typeof authRegister>>>;
export type AuthRegisterMutationBody = BodyType<AuthRegisterInput>;
export type AuthRegisterMutationError = ErrorType<unknown>;
/**
 * @summary Регистрация нового пользователя
 */
export declare const useAuthRegister: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authRegister>>, TError, {
        data: BodyType<AuthRegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof authRegister>>, TError, {
    data: BodyType<AuthRegisterInput>;
}, TContext>;
/**
 * @summary Подтвердить email по ссылке
 */
export declare const getVerifyEmailUrl: (params: VerifyEmailParams) => string;
export declare const verifyEmail: (params: VerifyEmailParams, options?: RequestInit) => Promise<unknown>;
export declare const getVerifyEmailQueryKey: (params?: VerifyEmailParams) => readonly ["/api/auth/verify-email", ...VerifyEmailParams[]];
export declare const getVerifyEmailQueryOptions: <TData = Awaited<ReturnType<typeof verifyEmail>>, TError = ErrorType<void>>(params: VerifyEmailParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyEmail>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof verifyEmail>>, TError, TData> & {
    queryKey: QueryKey;
};
export type VerifyEmailQueryResult = NonNullable<Awaited<ReturnType<typeof verifyEmail>>>;
export type VerifyEmailQueryError = ErrorType<void>;
/**
 * @summary Подтвердить email по ссылке
 */
export declare function useVerifyEmail<TData = Awaited<ReturnType<typeof verifyEmail>>, TError = ErrorType<void>>(params: VerifyEmailParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyEmail>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Повторно отправить письмо с подтверждением email
 */
export declare const getResendVerificationUrl: () => string;
export declare const resendVerification: (resendVerificationInput: ResendVerificationInput, options?: RequestInit) => Promise<MessageResponse>;
export declare const getResendVerificationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resendVerification>>, TError, {
        data: BodyType<ResendVerificationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resendVerification>>, TError, {
    data: BodyType<ResendVerificationInput>;
}, TContext>;
export type ResendVerificationMutationResult = NonNullable<Awaited<ReturnType<typeof resendVerification>>>;
export type ResendVerificationMutationBody = BodyType<ResendVerificationInput>;
export type ResendVerificationMutationError = ErrorType<unknown>;
/**
 * @summary Повторно отправить письмо с подтверждением email
 */
export declare const useResendVerification: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resendVerification>>, TError, {
        data: BodyType<ResendVerificationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resendVerification>>, TError, {
    data: BodyType<ResendVerificationInput>;
}, TContext>;
/**
 * @summary Вход по email
 */
export declare const getAuthLoginUrl: () => string;
export declare const authLogin: (authLoginInput: AuthLoginInput, options?: RequestInit) => Promise<User>;
export declare const getAuthLoginMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authLogin>>, TError, {
        data: BodyType<AuthLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof authLogin>>, TError, {
    data: BodyType<AuthLoginInput>;
}, TContext>;
export type AuthLoginMutationResult = NonNullable<Awaited<ReturnType<typeof authLogin>>>;
export type AuthLoginMutationBody = BodyType<AuthLoginInput>;
export type AuthLoginMutationError = ErrorType<unknown>;
/**
 * @summary Вход по email
 */
export declare const useAuthLogin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authLogin>>, TError, {
        data: BodyType<AuthLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof authLogin>>, TError, {
    data: BodyType<AuthLoginInput>;
}, TContext>;
/**
 * @summary Войти как демо-пользователь
 */
export declare const getAuthDemoUrl: () => string;
export declare const authDemo: (options?: RequestInit) => Promise<User>;
export declare const getAuthDemoMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authDemo>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof authDemo>>, TError, void, TContext>;
export type AuthDemoMutationResult = NonNullable<Awaited<ReturnType<typeof authDemo>>>;
export type AuthDemoMutationError = ErrorType<unknown>;
/**
 * @summary Войти как демо-пользователь
 */
export declare const useAuthDemo: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authDemo>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof authDemo>>, TError, void, TContext>;
/**
 * @summary Выйти из аккаунта
 */
export declare const getAuthLogoutUrl: () => string;
export declare const authLogout: (options?: RequestInit) => Promise<AuthLogout200>;
export declare const getAuthLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof authLogout>>, TError, void, TContext>;
export type AuthLogoutMutationResult = NonNullable<Awaited<ReturnType<typeof authLogout>>>;
export type AuthLogoutMutationError = ErrorType<unknown>;
/**
 * @summary Выйти из аккаунта
 */
export declare const useAuthLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof authLogout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof authLogout>>, TError, void, TContext>;
/**
 * @summary Текущий пользователь
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<unknown>;
/**
 * @summary Текущий пользователь
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Обновить профиль
 */
export declare const getUpdateMeUrl: () => string;
export declare const updateMe: (updateMeInput: UpdateMeInput, options?: RequestInit) => Promise<User>;
export declare const getUpdateMeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UpdateMeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UpdateMeInput>;
}, TContext>;
export type UpdateMeMutationResult = NonNullable<Awaited<ReturnType<typeof updateMe>>>;
export type UpdateMeMutationBody = BodyType<UpdateMeInput>;
export type UpdateMeMutationError = ErrorType<unknown>;
/**
 * @summary Обновить профиль
 */
export declare const useUpdateMe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<UpdateMeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<UpdateMeInput>;
}, TContext>;
/**
 * @summary Состояние привязки Telegram
 */
export declare const getGetTelegramStatusUrl: () => string;
export declare const getTelegramStatus: (options?: RequestInit) => Promise<TelegramStatus>;
export declare const getGetTelegramStatusQueryKey: () => readonly ["/api/me/telegram"];
export declare const getGetTelegramStatusQueryOptions: <TData = Awaited<ReturnType<typeof getTelegramStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTelegramStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTelegramStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTelegramStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getTelegramStatus>>>;
export type GetTelegramStatusQueryError = ErrorType<unknown>;
/**
 * @summary Состояние привязки Telegram
 */
export declare function useGetTelegramStatus<TData = Awaited<ReturnType<typeof getTelegramStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTelegramStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Сгенерировать код привязки Telegram
 */
export declare const getCreateTelegramLinkTokenUrl: () => string;
export declare const createTelegramLinkToken: (options?: RequestInit) => Promise<TelegramStatus>;
export declare const getCreateTelegramLinkTokenMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTelegramLinkToken>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTelegramLinkToken>>, TError, void, TContext>;
export type CreateTelegramLinkTokenMutationResult = NonNullable<Awaited<ReturnType<typeof createTelegramLinkToken>>>;
export type CreateTelegramLinkTokenMutationError = ErrorType<unknown>;
/**
 * @summary Сгенерировать код привязки Telegram
 */
export declare const useCreateTelegramLinkToken: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTelegramLinkToken>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTelegramLinkToken>>, TError, void, TContext>;
/**
 * @summary Отвязать Telegram
 */
export declare const getUnlinkTelegramUrl: () => string;
export declare const unlinkTelegram: (options?: RequestInit) => Promise<TelegramStatus>;
export declare const getUnlinkTelegramMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unlinkTelegram>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof unlinkTelegram>>, TError, void, TContext>;
export type UnlinkTelegramMutationResult = NonNullable<Awaited<ReturnType<typeof unlinkTelegram>>>;
export type UnlinkTelegramMutationError = ErrorType<unknown>;
/**
 * @summary Отвязать Telegram
 */
export declare const useUnlinkTelegram: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unlinkTelegram>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof unlinkTelegram>>, TError, void, TContext>;
/**
 * @summary Профиль пользователя с рейтингом и отзывами
 */
export declare const getGetUserUrl: (id: string) => string;
export declare const getUser: (id: string, options?: RequestInit) => Promise<UserProfile>;
export declare const getGetUserQueryKey: (id: string) => readonly [`/api/users/${string}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<unknown>;
/**
 * @summary Профиль пользователя с рейтингом и отзывами
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Лента заданий поблизости
 */
export declare const getListTasksUrl: (params?: ListTasksParams) => string;
export declare const listTasks: (params?: ListTasksParams, options?: RequestInit) => Promise<Task[]>;
export declare const getListTasksQueryKey: (params?: ListTasksParams) => readonly ["/api/tasks", ...ListTasksParams[]];
export declare const getListTasksQueryOptions: <TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listTasks>>>;
export type ListTasksQueryError = ErrorType<unknown>;
/**
 * @summary Лента заданий поблизости
 */
export declare function useListTasks<TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Создать задание
 */
export declare const getCreateTaskUrl: () => string;
export declare const createTask: (newTaskInput: NewTaskInput, options?: RequestInit) => Promise<Task>;
export declare const getCreateTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<NewTaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<NewTaskInput>;
}, TContext>;
export type CreateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof createTask>>>;
export type CreateTaskMutationBody = BodyType<NewTaskInput>;
export type CreateTaskMutationError = ErrorType<unknown>;
/**
 * @summary Создать задание
 */
export declare const useCreateTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<NewTaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<NewTaskInput>;
}, TContext>;
/**
 * @summary Детали задания
 */
export declare const getGetTaskUrl: (id: string) => string;
export declare const getTask: (id: string, options?: RequestInit) => Promise<TaskDetail>;
export declare const getGetTaskQueryKey: (id: string) => readonly [`/api/tasks/${string}`];
export declare const getGetTaskQueryOptions: <TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTaskQueryResult = NonNullable<Awaited<ReturnType<typeof getTask>>>;
export type GetTaskQueryError = ErrorType<unknown>;
/**
 * @summary Детали задания
 */
export declare function useGetTask<TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Отклики на задание
 */
export declare const getListOffersUrl: (id: string) => string;
export declare const listOffers: (id: string, options?: RequestInit) => Promise<Offer[]>;
export declare const getListOffersQueryKey: (id: string) => readonly [`/api/tasks/${string}/offers`];
export declare const getListOffersQueryOptions: <TData = Awaited<ReturnType<typeof listOffers>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOffers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOffers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOffersQueryResult = NonNullable<Awaited<ReturnType<typeof listOffers>>>;
export type ListOffersQueryError = ErrorType<unknown>;
/**
 * @summary Отклики на задание
 */
export declare function useListOffers<TData = Awaited<ReturnType<typeof listOffers>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOffers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Откликнуться на задание (исполнитель назначает свою цену)
 */
export declare const getCreateOfferUrl: (id: string) => string;
export declare const createOffer: (id: string, newOfferInput: NewOfferInput, options?: RequestInit) => Promise<Offer>;
export declare const getCreateOfferMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOffer>>, TError, {
        id: string;
        data: BodyType<NewOfferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOffer>>, TError, {
    id: string;
    data: BodyType<NewOfferInput>;
}, TContext>;
export type CreateOfferMutationResult = NonNullable<Awaited<ReturnType<typeof createOffer>>>;
export type CreateOfferMutationBody = BodyType<NewOfferInput>;
export type CreateOfferMutationError = ErrorType<unknown>;
/**
 * @summary Откликнуться на задание (исполнитель назначает свою цену)
 */
export declare const useCreateOffer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOffer>>, TError, {
        id: string;
        data: BodyType<NewOfferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOffer>>, TError, {
    id: string;
    data: BodyType<NewOfferInput>;
}, TContext>;
/**
 * @summary Принять отклик исполнителя и заморозить деньги в безопасной сделке
 */
export declare const getAcceptOfferUrl: (id: string) => string;
export declare const acceptOffer: (id: string, acceptOfferInput: AcceptOfferInput, options?: RequestInit) => Promise<TaskDetail>;
export declare const getAcceptOfferMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof acceptOffer>>, TError, {
        id: string;
        data: BodyType<AcceptOfferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof acceptOffer>>, TError, {
    id: string;
    data: BodyType<AcceptOfferInput>;
}, TContext>;
export type AcceptOfferMutationResult = NonNullable<Awaited<ReturnType<typeof acceptOffer>>>;
export type AcceptOfferMutationBody = BodyType<AcceptOfferInput>;
export type AcceptOfferMutationError = ErrorType<unknown>;
/**
 * @summary Принять отклик исполнителя и заморозить деньги в безопасной сделке
 */
export declare const useAcceptOffer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof acceptOffer>>, TError, {
        id: string;
        data: BodyType<AcceptOfferInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof acceptOffer>>, TError, {
    id: string;
    data: BodyType<AcceptOfferInput>;
}, TContext>;
/**
 * @summary Исполнитель отмечает «Я закончил, ждёт проверки»
 */
export declare const getMarkTaskReadyUrl: (id: string) => string;
export declare const markTaskReady: (id: string, options?: RequestInit) => Promise<TaskDetail>;
export declare const getMarkTaskReadyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markTaskReady>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markTaskReady>>, TError, {
    id: string;
}, TContext>;
export type MarkTaskReadyMutationResult = NonNullable<Awaited<ReturnType<typeof markTaskReady>>>;
export type MarkTaskReadyMutationError = ErrorType<unknown>;
/**
 * @summary Исполнитель отмечает «Я закончил, ждёт проверки»
 */
export declare const useMarkTaskReady: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markTaskReady>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markTaskReady>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Подтвердить оплату через Kaspi/Halyk — завершает задание и открывает отзыв
 */
export declare const getConfirmPaymentUrl: (id: string) => string;
export declare const confirmPayment: (id: string, options?: RequestInit) => Promise<TaskDetail>;
export declare const getConfirmPaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmPayment>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof confirmPayment>>, TError, {
    id: string;
}, TContext>;
export type ConfirmPaymentMutationResult = NonNullable<Awaited<ReturnType<typeof confirmPayment>>>;
export type ConfirmPaymentMutationError = ErrorType<unknown>;
/**
 * @summary Подтвердить оплату через Kaspi/Halyk — завершает задание и открывает отзыв
 */
export declare const useConfirmPayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmPayment>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof confirmPayment>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Принять работу (переводит в статус awaiting_payment — ожидание оплаты)
 */
export declare const getCompleteTaskUrl: (id: string) => string;
export declare const completeTask: (id: string, options?: RequestInit) => Promise<TaskDetail>;
export declare const getCompleteTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeTask>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof completeTask>>, TError, {
    id: string;
}, TContext>;
export type CompleteTaskMutationResult = NonNullable<Awaited<ReturnType<typeof completeTask>>>;
export type CompleteTaskMutationError = ErrorType<unknown>;
/**
 * @summary Принять работу (переводит в статус awaiting_payment — ожидание оплаты)
 */
export declare const useCompleteTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof completeTask>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof completeTask>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Отменить задание (возврат средств заказчику)
 */
export declare const getCancelTaskUrl: (id: string) => string;
export declare const cancelTask: (id: string, options?: RequestInit) => Promise<TaskDetail>;
export declare const getCancelTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelTask>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof cancelTask>>, TError, {
    id: string;
}, TContext>;
export type CancelTaskMutationResult = NonNullable<Awaited<ReturnType<typeof cancelTask>>>;
export type CancelTaskMutationError = ErrorType<unknown>;
/**
 * @summary Отменить задание (возврат средств заказчику)
 */
export declare const useCancelTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelTask>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof cancelTask>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Оставить отзыв после выполнения
 */
export declare const getCreateReviewUrl: (id: string) => string;
export declare const createReview: (id: string, newReviewInput: NewReviewInput, options?: RequestInit) => Promise<Review>;
export declare const getCreateReviewMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReview>>, TError, {
        id: string;
        data: BodyType<NewReviewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createReview>>, TError, {
    id: string;
    data: BodyType<NewReviewInput>;
}, TContext>;
export type CreateReviewMutationResult = NonNullable<Awaited<ReturnType<typeof createReview>>>;
export type CreateReviewMutationBody = BodyType<NewReviewInput>;
export type CreateReviewMutationError = ErrorType<unknown>;
/**
 * @summary Оставить отзыв после выполнения
 */
export declare const useCreateReview: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReview>>, TError, {
        id: string;
        data: BodyType<NewReviewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createReview>>, TError, {
    id: string;
    data: BodyType<NewReviewInput>;
}, TContext>;
/**
 * @summary Получить сообщения чата по заданию
 */
export declare const getListTaskMessagesUrl: (id: string) => string;
export declare const listTaskMessages: (id: string, options?: RequestInit) => Promise<ListTaskMessages200>;
export declare const getListTaskMessagesQueryKey: (id: string) => readonly [`/api/tasks/${string}/messages`];
export declare const getListTaskMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listTaskMessages>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTaskMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTaskMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTaskMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listTaskMessages>>>;
export type ListTaskMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Получить сообщения чата по заданию
 */
export declare function useListTaskMessages<TData = Awaited<ReturnType<typeof listTaskMessages>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTaskMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Отправить сообщение в чат задания
 */
export declare const getSendTaskMessageUrl: (id: string) => string;
export declare const sendTaskMessage: (id: string, sendMessageInput: SendMessageInput, options?: RequestInit) => Promise<TaskMessage>;
export declare const getSendTaskMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendTaskMessage>>, TError, {
        id: string;
        data: BodyType<SendMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendTaskMessage>>, TError, {
    id: string;
    data: BodyType<SendMessageInput>;
}, TContext>;
export type SendTaskMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendTaskMessage>>>;
export type SendTaskMessageMutationBody = BodyType<SendMessageInput>;
export type SendTaskMessageMutationError = ErrorType<unknown>;
/**
 * @summary Отправить сообщение в чат задания
 */
export declare const useSendTaskMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendTaskMessage>>, TError, {
        id: string;
        data: BodyType<SendMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendTaskMessage>>, TError, {
    id: string;
    data: BodyType<SendMessageInput>;
}, TContext>;
/**
 * @summary Лента уведомлений для текущего пользователя (по его заданиям)
 */
export declare const getGetMyNotificationsUrl: () => string;
export declare const getMyNotifications: (options?: RequestInit) => Promise<GetMyNotifications200>;
export declare const getGetMyNotificationsQueryKey: () => readonly ["/api/my/notifications"];
export declare const getGetMyNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof getMyNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyNotifications>>>;
export type GetMyNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary Лента уведомлений для текущего пользователя (по его заданиям)
 */
export declare function useGetMyNotifications<TData = Awaited<ReturnType<typeof getMyNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Задания, которые я создал
 */
export declare const getListMyTasksUrl: () => string;
export declare const listMyTasks: (options?: RequestInit) => Promise<Task[]>;
export declare const getListMyTasksQueryKey: () => readonly ["/api/my/tasks"];
export declare const getListMyTasksQueryOptions: <TData = Awaited<ReturnType<typeof listMyTasks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMyTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listMyTasks>>>;
export type ListMyTasksQueryError = ErrorType<unknown>;
/**
 * @summary Задания, которые я создал
 */
export declare function useListMyTasks<TData = Awaited<ReturnType<typeof listMyTasks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMyTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Задания, которые я выполняю или выполнил
 */
export declare const getListMyJobsUrl: () => string;
export declare const listMyJobs: (options?: RequestInit) => Promise<Task[]>;
export declare const getListMyJobsQueryKey: () => readonly ["/api/my/jobs"];
export declare const getListMyJobsQueryOptions: <TData = Awaited<ReturnType<typeof listMyJobs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMyJobs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMyJobs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMyJobsQueryResult = NonNullable<Awaited<ReturnType<typeof listMyJobs>>>;
export type ListMyJobsQueryError = ErrorType<unknown>;
/**
 * @summary Задания, которые я выполняю или выполнил
 */
export declare function useListMyJobs<TData = Awaited<ReturnType<typeof listMyJobs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMyJobs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Баланс кошелька и история операций безопасной сделки
 */
export declare const getGetWalletUrl: () => string;
export declare const getWallet: (options?: RequestInit) => Promise<Wallet>;
export declare const getGetWalletQueryKey: () => readonly ["/api/wallet"];
export declare const getGetWalletQueryOptions: <TData = Awaited<ReturnType<typeof getWallet>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWalletQueryResult = NonNullable<Awaited<ReturnType<typeof getWallet>>>;
export type GetWalletQueryError = ErrorType<unknown>;
/**
 * @summary Баланс кошелька и история операций безопасной сделки
 */
export declare function useGetWallet<TData = Awaited<ReturnType<typeof getWallet>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Сводка для главной — счётчики по категориям, активные задания, рейтинг района
 */
export declare const getGetDashboardSummaryUrl: () => string;
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Сводка для главной — счётчики по категориям, активные задания, рейтинг района
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Лента последних событий района
 */
export declare const getGetRecentActivityUrl: () => string;
export declare const getRecentActivity: (options?: RequestInit) => Promise<ActivityEvent[]>;
export declare const getGetRecentActivityQueryKey: () => readonly ["/api/dashboard/activity"];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<unknown>;
/**
 * @summary Лента последних событий района
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Список всех пользователей (только для администраторов)
 */
export declare const getAdminListUsersUrl: (params?: AdminListUsersParams) => string;
export declare const adminListUsers: (params?: AdminListUsersParams, options?: RequestInit) => Promise<User[]>;
export declare const getAdminListUsersQueryKey: (params?: AdminListUsersParams) => readonly ["/api/admin/users", ...AdminListUsersParams[]];
export declare const getAdminListUsersQueryOptions: <TData = Awaited<ReturnType<typeof adminListUsers>>, TError = ErrorType<unknown>>(params?: AdminListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof adminListUsers>>>;
export type AdminListUsersQueryError = ErrorType<unknown>;
/**
 * @summary Список всех пользователей (только для администраторов)
 */
export declare function useAdminListUsers<TData = Awaited<ReturnType<typeof adminListUsers>>, TError = ErrorType<unknown>>(params?: AdminListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Удалить пользователя
 */
export declare const getAdminDeleteUserUrl: (id: string) => string;
export declare const adminDeleteUser: (id: string, options?: RequestInit) => Promise<AdminDeleteUser200>;
export declare const getAdminDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
    id: string;
}, TContext>;
export type AdminDeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteUser>>>;
export type AdminDeleteUserMutationError = ErrorType<unknown>;
/**
 * @summary Удалить пользователя
 */
export declare const useAdminDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteUser>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Обновить пользователя (имя, isAdmin)
 */
export declare const getAdminUpdateUserUrl: (id: string) => string;
export declare const adminUpdateUser: (id: string, adminUpdateUserInput: AdminUpdateUserInput, options?: RequestInit) => Promise<User>;
export declare const getAdminUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
        id: string;
        data: BodyType<AdminUpdateUserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
    id: string;
    data: BodyType<AdminUpdateUserInput>;
}, TContext>;
export type AdminUpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateUser>>>;
export type AdminUpdateUserMutationBody = BodyType<AdminUpdateUserInput>;
export type AdminUpdateUserMutationError = ErrorType<unknown>;
/**
 * @summary Обновить пользователя (имя, isAdmin)
 */
export declare const useAdminUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
        id: string;
        data: BodyType<AdminUpdateUserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateUser>>, TError, {
    id: string;
    data: BodyType<AdminUpdateUserInput>;
}, TContext>;
/**
 * @summary Список всех заданий (только для администраторов)
 */
export declare const getAdminListTasksUrl: (params?: AdminListTasksParams) => string;
export declare const adminListTasks: (params?: AdminListTasksParams, options?: RequestInit) => Promise<Task[]>;
export declare const getAdminListTasksQueryKey: (params?: AdminListTasksParams) => readonly ["/api/admin/tasks", ...AdminListTasksParams[]];
export declare const getAdminListTasksQueryOptions: <TData = Awaited<ReturnType<typeof adminListTasks>>, TError = ErrorType<unknown>>(params?: AdminListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminListTasks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminListTasksQueryResult = NonNullable<Awaited<ReturnType<typeof adminListTasks>>>;
export type AdminListTasksQueryError = ErrorType<unknown>;
/**
 * @summary Список всех заданий (только для администраторов)
 */
export declare function useAdminListTasks<TData = Awaited<ReturnType<typeof adminListTasks>>, TError = ErrorType<unknown>>(params?: AdminListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminListTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Удалить/отменить задание
 */
export declare const getAdminDeleteTaskUrl: (id: string) => string;
export declare const adminDeleteTask: (id: string, options?: RequestInit) => Promise<AdminDeleteTask200>;
export declare const getAdminDeleteTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteTask>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminDeleteTask>>, TError, {
    id: string;
}, TContext>;
export type AdminDeleteTaskMutationResult = NonNullable<Awaited<ReturnType<typeof adminDeleteTask>>>;
export type AdminDeleteTaskMutationError = ErrorType<unknown>;
/**
 * @summary Удалить/отменить задание
 */
export declare const useAdminDeleteTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminDeleteTask>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminDeleteTask>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Пополнить кошелёк пользователя вручную
 */
export declare const getAdminWalletCreditUrl: () => string;
export declare const adminWalletCredit: (adminWalletCreditInput: AdminWalletCreditInput, options?: RequestInit) => Promise<User>;
export declare const getAdminWalletCreditMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminWalletCredit>>, TError, {
        data: BodyType<AdminWalletCreditInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminWalletCredit>>, TError, {
    data: BodyType<AdminWalletCreditInput>;
}, TContext>;
export type AdminWalletCreditMutationResult = NonNullable<Awaited<ReturnType<typeof adminWalletCredit>>>;
export type AdminWalletCreditMutationBody = BodyType<AdminWalletCreditInput>;
export type AdminWalletCreditMutationError = ErrorType<unknown>;
/**
 * @summary Пополнить кошелёк пользователя вручную
 */
export declare const useAdminWalletCredit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminWalletCredit>>, TError, {
        data: BodyType<AdminWalletCreditInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminWalletCredit>>, TError, {
    data: BodyType<AdminWalletCreditInput>;
}, TContext>;
/**
 * @summary Статистика платформы для администратора
 */
export declare const getAdminGetStatsUrl: () => string;
export declare const adminGetStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getAdminGetStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getAdminGetStatsQueryOptions: <TData = Awaited<ReturnType<typeof adminGetStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetStatsQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetStats>>>;
export type AdminGetStatsQueryError = ErrorType<unknown>;
/**
 * @summary Статистика платформы для администратора
 */
export declare function useAdminGetStats<TData = Awaited<ReturnType<typeof adminGetStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Топ помощников района по рейтингу
 */
export declare const getGetTopHelpersUrl: () => string;
export declare const getTopHelpers: (options?: RequestInit) => Promise<User[]>;
export declare const getGetTopHelpersQueryKey: () => readonly ["/api/dashboard/top-helpers"];
export declare const getGetTopHelpersQueryOptions: <TData = Awaited<ReturnType<typeof getTopHelpers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopHelpers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTopHelpers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTopHelpersQueryResult = NonNullable<Awaited<ReturnType<typeof getTopHelpers>>>;
export type GetTopHelpersQueryError = ErrorType<unknown>;
/**
 * @summary Топ помощников района по рейтингу
 */
export declare function useGetTopHelpers<TData = Awaited<ReturnType<typeof getTopHelpers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopHelpers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map