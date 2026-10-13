
# CultureQuest: Human-in-the-Loop AI Cultural Companion

CultureQuest is a Pi Coding Agent extension that helps users make
personalized decisions about travel, books, food, music, poetry,
and language learning.

## Problem

AI agents sometimes make important decisions without asking
users about their preferences.

For example, when planning an afternoon in Seoul, an AI might
recommend restaurants even though the user would rather
visit bookstores or listen to live music.

## Solution

CultureQuest introduces an `ask_user` tool that pauses the
agent's workflow and requests the user's decision.

The agent then uses that answer to continue its task.

## Features

- Interactive multiple-choice questions
- Custom user answers
- Cancellation handling
- Empty-response handling
- Graceful behavior when interactive UI is unavailable
- Automated tests using Vitest

## Technologies

- TypeScript
- Pi Coding Agent
- OpenRouter (optional, including free models)
- Vitest

## Installation

Requirements:
- Node.js
- npm
- Pi Coding Agent CLI

Clone the repository:

```bash
git clone https://github.com/Kesline/Culturalquest_AI_agent.git
cd Culturalquest_AI_agent
npm install
```

## Running the Extension

Start Pi with the extension:

```bash
pi -e ./extensions/ask-user.ts
```

Use a model that supports tool calling.

Example prompt:

"I'm visiting Seoul. Use ask_user to ask whether I want
to explore bookstores, try Korean food, or discover live music.
Wait for my answer before planning my afternoon."

The agent should display the available options, collect the
user's decision, and continue using that decision.

## Running Automated Tests

```bash
npm test
```

The test suite verifies:
1. Tool registration
2. Selecting a predefined option
3. Providing a custom answer
4. Cancelling the selection
5. Submitting an empty custom answer
6. Cancelling custom input
7. Unavailable interactive UI
8. Custom-answer whitespace handling
9. Cancellation logic
10. Unavailable-UI logic

## Project Structure

```text
extensions/
  ask-user.ts
  ask-user-logic.ts

tests/
  ask-user.test.ts

package.json
README.md
```

## Demo

The demonstration shows an agent asking the user to choose a
cultural experience, receiving the decision, continuing its task,
and running the automated tests.

## Future Improvements

- Free OpenStreetMap-based place discovery
- Multilingual cultural recommendations
- Personalized travel itineraries
- Poetry and travel journaling suggestions

## Author

Kesline Jean Baptiste
```
