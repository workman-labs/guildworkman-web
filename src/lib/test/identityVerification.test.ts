import { beforeEach, describe, expect, it } from "vitest";
import {
  DOCUMENT_TYPES_REQUIRING_BACK,
  EMPTY_FORM_VALUES,
  clearProgress,
  loadProgress,
  saveProgress,
} from "../identityVerification";

describe("saveProgress / loadProgress / clearProgress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing has been saved", () => {
    expect(loadProgress()).toBeNull();
  });

  it("round-trips step index and form values", () => {
    saveProgress({
      step: 2,
      values: {
        ...EMPTY_FORM_VALUES,
        personal: { ...EMPTY_FORM_VALUES.personal, fullName: "Ada Lovelace" },
      },
      attachedFileNames: { front: "id-front.jpg" },
    });

    const loaded = loadProgress();
    expect(loaded?.step).toBe(2);
    expect(loaded?.values.personal.fullName).toBe("Ada Lovelace");
    expect(loaded?.attachedFileNames.front).toBe("id-front.jpg");
    expect(loaded?.savedAt).toBeTruthy();
  });

  it("never persists file contents, only filenames", () => {
    saveProgress({ step: 3, values: EMPTY_FORM_VALUES, attachedFileNames: { selfie: "me.png" } });
    const raw = window.localStorage.getItem("gw-identity-verification-v1") ?? "";
    expect(raw).toContain("me.png");
    expect(raw).not.toContain("data:image");
  });

  it("clears a saved session", () => {
    saveProgress({ step: 1, values: EMPTY_FORM_VALUES, attachedFileNames: {} });
    expect(loadProgress()).not.toBeNull();
    clearProgress();
    expect(loadProgress()).toBeNull();
  });

  it("recovers gracefully from corrupted storage", () => {
    window.localStorage.setItem("gw-identity-verification-v1", "{not-json");
    expect(loadProgress()).toBeNull();
  });
});

describe("DOCUMENT_TYPES_REQUIRING_BACK", () => {
  it("requires a back scan for national ID and driver's license, not passport", () => {
    expect(DOCUMENT_TYPES_REQUIRING_BACK).toContain("national-id");
    expect(DOCUMENT_TYPES_REQUIRING_BACK).toContain("drivers-license");
    expect(DOCUMENT_TYPES_REQUIRING_BACK).not.toContain("passport");
  });
});
