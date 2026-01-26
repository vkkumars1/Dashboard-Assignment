# Dashboard Builder POC - Submission

## How to Run Locally (Docker)
The easiest way to get everything running is using Docker Compose. Run this single command from the root directory:

```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Technical Highlights (Evaluation Wins)

### Abstraction: Shell vs Widget Logic
I implemented a Registry Pattern (see frontend/src/engine/WidgetRegistry.ts) that completely decouples the dashboard grid from the chart implementations. The Shell only manages positions and rendering, while widgets act as self-contained plugins.

### Data Handling: Robust Transformations
Every piece of data is validated on the backend using Zod schemas before it ever reaches the frontend. This ensures a strict contract between the API and the UI, making data transformation predictable and safe.

### Resiliency: Per-Widget Failure Handling
The dashboard is built to be resilient. Using a centralized WidgetRenderer, I ensure that if a single widget API fails or returns bad data, only that specific widget shows an error state. The rest of the dashboard remains fully interactive and functional.

### DX: Scalable & Readable
The project follows a clean monorepo structure with frontend and backend separated. Adding a fifth chart type is as simple as registering it in the Registry and adding a backend generator—zero changes are needed to the core dashboard logic.

---

## Architectural Decision Record (ADR)

### 1. State Management: Zustand
- Why: I needed a lightweight, zero-boilerplate solution that handles both layout updates and widget data caching. 
- Benefit: It allows for high-performance stable state references, preventing unnecessary React re-renders which is critical for smooth animations. It bridges local state and localStorage persistence perfectly.

### 2. Charting Library: Recharts
- Why: Recharts uses a composable SVG-based API that fits naturally with my Registry pattern. 
- Benefit: It allows each widget to be lazy-loaded on demand, keeping the initial bundle size small while providing responsive visualizations out of the box.

---

## Handling Data Drift in Production
If this system were connected to a live production stream, I would handle Data Drift using this strategy:

1. Backend Validation: Every API response passes through a Zod schema. If format drifts, Zod catches it before garbage data reaches the UI.
2. Versioning with Transform: I would use Zod's transform method to silently map older API versions to the current UI format, allowing the backend to evolve safely.
3. Resilience: My UI architecture ensures that drift in one data source doesn't crash the entire user experience.
