// server.js
const express = require("express");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const compression = require("compression");
const responseTime = require("response-time");
const routes = require("./routes");
const PORT = 3001;
const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(responseTime());

app.use("/", routes);

// Configuración del servidor HTTPS
const privateKey = fs.readFileSync('/etc/letsencrypt/live/mp3yt.tech/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/mp3yt.tech/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`Servidor HTTPS escuchando en https://localhost:${PORT}`);
});
