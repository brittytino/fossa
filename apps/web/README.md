<p align="center">
  <img alt="fossalogo" src="https://github.com/brittytino/fossa/wp-content/uploads/2025/04/fossaweb.png">
</p>

<p align="center">
  <a href="https://github.com/brittytino/fossa" target="_blank">Website</a>
  ·
  <a href="https://discord.gg/6WbWrRbsH7" target="_blank">Community</a>
  ·
  <a href="https://docs.fossa.local" target="_blank">Docs</a>
  ·
  <a href="https://app.fossa.local" target="_blank"><strong>Try Fossa Cloud »</strong></a>
</p>

<p align="center">
   <a href="https://github.com/brittytino/fossa" target="_blank"><img src="https://img.shields.io/github/stars/brittytino/fossa" alt="Github Stars"></a>
   <a href="../../license.md"><img src="https://img.shields.io/badge/license-AGPLv3-red" alt="License"></a>
</p>

<h3 align="center">A modern, intuitive interface for managing your code reviews.</h3>

<br/>

## About Fossa Web

Fossa Web is the official web interface for Fossa, delivering a modern and intuitive experience for managing your code reviews.

This app is part of the Fossa monorepo at `apps/web`.

### Key Features

- **Modern Interface** — Clean and intuitive design that makes navigation and review management a breeze
- **Responsive Design** — Perfectly crafted for both desktop and mobile devices
- **Dark Mode** — Eye-friendly dark theme for comfortable viewing
- **API Integration** — Efficient communication with the Fossa backend

## Getting Started

### Prerequisites

- Node.js 22.x
- pnpm
- Docker

### Installation

1. Clone the monorepo:

```bash
git clone https://github.com/brittytino/fossa.git
cd fossa-ai
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment and generated secrets:

```bash
pnpm setup
```

4. Run web in development mode:

```bash
pnpm web:dev
```

Optional: run full stack (backend + web + infra):

```bash
pnpm docker:start
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**:
    - Tailwind CSS
    - Radix UI
    - Lucide React
- **State Management**:
    - React Query (TanStack Query)
    - React Hook Form
- **Authentication**: NextAuth.js
- **Data Visualization**: Victory
- **Development Tools**:
    - ESLint
    - Prettier
    - TypeScript
    - Docker

## Contributing

We welcome contributions!
