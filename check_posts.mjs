import fs from 'fs';
import path from 'path';

const postsDir = 'src/content/posts';
const files = fs.readdirSync(postsDir);

let count = 0;
files.forEach(file => {
  if (file.endsWith('.md') && !file.startsWith('-')) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    if (!content.includes('draft: true')) {
      count++;
    }
  }
});

console.log('Filtered Posts Count:', count);
console.log('Total Pages (15 per page):', Math.ceil(count / 15));
