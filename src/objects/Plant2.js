class Plant2 extends ObjetPhysique{
    /**
     *
     * @param {Tableau} scene
     * @param x
     * @param y
     */
    constructor(scene, x, y) {
        super(scene, x, y-30, "plant2");
        //super(scene, x, y, "monster-fly");
        this.body.allowGravity=false;
        scene.physics.add.existing(this)
        this.setDisplaySize(64,64);
        //on réduit un peu la zone de hit
        //this.setBodySize(this.body.width,this.body.height);
        //this.setOffset(11, 0);
        //this.setDepth(10);
        //définir les propriété que l'on va utiliser dans notre animation


        /*this.load.spritesheet('squirrel',
        'assets/squirrel.png',
            { frameWidth: 62, frameHeight: 82  }
        );

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('squirrel', { start: 0, end: 8 }),
            frameRate: 15,
            repeat: -1
        });*/

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('plant2', { start: 0, end: 7 }),
            frameRate: 7,
            repeat: -1
        });
        
        /*this.anims.create({
            key: 'turn',
            frames: [ { key: 'squirrel', frame: 0 } ],
            frameRate: 20
        });*/
 
            
        // X
        //this.originalX=x;
        //this.minX=x-200;
        //this.maxX=x+200;

        // Y
        //this.originalY=y;
        //this.minY=y-20;
        //this.maxY=height-64;

        // on applique les propriété du début de l'animation
        //this.x=this.minX;
        //this.y=this.minY;
        //this.alpha=0;
        let me=this;

        this.anims.play('right', true);

        //on fait apparaitre notre objet avec un petit delay, puis on lance l'animation
        //ceci a pour effet de décaler les animations pour ce même objet
        /*scene.tweens.add({
                targets:this,
                duration:200,
                delay:Math.random()*1000,
                alpha:{
                    startDelay:Math.random()*5000,
                    from:0,
                    to:1,
                },
                onComplete: function () {
                    me.start();
                }
            })*/
    }

    /*start(){
        this.scene.tweens.add({
            targets: this,
            y: {
                from: this.minY,
                to:this.maxY,
                duration: 1500,
                ease: 'Back.easeIn',
                yoyo: -1,
                repeat:-1,
                flipX:true,
            }
        });
    }*/
}