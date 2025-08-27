// utils/emailTemplate.js
import QRCode from 'qrcode'

/**
 * Genera el HTML del email con un QR code basado en un ID
 * @param {Object} data - Información del ticket
 * @param {string} data.id - ID único del ticket
 * @param {string} data.event - Nombre del evento
 * @param {string} data.date - Fecha del evento
 * @param {string} data.user - Nombre del usuario
 * @returns {Promise<string>} HTML listo para enviar por correo
 */

interface TicketData {
    id: string
    event: string
    date: string
    user: string
}

export async function buildTicketEmailHTML(data: TicketData): Promise<string> {
    // 1. Generar QR code en base64
    const qrCodeDataURL = await QRCode.toDataURL(data.id)

    // 2. Construir HTML
    return `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f9f9f9;
          color: #333;
          padding: 20px; 
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          margin: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        h2 {
          color: #2c3e50;
        }
        .qr {
          text-align: center;
          margin-top: 20px;
        }
        .qr img {
          width: 150px;
          height: 150px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>🎟️ Tu Ticket</h2>
        <p><strong>Evento:</strong> ${data.event}</p>
        <p><strong>Fecha:</strong> ${data.date}</p>
        <p><strong>Nombre:</strong> ${data.user}</p>
        <p><strong>ID de ticket:</strong> ${data.id}</p>

        <div class="qr">
          <p>Escanea este QR para validar tu ticket:</p>
          <img src="${qrCodeDataURL}" alt="QR Code" />
        </div>
      </div>
    </body>
  </html>
  `
}
