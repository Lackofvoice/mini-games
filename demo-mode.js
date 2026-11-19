(() => {
    'use strict';

    const DEMO_IDLE_MS = 8000;
    const DEMO_BOARD_DELAY_MS = 500;
    const DEMO_BOARD_HOLD_MS = 4500;
    const DEMO_SCENES = Object.freeze([
        Object.freeze({ level: 1, arena: false }),
        Object.freeze({ level: 3, arena: false }),
        Object.freeze({ level: 2, arena: true })
    ]);

    class AttractMode {
        phase = 'inactive';
        idleSince = null;
        skipFrame = false;
        exitKey = null;
        exitPointer = false;
        sceneIndex = 0;
        board = null;
        boardVisible = false;
        boardShownAt = 0;

        claimBoard(presentation) {
            this.board = presentation;
        }

        updateBoard(elapsed, leaderboard) {
            if (this.boardVisible && elapsed - this.boardShownAt >= DEMO_BOARD_HOLD_MS) {
                this.clearBoard(leaderboard);
            } else if (this.board && elapsed >= DEMO_BOARD_DELAY_MS) {
                this.boardVisible = leaderboard.showDemoBoard(this.board);
                this.boardShownAt = elapsed;
                this.board = null;
            }
        }

        clearBoard(leaderboard) {
            this.board = null;
            if (this.boardVisible) leaderboard.hideDemoBoard();
            this.boardVisible = false;
        }

        nextScene() {
            const scene = DEMO_SCENES[this.sceneIndex];
            this.sceneIndex = (this.sceneIndex + 1) % DEMO_SCENES.length;
            return scene;
        }

        reset() {
            this.phase = 'inactive';
            this.idleSince = null;
            this.skipFrame = false;
        }

        gameOver() {
            this.phase = 'pending';
            this.idleSince = null;
        }

        wait(now, blocked) {
            if (this.phase !== 'pending' && this.phase !== 'idle') return false;
            if (blocked) {
                this.gameOver();
                return false;
            }
            this.phase = 'idle';
            this.idleSince ??= now;
            if (now - this.idleSince < DEMO_IDLE_MS) return false;
            this.phase = 'demo';
            return true;
        }

        activity() {
            this.idleSince = null;
        }

        visibilityChanged() {
            this.activity();
            this.skipFrame = this.phase === 'demo';
        }

        canAdvance(hidden) {
            if (hidden) return false;
            if (!this.skipFrame) return true;
            this.skipFrame = false;
            return false;
        }

        capture(event, demoContext, exit) {
            const { type, code, repeat, isTrusted } = event;
            const consume = () => {
                event.preventDefault();
                event.stopImmediatePropagation();
            };
            if (isTrusted && type === 'keyup' && this.exitKey === code) {
                this.exitKey = null;
                consume();
                return;
            }
            if (isTrusted && type === 'keydown' && repeat && this.exitKey === code) {
                consume();
                return;
            }
            if (isTrusted && type === 'keydown' && !repeat) this.exitKey = null;
            if (isTrusted && (type === 'pointerdown' || type === 'keydown')) this.exitPointer = false;
            if (isTrusted && this.exitPointer && (type === 'click' || type === 'auxclick' || type === 'contextmenu')) {
                if (type !== 'contextmenu') this.exitPointer = false;
                consume();
                return;
            }
            if (type === 'pointermove' || type === 'wheel') {
                if (isTrusted) this.activity();
                return;
            }
            if (type !== 'keydown' && type !== 'pointerdown' && type !== 'click') return;
            if (!demoContext) {
                if (isTrusted) this.activity();
                return;
            }
            consume();
            if (!isTrusted) return;
            if (type === 'pointerdown') this.exitPointer = true;
            if (type === 'keydown') this.exitKey = code;
            exit();
        }
    }

    // Drive the same inputs as the cabinet buttons. Look ahead for nearby
    // obstacles in Taggy's lane and aim loosely for the boss during encounters.
    function driveDemo(scene) {
        const { player, roadDepth, verticalSpeed, arena, segments } = scene;
        const altitude = roadDepth - player.y;
        const obstacle = !arena && segments.some(({ view, pattern, hanging, hp }) =>
            hp !== 0 && !hanging && pattern.art?.type !== 'slow-down' &&
            view.x > player.x - 45 && view.x < player.x + 120 &&
            (pattern.depth == null ? pattern.lane === 'low' : Math.abs(pattern.depth - roadDepth) <= 24));
        const jump = arena
            ? altitude < (scene.panelFlight?.size ? 91 : 46) && verticalSpeed > -230
            : obstacle && altitude < (scene.panelFlight?.size ? 132 : 28);
        if (jump !== Boolean(scene.panelFlight?.size)) scene.panelInput({ source: 'fly', held: jump });
        if (!scene.panelFire) scene.panelInput({ source: 'fire', held: true });
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = { AttractMode, DEMO_IDLE_MS, DEMO_BOARD_DELAY_MS, DEMO_BOARD_HOLD_MS, driveDemo };
    }
    else window.RVDashDemo = { AttractMode, driveDemo };
})();
