/**
 * Game Configuration
 */
const CONFIG = {
    // Game settings
    initialCoins: 150,
    gridWidth: 12,
    gridHeight: 6,
    cellSize: 80,

    // Stage configurations
    stages: [
        {
            id: 1,
            name: "Stage 1",
            background: "assets/images/background1.png",
            music: "assets/images/stage1.mp3",
            availablePlayers: ["Hua", "Felis", "Su"],
            zombieTarget: 20,
            zombieTypes: {
                "Zom1": { count: 15, appearFirst: 5 },
                "Zom2": { count: 5, appearLast: 5 }
            },
            story: "Kevin Kaslana sends Raiden Mei into the Elysian Realm with a single, unspoken hope. Kiana is dying, and the Honkai corrosion consuming her body cannot be cured by any method of the Current Era. Kevin knows this better than anyone, having lived through an age where humanity failed completely. If a cure exists, it must lie within the memories of the Previous Era. The Elysian Realm is not a physical place but a preserved dream, a vast data simulation containing the final records of thirteen warriors known as the Flame Chasers—the last soldiers of a civilization from fifty thousand years ago, survivors of the battle against the Herrscher of Binding, the twelfth Herrscher of their time. Mei enters the Realm burdened by doubt, determination, and guilt, knowing she is not there for herself but to save Kiana and to become strong enough to face the end that Kevin knows is approaching. What Mei does not yet realize is that the Realm is not merely a record of the past, but a trial meant to test her resolve."
        },
        {
            id: 2,
            name: "Stage 2",
            background: "assets/images/background2.png",
            music: "assets/images/stage2.mp3",
            availablePlayers: ["Hua", "Felis", "Su", "Sakura"],
            zombieTarget: 20,
            zombieTypes: {
                "Zom1": { count: 12, appearFirst: 5 },
                "Zom2": { count: 8, appearLast: 5 }
            },
            story: "The first Flame Chaser Mei truly encounters is Elysia. Bright, playful, and endlessly teasing, she is nothing like the hardened warrior Mei imagined from a doomed era. She smiles too easily, laughs too freely, and welcomes Mei as if she has been waiting for her all along. Through Elysia, Mei is introduced to the Flame Chasers one by one: Kevin, cold and distant, the strongest among them; Kalpas, a being of pure fury who believes violence is the only answer to Honkai; Mobius, a genius who abandoned morality in pursuit of evolution; Aponia, a prophet weighed down by visions of inevitable tragedy; and others, each broken yet brilliant, bound together by a shared purpose. From them, Mei learns the truths of the Previous Era—that Herrschers were far stronger and crueler, that Divine Keys were forged from the cores of defeated Herrschers, and that humanity once faced Honkai without the interference of any Will guiding fate, only raw and merciless destruction. Many Flame Chasers crossed lines Mei could never accept, committing experiments and sacrifices beyond redemption, yet none of them fought for themselves. They fought so that humanity, in any form, might survive. As Mei listens and learns, Elysia watches her closely, smiling as though reassured."
        },
        {
            id: 3,
            name: "Stage 3",
            background: "assets/images/background3.png",
            music: "assets/images/stage3.mp3",
            availablePlayers: ["Hua", "Felis", "Su", "Sakura", "Elysia"],
            zombieTarget: 20,
            zombieTypes: {
                "Zom1": { count: 10, appearFirst: 5 },
                "Zom2": { count: 10, appearLast: 5 }
            },
            story: "Knowledge alone is not enough to advance through the Elysian Realm, and Mei is soon required to prove herself. The Flame Chasers test her not as an enemy, but as a successor worthy of inheriting their legacy. Kalpas is the first to challenge her, his overwhelming fury a storm born from endless loss and war, caring nothing for Mei’s ideals or intentions, valuing only strength. Mei survives not by matching his hatred, but by standing firm in her resolve. Mobius follows, her trial even crueler, as she dissects Mei’s Herrscher powers, her body, and her willingness to abandon humanity for evolution. Despite knowing weakness may lead to failure, Mei refuses to cross that line. Then comes Aponia, whose trial is not one of combat but of fate itself. She shows Mei visions of Kiana’s death, of a ruined world, and of futures that end only in despair, urging her to accept destiny as inevitable. Mei refuses once more, declaring that if the future is doomed, she will defy it regardless. Only then does the Realm open its deeper layers to her, and only then does Elysia’s expression soften, as though a long-held worry has finally been eased."
        },
        {
            id: 4,
            name: "Stage 4",
            background: "assets/images/background4.png",
            music: "assets/images/stage4.mp3",
            availablePlayers: ["Hua", "Felis", "Su", "Sakura", "Elysia", "Griseo"],
            zombieTarget: 30,
            zombieTypes: {
                "Zom1": { count: 20, appearFirst: 5 },
                "Zom2": { count: 5, appearLast: 5 },
                "Zom3": { count: 5, appearLast: 5 }
            },
            story: "For a brief time, Mei leaves the Elysian Realm, and in the real world she encounters something ancient and malignant—the Will of Honkai. It marks her silently and without her awareness. When Mei returns to the Realm, the corruption follows. The Herrscher of Corruption descends, and the Elysian Realm, composed entirely of data—memories, personalities, and histories—becomes its perfect feeding ground. Flame Chasers begin to fall as data is erased, minds are twisted, and entire simulations collapse. The first to be corrupted is Elysia herself, and with her fall the truth can no longer remain hidden. Elysia was never merely human. She was born a Herrscher, not the thirteenth, for she existed before numbers were assigned—a Herrscher not of destruction, but of Human Ego. She chose to love humanity, chose to fight for it, and ultimately chose to die with it."
        },
        {
            id: 5,
            name: "Stage 5",
            background: "assets/images/background5.png",
            music: "assets/images/stage5.mp3",
            availablePlayers: ["Hua", "Felis", "Su", "Sakura", "Elysia", "Griseo", "Kevin"],
            zombieTarget: 30,
            zombieTypes: {
                "Zom1": { count: 15, appearFirst: 5 },
                "Zom2": { count: 10, appearLast: 5 },
                "Zom3": { count: 5, appearLast: 5 }
            },
            story: "One by one, the Flame Chasers make their final decision, sacrificing their remaining data, memories, and very existence to restore Elysia to her true form. What is reborn is not a weapon nor a god, but a will shaped by faith and love for humanity—Herrscher Elysia. Mei faces her not as an enemy, but as a witness, their clash driven not by victory but by understanding. As they fight, Elysia smiles, explaining why she chose to become a Herrscher who loved humans, why she altered something fundamental within the Honkai long ago, and why Herrschers in the Current Era are still able to retain their humanity. When her words are finished, she turns to the true enemy, the Herrscher of Corruption. Elysia does not simply defeat it; she deletes everything—the Realm, herself, the Flame Chasers, and every remaining trace of the dream—ensuring the corruption can never return. Thus, the Elysian Realm comes to an end."
        },
        {
            id: 6,
            name: "Stage 6",
            background: "assets/images/background6.png",
            music: "assets/images/stage6.mp3",
            availablePlayers: ["Hua", "Felis", "Su", "Sakura", "Elysia", "Griseo", "Kevin", "Kalpas"],
            zombieTarget: 35,
            zombieTypes: {
                "Zom1": { count: 15, appearFirst: 5 },
                "Zom2": { count: 15, appearLast: 5 },
                "Zom3": { count: 5, appearLast: 5 }
            },
            story: "Mei awakens in the real world to find that the Elysian Realm is gone, though its meaning endures. Kevin finally reveals the truth behind his decision: he did not send Mei there solely to gain power, but so that Elysia could see the future she had created—a future where Herrschers fight for humanity, where bonds are not abandoned, and where a girl like Mei is willing to challenge the end itself. Having fulfilled her role, Mei leaves World Serpent and returns to Kiana, to Bronya, and to her friends, carrying with her the legacy of a woman who loved humanity more than herself. The Herrscher of the End is approaching, but this time, humanity will not face it alone."
        }
    ],

    // Player configurations
    players: {
        "Hua": {
            name: "Hua",
            type: "Peashooter",
            cost: 70,
            health: 50,
            image: "assets/images/hua.png",
            description: "Shoots pea 1 per second",
            attackRate: 1000, // 1 shot per second
            attackDamage: 1,
            range: 12, // Full row
            projectileType: "pea",
            projectileSpeed: 300
        },
        "Felis": {
            name: "Felis",
            type: "Sunflower",
            cost: 25,
            health: 20,
            image: "assets/images/felis.png",
            description: "Produces 25 coins every 5 seconds",
            productionRate: 5000, // 5 seconds
            productionAmount: 25,
            attackRate: 0, // Doesn't attack
            attackDamage: 0
        },
        "Su": {
            name: "Su",
            type: "Wallnut",
            cost: 80,
            health: 100, // High health as it's a defensive unit
            image: "assets/images/su.png",
            description: "Defensive wall, survives 5 seconds against 1 zombie, 3 seconds against 2 zombies",
            attackRate: 0, // Doesn't attack
            attackDamage: 0
        },
        "Sakura": {
            name: "Sakura",
            type: "Snowpea",
            cost: 80,
            health: 50,
            image: "assets/images/sakura.png",
            description: "Doubles damage of peas and slows enemies",
            attackRate: 1000, // 1 shot per second
            attackDamage: 1,
            range: 12, // Full row
            projectileType: "snowpea",
            projectileSpeed: 300,
            slowEffect: 0.5 // 50% slow
        },
        "Elysia": {
            name: "Elysia",
            type: "Threepeater",
            cost: 90,
            health: 50,
            image: "assets/images/elysia.png",
            description: "Shoots peas in three directions",
            attackRate: 1000, // 1 shot per second
            attackDamage: 1,
            range: 12, // Full row
            projectileType: "triplepea",
            projectileSpeed: 300,
            attackPattern: "three" // Shoots in three rows
        },
        "Griseo": {
            name: "Griseo",
            type: "Torchwood",
            cost: 50,
            health: 20,
            image: "assets/images/griseo.png",
            description: "Triples damage of peas that pass through",
            attackRate: 0, // Doesn't attack directly
            attackDamage: 0,
            damageMultiplier: 3 // Doubles damage
        },
        "Kevin": {
            name: "Kevin",
            type: "Ice Shroom",
            cost: 100,
            health: 1,
            image: "assets/images/kevin.png",
            description: "Freezes all zombies on screen temporarily",
            attackRate: 0, // One-time use
            attackDamage: 0,
            freezeDuration: 5000, // 5 seconds
            isOneTimeUse: true
        },
        "Kalpas": {
            name: "Kalpas",
            type: "Cherry Bomb",
            cost: 100,
            health: 1,
            image: "assets/images/kalpas.png",
            description: "Explodes and damages all zombies in a 3x3 area",
            attackRate: 0, // One-time use
            attackDamage: 15, // High damage
            explosionRadius: 3, // 3x3 grid
            isOneTimeUse: true
        }
    },

    // Enemy configurations
    enemies: {
        "Zom1": {
            name: "Zom1",
            health: 10,
            damage: 1,
            speed: 1,
            image: "assets/images/zom1.png",
            size: 80
        },
        "Zom2": {
            name: "Zom2",
            health: 12,
            damage: 1,
            speed: 1,
            image: "assets/images/zom2.png",
            size: 100
        },
        "Zom3": {
            name: "Zom3",
            health: 15,
            damage: 2,
            speed: 0.5,
            image: "assets/images/zom3.png",
            size: 120
        }
    },

    // Projectile configurations
    projectiles: {
        "pea": {
            damage: 1,
            speed: 300, // pixels per second
            image: "assets/images/pea.png"
        },
        "snowpea": {
            damage: 2,
            speed: 300, // pixels per second
            image: "assets/images/snowpea.png",
            slowEffect: 0.5 // 50% slow
        },
        "firepea": {
            damage: 3,
            speed: 300, // pixels per second
            image: "assets/images/firepea.png"
        },
        "triplepea": {
            damage: 1,
            speed: 400,
            image: "assets/images/triple-pea.png"
        }
    }
};
