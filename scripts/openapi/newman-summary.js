#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const reportPath = path.join(root, 'docs', 'openapi.newman.json');
const outputPath = path.join(root, 'docs', 'openapi.newman-summary.md');

if (!fs.existsSync(reportPath)) {
  console.error(`Missing Newman report at ${reportPath}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const executions = Array.isArray(report?.run?.executions) ? report.run.executions : [];

const buildUrl = (url) => {
  if (!url) return '';
  if (typeof url === 'string') return url;
  if (url.raw) return url.raw;
  const protocol = url.protocol ? `${url.protocol}://` : '';
  const host = Array.isArray(url.host) ? url.host.join('.') : url.host || '';
  const port = url.port ? `:${url.port}` : '';
  const path = Array.isArray(url.path) ? url.path.join('/') : url.path || '';
  const query = Array.isArray(url.query)
    ? url.query
        .map((q) => {
          if (!q || !q.key) return null;
          const value = q.value ?? '';
          return `${q.key}=${value}`;
        })
        .filter(Boolean)
        .join('&')
    : '';
  const queryPrefix = query ? `?${query}` : '';
  return `${protocol}${host}${port}/${path}${queryPrefix}`;
};

const rows = executions
  .map((exec) => {
    const name = exec.item?.name || 'Unnamed request';
    const request = exec.request || {};
    const method = request.method || '';
    const url = buildUrl(request.url);
    const status = exec.response?.code || 0;
    return { name, method, url, status };
  })
  .filter((row) => row.method);

const statusBuckets = rows.reduce((acc, row) => {
  const key = row.status || 0;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const non2xx = rows.filter((r) => r.status < 200 || r.status >= 300);

const lines = [];
lines.push('# Newman Run Summary');
lines.push('');
lines.push(`Total requests: ${rows.length}`);
lines.push('');
lines.push('## Status Codes');
lines.push('');
Object.keys(statusBuckets)
  .sort((a, b) => Number(a) - Number(b))
  .forEach((code) => {
    lines.push(`- ${code}: ${statusBuckets[code]}`);
  });
lines.push('');

lines.push('## Non-2xx Responses');
lines.push('');
if (!non2xx.length) {
  lines.push('All requests returned 2xx responses.');
} else {
  for (const item of non2xx) {
    lines.push(`- ${item.method} ${item.url} → ${item.status}`);
  }
}
lines.push('');

fs.writeFileSync(outputPath, lines.join('\n'));
console.log(`Newman summary written to ${outputPath}`);
