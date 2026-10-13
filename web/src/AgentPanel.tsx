
import { useEffect, useState } from "react";
import { Bot, Send, Sparkles, LoaderCircle, AlertCircle } from "lucide-react";
import "./AgentPanel.css";

type Question = {
  id: string;
  title: string;
  method: "select" | "input";
  options: string[];
};

type AgentState = {
  status: string;
  question: Question | null;
  answer: string;
  error: string;
};

type Props = {
  destination: string;
  budget: string;
  interests: string[];
};

const API = "http://localhost:8787";

export default function AgentPanel({
  destination,
  budget,
  interests,
}: Props) {
  const [state, setState] = useState<AgentState>({
    status: "idle",
    question: null,
    answer: "",
    error: "",
  });

  const [choice, setChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch(`${API}/api/state`);
        if (!response.ok) return;
        const data = await response.json();

        if (active) {
          setState(data);
        }
      } catch {
        if (active) {
          setRequestError(
            "The AI server is offline. Run node server.cjs in another terminal."
          );
        }
      }
    }

    refresh();
    const timer = setInterval(refresh, 800);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  async function start() {
    setBusy(true);
    setChoice("");
    setRequestError("");

    try {
      const response = await fetch(`${API}/api/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: destination,
          budget: Number(budget),
          interests,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not start AI.");
      }

      setState({
        status: "thinking",
        question: null,
        answer: "",
        error: "",
      });
    } catch (err) {
      setRequestError(
        err instanceof Error ? err.message : "Connection failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(cancelled = false) {
    setBusy(true);
    setRequestError("");

    try {
      const response = await fetch(`${API}/api/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: choice,
          cancelled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit answer.");
      }

      setState((current) => ({
        ...current,
        question: null,
        status: "thinking",
      }));
      setChoice("");
    } catch (err) {
      setRequestError(
        err instanceof Error ? err.message : "Answer failed."
      );
    } finally {
      setBusy(false);
    }
  }

  const thinking =
    state.status === "thinking" ||
    state.status === "starting";

  return (
    <section className="ai-panel" id="ai-assistant">
      <div className="ai-panel-heading">
        <div className="ai-avatar"><Bot size={25} /></div>
        <div>
          <span className="ai-kicker">YOUR PERSONAL AGENT</span>
          <h2>Ask CultureQuest AI</h2>
          <p>
            Powered by Pi, your ask_user extension, and OpenRouter's
            free model router.
          </p>
        </div>
      </div>

      <div className="ai-conversation">
        {state.status === "idle" && (
          <div className="ai-message">
            <Sparkles size={20} />
            <p>
              Welcome! I'll help you discover cultural experiences
              in {destination}. Click below and I'll ask about your
              preferences before creating your recommendations.
            </p>
          </div>
        )}

        {thinking && (
          <div className="ai-loading">
            <LoaderCircle size={19} className="spinning" />
            The AI agent is working on your cultural adventure...
          </div>
        )}

        {state.question && (
          <div className="ai-question">
            <span className="ai-kicker">A QUESTION FROM YOUR AI AGENT</span>
            <h3>{state.question.title}</h3>

            {state.question.method === "select" ? (
              <div className="ai-options">
                {state.question.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={choice === option ? "chosen" : ""}
                    onClick={() => setChoice(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
                placeholder="Type your answer..."
                rows={3}
              />
            )}

            <div className="ai-actions">
              <button
                type="button"
                className="ai-cancel"
                disabled={busy}
                onClick={() => submitAnswer(true)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ai-submit"
                disabled={busy || (
                  state.question.method === "select"
                    ? !choice
                    : !choice.trim()
                )}
                onClick={() => submitAnswer()}
              >
                Send answer <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {state.answer && (
          <div className="ai-response">
            <span className="ai-kicker">CULTUREQUEST RECOMMENDS</span>
            <div className="ai-response-text">{state.answer}</div>
            <p className="ai-disclaimer">
              AI-generated suggestions. Verify real locations,
              prices, opening hours, and current event details.
            </p>
          </div>
        )}

        {(state.error || requestError) && (
          <div className="ai-error" role="alert">
            <AlertCircle size={19} />
            {state.error || requestError}
          </div>
        )}
      </div>

      <button
        type="button"
        className="ai-start"
        onClick={start}
        disabled={busy || thinking || state.status === "waiting"}
      >
        <Sparkles size={19} />
        {state.status === "idle"
          ? "Generate my AI cultural adventure"
          : "Start a new AI adventure"}
      </button>
    </section>
  );
}
