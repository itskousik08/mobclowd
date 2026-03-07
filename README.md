# ☁️ MobCloud - Local AI Website Builder
> **The Ultimate Offline Web Studio for Termux & Linux**

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Termux%20%7C%20Linux-green.svg)](https://termux.com)
[![AI Engine](https://img.shields.io/badge/AI-Ollama-orange.svg)](https://ollama.com)
[![Made with](https://img.shields.io/badge/Made%20with-Node.js-yellow.svg)](https://nodejs.org)

**MobCloud** is a powerful, locally hosted AI tool that allows you to generate, edit, and preview websites directly on your mobile device (via Termux) or Linux machine. It runs entirely offline after installation using the **Ollama** engine.

---

## ✨ Features

*   **📱 Fully Offline:** Runs locally on your device using Ollama. No APIs, no subscriptions.
*   **🤖 Multi-Model Support:** Choose from Qwen, DeepSeek, Llama 3, or TinyLlama based on your device RAM.
*   **💻 Professional Editor:** Embedded **Monaco Editor** (VS Code core) for syntax highlighting and coding.
*   **⚡ Live Preview:** Real-time rendering of generated HTML/CSS/JS.
*   **🎨 Hacker-Style Dashboard:** Professional CLI installer with ASCII art and model selection.
*   **💾 Export Ready:** Download your generated websites as a `.zip` file.
*   **🐙 GitHub Integration:** (Coming Soon) Push code directly to your repositories.

---

## 🚀 Installation

### Prerequisites
*   **Android:** [Termux](https://f-droid.org/packages/com.termux/) app installed.
*   **PC:** Any Debian-based Linux distribution (Ubuntu, Kali, etc.).
*   **Storage:** At least **2GB free space** (depends on the AI model you choose).

### 1️⃣ Quick Setup (Termux & Linux)

Copy and paste the following commands into your terminal:

```bash
# 1. Update packages
pkg update -y && pkg upgrade -y

# 2. Install Git
pkg install git -y

# 3. Clone the repository
git clone https://github.com/Koudik53/mobclowd.git

# 4. Enter directory
cd mobclowd

# 5. Run the Magic Installer
chmod +x install.sh
bash install.sh
