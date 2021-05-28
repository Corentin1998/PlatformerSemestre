class Plume extends ObjetPhysique{
    /**
     * Un oiseau qui vole et fait des allez -retours
     * @param {Tableau} scene
     * @param x
     * @param y
     */
    constructor(scene, x, y) {
        super(scene, x, y, "plume");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.allowGravity=false;
        this.setBounceY(0);
    }
}