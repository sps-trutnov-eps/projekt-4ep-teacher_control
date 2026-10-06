import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9334
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
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      await sleep(interval)
    }
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

await new Promise((res, rej) => {
  ws.addEventListener('open', res)
  ws.addEventListener('error', rej)
})

function send(method, params = {}) {
  const mid = ++id
  ws.send(JSON.stringify({ id: mid, method, params }))
  return new Promise((res, rej) => pending.set(mid, { res, rej }))
}

async function js(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails))
  return r.result.value
}

/** Klikne na nejhlubší element, který text obsahuje (klik se propagne na label/tlačítko). */
const click = (text) => js(`
  (() => {
    const cand = [...document.querySelectorAll('*')]
      .filter(e => e.textContent.includes(${JSON.stringify(text)}));
    if (!cand.length) return 'NOT FOUND: ${text}';
    cand.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
    const el = cand[0];
    el.click();
    return 'clicked <' + el.tagName.toLowerCase() + '> ' + el.textContent.trim().slice(0, 40);
  })()
`)

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(path.join(OUT, name), Buffer.from(r.data, 'base64'))
  console.log('saved', name)
}

const LAYOUT = `(() => {
  const r = el => el ? (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(el.getBoundingClientRect()) : null;
  // V detailu je metr i avatar; v seznamu jsou další — bereme největší.
  const meters = [...document.querySelectorAll('[aria-label^="Nálada učitele"]')].map(r);
  const avatars = [...document.querySelectorAll('.mantine-Avatar-root')].map(r);
  const meter = meters.sort((a,b)=>b.h-a.h)[0];
  const avatar = avatars.sort((a,b)=>b.w-a.w)[0];
  const seg = (() => {
    const m = [...document.querySelectorAll('[aria-label^="Nálada učitele"]')].sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
    return m ? r(m.querySelector(':scope > div > div')) : null;
  })();
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Uložit');
  const submit = document.querySelector('button[type="submit"]');
  return JSON.stringify({meter, avatar, segment: seg, ulozit: r(submit), btnText: btn && btn.textContent.trim(), meterLeftOfAvatarRight: meter && avatar ? meter.x >= avatar.x + avatar.w : null}, null, 1);
})()`

await send('Network.enable')
await send('Page.enable')
await send('Runtime.enable')

await send('Page.navigate', { url: `${BASE}/abstence` })
await sleep(3000)

console.log('--- click teacher ---')
console.log(await click('Petr Svoboda'))
await sleep(1500)
await shot('zz_1_view.png')
console.log('--- layout (view tab) ---')
console.log(await js(LAYOUT))

console.log('--- click Hodnotit ---')
console.log(await click('Hodnotit'))
await sleep(1000)
await shot('zz_2_rate.png')
console.log('--- layout (rate tab) ---')
console.log(await js(LAYOUT))
console.log('presets found:', await js(`JSON.stringify([...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(t=>/^\\+\\d+$/.test(t)))`))

console.log('--- pick mood level 3 (must NOT POST yet) ---')
console.log(await js(`(() => {
  const el = [...document.querySelectorAll('button[aria-label^="Nastavit náladu na 3"]')][0];
  if (!el) return 'NOT FOUND';
  el.click(); return 'clicked';
})()`))
await sleep(700)
console.log('POSTs after mood click:', JSON.stringify(posts))

console.log('--- click Uložit ---')
console.log(await click('Uložit'))
await sleep(2500)
console.log('POSTs after Uložit:', JSON.stringify(posts, null, 1))
await shot('zz_3_saved.png')

console.log('--- now delay only: +15 then Uložit (mood unchanged -> should POST only delay) ---')
console.log(await click('+15'))
await sleep(500)
const cut = posts.length
console.log(await click('Uložit'))
await sleep(2500)
console.log('new POSTs:', JSON.stringify(posts.slice(cut), null, 1))
await shot('zz_4_after.png')

ws.close()
process.exit(0)
