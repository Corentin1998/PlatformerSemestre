class TableauTiled extends Tableau{
    /**
     * Ce tableau démontre comment se servir de Tiled, un petit logiciel qui permet de designer des levels et de les importer dans Phaser (entre autre).
     *
     * Ce qui suit est très fortement inspiré de ce tuto :
     * https://stackabuse.com/phaser-3-and-tiled-building-a-platformer/
     *
     * Je vous conseille aussi ce tuto qui propose quelques alternatives (la manière dont son découpées certaines maisons notamment) :
     * https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
     */
    preload() {
        super.preload();
        // ------pour TILED-------------
        // nos images
        this.load.image('tiles', 'assets/tilemaps/tableauTiledTilesetV4.png');
        //les données du tableau qu'on a créé dans TILED
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/tableauTiledV5.json');

        // -----et puis aussi-------------
        this.load.image('monster-fly', 'assets/monster-fly.png');
        this.load.image('night', 'assets/night.jpg');
        this.load.image('star', 'assets/star.png');

        //atlas de texture généré avec https://free-tex-packer.com/app/
        //on y trouve notre étoiles et une tête de mort
        this.load.atlas('particles', 'assets/particles/particles.png', 'assets/particles/particles.json');
        this.load.atlas('bulle', 'assets/particles/bulle.png', 'assets/particles/bulle.json');
    }
    create() {
        super.create();
        //on en aura besoin...
        let ici=this;

        //--------chargement de la tile map & configuration de la scène-----------------------

        //notre map
        this.map = this.make.tilemap({ key: 'map' });
        //nos images qui vont avec la map
        this.tileset = this.map.addTilesetImage('tableauTiledTilesetV4', 'tiles');

        //on agrandit le champ de la caméra du coup
        let largeurDuTableau=this.map.widthInPixels;
        let hauteurDuTableau=this.map.heightInPixels;
        this.physics.world.setBounds(0, 0, largeurDuTableau,  hauteurDuTableau);
        this.cameras.main.setBounds(0, 0, largeurDuTableau, hauteurDuTableau);
        this.cameras.main.startFollow(this.player, true, 1, 1);

        //---- ajoute les plateformes simples ----------------------------

        this.solides = this.map.createLayer('solides', this.tileset, 0, 0);
        this.champignon = this.map.createLayer('champignon', this.tileset, 0, 0);
        this.boue = this.map.createLayer('boue', this.tileset, 0, 0);
        this.eau = this.map.createLayer('eau', this.tileset, 0, 0);
        // this.derriere = this.map.createLayer('derriere', this.tileset, 0, 0);
        this.devant = this.map.createLayer('devant', this.tileset, 0, 0);

        //on définit les collisions, plusieurs méthodes existent:

        // 1 La méthode que je préconise (il faut définir une propriété dans tiled pour que ça marche)
        //permet de travailler sur un seul layer dans tiled et des définir les collisions en fonction des graphiques
        //exemple ici https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
        //this.solides.set({Collision: true });
        //this.boue.setCollisionByProperty({Collision: true });
        //this.devant.setCollisionByProperty({Collision: true });
        this.solides.setCollisionByProperty({Collision: true });
        this.champignon.setCollisionByProperty({Collision: true });

        // 2 manière la plus simple (là où il y a des tiles ça collide et sinon non)
        this.solides.setCollisionByExclusion(-1, true);
        this.champignon.setCollisionByExclusion(-1, true);
        this.boue.setCollisionByExclusion(-1, true);
        this.eau.setCollisionByExclusion(-1, true);
        
        //this.devant.setCollisionByExclusion(-1, true);

        // 3 Permet d'utiliser l'éditeur de collision de Tiled...mais ne semble pas marcher pas avec le moteur de physique ARCADE, donc oubliez cette option :(
        //this.map.setCollisionFromCollisionGroup(true,true,this.plateformesSimples);

        //----------les étoiles (objets) ---------------------

        // c'est un peu plus compliqué, mais ça permet de maîtriser plus de choses...
        this.stars = this.physics.add.group({
            allowGravity: true,
            immovable: false,
            bounceY:1
        });
        this.starsObjects = this.map.getObjectLayer('stars')['objects'];
        // // On crée des étoiles pour chaque objet rencontré
        
        this.starsObjects.forEach(starObject => {
            // Pour chaque étoile on la positionne pour que ça colle bien car les étoiles ne font pas 64x64
            let star = this.stars.create(starObject.x+32, starObject.y+32 , 'particles','star');
        });

        //----------les monstres volants (objets tiled) ---------------------


        
        let monstersContainer=this.add.container();
        let montableau=this;
        this.flyingMonstersObjects = this.map.getObjectLayer('flyingMonsters')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        this.flyingMonstersObjects.forEach(monsterObject => {
            let monster=new MonsterFly(montableau,monsterObject.x,monsterObject.y);
            monstersContainer.add(monster);
        });
        

        //--------effet sur la boue------------------------

        this.boueFxContainer=this.add.container();
        this.boue.forEachTile(function(tile){ //on boucle sur TOUTES les tiles de boue pour générer des particules
          if(tile.index !== -1){ //uniquement pour les tiles remplies*/

        //dé-commenter pour mieux comprendre ce qui se passe
        /*
                console.log("boue tile",tile.index,tile);
                let g=ici.add.graphics();
                boueFxContainer.add(g);
                g.setPosition(tile.pixelX,tile.pixelY)
                g.lineStyle(1,0xFF0000);
                g.strokeRect(0, 0, 64, 64);
                */

                //on va créer des particules
                let props={
                    frame: [
                        'star', //pour afficher aussi des étoiles
                        'death-white'
                    ],
                    frequency:200,
                    lifespan: 2000,
                    quantity:2,
                    x:{min:-32,max:32},
                    y:{min:-12,max:52},
                    tint:[  0x320701,0x883333,0x994500,0x1a0a00 ],
                    rotate: {min:-10,max:10},
                    speedX: { min: -10, max: 10 },
                    speedY: { min: -20, max: -30 },
                    scale: {start: 0, end: 1},
                    alpha: { start: 1, end: 0 },
                    blendMode: Phaser.BlendModes.ADD,
                };

                
               
                let props2={...props}; //copie props sans props 2 */
                props2.blendMode=Phaser.BlendModes.MULTIPLY; // un autre blend mode plus sombre

                /*ok tout est prêt...ajoute notre objet graphique*/
                let boueParticles = ici.add.particles('particles');

                
                //ajoute le premier émetteur de particules
                boueParticles.createEmitter(props);
                //on ne va pas ajouter le second effet émetteur mobile car il consomme trop de ressources
                if(!ici.isMobile) {
                    boueParticles.createEmitter(props2); // ajoute le second
                }
                // positionne le tout au niveau de la tile
                boueParticles.x=tile.pixelX+32;
                boueParticles.y=tile.pixelY+32;
                ici.boueFxContainer.add(boueParticles);

                //optimisation (les particules sont invisibles et désactivées par défaut)
                //elles seront activées via update() et optimizeDisplay()
                boueParticles.pause();
                boueParticles.visible=false;
                //on définit un rectangle pour notre tile de particules qui nous servira plus tard
                boueParticles.rectangle=new Phaser.Geom.Rectangle(tile.pixelX,tile.pixelY,64,64);

            }

        })

        //--------effet sur l'eau------------------------

        this.eauFxContainer=this.add.container();
        this.eau.forEachTile(function(tile){ //on boucle sur TOUTES les tiles de boue pour générer des particules
          if(tile.index !== -1){ //uniquement pour les tiles remplies*/

        //dé-commenter pour mieux comprendre ce qui se passe
        /*
                console.log("eau tile",tile.index,tile);
                let g=ici.add.graphics();
                eauFxContainer.add(g);
                g.setPosition(tile.pixelX,tile.pixelY)
                g.lineStyle(1,0xFF0000);
                g.strokeRect(0, 0, 64, 64);
                */

                //on va créer des particules
                let props={
                    frame: [
                        'bulle', //pour afficher aussi des étoiles
                    ],
                    frequency:400,
                    lifespan: 1000,
                    quantity:1,
                    x:{min:-32,max:32},
                    y:{min:-12,max:52},
                    tint:[  0x0000ff,0x0066ff,0x3333ff,0x3366ff ],
                    rotate: {min:-10,max:10},
                    speedX: { min: -10, max: 10 },
                    speedY: { min: -20, max: -30 },
                    scale: {start: 0, end: 1},
                    alpha: { start: 1, end: 1 },
                    blendMode: Phaser.BlendModes.ADD,
                };


                //let props2={...props}; //copie props sans props 2 */
                //props2.blendMode=Phaser.BlendModes.MULTIPLY; // un autre blend mode plus sombre

                /*ok tout est prêt...ajoute notre objet graphique*/
                let eauParticles = ici.add.particles('bulle');
                
                //ajoute le premier émetteur de particules
                eauParticles.createEmitter(props);
                //on ne va pas ajouter le second effet émetteur mobile car il consomme trop de ressources
                /*if(!ici.isMobile) {
                    eauParticles.createEmitter(props2); // ajoute le second
                }*/
                // positionne le tout au niveau de la tile
                eauParticles.x=tile.pixelX+32;
                eauParticles.y=tile.pixelY+62;
                ici.eauFxContainer.add(eauParticles);

                //optimisation (les particules sont invisibles et désactivées par défaut)
                //elles seront activées via update() et optimizeDisplay()
                eauParticles.pause();
                eauParticles.visible=false;
                //on définit un rectangle pour notre tile de particules qui nous servira plus tard
                eauParticles.rectangle=new Phaser.Geom.Rectangle(tile.pixelX,tile.pixelY,64,64);

            }

        })
        //--------allez on se fait un peu la même en plus simple mais avec les étoiles----------

        let starsFxContainer=ici.add.container();
        this.stars.children.iterate(function(etoile) {
            let particles=ici.add.particles("particles","star");
            let emmiter=particles.createEmitter({
                tint:[  0xFF8800,0xFFFF00,0x88FF00,0x8800FF ],
                rotate: {min:0,max:360},

                scale: {start: 0.8, end: 0.5},
                alpha: { start: 1, end: 0 },
                blendMode: Phaser.BlendModes.ADD,
                lifespan : 2000,
                speed:40
            });
            etoile.on("disabled",function(){
                emmiter.on=false;
            })
            emmiter.startFollow(etoile);
            starsFxContainer.add(particles);
        });



        //----------débug---------------------
        
        //pour débugger les collisions sur chaque layer
        let debug=this.add.graphics().setAlpha(this.game.config.physics.arcade.debug?0.75:0);
        if(this.game.config.physics.arcade.debug === false){
            debug.visible=false;
        }
        //débug solides en vers
        this.solides.renderDebug(debug,{
            tileColor: null, // Couleur des tiles qui ne collident pas
            collidingTileColor: new Phaser.Display.Color(0, 255, 0, 255), //Couleur des tiles qui collident
            faceColor: null // Color of colliding face edges
        });

        this.champignon.renderDebug(debug,{
            tileColor: null, // Couleur des tiles qui ne collident pas
            collidingTileColor: new Phaser.Display.Color(0, 255, 0, 255), //Couleur des tiles qui collident
            faceColor: null // Color of colliding face edges
        });

        //debug eau en rouge
        this.eau.renderDebug(debug,{
            tileColor: null, // Couleur des tiles qui ne collident pas
            collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255), //Couleur des tiles qui collident
            faceColor: null // Color of colliding face edges
       });

       //debug boue en rouge
        this.boue.renderDebug(debug,{
             tileColor: null, // Couleur des tiles qui ne collident pas
             collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255), //Couleur des tiles qui collident
             faceColor: null // Color of colliding face edges
        });



        //---------- parallax ciel (rien de nouveau) -------------

        //on change de ciel, on fait une tileSprite ce qui permet d'avoir une image qui se répète
        
        this.sky=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'night'
        );
        this.sky2=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'night'
        );
        this.sky.setOrigin(0,0);
        this.sky2.setOrigin(0,0);
        this.sky.setScrollFactor(0);//fait en sorte que le ciel ne suive pas la caméra
        this.sky2.setScrollFactor(0);//fait en sorte que le ciel ne suive pas la caméra
        this.sky2.blendMode=Phaser.BlendModes.ADD;

        //----------collisions---------------------

        //quoi collide avec quoi?
        this.physics.add.collider(this.player, this.solides);
        this.physics.add.collider(this.stars, this.solides);
        //si le joueur touche une étoile dans le groupe...
        this.physics.add.overlap(this.player, this.stars, this.ramasserEtoile, null, this);
        //quand on touche la boue/eau, on meurt
        this.physics.add.collider(this.player, this.champignon,this.Bounding,null,this);
        this.physics.add.collider(this.player, this.eau,this.playerDie,null,this);

        //--------- Z order -----------------------

        //on définit les z à la fin
        let z=1000; //niveau Z qui a chaque fois est décrémenté.
        debug.setDepth(z--);
        this.blood.setDepth(z--);
        monstersContainer.setDepth(z--);
        this.stars.setDepth(z--);
        starsFxContainer.setDepth(z--);
        this.devant.setDepth(z--);
        this.solides.setDepth(z--);
        this.champignon.setDepth(z--);
        this.boueFxContainer.setDepth(z--);
        this.boue.setDepth(z--);
        this.eauFxContainer.setDepth(z--);
        this.eau.setDepth(z--);
        this.devant.setDepth(z--);
        this.player.setDepth(z--);
        this.devant.setDepth(z--);
        // this.derriere.setDepth(z--);
        this.sky2.setDepth(z--);
        this.sky.setDepth(z--);

    }

    /**
     * Permet d'activer, désactiver des éléments en fonction de leur visibilité dans l'écran ou non
     */

    optimizeDisplay(){
        //return;
        let world=this.cameras.main.worldView; // le rectagle de la caméra, (les coordonnées de la zone visible)

        // on va activer / désactiver les particules de boue
        
        for( let particule of this.boueFxContainer.getAll()){ // parcours toutes les particules de boue
            if(Phaser.Geom.Rectangle.Overlaps(world,particule.rectangle)){
                //si le rectangle de la particule est dans le rectangle de la caméra
                if(!particule.visible){
                    //on active les particules
                    particule.resume();
                    particule.visible=true;
                }
            }else{
                //si le rectangle de la particule n'est PAS dans le rectangle de la caméra
                if(particule.visible){
                    //on désactive les particules
                    particule.pause();
                    particule.visible=false;
                }
            }
        }

        // on va activer / désactiver les particules d'eau

        for( let particule of this.eauFxContainer.getAll()){ // parcours toutes les particules d'eau
            if(Phaser.Geom.Rectangle.Overlaps(world,particule.rectangle)){
                //si le rectangle de la particule est dans le rectangle de la caméra
                if(!particule.visible){
                    //on active les particules
                    particule.resume();
                    particule.visible=true;
                }
            }else{
                //si le rectangle de la particule n'est PAS dans le rectangle de la caméra
                if(particule.visible){
                    //on désactive les particules
                    particule.pause();
                    particule.visible=false;
                }
            }
        }
        
        

        // ici vous pouvez appliquer le même principe pour des monstres, des étoiles etc...
    }

    

    /**
     * Fait se déplacer certains éléments en parallax
     */
    moveParallax(){
        //le ciel se déplace moins vite que la caméra pour donner un effet paralax
        this.sky.tilePositionX=this.cameras.main.scrollX*0.6;
        this.sky.tilePositionY=this.cameras.main.scrollY*0.6;
        this.sky2.tilePositionX=this.cameras.main.scrollX*0.7+100;
        this.sky2.tilePositionY=this.cameras.main.scrollY*0.7+100;
    }


    update(){
        super.update();  
        this.moveParallax();

        //optimisation
        //teste si la caméra a bougé
        let actualPosition=JSON.stringify(this.cameras.main.worldView);
        if(
            !this.previousPosition
            || this.previousPosition !== actualPosition
        ){
            this.previousPosition=actualPosition;
            this.optimizeDisplay();
        }
    }

}