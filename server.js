const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

const options = {
    key: fs.readFileSync('key.pem'),       // Path to your private key file (key.pem)
    cert: fs.readFileSync('cert.pem')      // Path to your SSL certificate file (cert.pem)
};

const PORT = process.env.PORT || 443;  // Use port 443 for HTTPS

const server = https.createServer(options, app);

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
