'use strict';

const BOSS_TUNING = {
    stop: 500, resume: 600, intro: 1050, reaction: 1500, grace: 800, intermission: 1000,
    sealIn: 140, sealHold: 900, reward: 250, projectiles: 24, minions: 6,
    x: 520, y: 684, playerRight: 449, laneHalfDepth: 22,
    shieldHP: 6, shieldRegen: 5000, shieldWindow: 2100, shieldCycle: 6200, shieldTell: 900,
    clipboardWindow: 2000, clipboardBudget: 2, aimTolerance: 25, minionHP: 2, waveDelay: 6000, mergerStagger: 1200
};

const BOSS_DEFINITIONS = [
    { id: 'lowballer', name: 'THE LOWBALLER', hp: 14, color: 0xe0447c, attacks: [['coin'], ['coin']], phases: [.5], interval: 1800 },
    { id: 'tirekicker', name: 'THE TIRE KICKER', hp: 18, aim: true, color: 0x646887, attacks: [['tire']], phases: [], interval: 2000 },
    { id: 'greeter', name: 'THE GREETER', hp: 20, aim: true, openingVolley: true, color: 0x199a95, attacks: [['minions']], phases: [], interval: 6000 },
    { id: 'warranty', name: 'THE EXTENDED WARRANTY GUY', hp: 24, color: 0xca755a, attacks: [['paper']], phases: [], interval: 3000 },
    { id: 'invoice', name: 'MR. INVOICE PRICE', hp: 28, aim: true, openingVolley: true, color: 0x6a62d0, attacks: [['grid-v'], ['grid-h'], ['grid-z']], phases: [.66, .33], interval: 3800 },
    { id: 'merger', name: 'CORPORATE MERGER', hp: 42, aim: true, openingVolley: true, color: 0x924cac, attacks: [['coin','tire'], ['minions','paper'], ['grid-z','tire']], phases: [.66, .33], interval: 4000 }
];

const ARENA_ATTACKS = {
    coin: { width: 14, clearance: 35, speed: 155, color: 0xffdf81 },
    tire: { width: 21, clearance: 43, speed: 260, color: 0xa8b9db },
    paper: { width: 28, clearance: 85, speed: 180, color: 0xf8ecdf },
    minions: { width: 13, clearance: 32, speed: 112, color: 0x88f0cd },
    'grid-v': { time: 900, color: 0xff8fcf },
    'grid-h': { time: 900, color: 0xff8fcf },
    'grid-z': { time: 900, color: 0xff8fcf }
};

function bossStats(level) {
    const index = (level - 1) % BOSS_DEFINITIONS.length;
    const cycle = Math.floor((level - 1) / BOSS_DEFINITIONS.length);
    const definition = BOSS_DEFINITIONS[index];
    return {
        definition, hp: Math.ceil(definition.hp * (1 + .15 * cycle)),
        pace: Math.max(.55, .94 ** index),
        speed: 1.06 ** index * Math.min(1.4, 1 + .05 * cycle)
    };
}

function bossDebugLevel(search) {
    const query = new URLSearchParams(search);
    const boss = query.get('boss');
    if (!/^[1-6]$/.test(boss ?? '')) return 0;
    const level = query.get('level');
    if (level === null) return Number(boss);
    const number = Number(level);
    return /^\d{1,3}$/.test(level) && number >= 1 && (number - 1) % 6 + 1 === Number(boss) ? number : 0;
}

function loadBossSheets(scene, assets) {
    for (const { id } of BOSS_DEFINITIONS) {
        const key = 'boss-' + id;
        if (assets[key]) scene.load.image(key, assets[key]);
    }
}

function validateBossSheet(scene, key) {
    if (!scene.textures.exists(key)) return false;
    const sheet = scene.textures.get(key);
    const image = sheet.getSourceImage();
    if (image.width !== 1024 || image.height !== 256) return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, 1024, 256).data;
    const bounds = Array.from({length: 4}, () => ({ left: 256, right: 0, bottom: 0, visible: 0, clear: 0 }));
    for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 1024; x++) {
            const frame = bounds[x >> 8];
            const alpha = pixels[(y * 1024 + x) * 4 + 3];
            if (!alpha) frame.clear++;
            if (alpha < 64) continue;
            frame.left = Math.min(frame.left, x % 256);
            frame.right = Math.max(frame.right, x % 256);
            frame.bottom = y;
            frame.visible++;
        }
    }
    if (bounds.some(frame => frame.clear < 1000 || frame.visible < 250
        || Math.abs(frame.bottom - bounds[0].bottom) > 12
        || Math.abs((frame.left + frame.right) - (bounds[0].left + bounds[0].right)) > 64)) return false;
    for (let frame = 0; frame < 4; frame++) sheet.add(frame, 0, frame * 256, 0, 256, 256);
    return true;
}

class BossArena {
    constructor(scene, level) {
        this.scene = scene;
        this.level = level;
        this.stats = bossStats(level);
        this.spec = this.stats.definition;
        this.hp = this.stats.hp;
        this.mode = 'intro';
        this.age = 0;
        this.phase = 0;
        this.hits = 0;
        this.turn = 0;
        this.phaseTurn = 0;
        this.shield = BOSS_TUNING.shieldHP;
        this.shieldHitAt = -Infinity;
        this.clipboardUntil = 0;
        this.clipboardCharge = 0;
        this.volleyHit = false;
        this.phaseVolleyDone = false;
        this.attackAt = BOSS_TUNING.intro + BOSS_TUNING.grace;
        this.intermissionUntil = 0;
        this.plan = null;
        this.followUp = null;
        this.threats = [];
        this.view = scene.add.graphics().setDepth(3.4);
        this.stamp = scene.add.text(300, 385, 'APPROVED', {
            fontFamily: 'system-ui, sans-serif', fontSize: '57px', fontStyle: 'bold',
            color: '#fff8f7', backgroundColor: '#981633', stroke: '#1b101c', strokeThickness: 4,
            padding: { x: 20, y: 13 }
        }).setOrigin(.5).setDepth(12).setVisible(false);
        const key = 'boss-' + this.spec.id;
        this.sprite = scene.bossSheets.has(key) ? scene.add.image(BOSS_TUNING.x, 710, key, 0)
            .setOrigin(.5, .94).setScale(.68).setDepth(3.5) : null;
        this.paint();
    }

    get active() { return this.mode === 'fight' && this.age >= this.intermissionUntil; }
    get lowballer() { return this.spec.id === 'lowballer'; }
    get opportunity() { return this.active && (!this.spec.openingVolley || this.phaseVolleyDone); }
    get clipboardOpen() { return this.clipboardCharge > 0 && this.age < this.clipboardUntil; }
    get aimLane() {
        if (this.spec.id === 'greeter' && this.waveLane != null) return (this.waveLane + 1) % ROAD_LANES.length;
        return this.turn % ROAD_LANES.length;
    }
    get aimY() { return ROAD_LANES[this.aimLane]; }
    get warranty() { return this.spec.id === 'warranty'; }
    get shieldOpening() {
        const clock = (this.age - BOSS_TUNING.intro) % BOSS_TUNING.shieldCycle;
        return clock >= BOSS_TUNING.shieldCycle - BOSS_TUNING.shieldWindow;
    }
    get intactFormation() { return this.threats.some(t => t.kind === 'minions' && !t.scatter); }

    step(ms) {
        this.age += ms;
        if (this.mode === 'defeat') {
            if (!this.scene.reducedMotion.matches) this.stamp.setScale(.9 + .1 * Math.min(1, (this.age - this.defeatedAt) / BOSS_TUNING.sealIn));
            return this.age - this.defeatedAt >= BOSS_TUNING.sealIn + BOSS_TUNING.sealHold;
        }
        if (this.mode === 'intro' && this.age >= BOSS_TUNING.intro) this.mode = 'fight';
        if (!this.active) return false;
        if (this.warranty && this.age - this.shieldHitAt >= BOSS_TUNING.shieldRegen) this.shield = BOSS_TUNING.shieldHP;
        if (this.plan && this.age >= this.plan.at) {
            const plan = this.plan;
            this.plan = null;
            this.launch(plan);
        }
        if (this.followUp && this.age >= this.followUp.at) {
            const plan = this.followUp;
            this.followUp = null;
            this.launch(plan);
        }
        this.moveThreats(ms);
        if (!this.plan && !this.followUp && !this.threats.length && this.age >= this.attackAt) this.warn();
        return false;
    }

    warn() {
        const attacks = this.spec.attacks[this.phase];
        const kind = attacks[this.phaseTurn++ % attacks.length];
        const lane = this.scene.roadLane;
        this.turn++;
        this.volleyHit = false;
        if (kind === 'minions') this.waveLane = lane;
        const repeats = kind === 'coin' && this.spec.id === 'lowballer' && this.phase ? 2
            : kind === 'tire' && this.spec.id === 'tirekicker' && this.turn % 5 === 0 ? 2 : 1;
        this.plan = { kind, lane, at: this.age + BOSS_TUNING.reaction, repeats };
        // Keep the entire combined pattern within the same road-depth band.
        if (this.spec.id === 'merger' && this.phase > 0 && kind === attacks[0]) {
            this.followUp = { kind: attacks[1], lane, repeats: 1,
                at: this.plan.at + BOSS_TUNING.mergerStagger };
            this.phaseTurn++;
        }
    }

    launch({ kind, lane, repeats }) {
        const attack = ARENA_ATTACKS[kind];
        if (attack.time) {
            const positions = kind === 'grid-h' ? [[45, 510]]
                : kind === 'grid-v' ? [[134, 56], [364, 56]] : [[86, 64], [240, 64], [395, 64]];
            for (const [x, length] of positions) this.threats.push({ kind, lane, x, length, end: this.age + attack.time });
        } else {
            const count = kind === 'minions' ? Math.min(5, BOSS_TUNING.minions) : Math.min(repeats, BOSS_TUNING.projectiles);
            const tireRamp = this.spec.id === 'tirekicker' ? 1 + Math.min(.60, .12 * this.hits) : 1;
            const speed = attack.speed * this.stats.speed * tireRamp;
            for (let i = 0; i < count; i++) {
                this.threats.push({ kind, lane, x: 548, speed, at: this.age + i * (kind === 'minions' ? 240 : kind === 'tire' ? 500 : 300),
                    born: this.age, hp: BOSS_TUNING.minionHP, middle: i === 2 });
            }
        }
        const intervalRamp = this.spec.id === 'tirekicker' ? 1 - Math.min(.30, .06 * this.hits) : 1;
        this.attackAt = this.age + Math.max(.55, this.stats.pace * intervalRamp) * this.spec.interval;
    }

    moveThreats(ms) {
        const s = this.scene;
        const altitude = s.roadDepth - s.player.y;
        const hadThreats = this.threats.length > 0;
        this.threats = this.threats.filter(t => {
            const attack = ARENA_ATTACKS[t.kind];
            if (t.at > this.age) return true;
            if (!attack.time) t.x += (t.scatter ? 265 : -t.speed) * ms / 1000;
            if (t.x < -40 || t.x > 625 || this.age >= t.end) return false;
            const inLane = Math.abs(s.roadDepth - ROAD_LANES[t.lane]) < BOSS_TUNING.laneHalfDepth;
            const overlap = attack.time ? s.player.x + PLAYER_HALF_WIDTH > t.x && s.player.x - PLAYER_HALF_WIDTH < t.x + t.length
                : Math.abs(s.player.x - t.x) < PLAYER_HALF_WIDTH + attack.width;
            if (!t.scatter && inLane && overlap && (attack.time || altitude < attack.clearance)) {
                this.volleyHit = true;
                s.hitObstacle();
            }
            return !s.crashUntil;
        });
        if (hadThreats && !this.threats.length && !this.followUp) this.completeVolley();
    }

    completeVolley() {
        this.phaseVolleyDone = true;
        if (this.spec.id === 'greeter') this.attackAt = this.age + BOSS_TUNING.waveDelay;
        if (this.lowballer && !this.volleyHit) {
            this.clipboardUntil = this.age + BOSS_TUNING.clipboardWindow;
            this.clipboardCharge = BOSS_TUNING.clipboardBudget;
            this.clipboardDamage = this.turn % 4 === 0 ? 2 : 1;
        }
    }

    hit(shot) {
        if (this.mode === 'defeat') return false;
        const target = this.threats.find(t => t.kind === 'minions' && !t.scatter && t.at <= this.age
            && Math.abs(shot.x - t.x) < 22 && Math.abs(shot.y - ROAD_LANES[t.lane]) < 26);
        if (target) {
            if (--target.hp <= 0) {
                this.threats = this.threats.filter(t => t !== target);
                for (const minion of this.threats) {
                    if (minion.kind !== 'minions') continue;
                    if (target.middle) {
                        minion.scatter = true;
                        minion.at = this.age;
                    } else minion.speed = Math.max(minion.speed, ARENA_ATTACKS.minions.speed * this.stats.speed * 1.15);
                }
                if (this.spec.id === 'greeter' && (!this.threats.length || target.middle)) {
                    this.completeVolley();
                }
            }
            return true;
        }
        const baseY = this.spec.aim ? this.aimY : BOSS_TUNING.y;
        const span = this.spec.aim ? BOSS_TUNING.aimTolerance : 68;
        if (Math.abs(shot.x - BOSS_TUNING.x) >= 44 || Math.abs(shot.y - baseY) >= span) return false;
        if (!this.opportunity || this.spec.id === 'greeter' && this.intactFormation) return true;
        if (this.warranty && this.shield > 0 && !this.shieldOpening) {
            this.shield--;
            this.shieldHitAt = this.age;
            return true;
        }
        let damage = 1;
        if (this.lowballer) {
            if (!this.clipboardOpen) return true;
            damage = Math.min(this.clipboardCharge, this.clipboardDamage);
            this.clipboardCharge -= damage;
        }
        this.hits++;
        this.hp = Math.max(0, this.hp - damage);
        this.poseUntil = this.age + 135;
        if (!this.hp) {
            this.mode = 'defeat';
            this.defeatedAt = this.age;
            this.clearThreats();
            this.stamp.setVisible(true);
            this.scene.addBonus(BOSS_TUNING.reward);
            return true;
        }
        const phase = this.spec.phases.filter(limit => this.hp <= this.stats.hp * limit).length;
        if (phase > this.phase) {
            this.phase = phase;
            this.phaseTurn = 0;
            this.phaseVolleyDone = false;
            this.clipboardCharge = 0;
            this.clearThreats();
            this.intermissionUntil = this.age + BOSS_TUNING.intermission;
            this.attackAt = this.intermissionUntil + 500;
        }
        return true;
    }

    clearThreats() {
        this.threats = [];
        this.plan = null;
        this.followUp = null;
    }

    paint() {
        const art = this.view.clear();
        const { x, y } = BOSS_TUNING;
        const guarded = this.lowballer && !this.clipboardOpen || !this.opportunity || this.spec.id === 'greeter' && this.intactFormation || this.warranty && this.shield > 0 && !this.shieldOpening;
        const pose = this.mode === 'defeat' ? 3 : this.age < this.poseUntil ? 2 : this.plan ? 1 : 0;
        if (this.sprite) this.sprite.setFrame(pose);
        else {
            art.fillStyle(0x101325).fillRect(x - 39, y - 85, 78, 120);
            art.fillStyle(this.spec.color).fillRect(x - 33, y - 36, 66, 69);
            art.fillStyle(0xffd9b9).fillRect(x - 21, y - 78, 42, 38);
            art.fillStyle(0x18152b).fillRect(x - 16, y - 64, 8, 8).fillRect(x + 7, y - 64, 8, 8);
            art.fillStyle(0xffe8f3).fillTriangle(x - 13, y - 36, x + 13, y - 36, x, y - 3);
            if (this.spec.id === 'tirekicker') {
                for (const cy of [y - 62, y - 20, y + 16]) {
                    art.lineStyle(12, 0x252739).strokeEllipse(x, cy, 70, 30);
                    art.lineStyle(3, 0xa7b3d2).strokeEllipse(x, cy, 59, 20);
                }
                art.fillStyle(0x743e42).fillRect(x - 53, y + 21, 41, 21);
            } else if (this.spec.id === 'lowballer' || this.warranty) {
                art.fillStyle(this.age < this.clipboardUntil ? 0x7cf2dd : 0xffdcae).fillRect(x - 52, y - 32, 34, 47);
                for (const line of [0, 1, 2]) art.fillStyle(0x75495c).fillRect(x - 47, y - 23 + line * 10, 23, 3);
            } else if (this.spec.id === 'invoice') {
                art.fillStyle(0x191b40).fillRect(x - 22, y - 79, 44, 42);
                for (const row of [0, 1, 2]) for (const col of [0, 1, 2])
                    art.fillStyle(0x82f5ea).fillRect(x - 16 + col * 12, y - 74 + row * 12, 6, 6);
            } else if (this.spec.id === 'merger') {
                for (const side of [-1, 1]) {
                    art.fillStyle(0x553470).fillRect(x + side * 29 - 18, y - 54, 36, 85);
                    art.fillStyle(0xf0bfc9).fillRect(x + side * 29 - 13, y - 74, 26, 25);
                }
            } else art.fillStyle(0xfff2df).fillRect(x + 6, y - 19, 19, 10);
        }
        if (this.spec.aim && this.mode === 'fight') {
            const target = this.aimY;
            art.lineStyle(3, guarded ? 0xb1c3dd : 0x8ffbe2).strokeRect(x - 47, target - 15, 20, 30);
            art.lineBetween(x - 55, target, x - 21, target);
        }
        if (guarded && this.mode !== 'defeat') art.lineStyle(4, 0x83eef6).strokeRoundedRect(x - 56, y - 95, 94, 135, 9);
        else if (this.warranty && this.shieldOpening) art.lineStyle(3, 0x83eef6).lineBetween(x - 78, y, x - 54, y);
        const warning = this.plan || this.followUp;
        if (warning) {
            const lane = ROAD_LANES[warning.lane];
            art.lineStyle(3, 0xffdf81).strokeRoundedRect(48, lane - 22, 490, 44, 10);
            for (const mark of [94, 209, 324, 439]) {
                if (warning.kind === 'coin') art.strokeEllipse(mark, lane, 29, 19);
                else art.strokeTriangle(mark - 10, lane, mark + 9, lane - 8, mark + 9, lane + 8);
            }
        }
        for (const t of this.threats) {
            if (t.at > this.age) continue;
            const attack = ARENA_ATTACKS[t.kind];
            const lane = ROAD_LANES[t.lane];
            art.fillStyle(attack.color, t.scatter ? .4 : 1);
            if (attack.time) {
                art.fillStyle(attack.color, .35).fillRect(t.x, lane - 22, t.length, 44);
                art.lineStyle(3, attack.color).strokeRect(t.x, lane - 22, t.length, 44);
            } else if (t.kind === 'paper') {
                art.fillRect(t.x - 28, lane - 58, 56, 69);
                for (const row of [0, 1, 2]) art.fillStyle(0x86485e).fillRect(t.x - 20, lane - 47 + 15 * row, 39, 4);
            } else if (t.kind === 'minions') {
                art.fillRect(t.x - 12, lane - 20, 24, 26);
                art.fillStyle(0x171929).fillRect(t.x - 7, lane - 13, 4, 4).fillRect(t.x + 3, lane - 13, 4, 4);
                if (t.middle) art.lineStyle(3, 0xffe278).strokeRect(t.x - 15, lane - 23, 30, 32);
            } else {
                const lift = t.kind === 'coin' ? Math.max(0, Math.sin(Math.min(1, (this.age - t.at) / 1600) * Math.PI) * 32) : 0;
                art.fillCircle(t.x, lane - 8 - lift, attack.width);
                art.lineStyle(4, 0x343047).strokeCircle(t.x, lane - 8 - lift, attack.width - 4);
            }
        }
        this.updateHud(guarded);
    }

    updateHud(guarded) {
        const heading = document.getElementById('boss-name');
        const note = document.getElementById('boss-note');
        const meter = document.getElementById('boss-hp');
        const jump = document.getElementById('arena-jump');
        const message = this.mode === 'intro' ? 'Get ready' : this.mode === 'defeat' ? 'Approved'
            : !this.active ? 'Phase ' + (this.phase + 1) + ' incoming'
                : this.lowballer ? this.clipboardOpen ? 'Clipboard open · Shoot now'
                    : this.plan || this.threats.length ? 'Dodge the marked coin volley' : 'Clipboard closed · Watch the lane'
                : this.warranty && this.shieldOpening ? 'Shield open'
                    : this.warranty && guarded ? (this.age - BOSS_TUNING.intro) % BOSS_TUNING.shieldCycle
                         >= BOSS_TUNING.shieldCycle - BOSS_TUNING.shieldWindow - BOSS_TUNING.shieldTell ? 'Shield opening soon' : 'Shield ' + this.shield
                        : this.spec.id === 'greeter' && this.intactFormation ? 'Shoot the marked middle minion'
                        : this.plan || this.followUp ? 'Clear the marked lane'
                            : guarded ? 'Dodge the opening volley'
                                : this.spec.aim ? 'Line up with the target • ' + ['Far', 'Middle', 'Near'][this.aimLane]
                                    : 'Jump and fire';
        if (heading.textContent !== this.spec.name) heading.textContent = this.spec.name;
        if (note.textContent !== message) note.textContent = message;
        if (meter.max !== this.stats.hp) meter.max = this.stats.hp;
        if (meter.value !== this.hp) meter.value = this.hp;
        document.getElementById('boss-hud').hidden = false;
        jump.hidden = this.mode !== 'fight' || this.scene.state !== STATES.PLAYING;
    }

    destroy() {
        this.clearThreats();
        this.view.destroy();
        this.sprite?.destroy();
        this.stamp.destroy();
        document.getElementById('boss-hud').hidden = true;
        document.getElementById('arena-jump').hidden = true;
    }
}
