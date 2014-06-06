ig.module( 'game.entities.player' )
.requires(
    'plusplus.abstractities.player'
)
.defines(function () {
    ig.EntityPlayer = ig.global.EntityPlayer = ig.Player.extend({
        animSheet: new ig.AnimationSheet( "media/player.png", 32, 32),
        animInit: "idleX",
        animSettings: {
            idleX: { sequence: [0], frameTime: 0.1 }
        }
    });
});