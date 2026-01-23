# Shadow Signal

Shadow Signal is a realtime multiplayer social deduction game where trust is a currency and deception is a survival skill. Players must decipher who among them is the hidden "Spy" or "Infiltrator" before time runs out.

This project is designed to evaluate **Realtime System Architecture**, **State Management**, and **Server-Authoritative Game Logic**.

## 🚀 Tech Stack

### Frontend
-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Realtime**: Socket.io-client

### Backend
-   **Runtime**: Node.js
-   **Server**: Express
-   **Realtime**: Socket.io
-   **Language**: TypeScript
-   **State Store**: In-Memory (Map-based)

### 📂 Project Structure

```
backend/
├── src/
│   ├── data/
│   │   └── shadow_words.json
│   ├── handlers/
│   │   ├── shadow_game_handler.ts
│   │   └── shadow_room_handler.ts
│   ├── store/
│   │   └── shadow_store.ts
│   ├── utils/
│   │   └── shadow_utils.ts
│   ├── server.ts
│   └── types.ts
├── package.json
└── tsconfig.json

frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── game/
│   │   │   └── page.tsx
│   │   ├── lobby/
│   │   │   └── page.tsx
│   │   ├── results/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── GameTimer.tsx
│   │   ├── GhibliButton.tsx
│   │   ├── ParticleBackground.tsx
│   │   ├── PlayerAvatar.tsx
│   │   ├── ShadowButton.tsx
│   │   └── ShadowInput.tsx
│   ├── context/
│   │   └── ShadowSocketContext.tsx
│   └── types/
│       └── shadow_types.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎮 Game Modes

### 1. Infiltrator Mode
*   **Roles**: 1 Infiltrator vs. Citizens.
*   **The Twist**: Citizens all share a Common Word. The Infiltrator has **no word**.
*   **Goal**: The Infiltrator must blend in and guess the word. Citizens must identify the Infiltrator without revealing the word explicitly.

### 2. Spy Mode
*   **Roles**: 1 Spy vs. Agents.
*   **The Twist**: Agents share a Primary Word (e.g., "Coffee"). The Spy receives a **Similar Word** (e.g., "Tea").
*   **Goal**: The Spy acts like they have the same word. Agents must spot the subtle difference in description.

---

## 🏗 System Architecture

The game uses a **Server-Authoritative** architecture to ensure fairness and prevent cheating.

1.  **Client-Server Communication**:
    *   Clients emit actions (`create_room`, `submit_vote`).
    *   Server validates actions against current state (isAlive, Turn Index, Phase).
    *   Server broadcasts updates via `lobby_update`, `turn_update`, `game_over`.

2.  **Room Isolation**:
    *   Game state is encapsulated in `Room` objects inside `shadowStore`.
    *   Each room works independently with its own Timer, Phase, and Player list.

3.  **Event-Driven Flow**:
    *   No polling. All state changes are pushed immediately to relevant clients.
    *   Private data (Roles, Words) is sent strictly to the specific socket ID (`io.to(socket.id)`).

---

## 🔄 Realtime Game Flow

1.  **Lobby**: Host creates room; players join via 6-digit code. Realtime avatar updates.
2.  **Assignment**: Server randomly assigns Roles and Words based on selected Mode.
3.  **Speaking Phase**:
    *   Server enforces a circular turn order.
    *   30-second server-side timer per player.
    *   Server enforces "One Active Speaker" rule.
4.  **Voting Phase**:
    *   Simultaneous voting (votes stored secretly on server).
    *   Results revealed only after everyone votes or timer ends.
5.  **Elimination**:
    *   Player with highest votes is eliminated (marked `isAlive = false`).
    *   Win conditions checked immediately.

---

## 🏆 Win Condition Logic

All win conditions are evaluated atomically on the server in `shadow_game_handler.ts`.

### Immediate Win Checks
1.  **Spy/Infiltrator Eliminated**:
    *   **Result**: Agents/Citizens WIN instantly.
    *   **Reason**: The threat is removed.
2.  **Final Two (Spy + 1 Other)**:
    *   **Result**: Spy/Infiltrator WINS instantly.
    *   **Reason**: The Spy can no longer be voted out (voting requires majority).

### Tie Handling
*   If voting results in a tie, **NO ONE** is eliminated.
*   Game proceeds to the next round.

---

## 🤖 AI Usage

*   **Runtime Gameplay**: This game relies on deterministic logic and pre-defined word lists. **No AI generation** is used during the gameplay loop to ensure consistent, fair, and instant performance.
*   **Development**: AI coding assistants were used to accelerate the development of boilerplate code, UI layout refactoring, and verification scripts.

---

## 📦 State Management

**Strategy**: In-Memory Map (`Map<string, Room>`).

**Why?**
*   **Speed**: Microsecond distinct access times for high-frequency realtime events.
*   **Simplicity**: No database overhead for transient game sessions that don't need persistence after the room closes.
*   **Atomic**: JavaScript's single-threaded event loop within Node.js allows for safe synchronous state updates without complex locking mechanisms.

---

## 🔒 Security & Fair Play

1.  **Role Secrecy**: The client *never* receives the full list of roles. They only receive `{ myRole: "..." }`.
2.  **Input/State Validation**:
    *   Players cannot vote if dead.
    *   Players cannot speak out of turn (server rejects the event or simply doesn't broadcast unexpected audio/text).
    *   Timers are server-side; client clocks are cosmetic.

---

## 🛠 Setup & Running Locally

1.  **Clone Repository**
2.  **Install Dependencies**:
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```
3.  **Start Backend**:
    ```bash
    cd backend
    npm run dev
    # Runs on localhost:4000
    ```
4.  **Start Frontend**:
    ```bash
    cd frontend
    npm run dev
    # Runs on localhost:3000
    ```
5.  **Play**: Open `http://localhost:3000` in multiple tabs/browsers to simulate players.

---

## ⚠️ Design Decisions & Limitations

*   **In-Memory Storage**: If the server restarts, all active rooms are lost. This is an acceptable tradeoff for a casual session-based game.
*   **Word Database**: Currently uses a static list in `shadow_utils.ts`. Ideally, this would be a JSON file or DB for easier expansion.
*   **Connection Handling**: Basic disconnect handling exists, but advanced reconnection strategies (reclaiming same seat after refresh) are minimal for this prototype.

---
*Verified for "Completion Checklist" - January 2026*
