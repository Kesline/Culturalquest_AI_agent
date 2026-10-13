
import { useState } from "react";
import {
  Compass,
  BookOpen,
  Utensils,
  Music2,
  Languages,
  Plane,
  Feather,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Wallet,
  CheckCircle2,
  RotateCcw,
  Coffee,
  Clock,
  Globe2,
  Bot,
} from "lucide-react";

import AgentPanel from "./AgentPanel";
import "./index.css";

type Interest =
  | "Books"
  | "Food"
  | "Music"
  | "Languages"
  | "Travel"
  | "Poetry";

type Step = "explore" | "choose" | "results";

const interestData = [
  {
    name: "Books",
    icon: BookOpen,
    desc: "Stories & bookstores",
    emoji: "📚",
  },
  {
    name: "Food",
    icon: Utensils,
    desc: "Flavors & local cuisine",
    emoji: "🍜",
  },
  {
    name: "Music",
    icon: Music2,
    desc: "Sounds & live music",
    emoji: "🎶",
  },
  {
    name: "Languages",
    icon: Languages,
    desc: "Words & connections",
    emoji: "🌏",
  },
  {
    name: "Travel",
    icon: Plane,
    desc: "Places & adventures",
    emoji: "✈️",
  },
  {
    name: "Poetry",
    icon: Feather,
    desc: "Art & inspiration",
    emoji: "🪶",
  },
] as const;

const experiences: Record<Interest, string[]> = {
  Books: [
    "Discover an independent local bookstore",
    "Find a peaceful reading café",
    "Explore books by writers from the region",
  ],
  Food: [
    "Explore a traditional food market",
    "Try an authentic local dish",
    "Discover a neighborhood dessert café",
  ],
  Music: [
    "Explore a neighborhood known for music",
    "Visit a local record shop",
    "Look for an intimate live performance",
  ],
  Languages: [
    "Practice greetings with local people",
    "Order a meal in the local language",
    "Explore a cultural learning space",
  ],
  Travel: [
    "Discover a historic neighborhood",
    "Take a scenic cultural walk",
    "Explore a hidden local attraction",
  ],
  Poetry: [
    "Find a peaceful writing location",
    "Explore a literary café or bookstore",
    "Write a poem inspired by your adventure",
  ],
};

export default function App() {
  const [step, setStep] = useState<Step>("explore");

  const [destination, setDestination] =
    useState("Seoul, South Korea");

  const [budget, setBudget] = useState("60");

  const [interests, setInterests] = useState<Interest[]>([
    "Books",
    "Food",
  ]);

  const [selectedChoice, setSelectedChoice] = useState("");
  const [customChoice, setCustomChoice] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const toggleInterest = (interest: Interest) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const startExploring = () => {
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (interests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    if (
      budget.trim() === "" ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) < 0
    ) {
      setError("Please enter a valid budget.");
      return;
    }

    setError("");
    setSelectedChoice("");
    setCustomChoice("");
    setStep("choose");
  };

  const continueJourney = () => {
    const result =
      selectedChoice === "Other"
        ? customChoice.trim()
        : selectedChoice;

    if (!result) {
      setError("Please select or enter your preference.");
      return;
    }

    setAnswer(result);
    setSaved(false);
    setError("");
    setStep("results");
  };

  const chosenInterest: Interest = interests.includes(
    answer as Interest
  )
    ? (answer as Interest)
    : interests[0] || "Travel";

  const reset = () => {
    setStep("explore");
    setSelectedChoice("");
    setCustomChoice("");
    setAnswer("");
    setError("");
    setSaved(false);
  };

  return (
    <div className="app">

      {/* ================= NAVIGATION ================= */}

      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-symbol">
            <Compass size={23} />
          </span>

          culturequest
          <span className="brand-dot">.</span>
        </a>

        <nav>
          <a href="#discover">Discover</a>
          <a href="#ai-assistant">AI Assistant</a>
          <a href="#about">Our philosophy</a>

          <span className="nav-tag">
            <Sparkles size={14} />
            Your cultural companion
          </span>
        </nav>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero" id="home">

        <div className="hero-copy">

          <div className="eyebrow">
            <Globe2 size={15} />
            FOR THE CURIOUS AT HEART
          </div>

          <h1>
            The world is full of stories.
            <em> Find yours.</em>
          </h1>

          <p>
            From hidden bookstores to unforgettable flavors,
            discover the world through everything you love.
          </p>

          <a href="#discover" className="hero-cta">
            Begin your adventure
            <ArrowRight size={18} />
          </a>

          <div className="hero-note">
            ✦ Your journey. Your choices. Your story.
          </div>
        </div>

        <div className="hero-image">
          <div className="photo-caption">
            <MapPin size={15} />
            Somewhere wonderful awaits
          </div>
        </div>

      </section>

      {/* ================= DISCOVERY ================= */}

      <section id="discover" className="explore-section">

        <div className="section-heading">

          <span className="eyebrow dark">
            DISCOVER YOUR NEXT CHAPTER
          </span>

          <h2>
            Where will curiosity take you?
          </h2>

          <p>
            Tell us a little about yourself.
            We'll shape the experience around you.
          </p>

        </div>

        <div className="main-layout">

          <main className="main-card">

            {/* ===== STEP 1: INTEREST SELECTION ===== */}

            {step === "explore" && (
              <>
                <div className="step-heading">
                  <span>01</span>
                  Create your adventure
                </div>

                <div className="form-row">

                  <div className="field">
                    <label htmlFor="destination">
                      <MapPin size={17} />
                      Your destination
                    </label>

                    <input
                      id="destination"
                      value={destination}
                      onChange={(e) =>
                        setDestination(e.target.value)
                      }
                      placeholder="Where are you going?"
                    />
                  </div>

                  <div className="field">

                    <label htmlFor="budget">
                      <Wallet size={17} />
                      Budget (USD)
                    </label>

                    <input
                      id="budget"
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) =>
                        setBudget(e.target.value)
                      }
                    />

                  </div>
                </div>

                <div className="interest-heading">
                  <h3>
                    What makes your heart curious?
                  </h3>
                  <p>
                    Select one or more things you love.
                  </p>
                </div>

                <div className="interest-grid">

                  {interestData.map((item) => {
                    const Icon = item.icon;
                    const active = interests.includes(item.name);

                    return (
                      <button
                        type="button"
                        key={item.name}
                        aria-pressed={active}
                        className={`interest-card ${
                          active ? "active" : ""
                        }`}
                        onClick={() =>
                          toggleInterest(item.name)
                        }
                      >

                        <span className="card-emoji">
                          {item.emoji}
                        </span>

                        <Icon
                          size={21}
                          className="interest-line-icon"
                        />

                        <strong>{item.name}</strong>
                        <small>{item.desc}</small>

                        {active && (
                          <CheckCircle2
                            size={18}
                            className="interest-check"
                          />
                        )}

                      </button>
                    );
                  })}

                </div>

                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  className="primary-button"
                  onClick={startExploring}
                >
                  Create my cultural experience
                  <ArrowRight size={18} />
                </button>

                <a
                  href="#ai-assistant"
                  className="ai-shortcut"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "9px",
                    marginTop: "20px",
                    fontSize: "13px",
                    color: "#31533e",
                    fontWeight: 700,
                  }}
                >
                  <Bot size={19} />
                  Or get recommendations from the AI agent
                  <ArrowRight size={16} />
                </a>

              </>
            )}

            {/* ===== STEP 2: USER DECISION ===== */}

            {step === "choose" && (
              <div className="decision">

                <div className="step-heading">
                  <span>02</span>
                  Your adventure, your decision
                </div>

                <div className="agent-avatar">
                  <Sparkles size={29} />
                </div>

                <span className="eyebrow dark">
                  CULTUREQUEST HAS A QUESTION
                </span>

                <h2>
                  What would you most like to discover in{" "}
                  {destination}?
                </h2>

                <p>
                  Your interests have inspired these choices.
                  Pick the experience that excites you most.
                </p>

                <div className="option-list">

                  {interests.map((interest) => (
                    <button
                      type="button"
                      key={interest}
                      className={`option ${
                        selectedChoice === interest
                          ? "chosen"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedChoice(interest);
                        setError("");
                      }}
                    >
                      <span className="option-radio" />

                      Explore {interest.toLowerCase()}

                      <ArrowRight size={17} />
                    </button>
                  ))}

                  <button
                    type="button"
                    className={`option ${
                      selectedChoice === "Other"
                        ? "chosen"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedChoice("Other");
                      setError("");
                    }}
                  >

                    <span className="option-radio" />

                    Something else — I have my own idea

                    <ArrowRight size={17} />

                  </button>

                </div>

                {selectedChoice === "Other" && (
                  <textarea
                    rows={3}
                    value={customChoice}
                    onChange={(e) =>
                      setCustomChoice(e.target.value)
                    }
                    placeholder="Tell us what you'd love to discover..."
                  />
                )}

                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}

                <div className="button-row">

                  <button
                    className="secondary-button"
                    onClick={() => {
                      setStep("explore");
                      setError("");
                    }}
                  >
                    <ArrowLeft size={17} />
                    Back
                  </button>

                  <button
                    className="primary-button"
                    onClick={continueJourney}
                  >
                    Continue my journey
                    <ArrowRight size={17} />
                  </button>

                </div>

              </div>
            )}

            {/* ===== STEP 3: SAMPLE RESULTS ===== */}

            {step === "results" && (
              <div className="results">

                <div className="step-heading">
                  <span>03</span>
                  Your personalized inspiration
                </div>

                <div className="results-top">

                  <div>
                    <span className="eyebrow dark">
                      YOUR NEXT CHAPTER
                    </span>

                    <h2>
                      A cultural adventure in {destination}
                    </h2>

                    <p>
                      Inspired by your choice:{" "}
                      <strong>{answer}</strong>
                    </p>
                  </div>

                  <button
                    className={`save-button ${
                      saved ? "saved" : ""
                    }`}
                    onClick={() => setSaved(!saved)}
                    title="Favorite this experience"
                    aria-label={
                      saved
                        ? "Remove favorite"
                        : "Favorite experience"
                    }
                    aria-pressed={saved}
                  >
                    <Heart
                      size={24}
                      fill={
                        saved ? "currentColor" : "none"
                      }
                    />
                  </button>

                </div>

                <div className="info-strip">

                  <span>
                    <MapPin size={16} />
                    {destination}
                  </span>

                  <span>
                    <Wallet size={16} />
                    ${budget} budget
                  </span>

                  <span>
                    <Clock size={16} />
                    Flexible afternoon
                  </span>

                </div>

                <div className="info-message">

                  <Sparkles size={19} />

                  <span>
                    This is an example activity plan.
                    Live places, prices, and opening hours
                    have not yet been verified.
                  </span>

                </div>

                <div className="timeline">

                  {experiences[chosenInterest].map(
                    (activity, i) => (
                      <div
                        className="timeline-item"
                        key={activity}
                      >

                        <span className="timeline-number">
                          {i + 1}
                        </span>

                        <div>

                          <small>
                            EXPERIENCE {i + 1}
                          </small>

                          <h3>{activity}</h3>

                          <p>
                            An activity inspired by your
                            interests, designed for exploring{" "}
                            {destination}.
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>

                <button
                  className="primary-button"
                  onClick={reset}
                >
                  <RotateCcw size={17} />
                  Plan another adventure
                </button>

                <a
                  href="#ai-assistant"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "22px",
                    color: "#31533e",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  <Bot size={19} />
                  Ask AI for personalized recommendations
                  <ArrowRight size={17} />
                </a>

              </div>
            )}

          </main>

          {/* ================= SIDEBAR ================= */}

          <aside className="sidebar" id="about">

            <span className="eyebrow">
              ✦ THE CULTUREQUEST WAY
            </span>

            <h3>
              Go places. Feel things. Collect stories.
            </h3>

            <p>
              Travel is more meaningful when you experience
              the world through what genuinely interests you.
            </p>

            <div className="sidebar-rule" />

            <div className="sidebar-item">
              <BookOpen size={23} />

              <div>
                <strong>Follow your curiosity</strong>
                <p>
                  Discover experiences inspired by your
                  favorite things.
                </p>
              </div>
            </div>

            <div className="sidebar-item">
              <Coffee size={23} />

              <div>
                <strong>Experience local culture</strong>
                <p>
                  Make room for everyday discoveries.
                </p>
              </div>
            </div>

            <div className="sidebar-item">
              <Feather size={23} />

              <div>
                <strong>Make it your story</strong>
                <p>
                  Let every new place become a memory
                  or a poem.
                </p>
              </div>
            </div>

            <div className="sidebar-footer">
              Made for curious minds & wandering hearts. ♡
            </div>

          </aside>

        </div>
      </section>

      {/* ================ AI AGENT ================ */}

      <AgentPanel
        destination={destination}
        budget={budget}
        interests={interests}
      />

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <span>
          <Compass size={20} />
          culturequest.
        </span>

        <p>
          Discover beyond the ordinary.
        </p>

        <small>
          © 2026 CultureQuest
        </small>

      </footer>

    </div>
  );
}
