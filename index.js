const express = require("express");
const http = require("http");  // Cambiado de 'https' a 'http'
const ytdl = require("ytdl-core");
const cors = require("cors");
const compression = require("compression");
const responseTime = require("response-time");

const app = express();
const HTTP_PORT = 4173;  // Puerto HTTP para Node.js

// Usa el middleware cors
app.use(cors());

// Usa el middleware de compresión
app.use(compression());

// Usa el middleware response-time
app.use(responseTime());

// Nueva ruta para descargar archivos en formato .mp4
app.get("/download-video/:videoId", async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const info = await ytdl.getInfo(videoId);

    // Filtrar los formatos para obtener uno que tenga tanto audio como video y sea preferiblemente de 720p
    const desiredFormat = info.formats.find(
      (format) =>
        format.hasVideo && format.hasAudio && format.container === "mp4"
    );

    if (!desiredFormat) {
      throw new Error("No se encontró un formato de video en MP4 con audio");
    }

    res.header(
      "Content-Disposition",
      `attachment; filename="${
        info.videoDetails.title
      }.mp4"; filename*=UTF-8''${encodeURIComponent(
        info.videoDetails.title
      )}.mp4`
    );
    res.header("Content-Type", "video/mp4");
    res.setHeader(
      "X-Thumbnail-Url",
      info.videoDetails.thumbnail.thumbnails[0].url
    );

    // Pipe directamente el flujo del video al cliente
    ytdl(videoId, { format: desiredFormat }).pipe(res);
  } catch (error) {
    console.error("Error al obtener información del video:", error.message);
    res.status(500).send("Error al obtener información del video");
  }
});

// Nueva ruta para descargar archivos en formato .mp3
app.get("/download/:videoId", async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const info = await ytdl.getInfo(videoId);

    // Filtrar formatos para obtener solo formatos de audio
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    if (audioFormats.length === 0) {
      throw new Error("No se encontraron formatos de audio.");
    }

    // Seleccionar el primer formato de audio (puedes ajustar esto según tus necesidades)
    const format = audioFormats[0];

    res.header(
      "Content-Disposition",
      `attachment; filename="${
        info.videoDetails.title
      }.mp3"; filename*=UTF-8''${encodeURIComponent(
        info.videoDetails.title
      )}.mp3`
    );
    res.header("Content-Type", "audio/mpeg");
    res.setHeader(
      "X-Thumbnail-Url",
      info.videoDetails.thumbnail.thumbnails[0].url
    );

    // Descargar el flujo de audio y enviar al cliente
    ytdl(videoId, { format: format }).pipe(res);

  } catch (error) {
    console.error("Error al obtener información del video:", error.message);
    res.status(500).send("Error al obtener información del video");
  }
});

// Crear el servidor HTTP
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${HTTP_PORT}`);
});
