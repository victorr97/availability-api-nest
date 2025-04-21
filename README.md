# Availability API

This project is a backend API built with NestJS to manage availability data for a tourism marketplace. It includes features for forecasting, marketing insights, and dynamic pricing suggestions using LLMs (Large Language Models).

---

## 🧠 LLM Options: Bedrock vs Ollama

The project supports two different LLM providers:

- **AWS Bedrock (Claude model)** – Recommended  
- **Local Ollama container (Mistral model)**

You can choose which provider to use via an environment variable.  
**Bedrock is recommended** because it offloads computation to the cloud and doesn't consume local resources, making it much more efficient for development and testing.  
Ollama runs locally but requires downloading a large model (over 5GB) and a powerful machine.

---

## 🚀 How to Use the Project with Docker Compose

### 🛠️ 1. Configure Environment Variables

Create a `.env` file in the **root** directory of the project with the following variables if using **Bedrock**:

```
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
AWS_REGION=***
BEDROCK_MODEL_ID=***
LLM_PROVIDER=bedrock
```

This configuration is required for connecting to the Bedrock Claude model.

---

### ▶️ 2. Start the Project with Bedrock (Recommended)

```bash
docker compose up
```

This command will:

- Build and run the API container
- Connect to the Bedrock LLM provider
- **Will NOT** download the Ollama container or the Mistral model

---

### 🔍 3. Test the API

You can test the LLM-powered endpoint like this:

```bash
http://localhost:3002/marketing/insights?prompt=¿Qué horario es el más popular en la Sagrada Familia?
```

Example response:
```json
{
  "insight": "¡Hola! Como experto en marketing turístico, te recomiendo reservar cuanto antes la Entrada general Sagrada Familia en Barcelona para el 9 de abril de 2025 a las 15:30. ¡Se están agotando las últimas plazas disponibles! La Sagrada Familia está arrasando esta temporada..."
}
```

At this point, your API is running and connected to the Bedrock LLM.

---

## 🔄 Switching to Local Ollama (Optional)

If you'd rather test locally with Mistral:

### ⛔️ 1. Stop and Clean the Previous Setup

```bash
docker compose down
```

To clean all images (optional, but useful):

```bash
docker system prune -a
```

> ⚠️ Warning: `prune -a` will remove **all Docker images**, so only use it if you’re sure. Avoid if using Docker for other projects.

---

### ⚙️ 2. Reconfigure for Ollama

Update your `.env` file:

```
LLM_PROVIDER=ollama
```

---

### 🏗️ 3. Start the Project with Ollama

```bash
docker compose --profile ollama up
```

This will:

- Start both the API container and the Ollama container

Then, download the Mistral model (only required once):

```bash
docker compose exec ollama ollama pull mistral
```

> This may take a while — the model is over 5GB and will consume local resources.

---

### 🧪 4. Test the Local API

Once everything is up, test an endpoint like:

```bash
http://localhost:3002/marketing/insights?prompt=¿Qué dia del mes de abril me recomiendas visitar Roma?
```

⚠️ The response time depends on your machine. Expect longer delays with large models.

Example response:
   ```json
   {
     "insight": "¡Amigo viajero, para ti es la oportunidad perfecta! El día recomendado para tu visita turística a Roma sería el 9 de abril de este año, más específicamente a las 13:00. Ese día hay un total de 493 entradas disponibles en nuestra popular visita guiada Coliseo + Foro..."
   }
   ```
---

## 🧹 Code Quality

### **Linting**
```bash
npm run lint
```

### **Fix Linting Issues**
```bash
npm run lint:fix
```

### **Check Formatting**
```bash
npm run prettier:check
```

---

## 🧪 Testing

### **Run Unit Tests**
```bash
npm run test:unit
```

### **Run Integration Tests**
```bash
npm run test:integration
```

### **Watch Tests**
```bash
npm run test:watch
```

### **Test Coverage**
```bash
npm run test:cov
```

---

## 🧹 Clean the Project
```bash
npm run clean
```

---

## 📄 API Documentation

The API documentation is automatically generated using Swagger. Once the server is running, you can access it at:

- Swagger UI: http://localhost:3002/api

Here, you'll be able to browse and interact with all available API endpoints, including their HTTP methods, parameters, expected responses, and example requests. It's a powerful tool for exploring and testing the backend functionality.

---

## 📋 Important Notes

The project exposes port 3002. If you need to change it, update the `docker-compose.yml` file and the ports section.  
Ensure that port 3002 is not being used by another service on your machine.

if you are using Ollama as your LLM provider, note that in addition to port 3002 used by the main API, the Ollama container exposes port 11434, so make sure that no other services on your machine are using that port to avoid conflicts.

---

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

---

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
