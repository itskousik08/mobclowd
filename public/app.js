// Initialize Monaco Editor
let editor;
let currentTab = 'html';
const code = {
    html: '<h1>Welcome to MobCloud</h1><p>Enter a prompt to start.</p>',
    css: 'body { font-family: sans-serif; padding: 20px; }',
    js: 'console.log("Ready");'
};

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' }});

require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: code.html,
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false }
    });
    updatePreview();
});

function switchTab(type) {
    // Save current editor content to state
    code[currentTab] = editor.getValue();
    currentTab = type;
    
    // Set editor content
    editor.setValue(code[type]);
    monaco.editor.setModelLanguage(editor.getModel(), type === 'js' ? 'javascript' : type);
    
    // Update active tab UI
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
}

function updatePreview() {
    // Save current state first
    if(editor) code[currentTab] = editor.getValue();

    const frame = document.getElementById('previewFrame');
    const doc = frame.contentDocument || frame.contentWindow.document;
    
    const combinedCode = `
        <html>
        <head>
            <style>${code.css}</style>
        </head>
        <body>
            ${code.html}
            <script>${code.js}<\/script>
        </body>
        </html>
    `;
    
    doc.open();
    doc.write(combinedCode);
    doc.close();
}

// Event Listeners
document.getElementById('applyBtn').addEventListener('click', updatePreview);

document.getElementById('generateBtn').addEventListener('click', async () => {
    const prompt = document.getElementById('promptInput').value;
    const btn = document.getElementById('generateBtn');
    
    if(!prompt) return alert("Please enter a prompt");

    btn.innerText = "Generating... (This takes time)";
    btn.disabled = true;

    // Save current state incase user wants to edit existing
    if(editor) code[currentTab] = editor.getValue();

    try {
        const res = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt, currentCode: code })
        });
        
        const data = await res.json();
        
        if (data.html) code.html = data.html;
        if (data.css) code.css = data.css;
        if (data.js) code.js = data.js;

        // Refresh Editor and Preview
        editor.setValue(code[currentTab]);
        updatePreview();

    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        btn.innerText = "✨ Generate Website";
        btn.disabled = false;
    }
});

// Download ZIP
document.getElementById('downloadBtn').addEventListener('click', function() {
    const zip = new JSZip();
    zip.file("index.html", `<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body>${code.html}<script src="script.js"></script></body></html>`);
    zip.file("style.css", code.css);
    zip.file("script.js", code.js);
    
    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "mobcloud-website.zip");
    });
});

// GitHub Publish
document.getElementById('ghPublishBtn').addEventListener('click', async () => {
    const token = document.getElementById('ghToken').value;
    const repo = document.getElementById('ghRepo').value;
    const status = document.getElementById('ghStatus');

    if(!token || !repo) return alert("Please fill all fields");
    
    status.innerText = "Publishing...";
    
    try {
        const res = await fetch('/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token,
                repoName: repo,
                files: code
            })
        });
        const data = await res.json();
        if(data.url) {
            status.innerHTML = `Success! <a href="${data.url}" target="_blank">View Repo</a>`;
        } else {
            status.innerText = "Error: " + data.error;
        }
    } catch(e) {
        status.innerText = "Error publishing";
    }
});
