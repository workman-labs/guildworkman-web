/** Deep-link target attached to a notification. */
export interface DeepLink {
    label: string;
    href: string;
}

/** Retry action attached to a notification. */
export interface RetryAction {
    label: string;
    handler: () => Promise<void> | void;
}

export type NotificationType = "pending" | "success" | "error" | "info";

export interface TransactionNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    /** ISO timestamp of when the notification was created. */
    timestamp: string;
    /** Optional deep-link rendered as a button inside the toast / center. */
    deepLink?: DeepLink;
    /** Optional retry action, shown as a button for failed transactions. */
    retryAction?: RetryAction;
}

let _counter = 0;

/** Create a unique, human‑readable notification ID. */
export function createNotificationId(): string {
    _counter += 1;
    return `notif-${Date.now()}-${_counter}`;
}

/** Helper to build a success notification. */
export function successNotification(
    title: string,
    message: string,
    deepLink?: DeepLink
): TransactionNotification {
    return {
        id: createNotificationId(),
        type: "success",
        title,
        message,
        timestamp: new Date().toISOString(),
        deepLink,
    };
}

/** Helper to build an error notification with an optional retry action. */
export function errorNotification(
    title: string,
    message: string,
    retryAction?: RetryAction,
    deepLink?: DeepLink
): TransactionNotification {
    return {
        id: createNotificationId(),
        type: "error",
        title,
        message,
        timestamp: new Date().toISOString(),
        retryAction,
        deepLink,
    };
}

/** Helper to build a pending notification. */
export function pendingNotification(
    title: string,
    message: string
): TransactionNotification {
    return {
        id: createNotificationId(),
        type: "pending",
        title,
        message,
        timestamp: new Date().toISOString(),
    };
}

/** Helper to build an info notification. */
export function infoNotification(
    title: string,
    message: string,
    deepLink?: DeepLink
): TransactionNotification {
    return {
        id: createNotificationId(),
        type: "info",
        title,
        message,
        timestamp: new Date().toISOString(),
        deepLink,
    };
}

