class TableauTiled extends Tableau{

    constructor(){
        super(" ");
      }
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
        this.load.image('tiles', 'assets/tilemaps/tableauTiledTilesetV10.png');
        //les données du tableau qu'on a créé dans TILED
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/tableauTiledV13.json');

        // -----et puis aussi-------------
        //plateformes
        this.load.image('platformi', 'assets/platformi.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('fondplatform', 'assets/fondplatform.png');
        this.load.image('mplatform', 'assets/mplatform.png');
        this.load.image('mfondplatform', 'assets/mfondplatform.png');
        this.load.image('bplatform', 'assets/bplatform.png');

        //background
        this.load.image('ciel', 'assets/background/ciel.jpg');
        this.load.image('troncnid', 'assets/background/troncnid.png');
        this.load.image('fondarbres2', 'assets/background/fondarbres2.png');
        this.load.image('fondbuissons', 'assets/background/fondbuissons.png');
        this.load.image('planbuissonshaut', 'assets/background/planbuissonshaut.png');
        this.load.image('planbuissonshaut2', 'assets/background/planbuissonshaut2.png');
        this.load.image('premierplan', 'assets/background/premierplan.png');
        this.load.image('cabane', 'assets/background/cabane.png');
        this.load.image('antagoniste', 'assets/background/antagoniste.png');
        
        //collectible
        //this.load.image('plume', 'assets/plume.png');

        // //images de tutoriel
        // this.load.image('ennemis', 'assets/dialogue/ennemis.jpg');
        // this.load.image('danger', 'assets/dialogue/danger.jpg');
        // this.load.image('bonus', 'assets/dialogue/bonus.jpg');


        //atlas de texture généré avec https://free-tex-packer.com/app/
        //on y trouve notre étoiles et une tête de mort
        this.load.atlas('particles', 'assets/particles/particles.png', 'assets/particles/particles.json');
        this.load.atlas('bulle', 'assets/particles/bulle.png', 'assets/particles/bulle.json');

        //musique
        this.load.audio('music', 'assets/sons/music.mp3');
    }
    create() {
        super.create();
        //musique
        this.game.sound.stopAll();
        this.music = this.sound.add('music');

        var musicConfig = {
            mute: false,
            volume: 0.1,
            rate : 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay:0,
        }
        this.music.play(musicConfig);

        //on en aura besoin...
        let ici=this;

        //--------chargement de la tile map & configuration de la scène-----------------------

        //notre map
        this.map = this.make.tilemap({ key: 'map' });
        //nos images qui vont avec la map
        this.tileset = this.map.addTilesetImage('tableauTiledTilesetV10', 'tiles');

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
        this.tutoriels = this.map.createLayer('tutoriels', this.tileset, 0, 0);
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
        this.tutoriels.setCollisionByProperty({Collision: true });

        // 2 manière la plus simple (là où il y a des tiles ça collide et sinon non)
        this.solides.setCollisionByExclusion(-1, true);
        this.champignon.setCollisionByExclusion(-1, true);
        this.tutoriels.setCollisionByExclusion(-1, true);
        this.boue.setCollisionByExclusion(-1, true);
        this.eau.setCollisionByExclusion(-1, true);
        
        //this.devant.setCollisionByExclusion(-1, true);

        // 3 Permet d'utiliser l'éditeur de collision de Tiled...mais ne semble pas marcher pas avec le moteur de physique ARCADE, donc oubliez cette option :(
        //this.map.setCollisionFromCollisionGroup(true,true,this.plateformesSimples);


        // Plate-formes Phaser
        this.platforms = this.physics.add.staticGroup();
        this.fondplatforms = this.physics.add.staticGroup();
        this.physics.add.collider(this.player, this.platforms);

        this.platform = this.physics.add.staticGroup();
        this.fondplatform = this.physics.add.staticGroup();
        this.physics.add.collider(this.player, this.platform);

        this.platforms.create(255, 770, 'platformi');

        // plateforme 1
        this.platforms.create(4050, 650, 'platform');
        this.fondplatforms.create(4050, 617, 'fondplatform');

        // plateforme 2
        this.platforms.create(3750, 530, 'platform');
        this.fondplatforms.create(3750, 497, 'fondplatform');

        // //plateforme 3
        this.platforms.create(3400, 410, 'platform');
        this.fondplatforms.create(3400, 377, 'fondplatform');

        this.platforms.create(3050, 300, 'platform');
        this.fondplatforms.create(3050, 267, 'fondplatform');

        this.platforms.create(2650, 300, 'platform');
        this.fondplatforms.create(2650, 267, 'fondplatform');

        this.platforms.create(2250, 300, 'platform');
        this.fondplatforms.create(2250, 267, 'fondplatform');

        this.platforms.create(1850, 300, 'platform');
        this.fondplatforms.create(1850, 267, 'fondplatform');

        this.platforms.create(1450, 300, 'mplatform');
        this.fondplatforms.create(1450, 267, 'mfondplatform');

        this.platforms.create(1100, 310, 'mplatform');
        this.fondplatforms.create(1100, 277, 'mfondplatform');
        
        this.platforms.create(800, 320, 'mplatform');
        this.fondplatforms.create(800, 287, 'mfondplatform');

        // plateformes de fin du niveau

        this.platforms.create(6800, 500, 'mplatform');
        this.fondplatforms.create(6800, 467, 'mfondplatform');


        // Plateforme verticale
        let platformContainer=this.add.container();

        var platform = this.physics.add.image(7200, 350, 'bplatform')
            .setImmovable(true)
            .setVelocity(100, -100)
            .setBodySize(64,31)
            .setOffset(0,15);


        platform.body.setAllowGravity(false);
        this.physics.add.collider(platform, this.player);
        platformContainer.add(platform);
        
        this.tweens.timeline({
            targets: platform.body.velocity,
            loop: -1,
            yoyo: true,
            tweens: [
                { x:    0, y: 170, duration: 1000, ease: 'Stepped' },
                { x:    0, y: -170, duration: 1000, ease: 'Stepped' },
            ]
        });

        // Plateforme horizontale

        var platform = this.physics.add.image(7650, 700, 'bplatform')
            .setImmovable(true)
            .setVelocity(100, -100)
            .setBodySize(64,31)
            .setOffset(0,15);

        platform.body.setAllowGravity(false);
        this.physics.add.collider(platform, this.player);
        platformContainer.add(platform);
        
        this.tweens.timeline({
            targets: platform.body.velocity,
            loop: -1,
            yoyo: true,
            tweens: [
                { x:    -170, y: 0, duration: 1000, ease: 'Stepped' },
                { x:    170, y: 0, duration: 1000, ease: 'Stepped' },
            ]
        });

        // Plateforme vertical 2

        var platform = this.physics.add.image(7700, 350, 'bplatform')
            .setImmovable(true)
            .setVelocity(100, -100)
            .setBodySize(64,31)
            .setOffset(0,15);


        platform.body.setAllowGravity(false);
        this.physics.add.collider(platform, this.player);
        platformContainer.add(platform);
        
        this.tweens.timeline({
            targets: platform.body.velocity,
            loop: -1,
            yoyo: true,
            tweens: [
                { x:    0, y: 170, duration: 1000, ease: 'Stepped' },
                { x:    0, y: -170, duration: 1000, ease: 'Stepped' },
            ]
        });

        // Plateforme horizontale 2

        var platform = this.physics.add.image(8150, 700, 'bplatform')
            .setImmovable(true)
            .setVelocity(100, -100)
            .setBodySize(64,31)
            .setOffset(0,15);

        platform.body.setAllowGravity(false);
        this.physics.add.collider(platform, this.player);
        platformContainer.add(platform);
        
        this.tweens.timeline({
            targets: platform.body.velocity,
            loop: -1,
            yoyo: true,
            tweens: [
                { x:    -170, y: 0, duration: 1000, ease: 'Stepped' },
                { x:    170, y: 0, duration: 1000, ease: 'Stepped' },
            ]
        });

        //----------les étoiles (objets) ---------------------

        
        // c'est un peu plus compliqué, mais ça permet de maîtriser plus de choses...
        // this.plumes = this.physics.add.group({
        //     allowGravity: false,
        //     immovable: false,
        //     bounceY:0
        // });
        // this.plumesObjects = this.map.getObjectLayer('plumes')['objects'];
        // // // On crée des étoiles pour chaque objet rencontré
        
        // this.plumesObjects.forEach(plumeObject => {
        //     // Pour chaque étoile on la positionne pour que ça colle bien car les étoiles ne font pas 64x64
        //     let plume = this.plumes.create(plumeObject.x+32, plumeObject.y+32 , 'particles','plume');
        // });

        //----------les monstres volants (objets tiled) ---------------------
        
        let monstersContainer=this.add.container();
        let montableau=this;
        this.flyingMonstersObjects = this.map.getObjectLayer('flyingMonsters')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        this.flyingMonstersObjects.forEach(monsterObject => {
            let monster=new MonsterFly(montableau,monsterObject.x,monsterObject.y);
            monstersContainer.add(monster);
        });

        let plumesContainer=this.add.container();
        this.plumeObjects = this.map.getObjectLayer('plumes')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        this.plumeObjects.forEach(plumeObject => {
            let plume=new Plume(montableau,plumeObject.x,plumeObject.y);
            plumesContainer.add(plume);
            this.physics.add.collider(plume, this.solides);
            this.physics.add.overlap(this.player, plume, this.ramasserEtoile, null, this);
        });
        

        //----------Squirrel (objets tiled) ---------------------

        ici.squirrelObjects = this.map.getObjectLayer('squirrel')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        ici.squirrelObjects.forEach(squirrelObject => {
            console.log(squirrelObject)

            let monster=new Squirrel(montableau,squirrelObject.x,squirrelObject.y);
            //let monster=montableau.create()
            //let monster = montableau.create(squirrelObject.x,squirrelObject.y , 'monster-fly');
            //monster.setDisplaySize(32,32);
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.solides)
        });
        
        ici.ratonObjects = this.map.getObjectLayer('raton')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        ici.ratonObjects.forEach(ratonObject => {
            console.log(ratonObject)

            let monster=new Raton(montableau,ratonObject.x,ratonObject.y);
            //let monster=montableau.create()
            //let monster = montableau.create(squirrelObject.x,squirrelObject.y , 'monster-fly');
            //monster.setDisplaySize(32,32);
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.solides)
        });

        ici.bunnyObjects = this.map.getObjectLayer('bunny')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        ici.bunnyObjects.forEach(bunnyObject => {
            console.log(bunnyObject)

            let monster=new Bunny(montableau,bunnyObject.x,bunnyObject.y);
            //let monster=montableau.create()
            //let monster = montableau.create(squirrelObject.x,squirrelObject.y , 'monster-fly');
            //monster.setDisplaySize(32,32);
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.solides)
        });

        ici.waterfall1Objects = this.map.getObjectLayer('waterfall1')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        ici.waterfall1Objects.forEach(waterfall1Object => {
            console.log(waterfall1Object)

            let monster=new Waterfall1(montableau,waterfall1Object.x,waterfall1Object.y);
            //let monster=montableau.create()
            //let monster = montableau.create(squirrelObject.x,squirrelObject.y , 'monster-fly');
            //monster.setDisplaySize(32,32);
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.solides)
        });

        ici.waterfall2Objects = this.map.getObjectLayer('waterfall2')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        ici.waterfall2Objects.forEach(waterfall2Object => {
            console.log(waterfall2Object)

            let monster=new Waterfall2(montableau,waterfall2Object.x,waterfall2Object.y);
            //let monster=montableau.create()
            //let monster = montableau.create(squirrelObject.x,squirrelObject.y , 'monster-fly');
            //monster.setDisplaySize(32,32);
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.solides)
        });
        
        ici.plant1Objects = this.map.getObjectLayer('plant1')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        ici.plant1Objects.forEach(plant1Object => {
            console.log(plant1Object)

            let monster=new Plant1(montableau,plant1Object.x,plant1Object.y);
            //let monster=montableau.create()
            //let monster = montableau.create(squirrelObject.x,squirrelObject.y , 'monster-fly');
            //monster.setDisplaySize(32,32);
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.solides)
        });

        ici.plant2Objects = this.map.getObjectLayer('plant2')['objects'];
        // On crée des montres volants pour chaque objet rencontré
        ici.plant2Objects.forEach(plant2Object => {
            console.log(plant2Object)

            let monster=new Plant2(montableau,plant2Object.x,plant2Object.y);
            //let monster=montableau.create()
            //let monster = montableau.create(squirrelObject.x,squirrelObject.y , 'monster-fly');
            //monster.setDisplaySize(32,32);
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.solides)
        });

        //new Squirrel(this,400,700);

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
                    frequency:500,
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

        let plumesFxContainer=ici.add.container();
        plumesContainer.iterate(function(etoile) {
            let particles=ici.add.particles("particles","plume");
            let emmiter=particles.createEmitter({
                tint:[  0x000000,0x0000FF,0x00BFFF,0x1E90FF/*0xFF8800,0xFFFF00,0x88FF00,0x8800FF*/ ],
                rotate: {min:0,max:360},

                scale: {start: 0.1, end: 0.1},
                alpha: { start: 1, end: 0 },
                blendMode: Phaser.BlendModes.ADD,
                lifespan : 2000,
                speed:40
            });
            etoile.on("disabled",function(){
                emmiter.on=false;
            })
            emmiter.startFollow(etoile);
            plumesFxContainer.add(particles);
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

        this.tutoriels.renderDebug(debug,{
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
        
        this.ciel=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'ciel'
        );

        this.ciel.setOrigin(0,0);
        this.ciel.setScrollFactor(0);//fait en sorte que le ciel ne suive pas la caméra
        //this.sky2.blendMode=Phaser.BlendModes.ADD;

        // this.tutoriels=this.add.tileSprite(
        //     0,
        //     0,
        //     this.sys.canvas.width,
        //     this.sys.canvas.height,
        //     'tutoriels'
        // );

        // this.tutoriels.setOrigin(0,0);
        // this.tutoriels.setScrollFactor(0);

        this.premierplan=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'premierplan'
        );

        this.premierplan.setOrigin(0,0);
        this.premierplan.setScrollFactor(0);


        this.planbuissonshaut=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'planbuissonshaut'
        );

        this.planbuissonshaut.setOrigin(0,0);
        this.planbuissonshaut.setScrollFactor(0);


        this.planbuissonshaut2=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'planbuissonshaut2'
        );

        this.planbuissonshaut2.setOrigin(0,0);
        this.planbuissonshaut2.setScrollFactor(0);


        this.fondarbres2=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'fondarbres2'
        );

        this.fondarbres2.setOrigin(0,0);
        this.fondarbres2.setScrollFactor(0);
        this.fondarbres2.alpha=1;


        this.fondbuissons=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'fondbuissons'
        );


        this.fondbuissons.setOrigin(0,0);
        this.fondbuissons.setScrollFactor(0);
        this.fondbuissons.alpha=1;

        this.troncnid=this.add.image(
            0,
            0,

            'troncnid'
        );


        this.troncnid.setOrigin(0,0);
        this.troncnid.setScrollFactor(1);
        this.troncnid.alpha=1;


        this.cabane=this.add.image(
            12352,
            8,

            'cabane'
        );

        this.cabane.setOrigin(0,0);
        this.cabane.setScrollFactor(1);
        this.cabane.alpha=1;

        this.antagoniste=this.add.image(
            13680,
            707,

            'antagoniste'
        );

        this.antagoniste.setOrigin(0,0);
        this.antagoniste.setScrollFactor(1);
        this.antagoniste.alpha=1;

        //----------collisions---------------------

        //quoi collide avec quoi?
        this.physics.add.collider(this.player, this.solides);
        this.physics.add.collider(this.player, this.boue);
        // this.physics.add.collider(this.plumes, this.solides);
        //si le joueur touche une étoile dans le groupe...
        // this.physics.add.overlap(this.player, this.plumes, this.ramasserEtoile, null, this);
        //quand on touche la boue/eau, on meurt
        this.physics.add.collider(this.player, this.champignon,this.Bounding,null,this);
        this.physics.add.collider(this.player, this.boue,this.SpeedDown,null,this);
        this.physics.add.collider(this.player, this.eau,this.playerDie,null,this);

        //--------- Z order -----------------------

        //on définit les z à la fin
        let z=1000; //niveau Z qui a chaque fois est décrémenté.
        debug.setDepth(z--);
        this.blood.setDepth(z--);
        this.eauFxContainer.setDepth(z--);
        this.eau.setDepth(z--);
        this.eau.setDepth(z--);
        monstersContainer.setDepth(z--);
        //this.devant.setDepth(z--);
        this.premierplan.setDepth(z--);
        this.planbuissonshaut.setDepth(z--);
        this.planbuissonshaut2.setDepth(z--);    
        this.solides.setDepth(z--);
        this.platforms.setDepth(z--);
        this.champignon.setDepth(z--);
        this.boueFxContainer.setDepth(z--);
        this.boue.setDepth(z--);
        this.player.setDepth(z--);
        platformContainer.setDepth(z--);
        // platform.setDepth(z--);
        this.tutoriels.setDepth(z--);
        plumesContainer.setDepth(z--);
        this.fondplatforms.setDepth(z--);
        plumesFxContainer.setDepth(z--);
        this.devant.setDepth(z--);
        this.antagoniste.setDepth(z--);
        this.cabane.setDepth(z--);
        this.troncnid.setDepth(z--);
        this.planbuissonshaut2.setDepth(z--);
        // this.derriere.setDepth(z--);
        this.fondarbres2.setDepth(z--);
        this.fondbuissons.setDepth(z--);
        this.ciel.setDepth(z--);

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
        this.ciel.tilePositionX=this.cameras.main.scrollX*0.1;
        this.ciel.tilePositionY=this.cameras.main.scrollY*0.6;

        this.fondbuissons.tilePositionX=this.cameras.main.scrollX*0.3;
        this.fondbuissons.tilePositionY=this.cameras.main.scrollY*1;

        // this.planbuissonshaut.tilePositionX=this.cameras.main.scrollX*0.5;
        // this.planbuissonshaut.tilePositionY=this.cameras.main.scrollY*1;

        this.fondarbres2.tilePositionX=this.cameras.main.scrollX*0.5;
        this.fondarbres2.tilePositionY=this.cameras.main.scrollY*1;

        this.planbuissonshaut2.tilePositionX=this.cameras.main.scrollX*0.7;
        this.planbuissonshaut2.tilePositionY=this.cameras.main.scrollY*1;

        this.planbuissonshaut.tilePositionX=this.cameras.main.scrollX*1;
        this.planbuissonshaut.tilePositionY=this.cameras.main.scrollY*1;

        this.premierplan.tilePositionX=this.cameras.main.scrollX*2;
        this.premierplan.tilePositionY=this.cameras.main.scrollY*1;
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