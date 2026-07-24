"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { TransactionNotification } from "@/lib/notifications";

// ── Auto-dismiss durations ────────────────────────────────────────
const DISMISS_MS: Record<string, number> = {
    success: 5_000,
    info: 5_000,
    pending: 10_000, // give pending a bit longer before disappearing
    error: 10_000, // errors stay longer so the user can retry
};

// ── Context shape ─────────────────────────────────────────────────
interface NotificationContextValue {
    notifications: TransactionNotification[];
    addNotification: (n: TransactionNotification) => void;
    dismissNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────
export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<TransactionNotification[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Auto‑dismiss logic — set a timer per notification based on its type.
    // Clears the timer if the notification is manually dismissed before expiry.
    useEffect(() => {
        const timers = timersRef.current;

        for (const n of notifications) {
            if (!timers.has(n.id)) {
                const ms = DISMISS_MS[n.type] ?? 5_000;
                const timer = setTimeout(() => {
                    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                    timers.delete(n.id);
                }, ms);
                timers.set(n.id, timer);
            }
        }

        // Clean up timers for notifications that have been removed
        return () => {
            for (const [id, timer] of timers) {
                clearTimeout(timer);
                timers.delete(id);
            }
        };
    }, [notifications]);

    const addNotification = useCallback((n: TransactionNotification) => {
        setNotifications((prev) => [...prev, n]);
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((x) => x.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const clearAll = useCallback(() => {
        for (const [, timer] of timersRef.current) clearTimeout(timer);
        timersRef.current.clear();
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider
            value={{ notifications, addNotification, dismissNotification, clearAll }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────
export function useNotifications(): NotificationContextValue {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error(
            "useNotifications must be used within a <NotificationProvider>"
        );
    }
    return ctx;
}

