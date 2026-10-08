export const sampleProfiles = [
  {
    name: "Alex Rivera",
    handle: "alexrivera.mint",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Full-Stack Systems Engineer",
    location: "San Francisco, CA",
    proofScore: 98.4,
    percentile: "Top 1.2%",
    stats: {
      commits: "3,842",
      prMerged: "412",
      projectsShipped: 14,
      deployments: 289,
      hackathonWins: 4
    },
    skills: [
      { name: "TypeScript", percentage: 96, verifiedCount: "1.4k commits" },
      { name: "Rust", percentage: 88, verifiedCount: "620 commits" },
      { name: "React / Next.js", percentage: 94, verifiedCount: "98 PRs" },
      { name: "PostgreSQL & Redis", percentage: 85, verifiedCount: "42 schemas" },
      { name: "Kubernetes & Docker", percentage: 78, verifiedCount: "18 manifests" }
    ],
    projects: [
      {
        title: "HyperQueue",
        description: "Zero-latency distributed job scheduler in Rust with sub-millisecond p99 latency.",
        tags: ["Rust", "Tokio", "gRPC", "Docker"],
        stars: 1240,
        commits: 340,
        status: "Production",
        verifiedUrl: "github.com/alexrivera/hyperqueue",
        deploymentUrl: "hyperqueue.internal.dev",
        date: "Shipped Oct 2024"
      },
      {
        title: "VaultStream",
        description: "End-to-end encrypted real-time audio pipeline with WebRTC and WebAssembly.",
        tags: ["TypeScript", "WebRTC", "Wasm", "Tailwind"],
        stars: 890,
        commits: 215,
        status: "Live on Vercel",
        verifiedUrl: "github.com/alexrivera/vaultstream",
        deploymentUrl: "vaultstream.app",
        date: "Shipped Jun 2024"
      },
      {
        title: "KubePulse",
        description: "Lightweight cluster observability agent consuming <12MB RAM with eBPF probes.",
        tags: ["Go", "eBPF", "Grafana", "Linux"],
        stars: 640,
        commits: 180,
        status: "Active Release v2.4",
        verifiedUrl: "github.com/alexrivera/kubepulse",
        deploymentUrl: "kubepulse.io",
        date: "Shipped Jan 2024"
      }
    ],
    hackathons: [
      {
        name: "ETHGlobal San Francisco",
        prize: "1st Place Grand Winner (Infrastructure)",
        project: "ZK-Trace Bridge",
        year: "2024"
      },
      {
        name: "CalHacks 11.0",
        prize: "Best Systems Architecture",
        project: "EdgeMesh",
        year: "2024"
      },
      {
        name: "HackMIT",
        prize: "Finalist & Developer Tooling Track Winner",
        project: "GitSentry",
        year: "2023"
      }
    ],
    deployments: [
      { name: "api.vaultstream.app", provider: "AWS ECS", status: "Healthy 99.99%", latency: "18ms", lastDeploy: "2 hours ago" },
      { name: "hyperqueue.internal.dev", provider: "Fly.io (Frankfurt)", status: "Active", latency: "6ms", lastDeploy: "Yesterday" },
      { name: "kubepulse-collector", provider: "Cloudflare Workers", status: "Active", latency: "12ms", lastDeploy: "3 days ago" }
    ],
    recentActivity: [
      {
        type: "pr_merge",
        text: "Merged PR #142 into main: Fix race condition in connection pooling",
        repo: "hyperqueue",
        time: "3 hours ago",
        hash: "e7b90f4"
      },
      {
        type: "deploy",
        text: "Production deployment v2.14.0 promoted to 100% canary traffic",
        repo: "vaultstream",
        time: "6 hours ago",
        hash: "c28da41"
      },
      {
        type: "hackathon",
        text: "Verified submission & badge claim: ETHGlobal SF 2024 Grand Winner",
        repo: "zk-trace-bridge",
        time: "Oct 2024",
        hash: "verified"
      },
      {
        type: "release",
        text: "Tagged release v2.4.0 with automated SBOM & signed commits",
        repo: "kubepulse",
        time: "3 days ago",
        hash: "7f4c91a"
      }
    ]
  },
  {
    name: "Elena Rostova",
    handle: "erostova.mint",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Compiler & Infrastructure Engineer",
    location: "Berlin, DE",
    proofScore: 97.1,
    percentile: "Top 2.1%",
    stats: {
      commits: "4,120",
      prMerged: "389",
      projectsShipped: 11,
      deployments: 194,
      hackathonWins: 3
    },
    skills: [
      { name: "Rust", percentage: 95, verifiedCount: "2.1k commits" },
      { name: "LLVM & C++", percentage: 89, verifiedCount: "45 PRs" },
      { name: "WebAssembly", percentage: 92, verifiedCount: "380 commits" },
      { name: "Go", percentage: 80, verifiedCount: "120 commits" }
    ],
    projects: [
      {
        title: "AuraIR",
        description: "Optimizing intermediate representation generator for domain-specific GPU shaders.",
        tags: ["Rust", "LLVM", "Vulkan", "SIMD"],
        stars: 1820,
        commits: 512,
        status: "Production v1.2",
        verifiedUrl: "github.com/erostova/aurair",
        deploymentUrl: "aurair.dev",
        date: "Shipped Dec 2024"
      }
    ],
    hackathons: [
      {
        name: "RustConf Hackathon",
        prize: "Best Open Source Tooling",
        project: "FastWasm-JIT",
        year: "2024"
      }
    ],
    deployments: [
      { name: "aurair-playground.dev", provider: "Vercel Edge", status: "Healthy", latency: "14ms", lastDeploy: "4 hours ago" }
    ],
    recentActivity: [
      {
        type: "pr_merge",
        text: "Merged PR #94: Vectorized SIMD pass for matrix multiplication",
        repo: "aurair",
        time: "1 hour ago",
        hash: "82a901f"
      }
    ]
  }
];

export const mockHeatmapWeeks = Array.from({ length: 24 }, (_, weekIdx) => {
  return Array.from({ length: 7 }, (_, dayIdx) => {
    // Generate realistic developer commit distribution
    const isWeekend = dayIdx === 0 || dayIdx === 6;
    const base = isWeekend ? Math.random() * 0.4 : Math.random() * 0.9;
    if (base < 0.25) return 0;
    if (base < 0.5) return 1;
    if (base < 0.75) return 2;
    if (base < 0.9) return 3;
    return 4;
  });
});
