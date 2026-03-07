#!/bin/bash

# --- MobCloud Fix Installer ---
echo -e "\033[1;36m>>> MobCloud Setup Starting... <<<\033[0m"

# 1. Check Dependencies
echo ">> Checking apps..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    pkg install nodejs -y
fi

if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    pkg install ollama -y
fi

# 2. Start Ollama Server
echo ">> Starting AI Engine..."
# Pehle agar koi server chal raha hai to usko band karo
pkill ollama
sleep 2
# Server start karo background mein
ollama serve > /dev/null 2>&1 &
echo "Waiting 10 seconds for server to start..."
sleep 10

# 3. Download Model (Qwen 0.5B - Smallest working model)
MODEL="qwen2.5:0.5b"
echo ">> Downloading AI Model ($MODEL)..."
echo ">> Screen ON rakhein! Isme time lagega (approx 400MB)."
ollama pull $MODEL

# 4. Save Config
echo "{ \"model\": \"$MODEL\" }" > config.json

# 5. Install Node Modules
if [ -f "package.json" ]; then
    echo ">> Installing Server Files..."
    npm install
else
    echo "Error: package.json missing. Clone again."
    exit 1
fi

# 6. Start
echo -e "\033[1;32m>>> SETUP COMPLETE! Starting Server... <<<\033[0m"
echo "Open in Chrome: http://localhost:3000"
npm start
