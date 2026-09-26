#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const openapiPath = path.join(root, 'docs', 'openapi.json');
const auditPath = path.join(root, 'docs', 'openapi-controller-audit.md');
const outputPath = path.join(root, 'docs', 'openapi-audit-coverage.md');

if (!fs.existsSync(openapiPath)) {
  console.error(`Missing OpenAPI file at ${openapiPath}`);
  process.exit(1);
}

if (!fs.existsSync(auditPath)) {
  console.error(`Missing audit file at ${auditPath}`);
  process.exit(1);
}

const openapi = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
const paths = openapi.paths || {};
const openapiEntries = [];

for (const [route, methods] of Object.entries(paths)) {
  if (!methods || typeof methods !== 'object') continue;
  for (const method of Object.keys(methods)) {
    const upper = method.toUpperCase();
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].includes(upper)) {
      openapiEntries.push(`${upper} ${route}`.trim());
    }
  }
}

const auditLines = fs.readFileSync(auditPath, 'utf8').split('\n');
const auditEntries = [];

for (const line of auditLines) {
  if (!line.startsWith('|')) continue;
  if (line.toLowerCase().includes('não está registrado') || line.toLowerCase().includes('not registered')) {
    continue;
  }
  const cols = line.split('|').map((c) => c.trim());
  if (cols.length < 4) continue;
  const method = cols[1];
  let route = cols[2];
  if (!method || !route) continue;
  if (method === 'Method' || method === '---') continue;
  const upper = method.toUpperCase();
  if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'SSE'].includes(upper)) {
    route = route.replace(/`/g, '').trim();
    route = route.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    const normalizedMethod = upper === 'SSE' ? 'GET' : upper;
    auditEntries.push(`${normalizedMethod} ${route}`.trim());
  }
}

const openapiSet = new Set(openapiEntries);
const auditSet = new Set(auditEntries);

const missing = openapiEntries.filter((e) => !auditSet.has(e)).sort();
const extra = auditEntries.filter((e) => !openapiSet.has(e)).sort();

const lines = [];
lines.push('# OpenAPI Audit Coverage');
lines.push('');
lines.push(`Total endpoints in OpenAPI: ${openapiEntries.length}`);
lines.push(`Documented in audit: ${auditEntries.length}`);
lines.push(`Missing in audit: ${missing.length}`);
lines.push(`Extra in audit (not in OpenAPI): ${extra.length}`);
lines.push('');

if (missing.length) {
  lines.push('## Missing in Audit');
  lines.push('');
  for (const item of missing) {
    lines.push(`- ${item}`);
  }
  lines.push('');
}

if (extra.length) {
  lines.push('## Extra in Audit');
  lines.push('');
  for (const item of extra) {
    lines.push(`- ${item}`);
  }
  lines.push('');
}

fs.writeFileSync(outputPath, lines.join('\n'));
console.log(`Coverage report written to ${outputPath}`);
