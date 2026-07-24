"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    HiX,
    HiCheckCircle,
    HiExclamationCircle,
    HiClock,
    HiInformationCircle,
} from "react-icons/hi";
import type { TransactionNotification } from "@/lib/notifications";
import { useNotifications } from "./useNotifications";

// ── Icon per type ─────────────────────────────────────────────────
function TypeIcon({ type }: { type: TransactionNotification["type"] }) {
    switch (type) {
        case "success":
            return <HiCheckCircle aria-hidden className="text-lg text-ok" />;
        case "error":
            return <HiExclamationCircle aria-hidden className="text-lg text-err" />;
        case "pending":
            return <HiClock aria-hidden className="text-lg text-gold-deep" />;
        case "info":
            return <HiInformationCircle aria-hidden className="text-lg text-navy-2" />;
    }
}

// ── Single toast card ──────────────────────────────────────────────
function ToastCard({
    notification,
    onDismiss,
}: {
    notification: TransactionNotification;
    onDismiss: (id: string) => void;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation on mount
        requestAnimationFrame(() => setVisible(true));
    }, []);

    const dismiss = useCallback(() => {
        setVisible(false);
        setTimeout(() => onDismiss(notification.id), 200);
    }, [notification.id, onDismiss]);

    const borderColor = {
        success: "border-l-ok",
        error: "border-l-err",
        pending: "border-l-gold",
        info: "border-l-navy-2",
    }[notification.type];

    return (
        <div
            role="alert"
            className={`w-full max-w-sm rounded-xl border border-line bg-surface shadow-float backdrop-blur-md transition-all duration-300 ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                } ${borderColor} border-l-4`}
        >
            <div className="flex items-start gap-3 p-4">
                <TypeIcon type={notification.type} />

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{notification.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{notification.message}</p>

                    {/* Action buttons — shown for error toasts mostly */}
                    {(notification.retryAction || notification.deepLink) && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {notification.retryAction && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        void notification.retryAction!.handler();
                                        dismiss();
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg bg-navy-tint px-3 py-1.5 text-xs font-semibold text-navy-2 transition-colors hover:bg-navy/15"
                                >
                                    {notification.retryAction.label}
                                </button>
                            )}
                            {notification.deepLink && (
                                <Link
                                    href={notification.deepLink.href}
                                    onClick={dismiss}
                                    className="inline-flex items-center gap-1 rounded-lg bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-deep transition-colors hover:bg-gold/25"
                                >
                                    {notification.deepLink.label}
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={dismiss}
                    aria-label="Dismiss notification"
                    className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-line/70"
                >
                    <HiX aria-hidden className="text-sm" />
                </button>
            </div>
        </div>
    );
}

// ── Toast stack (floating container) ───────────────────────────────
export default function NotificationToast() {
    const { notifications, dismissNotification } = useNotifications();

    // Only show the 3 most recent notifications to avoid clutter
    const visible = notifications.slice(-3);

    if (visible.length === 0) return null;

    return (
        <div
            aria-live="polite"
            aria-label="Notifications"
            className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col-reverse items-end gap-3"
        >
            {visible.map((n) => (
                <div key={n.id} className="pointer-events-auto">
                    <ToastCard notification={n} onDismiss={dismissNotification} />
                </div>
            ))}
        </div>
    );
}

