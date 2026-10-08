# TraceMint ₮

> **“Your work. Proven.”**  
> The developer proof-of-work platform turning commits, PRs, deployments, and hackathon wins into verified credibility.

---

## ⚡ Overview

**TraceMint** is a modern developer credential platform inspired by Linear, Vercel, and Y Combinator early-stage startups. Instead of relying on static, keyword-stuffed PDF resumes or noisy unfiltered GitHub profiles, TraceMint indexes ground-truth engineering activity:

- **Code Authenticity**: Cryptographic commit verification and author attribution.
- **Unified Timeline**: Commits, hackathons (ETHGlobal, Devpost), deployments, and releases in one chronological stream.
- **Production Validation**: Live health checks, p99 latencies, and uptime verification across Vercel, AWS, Cloudflare, and Docker.
- **Algorithmic Proof Score**: A 0–100 credibility metric based on PR velocity, repo longevity, and code complexity.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20 & 22)
- npm or pnpm or yarn

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/Akifali-1/tracemint.git
cd tracemint

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛠 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Inter, JetBrains Mono, Plus Jakarta Sans

---

## 📁 Project Structure

```text
tracemint/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx              # Responsive header & navigation
│   │   ├── Footer.jsx              # Platform footer & status indicators
│   │   ├── ProfilePreviewCard.jsx  # Interactive proof dashboard & heatmap
│   │   └── DemoModal.jsx           # Live profile generation simulator
│   ├── pages/           # Platform views
│   │   ├── HomePage.jsx            # Hero, comparison, features, CTA
│   │   ├── HowItWorksPage.jsx      # 3-step pipeline & interactive CLI mockup
│   │   └── AboutPage.jsx           # Manifesto, thesis & maker values
│   ├── data/
│   │   └── mockData.js             # Realistic developer datasets
│   ├── App.jsx          # Root layout & page router
│   ├── main.jsx         # App mounting
│   └── index.css        # Tailwind styles & design tokens
├── tailwind.config.js   # Tailored slate/cyan palette & typography
├── vite.config.js       # Vite configuration
└── package.json
```

---

## 📄 License

MIT © [TraceMint](https://github.com/Akifali-1/tracemint)
