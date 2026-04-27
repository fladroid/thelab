# SESSION_21

**Datum:** 27. april 2026  
**Projekt:** X-Ray / The Lab  
**Fokus:** Infrastruktura thelab.opik.net + Maxwell's Demon widget

---

## Odluke

**Treća knjiga potvrđena:** `thelab.opik.net` — interaktivni misaoni eksperimenti, multidisciplinarno (fizika, etika, filozofija, informacijska teorija). Samostalna knjiga, ne poglavlje druge.

**Naziv:** *The Lab* — direktna referenca na Violaris (arXiv:2312.07840), ali prošireno izvan fizike.

**Domene registrirane:** `sandbox.opik.net`, `labor.opik.net`, `thelab.opik.net`, `xray.opik.net`. Aktivna za sada: `thelab.opik.net`. `x-ray.dynu.net` ostaje.

**Arhitektura:** Zaseban GitHub repozitorij `fladroid/thelab`, zaseban web root `/var/www/vhosts/thelab/html/`, lokalni dir `/home/balsam/thelab/`.

**Struktura fajlova:** Svaka stranica ima vlastiti poddirektorij. Shared CSS i JS u `assets/`.

**Dizajn:** Jedan font (Libre Baskerville) — naslov, tijelo, subtitle — samo veličina i weight se razlikuju. Bez višekolonskog layouta.

---

## Infrastruktura

- `/var/www/vhosts/thelab/html/` kreiran, `balsam:balsam 755`
- Apache vhost konfiguriran
- Let's Encrypt TLS do 26.7.2026, auto-renew aktivan
- GitHub: `fladroid/thelab`
- Landing page live sa 6 kartica (3 aktivne, 3 coming soon)

---

## Maxwell's Demon — verzije

| Verzija | Promjena |
|---------|----------|
| v1.0 | Inicijalni widget — animacija, dvije komore, demon na vratima |
| v1.1 | Ispravljena demon gate logika — brze lijevo, spore desno |
| v1.2 | Propeler na HOT strani, verzijski counter u footeru |
| v1.3 | Veći kraci propelera, kvadratni rast brzine |
| v1.4 | Brojači čestica po komori (hot N / cold N) u realnom vremenu |

**Trenutni commit:** `053d922`

### Demon logika
- Propušta brze (crvene) → lijevo (HOT)
- Propušta spore (plave) → desno (COLD)
- Sve ostalo odbija

---

## Otvoreno

- Maxwell Mode B (korisnik igra demona) — odgođeno
- Trolley Problem — sljedeći
- Verzijski sistem: major.minor po eksperimentu

## Eksperimenti u planu

| Eksperiment | Domena | Status |
|-------------|--------|--------|
| Maxwell's Demon | Physics · Thermodynamics | ✅ v1.4 live |
| The Trolley Problem | Ethics · Decision theory | 🔲 placeholder |
| The Chinese Room | Philosophy · Mind | 🔲 placeholder |
| Ship of Theseus | Philosophy · Identity | 🔲 placeholder |
| Schrödinger's Cat | Physics · Quantum | 🔲 placeholder |
| Galileo's Free Fall | Information · Physics | 🔲 placeholder |
