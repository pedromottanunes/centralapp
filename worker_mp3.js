/* worker_mp3.js – encoder em streaming CORRIGIDO */
self.importScripts('https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js');

let encoder, sampleRate;

self.onmessage = e => {
  const { cmd } = e.data;

  if (cmd === 'init') {
    sampleRate = e.data.sampleRate;
    encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // Aumentei para 128 kbps
    return;
  }

  if (cmd === 'flush') {
    const end = encoder.flush();
    if (end.length) {
      // CORREÇÃO: não transferir o buffer, apenas copiar os dados
      self.postMessage(new Uint8Array(end));
    }
    self.postMessage({ done: true });
    return;
  }

  if (cmd === 'encode') {
    const buf = e.data.buf;
    
    // CORREÇÃO: verificar se o buffer é válido
    if (!buf || buf.length === 0) return;
    
    const i16 = new Int16Array(buf.length);
    for (let i = 0; i < buf.length; i++) {
      // CORREÇÃO: melhor clamping dos valores
      const sample = Math.max(-1, Math.min(1, buf[i]));
      i16[i] = Math.round(sample * 32767);
    }

    const mp3buf = encoder.encodeBuffer(i16);
    if (mp3buf.length > 0) {
      // CORREÇÃO: não transferir o buffer
      self.postMessage(new Uint8Array(mp3buf));
    }
  }
};
