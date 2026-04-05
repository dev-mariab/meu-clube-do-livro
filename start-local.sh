#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Meu Clube do Livro...${NC}"

# Ativar NVM
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Logs
BACKEND_LOG="$PROJECT_DIR/backend.log"
FRONTEND_LOG="$PROJECT_DIR/frontend.log"

# Matar processos antigos se existirem
pkill -f "npm run dev" 2>/dev/null
sleep 1

# Iniciar backend em background
echo -e "${BLUE}📡 Iniciando Backend na porta 3001...${NC}"
cd "$PROJECT_DIR/backend"
nohup npm run dev > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID" > "$PROJECT_DIR/.pids"

# Aguardar backend iniciar
sleep 4

# Iniciar frontend em background
echo -e "${BLUE}⚛️  Iniciando Frontend na porta 5173...${NC}"
cd "$PROJECT_DIR"
nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID" >> "$PROJECT_DIR/.pids"

# Aguardar frontend iniciar
sleep 3

# Obter IP local para acesso externo
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}✅ Serviços iniciados com sucesso!${NC}"
echo ""
echo -e "${BLUE}🌐 Acesse seu app aqui:${NC}"
echo -e "   ${GREEN}http://$LOCAL_IP:5173${NC}"
echo ""
echo -e "${BLUE}📝 Login:${NC}"
echo "   Email: pinhom913@gmail.com"
echo "   (use sua senha)"
echo ""
echo -e "${BLUE}📋 Logs:${NC}"
echo "   Backend:  tail -f $BACKEND_LOG"
echo "   Frontend: tail -f $FRONTEND_LOG"
echo ""
echo -e "${BLUE}🛑 Para parar tudo, execute:${NC}"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
