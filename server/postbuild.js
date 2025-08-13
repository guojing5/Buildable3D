const fs = require('fs');

if (!fs.existsSync('./build/data/')) {
    fs.mkdirSync('./build/data/');
}

fs.copyFile('./data/lanewaySuites.json', './build/data/lanewaySuites.json', (err) => {
    if (err) {
        console.error(err);
    }
});