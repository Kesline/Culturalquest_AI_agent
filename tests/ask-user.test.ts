
import { describe, expect, it, vi } from "vitest";

import askUserExtension from "../extensions/ask-user";
import {
  resolveAnswer,
  unavailableUI,
} from "../extensions/ask-user-logic";

// This setup simulates Pi without using OpenRouter.
// It allows us to test user interactions for free.

function setupTool(config: {
  hasUI?: boolean;
  selected?: string;
  custom?: string;
} = {}) {

  // Use default UI availability unless explicitly changed.
  const hasUI = config.hasUI ?? true;

  // Important: preserve explicit undefined values.
  // undefined represents a user cancelling the question.
  const selected =
    "selected" in config
      ? config.selected
      : "Explore bookstores";

  const custom =
    "custom" in config
      ? config.custom
      : "Visit a poetry café";

  let tool: any;

  // Mock Pi's tool registration.
  const pi = {
    registerTool: vi.fn((registeredTool) => {
      tool = registeredTool;
    }),
  };

  // Register our CultureQuest ask_user tool.
  askUserExtension(pi as any);

  // Mock the interactive UI.
  const select = vi.fn().mockResolvedValue(selected);
  const input = vi.fn().mockResolvedValue(custom);

  const ctx = {
    hasUI,
    ui: {
      select,
      input,
    },
  };

  // Simulate the agent calling ask_user.
  const execute = () =>
    tool.execute(
      "test-call",
      {
        question: "What would you like to explore?",
        options: [
          "Explore bookstores",
          "Try local food",
          "Listen to music",
        ],
      },
      new AbortController().signal,
      undefined,
      ctx
    );

  return {
    tool,
    select,
    input,
    execute,
  };
}

// --------------------------------------------
// Tests for the actual Pi extension
// --------------------------------------------

describe("CultureQuest ask_user extension", () => {

  it("registers the correct tool", () => {
    const { tool } = setupTool();

    expect(tool.name).toBe("ask_user");
  });

  it("returns a selected predefined option", async () => {
    const { execute, select, input } = setupTool({
      selected: "Try local food",
    });

    const result = await execute();

    expect(result.details.status).toBe("answered");
    expect(result.details.answer).toBe("Try local food");

    expect(select).toHaveBeenCalledOnce();
    expect(input).not.toHaveBeenCalled();
  });

  it("returns a custom answer", async () => {
    const { execute, input } = setupTool({
      selected: "Other",
      custom: "Find a Korean poetry bookstore",
    });

    const result = await execute();

    expect(input).toHaveBeenCalledOnce();

    expect(result.details.status).toBe("answered");
    expect(result.details.answer).toBe(
      "Find a Korean poetry bookstore"
    );
  });

  it("handles cancelling the selection", async () => {
    const { execute } = setupTool({
      selected: undefined,
    });

    const result = await execute();

    expect(result.details.status).toBe("cancelled");
    expect(result.details.answer).toBeUndefined();
  });

  it("handles an empty custom answer", async () => {
    const { execute } = setupTool({
      selected: "Other",
      custom: "   ",
    });

    const result = await execute();

    expect(result.details.status).toBe("empty_response");
    expect(result.details.answer).toBeUndefined();
  });

  it("handles cancelling custom input", async () => {
    const { execute } = setupTool({
      selected: "Other",
      custom: undefined,
    });

    const result = await execute();

    expect(result.details.status).toBe("cancelled");
    expect(result.details.answer).toBeUndefined();
  });

  it("handles unavailable interactive UI", async () => {
    const { execute, select, input } = setupTool({
      hasUI: false,
    });

    const result = await execute();

    expect(result.details.status).toBe("ui_unavailable");

    // There should be no attempt to open the UI.
    expect(select).not.toHaveBeenCalled();
    expect(input).not.toHaveBeenCalled();
  });
});

// --------------------------------------------
// Tests for the decision-handling logic
// --------------------------------------------

describe("Decision logic", () => {

  it("trims a custom answer", () => {
    const result = resolveAnswer(
      "Other",
      "  Visit a bookstore  "
    );

    expect(result.answer).toBe("Visit a bookstore");
  });

  it("does not invent an answer after cancellation", () => {
    const result = resolveAnswer(undefined);

    expect(result.status).toBe("cancelled");
    expect(result.answer).toBeUndefined();
  });

  it("reports unavailable UI", () => {
    const result = unavailableUI();

    expect(result.status).toBe("ui_unavailable");
  });
});
