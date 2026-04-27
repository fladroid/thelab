
const canvas = document.getElementById('maxwell-canvas');
const ctx = canvas.getContext('2d');
const memBar = document.getElementById('mem-bar');
const memLabel = document.getElementById('mem-label');
const statusText = document.getElementById('status-text');
const btnRestart = document.getElementById('btn-restart');

let W, H, MID;
const GATE_H = 36;
const N = 28;
const MEM_MAX = 32;
const R = 5;
const SPEED_THRESH = 1.6;

let molecules = [], memUsed = 0, decisions = 0;
let running = false, gateOpen = false, gateTimer = 0, animId = null;
let propAngle = 0;

function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

function resize() {
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = 340;
  MID = W / 2;
}

function spd(m) { return Math.sqrt(m.vx*m.vx + m.vy*m.vy); }

function init() {
  resize();
  molecules = [];
  for (let i = 0; i < N; i++) {
    const side = Math.random() < 0.5 ? 'L' : 'R';
    const x = side === 'L'
      ? R + Math.random() * (MID - R*2 - 20)
      : MID + 20 + Math.random() * (W - MID - R*2 - 20);
    const y = R + Math.random() * (H - R*2);
    const s = 0.7 + Math.random() * 2.1;
    const a = Math.random() * Math.PI * 2;
    molecules.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s });
  }
  memUsed = 0; decisions = 0; gateOpen = false; gateTimer = 0; propAngle = 0;
  updateMem();
}

function updateMem() {
  const pct = (memUsed / MEM_MAX) * 100;
  memBar.style.width = pct + '%';
  memLabel.textContent = memUsed + ' / ' + MEM_MAX;
  if (pct > 75) memBar.style.background = cssVar('--accent2');
  else if (pct > 40) memBar.style.background = 'oklch(70% 0.12 80)';
  else memBar.style.background = cssVar('--accent');
}

function update() {
  const GATE_Y = H / 2;
  for (const m of molecules) {
    m.x += m.vx; m.y += m.vy;
    if (m.x - R < 0)   { m.x = R;     m.vx =  Math.abs(m.vx); }
    if (m.x + R > W)   { m.x = W - R; m.vx = -Math.abs(m.vx); }
    if (m.y - R < 0)   { m.y = R;     m.vy =  Math.abs(m.vy); }
    if (m.y + R > H)   { m.y = H - R; m.vy = -Math.abs(m.vy); }

    const nearGate = m.y > GATE_Y - GATE_H/2 && m.y < GATE_Y + GATE_H/2;
    const atWall   = m.x - R < MID + 2 && m.x + R > MID - 2;

    if (atWall) {
      if (nearGate && gateOpen) {
        const fast = spd(m) > SPEED_THRESH;
        const inL  = m.x < MID;
        const movR = m.vx > 0;
        // Demon propušta samo:
        //   brza (fast) koja ide LIJEVO (← prema HOT zoni)
        //   spora (!fast) koja ide DESNO (→ prema COLD zoni)
        const goingLeft = !movR;
        const allowed = (fast && goingLeft) || (!fast && movR);
        if (allowed) {
          decisions++;
          if (decisions % 2 === 0) { memUsed = Math.min(memUsed+1, MEM_MAX); updateMem(); }
        } else {
          m.vx = -m.vx;
          m.x  = movR ? MID - R - 2 : MID + R + 2;
        }
      } else {
        m.vx = -m.vx;
        m.x  = m.vx > 0 ? MID + R + 2 : MID - R - 2;
      }
    }
  }

  gateTimer--;
  if (gateTimer <= 0) {
    gateOpen = false;
    for (const m of molecules) {
      if (Math.abs(m.y - GATE_Y) < GATE_H/2 + 10 && Math.abs(m.x - MID) < 22) {
        gateOpen = true;
        gateTimer = 14 + Math.floor(Math.random() * 10);
        break;
      }
    }
  }

  // Propeler — brzina proporcionalna brzim molekulama lijevo
  const hotRatio = molecules.filter(m => m.x < MID && spd(m) > SPEED_THRESH).length / N;
  propAngle += hotRatio * 0.18;

  if (memUsed >= MEM_MAX) { running = false; showDone(); }
}

function draw() {
  const GATE_Y = H / 2;
  ctx.clearRect(0, 0, W, H);

  const fastL = molecules.filter(m => m.x < MID && spd(m) > SPEED_THRESH).length;
  const slowR = molecules.filter(m => m.x > MID && spd(m) <= SPEED_THRESH).length;
  ctx.fillStyle = `rgba(180,80,40,${fastL/(N/2)*0.09})`;
  ctx.fillRect(0, 0, MID-2, H);
  ctx.fillStyle = `rgba(40,80,180,${slowR/(N/2)*0.09})`;
  ctx.fillRect(MID+2, 0, W-MID-2, H);

  ctx.strokeStyle = cssVar('--border');
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(MID,0); ctx.lineTo(MID, GATE_Y - GATE_H/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(MID, GATE_Y + GATE_H/2); ctx.lineTo(MID, H); ctx.stroke();

  if (gateOpen) {
    ctx.strokeStyle = cssVar('--accent');
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(MID, GATE_Y-GATE_H/2); ctx.lineTo(MID, GATE_Y+GATE_H/2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = cssVar('--accent');
    ctx.beginPath(); ctx.arc(MID, GATE_Y, 5, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle = cssVar('--text-dim');
    ctx.beginPath(); ctx.arc(MID, GATE_Y, 4, 0, Math.PI*2); ctx.fill();
  }

  // Dinamične labele — pokazuju stvarno stanje
  const fastLpct = molecules.filter(m => m.x < MID && spd(m) > SPEED_THRESH).length / (N/2);
  const slowRpct = molecules.filter(m => m.x > MID && spd(m) <= SPEED_THRESH).length / (N/2);
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  if (fastLpct > 0.55) {
    ctx.fillStyle = cssVar('--accent2');
    ctx.fillText('HOT', MID/2, 18);
  } else if (fastLpct > 0.3) {
    ctx.fillStyle = cssVar('--text-dim');
    ctx.fillText('warming...', MID/2, 18);
  } else {
    ctx.fillStyle = cssVar('--text-dim');
    ctx.fillText('mixed', MID/2, 18);
  }
  if (slowRpct > 0.55) {
    ctx.fillStyle = cssVar('--accent3');
    ctx.fillText('COLD', MID + (W-MID)/2, 18);
  } else if (slowRpct > 0.3) {
    ctx.fillStyle = cssVar('--text-dim');
    ctx.fillText('cooling...', MID + (W-MID)/2, 18);
  } else {
    ctx.fillStyle = cssVar('--text-dim');
    ctx.fillText('mixed', MID + (W-MID)/2, 18);
  }

  for (const m of molecules) {
    ctx.fillStyle = spd(m) > SPEED_THRESH ? cssVar('--accent2') : cssVar('--accent3');
    ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, Math.PI*2); ctx.fill();
  }

  // Propeler na HOT strani (lijevo, sredina visine)
  drawPropeller(MID/2, H*0.72, propAngle, fastL/(N/2));
}


function drawPropeller(cx, cy, angle, heat) {
  const blades = 3;
  const hubR   = 5;
  const bladeL = 18 + heat * 10;  // duže lopatice kad je toplije
  const alpha  = Math.min(0.15 + heat * 0.75, 0.9);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;

  for (let i = 0; i < blades; i++) {
    ctx.rotate((Math.PI * 2) / blades);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      hubR, -bladeL * 0.3,
      bladeL * 0.6, -bladeL * 0.5,
      bladeL * 0.7,  0
    );
    ctx.bezierCurveTo(
      bladeL * 0.6,  bladeL * 0.3,
      hubR,  bladeL * 0.1,
      0, 0
    );
    ctx.fillStyle = cssVar('--accent2');
    ctx.fill();
  }

  // Hub
  ctx.globalAlpha = Math.min(alpha + 0.2, 1);
  ctx.beginPath();
  ctx.arc(0, 0, hubR, 0, Math.PI*2);
  ctx.fillStyle = cssVar('--text-dim');
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

function showDone() {
  statusText.innerHTML = '<strong>Memory full.</strong>The demon made ' + decisions + ' decisions. To continue, it must erase its memory — and that erasure releases exactly as much entropy as it collected. The second law survives.';
  statusText.style.display = 'block';
  btnRestart.style.display = 'inline-block';
  if (animId) cancelAnimationFrame(animId);
}

function loop() { update(); draw(); animId = requestAnimationFrame(loop); }

function start() {
  if (animId) cancelAnimationFrame(animId);
  statusText.style.display = 'none';
  btnRestart.style.display = 'none';
  init();
  running = true;
  loop();
}

btnRestart.addEventListener('click', start);
window.addEventListener('resize', () => { resize(); });
start();
