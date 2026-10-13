
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { resolveAnswer, unavailableUI } from "./ask-user-logic.js";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "ask_user",
    label: "CultureQuest Ask User",
    description:
      "Ask the user to choose between cultural experiences involving books, travel, food, music, poetry, or languages before continuing.",

    parameters: Type.Object({
      question: Type.String(),
      options: Type.Array(Type.String()),
    }),

    async execute(_id, params, _signal, _onUpdate, ctx) {
      if (!ctx.hasUI) {
        const result = unavailableUI();
        return {
          content: [{ type: "text", text: result.message }],
          details: result,
        };
      }

      const options = [
        ...new Set(
          params.options.map((option) => option.trim()).filter(Boolean)
        ),
      ].filter((option) => option !== "Other");

      if (options.length === 0) {
        return {
          content: [{
            type: "text",
            text: "No valid options were provided.",
          }],
          details: { status: "invalid_options" },
        };
      }

      const selected = await ctx.ui.select(
        params.question,
        [...options, "Other"]
      );

      let customAnswer: string | undefined;

      if (selected === "Other") {
        customAnswer = await ctx.ui.input("What would you prefer?");

        if (customAnswer === undefined) {
          const result = resolveAnswer(undefined);
          return {
            content: [{ type: "text", text: result.message }],
            details: result,
          };
        }
      }

      const result = resolveAnswer(selected, customAnswer);

      return {
        content: [{ type: "text", text: result.message }],
        details: result,
      };
    },
  });
}
