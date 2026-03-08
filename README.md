# Mobclowd – AI Website Builder

Mobclowd is a local AI powered no-code website generator that allows users to create and host full websites using simple text prompts.

---

## 🚀 Features

-   **🧠 AI Powered Website Generation**: Describe the website you want, and Mobclowd will generate it for you.
-   **⚡ Instant Live Preview**: See a live preview of your generated website in real-time.
-   **💾 Download Generated Website**: Export the complete website as a ZIP file.
-   **🖥️ Runs Fully Local**: No need for an internet connection after the initial setup. Your data stays private.
-   **🔌 Ollama Model Support**: Choose from a variety of Ollama models to power your website generation.
-   **🎨 Modern UI**: A clean, responsive, and user-friendly interface with dark mode.
-   **🔄 Regenerate Websites**: Easily regenerate the website with a new prompt or modify the existing one.
-   **📂 Export Project**: Download the generated files as a project folder.
-   **📡 Local Server Hosting**: Mobclowd runs a local server to host the generated website for preview.

---

## 🛠️ Installation Guide

Follow these steps to get Mobclowd up and running on your local machine.

**1. Clone the repository:**

```bash
git clone https://github.com/itskousik08/Mobclowd.git
cd Mobclowd
```

**2. Install dependencies:**

```bash
npm install
```

**3. Install Ollama and a Model:**

You must have Ollama installed and running. Download it from [https://ollama.com/](https://ollama.com/).

Then, pull a model from the command line.

```bash
ollama pull glm-5:cloud
```

**4. Start Mobclowd:**

```bash
npm start
```

The tool will start, and your default web browser will open to `http://localhost:3000`.

---

## 🤖 Ollama Models List

You can use any model available on Ollama. Here are a few recommendations. To use one, simply pull it with the `ollama pull` command.

| Model         | Size    | Command                     |
| :------------ | :------ | :-------------------------- |
| `glm-5:cloud` | ~9GB    | `ollama pull glm-5:cloud`   |
| `llama3`      | ~4.7GB  | `ollama pull llama3`        |
| `mistral`     | ~4.1GB  | `ollama pull mistral`       |
| `codellama`   | ~7.4GB  | `ollama pull codellama`     |
| `gemma:2b`    | ~1.4GB  | `ollama pull gemma:2b`      |

Once a model is pulled, it will appear in the model selection dropdown in the Mobclowd interface.

---

## 📝 How It Works

1.  **Enter a Prompt**: Describe the website you want to create in the input box.
2.  **Select a Model**: Choose your preferred Ollama model from the dropdown.
3.  **Generate**: Click the "Generate" button. The AI will generate the HTML, CSS, and JavaScript.
4.  **Preview**: The generated website appears in the live preview iframe.
5.  **Download**: Click the "Download ZIP" button to get the complete website files.
6.  **Regenerate**: Change the prompt and click "Regenerate" to create a new version.
