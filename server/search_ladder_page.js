const fs = require('fs');
const content = fs.readFileSync('c:/Users/numaa/Downloads/Credify/client/src/pages/LadderPage.jsx', 'utf8');

const lines = content.split('\n');
console.log('Searching for simulateApproval in LadderPage.jsx:');
lines.forEach((line, idx) => {
  if (line.includes('simulateApproval') || line.includes('Simulate Approval') || line.includes('simulate') || line.includes('Simulated')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
