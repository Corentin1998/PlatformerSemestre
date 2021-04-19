class Tourbillon extends Player{
    constructor(scene) {

        var x = scene.player.x;
        var y = scene.player.y;

        super(scene, x, y, "tourbillon");
        scene.projectiles.add(this);
    }
}