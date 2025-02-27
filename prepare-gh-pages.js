const fs = require('fs');
const path = require('path');

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
}

// Create img directory if it doesn't exist
const imgDir = path.join(docsDir, 'img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
}

// Read the film JSON data
const filmsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'film.json'), 'utf8'));

// Copy and modify HTML file
const htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'film.html'), 'utf8');
fs.writeFileSync(path.join(docsDir, 'index.html'), htmlContent);

// Copy and modify CSS file
const cssContent = fs.readFileSync(path.join(__dirname, 'public', 'film.css'), 'utf8');
fs.writeFileSync(path.join(docsDir, 'film.css'), cssContent);

// Copy and modify JS file (replace API calls with static data)
let jsContent = fs.readFileSync(path.join(__dirname, 'public', 'film.js'), 'utf8');

// Replace fetch with static data
jsContent = jsContent.replace(/fetch\("\/films"\)[\s\S]+?\.then\(films => {/m, 
  `// Static data for GitHub Pages\n  const staticFilmsData = ${JSON.stringify(filmsData)};\n  
  // Using static data instead of API call\n  (function() {`);

// Disable API calls for adding and deleting films
jsContent = jsContent.replace(/fetch\(`\/film\/.*?\)/g, 
  '// Fetch call disabled in static version\nconsole.log("Delete operation - would call API in full version");\nPromise.resolve()');
jsContent = jsContent.replace(/fetch\('\/film'.*?\)/g, 
  '// Fetch call disabled in static version\nconsole.log("Add operation - would call API in full version");\nPromise.resolve()');

fs.writeFileSync(path.join(docsDir, 'film.js'), jsContent);

// Copy images
const publicImgDir = path.join(__dirname, 'public', 'img');
if (fs.existsSync(publicImgDir)) {
    const images = fs.readdirSync(publicImgDir);
    images.forEach(image => {
        const src = path.join(publicImgDir, image);
        const dest = path.join(imgDir, image);
        fs.copyFileSync(src, dest);
    });
}

console.log('Files prepared for GitHub Pages in the "docs" directory');
