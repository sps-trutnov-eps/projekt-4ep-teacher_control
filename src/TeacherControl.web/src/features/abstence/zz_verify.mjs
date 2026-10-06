import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9335
const BASE = 'http://localhost:5199'
const OUT = process.cwd()

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'))
spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--disable-gpu',
  '--no-sandbox',
  '--no-first-run',
  '--hide-scrollbars',
  '--window-size=1500,950',
  'about:blank',
], { stdio: 'ignore' })

async function waitFor(fn, timeout = 25000, interval = 300) {
  const end = Date.now() + timeout
  let lastErr
  while (Date.now() < end) {
    try { return await fn() } catch (e) { lastErr = e; await sleep(interval) }
  }
  throw lastErr
}

const target = await waitFor(async () => {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/list`)
  const j = await r.json()
  const p = j.find((t) => t.type === 'page')
  if (!p) throw new Error('no page target')
  return p
})

const ws = new WebSocket(target.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
const posts = []
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) rej(new Error(msg.error.message))
    else res(msg.result)
    return
  }
  if (msg.method === 'Network.requestWillBeSent') {
    const req = msg.params.request
    if (req.method === 'POST') posts.push(`${req.url} ${req.postData ?? ''}`)
  }
})
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })

const send = (method, params = {}) => {
  const mid = ++id
  ws.send(JSON.stringify({ id: mid, method, params }))
  return new Promise((res, rej) => pending.set(mid, { res, rej }))
}
async function js(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception.description)
  return r.result.value
}
const click = (text) => js(`
  (() => {
    const cand = [...document.querySelectorAll('*')].filter(e => e.textContent.includes(${JSON.stringify(text)}));
    if (!cand.length) return 'NOT FOUND: ${text}';
    cand.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    cand[0].click(); return 'clicked';
  })()
`)
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(path.join(OUT, name), Buffer.from(r.data, 'base64'))
  console.log('saved', name)
}
const rect = (sel) => js(`(() => {
  const e = document.querySelector(${JSON.stringify(sel)});
  if (!e) return 'missing';
  const b = e.getBoundingClientRect();
  return JSON.stringify({x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height)});
})()`)

await send('Network.enable'); await send('Page.enable'); await send('Runtime.enable')
await send('Page.navigate', { url: `${BASE}/abstence` })
await sleep(3000)

console.log('--- VIEW tab (read-only) ---')
console.log('click teacher:', await click('Petr Svoboda'))
await sleep(1200)
console.log('meter  :', await js(`(() => {
  const all = [...document.querySelectorAll('[aria-label^="Nálada učitele"]')]
    .sort((a,b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height);
  const e = all[0];
  if (!e) return 'missing';
  const b = e.getBoundingClientRect();
  return JSON.stringify({x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height)});
})()`))
console.log('read-only level buttons (must be 0):', await js(`document.querySelectorAll('button[aria-label^="Nastavit náladu"]').length`))
await shot('zz_v1_view.png')

console.log('--- save success toast ---')
console.log('Hodnotit:', await click('Hodnotit')); await sleep(600)
console.log('pick 2  :', await js(`(() => { const e=[...document.querySelectorAll('button[aria-label^="Nastavit náladu na 2"]')][0]; if(!e) return 'NOT FOUND'; e.click(); return 'clicked'; })()`))
await sleep(400)
console.log('Ulozit  :', await click('Uložit')); await sleep(1500)
console.log('POSTs   :', JSON.stringify(posts))
console.log('toasts  :', await js(`JSON.stringify([...document.querySelectorAll('[class*="Notification"], [role="status"], [class*="notification"]')].map(n => n.textContent.trim()).filter(Boolean))`))
console.log('body has success text:', await js(`document.body.innerText.includes('uložena') || document.body.innerText.includes('Uloženo')`))
await shot('zz_v2_toast.png')

console.log('--- MOBILE 420px ---')
await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 1, mobile: true })
await send('Page.navigate', { url: `${BASE}/abstence` })
await sleep(3000)
console.log('expand  :', await click('Eva Dvořáková')); await sleep(1500)
await shot('zz_v3_mobile.png')
console.log('meter on mobile:', await js(`(() => {
  const all = [...document.querySelectorAll('[aria-label^="Nálada učitele"]')]
    .sort((a,b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height);
  const e = all[0];
  if (!e) return 'missing';
  const b = e.getBoundingClientRect();
  return JSON.stringify({x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height)});
})()`))

ws.close()
process.exit(0)
