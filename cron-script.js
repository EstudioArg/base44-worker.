const cron = require('node-cron');
const fetch = require('node-fetch');

const FUNCTION_URL = 'https://base44.app/api/apps/68f472eef832e69daab0c2bd/functions/captureOptionsData';

// Función para verificar si estamos en horario de mercado
function isMarketHours() {
  const now = new Date();
  const argTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  
  const day = argTime.getDay();
  const hours = argTime.getHours();
  const minutes = argTime.getMinutes();
  
  // Lunes a Viernes (1-5)
  if (day === 0 || day === 6) return false;
  
  const timeInMinutes = hours * 60 + minutes;
  const marketOpen = 11 * 60; // 11:00
  const marketClose = 17 * 60; // 17:00
  
  return timeInMinutes >= marketOpen && timeInMinutes < marketClose;
}

// Ejecutar cada 20 segundos
cron.schedule('*/20 * * * * *', async () => {
  if (!isMarketHours()) {
    console.log('⏸️ Fuera de horario de mercado');
    return;
  }
  
  try {
    const now = new Date();
    const argTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const timeStr = argTime.toTimeString().split(' ')[0];
    
    console.log(`🔄 [${timeStr}] Llamando a captureOptionsData...`);
    
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ [${timeStr}] Captura exitosa: ${data.recordsCount} registros`);
    } else {
      console.log(`⚠️ [${timeStr}] Error: ${data.message}`);
    }
  } catch (error) {
    console.error('❌ Error en captura:', error.message);
  }
});

console.log('🚀 Cron job iniciado - Capturando cada 20s en horario de mercado');