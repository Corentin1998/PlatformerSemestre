class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y) {
        super(scene, x, y, "player")
        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.setCollideWorldBounds(true)
        this.setBounce(0);
        this.setGravityY(1000)
        this.setFriction(1,1);

        this.setBodySize(this.body.width-6,this.body.height-10);
        this.setOffset(3, 10);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 16 }),
            frameRate: 15,
            repeat: -1
        });
        
        // this.anims.create({
        //     key: 'turn',
        //     frames: [ { key: 'player', frame: 8 } ],
        //     frameRate: 20
        // });

        this.anims.create({
            key: 'back',
            frames: [ { key: 'player', frame: 7 } ],
            frameRate: 10
        });
        this.anims.create({
            key: 'stance',
            frames: [ { key: 'player', frame: 9 } ]
            // frameRate: 3,
            // repeat: -1
        });

        this.anims.create({
            key: 'leftfly',
            frames: [ { key: 'playerfly', frame: 0 } ],
            frameRate: 2,
            //repeat: -1
        });

        this.anims.create({
            key: 'rightfly',
            frames: [ { key: 'playerfly', frame: 1 } ],
            // frameRate: 2,
            // repeat: -1
        });
        

        this._directionX=0;
        this._directionY=0;
    }

    set directionX(value){
        this._directionX=value;
    }
    set directionY(value){
        this._directionY=value;
    }

    /**
     * arrête le joueur
     */
    stop(){
        this.setVelocityX(0);
        this.setVelocityY(0);
        this.directionY=0;
        this.directionX=0;
    }

    /**
     * Déplace le joueur en fonction des directions données
     */
    move(){

        switch (true){
            case this._directionX<0:
                this.sens=-1;
                this.setVelocityX(-200);
                this.anims.play('left', true);
                break;
            case this._directionX>0:
                this.sens=1;
                this.setVelocityX(200);
                this.anims.play('right', true);
                break;
            default:
                this.setVelocityX(0);
                this.anims.play('stance', true);
                this.anims.play(this.sens===-1 ? 'back' : 'stance' ,true);
                // this.setVelocityX(0);
                // this.anims.play('turn');
        }

        if(this._directionY<0){
            if(this.body.blocked.down || this.body.touching.down){
                this.setVelocityY(-600);
            }

        }
        else if(this._directionY>0){
            if(!this.body.blocked.down && !this.body.touching.down){
                this.setVelocityY(80);
                this.anims.play('leftfly', true);
                this.anims.play(this.sens===-1 ? 'leftly' : 'rightfly' ,true);
            }

        }

    }
}