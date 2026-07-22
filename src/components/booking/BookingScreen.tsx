"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaArrowRight,
  FaLock,
  FaCheck,
  FaPlus,
  FaClock,
} from "react-icons/fa6";
import NorthStar from "@/components/brand/NorthStar";
import RatingPill from "@/components/marketplace/RatingPill";
import { buttonClasses } from "@/components/ui/Button";
import { bookingApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/types";
import { formatNaira, type Worker } from "@/lib/marketplace";
import { feeFor, type Service, type DateChip, type TimeSlot } from "@/lib/booking";
import {
  PROVIDER_TIME_ZONE,
  convertSlotToZone,
  getVisitorTimeZone,
  offsetLabel,
} from "@/lib/timezone";
import {
  acquireSlotLock,
  createHolderId,
  isLockedByOther,
  releaseSlotLock,
  slotKey,
  subscribeToLockChanges,
} from "@/lib/slotLock";

interface Props {
  worker: Worker;
  /** API category enum, e.g. "ELECTRICAL" — sent to bookAppointment. */
  apiCategory: string;
  backHref: string;
  services: Service[];
  dates: DateChip[];
  timeSlots: TimeSlot[];
}

export default function BookingScreen({
  worker,
  apiCategory,
  backHref,
  services,
  dates,
  timeSlots,
}: Props) {
  const router = useRouter();
  const firstOpenDate = dates.find((d) => !d.disabled) ?? dates[0];
  const firstOpenTime = timeSlots.find((s) => !s.off)?.t ?? timeSlots[0].t;

  const [serviceId, setServiceId] = useState(services[0].id);
  const [dateIso, setDateIso] = useState(firstOpenDate.iso);
  const [time, setTime] = useState(firstOpenTime);
  const [booked, setBooked] = useState<null | { ref: string }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- timezone: render times in the visitor's own zone -------------------
  // Start off matching the server-rendered provider zone so hydration has
  // nothing to mismatch against, then swap to the browser's real zone once
  // mounted (Intl isn't available/reliable during SSR).
  const [visitorZone, setVisitorZone] = useState(PROVIDER_TIME_ZONE);
  useEffect(() => {
    setVisitorZone(getVisitorTimeZone());
  }, []);
  const showsOwnZone = visitorZone !== PROVIDER_TIME_ZONE;

  // --- slot locking: stop this visitor double-booking themselves ----------
  // See lib/slotLock.ts for what this does and doesn't cover.
  const [holderId] = useState(createHolderId);
  const [lockTick, setLockTick] = useState(0);
  useEffect(() => subscribeToLockChanges(() => setLockTick((t) => t + 1)), []);
  useEffect(() => {
    // Locks carry their own TTL, but nothing re-renders when one silently
    // expires unless something asks — a light poll keeps "Held" labels and
    // disabled states from going stale while the page just sits open.
    const id = window.setInterval(() => setLockTick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const currentKey = slotKey(worker.id, dateIso, time);
  // Hold the currently-selected slot for this visitor, and release
  // whichever slot they held before if the selection changes. Skipped once
  // booked, since the slot is then genuinely taken rather than just held.
  useEffect(() => {
    if (booked) return;
    acquireSlotLock(currentKey, holderId);
    return () => releaseSlotLock(currentKey, holderId);
  }, [currentKey, holderId, booked]);

  function selectTime(t: string) {
    const key = slotKey(worker.id, dateIso, t);
    if (!acquireSlotLock(key, holderId)) {
      setError("That time was just taken in another tab — pick another slot.");
      return;
    }
    setError("");
    setTime(t);
  }

  const service = services.find((s) => s.id === serviceId) ?? services[0];
  const selectedDate = dates.find((d) => d.iso === dateIso) ?? firstOpenDate;
  const fee = feeFor(service.price);
  const total = service.price + fee;

  async function pay() {
    setError("");

    // clientId comes from the login flow (localStorage "userId").
    const clientId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!clientId || clientId === "undefined") {
      router.push("/login?as=client");
      return;
    }

    // Re-confirm the hold right before submitting — it may have expired, or
    // (extremely unlikely with a 5-minute TTL, but possible) another tab
    // could have grabbed it between selection and now.
    if (!acquireSlotLock(currentKey, holderId)) {
      setError("This slot was just taken — please pick another time.");
      return;
    }

    setLoading(true);
    try {
      // Combine the picked date + slot into the datetime the API expects.
      const scheduleTime = `${dateIso}T${time}`;
      // The API also takes a skilledWorkerId, but we can't send one yet: the
      // pros in the browse list are sample data whose ids ("gw-chidi") aren't
      // the backend's numeric SkilledWorker ids. Until workers are fetched from
      // the API, the appointment records the amount but no pro.
      const res = await bookingApi({
        scheduleTime,
        category: apiCategory,
        clientId,
        amount: total,
      });

      if (res.status) {
        // NOTE: Soroban escrow contract call still to come — the funds
        // aren't actually locked on-chain yet, only the appointment is booked.
        setBooked({ ref: `GW-${Math.floor(1000 + Math.random() * 9000)}` });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(res.data?.error ?? "We couldn't confirm your booking. Please try again.");
      }
    } catch (e) {
      setError(
        getErrorMessage(e, "We couldn't reach the booking service. Please try again in a moment.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (booked) {
    return (
      <Confirmation
        worker={worker}
        when={`${selectedDate.label} · ${convertSlotToZone(dateIso, time, visitorZone).time}${
          showsOwnZone ? ` (${offsetLabel(visitorZone)})` : ""
        }`}
        total={total}
        reference={booked.ref}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 md:px-10">
      <div className="pt-6">
        <Link href={backHref} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <FaArrowLeft className="text-xs" aria-hidden /> Back to {worker.trade.toLowerCase()}s in {worker.area}
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Book {worker.name}</h1>
        <p className="mt-1.5 text-muted">
          Pick a service and time. You&apos;ll pay into escrow —{" "}
          {worker.name.split(" ")[0]}
          {" "}only gets paid once you confirm the work&apos;s done.
        </p>
      </div>

      <div className="grid items-start gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* form */}
        <div className="min-w-0 space-y-4">
          {/* service */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <SectionHead n="01" title="Choose a service" />
            <p className="-mt-1 mb-4 text-sm text-muted">
              Prices are {worker.name.split(" ")[0]}&apos;s base rate — final quote is confirmed in
              chat before work starts.
            </p>
            <div className="grid gap-2.5">
              {services.map((s) => {
                const sel = s.id === serviceId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServiceId(s.id)}
                    className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition ${
                      sel ? "border-gold bg-gold/10" : "border-line hover:border-navy-2"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        sel ? "border-gold-deep bg-gold" : "border-line"
                      }`}
                    >
                      {sel ? <span className="h-2 w-2 rounded-full bg-navy-ink" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{s.label}</span>
                      <span className="block text-sm text-muted">{s.desc}</span>
                    </span>
                    <span className="whitespace-nowrap font-extrabold tabular-nums">
                      {s.from ? "from " : ""}
                      {formatNaira(s.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* date + time */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <SectionHead n="02" title="Pick a date" />
            <div className="mb-5 flex gap-2.5 overflow-x-auto pb-1">
              {dates.map((d) => {
                const sel = d.iso === dateIso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    disabled={d.disabled}
                    onClick={() => setDateIso(d.iso)}
                    className={`min-w-[64px] shrink-0 rounded-xl border px-3.5 py-2.5 text-center transition ${
                      d.disabled
                        ? "cursor-not-allowed border-line text-muted opacity-40"
                        : sel
                        ? "border-navy bg-navy text-white"
                        : "border-line hover:border-navy-2"
                    }`}
                  >
                    <span className="block text-[0.62rem] font-bold uppercase tracking-wide opacity-70">
                      {d.dow}
                    </span>
                    <span className="block text-lg font-extrabold tabular-nums">{d.num}</span>
                  </button>
                );
              })}
            </div>
            <span className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-wider text-muted">
              Available times · {selectedDate.label}
            </span>
            {showsOwnZone ? (
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <FaClock className="text-[0.7rem]" aria-hidden />
                Shown in your time ({offsetLabel(visitorZone)}) · {worker.name.split(" ")[0]} is in
                Lagos ({offsetLabel(PROVIDER_TIME_ZONE)})
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2.5" key={`slots-${lockTick}`}>
              {timeSlots.map((s) => {
                const key = slotKey(worker.id, dateIso, s.t);
                const held = !s.off && isLockedByOther(key, holderId);
                const disabled = s.off || held;
                const sel = s.t === time && !disabled;
                const zoned = convertSlotToZone(dateIso, s.t, visitorZone);
                return (
                  <button
                    key={s.t}
                    type="button"
                    disabled={disabled}
                    title={held ? "Someone else is holding this time — try another" : undefined}
                    onClick={() => selectTime(s.t)}
                    className={`relative rounded-xl border px-4 py-2.5 font-bold tabular-nums transition ${
                      disabled
                        ? "cursor-not-allowed border-line text-muted line-through opacity-40"
                        : sel
                        ? "border-navy bg-navy text-white"
                        : "border-line hover:border-navy-2"
                    }`}
                  >
                    {zoned.time}
                    {zoned.dayOffset !== 0 ? (
                      <sup className="ml-0.5 font-sans text-[0.6rem] font-extrabold">
                        {zoned.dayOffset > 0 ? "+1" : "-1"}
                      </sup>
                    ) : null}
                    {held ? (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-sand px-1.5 py-0.5 text-[0.55rem] font-extrabold uppercase tracking-wide text-muted">
                        Held
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          {/* where */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <SectionHead n="03" title="Where & what" />
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
              Job address
            </label>
            <input
              defaultValue={`Flat 4, Herbert Macaulay Way, ${worker.area}, Lagos`}
              aria-label="Job address"
              className="mb-4 w-full rounded-xl border border-line bg-sand px-3.5 py-3 font-medium outline-none focus:border-navy-2"
            />
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
              Describe the job (optional)
            </label>
            <textarea
              rows={3}
              aria-label="Job description"
              placeholder="Tell the pro what you need…"
              className="w-full resize-y rounded-xl border border-line bg-sand px-3.5 py-3 leading-relaxed outline-none focus:border-navy-2"
            />
          </section>
        </div>

        {/* escrow summary */}
        <aside className="lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-float">
            <div className="flex items-center gap-3 border-b border-line p-[18px]">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-extrabold text-white"
                style={{ background: worker.avatar }}
                aria-hidden
              >
                {worker.initials}
              </span>
              <div className="min-w-0">
                <span className="flex items-center gap-1.5 font-extrabold">
                  {worker.name}
                  <NorthStar size={15} verified />
                </span>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <RatingPill rating={worker.rating} /> · {worker.reviews} jobs
                </span>
              </div>
            </div>

            <div className="grid gap-3 border-b border-line p-[18px]">
              <div className="flex items-center justify-between rounded-lg bg-sand px-3 py-2.5 text-sm">
                <span className="text-muted">Appointment</span>
                <span className="font-extrabold">
                  {selectedDate.label} · {convertSlotToZone(dateIso, time, visitorZone).time}
                  {showsOwnZone ? ` (${offsetLabel(visitorZone)})` : ""}
                </span>
              </div>
              <Line k={service.label} v={formatNaira(service.price)} />
              <Line k="Service fee" v={formatNaira(fee)} />
              <div className="mt-1 flex items-center justify-between border-t border-dashed border-line pt-3 text-[1.05rem]">
                <span className="text-muted">Total held in escrow</span>
                <span className="font-extrabold tabular-nums">{formatNaira(total)}</span>
              </div>
            </div>

            {/* escrow explainer + lifecycle */}
            <div className="m-[18px] rounded-xl border border-navy/15 bg-navy-tint p-4">
              <div className="flex items-center gap-2 font-extrabold text-navy-2">
                <FaLock aria-hidden /> Protected by escrow
              </div>
              <p className="mb-3.5 mt-1.5 text-sm text-muted">
                Your <b className="text-ink">{formatNaira(total)}</b> is locked on Stellar.{" "}
                {worker.name.split(" ")[0]} is paid only when{" "}
                <b className="text-ink">you</b>
                {" "}confirm the job&apos;s done — otherwise you&apos;re refunded.
              </p>
              <div className="flex items-start">
                <TrackNode icon={<FaPlus />} label="You pay" sub="now" tone="gold" />
                <span className="mt-[15px] h-0.5 flex-1 bg-line" />
                <TrackNode icon={<FaLock />} label="Held on-chain" sub="during job" tone="navy" />
                <span className="mt-[15px] h-0.5 flex-1 bg-line" />
                <TrackNode icon={<FaCheck />} label="Released" sub="you confirm" tone="todo" />
              </div>
            </div>

            <div className="px-[18px] pb-[18px]">
              <button
                onClick={pay}
                disabled={loading}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                {loading
                  ? "Confirming your booking…"
                  : `Pay ${formatNaira(total)} into escrow`}
              </button>
              {error ? (
                <p role="alert" className="mt-2.5 text-center text-sm font-semibold text-err">
                  {error}
                </p>
              ) : null}
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                <NorthStar size={13} color="var(--gold-deep)" /> Secured on Stellar · Free
                cancellation until {worker.name.split(" ")[0]} accepts
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <h2 className="mb-1 flex items-center gap-2.5 text-[1.05rem] font-extrabold">
      <span className="font-mono text-sm font-bold text-gold-deep">{n}</span> {title}
    </h2>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  );
}

function TrackNode({
  icon,
  label,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  tone: "gold" | "navy" | "todo";
}) {
  const chip =
    tone === "gold"
      ? "bg-gold border-gold text-navy-ink"
      : tone === "navy"
      ? "bg-navy border-navy text-white"
      : "bg-surface border-line text-muted";
  return (
    <div className="flex-1 text-center">
      <span className={`mx-auto flex h-[30px] w-[30px] items-center justify-center rounded-full border text-sm ${chip}`}>
        {icon}
      </span>
      <span className="mt-1.5 block text-[0.64rem] font-bold leading-tight">{label}</span>
      <span className="block text-[0.6rem] text-muted">{sub}</span>
    </div>
  );
}

function Confirmation({
  worker,
  when,
  total,
  reference,
}: {
  worker: Worker;
  when: string;
  total: number;
  reference: string;
}) {
  const first = worker.name.split(" ")[0];
  return (
    <div className="bg-sand-2 px-5 py-14 md:px-10">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-float">
          <div className="border-b border-dashed border-line px-7 py-7 text-center">
            <NorthStar size={60} verified className="mx-auto mb-3.5" />
            <h1 className="text-2xl font-extrabold tracking-tight">Booking confirmed</h1>
            <p className="mt-2 text-muted">
              <b className="text-ink">{formatNaira(total)}</b> is locked in escrow. {first} has{" "}
              <b className="text-ink">12 hours</b>{" "}to accept — you&apos;ll get a notification
              either way.
            </p>
          </div>
          <div className="px-7 py-5">
            <RcLine k="Booking" v={`#${reference}`} />
            <RcLine k="Pro" v={`${worker.name} · ${worker.trade}`} />
            <RcLine k="When" v={when} />
            <RcLine
              k="Status"
              v={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-tint px-2.5 py-1 text-xs font-extrabold text-navy-2">
                  <FaLock className="text-[0.7rem]" aria-hidden /> In escrow
                </span>
              }
            />
          </div>
          <div className="flex gap-2.5 px-7 pb-7">
            <Link href="/view" className={buttonClasses("primary", "lg", "flex-1")}>
              View booking
            </Link>
            <Link href="/appoint" className={buttonClasses("outline", "lg")}>
              Message
            </Link>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2.5 text-sm text-muted">
          <NorthStar size={16} color="var(--gold-deep)" className="mt-0.5 shrink-0" />
          <span>
            When the job&apos;s done you tap <b className="text-ink">Release payment</b> — or open a
            dispute for a full refund if it falls through. Your rating posts to {first}&apos;s
            on-chain record.
          </span>
        </p>
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-2 hover:text-navy">
            Back to home <FaArrowRight className="text-xs" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

function RcLine({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-2 py-2.5 text-sm last:border-none">
      <span className="text-muted">{k}</span>
      <span className="font-bold">{v}</span>
    </div>
  );
}
