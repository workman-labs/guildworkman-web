"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HiBell, HiX, HiTrash } from "react-icons/hi";
import type { TransactionNotification } from "@/lib/notifications";
import { useNotifications } from "./useNotifications";

// ── Small icon per type ──────────────────────────────────────────
function TypeDot({ type }: { type: TransactionNotification["type"] }) {
    const dotColor = {
        success: "bg-ok",
        error: "bg-err",
        pending: "bg-gold",
        info: "bg-navy-2",
    }[type];
    return <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />;
}

// ── Relative time helper ──────────────────────────────────────────
function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// ── Single notification row ──────────────────────────────────────
function NotificationRow({
    notification,
    onDismiss,
}: {
    notification: TransactionNotification;
    onDismiss: (id: string) => void;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0">
            <TypeDot type={notification.type} />

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{notification.title}</p>
                <p className="mt-0.5 text-xs text-muted">{notification.message}</p>
                <p className="mt-1 text-[10px] text-muted">{timeAgo(notification.timestamp)}</p>

                {/* Action buttons */}
                {(notification.retryAction || notification.deepLink) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {notification.retryAction && (
                            <button
                                type="button"
                                onClick={() => {
                                    void notification.retryAction!.handler();
                                    onDismiss(notification.id);
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-navy-tint px-2.5 py-1 text-[11px] font-semibold text-navy-2 transition-colors hover:bg-navy/15"
                            >
                                {notification.retryAction.label}
                            </button>
                        )}
                        {notification.deepLink && (
                            <Link
                                href={notification.deepLink.href}
                                onClick={() => onDismiss(notification.id)}
                                className="inline-flex items-center gap-1 rounded-md bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold-deep transition-colors hover:bg-gold/25"
                            >
                                {notification.deepLink.label}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => onDismiss(notification.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-line/70"
            >
                <HiX aria-hidden className="text-xs" />
            </button>
        </div>
    );
}

// ── Notification center bell + dropdown ──────────────────────────
export default function NotificationCenter() {
    const { notifications, dismissNotification, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // Close on outside click (same pattern as WalletButton.tsx)
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const unread = notifications.length;
    const hasNotifications = unread > 0;

    return (
        <div ref={rootRef} className="relative">
            {/* Bell button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={`Notifications${hasNotifications ? ` (${unread} unread)` : ""}`}
                aria-expanded={open}
                className="relative rounded-full p-2 text-muted transition-colors hover:bg-line/60"
            >
                <HiBell aria-hidden className="text-xl" />
                {hasNotifications && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-err px-1 text-[10px] font-bold leading-none text-white">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-line bg-surface shadow-float z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <span className="text-sm font-semibold text-ink">Notifications</span>
                        {hasNotifications && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-err"
                            >
                                <HiTrash aria-hidden />
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* List */}
                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-muted">No notifications yet</p>
                            <p className="mt-1 text-xs text-muted">
                                Transaction updates will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {[...notifications].reverse().map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    onDismiss={dismissNotification}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

