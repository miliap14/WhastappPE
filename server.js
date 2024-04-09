const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const app = express();
const PORT = 3001;
const client = new Client();

// Middlewares
app.use(bodyParser.json());

client.on('qr', (qr) => {
  // Genera el QR en la terminal
  qrcodeTerminal.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Cliente de WhatsApp listo!');
});

client.initialize();

app.post('/SendMessage', async (req, res) => {
  try {
    const { phoneNumber, messageText } = req.body;
    console.log(phoneNumber)

    let chatId = `${phoneNumber}@c.us`; // WhatsApp utiliza el formato {phoneNumber}@c.us para los chat IDs
    console.log(chatId);
    await client.sendMessage(chatId, messageText);

    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error(`Error enviando mensaje: ${error}`);
    res.status(500).json({ success: false, message: 'Error enviando mensaje' });
  }
});

app.post('/AddToGroup', async (req, res) => {
  try {
    const { groupName, participantId } = req.body;
    console.log(req.body);
    // Busca el grupo por su nombre
    let group = null;
    const chats = await client.getChats();
    for (let chat of chats) {
      if (chat.isGroup && chat.name === groupName) {
        group = chat;
        break;
      }
    }

    if (group) {
      // Añade al participante al grupo
      await group.addParticipants([`${participantId}@c.us`]);
      res.json({ success: true, message: 'Participante añadido correctamente al grupo' });
    } else {
      res.status(404).json({ success: false, message: 'Grupo no encontrado' });
    }
  } catch (error) {
    console.error(`Error añadiendo participante al grupo: ${error}`);
    res.status(500).json({ success: false, message: 'Error añadiendo participante al grupo' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
