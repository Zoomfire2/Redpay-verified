// All redpay task links (34 unique). Cloned + varied to 120.
const raw = [
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029Vb8LZIsIt5rrTmMQaz0A"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbCGaIFLtOj3GvcWjM29"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029Vb86W729MF8wKsNe4A2S"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029Vb8Kv6o4inotAGj0pq0y"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029Vb81pFBLNSZy4yHJMA1Z"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbCYvxgLtOjG4KYo472z"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbDE7YE7YSd5RvPv2I1b"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbD5hKcADTOM8s0QZk3G"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbCwrES5q08dXa67Qc3o"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029Vb8OdWPH5JM7bkDT0k3B"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbD8L3Q1CYoXf3bLY301"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029Vb89pBA3wtb3ZcYq0s2u"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbCLqBU72WTuDYkqh40G"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbDMUfh1CYoYAlxk1l1W"],
  ["WhatsApp Channel", "https://whatsapp.com/channel/0029Vb87hmYLCoWtpW5CyA35"],
  ["Telegram", "https://t.me/savagecruisex"],
  ["Telegram", "https://t.me/savage_ec_tech"],
  ["Telegram", "https://t.me/savage_ec_tech_gc"],
  ["Telegram", "https://t.me/savageaitech"],
  ["Telegram", "https://t.me/savageaitechgc"],
  ["Telegram", "https://t.me/savagehubxx"],
  ["Telegram", "https://t.me/savagehubxxx"],
  ["Telegram", "https://t.me/+8p7MrlX7ZNRjMzQ0"],
  ["Telegram", "https://t.me/+u3sMfa5ajus1NGE0"],
  ["Telegram", "https://t.me/+IlmEbeJOnNUwNTBk"],
  ["Telegram", "https://t.me/+K3Gq7PQ6XJZhODI0"],
  ["Telegram", "https://t.me/savagehubgc"],
  ["Telegram", "https://t.me/update_hubx"],
  ["Telegram", "https://t.me/+vE_PGIk-UPxjMjQ0"],
  ["Telegram", "https://t.me/+SzwUNWy6utw5Njhk"],
  ["Telegram", "https://t.me/+ExTgEbytImg1MTk0"],
  ["Telegram", "https://t.me/+y9NxCEGj8iw2MTY0"],
  ["Telegram", "https://t.me/earnlivee"],
];

const titles = [
  "Join and follow", "Follow for updates", "Subscribe now", "Join community",
  "Follow official", "Join the earners", "Follow and earn",
];

export const SEED_TASKS: { title: string; platform: string; url: string }[] = [];
let n = 1;
for (const t of titles) {
  for (const [platform, url] of raw) {
    SEED_TASKS.push({ title: `${t} — Task #${n++}`, platform, url });
    if (SEED_TASKS.length >= 120) break;
  }
  if (SEED_TASKS.length >= 120) break;
}
