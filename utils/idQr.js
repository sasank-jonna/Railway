// utils/idQr.js
const { ulid } = require('ulid');
const QRCode = require('qrcode');

function genProductId(manufacturerPrefix){
  return `PROD_${manufacturerPrefix}_${ulid()}`;
}

async function genQrDataUrl(data){
  return QRCode.toDataURL(data);
}

module.exports = { genProductId, genQrDataUrl };
