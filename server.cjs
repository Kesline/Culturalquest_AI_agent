
const http = require("node:http");
const { spawn } = require("node:child_process");
const path = require("node:path");

const ROOT = __dirname;
const PORT = 8787;

let agent = null;
let buffer = "";
let task = {
  status: "idle",
  question: null,
  answer: "",
  error: "",
};

function sendToPi(data) {
  if (!agent || !agent.stdin.writable) {
    throw new Error("Pi is not running.");
  }
  agent.stdin.write(JSON.stringify(data) + "\n");
}

function handleEvent(event) {
  if (event.type === "extension_ui_request") {
    if (event.method === "select" || event.method === "input") {
      task.question = {
        id: event.id,
        method: event.method,
        title: event.title,
        options: event.options || [],
      };
      task.status = "waiting";
    }
  }

  if (
    event.type === "message_update" &&
    event.assistantMessageEvent?.type === "text_delta"
  ) {
    task.answer += event.assistantMessageEvent.delta || "";
  }

  if (event.type === "agent_settled") {
    if (task.status !== "waiting") {
      task.status = task.error ? "error" : "done";
    }
  }

  if (
    event.type === "message_end" &&
    event.message?.role === "assistant" &&
    event.message?.stopReason === "error"
  ) {
    task.error = event.message.errorMessage || "The AI request failed.";
    task.status = "error";
  }

  if (event.type === "response" && event.success === false) {
    task.error = event.error || "Pi rejected the request.";
    task.status = "error";
  }
}

function startAgent() {
  if (agent) {
    agent.kill();
  }

  task = {
    status: "starting",
    question: null,
    answer: "",
    error: "",
  };

  buffer = "";

  agent = spawn("pi", [
    "--mode", "rpc",
    "--no-session",
    "--provider", "openrouter",
    "--model", "openrouter/free",
    "-e", "./extensions/ask-user.ts",
  ], {
    cwd: ROOT,
    stdio: ["pipe", "pipe", "pipe"],
  });

  agent.stdout.on("data", (chunk) => {
    buffer += chunk.toString();

    let index;
    while ((index = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);

      if (!line) continue;

      try {
        handleEvent(JSON.parse(line));
      } catch {
        // Ignore non-JSON diagnostic lines.
      }
    }
  });

  agent.stderr.on("data", (chunk) => {
    console.error("Pi:", chunk.toString());
  });

  agent.on("error", (err) => {
    task.error = err.message;
    task.status = "error";
  });

  agent.on("exit", (code) => {
    if (task.status !== "done" && task.status !== "error") {
      task.error = `Pi exited unexpectedly (code ${code}).`;
      task.status = "error";
    }
    agent = null;
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 16000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;

  if (origin && origin !== "http://localhost:5173") {
    return json(res, { error: "Origin not allowed" }, 403);
  }

  if (req.method === "OPTIONS") {
    return json(res, {});
  }

  if (req.method === "GET" && req.url === "/api/state") {
    return json(res, task);
  }

  if (req.method === "POST" && req.url === "/api/start") {
    try {
      const body = await readBody(req);
      const city = String(body.city || "").trim().slice(0, 150);
      const budget = Number(body.budget);
      const interests = Array.isArray(body.interests)
        ? body.interests.map(String).slice(0, 6)
        : [];

      if (
        !city ||
        !Number.isFinite(budget) ||
        budget < 0 ||
        interests.length === 0
      ) {
        return json(res, { error: "Invalid trip details." }, 400);
      }

      startAgent();

      const prompt = `
You are CultureQuest, a cultural discovery AI assistant.

The user is interested in:
Destination: ${city}
Approximate total budget: $${budget} USD
Hobbies: ${interests.join(", ")}

IMPORTANT:
1. First call the registered ask_user tool.
2. Ask the user which cultural experience they want to prioritize.
3. Use 3 distinct options based on their interests.
4. Wait for the user's selection or custom answer.
5. Then generate a personalized cultural afternoon plan.
6. Include 3 activity suggestions, approximate budget allocations,
   useful local-language phrases, and one creative journal or poetry prompt.
7. Be clear that places, prices, opening hours, and event availability
   are unverified unless an actual search tool has verified them.
8. Do not execute shell commands, create files, or modify the computer.
Keep your response friendly and concise.
`;

      sendToPi({ type: "prompt", message: prompt });
      task.status = "thinking";

      return json(res, { ok: true });
    } catch (err) {
      task.error = err.message;
      task.status = "error";
      return json(res, { error: err.message }, 500);
    }
  }

  if (req.method === "POST" && req.url === "/api/answer") {
    try {
      const body = await readBody(req);

      if (!task.question || task.status !== "waiting") {
        return json(res, { error: "No question is pending." }, 409);
      }

      const question = task.question;
      const answer = String(body.answer ?? "");

      if (
        question.method === "select" &&
        !question.options.includes(answer)
      ) {
        return json(res, { error: "Invalid selection." }, 400);
      }

      sendToPi({
        type: "extension_ui_response",
        id: question.id,
        ...(body.cancelled
          ? { cancelled: true }
          : { value: answer }),
      });

      task.question = null;
      task.status = "thinking";
      return json(res, { ok: true });
    } catch (err) {
      return json(res, { error: err.message }, 500);
    }
  }

  json(res, { error: "Not found" }, 404);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`CultureQuest AI bridge: http://localhost:${PORT}`);
});
