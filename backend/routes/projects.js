const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const unzipper = require('unzipper');
const ProjectService = require('../services/projects');
const { TEMPLATES } = require('../services/templates');

const upload = multer({ dest: '/tmp/mobclowd-uploads/' });

let projectService;
router.use((req, res, next) => {
  if (!projectService) {
    projectService = new ProjectService(req.app.get('workspaceDir'));
  }
  req.projectService = projectService;
  next();
});

// GET all projects
router.get('/', (req, res) => {
  const projects = req.projectService.getAll();
  res.json({ projects });
});

// GET single project
router.get('/:id', (req, res) => {
  const project = req.projectService.getById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const tree = req.projectService.getFileTree(req.params.id);
  res.json({ project, tree });
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const { name, description, template } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const project = req.projectService.create({ name, description, template: template || 'blank' });
    const projectDir = req.projectService.getProjectDir(project.id);

    // Apply template if specified
    if (template && template !== 'blank' && TEMPLATES[template]) {
      await TEMPLATES[template].scaffold(projectDir);
    } else {
      // Create minimal blank project
      fs.writeFileSync(path.join(projectDir, 'index.html'), getBlankHTML(name));
      fs.writeFileSync(path.join(projectDir, 'style.css'), getBlankCSS());
      fs.writeFileSync(path.join(projectDir, 'script.js'), getBlankJS());
    }

    const tree = req.projectService.getFileTree(project.id);
    res.json({ project, tree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update project
router.put('/:id', (req, res) => {
  const project = req.projectService.update(req.params.id, req.body);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json({ project });
});

// DELETE project
router.delete('/:id', (req, res) => {
  const ok = req.projectService.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// GET file tree
router.get('/:id/tree', (req, res) => {
  const tree = req.projectService.getFileTree(req.params.id);
  res.json({ tree });
});

// POST upload project ZIP
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const projectDir = req.projectService.getProjectDir(req.params.id);
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    fs.ensureDirSync(projectDir);

    await fs.createReadStream(file.path)
      .pipe(unzipper.Extract({ path: projectDir }))
      .promise();

    fs.removeSync(file.path);

    const tree = req.projectService.getFileTree(req.params.id);
    res.json({ success: true, tree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET download project as ZIP
router.get('/:id/download', (req, res) => {
  const project = req.projectService.getById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const projectDir = req.projectService.getProjectDir(req.params.id);
  const archive = archiver('zip');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${project.name}.zip"`);

  archive.pipe(res);
  archive.directory(projectDir, false);
  archive.finalize();
});

// GET snapshot/history
router.get('/:id/snapshots', (req, res) => {
  const snapshotsDir = path.join(req.projectService.getProjectDir(req.params.id), '.snapshots');
  if (!fs.existsSync(snapshotsDir)) return res.json({ snapshots: [] });
  const snaps = fs.readdirSync(snapshotsDir).filter(f => f.endsWith('.json'));
  const snapshots = snaps.map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(snapshotsDir, f))); } catch { return null; }
  }).filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
  res.json({ snapshots });
});

// POST restore snapshot
router.post('/:id/snapshots/:snapId/restore', async (req, res) => {
  try {
    const projectDir = req.projectService.getProjectDir(req.params.id);
    const snapFile = path.join(projectDir, '.snapshots', `${req.params.snapId}.json`);
    if (!fs.existsSync(snapFile)) return res.status(404).json({ error: 'Snapshot not found' });
    const snap = fs.readJsonSync(snapFile);
    for (const [filePath, content] of Object.entries(snap.files)) {
      const full = path.join(projectDir, filePath);
      fs.ensureDirSync(path.dirname(full));
      fs.writeFileSync(full, content);
    }
    const tree = req.projectService.getFileTree(req.params.id);
    res.json({ success: true, tree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getBlankHTML(name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to ${name}</h1>
    <p>Start building your project with AI assistance.</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`;
}

function getBlankCSS() {
  return `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0a0a0f; color: #fff; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
h1 { font-size: 2.5rem; margin-bottom: 1rem; }`;
}

function getBlankJS() {
  return `// Your JavaScript code here
console.log('Mobclowd Project initialized');`;
}

module.exports = router;
