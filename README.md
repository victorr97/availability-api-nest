## 🧪 Technical Challenge — Backend Developer

Welcome to your technical challenge! This test is designed to evaluate your backend development skills using Node.js and TypeScript in a context inspired by a real tourism marketplace.

---

### 🧭 Context

You are joining a travel marketplace that connects customers with iconic tourist attractions across Europe. We receive availability updates from different monuments **every minute**, and we want to build an intelligent system (an “engine”) that helps us:

- Predict availability (forecasting)
- Suggest marketing actions based on trends - You can use LLM to generate insights
- Recommend price increases when demand is high

You’ve been provided with a base API to simulate the availability data source.

---

### 🗂 What You’re Given

You’ll find:

- A Node.js + TypeScript project with Express
- A single working endpoint:

GET /availability/by-date?start=YYYY-MM-DD&end=YYYY-MM-DD

This endpoint returns a list of availability records for a given date range.

- A folder `/data/` containing **46 JSON files** simulating availability:
- 30 days into the future
- 10 historical days
- 6 updates from "today"

- A README file including UUID mappings for:
- `city`
- `venue`
- `activity`

## 🏙️ City UUIDs

| City       | UUID                                   |
|------------|----------------------------------------|
| Barcelona  | `5ff8e5f2-98d9-4321-8ae4-3f6c48c7f8d9` |
| Roma       | `d10bded7-b89e-4609-a25a-39b1a7a37fa6` |
| París      | `a1c9f902-4572-4fd7-aaf5-8fd8be37c171` |
| Madrid     | `d2e87f4e-03b3-4302-8f8e-3cf3463b36ef` |
| Praga      | `bd4aa8f4-e281-438c-b8ce-c204b63401f1` |

## 🏛️ Venue UUIDs

| Venue               | UUID                                   |
|---------------------|----------------------------------------|
| Sagrada Familia     | `f3067eb5-9435-4a84-a6b5-3c0b4a9f18cf` |
| Coliseo             | `35bcebc7-4f47-4d29-bb0d-723af764f89e` |
| Torre Eiffel        | `b9222c3c-0458-44d2-a660-4d06495f189f` |
| Museo del Prado     | `5b3fc20b-37a5-4d84-83a0-fbdf0e1a81b7` |
| Castillo de Praga   | `47c2f804-225b-4e7a-95a1-fd6673e99c32` |

## 🎟️ Activity UUIDs

| Activity                             | UUID                                   |
|--------------------------------------|----------------------------------------|
| Entrada general Sagrada Familia      | `a969d9f6-f7d6-43d1-9a36-02de49b7bce3` |
| Visita guiada Coliseo + Foro         | `c9fba3f0-20c3-4416-bc71-8c87b9d6b339` |
| Acceso prioritario Torre Eiffel      | `2a4a8d5b-66ee-4c9b-a47c-d4d6ea17d64e` |
| Entrada + guía Museo del Prado       | `5c4a4e3c-ec99-4a6a-aeb4-9c21e4a36842` |
| Tour histórico Castillo de Praga     | `e0b2a7b6-e92d-4ae5-8f38-0c43aee39419` |

---

### 🛠 Your Task

You need to build a system that will allow us to make smarter decisions based on this availability data.

You are free to design the structure as you prefer, but your solution must include **at least**:

#### 1. 📊 Forecasting Module
- Predict future availability levels for a given activity based on current trends
- This could be as simple as linear extrapolation or more advanced if you like

#### 2. 💡 Marketing Insights Module
- Highlight activities with high demand but low availability (e.g. "running out fast")
- Identify cities or venues that are trending in availability

#### 3. 💸 Dynamic Pricing Suggestion
- For activities with consistent high demand and low stock, suggest a price increase
- Define simple thresholds and justify your logic

---

### 🧰 Bonus Points

- Use TypeScript properly (types, interfaces)
- Clean, modular structure
- RESTful API design
- Tests (optional, but a plus)
- Creativity in your insights & logic

---

### ✅ Submission Instructions

- Zip your project and submit it via email or the method provided
- Include any setup steps in your README
- If you add new endpoints or features, document them clearly