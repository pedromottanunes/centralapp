/* worker_mp3.js – encoder em streaming -------------------------- */
self.importScripts('https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js');

let encoder, sampleRate;

self.onmessage = e => {
  const { cmd, buf } = e.data;

  if (cmd === 'init') {                         /* 1️⃣ iniciar            */
    sampleRate = e.data.sampleRate;             // Hz (ex.: 48 000)
    encoder    = new lamejs.Mp3Encoder(1, sampleRate, 96); // mono - 96 kbps
    return;
  }

  if (cmd === 'flush') {                        /* 3️⃣ finalizar          */
    const end = encoder.flush();
    if (end.length) self.postMessage(end, [end.buffer]);
    self.postMessage({ done: true });
    return;
  }

  /* 2️⃣ cmd === 'encode'  –  buf = Float32Array (mono PCM)         */
  const i16 = new Int16Array(buf.length);
  for (let i = 0; i < buf.length; ++i)
    i16[i] = Math.max(-32768, Math.min(32767, buf[i] * 32767));

  const mp3buf = encoder.encodeBuffer(i16);
  if (mp3buf.length) self.postMessage(mp3buf, [mp3buf.buffer]);
};
