const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function renderHtmlToPng(htmlContent, outputPath, width = 1600, height = 900) {
  const tempHtml = path.join(os.tmpdir(), `fossa_rem_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  const tempPng = path.join(os.tmpdir(), `fossa_rem_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);

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
// 1. sync-rules.png
// -------------------------------------------------------------
function getSyncRulesHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #F3F4F6;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .card {
    background: #090D14;
    border: 1px solid #1F2937;
    border-radius: 14px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.05);
    width: 100%;
    max-width: 1100px;
    overflow: hidden;
  }
  .header {
    background: #0E1522;
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #1F2937;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .title {
    font-size: 16px;
    font-weight: 700;
    color: #F9FAFB;
    letter-spacing: -0.2px;
  }
  .badge {
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
  }
  .chevron {
    color: #9CA3AF;
    font-size: 14px;
  }
  .content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .row-item {
    background: #0C111C;
    border: 1px solid #1E293B;
    border-radius: 10px;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
  .item-info {
    flex: 1;
  }
  .item-title {
    font-size: 15px;
    font-weight: 600;
    color: #F3F4F6;
    margin-bottom: 6px;
  }
  .item-desc {
    font-size: 13px;
    color: #94A3B8;
    line-height: 1.5;
  }
  .code-inline {
    background: #182234;
    color: #FBBF24;
    padding: 2px 7px;
    border-radius: 5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    border: 1px solid rgba(251, 191, 36, 0.2);
  }
  .toggle-switch {
    width: 48px;
    height: 26px;
    background: #F59E0B;
    border-radius: 9999px;
    position: relative;
    cursor: pointer;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
    flex-shrink: 0;
  }
  .toggle-knob {
    width: 20px;
    height: 20px;
    background: #FFFFFF;
    border-radius: 50%;
    position: absolute;
    right: 3px;
    top: 3px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="header-left">
        <div class="icon-box">⚙️</div>
        <div class="title">Sync & Generate Rules</div>
        <div class="badge">2 enabled</div>
      </div>
      <div class="chevron">▲</div>
    </div>
    <div class="content">
      <div class="row-item">
        <div class="item-info">
          <div class="item-title">Auto-sync rules from repo</div>
          <div class="item-desc">
            When enabled, Fossy will automatically import rule files (<span class="code-inline">.cursorrules</span>, <span class="code-inline">CLAUDE.md</span>, <span class="code-inline">AGENTS.md</span>) found in this repository and keep them in sync.
          </div>
        </div>
        <div class="toggle-switch">
          <div class="toggle-knob"></div>
        </div>
      </div>

      <div class="row-item">
        <div class="item-info">
          <div class="item-title">Generate from past reviews</div>
          <div class="item-desc">
            Fossy will continuously analyze merged PRs and accepted suggestions to recommend custom organization rules automatically.
          </div>
        </div>
        <div class="toggle-switch">
          <div class="toggle-knob"></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// 2. token.png
// -------------------------------------------------------------
function getTokenHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #e6edf3;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .token-box {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    padding: 16px 20px;
    width: 100%;
    max-width: 1000px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }
  .token-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .org-avatar {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: linear-gradient(135deg, #F59E0B, #EA580C);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 900;
    font-size: 20px;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
  }
  .token-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .token-name {
    font-size: 15px;
    font-weight: 600;
    color: #58a6ff;
    text-decoration: none;
    cursor: pointer;
  }
  .token-expiry {
    font-size: 12px;
    color: #8b949e;
  }
  .token-expiry em {
    font-style: normal;
    color: #c9d1d9;
    font-weight: 500;
  }
  .token-right {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .token-last-used {
    font-size: 12px;
    color: #8b949e;
  }
  .btn-delete {
    background: transparent;
    color: #f85149;
    border: 1px solid rgba(248, 81, 73, 0.4);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
</style>
</head>
<body>
  <div class="token-box">
    <div class="token-left">
      <div class="org-avatar">🛡️</div>
      <div class="token-details">
        <span class="token-name">fossa-community</span>
        <span class="token-expiry">Expires <em>on Wed, Sep 30 2026.</em></span>
      </div>
    </div>
    <div class="token-right">
      <span class="token-last-used">Last used within the last hour</span>
      <button class="btn-delete">Delete</button>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// 3. comment-mcp.png (Replaces comment-mcp.gif)
// -------------------------------------------------------------
function getCommentMcpHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #e6edf3;
    padding: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .pr-thread {
    width: 100%;
    max-width: 1080px;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 12px;
    box-shadow: 0 20px 45px rgba(0,0,0,0.8);
    overflow: hidden;
  }
  .diff-header {
    background: #161b22;
    border-bottom: 1px solid #30363d;
    padding: 10px 16px;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 13px;
    color: #c9d1d9;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .diff-badge {
    background: #238636;
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }
  .diff-lines {
    background: #0d1117;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
    border-bottom: 1px solid #30363d;
  }
  .diff-line {
    display: flex;
    padding: 2px 16px;
    line-height: 20px;
  }
  .diff-num {
    width: 40px;
    color: #484f58;
    user-select: none;
  }
  .diff-add {
    background: rgba(46, 160, 67, 0.15);
    color: #e6edf3;
  }
  .diff-add .diff-num {
    color: #3fb950;
  }
  .comment-item {
    padding: 18px 20px;
    border-bottom: 1px solid #21262d;
    display: flex;
    gap: 14px;
  }
  .avatar-fossa {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F59E0B, #D97706);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-size: 18px;
    font-weight: 900;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
    flex-shrink: 0;
  }
  .avatar-user {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #1f6feb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .comment-content {
    flex: 1;
  }
  .comment-author-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .author-name {
    font-weight: 600;
    color: #e6edf3;
  }
  .badge-bot {
    background: #21262d;
    color: #8b949e;
    border: 1px solid #30363d;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge-tag {
    background: rgba(245, 158, 11, 0.15);
    color: #FBBF24;
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge-high {
    background: rgba(239, 68, 68, 0.15);
    color: #F87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
  .comment-time {
    color: #8b949e;
    font-size: 12px;
  }
  .comment-body {
    font-size: 14px;
    line-height: 1.6;
    color: #c9d1d9;
  }
  .rule-quote {
    background: #161b22;
    border-left: 3px solid #F59E0B;
    padding: 8px 12px;
    border-radius: 0 6px 6px 0;
    margin: 10px 0;
    font-size: 13px;
    color: #F3F4F6;
  }
  .mention {
    color: #58a6ff;
    font-weight: 600;
  }
  .plugin-banner {
    background: rgba(14, 165, 233, 0.1);
    border: 1px solid rgba(14, 165, 233, 0.3);
    border-radius: 8px;
    padding: 10px 14px;
    margin: 10px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #7dd3fc;
  }
  .code-suggestion {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 10px 0;
    font-family: ui-monospace, monospace;
    font-size: 12px;
    line-height: 1.5;
  }
  .reactions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .reaction-pill {
    background: #161b22;
    border: 1px solid #30363d;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 12px;
    color: #c9d1d9;
    display: flex;
    align-items: center;
    gap: 5px;
  }
</style>
</head>
<body>
  <div class="pr-thread">
    <div class="diff-header">
      <span class="diff-badge">+14</span>
      <span>apps/api/src/modules/code-review/use-cases/process-review.use-case.ts</span>
    </div>
    <div class="diff-lines">
      <div class="diff-line diff-add">
        <span class="diff-num">42</span>
        <span>+ async execute(cmd: ProcessReviewCommand): Promise&lt;ReviewResult&gt; {</span>
      </div>
      <div class="diff-line diff-add">
        <span class="diff-num">43</span>
        <span>+   await this.jobQueue.dispatchReviewJob(cmd.pullRequestId);</span>
      </div>
    </div>

    <!-- Fossy Review Comment -->
    <div class="comment-item">
      <div class="avatar-fossa">🛡️</div>
      <div class="comment-content">
        <div class="comment-author-bar">
          <span class="author-name">fossy</span>
          <span class="badge-bot">bot</span>
          <span class="badge-tag">Fossy Rules</span>
          <span class="badge-high">High Severity</span>
          <span class="comment-time">2 hours ago</span>
        </div>
        <div class="comment-body">
          The method <code style="color:#FBBF24; background:#1f2937; padding:1px 5px; border-radius:3px;">execute()</code> dispatches the review job without acquiring an inbox claim lock. Under RabbitMQ queue redeliveries, this may lead to concurrent duplicate reviews.
          <div class="rule-quote">
            <strong>Fossy Rule: Reliability/IdempotentHandlers</strong><br>
            All event consumers and webhook processors must verify claim idempotency via Redis/Inbox pattern before dispatching jobs.
          </div>
        </div>
      </div>
    </div>

    <!-- User Reply with MCP prompt -->
    <div class="comment-item" style="background: rgba(22, 27, 34, 0.4);">
      <div class="avatar-user">AT</div>
      <div class="comment-content">
        <div class="comment-author-bar">
          <span class="author-name">alex-turner</span>
          <span class="comment-time">1 hour ago</span>
        </div>
        <div class="comment-body">
          <span class="mention">@fossy</span> check Jira ticket <span style="color:#58a6ff;">ENG-492</span> and update the implementation to use our shared Redis claim token.
        </div>
      </div>
    </div>

    <!-- Fossy MCP Action Response -->
    <div class="comment-item">
      <div class="avatar-fossa">🛡️</div>
      <div class="comment-content">
        <div class="comment-author-bar">
          <span class="author-name">fossy</span>
          <span class="badge-bot">bot</span>
          <span class="badge-tag">MCP: @fossamcp/jira</span>
          <span class="comment-time">45 minutes ago</span>
        </div>
        <div class="comment-body">
          <div class="plugin-banner">
            ⚡ <strong>MCP Plugin Execution:</strong> Resolved Jira issue <strong>ENG-492</strong> (<em>"Enforce Distributed Redis Lock in Review Job Consumer"</em>)
          </div>
          Here is the suggested implementation with inbox claim locking:
          <div class="code-suggestion">
            <span style="color:#f85149;">- await this.jobQueue.dispatchReviewJob(cmd.pullRequestId);</span><br>
            <span style="color:#3fb950;">+ const lockAcquired = await this.idempotency.claim(\`pr:\${cmd.pullRequestId}\`, 60);</span><br>
            <span style="color:#3fb950;">+ if (!lockAcquired) return ReviewResult.skipped('Duplicate in flight');</span><br>
            <span style="color:#3fb950;">+ await this.jobQueue.dispatchReviewJob(cmd.pullRequestId);</span>
          </div>
          <div class="reactions">
            <div class="reaction-pill">👍 3</div>
            <div class="reaction-pill">🚀 2</div>
            <div class="reaction-pill">🎉 1</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// EXECUTE
// -------------------------------------------------------------
const docsImagesDir = path.join(__dirname, '..', 'docs', 'images');

console.log('Rendering remaining FOSSA images...');

renderHtmlToPng(
  getSyncRulesHtml(),
  path.join(docsImagesDir, 'sync-rules.png'),
  1400,
  460
);

renderHtmlToPng(
  getTokenHtml(),
  path.join(docsImagesDir, 'token.png'),
  1400,
  180
);

renderHtmlToPng(
  getCommentMcpHtml(),
  path.join(docsImagesDir, 'comment-mcp.png'),
  1160,
  700
);

console.log('Done rendering remaining images!');
