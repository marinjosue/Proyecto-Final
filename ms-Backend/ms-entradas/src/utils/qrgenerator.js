const QRCode = require('qrcode');

async function generarQR(data) {
  return await QRCode.toDataURL(JSON.stringify(data));
}

module.exports = { generarQR };
