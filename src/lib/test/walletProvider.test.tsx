import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Same fake as wallet.test.tsx — duplicated rather than shared because
    `vi.mock` factories run per test file and this repo's other test files
    (e.g. theme.test.ts / themeProvider.test.tsx) already each stub their own
    externals rather than sharing a __mocks__ module. No real timers: the
    fake's callback is only ever invoked by hand. */
const freighter = vi.hoisted(() => {
  type WatchCallback = (params: {
    address: string;
    network: string;
    networkPassphrase: string;
    error?: unknown;
  }) => void;

  class FakeWatchWalletChanges {
    static instances: FakeWatchWalletChanges[] = [];
    cb: WatchCallback | null = null;
    stopped = false;
    constructor(public timeout: number) {
      FakeWatchWalletChanges.instances.push(this);
    }
    watch(cb: WatchCallback) {
      this.cb = cb;
      return {};
    }
    stop() {
      this.stopped = true;
    }
  }

  return {
    isConnected: vi.fn(),
    isAllowed: vi.fn(),
    getAddress: vi.fn(),
    requestAccess: vi.fn(),
    getNetwork: vi.fn(),
    FakeWatchWalletChanges,
  };
});

vi.mock("@stellar/freighter-api", () => ({
  isConnected: freighter.isConnected,
  isAllowed: freighter.isAllowed,
  getAddress: freighter.getAddress,
  requestAccess: freighter.requestAccess,
  getNetwork: freighter.getNetwork,
  WatchWalletChanges: freighter.FakeWatchWalletChanges,
}));

import { useWallet, WalletProvider } from "../../components/wallet/WalletProvider";

/** Two independent consumers, as WalletButton (desktop + mobile) and
    NetworkGuard are in the real navbar/layout — this is the regression
    test for "every consumer must share one wallet instance". */
function ConsumerA() {
  const wallet = useWallet();
  return (
    <div>
      <span data-testid="a-address">{wallet.address ?? ""}</span>
      <button data-testid="a-connect" onClick={() => wallet.connect()}>
        connect
      </button>
    </div>
  );
}

function ConsumerB() {
  const wallet = useWallet();
  return <span data-testid="b-address">{wallet.address ?? ""}</span>;
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  window.localStorage.clear();
  freighter.FakeWatchWalletChanges.instances.length = 0;
  freighter.isConnected.mockReset();
  freighter.isAllowed.mockReset();
  freighter.getAddress.mockReset();
  freighter.requestAccess.mockReset();
  freighter.getNetwork.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

async function flush(times = 6) {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

function text(testid: string) {
  return container.querySelector(`[data-testid="${testid}"]`)!.textContent;
}

describe("WalletProvider", () => {
  it("throws when useWallet() is called outside a WalletProvider", () => {
    function Bare() {
      useWallet();
      return null;
    }
    // React logs the thrown error to console during the failed render;
    // that's expected here and not something this test needs to assert on.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      act(() => {
        root.render(<Bare />);
      });
    }).toThrow("useWallet must be used within a <WalletProvider>");
    consoleError.mockRestore();
  });

  it("shares one wallet instance — and one WatchWalletChanges poller — across every consumer", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GSHARED..." });
    freighter.getNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network" });

    act(() => {
      root.render(
        <WalletProvider>
          <ConsumerA />
          <ConsumerB />
        </WalletProvider>
      );
    });
    await flush();

    expect(text("a-address")).toBe("");
    expect(text("b-address")).toBe("");

    act(() => {
      container.querySelector('[data-testid="a-connect"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    // Both consumers see the same connected address from one shared state...
    expect(text("a-address")).toBe("GSHARED...");
    expect(text("b-address")).toBe("GSHARED...");
    // ...backed by exactly one poller, not one per consumer.
    expect(freighter.FakeWatchWalletChanges.instances).toHaveLength(1);
  });
});
