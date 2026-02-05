/**
 * Placeholder Generator for Honkai Plants vs. Zombies
 * This script generates placeholder images and audio files for testing
 */

// Required Node.js modules
// Run: npm install canvas fs-extra
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

// Ensure directories exist
fs.ensureDirSync(path.join(__dirname, 'assets/images'));
fs.ensureDirSync(path.join(__dirname, 'assets/audio'));

// Function to generate a colored rectangle with text
function generatePlaceholderImage(filename, text, width, height, color) {
    const filePath = path.join(__dirname, filename);

    // Skip if the real file already exists
    if (fs.existsSync(filePath)) {
        console.log(`Skipped (already exists): ${filename}`);
        return;
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Add border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.floor(width / 10)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Wrap text if needed
    const words = text.split(' ');
    let line = '';
    let lines = [];
    let y = height / 2;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > width - 10 && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // Calculate starting y position for text
    const lineHeight = Math.floor(width / 8);
    y = height / 2 - (lines.length - 1) * lineHeight / 2;

    // Draw each line
    lines.forEach((line, i) => {
        ctx.fillText(line.trim(), width / 2, y + i * lineHeight);
    });

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);

    console.log(`Generated: ${filename}`);
}

// Function to generate a placeholder audio file
function generatePlaceholderAudio(filename) {
    const filePath = path.join(__dirname, filename);

    // Skip if the real file already exists
    if (fs.existsSync(filePath)) {
        console.log(`Skipped (already exists): ${filename}`);
        return;
    }

    // Copy a sample silent MP3 file
    const samplePath = path.join(__dirname, 'sample_silent.mp3');

    if (fs.existsSync(samplePath)) {
        fs.copyFileSync(samplePath, filePath);
        console.log(`Generated: ${filename}`);
    } else {
        fs.writeFileSync(
            filePath.replace('.mp3', '.txt'),
            `This is a placeholder for ${filename}. Please replace with an actual MP3 file.`
        );
        console.log(`Generated placeholder text for: ${filename}`);
    }
}

// Generate player character placeholders
const players = [
    { name: 'Hua', color: '#4CAF50' },
    { name: 'Felis', color: '#FFEB3B' },
    { name: 'Su', color: '#795548' },
    { name: 'Sakura', color: '#2196F3' },
    { name: 'Elysia', color: '#E91E63' },
    { name: 'Griseo', color: '#FF9800' },
    { name: 'Kevin', color: '#00BCD4' },
    { name: 'Kalpas', color: '#F44336' }
];

players.forEach(player => {
    generatePlaceholderImage(
        `assets/images/${player.name.toLowerCase()}.png`,
        player.name,
        70,
        70,
        player.color
    );
});

// Generate enemy placeholders
const enemies = [
    { name: 'Zom1', color: '#673AB7' },
    { name: 'Zom2', color: '#9C27B0' },
    { name: 'Zom3', color: '#3F51B5' }
];

enemies.forEach((enemy, index) => {
    generatePlaceholderImage(
        `assets/images/zom${index + 1}.png`,
        enemy.name,
        70,
        70,
        enemy.color
    );
});

// Generate projectile placeholders
const projectiles = [
    { name: 'Pea', color: '#4CAF50' },
    { name: 'Snowpea', color: '#2196F3' },
    { name: 'Firepea', color: '#FF5722' }
];

projectiles.forEach(projectile => {
    generatePlaceholderImage(
        `assets/images/${projectile.name.toLowerCase()}.png`,
        projectile.name,
        20,
        20,
        projectile.color
    );
});

// Generate background placeholders
for (let i = 1; i <= 6; i++) {
    generatePlaceholderImage(
        `assets/images/background${i}.jpg`,
        `Stage ${i} Background`,
        960,
        480,
        `hsl(${(i - 1) * 60}, 70%, 70%)`
    );
}

// Generate audio placeholders
for (let i = 1; i <= 6; i++) {
    generatePlaceholderAudio(`assets/images/stage${i}.mp3`);
}

console.log('All placeholder assets have been generated!');
console.log('Remember to replace these with your custom Honkai-themed assets.');
