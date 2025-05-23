class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        console.log('BootScene preload');
        // Minimal preloading for now, or can be expanded later
    }

    create() {
        console.log('BootScene create');
        this.scene.start('MainScene');
    }
}

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        console.log('MainScene preload');

        // Attempt to load placeholder assets
        // Player
        this.load.spritesheet('player', 'game_assets/sprites/jay_the_rv_guy_spritesheet.png.txt', { frameWidth: 32, frameHeight: 48 });
        // Collectibles
        this.load.image('deal_token', 'game_assets/sprites/deal_token_collectible.png.txt');
        // Obstacles
        this.load.image('road_cone', 'game_assets/sprites/road_cone_obstacle.png.txt');
        // Background
        this.load.image('background', 'game_assets/backgrounds/rv_lot_background.png.txt');

        // Asset keys (fallback if .txt loading causes critical errors, though Phaser might just warn)
        this.assetKeys = {
            player: 'player',
            deal_token: 'deal_token',
            road_cone: 'road_cone',
            background: 'background',
            ui_buttons: 'ui_buttons', // Placeholder for buttons_spritesheet.png.txt
            coupon_visual: 'coupon_visual' // Placeholder for coupon_reveal_visual.png.txt
        };

        // Load UI assets (placeholders)
        this.load.spritesheet(this.assetKeys.ui_buttons, 'game_assets/ui/buttons_spritesheet.png.txt', { frameWidth: 190, frameHeight: 49 }); // Example dimensions
        this.load.image(this.assetKeys.coupon_visual, 'game_assets/ui/coupon_reveal_visual.png.txt');
    }

    create() {
        console.log('MainScene create');
        this.physics.start(); // Start physics system, gravity is set in config

        // Game States
        this.GAME_STATES = {
            AWAITING_START: 'AWAITING_START',
            PLAYING: 'PLAYING',
            PAUSED: 'PAUSED',
            GAME_OVER: 'GAME_OVER'
        };
        this.currentGameState = this.GAME_STATES.AWAITING_START;

        // Configurable values
        this.initialGameTime = 60; // seconds
        this.winScoreThreshold = 50; // Minimum score to win

        // Background
        this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, this.assetKeys.background);
        this.background.setOrigin(0, 0).setScrollFactor(0);

        // Player (initially inactive)
        this.player = this.physics.add.sprite(100, this.game.config.height - 150, this.assetKeys.player);
        this.player.setCollideWorldBounds(true).setBounce(0.1).setVisible(false).setActive(false);
        this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.8);
        this.player.body.setAllowGravity(false); // No gravity until game starts
        this.player.isInvincible = false; // For obstacle collision invincibility

        this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers(this.assetKeys.player, { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'jump', frames: this.anims.generateFrameNumbers(this.assetKeys.player, { start: 4, end: 5 }), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'idle', frames: [{ key: this.assetKeys.player, frame: 0 }], frameRate: 20 });

        // Score and Timer Display
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF', stroke: '#000', strokeThickness: 4 }).setScrollFactor(0).setDepth(100);
        this.timeLeft = this.initialGameTime;
        this.timerText = this.add.text(this.game.config.width - 16, 16, `Time: ${this.timeLeft}`, { fontSize: '32px', fill: '#FFF', stroke: '#000', strokeThickness: 4 }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        // Collectibles and Obstacles Groups (initially inactive spawning)
        this.dealTokens = this.physics.add.group({ defaultKey: this.assetKeys.deal_token, maxSize: 10, allowGravity: false });
        this.roadCones = this.physics.add.group({ defaultKey: this.assetKeys.road_cone, maxSize: 5, allowGravity: false });
        
        this.physics.add.overlap(this.player, this.dealTokens, this.collectToken, null, this);
        this.physics.add.overlap(this.player, this.roadCones, this.hitObstacle, null, this);

        // Spawning Timers (will be started in startGame)
        this.dealTokenTimer = this.time.addEvent({ delay: 2500, callback: this.spawnDealToken, callbackScope: this, loop: true, paused: true });
        this.roadConeTimer = this.time.addEvent({ delay: 3500, callback: this.spawnRoadCone, callbackScope: this, loop: true, paused: true });
        this.gameRunTimer = this.time.addEvent({ delay: 1000, callback: this.updateGameTimer, callbackScope: this, loop: true, paused: true });

        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // --- UI Elements ---
        this.center_x = this.game.config.width / 2;
        this.center_y = this.game.config.height / 2;

        // Start Button
        this.startButton = this.createTextButton(this.center_x, this.center_y - 50, 'Start Game', () => this.startGame());
        
        // Pause Button (initially hidden)
        this.pauseButton = this.createTextButton(this.game.config.width - 80, this.game.config.height - 40, 'Pause', () => this.togglePause())
            .setVisible(false).setDepth(100);

        // Game Over UI (initially hidden)
        this.gameOverText = this.add.text(this.center_x, this.center_y - 150, 'Game Over!', { fontSize: '48px', fill: '#FF0000', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setVisible(false).setDepth(100);
        this.winText = this.add.text(this.center_x, this.center_y - 100, '', { fontSize: '38px', fill: '#00FF00', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setVisible(false).setDepth(100);
        this.couponText = this.add.text(this.center_x, this.center_y - 50, '', { fontSize: '32px', fill: '#FFFF00', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setVisible(false).setDepth(100);
        // Attempt to add coupon visual
        this.couponVisual = this.add.image(this.center_x, this.center_y - 50, this.assetKeys.coupon_visual).setVisible(false).setAlpha(0.5).setDepth(99);


        this.playAgainButton = this.createTextButton(this.center_x, this.center_y + 50, 'Play Again?', () => this.restartGame()).setVisible(false);
        this.browseRVsButton = this.createTextButton(this.center_x, this.center_y + 100, 'Browse RVs!', () => {
            console.log('Browse RVs button clicked');
            // Potentially: window.open('your_rv_website_url', '_blank');
        }).setVisible(false);
        
        this.pausedText = this.add.text(this.center_x, this.center_y, 'Paused', { fontSize: '48px', fill: '#FFFF00' }).setOrigin(0.5).setVisible(false).setDepth(100);

        console.log('MainScene setup complete. Current state: AWAITING_START');
        this.updateUI();

        // Email form handling
        this.emailForm = document.getElementById('email-capture-form');
        this.emailInput = document.getElementById('email-input');
        this.submitEmailButton = document.getElementById('submit-email-button');
        this.emailThanksMessage = document.getElementById('email-thanks-message');
        this.emailErrorMessage = document.getElementById('email-error-message');

        if (this.submitEmailButton) {
            this.submitEmailButton.addEventListener('click', () => this.handleEmailSubmit());
        }
    }

    sendGAEvent(eventName, eventParams) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventParams);
        } else {
            console.log(`GA Event (${eventName}) not sent, gtag not defined:`, eventParams);
        }
    }

    showEmailForm() {
        if (this.emailForm) {
            this.emailInput.style.display = 'block';
            this.submitEmailButton.style.display = 'block';
            this.emailThanksMessage.style.display = 'none';
            this.emailErrorMessage.style.display = 'none';
            this.emailForm.style.display = 'block';
        }
    }

    hideEmailForm() {
        if (this.emailForm) {
            this.emailForm.style.display = 'none';
        }
    }

    handleEmailSubmit() {
        const emailValue = this.emailInput.value;
        if (emailValue && emailValue.includes('@') && emailValue.includes('.')) { // Basic validation
            console.log("Email submitted: " + emailValue);
            this.sendGAEvent('email_submitted', { 'game_title': 'RV Sale Dash' }); // GA Event
            this.emailInput.style.display = 'none';
            this.submitEmailButton.style.display = 'none';
            this.emailThanksMessage.style.display = 'block';
            this.emailErrorMessage.style.display = 'none';
            
            // Optionally hide the form after a few seconds
            this.time.delayedCall(3000, () => {
                this.hideEmailForm();
            }, [], this);
        } else {
            this.emailErrorMessage.style.display = 'block';
            this.emailThanksMessage.style.display = 'none';
        }
    }

    createTextButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, { fontSize: '32px', fill: '#0f0', backgroundColor: '#666', padding: { x: 10, y: 5 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => button.setStyle({ fill: '#ff0' }))
            .on('pointerout', () => button.setStyle({ fill: '#0f0' }));
        button.setDepth(100);
        return button;
    }
    
    updateUI() {
        this.startButton.setVisible(this.currentGameState === this.GAME_STATES.AWAITING_START);
        this.pauseButton.setVisible(this.currentGameState === this.GAME_STATES.PLAYING);
        this.pausedText.setVisible(this.currentGameState === this.GAME_STATES.PAUSED);

        const isGameOver = this.currentGameState === this.GAME_STATES.GAME_OVER;
        this.gameOverText.setVisible(isGameOver);
        this.winText.setVisible(isGameOver && this.score >= this.winScoreThreshold);
        this.couponText.setVisible(isGameOver && this.score >= this.winScoreThreshold);
        this.couponVisual.setVisible(isGameOver && this.score >= this.winScoreThreshold);
        this.playAgainButton.setVisible(isGameOver);
        this.browseRVsButton.setVisible(isGameOver);

        if (this.currentGameState === this.GAME_STATES.PAUSED) {
            this.pauseButton.setText('Resume').setVisible(true);
        } else {
            this.pauseButton.setText('Pause');
        }
    }

    startGame() {
        if (this.currentGameState !== this.GAME_STATES.AWAITING_START && this.currentGameState !== this.GAME_STATES.GAME_OVER) return;
        console.log('Starting game...');
        this.sendGAEvent('game_start', { 'game_title': 'RV Sale Dash' }); // GA Event

        this.currentGameState = this.GAME_STATES.PLAYING;
        
        // Reset values
        this.score = 0;
        this.scoreText.setText('Score: 0');
        this.timeLeft = this.initialGameTime;
        this.timerText.setText(`Time: ${this.timeLeft}`);

        // Activate player
        this.player.setPosition(100, this.game.config.height - 150);
        this.player.setActive(true).setVisible(true).play('idle');
        this.player.body.setAllowGravity(true);
        this.player.setVelocity(0,0);


        // Start timers
        this.dealTokenTimer.paused = false;
        this.roadConeTimer.paused = false;
        this.gameRunTimer.paused = false;
        
        this.updateUI();
    }

    togglePause() {
        if (this.currentGameState === this.GAME_STATES.PLAYING) {
            this.currentGameState = this.GAME_STATES.PAUSED;
            this.physics.pause();
            this.dealTokenTimer.paused = true;
            this.roadConeTimer.paused = true;
            this.gameRunTimer.paused = true;
            this.player.anims.pause();
            console.log('Game Paused');
        } else if (this.currentGameState === this.GAME_STATES.PAUSED) {
            this.currentGameState = this.GAME_STATES.PLAYING;
            this.physics.resume();
            this.dealTokenTimer.paused = false;
            this.roadConeTimer.paused = false;
            this.gameRunTimer.paused = false;
            this.player.anims.resume();
            console.log('Game Resumed');
        }
        this.updateUI();
    }

    updateGameTimer() {
        if (this.currentGameState !== this.GAME_STATES.PLAYING) return;
        this.timeLeft--;
        this.timerText.setText(`Time: ${this.timeLeft}`);
        if (this.timeLeft <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        if (this.currentGameState === this.GAME_STATES.GAME_OVER) return;
        console.log('Game Over. Score:', this.score);
        this.currentGameState = this.GAME_STATES.GAME_OVER;

        this.physics.pause(); // Stop all physics
        this.dealTokenTimer.paused = true;
        this.roadConeTimer.paused = true;
        this.gameRunTimer.paused = true;
        this.player.setActive(false).setVelocity(0,0);
        // this.player.setVisible(false); // Or just make them inactive

        if (this.score >= this.winScoreThreshold) {
            this.winText.setText('You Win! Deal Pro!');
            this.couponText.setText('Coupon: RVFUN200');
            this.sendGAEvent('game_win', { 'game_title': 'RV Sale Dash', 'score': this.score }); // GA Event
            this.sendGAEvent('coupon_reveal', { 'game_title': 'RV Sale Dash', 'coupon_code': 'RVFUN200' }); // GA Event
            this.showEmailForm(); // Show email form on win
        } else {
            this.winText.setText('Better Luck Next Time!');
            this.couponText.setText(''); // No coupon
            this.hideEmailForm(); // Ensure form is hidden if lost and was somehow visible
        }
        this.updateUI();
    }
    
    restartGame() {
        console.log('Restarting game...');
        this.currentGameState = this.GAME_STATES.AWAITING_START;
        this.hideEmailForm(); // Hide email form on restart

        // Reset form elements for next potential win
        if (this.emailInput) this.emailInput.value = '';
        if (this.emailThanksMessage) this.emailThanksMessage.style.display = 'none';
        if (this.emailErrorMessage) this.emailErrorMessage.style.display = 'none';
        if (this.emailInput) this.emailInput.style.display = 'block';
        if (this.submitEmailButton) this.submitEmailButton.style.display = 'block';


        // Clear existing items
        this.dealTokens.clear(true, true);
        this.roadCones.clear(true, true);

        // Reset player
        this.player.setPosition(100, this.game.config.height - 150).setVisible(false).setActive(false);
        this.player.body.setAllowGravity(false);
        
        // Reset timers state (they are already paused from gameOver)
        this.timeLeft = this.initialGameTime;
        this.score = 0;
        this.scoreText.setText('Score: 0');
        this.timerText.setText(`Time: ${this.timeLeft}`);

        this.updateUI();
    }


    update() {
        if (this.currentGameState !== this.GAME_STATES.PLAYING) {
            // If not playing, and player exists and has physics body, stop its movement
            if (this.player && this.player.body) {
                 this.player.setVelocityX(0);
                 if(this.player.anims && this.player.anims.currentAnim && this.player.anims.currentAnim.key !== 'idle' && (this.player.body.blocked.down || this.player.body.touching.down)) {
                    this.player.play('idle', true);
                 }
            }
            return; // Don't run game logic if not playing
        }

        // Scrolling background
        this.background.tilePositionX += 1;

        // Player movement
        const onGround = this.player.body.blocked.down || this.player.body.touching.down;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            if (onGround) this.player.anims.play('run', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            if (onGround) this.player.anims.play('run', true);
        } else {
            this.player.setVelocityX(0);
            if (onGround) this.player.anims.play('idle', true);
        }

        if ((this.spaceBar.isDown || this.cursors.up.isDown) && onGround) {
            this.player.setVelocityY(-330);
            this.player.anims.play('jump', true);
            // console.log('Player jump');
        }

        // Recycle off-screen items
        this.dealTokens.getChildren().forEach(token => {
            if (token.x < -50) token.disableBody(true, true);
        });
        this.roadCones.getChildren().forEach(cone => {
            if (cone.x < -50) cone.disableBody(true, true);
        });
    }

    spawnDealToken() {
        if (this.currentGameState !== this.GAME_STATES.PLAYING) return;
        const yPos = Phaser.Math.Between(this.game.config.height * 0.4, this.game.config.height * 0.8);
        let token = this.dealTokens.getFirstDead(true, this.game.config.width + 50, yPos, this.assetKeys.deal_token);
        if (token) {
            token.setActive(true).setVisible(true).enableBody(true, this.game.config.width + 50, yPos, true, true);
            token.setVelocityX(-200);
            // console.log('Deal Token spawned');
        }
    }

    collectToken(player, token) {
        if (this.currentGameState !== this.GAME_STATES.PLAYING) return;
        token.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        console.log('Deal Token collected! Score:', this.score);
    }

    spawnRoadCone() {
        if (this.currentGameState !== this.GAME_STATES.PLAYING) return;
        const yPos = this.game.config.height - 70;
        let cone = this.roadCones.getFirstDead(true, this.game.config.width + 50, yPos, this.assetKeys.road_cone);
        if (cone) {
            cone.setActive(true).setVisible(true).enableBody(true, this.game.config.width + 50, yPos, true, true);
            cone.setVelocityX(-250);
            cone.body.setSize(cone.width * 0.6, cone.height * 0.7).setOffset(cone.width * 0.2, cone.height * 0.15);
            // console.log('Road Cone spawned');
        }
    }

    hitObstacle(player, cone) {
        if (this.currentGameState !== this.GAME_STATES.PLAYING || player.isInvincible) return;
        
        cone.disableBody(true, true); // Remove cone immediately
        console.log('Obstacle Hit!');
        
        this.score -= 5;
        if (this.score < 0) this.score = 0;
        this.scoreText.setText('Score: ' + this.score);
        
        // Start invincibility and flashing
        player.isInvincible = true;
        player.setAlpha(0.5);

        // Flash sequence
        this.time.delayedCall(150, () => {
            player.setAlpha(1);
            this.time.delayedCall(150, () => {
                player.setAlpha(0.5);
                this.time.delayedCall(150, () => {
                    player.setAlpha(1);
                    this.time.delayedCall(150, () => {
                        player.setAlpha(0.5);
                        this.time.delayedCall(150, () => {
                             player.setAlpha(1);
                             // End invincibility after flashing (total ~750ms flash + buffer)
                             this.time.delayedCall(250, () => {
                                 player.isInvincible = false;
                             }, [], this);
                        }, [], this);
                    }, [], this);
                }, [], this);
            }, [], this);
        }, [], this);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 600, // Game width
    height: 800, // Game height
    parent: 'phaser-game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Global gravity
            debug: false // Set to true for physics body outlines
        }
    },
    scene: [BootScene, MainScene]
};

const game = new Phaser.Game(config);
