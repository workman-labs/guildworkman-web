import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** `@stellar/freighter-api` talks to a real browser extension over
    postMessage — nothing jsdom can answer. Mocked here (via `vi.hoisted` so
    the factory below can reference it) so `useWalletState` is driven purely
    through controllable promises and a fake `WatchWalletChanges` whose
    callback we invoke by hand — there's no `setTimeout`/polling in the fake
    at all, so nothing here depends on real time or fake timers to be
    deterministic. */
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

import { useWalletState } from "../wallet";

const SESSION_KEY = "gw_wallet_connected";

function latestWatcher() {
  const instances = freighter.FakeWatchWalletChanges.instances;
  return instances[instances.length - 1];
}

/** Minimal consumer exposing the hook's values through DOM attributes. */
function WalletConsumer() {
  const wallet = useWalletState();
  return (
    <div
      data-address={wallet.address ?? ""}
      data-network={wallet.network ?? ""}
      data-connecting={String(wallet.connecting)}
      data-restoring={String(wallet.restoring)}
      data-wrong-network={String(wallet.isWrongNetwork)}
      data-error={wallet.error ?? ""}
      data-freighter-missing={String(wallet.freighterMissing)}
    >
      <button data-testid="connect" onClick={() => wallet.connect()}>
        connect
      </button>
      <button data-testid="disconnect" onClick={() => wallet.disconnect()}>
        disconnect
      </button>
      <button data-testid="recheck" onClick={() => wallet.recheckNetwork()}>
        recheck
      </button>
    </div>
  );
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

/** Flushes the microtask queue a few times inside `act`, enough for the
    hook's chained `await`s (isConnected -> isAllowed -> Promise.all) to
    settle and their resulting state updates to flush into the DOM. */
async function flush(times = 6) {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

async function render() {
  act(() => {
    root.render(<WalletConsumer />);
  });
  await flush();
}

function attr(name: string) {
  return container.firstElementChild!.getAttribute(name);
}

async function click(testid: string) {
  act(() => {
    container.querySelector(`[data-testid="${testid}"]`)!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await flush();
}

describe("useWalletState — connect", () => {
  it("populates address/network and persists the session flag on success", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GABC1234...WXYZ" });
    freighter.getNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network" });

    await render();
    await click("connect");

    expect(attr("data-address")).toBe("GABC1234...WXYZ");
    expect(attr("data-network")).toBe("TESTNET");
    expect(attr("data-wrong-network")).toBe("false");
    expect(attr("data-connecting")).toBe("false");
    expect(window.localStorage.getItem(SESSION_KEY)).toBe("true");
    expect(latestWatcher()).toBeDefined();
    expect(latestWatcher().stopped).toBe(false);
  });

  it("flags freighterMissing instead of prompting when the extension isn't installed", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: false });

    await render();
    await click("connect");

    expect(attr("data-freighter-missing")).toBe("true");
    expect(attr("data-address")).toBe("");
    expect(freighter.requestAccess).not.toHaveBeenCalled();
  });

  it("surfaces an error when the user declines the access request", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ error: "User declined access" });

    await render();
    await click("connect");

    expect(attr("data-error")).toBe("User declined access");
    expect(attr("data-address")).toBe("");
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("flags isWrongNetwork when connected to a network other than expected (TESTNET)", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GPUBLIC..." });
    freighter.getNetwork.mockResolvedValue({ network: "PUBLIC", networkPassphrase: "Public Global Stellar Network" });

    await render();
    await click("connect");

    expect(attr("data-network")).toBe("PUBLIC");
    expect(attr("data-wrong-network")).toBe("true");
  });
});

describe("useWalletState — session restore", () => {
  it("silently restores a session that Freighter still recognizes as allowed", async () => {
    window.localStorage.setItem(SESSION_KEY, "true");
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.isAllowed.mockResolvedValue({ isAllowed: true });
    freighter.getAddress.mockResolvedValue({ address: "GRESTORED..." });
    freighter.getNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network" });

    await render();

    expect(attr("data-address")).toBe("GRESTORED...");
    expect(attr("data-restoring")).toBe("false");
    expect(latestWatcher()).toBeDefined();
  });

  it("clears a stale session flag when Freighter no longer allows this origin", async () => {
    window.localStorage.setItem(SESSION_KEY, "true");
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.isAllowed.mockResolvedValue({ isAllowed: false });

    await render();

    expect(attr("data-address")).toBe("");
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(freighter.getAddress).not.toHaveBeenCalled();
  });

  it("clears a stale session flag when the extension is no longer installed", async () => {
    window.localStorage.setItem(SESSION_KEY, "true");
    freighter.isConnected.mockResolvedValue({ isConnected: false });

    await render();

    expect(attr("data-address")).toBe("");
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("does nothing on mount when no session was ever established", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });

    await render();

    expect(attr("data-address")).toBe("");
    expect(freighter.isAllowed).not.toHaveBeenCalled();
  });
});

describe("useWalletState — live network-switch guard", () => {
  async function connectOnTestnet() {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GLIVE..." });
    freighter.getNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network" });
    await render();
    await click("connect");
  }

  it("flips isWrongNetwork live when the watcher reports a network change", async () => {
    await connectOnTestnet();
    expect(attr("data-wrong-network")).toBe("false");

    await act(async () => {
      latestWatcher().cb?.({ address: "GLIVE...", network: "PUBLIC", networkPassphrase: "Public Global Stellar Network" });
    });

    expect(attr("data-network")).toBe("PUBLIC");
    expect(attr("data-wrong-network")).toBe("true");

    // Switching back clears the guard without a reload or reconnect.
    await act(async () => {
      latestWatcher().cb?.({ address: "GLIVE...", network: "TESTNET", networkPassphrase: "Test SDF Network" });
    });
    expect(attr("data-wrong-network")).toBe("false");
  });

  it("disconnects and clears the session when the watcher reports revoked access", async () => {
    await connectOnTestnet();
    const watcher = latestWatcher();

    await act(async () => {
      watcher.cb?.({ address: "", network: "", networkPassphrase: "", error: "access revoked" });
    });

    expect(attr("data-address")).toBe("");
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(watcher.stopped).toBe(true);
  });

  it("disconnects and clears the session when Freighter is uninstalled mid-session", async () => {
    // Distinct from a revoked grant: the extension itself disappears (e.g.
    // uninstalled, or disabled) between the watcher's polls. Freighter's own
    // requestPublicKey/requestNetworkDetails calls fail the same way an
    // access-revocation does — an error on the watch callback with no
    // address/network — so this exercises the same handling with a scenario
    // named for what it actually represents in production.
    await connectOnTestnet();
    const watcher = latestWatcher();

    await act(async () => {
      watcher.cb?.({
        address: "",
        network: "",
        networkPassphrase: "",
        error: "Freighter extension is not installed",
      });
    });

    expect(attr("data-address")).toBe("");
    expect(attr("data-network")).toBe("");
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(watcher.stopped).toBe(true);
  });

  it("recheckNetwork() re-verifies immediately, without waiting for the watcher", async () => {
    await connectOnTestnet();
    expect(attr("data-wrong-network")).toBe("false");

    freighter.getNetwork.mockResolvedValue({ network: "PUBLIC", networkPassphrase: "Public Global Stellar Network" });
    await click("recheck");

    expect(attr("data-network")).toBe("PUBLIC");
    expect(attr("data-wrong-network")).toBe("true");
  });
});

describe("useWalletState — disconnect", () => {
  it("stops the watcher and clears all state", async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.requestAccess.mockResolvedValue({ address: "GBYE..." });
    freighter.getNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network" });

    await render();
    await click("connect");
    const watcher = latestWatcher();

    await click("disconnect");

    expect(attr("data-address")).toBe("");
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(watcher.stopped).toBe(true);
  });
});
