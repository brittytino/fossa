const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function renderHtmlToPng(htmlContent, outputPath, width = 2400, height = 1400) {
  const tempHtml = path.join(os.tmpdir(), `fossa_diagram_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  const tempPng = path.join(os.tmpdir(), `fossa_screen_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);

  fs.writeFileSync(tempHtml, htmlContent, 'utf-8');

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1.5',
    `--window-size=${width},${height}`,
    `--screenshot=${tempPng}`,
    `file:///${tempHtml.replace(/\\/g, '/')}`
  ];

  console.log(`Rendering ${path.basename(outputPath)} (${width}x${height})...`);
  const res = spawnSync(chromePath, args);
  if (res.status !== 0) {
    console.error('Chrome error:', res.stderr.toString());
    throw new Error(`Chrome failed with status ${res.status}`);
  }

  if (!fs.existsSync(tempPng)) {
    throw new Error(`Output file was not created: ${tempPng}`);
  }

  fs.copyFileSync(tempPng, outputPath);
  console.log(`Saved ${outputPath} (${fs.statSync(outputPath).size} bytes)`);

  try {
    fs.unlinkSync(tempHtml);
    fs.unlinkSync(tempPng);
  } catch (e) {}
}

// -------------------------------------------------------------
// DIAGRAM 1: fossa-architecture.png
// -------------------------------------------------------------
function getArchitectureHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FOSSA Architecture</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 2400px;
      height: 1420px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 48px;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(234, 88, 12, 0.05) 0%, transparent 40%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
    }

    /* Top Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 28px;
      border-bottom: 1px solid rgba(245, 158, 11, 0.25);
      margin-bottom: 36px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .logo-shield {
      width: 56px;
      height: 56px;
      filter: drop-shadow(0 0 16px rgba(245, 158, 11, 0.4));
    }
    .title-col h1 {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .title-col h1 span.fossa-text {
      color: #FFFFFF;
    }
    .title-col h1 span.highlight {
      background: linear-gradient(135deg, #FDE047 0%, #F59E0B 50%, #EA580C 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .title-col p {
      font-size: 16px;
      color: #94A3B8;
      margin-top: 4px;
    }
    .header-badges {
      display: flex;
      gap: 12px;
    }
    .badge {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #FBBF24;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
    }
    .badge-oss {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34D399;
    }

    /* Main Grid */
    .grid {
      display: grid;
      grid-template-columns: 460px 480px 520px 760px;
      gap: 28px;
      flex: 1;
    }

    .column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .card {
      background: #0B0D14;
      border: 1px solid #1E2235;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }
    .card.primary-border {
      border: 1px solid rgba(245, 158, 11, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.05);
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .card-title .icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
      font-size: 13px;
      font-weight: bold;
    }
    .card-sub {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 16px;
    }

    .item-box {
      background: #12141F;
      border: 1px solid #23273D;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .item-box:last-child {
      margin-bottom: 0;
    }
    .item-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .item-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #1B1E30;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .item-name {
      font-size: 14px;
      font-weight: 600;
      color: #E2E8F0;
    }
    .item-desc {
      font-size: 12px;
      color: #64748B;
      margin-top: 2px;
    }
    .tag {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.12);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .tag-blue {
      background: rgba(59, 130, 246, 0.12);
      color: #60A5FA;
      border: 1px solid rgba(59, 130, 246, 0.25);
    }
    .tag-green {
      background: rgba(16, 185, 129, 0.12);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .tag-purple {
      background: rgba(168, 85, 247, 0.12);
      color: #C084FC;
      border: 1px solid rgba(168, 85, 247, 0.25);
    }

    /* Flow connector arrows */
    .flow-note {
      background: rgba(245, 158, 11, 0.05);
      border-left: 3px solid #F59E0B;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #CBD5E1;
      margin-top: 12px;
      line-height: 1.4;
    }

    /* Bottom Status bar */
    .footer-bar {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #1E2235;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #64748B;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .dot-online {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      margin-right: 6px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand-left">
      <svg class="logo-shield" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L7 11V22C7 33.1 14.3 43.4 24 46C33.7 43.4 41 33.1 41 22V11L24 4Z" fill="url(#gold_grad)" stroke="#F59E0B" stroke-width="2"/>
        <path d="M24 12V38C30.6 35.8 35.5 28 35.5 20.5V12L24 12Z" fill="white" fill-opacity="0.2"/>
        <path d="M24 16L18 24H30L24 16Z" fill="#000000"/>
        <defs>
          <linearGradient id="gold_grad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FDE047"/>
            <stop offset="0.5" stop-color="#F59E0B"/>
            <stop offset="1" stop-color="#EA580C"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="title-col">
        <h1><span class="fossa-text">FOSSA</span> <span class="highlight">SYSTEM ARCHITECTURE</span></h1>
        <p>Production Topology & Monorepo Distributed Execution Engine</p>
      </div>
    </div>
    <div class="header-badges">
      <span class="badge">v2.4.0 Engine</span>
      <span class="badge badge-oss">AGPL-3.0 Open Source</span>
      <span class="badge">100% Free Self-Hosted</span>
    </div>
  </div>

  <!-- Main Architecture Grid -->
  <div class="grid">
    
    <!-- COLUMN 1: Ingress & Clients -->
    <div class="column">
      <div class="card">
        <div class="card-title">
          <span class="icon">GIT</span>
          Git SCM Integrations
        </div>
        <div class="card-sub">Event sources & webhook publishers</div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🐙</div>
            <div>
              <div class="item-name">GitHub</div>
              <div class="item-desc">App & Org Webhooks</div>
            </div>
          </div>
          <span class="tag">Active</span>
        </div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🦊</div>
            <div>
              <div class="item-name">GitLab</div>
              <div class="item-desc">Webhook & CI Pipelines</div>
            </div>
          </div>
          <span class="tag">Active</span>
        </div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">⭐</div>
            <div>
              <div class="item-name">Forgejo / Gitea</div>
              <div class="item-desc">Self-hosted Git triggers</div>
            </div>
          </div>
          <span class="tag">Active</span>
        </div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🔷</div>
            <div>
              <div class="item-name">Azure & Bitbucket</div>
              <div class="item-desc">Enterprise pull requests</div>
            </div>
          </div>
          <span class="tag">Active</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="icon">CLI</span>
          Developer Workstation
        </div>
        <div class="card-sub">Local terminal & pre-commit review</div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">💻</div>
            <div>
              <div class="item-name">fossa-cli</div>
              <div class="item-desc">Local diff & rule evaluator</div>
            </div>
          </div>
          <span class="tag-purple">Interactive</span>
        </div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🔑</div>
            <div>
              <div class="item-name">Team API Keys</div>
              <div class="item-desc">Bearer fossa_* tokens</div>
            </div>
          </div>
          <span class="tag">RBAC</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span class="icon">WEB</span>
          Fossa Web Dashboard
        </div>
        <div class="card-sub">Next.js 15 App Router & Cockpit</div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">⚡</div>
            <div>
              <div class="item-name">apps/web</div>
              <div class="item-desc">Next.js 15 + Radix UI + Tailwind 4</div>
            </div>
          </div>
          <span class="tag-blue">Frontend</span>
        </div>
        <div class="flow-note">
          Delivers Cockpit analytics, Fossy Rules studio, and MCP tool catalog with 0 artificial paywalls.
        </div>
      </div>
    </div>

    <!-- COLUMN 2: Ingestion & Message Broker -->
    <div class="column">
      <div class="card primary-border">
        <div class="card-title">
          <span class="icon">IN</span>
          Webhooks Ingestion
        </div>
        <div class="card-sub">apps/webhooks · High throughput gateway</div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">⚡</div>
            <div>
              <div class="item-name">HMAC Verifier</div>
              <div class="item-desc">Signature cryptographic check</div>
            </div>
          </div>
          <span class="tag-green">Secure</span>
        </div>
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">📦</div>
            <div>
              <div class="item-name">Outbox Pattern</div>
              <div class="item-desc">Transactional event persistence</div>
            </div>
          </div>
          <span class="tag">Guaranteed</span>
        </div>
        <div class="flow-note">
          Fire-and-forget receiver: ACKs Git providers in &lt;15ms to avoid timeout retries.
        </div>
      </div>

      <div class="card primary-border" style="flex: 1;">
        <div class="card-title">
          <span class="icon">MQ</span>
          RabbitMQ Message Broker
        </div>
        <div class="card-sub">Distributed quorum queues & outbox relay</div>
        
        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">📬</div>
            <div>
              <div class="item-name">fossa.webhooks</div>
              <div class="item-desc">Raw incoming Git payload events</div>
            </div>
          </div>
          <span class="tag-blue">Quorum</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">⚙️</div>
            <div>
              <div class="item-name">fossa.reviews</div>
              <div class="item-desc">Diff analysis & rule matching jobs</div>
            </div>
          </div>
          <span class="tag">High Priority</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">💬</div>
            <div>
              <div class="item-name">fossa.suggestions</div>
              <div class="item-desc">Inline review comments & checks</div>
            </div>
          </div>
          <span class="tag-green">Outbox</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🔁</div>
            <div>
              <div class="item-name">Delayed DLX Exchange</div>
              <div class="item-desc">Exponential backoff (5 retries)</div>
            </div>
          </div>
          <span class="tag-purple">Reliable</span>
        </div>

        <div class="flow-note">
          Inbox Pattern ensures zero duplicate reviews via distributed claim/release locking.
        </div>
      </div>
    </div>

    <!-- COLUMN 3: Core API & Worker -->
    <div class="column">
      <div class="card primary-border">
        <div class="card-title">
          <span class="icon">API</span>
          REST API Gateway
        </div>
        <div class="card-sub">apps/api · NestJS orchestration core</div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🛡️</div>
            <div>
              <div class="item-name">Auth & RBAC</div>
              <div class="item-desc">JWT, OAuth & @CheckPolicies</div>
            </div>
          </div>
          <span class="tag">Security</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">📜</div>
            <div>
              <div class="item-name">Fossy Rules Engine</div>
              <div class="item-desc">Org, repo & directory rule scoping</div>
            </div>
          </div>
          <span class="tag">Compiler</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🧩</div>
            <div>
              <div class="item-name">MCP Plugin Manager</div>
              <div class="item-desc">Catalog for tools & context providers</div>
            </div>
          </div>
          <span class="tag-blue">MCP Host</span>
        </div>
      </div>

      <div class="card primary-border" style="flex: 1;">
        <div class="card-title">
          <span class="icon">WRK</span>
          Execution Worker
        </div>
        <div class="card-sub">apps/worker · Review execution engine</div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🌲</div>
            <div>
              <div class="item-name">AST & Diff Extractor</div>
              <div class="item-desc">Per-file syntax tree generation</div>
            </div>
          </div>
          <span class="tag-green">Semantic</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🔍</div>
            <div>
              <div class="item-name">Cross-File Analyzer</div>
              <div class="item-desc">Coherence & architectural boundaries</div>
            </div>
          </div>
          <span class="tag">Context</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🧹</div>
            <div>
              <div class="item-name">Safeguard & Dedupe</div>
              <div class="item-desc">False positive noise filter</div>
            </div>
          </div>
          <span class="tag-purple">Heuristic</span>
        </div>

        <div class="flow-note">
          Runs asynchronously with claim/release idempotency, handling hundreds of concurrent PR reviews.
        </div>
      </div>
    </div>

    <!-- COLUMN 4: Data Stores & Universal BYOK -->
    <div class="column">
      <div class="card">
        <div class="card-title">
          <span class="icon">DB</span>
          Data & State Persistence
        </div>
        <div class="card-sub">Dual-database architecture + Redis lock tier</div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🐘</div>
            <div>
              <div class="item-name">PostgreSQL 16 (TypeORM)</div>
              <div class="item-desc">Users, teams, rules, review audits & outbox events</div>
            </div>
          </div>
          <span class="tag-blue">Relational</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🍃</div>
            <div>
              <div class="item-name">MongoDB 7 (Mongoose)</div>
              <div class="item-desc">Full PR diffs, AST cache, suggestion threads & history</div>
            </div>
          </div>
          <span class="tag-green">Documents</span>
        </div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">⚡</div>
            <div>
              <div class="item-name">Redis In-Memory</div>
              <div class="item-desc">Distributed locks, rate limits & token caches</div>
            </div>
          </div>
          <span class="tag">Cache & Lock</span>
        </div>
      </div>

      <div class="card primary-border" style="flex: 1;">
        <div class="card-title">
          <span class="icon">AI</span>
          Universal BYOK LLM Layer
        </div>
        <div class="card-sub">libs/llm · Unified inference gateway & failover router</div>

        <div class="item-box">
          <div class="item-left">
            <div class="item-icon">🎯</div>
            <div>
              <div class="item-name">Single LLM.run Door</div>
              <div class="item-desc">BYOKConfig routes to resolved NormalizedModel slot</div>
            </div>
          </div>
          <span class="tag">Unified API</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="item-box" style="margin-bottom: 0;">
            <div class="item-left">
              <div class="item-icon">🟣</div>
              <div>
                <div class="item-name">Anthropic</div>
                <div class="item-desc">Claude 3.7 Sonnet / Haiku</div>
              </div>
            </div>
          </div>
          <div class="item-box" style="margin-bottom: 0;">
            <div class="item-left">
              <div class="item-icon">🟢</div>
              <div>
                <div class="item-name">OpenAI</div>
                <div class="item-desc">GPT-4o, o3-mini</div>
              </div>
            </div>
          </div>
          <div class="item-box" style="margin-bottom: 0;">
            <div class="item-left">
              <div class="item-icon">🔵</div>
              <div>
                <div class="item-name">Google Gemini</div>
                <div class="item-desc">Gemini 2.5 Flash / Pro</div>
              </div>
            </div>
          </div>
          <div class="item-box" style="margin-bottom: 0;">
            <div class="item-left">
              <div class="item-icon">🌐</div>
              <div>
                <div class="item-name">OpenRouter</div>
                <div class="item-desc">DeepSeek, Llama 3.3, Qwen</div>
              </div>
            </div>
          </div>
        </div>

        <div class="item-box" style="margin-top: 10px;">
          <div class="item-left">
            <div class="item-icon">🖥️</div>
            <div>
              <div class="item-name">Local Inference (Ollama / vLLM)</div>
              <div class="item-desc">100% private, on-premise air-gapped code analysis</div>
            </div>
          </div>
          <span class="tag-purple">Air-Gapped</span>
        </div>

        <div class="flow-note" style="border-left-color: #10B981;">
          <strong style="color: #34D399;">Automatic Failover:</strong> Seamlessly routes to secondary fallback providers if rate-limited or experiencing upstream 5xx outages.
        </div>
      </div>
    </div>

  </div>

  <!-- Footer status bar -->
  <div class="footer-bar">
    <div class="footer-left">
      <span><span class="dot-online"></span>All Monorepo Services Active</span>
      <span>•</span>
      <span>Network: fossa-backend-services</span>
      <span>•</span>
      <span>Outbox Relay Pattern Enabled</span>
    </div>
    <div>FOSSA Code Review Platform — Built for Privacy, Precision & Performance</div>
  </div>

</body>
</html>
  `;
}

// -------------------------------------------------------------
// DIAGRAM 2: fossa_engine.png
// -------------------------------------------------------------
function getEngineHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FOSSA Review Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 2200px;
      height: 1250px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 48px;
      background-image: 
        radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.06) 0%, transparent 50%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 36px 36px, 36px 36px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(245, 158, 11, 0.25);
      margin-bottom: 36px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .logo-shield {
      width: 52px;
      height: 52px;
      filter: drop-shadow(0 0 16px rgba(245, 158, 11, 0.4));
    }
    .title-col h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .title-col h1 span.fossa-text { color: #FFFFFF; }
    .title-col h1 span.highlight {
      background: linear-gradient(135deg, #FDE047 0%, #F59E0B 50%, #EA580C 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .title-col p { font-size: 15px; color: #94A3B8; margin-top: 4px; }
    .header-badges { display: flex; gap: 12px; }
    .badge {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #FBBF24;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
    }

    /* Pipeline Flow */
    .pipeline-container {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 20px;
      flex: 1;
      position: relative;
    }

    .stage-card {
      background: #0B0D14;
      border: 1px solid #1E2235;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }
    .stage-card.featured {
      border: 1px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.08);
    }

    .stage-num {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #F59E0B;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .stage-title {
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 6px;
    }
    .stage-desc {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .card-block {
      background: #12141F;
      border: 1px solid #23273D;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .card-block-title {
      font-size: 13px;
      font-weight: 700;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .card-block-desc {
      font-size: 12px;
      color: #64748B;
      line-height: 1.4;
    }

    .tag-pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(245, 158, 11, 0.12);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.25);
      margin-top: 6px;
    }
    .tag-pill-green {
      background: rgba(16, 185, 129, 0.12);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .tag-pill-blue {
      background: rgba(59, 130, 246, 0.12);
      color: #60A5FA;
      border: 1px solid rgba(59, 130, 246, 0.25);
    }

    .arrow-indicator {
      position: absolute;
      top: 50%;
      right: -14px;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #000000;
      border: 1px solid #F59E0B;
      color: #F59E0B;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 10;
    }

    .footer-bar {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #1E2235;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #64748B;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand-left">
      <svg class="logo-shield" viewBox="0 0 48 48" fill="none">
        <path d="M24 4L7 11V22C7 33.1 14.3 43.4 24 46C33.7 43.4 41 33.1 41 22V11L24 4Z" fill="url(#gold_grad)" stroke="#F59E0B" stroke-width="2"/>
        <path d="M24 16L18 24H30L24 16Z" fill="#000000"/>
        <defs>
          <linearGradient id="gold_grad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FDE047"/>
            <stop offset="0.5" stop-color="#F59E0B"/>
            <stop offset="1" stop-color="#EA580C"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="title-col">
        <h1><span class="fossa-text">FOSSA</span> <span class="highlight">REVIEW ENGINE</span></h1>
        <p>Deterministic Multi-Pass Code Review Pipeline & Inference Harness</p>
      </div>
    </div>
    <div class="header-badges">
      <span class="badge">Dual-Pass Inference</span>
      <span class="badge">AST Context Parsing</span>
      <span class="badge">Zero Noise Safeguard</span>
    </div>
  </div>

  <!-- Pipeline Stages -->
  <div class="pipeline-container">
    
    <!-- Stage 1 -->
    <div class="stage-card">
      <div class="stage-num">Stage 01</div>
      <div class="stage-title">Ingest & Filter</div>
      <div class="stage-desc">Webhook reception, skip gates and scope validation.</div>

      <div class="card-block">
        <div class="card-block-title">⚡ Event Trigger</div>
        <div class="card-block-desc">PR opened, commit pushed, @fossy start-review, or fossa-cli invocation.</div>
        <span class="tag-pill">Outbox Queue</span>
      </div>

      <div class="card-block">
        <div class="card-block-title">🛑 Skip Decision Matrix</div>
        <div class="card-block-desc">Checks for merge commits, draft status, file count limits, or .fossaignore patterns.</div>
        <span class="tag-pill-green">Fast Path (&lt;50ms)</span>
      </div>

      <div class="card-block">
        <div class="card-block-title">🚀 Status Reaction</div>
        <div class="card-block-desc">Sets native emoji reaction on PR thread to notify developer.</div>
      </div>
      <div class="arrow-indicator">→</div>
    </div>

    <!-- Stage 2 -->
    <div class="stage-card">
      <div class="stage-num">Stage 02</div>
      <div class="stage-title">AST & Diff Analysis</div>
      <div class="stage-desc">Deep syntactic decomposition and dependency discovery.</div>

      <div class="card-block">
        <div class="card-block-title">🌲 Semantic Chunking</div>
        <div class="card-block-desc">Diff parsed into modified functions, classes, and import statements.</div>
      </div>

      <div class="card-block">
        <div class="card-block-title">🔗 Dependency Tree</div>
        <div class="card-block-desc">Resolves downstream call sites and affected type interfaces across repo.</div>
        <span class="tag-pill-blue">AST Cache</span>
      </div>

      <div class="card-block">
        <div class="card-block-title">📝 Context Packing</div>
        <div class="card-block-desc">Collects enclosing scope, related tests, and PR description intent.</div>
      </div>
      <div class="arrow-indicator">→</div>
    </div>

    <!-- Stage 3 -->
    <div class="stage-card featured">
      <div class="stage-num">Stage 03</div>
      <div class="stage-title">Fossy Rules & MCP</div>
      <div class="stage-desc">Rule matching and external context augmentation.</div>

      <div class="card-block">
        <div class="card-block-title">📜 Hierarchical Rules</div>
        <div class="card-block-desc">Organization policies + repo conventions + directory architecture rules.</div>
        <span class="tag-pill">Zero Limit</span>
      </div>

      <div class="card-block">
        <div class="card-block-title">🧩 MCP Tool Augmentation</div>
        <div class="card-block-desc">Context7 library docs, Jira ticket requirements, and OSV security lookups.</div>
        <span class="tag-pill">Live Tools</span>
      </div>

      <div class="card-block">
        <div class="card-block-title">🎯 Directive Synthesis</div>
        <div class="card-block-desc">Constructs high-precision prompt constraints for target files.</div>
      </div>
      <div class="arrow-indicator">→</div>
    </div>

    <!-- Stage 4 -->
    <div class="stage-card featured">
      <div class="stage-num">Stage 04</div>
      <div class="stage-title">Universal BYOK LLM</div>
      <div class="stage-desc">Dual-pass reasoning via single LLM.run gateway.</div>

      <div class="card-block">
        <div class="card-block-title">🔬 Pass A: File Deep Dive</div>
        <div class="card-block-desc">Detailed line-by-line inspection for bugs, security vulnerabilities, and leaks.</div>
      </div>

      <div class="card-block">
        <div class="card-block-title">🌐 Pass B: PR Coherence</div>
        <div class="card-block-desc">Evaluates holistic architecture, performance bottlenecks, and breaking changes.</div>
      </div>

      <div class="card-block">
        <div class="card-block-title">🔁 Provider Failover</div>
        <div class="card-block-desc">Automatic fallback (Claude → OpenAI → Gemini → Local) on 429 or timeout.</div>
        <span class="tag-pill-green">Zero Downtime</span>
      </div>
      <div class="arrow-indicator">→</div>
    </div>

    <!-- Stage 5 -->
    <div class="stage-card">
      <div class="stage-num">Stage 05</div>
      <div class="stage-title">Safeguards & Dispatch</div>
      <div class="stage-desc">False-positive deduplication and multi-channel publication.</div>

      <div class="card-block">
        <div class="card-block-title">🧹 Noise & Confidence Filter</div>
        <div class="card-block-desc">Removes nitpicks, deduplicates findings, and scores confidence &gt; 85%.</div>
        <span class="tag-pill-blue">Heuristic Gate</span>
      </div>

      <div class="card-block">
        <div class="card-block-title">💬 Multichannel Dispatch</div>
        <div class="card-block-desc">Publishes inline code fixes on GitHub/GitLab and prints interactive CLI report.</div>
      </div>

      <div class="card-block">
        <div class="card-block-title">🎉 Status Resolution</div>
        <div class="card-block-desc">Updates status reaction from 🚀 to 🎉 (completed) with review metrics.</div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer-bar">
    <div>Deterministic Pipeline · Idempotent Job Execution · Total Data Privacy</div>
    <div>FOSSA Engine Core · libs/code-review & libs/llm</div>
  </div>

</body>
</html>
  `;
}

// -------------------------------------------------------------
// DIAGRAM 3: fossa_plugins.png
// -------------------------------------------------------------
function getPluginsHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FOSSA MCP Plugins Manager</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 2200px;
      height: 1300px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Top App Navbar */
    .navbar {
      height: 72px;
      background: #08090D;
      border-bottom: 1px solid #1A1D2B;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
    }
    .nav-left {
      display: flex;
      align-items: center;
      gap: 36px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    .brand-shield {
      width: 32px;
      height: 32px;
      filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4));
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .nav-link {
      font-size: 15px;
      font-weight: 500;
      color: #94A3B8;
      text-decoration: none;
      padding: 8px 0;
      position: relative;
    }
    .nav-link.active {
      color: #F8FAFC;
      font-weight: 600;
    }
    .nav-link.active::after {
      content: "";
      position: absolute;
      bottom: -16px;
      left: 0;
      right: 0;
      height: 2px;
      background: #F59E0B;
      box-shadow: 0 0 8px #F59E0B;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .top-badge {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FBBF24;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F59E0B, #EA580C);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #000;
    }

    /* Layout Body */
    .app-body {
      display: flex;
      flex: 1;
      height: calc(100% - 72px);
    }

    /* Left Sidebar */
    .sidebar {
      width: 320px;
      background: #06070A;
      border-right: 1px solid #141622;
      padding: 24px 18px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .sidebar-section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #64748B;
      text-transform: uppercase;
      padding-left: 12px;
      margin-bottom: 8px;
    }
    .side-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #94A3B8;
      margin-bottom: 4px;
    }
    .side-item.active {
      background: rgba(245, 158, 11, 0.12);
      color: #FBBF24;
      font-weight: 600;
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .side-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: #F59E0B;
      color: #000;
    }

    /* Main Content */
    .content-area {
      flex: 1;
      padding: 40px 48px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .page-title-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    .beta-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FBBF24;
    }
    .page-desc {
      font-size: 15px;
      color: #94A3B8;
      margin-top: 6px;
      max-width: 860px;
      line-height: 1.5;
    }

    /* Filter & Search Bar */
    .filter-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      gap: 20px;
    }
    .search-input {
      background: #0E1017;
      border: 1px solid #1E2235;
      border-radius: 10px;
      padding: 12px 18px;
      font-size: 14px;
      color: #F8FAFC;
      width: 440px;
    }
    .filter-tabs {
      display: flex;
      gap: 8px;
    }
    .filter-tab {
      background: #0E1017;
      border: 1px solid #1E2235;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #94A3B8;
    }
    .filter-tab.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #F59E0B;
      color: #FBBF24;
    }

    /* Plugin Cards Grid */
    .plugins-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      flex: 1;
    }

    .plugin-card {
      background: #0B0D14;
      border: 1px solid #1A1D2B;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s;
    }
    .plugin-card.highlight {
      border: 1px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 158, 11, 0.05);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }
    .plugin-meta {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .plugin-avatar {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #141724;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 1px solid #23273D;
    }
    .plugin-name {
      font-size: 17px;
      font-weight: 700;
      color: #FFFFFF;
    }
    .plugin-ns {
      font-size: 12px;
      color: #64748B;
      margin-top: 2px;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-installed {
      background: rgba(16, 185, 129, 0.12);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-default {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .plugin-desc {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid #141622;
      font-size: 12px;
      color: #64748B;
    }
    .tool-count {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  </style>
</head>
<body>

  <!-- Top Navbar -->
  <div class="navbar">
    <div class="nav-left">
      <div class="brand">
        <svg class="brand-shield" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L7 11V22C7 33.1 14.3 43.4 24 46C33.7 43.4 41 33.1 41 22V11L24 4Z" fill="url(#gold_grad)" stroke="#F59E0B" stroke-width="2"/>
          <path d="M24 16L18 24H30L24 16Z" fill="#000000"/>
          <defs>
            <linearGradient id="gold_grad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FDE047"/>
              <stop offset="0.5" stop-color="#F59E0B"/>
              <stop offset="1" stop-color="#EA580C"/>
            </linearGradient>
          </defs>
        </svg>
        Fossa
      </div>
      <div class="nav-links">
        <span class="nav-link">Cockpit</span>
        <span class="nav-link active">Code Review Settings</span>
        <span class="nav-link">Fossy Rules</span>
        <span class="nav-link">Issues</span>
        <span class="nav-link">Pull Requests</span>
      </div>
    </div>
    <div class="nav-right">
      <span class="top-badge">v2.4.0 Self-Hosted</span>
      <div class="avatar">F</div>
    </div>
  </div>

  <!-- App Body -->
  <div class="app-body">
    
    <!-- Sidebar -->
    <div class="sidebar">
      <div>
        <div class="sidebar-section-title">Configuration</div>
        <div class="side-item">General</div>
        <div class="side-item">Review Categories</div>
        <div class="side-item">Custom Prompts</div>
        <div class="side-item">Suggestion Control</div>
        <div class="side-item">Fossy Rules</div>
        <div class="side-item active">
          <span>MCP Plugins</span>
          <span class="side-badge">8</span>
        </div>
      </div>

      <div>
        <div class="sidebar-section-title">Repositories</div>
        <div class="side-item">
          <span>fossa-core</span>
          <span style="color: #64748B; font-size: 12px;">12 rules</span>
        </div>
        <div class="side-item">
          <span>fossa-api</span>
          <span style="color: #64748B; font-size: 12px;">8 rules</span>
        </div>
        <div class="side-item">
          <span>fossa-web</span>
          <span style="color: #64748B; font-size: 12px;">6 rules</span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="content-area">
      
      <div class="page-header">
        <div>
          <div class="page-title-row">
            <h1 class="page-title">Model Context Protocol (MCP) Plugins</h1>
            <span class="beta-pill">UNLIMITED · OPEN SOURCE</span>
          </div>
          <p class="page-desc">
            Connect Fossy to external tools, documentation registries, issue trackers, and security scanners to provide deep project context during code reviews.
          </p>
        </div>
      </div>

      <!-- Filter Row -->
      <div class="filter-row">
        <input class="search-input" type="text" value="🔍 Search 18 available MCP tools and servers..." readonly />
        <div class="filter-tabs">
          <div class="filter-tab active">Installed (8)</div>
          <div class="filter-tab">All Tools (18)</div>
          <div class="filter-tab">Security (4)</div>
          <div class="filter-tab">Integrations (6)</div>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="plugins-grid">
        
        <!-- Card 1 -->
        <div class="plugin-card highlight">
          <div class="card-top">
            <div class="plugin-meta">
              <div class="plugin-avatar" style="background: rgba(245, 158, 11, 0.15); color: #F59E0B;">🐾</div>
              <div>
                <div class="plugin-name">Fossa MCP Core</div>
                <div class="plugin-ns">@fossamcp/core</div>
              </div>
            </div>
            <span class="status-badge badge-default">✓ Default</span>
          </div>
          <div class="plugin-desc">
            Manages workspace repository AST graphs, retrieves PR diff metadata, and executes automated inline code suggestions.
          </div>
          <div class="card-bottom">
            <span class="tool-count">⚡ 8 core tools</span>
            <span style="color: #F59E0B;">Built-in</span>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="plugin-card">
          <div class="card-top">
            <div class="plugin-meta">
              <div class="plugin-avatar">📚</div>
              <div>
                <div class="plugin-name">Context7 Docs</div>
                <div class="plugin-ns">@fossamcp/context7</div>
              </div>
            </div>
            <span class="status-badge badge-installed">✓ Installed</span>
          </div>
          <div class="plugin-desc">
            Pulls up-to-date, version-specific library documentation and framework API examples straight into the review prompt.
          </div>
          <div class="card-bottom">
            <span class="tool-count">⚡ 4 tools</span>
            <span style="color: #34D399;">Active</span>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="plugin-card">
          <div class="card-top">
            <div class="plugin-meta">
              <div class="plugin-avatar">🛡️</div>
              <div>
                <div class="plugin-name">Security OSV</div>
                <div class="plugin-ns">@fossamcp/osv-scanner</div>
              </div>
            </div>
            <span class="status-badge badge-installed">✓ Installed</span>
          </div>
          <div class="plugin-desc">
            Queries the Open Source Vulnerabilities database to identify known CVEs, outdated packages, and license compliance flaws.
          </div>
          <div class="card-bottom">
            <span class="tool-count">⚡ 3 tools</span>
            <span style="color: #34D399;">Active</span>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="plugin-card">
          <div class="card-top">
            <div class="plugin-meta">
              <div class="plugin-avatar">📐</div>
              <div>
                <div class="plugin-name">Linear Issues</div>
                <div class="plugin-ns">@composio/linear</div>
              </div>
            </div>
            <span class="status-badge badge-installed">✓ Installed</span>
          </div>
          <div class="plugin-desc">
            Bi-directional sync with Linear. Links code review findings to roadmap tickets, fetches PR user stories, and syncs fixes.
          </div>
          <div class="card-bottom">
            <span class="tool-count">⚡ 6 tools</span>
            <span style="color: #34D399;">Active</span>
          </div>
        </div>

        <!-- Card 5 -->
        <div class="plugin-card">
          <div class="card-top">
            <div class="plugin-meta">
              <div class="plugin-avatar">📋</div>
              <div>
                <div class="plugin-name">Jira Software</div>
                <div class="plugin-ns">@composio/jira</div>
              </div>
            </div>
            <span class="status-badge badge-installed">✓ Installed</span>
          </div>
          <div class="plugin-desc">
            Validates pull requests against Jira acceptance criteria, queries ticket statuses, and posts automated review summaries.
          </div>
          <div class="card-bottom">
            <span class="tool-count">⚡ 5 tools</span>
            <span style="color: #34D399;">Active</span>
          </div>
        </div>

        <!-- Card 6 -->
        <div class="plugin-card">
          <div class="card-top">
            <div class="plugin-meta">
              <div class="plugin-avatar">🚨</div>
              <div>
                <div class="plugin-name">Sentry Alerts</div>
                <div class="plugin-ns">@composio/sentry</div>
              </div>
            </div>
            <span class="status-badge badge-installed">✓ Installed</span>
          </div>
          <div class="plugin-desc">
            Correlates pull request code changes with live production exception stack traces to catch regressions before merge.
          </div>
          <div class="card-bottom">
            <span class="tool-count">⚡ 4 tools</span>
            <span style="color: #34D399;">Active</span>
          </div>
        </div>

      </div>

    </div>

  </div>

</body>
</html>
  `;
}

// -------------------------------------------------------------
// DIAGRAM 4: fossa-cli.png
// -------------------------------------------------------------
function getCliHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FOSSA CLI Terminal</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #F8FAFC;
      font-family: "JetBrains Mono", Consolas, Menlo, Monaco, monospace;
      width: 2000px;
      height: 1200px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      background-image: 
        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 60%);
    }

    .terminal-window {
      width: 100%;
      height: 100%;
      background: #07080B;
      border: 1px solid #1E2235;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.08);
      overflow: hidden;
    }

    /* Terminal Title Bar */
    .title-bar {
      height: 48px;
      background: #0D0F17;
      border-bottom: 1px solid #1A1D2B;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
    }
    .traffic-lights {
      display: flex;
      gap: 10px;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
    }
    .dot-red { background: #EF4444; }
    .dot-yellow { background: #F59E0B; }
    .dot-green { background: #10B981; }

    .window-title {
      font-size: 14px;
      font-weight: 600;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .window-title span.tag {
      color: #F59E0B;
    }

    /* Terminal Body */
    .terminal-body {
      padding: 36px 40px;
      flex: 1;
      overflow: hidden;
      font-size: 15px;
      line-height: 1.7;
    }

    .prompt-line {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .prompt-user { color: #34D399; font-weight: bold; }
    .prompt-dir { color: #60A5FA; }
    .prompt-git { color: #F59E0B; }
    .prompt-cmd { color: #FFFFFF; font-weight: bold; }

    .banner {
      color: #F59E0B;
      font-weight: bold;
      white-space: pre;
      margin-bottom: 24px;
      text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
    }

    .meta-box {
      border: 1px solid #23273D;
      background: #0E101A;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 14px;
    }
    .meta-item { display: flex; gap: 8px; }
    .meta-label { color: #64748B; }
    .meta-val { color: #F8FAFC; font-weight: 600; }

    .step-ok { color: #34D399; }
    .step-info { color: #F59E0B; }
    .step-text { color: #CBD5E1; }

    .summary-heading {
      font-size: 16px;
      font-weight: 700;
      color: #FDE047;
      margin: 24px 0 14px 0;
      border-bottom: 1px dashed #23273D;
      padding-bottom: 8px;
    }

    .issue-card {
      background: #0B0D15;
      border-left: 4px solid #EF4444;
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin-bottom: 14px;
    }
    .issue-card.warn {
      border-left-color: #F59E0B;
    }
    .issue-title {
      font-weight: bold;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .badge-critical {
      background: rgba(239, 68, 68, 0.2);
      color: #F87171;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .badge-high {
      background: rgba(245, 158, 11, 0.2);
      color: #FBBF24;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .issue-loc { color: #60A5FA; }

    .diff-block {
      background: #030406;
      border: 1px solid #1A1D2B;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 8px;
      font-size: 13px;
    }
    .diff-del { color: #F87171; }
    .diff-add { color: #34D399; }

    .interactive-menu {
      margin-top: 24px;
      padding: 16px 20px;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      background: rgba(245, 158, 11, 0.05);
    }
    .menu-title { color: #FDE047; font-weight: bold; margin-bottom: 8px; }
    .menu-item { color: #94A3B8; margin-left: 12px; }
    .menu-item.selected { color: #FBBF24; font-weight: bold; }
  </style>
</head>
<body>

  <div class="terminal-window">
    <div class="title-bar">
      <div class="traffic-lights">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <div class="window-title">
        <span>dev@workstation: ~/fossa-core</span>
        <span>—</span>
        <span class="tag">fossa review --interactive</span>
      </div>
      <div style="color: #475569; font-size: 13px;">UTF-8 · zsh</div>
    </div>

    <div class="terminal-body">
      <div class="prompt-line">
        <span class="prompt-user">dev@fossa-box</span>:<span class="prompt-dir">~/projects/fossa</span> <span class="prompt-git">(git:feat/review-harness)</span>$ <span class="prompt-cmd">fossa review --interactive</span>
      </div>

      <div class="banner">
  ███████╗ ██████╗ ███████╗███████╗ █████╗ 
  ██╔════╝██╔═══██╗██╔════╝██╔════╝██╔══██╗   AI CODE REVIEW ENGINE v2.4.0
  █████╗  ██║   ██║███████╗███████╗███████║   Self-Hosted &bull; AGPL-3.0 &bull; BYOK LLM
  ██╔══╝  ██║   ██║╚════██║╚════██║██╔══██║   https://fossa.mintlify.site
  ██║     ╚██████╔╝███████║███████║██║  ██║
  ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
      </div>

      <div class="meta-box">
        <div class="meta-item"><span class="meta-label">Engine Host:</span> <span class="meta-val">http://localhost:3000 (Docker network: fossa-backend)</span></div>
        <div class="meta-item"><span class="meta-label">Auth Key:</span> <span class="meta-val">fossa_tk_891e... [Team Lead RBAC verified]</span></div>
        <div class="meta-item"><span class="meta-label">BYOK Provider:</span> <span class="meta-val">Anthropic Claude 3.7 Sonnet (Failover: OpenAI GPT-4o)</span></div>
        <div class="meta-item"><span class="meta-label">Rule Sets:</span> <span class="meta-val">12 Fossy Rules loaded from .fossa/rules/</span></div>
      </div>

      <div><span class="step-ok">✔</span> <span class="step-text">Git working diff collected: 4 files modified, +148 -32 lines</span></div>
      <div><span class="step-ok">✔</span> <span class="step-text">Abstract Syntax Trees (AST) built across target TypeScript modules in 142ms</span></div>
      <div><span class="step-ok">✔</span> <span class="step-text">Context7 & Security OSV MCP plugins queried for library signatures</span></div>
      <div><span class="step-ok">✔</span> <span class="step-text">Dual-pass inference completed via BYOK runner in 1.84s (Prompt tokens: 3,420, Out: 412)</span></div>

      <div class="summary-heading">Found 2 actionable review findings across 2 files (0 noise warnings)</div>

      <!-- Issue 1 -->
      <div class="issue-card">
        <div class="issue-title">
          <span class="badge-critical">CRITICAL</span>
          <span class="issue-loc">apps/api/src/modules/auth/jwt-strategy.ts:42</span>
          <span>Missing refresh token expiration check</span>
        </div>
        <div style="font-size: 13px; color: #94A3B8;">Fossy Rule: Security/Authentication - Invalidate expired tokens before verifying signature</div>
        <div class="diff-block">
          <div class="diff-del">- const isExpired = token.issuedAt + 3600 &lt; Date.now();</div>
          <div class="diff-add">+ const isExpired = !token.exp || (token.exp * 1000) &lt; Date.now();</div>
        </div>
      </div>

      <!-- Issue 2 -->
      <div class="issue-card warn">
        <div class="issue-title">
          <span class="badge-high">HIGH</span>
          <span class="issue-loc">apps/worker/src/processors/review.processor.ts:89</span>
          <span>Unhandled promise rejection in queue consumer loop</span>
        </div>
        <div style="font-size: 13px; color: #94A3B8;">Fossy Rule: Reliability/ErrorHandling - Wrap async file transforms in try/catch to avoid worker crash</div>
      </div>

      <!-- Interactive Prompt -->
      <div class="interactive-menu">
        <div class="menu-title">? Select an action:</div>
        <div class="menu-item selected">❯ [1] Apply suggested fix directly to jwt-strategy.ts (Working tree patch)</div>
        <div class="menu-item">  [2] View deep AST architectural context and rule explanation</div>
        <div class="menu-item">  [3] Post review comments directly to active Git pull request</div>
        <div class="menu-item">  [4] Export structured report (SARIF / Markdown / JSON)</div>
      </div>

    </div>
  </div>

</body>
</html>
  `;
}

// -------------------------------------------------------------
// DIAGRAM 5: cockpit.png
// -------------------------------------------------------------
function getCockpitHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FOSSA Cockpit Analytics</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 2200px;
      height: 820px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .window-bar {
      height: 40px;
      background: #090B10;
      border-bottom: 1px solid #1A1D2B;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }
    .window-dots {
      display: flex;
      gap: 8px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-red { background: #FF5F56; }
    .dot-yellow { background: #FFBD2E; }
    .dot-green { background: #27C93F; }
    .window-url-bar {
      background: #050608;
      border: 1px solid #1A1D2B;
      border-radius: 6px;
      padding: 4px 24px;
      font-size: 12px;
      color: #94A3B8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .window-actions {
      display: flex;
      align-items: center;
    }
    .window-badge {
      font-size: 11px;
      color: #F59E0B;
      font-weight: 600;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .navbar {
      height: 72px;
      background: #08090D;
      border-bottom: 1px solid #1A1D2B;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 36px;
    }
    .nav-left { display: flex; align-items: center; gap: 36px; }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .brand-shield {
      width: 32px;
      height: 32px;
      filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4));
    }
    .nav-links { display: flex; align-items: center; gap: 28px; }
    .nav-link { font-size: 15px; font-weight: 500; color: #94A3B8; text-decoration: none; padding: 8px 0; position: relative; }
    .nav-link.active { color: #F8FAFC; font-weight: 600; }
    .nav-link.active::after {
      content: "";
      position: absolute;
      bottom: -16px;
      left: 0;
      right: 0;
      height: 2px;
      background: #F59E0B;
      box-shadow: 0 0 8px #F59E0B;
    }

    .nav-right { display: flex; align-items: center; gap: 16px; }
    .top-badge {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FBBF24;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
    }
    .repo-select {
      background: #0E1017;
      border: 1px solid #1E2235;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #CBD5E1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F59E0B, #EA580C);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #000;
    }

    .content {
      padding: 40px 48px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .greeting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .greeting {
      font-size: 32px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .date-filter {
      background: #0E1017;
      border: 1px solid #1E2235;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .metric-card {
      background: #0B0D14;
      border: 1px solid #1E2235;
      border-radius: 16px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 240px;
    }
    .metric-card.golden {
      border: 1px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.05);
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #94A3B8;
    }
    .elite-tag {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34D399;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
    }

    .card-num {
      font-size: 56px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -1px;
    }
    .card-num span.unit {
      font-size: 26px;
      font-weight: 600;
      color: #94A3B8;
    }
    .card-sub {
      font-size: 13px;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .trend-up { color: #34D399; }

    /* Chart Card */
    .chart-content {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .donut-ring {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: conic-gradient(#F59E0B 0% 88%, #10B981 88% 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .donut-hole {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: #0B0D14;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      color: #F8FAFC;
    }
    .legend-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13px;
    }
    .legend-item { display: flex; align-items: center; gap: 8px; }
    .leg-dot-amber { width: 10px; height: 10px; border-radius: 2px; background: #F59E0B; }
    .leg-dot-green { width: 10px; height: 10px; border-radius: 2px; background: #10B981; }

    .bottom-row {
      display: flex;
      gap: 16px;
      border-bottom: 1px solid #1E2235;
      padding-bottom: 12px;
    }
    .bot-tab {
      font-size: 15px;
      font-weight: 600;
      color: #94A3B8;
      padding: 6px 12px;
    }
    .bot-tab.active {
      color: #FBBF24;
      border-bottom: 2px solid #F59E0B;
    }
  </style>
</head>
<body>
  <div class="window-bar">
    <div class="window-dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="window-url-bar">
      <span>🔒</span>
      <span>https://app.fossa.local/cockpit</span>
    </div>
    <div class="window-actions">
      <span class="window-badge">v2.4.0 Self-Hosted</span>
    </div>
  </div>

  <div class="navbar">
    <div class="nav-left">
      <div class="brand">
        <svg class="brand-shield" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L7 11V22C7 33.1 14.3 43.4 24 46C33.7 43.4 41 33.1 41 22V11L24 4Z" fill="url(#gold_grad)" stroke="#F59E0B" stroke-width="2"/>
          <path d="M24 16L18 24H30L24 16Z" fill="#000000"/>
          <defs>
            <linearGradient id="gold_grad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FDE047"/>
              <stop offset="0.5" stop-color="#F59E0B"/>
              <stop offset="1" stop-color="#EA580C"/>
            </linearGradient>
          </defs>
        </svg>
        Fossa
      </div>
      <div class="nav-links">
        <span class="nav-link active">Cockpit</span>
        <span class="nav-link">Code Review Settings</span>
        <span class="nav-link">Fossy Rules</span>
        <span class="nav-link">Issues</span>
        <span class="nav-link">Pull Requests</span>
      </div>
    </div>
    <div class="nav-right">
      <span class="top-badge">100% Free Self-Hosted</span>
      <div class="repo-select">📁 All repositories ▾</div>
      <div class="avatar">F</div>
    </div>
  </div>

  <div class="content">
    <div class="greeting-row">
      <div class="greeting">👋 Good afternoon!</div>
      <div class="date-filter">📅 Last 30 days ▾</div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="card-head">
          <span class="card-title">Deploy Frequency</span>
          <span class="elite-tag">👑 Elite</span>
        </div>
        <div class="card-num">14<span class="unit">/week</span></div>
        <div class="card-sub">
          <span class="trend-up">↗ +33%</span> vs prior 2-week baseline
        </div>
      </div>

      <div class="metric-card">
        <div class="card-head">
          <span class="card-title">PR Cycle Time (p75)</span>
          <span class="elite-tag">👑 Elite</span>
        </div>
        <div class="card-num">2<span class="unit">h </span>45<span class="unit">m</span></div>
        <div class="card-sub">
          <span class="trend-up">↘ -38%</span> faster turnaround with Fossy
        </div>
      </div>

      <div class="metric-card golden">
        <div class="card-head">
          <span class="card-title">Fossy Suggestions</span>
          <span class="elite-tag" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.35); color: #FBBF24;">Active</span>
        </div>
        <div class="chart-content">
          <div class="donut-ring">
            <div class="donut-hole">92%</div>
          </div>
          <div class="legend-col">
            <div class="legend-item"><span class="leg-dot-amber"></span> <strong>584</strong> suggestions posted</div>
            <div class="legend-item"><span class="leg-dot-green"></span> <strong>538</strong> accepted & merged</div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">92.1% developer adoption rate</div>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-head">
          <span class="card-title">Bug Leakage Ratio</span>
          <span class="elite-tag">👑 Elite</span>
        </div>
        <div class="card-num">1.8<span class="unit">%</span></div>
        <div class="card-sub">
          <span class="trend-up">↘ -64%</span> reduced post-merge incidents
        </div>
      </div>

      <div class="metric-card">
        <div class="card-head">
          <span class="card-title">PR Diff Size (p75)</span>
          <span class="elite-tag">👑 Elite</span>
        </div>
        <div class="card-num">142<span class="unit"> lines</span></div>
        <div class="card-sub">
          <span class="trend-up">↘ -28%</span> smaller, more reviewable commits
        </div>
      </div>

      <div class="metric-card">
        <div class="card-head">
          <span class="card-title">Fossy Rules Evaluated</span>
          <span class="elite-tag">👑 Elite</span>
        </div>
        <div class="card-num">24<span class="unit"> rules</span></div>
        <div class="card-sub">
          <span class="trend-up">100% pass</span> across all repository checks
        </div>
      </div>
    </div>

    <div class="bottom-row">
      <div class="bot-tab active">Productivity & DORA</div>
      <div class="bot-tab">Code Quality & Security</div>
      <div class="bot-tab">Rule Compliance</div>
    </div>
  </div>

</body>
</html>
  `;
}

// -------------------------------------------------------------
// DIAGRAM 6: issues.png
// -------------------------------------------------------------
function getIssuesHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FOSSA Issues Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 2200px;
      height: 840px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .window-bar {
      height: 40px;
      background: #090B10;
      border-bottom: 1px solid #1A1D2B;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }
    .window-dots {
      display: flex;
      gap: 8px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-red { background: #FF5F56; }
    .dot-yellow { background: #FFBD2E; }
    .dot-green { background: #27C93F; }
    .window-url-bar {
      background: #050608;
      border: 1px solid #1A1D2B;
      border-radius: 6px;
      padding: 4px 24px;
      font-size: 12px;
      color: #94A3B8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .window-actions {
      display: flex;
      align-items: center;
    }
    .window-badge {
      font-size: 11px;
      color: #F59E0B;
      font-weight: 600;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .navbar {
      height: 72px;
      background: #08090D;
      border-bottom: 1px solid #1A1D2B;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 36px;
    }
    .nav-left { display: flex; align-items: center; gap: 36px; }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 800; color: #FFFFFF; }
    .brand-shield { width: 32px; height: 32px; filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4)); }
    .nav-links { display: flex; align-items: center; gap: 28px; }
    .nav-link { font-size: 15px; font-weight: 500; color: #94A3B8; text-decoration: none; padding: 8px 0; position: relative; }
    .nav-link.active { color: #F8FAFC; font-weight: 600; }
    .nav-link.active::after {
      content: "";
      position: absolute;
      bottom: -16px;
      left: 0;
      right: 0;
      height: 2px;
      background: #F59E0B;
      box-shadow: 0 0 8px #F59E0B;
    }
    .issue-count-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: #F59E0B;
      color: #000;
      margin-left: 6px;
    }

    .nav-right { display: flex; align-items: center; gap: 16px; }
    .top-badge {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FBBF24;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F59E0B, #EA580C);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #000;
    }

    .body-container {
      display: flex;
      flex: 1;
      height: calc(100% - 72px);
    }

    .table-pane {
      width: 55%;
      border-right: 1px solid #1E2235;
      padding: 32px 36px;
      display: flex;
      flex-direction: column;
    }
    .table-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .table-title {
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .filter-btn {
      background: #0E1017;
      border: 1px solid #1E2235;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #94A3B8;
    }

    .issue-row {
      display: grid;
      grid-template-columns: 80px 90px 140px 1fr;
      align-items: center;
      padding: 16px 18px;
      border-radius: 10px;
      margin-bottom: 8px;
      background: #0B0D14;
      border: 1px solid #1A1D2B;
    }
    .issue-row.selected {
      background: #10121C;
      border: 1px solid rgba(245, 158, 11, 0.4);
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.05);
    }

    .badge-open {
      color: #F59E0B;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      width: fit-content;
    }
    .badge-crit {
      background: rgba(239, 68, 68, 0.15);
      color: #F87171;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      width: fit-content;
    }
    .badge-high {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      width: fit-content;
    }
    .cat-text { font-size: 13px; color: #94A3B8; }
    .issue-text { font-size: 14px; font-weight: 600; color: #F8FAFC; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .detail-pane {
      width: 45%;
      padding: 36px 44px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #07080B;
    }
    .detail-top { display: flex; flex-direction: column; gap: 16px; }
    .detail-title {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.4;
    }
    .detail-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;
      color: #64748B;
    }
    .target-box {
      background: #0E1018;
      border: 1px solid #1E2235;
      border-radius: 10px;
      padding: 16px 20px;
      font-family: monospace;
      font-size: 13px;
      color: #60A5FA;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .target-line { display: flex; gap: 8px; }
    .target-icon { color: #F59E0B; }

    .desc-box {
      font-size: 14px;
      color: #94A3B8;
      line-height: 1.6;
    }
    .rule-box {
      background: rgba(245, 158, 11, 0.08);
      border-left: 3px solid #F59E0B;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #CBD5E1;
    }

    .feedback-row {
      border-top: 1px solid #1E2235;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #64748B;
    }
    .feedback-btns { display: flex; gap: 12px; }
    .btn-vote {
      background: #0E1018;
      border: 1px solid #1E2235;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      color: #CBD5E1;
    }
  </style>
</head>
<body>
  <div class="window-bar">
    <div class="window-dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div class="window-url-bar">
      <span>🔒</span>
      <span>https://app.fossa.local/issues</span>
    </div>
    <div class="window-actions">
      <span class="window-badge">v2.4.0 Self-Hosted</span>
    </div>
  </div>

  <div class="navbar">
    <div class="nav-left">
      <div class="brand">
        <svg class="brand-shield" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L7 11V22C7 33.1 14.3 43.4 24 46C33.7 43.4 41 33.1 41 22V11L24 4Z" fill="url(#gold_grad)" stroke="#F59E0B" stroke-width="2"/>
          <path d="M24 16L18 24H30L24 16Z" fill="#000000"/>
          <defs>
            <linearGradient id="gold_grad" x1="7" y1="4" x2="41" y2="46" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FDE047"/>
              <stop offset="0.5" stop-color="#F59E0B"/>
              <stop offset="1" stop-color="#EA580C"/>
            </linearGradient>
          </defs>
        </svg>
        Fossa
      </div>
      <div class="nav-links">
        <span class="nav-link">Cockpit</span>
        <span class="nav-link">Code Review Settings</span>
        <span class="nav-link">Fossy Rules</span>
        <span class="nav-link active">Issues <span class="issue-count-pill">29</span></span>
        <span class="nav-link">Pull Requests</span>
      </div>
    </div>
    <div class="nav-right">
      <span class="top-badge">v2.4.0 Self-Hosted</span>
      <div class="avatar">F</div>
    </div>
  </div>

  <div class="body-container">
    <div class="table-pane">
      <div class="table-top">
        <div class="table-title">Issues <span style="font-size: 15px; color: #64748B; font-weight: normal;">Showing 4 of 29 issues</span></div>
        <div class="filter-btn">⚙ Filters (2)</div>
      </div>

      <div class="issue-row selected">
        <span class="badge-open">OPEN</span>
        <span class="badge-crit">CRITICAL</span>
        <span class="cat-text">Security</span>
        <span class="issue-text">Invalidate expired JWT tokens before signature verification</span>
      </div>

      <div class="issue-row">
        <span class="badge-open">OPEN</span>
        <span class="badge-high">HIGH</span>
        <span class="cat-text">Fossy Rules</span>
        <span class="issue-text">Add explicit return type for controller use-case handlers</span>
      </div>

      <div class="issue-row">
        <span class="badge-open">OPEN</span>
        <span class="badge-high">HIGH</span>
        <span class="cat-text">Architecture</span>
        <span class="issue-text">Domain layer must not import adapter infrastructure</span>
      </div>

      <div class="issue-row">
        <span class="badge-open">OPEN</span>
        <span class="badge-high">HIGH</span>
        <span class="cat-text">Reliability</span>
        <span class="issue-text">Unhandled promise rejection in queue consumer loop</span>
      </div>

      <div class="issue-row">
        <span class="badge-open">OPEN</span>
        <span class="badge-high">HIGH</span>
        <span class="cat-text">Database</span>
        <span class="issue-text">Missing composite index on review_threads(pr_id, status)</span>
      </div>

      <div class="issue-row">
        <span class="badge-open">OPEN</span>
        <span class="badge-open" style="border-color: #60A5FA; color: #60A5FA;">MEDIUM</span>
        <span class="cat-text">Compliance</span>
        <span class="issue-text">Ensure AGPL-3.0 header on newly created library service</span>
      </div>
    </div>

    <div class="detail-pane">
      <div class="detail-top">
        <div class="detail-title">
          Invalidate expired JWT tokens before signature verification
        </div>
        <div class="detail-meta">
          <span>Opened 2 hours ago by Fossy</span>
          <span>•</span>
          <span class="badge-crit">CRITICAL</span>
        </div>

        <div class="target-box">
          <div class="target-line"><span class="target-icon">📦</span> fossa/apps/api</div>
          <div class="target-line"><span class="target-icon">🔀</span> PR #142: Add OAuth refresh token rotation</div>
          <div class="target-line"><span class="target-icon">📄</span> apps/api/src/modules/auth/jwt-strategy.ts:42</div>
        </div>

        <div class="desc-box">
          The JWT strategy validates cryptographic signatures on incoming bearer tokens, but skips checking the token expiration timestamp prior to signature computation. This exposes the auth gateway to replay attacks using expired tokens.
        </div>

        <div class="rule-box">
          <strong>Fossy Rule: Security/Authentication</strong><br/>
          Always check token expiration date explicitly and reject early before initiating cryptographic operations.
        </div>
      </div>

      <div class="feedback-row">
        <span>Team feedback from PR reactions</span>
        <div class="feedback-btns">
          <span class="btn-vote">👍 14</span>
          <span class="btn-vote">👎 0</span>
        </div>
      </div>
    </div>
  </div>

</body>
</html>
  `;
}

// -------------------------------------------------------------
// DIAGRAM 7: flow.png
// -------------------------------------------------------------
function getFlowHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>FOSSA Review Flow</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      width: 2200px;
      height: 900px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 40px;
      background-image: 
        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 60%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 32px 32px, 32px 32px;
    }

    .flow-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(245, 158, 11, 0.25);
    }
    .flow-title {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .flow-title span.grad {
      background: linear-gradient(135deg, #FDE047, #F59E0B);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .flow-steps {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 18px;
      flex: 1;
      align-items: center;
    }

    .step-card {
      background: #0B0D14;
      border: 1px solid #1E2235;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 600px;
      justify-content: space-between;
      position: relative;
    }
    .step-card.gold {
      border: 1px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.05);
    }

    .step-num { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #F59E0B; text-transform: uppercase; margin-bottom: 8px; }
    .step-name { font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px; }

    .box-item {
      background: #12141F;
      border: 1px solid #23273D;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.4;
      color: #94A3B8;
    }
    .box-item strong { color: #F8FAFC; display: block; margin-bottom: 4px; font-size: 13px; }

    .next-arrow {
      position: absolute;
      top: 50%;
      right: -13px;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #000;
      border: 1px solid #F59E0B;
      color: #F59E0B;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 5;
    }
  </style>
</head>
<body>

  <div class="flow-head">
    <div class="flow-title">
      🐾 <span class="grad">FOSSA</span> Code Review Execution Lifecycle
    </div>
    <div style="font-size: 13px; color: #64748B;">
      Deterministic State Machine · Zero Data Retention · Open Source
    </div>
  </div>

  <div class="flow-steps">
    <div class="step-card">
      <div>
        <div class="step-num">Step 01</div>
        <div class="step-name">Trigger & Ingest</div>
        <div class="box-item">
          <strong>Git Webhook</strong>
          PR opened, commit pushed, or @fossy comment trigger.
        </div>
        <div class="box-item">
          <strong>Outbox Pattern</strong>
          Guaranteed delivery into RabbitMQ quorum queues.
        </div>
      </div>
      <div class="box-item" style="border-left: 2px solid #F59E0B;">
        Status set to 🚀 Processing
      </div>
      <div class="next-arrow">→</div>
    </div>

    <div class="step-card">
      <div>
        <div class="step-num">Step 02</div>
        <div class="step-name">Skip Check</div>
        <div class="box-item">
          <strong>Draft Filter</strong>
          Skips work-in-progress draft PRs automatically.
        </div>
        <div class="box-item">
          <strong>Path Filtering</strong>
          Ignores lockfiles, assets, and .fossaignore files.
        </div>
      </div>
      <div class="box-item" style="border-left: 2px solid #34D399;">
        Passes only actionable code
      </div>
      <div class="next-arrow">→</div>
    </div>

    <div class="step-card">
      <div>
        <div class="step-num">Step 03</div>
        <div class="step-name">AST Context</div>
        <div class="box-item">
          <strong>Syntax Analysis</strong>
          Extracts modified classes, functions, and symbols.
        </div>
        <div class="box-item">
          <strong>Dependency Map</strong>
          Resolves imports across affected monorepo libraries.
        </div>
      </div>
      <div class="box-item" style="border-left: 2px solid #60A5FA;">
        Builds semantic PR scope
      </div>
      <div class="next-arrow">→</div>
    </div>

    <div class="step-card gold">
      <div>
        <div class="step-num">Step 04</div>
        <div class="step-name">Rules & MCP</div>
        <div class="box-item">
          <strong>Fossy Rules</strong>
          Applies Org, Repo, and Directory policies.
        </div>
        <div class="box-item">
          <strong>MCP Augmentation</strong>
          Injects Context7 docs and OSV vulnerability data.
        </div>
      </div>
      <div class="box-item" style="border-left: 2px solid #FBBF24;">
        Synthesizes prompt context
      </div>
      <div class="next-arrow">→</div>
    </div>

    <div class="step-card gold">
      <div>
        <div class="step-num">Step 05</div>
        <div class="step-name">BYOK Engine</div>
        <div class="box-item">
          <strong>Dual-Pass Review</strong>
          File-level bugs + PR-level architecture.
        </div>
        <div class="box-item">
          <strong>Auto Failover</strong>
          Seamless fallback across model providers.
        </div>
      </div>
      <div class="box-item" style="border-left: 2px solid #34D399;">
        Generates code fix diffs
      </div>
      <div class="next-arrow">→</div>
    </div>

    <div class="step-card">
      <div>
        <div class="step-num">Step 06</div>
        <div class="step-name">Noise Gate & Dispatch</div>
        <div class="box-item">
          <strong>Safeguard Heuristic</strong>
          Filters low-confidence findings and false positives.
        </div>
        <div class="box-item">
          <strong>Inline Comments</strong>
          Posts code suggestions to GitHub / GitLab PR thread.
        </div>
      </div>
      <div class="box-item" style="border-left: 2px solid #F59E0B;">
        Status updated to 🎉 Completed
      </div>
    </div>
  </div>

</body>
</html>
  `;
}

// -------------------------------------------------------------
// MAIN GENERATOR
// -------------------------------------------------------------
const docsImagesDir = path.join(__dirname, '..', 'docs', 'images');

console.log('Generating FOSSA diagrams...');

// 1. Architecture diagram
renderHtmlToPng(
  getArchitectureHtml(),
  path.join(docsImagesDir, 'fossa-architecture.png'),
  2400,
  1420
);

// 2. Engine pipeline diagram
renderHtmlToPng(
  getEngineHtml(),
  path.join(docsImagesDir, 'fossa_engine.png'),
  2200,
  1250
);

// 3. Plugins screen mockup
renderHtmlToPng(
  getPluginsHtml(),
  path.join(docsImagesDir, 'fossa_plugins.png'),
  2200,
  1300
);

// 4. CLI terminal diagram
renderHtmlToPng(
  getCliHtml(),
  path.join(docsImagesDir, 'fossa-cli.png'),
  2000,
  1200
);

// 5. CLI review photo replacement
renderHtmlToPng(
  getCliHtml(),
  path.join(docsImagesDir, 'fossa_cli_review.jpg'),
  2000,
  1050
);

// 6. Cockpit analytics mockup
renderHtmlToPng(
  getCockpitHtml(),
  path.join(docsImagesDir, 'cockpit.png'),
  2200,
  740
);
renderHtmlToPng(
  getCockpitHtml(),
  path.join(docsImagesDir, 'fossa_cockpit.png'),
  2200,
  740
);

// 7. Issues dashboard mockup
renderHtmlToPng(
  getIssuesHtml(),
  path.join(docsImagesDir, 'issues.png'),
  2200,
  780
);
renderHtmlToPng(
  getIssuesHtml(),
  path.join(docsImagesDir, 'fossa_issues.png'),
  2200,
  780
);

// 8. Flow diagram
renderHtmlToPng(
  getFlowHtml(),
  path.join(docsImagesDir, 'flow.png'),
  2200,
  860
);
renderHtmlToPng(
  getFlowHtml(),
  path.join(docsImagesDir, 'fossa_flow.png'),
  2200,
  860
);

console.log('All FOSSA diagrams successfully generated!');

