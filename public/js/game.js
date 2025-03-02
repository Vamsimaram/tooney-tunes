var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
      default: 'arcade',
      arcade: {
          gravity: {
              y: 300
          },
          debug: false
      }
  },
  backgroundColor: 0x000000,
  scene: [StartScene, PickScene, GameScene, RestartScene],
  scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600
  }
};

var game = new Phaser.Game(config);

// Handle window resizing
window.addEventListener('resize', function() {
  if (game.scale) {
      game.scale.refresh();
  }
}, false);