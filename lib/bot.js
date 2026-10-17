// Penyaring kasar untuk crawler preview (WhatsApp, Facebook/Instagram, Telegram, dll)
// supaya kunjungan dan klik tidak membengkak oleh bot.
const RE = /bot|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|preview|embedly|curl|wget|python-requests|headless|lighthouse/i;
export const isBot = (ua) => !ua || RE.test(ua);
