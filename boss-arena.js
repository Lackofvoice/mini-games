'use strict';

const BOSS_TUNING = {
    stop: 500, resume: 600, intro: 1050, reaction: 1500, grace: 800, intermission: 1000,
    sealIn: 140, sealHold: 900, reward: 250, projectiles: 24, minions: 6,
    x: 510, y: 747, playerRight: 406, ceiling: 165, laneHalfDepth: 22,
    shieldHP: 6, shieldRegen: 5000, shieldWindow: 2100, shieldCycle: 6200, shieldTell: 900,
    staggerMs: 1350, staggerBonus: 1, blockFlashMs: 125, minionHP: 2, waveDelay: 4500, mergerStagger: 1200
};

const BOSS_DEFINITIONS = [
    { id: 'lowballer', name: 'THE LOWBALLER', hp: 43, scale: 0.85, pace: 1, color: 0xe0447c, attacks: [['coin'], ['coin']], phases: [.5], interval: 1800 },
    { id: 'tirekicker', name: 'THE TIRE KICKER', hp: 58, scale: 0.83, pace: 2, color: 0x646887, attacks: [['tire']], phases: [], interval: 2000 },
    { id: 'greeter', name: 'THE GREETER', hp: 44, scale: 0.85, pace: 3, color: 0x199a95, attacks: [['minions']], phases: [], interval: 6000 },
    { id: 'warranty', name: 'THE EXTENDED WARRANTY GUY', hp: 50, scale: 0.84, pace: 4, color: 0xca755a, attacks: [['paper']], phases: [], interval: 3000 },
    { id: 'invoice', name: 'MR. INVOICE PRICE', hp: 54, scale: 0.83, pace: 5, color: 0x6a62d0, attacks: [['grid-v'], ['grid-h'], ['grid-z']], phases: [.66, .33], interval: 3800 },
    { id: 'merger', name: 'CORPORATE MERGER', hp: 59, scale: 0.87, pace: 6, color: 0x924cac, attacks: [['coin','tire'], ['minions','paper'], ['grid-z','tire']], phases: [.66, .33], interval: 4000 }
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

// Width floors apply to the trimmed art only. The arena collision dimensions stay separate.
const BOSS_PROP_VISUAL_WIDTHS = [62, 64, 72, 58, 48, 48];

function bossPropScale(key, frame, texture, attack) {
    const width = attack.time ? 30 : attack.width * 2 + 2;
    const original = Math.min(width / texture.width, (attack.clearance || 40) / texture.height);
    const target = key === 'boss-props' ? BOSS_PROP_VISUAL_WIDTHS[frame] : 0;
    return Math.max(original * 1.5, target / texture.width);
}

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
    for (const key of ['boss-props', ...BOSS_DEFINITIONS.flatMap(({id}) => ['boss-' + id, 'boss-' + id + '-walk'])]) {
        if (assets[key]) scene.load.image(key, assets[key]);
    }
}

function validateBossProps(scene) {
    if (!scene.textures.exists('boss-props')) return false;
    const texture = scene.textures.get('boss-props');
    const image = texture.getSourceImage();
    if (image.width !== 768 || image.height !== 128) return false;
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 128;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, 768, 128).data;
    const bounds = [];
    for (let cell = 0; cell < 6; cell++) {
        let left = 128, top = 128, right = -1, bottom = -1, transparent = 0;
        for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
            const alpha = data[(y * 768 + cell * 128 + x) * 4 + 3];
            if (alpha === 0) transparent++;
            if (alpha < 32) continue;
            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
        }
        if (right < left || transparent < 200) return false;
        bounds.push([cell * 128 + left, top, right - left + 1, bottom - top + 1]);
    }
    bounds.forEach((frame, index) => texture.add(index, 0, ...frame));
    return true;
}

function validateBossSheet(scene, key, count = 4) {
    if (!scene.textures.exists(key)) return false;
    const sheet = scene.textures.get(key);
    const image = sheet.getSourceImage();
    const width = count * 256;
    if (image.width !== width || image.height !== 256) return false;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = 256;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, width, 256).data;
    const bounds = Array.from({length: count}, () => ({ left: 256, right: 0, top: 256, bottom: 0, visible: 0, clear: 0 }));
    for (let y = 0; y < 256; y++) {
        for (let x = 0; x < width; x++) {
            const frame = bounds[x >> 8];
            const alpha = pixels[(y * width + x) * 4 + 3];
            if (!alpha) frame.clear++;
            if (alpha < 64) continue;
            frame.left = Math.min(frame.left, x % 256);
            frame.right = Math.max(frame.right, x % 256);
            frame.top = Math.min(frame.top, y);
            frame.bottom = y;
            frame.visible++;
        }
    }
    if (bounds.some(frame => frame.clear < 1000 || frame.visible < 250
        || Math.abs(frame.bottom - bounds[0].bottom) > 12
        || Math.abs((frame.left + frame.right) - (bounds[0].left + bounds[0].right)) > 64)) return false;
    for (let frame = 0; frame < count; frame++) sheet.add(frame, 0, frame * 256, 0, 256, 256);
    sheet.bossBounds = bounds;
    return true;
}

const BOSS_TAUNT_MS = 750;
const BOSS_TAUNT_COOLDOWN = 2000;

// Transparent PNG at assets/sprites/boss-<id>-taunt.png: six 256px square
// frames in one 1536x256 row. Frames 0–2 jeer, then frames 3–5 point.
// Match the normal feet anchor and scale. Each frame displays for 125ms.
function loadBossTaunt(scene, id) {
    const key = 'boss-' + id + '-taunt';
    scene.bossTauntLoads ??= new Map();
    if (scene.bossTauntLoads.has(key)) return key;
    scene.bossTauntLoads.set(key, false);
    const image = new Image();
    const cleanup = () => {
        image.onload = image.onerror = null;
        scene.events.off('shutdown', cleanup);
    };
    scene.events.once('shutdown', cleanup);
    image.onerror = cleanup;
    image.onload = () => {
        cleanup();
        if (image.naturalWidth !== 1536 || image.naturalHeight !== 256) return;
        const textures = scene.textures;
        if (!textures.exists(key)) textures.addImage(key, image);
        const texture = textures.get(key);
        let valid = false;
        try {
            valid = !!texture.bossBounds || validateBossSheet(scene, key, 6);
        } catch {
            // An optional sheet that cannot be read still uses the existing boss art.
        }
        scene.bossTauntLoads.set(key, valid);
        if (!valid) textures.remove(key);
    };
    image.src = 'assets/sprites/' + key + '.png';
    return key;
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
        this.x = BOSS_TUNING.x;
        this.feet = BOSS_TUNING.y;
        this.walkPhase = 0;
        this.staggerUntil = 0;
        this.poseUntil = 0;
        this.blockFlashUntil = 0;
        this.launchUntil = 0;
        this.tutorialKey = 'rv-dash-boss-seen:' + this.spec.id;
        this.tutorial = !scene.seenBosses.has(this.spec.id);
        try { if (localStorage.getItem(this.tutorialKey)) this.tutorial = false; } catch {}
        this.volleyHit = false;
        this.attackAt = BOSS_TUNING.intro + BOSS_TUNING.grace;
        this.intermissionUntil = 0;
        this.plan = null;
        this.followUp = null;
        this.threats = [];
        this.view = scene.add.graphics().setDepth(3.4);
        this.stamp = arcadeText(scene, 300, 385, 'APPROVED', {
            fontSize: '57px',
            color: '#fff8f7', backgroundColor: '#981633', stroke: '#1b101c', strokeThickness: 4,
            padding: { x: 20, y: 13 }
        }, 'display').setOrigin(.5).setDepth(12).setVisible(false);
        const base = 'boss-' + this.spec.id;
        this.walkSheet = scene.bossSheets.has(base + '-walk');
        const key = this.walkSheet ? base + '-walk' : base;
        this.normalSpriteKey = key;
        this.tauntKey = loadBossTaunt(scene, this.spec.id);
        this.sprite = scene.bossSheets.has(key) ? scene.add.image(this.x, this.feet, key, 0)
            .setOrigin(.5, .94).setScale(this.spec.scale).setDepth(3.5) : null;
        this.bounds = this.sprite?.texture.bossBounds;
        const right = this.bounds ? Math.max(...this.bounds.map(frame => frame.right)) : 210;
        this.rightLimit = Math.floor(590 - (right - 128) * this.spec.scale);
        this.x = Math.min(this.x, this.rightLimit);
        this.paint();
    }

    get active() { return this.mode === 'fight' && this.age >= this.intermissionUntil; }
    get lowballer() { return this.spec.id === 'lowballer'; }
    get staggered() { return this.age < this.staggerUntil; }
    get block() {
        if (this.warranty && this.shield > 0 && !this.shieldOpening) return 'Paper shield';
        if (this.staggered) return '';
        if (this.lowballer && this.plan && this.plan.at - this.age > 420) return 'Clipboard block';
        if (this.spec.id === 'greeter' && this.intactFormation) return 'Formation shield';
        return '';
    }

    get pose() {
        if (this.mode === 'defeat') return 3;
        if (this.age < this.poseUntil || this.staggered) return 2;
        if (this.plan || this.followUp || this.age < this.launchUntil) return 1;
        return Math.abs(this.velocity) > .018 && this.walkSheet ? 4 + Math.floor(this.age / 145) % 2 : 0;
    }

    moveBoss(ms) {
        const tempo = 1150 - this.spec.pace * 65;
        const phase = this.age / tempo;
        const pace = Math.sin(phase) * 25 + Math.sin(phase * .47) * 11;
        const remaining = (this.plan || this.followUp)?.at - this.age;
        const windup = remaining >= 0 && remaining <= 380 ? 1 - remaining / 380 : 0;
        const recoil = Math.max(0, this.poseUntil - this.age) / 160;
        const recovery = Math.max(0, this.launchUntil - this.age) / 180;
        const stagger = this.staggered ? 12 : 0;
        const target = Math.max(463, Math.min(this.rightLimit ?? 506, BOSS_TUNING.x - 14 + pace - 19 * Math.max(windup, recovery) + 14 * recoil + stagger));
        const before = this.x;
        this.x += (target - this.x) * Math.min(1, ms / (this.staggered ? 165 : 92));
        this.velocity = (this.x - before) / ms;
        const reduced = this.scene.reducedMotion.matches;
        this.feet = BOSS_TUNING.y - (reduced ? 0 : Math.abs(this.velocity) * 11);
        if (this.walking) this.walkPhase = ((this.walkPhase || 0) + Math.abs(this.x - before) / 16) % 1;
        else this.walkPhase = 0;
    }

    get walking() {
        const cycle = (this.age - BOSS_TUNING.intro) % BOSS_TUNING.shieldCycle;
        const warnShield = this.warranty && this.shield > 0 && !this.shieldOpening
            && cycle >= BOSS_TUNING.shieldCycle - BOSS_TUNING.shieldWindow - BOSS_TUNING.shieldTell;
        return this.active && !this.scene.reducedMotion.matches && Math.abs(this.velocity) > .003
            && !this.plan && !this.followUp && !this.staggered && this.age >= this.poseUntil
            && this.age >= this.launchUntil && !(this.age < this.blockFlashUntil) && !warnShield;
    }

    get stepLift() {
        if (!this.walking) return 0;
        const effort = Math.min(1, (Math.abs(this.velocity) - .003) / .017);
        return Math.sin(Math.PI * this.walkPhase) ** 2 * 4.2 * effort;
    }

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
        if (this.mode === 'intro' && this.age >= BOSS_TUNING.intro) {
            this.mode = 'fight';
            if (this.scene.runMode !== 'demo') {
                this.scene.seenBosses.add(this.spec.id);
                if (!BOSS_DEBUG_LEVEL && this.tutorial) {
                    try { localStorage.setItem(this.tutorialKey, '1'); } catch {}
                }
            }
        }
        if (this.mode === 'fight') this.moveBoss(ms);
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
        this.launchUntil = this.age + 180;
        if (attack.time) {
            const positions = kind === 'grid-h' ? [[45, 510]]
                : kind === 'grid-v' ? [[134, 56], [364, 56]] : [[86, 64], [240, 64], [395, 64]];
            for (const [x, length] of positions) this.threats.push({ kind, lane, x, length, end: this.age + attack.time });
        } else {
            const count = kind === 'minions' ? Math.min(5, BOSS_TUNING.minions) : Math.min(repeats, BOSS_TUNING.projectiles);
            const tireRamp = this.spec.id === 'tirekicker' ? 1 + Math.min(.60, .12 * this.hits) : 1;
            const greeterWave = this.spec.id === 'greeter' && kind === 'minions';
            const speed = attack.speed * this.stats.speed * tireRamp * (greeterWave ? 1.48 : 1);
            for (let i = 0; i < count; i++) {
                this.threats.push({ kind, lane, x: this.x - 26, originY: this.feet - 93, speed, coinArt: this.lowballer && this.turn % 3 === 0, at: this.age + i * (kind === 'minions' ? 240 : kind === 'tire' ? 500 : 300),
                    born: this.age, hp: greeterWave ? 4 : BOSS_TUNING.minionHP, middle: i === 2 });
            }
        }
        const intervalRamp = this.spec.id === 'tirekicker' ? 1 - Math.min(.30, .06 * this.hits) : 1;
        this.attackAt = this.age + Math.max(.55, this.stats.pace * intervalRamp) * this.spec.interval;
    }

    moveThreats(ms) {
        const s = this.scene;

        const hadThreats = this.threats.length > 0;
        this.threats = this.threats.filter(t => {
            const attack = ARENA_ATTACKS[t.kind];
            if (t.at > this.age) return true;
            if (!attack.time && !t.released) {
                t.x = this.x - 26;
                t.originY = this.feet - 93;
                t.released = true;
            }
            if (!attack.time) t.x += (t.scatter ? 265 : -t.speed) * ms / 1000;
            if (t.x < -40 || t.x > 625 || this.age >= t.end) {
                t.sprite?.destroy();
                return false;
            }
            const inLane = Math.abs(s.roadDepth - ROAD_LANES[t.lane]) < BOSS_TUNING.laneHalfDepth;
            const overlap = attack.time ? s.player.x + PLAYER_HALF_WIDTH > t.x && s.player.x - PLAYER_HALF_WIDTH < t.x + t.length
                : Math.abs(s.player.x - t.x) < PLAYER_HALF_WIDTH + attack.width;
            if (!t.scatter && (attack.time || this.age - t.at >= 190) && inLane && overlap && (s.roadDepth - s.player.y < (attack.clearance ?? 85))) {
                this.volleyHit = true;
                const healthBefore = s.hp;
                s.hitObstacle();
                // The damage handler owns immunity and may destroy this arena on a fatal hit.
                if (s.arena === this && s.hp < healthBefore) this.beginTaunt();
            }
            return true;
        });
        if (!s.crashUntil && hadThreats && !this.threats.length && !this.followUp) this.completeVolley();
    }

    completeVolley() {
        if (this.spec.id === 'greeter') this.attackAt = this.age + BOSS_TUNING.waveDelay;
        if (!this.volleyHit) this.staggerUntil = this.age + BOSS_TUNING.staggerMs;
    }

    hit(shot) {
        if (this.mode !== 'fight') return false;
        const target = this.threats.find(t => t.kind === 'minions' && !t.scatter && t.at <= this.age
            && Math.abs(shot.x - t.x) < 22 && Math.abs(shot.y - ROAD_LANES[t.lane]) < 26);
        if (target) {
            if (--target.hp <= 0) {
                target.sprite?.destroy();
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
        const {left, top, right, bottom} = this.bounds?.[this.pose] ?? {left: 52, top: 28, right: 204, bottom: 240};
        const x = (shot.x - this.x) / this.spec.scale + 128;
        const y = (shot.y - this.feet) / this.spec.scale + 240.64;
        if (x < left - 9 || x > right + 9 || y < top - 7 || y > bottom + 10) return false;
        const block = this.block;
        if (block) {
            this.blockFlashUntil = this.age + BOSS_TUNING.blockFlashMs;
            if (this.warranty) {
                this.shield--;
                this.shieldHitAt = this.age;
            }
            return true;
        }
        const damage = 1 + (this.staggered ? BOSS_TUNING.staggerBonus : 0);
        this.hits++;
        this.hp = Math.max(0, this.hp - damage);
        this.poseUntil = this.age + 160;
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
                this.clearThreats();
            this.intermissionUntil = this.age + BOSS_TUNING.intermission;
            this.attackAt = this.intermissionUntil + 500;
        }
        return true;
    }

    clearThreats() {
        for (const threat of this.threats) threat.sprite?.destroy();
        this.threats = [];
        this.plan = null;
        this.followUp = null;
    }

    beginTaunt() {
        if (!this.active || this.scene.reducedMotion.matches || this.age < (this.nextTauntAt ?? 0)) return;
        this.tauntStartedAt = this.age;
        this.nextTauntAt = this.age + BOSS_TAUNT_COOLDOWN;
        this.tauntSheet = this.sprite && this.scene.bossTauntLoads?.get(this.tauntKey) ? this.tauntKey : null;
    }

    paint() {
        const art = this.view.clear();
        const x = this.x;
        const y = this.feet - 55;
        const block = this.block;
        const recoil = this.age < this.poseUntil || this.staggered;
        const winding = this.plan || this.followUp || this.age < this.launchUntil;
        if (this.scene.reducedMotion?.matches || this.mode !== 'fight') this.tauntStartedAt = undefined;
        const tauntAge = this.age - this.tauntStartedAt;
        const taunting = this.active && tauntAge >= 0 && tauntAge < BOSS_TAUNT_MS && !winding && !recoil;
        if (this.sprite) {
            const angle = this.scene.reducedMotion.matches || this.mode === 'defeat' ? 0
                : recoil ? 5 : winding ? -4 : this.walking ? Math.max(-3.5, Math.min(3.5, this.velocity * 81)) : 0;
            const key = taunting && this.tauntSheet ? this.tauntSheet : this.normalSpriteKey;
            if (key && this.sprite.texture?.key !== key) this.sprite.setTexture(key);
            this.sprite.setFrame(taunting && this.tauntSheet ? Math.floor(tauntAge / 125) : this.pose)
                .setPosition(x, this.feet - this.stepLift).setAngle(angle);
            const fallback = taunting && !this.tauntSheet;
            if (fallback || this.tauntPopping) {
                this.sprite.setScale(this.spec.scale * (fallback ? 1 + .09 * Math.sin(Math.PI * tauntAge / BOSS_TAUNT_MS) : 1));
                if (fallback) this.sprite.setTint(0xffd3b2);
                else this.sprite.clearTint();
                this.tauntPopping = fallback;
            }
        }
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
                art.fillStyle(this.staggered ? 0x7cf2dd : 0xffdcae).fillRect(x - 52, y - 32, 34, 47);
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
        if (taunting && !this.tauntSheet) {
            art.lineStyle(3, 0xffd385, .8)
                .strokeEllipse(x + 24, y - 102, 11, 6)
                .strokeEllipse(x + 39, y - 114, 8, 5);
        }
        if (block && this.mode === 'fight') {
            const bright = this.age < this.blockFlashUntil;
            art.lineStyle(bright ? 7 : 4, bright ? 0xfff4c8 : 0x83eef6)
                .strokeRoundedRect(x - 60, this.feet - 171, 105, 166, 11);
            art.fillStyle(0x80deee, .85).fillRect(x - 64, y - 35, 12, 64);
        }
        for (const t of this.threats) {
            if (t.at > this.age) continue;
            const attack = ARENA_ATTACKS[t.kind];
            const lane = ROAD_LANES[t.lane];
            art.fillStyle(attack.color, t.scatter ? .4 : 1);
            const prop = t.coinArt && this.scene.textures.exists('coin') ? ['coin', this.scene.firstFrame('coin')] : this.propFor(t.kind);
            if (prop && (!attack.time || t === this.threats.find(item => item.kind === t.kind))) {
                if (!t.sprite) {
                    const [key, frame] = prop;
                    const texture = this.scene.textures.getFrame(key, frame);
                    t.sprite = this.scene.add.image(t.x, lane, key, frame).setDepth(3.6)
                        .setScale(bossPropScale(key, frame, texture, attack));
                }
                const age = this.age - (t.at ?? (t.end - attack.time));
                const blend = Math.min(1, age / 190);
                const lift = t.kind === 'coin' ? Math.sin(Math.min(1, age / 1000) * Math.PI) * 20 : 0;
                const onLane = lane - 10 - lift;
                t.sprite.setPosition(attack.time ? this.x - 58 : t.x, attack.time ? lane - 26 : (t.originY ?? onLane) * (1 - blend) + onLane * blend)
                    .setAlpha(t.scatter ? .4 : 1).setRotation(this.scene.reducedMotion.matches ? 0
                        : t.kind === 'tire' ? age * .01 : t.kind === 'coin' ? age * .004 : 0);
                if (t.middle) art.lineStyle(3, 0xffe278).strokeRect(t.x - 15, lane - 25, 30, 34);
                if (!attack.time) continue;
            }
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
        this.updateHud(block);
    }

    propFor(kind) {
        const grid = kind.startsWith('grid');
        const frame = { coin: this.lowballer ? 0 : 4, tire: 1, paper: 2, minions: 5 }[kind];
        if (this.scene.bossProps) return ['boss-props', grid ? 3 : frame];
        const choices = kind === 'coin' ? this.lowballer ? ['coin'] : ['bill-projectile', 'coin']
            : kind === 'tire' ? ['obstacle-tires-1', 'tire'] : [];
        const key = choices.find(key => this.scene.textures.exists(key));
        return key ? [key, this.scene.firstFrame(key)] : null;
    }

    updateHud(block) {
        const heading = document.getElementById('boss-name');
        const note = document.getElementById('boss-note');
        const meter = document.getElementById('boss-hp');
        const tips = {
            lowballer: 'Dodge the toss. The clipboard can block.',
            tirekicker: 'Fly over the rolling tires.',
            greeter: 'Shoot the middle minion to scatter the group.',
            warranty: 'Break the paper shield or wait for it to open.',
            invoice: 'Leave the active grid lane or fly above it.',
            merger: 'Stay clear of both attacks in a pair.'
        };
        const message = this.mode === 'defeat' ? 'Approved'
            : this.mode === 'intro' ? this.tutorial ? tips[this.spec.id] : 'Get ready'
                : this.age < this.blockFlashUntil ? 'Blocked'
                    : this.plan || this.followUp ? (block ? block + ' · Incoming attack' : this.staggered ? 'Staggered · Incoming attack' : 'Incoming attack')
                        : this.staggered && !block ? 'Staggered · +1 damage'
                            : block || ' ';
        if (heading.textContent !== this.spec.name) heading.textContent = this.spec.name;
        if (note.textContent !== message) note.textContent = message;
        if (meter.max !== this.stats.hp) meter.max = this.stats.hp;
        if (meter.value !== this.hp) meter.value = this.hp;
        document.getElementById('boss-hud').hidden = false;
    }

    destroy() {
        this.clearThreats();
        this.view.destroy();
        this.sprite?.destroy();
        this.stamp.destroy();
        document.getElementById('boss-hud').hidden = true;
    }
}
