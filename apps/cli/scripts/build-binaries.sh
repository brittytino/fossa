#!/bin/bash
# Gera binários standalone (não precisa de Node.js instalado)

pnpm add -g pkg

# Build para todas plataformas
pkg . \
  --targets node18-linux-x64,node18-macos-x64,node18-win-x64 \
  --output dist/fossa

echo "✅ Binários criados em dist/"
echo "  - dist/fossa-linux"
echo "  - dist/fossa-macos"  
echo "  - dist/fossa-win.exe"
