require('dotenv').config();

module.exports = {
    sellRoles : [
        '816912860188901397',
        '816912891512750100',
        '816913074086477867',
        '816912629191671808',
        '816913048676990996',
        '816912806808649728'
      ],
    buyRoles : [
        '816913255225491497',
        '816913335395680267',
        '816913279511298048',
        '816913486101086218',
        '816913545199222815',
        '816913146782154813'
      ],
    cooldown : {
        default : 1 * 60 * 60 * 1000,
        perks : {
            "760909235319210014" : 45 * 60 * 1000,
            "796570190157840395" : 30 * 60 * 1000,
            "796570266426671166" : 15 * 60 * 1000,
        },
        bypass : {
            user : [],
            value : 30 * 60 * 1000,
        }
    },
    line : {
        default : 5,
        perks : {
            "760909235319210014" : 8,
            "796570190157840395" : 9,
            "796570266426671166" : 11,
            "796570649791168552" : 15,
        },
        bypass : {
            user : [],
            value : 11,
        }
    },
    ping : {
        default : 2,
        perks : {
            "796570190157840395" : 3,
            "796570266426671166" : 4,
        },
        bypass : {
            user : [],
            value : 11,
        }
    },
    autoPost : {
        default : 24 * 1 * 60 * 60 * 1000,
        perks : {
            "796570190157840395" : 4* 60 * 60 * 1000,
            "796570266426671166" : 3* 60 * 60 * 1000,
            "796570649791168552" : 2* 60 * 60 * 1000,
            "825107064740904961" : 1* 60 * 60 * 1000,
        },
        bypass : [],
    },
    sellChan : "719567940302929951",
    buyChan : "760637664088817675",
    premium : {
        roles : ['760909235319210014', '755894361564119182', '753420011586191461'],
        bypass : ['422967413295022080', '526344861239214090', '853224199380008972']
    },
    blacklistWord : [
        'gift 1 pet rock',
        'fag',
        'nudes',
        'dank memer can get your ip address',
        'horny',
        'n1gg',
        'nibba',
        'pedo',
        'dyke',
        'beaner',
        'kill yourself',
        'm.kiss',
        'f a g g o t',
        '@GIVE ME NITRO PLS ❤️ | hungry',
        'kike',
        'do not accept a friend request from',
        'my alt',
        'ching chong',
        'child porn',
        '🇳 🇮 🇬 🇬 🇪 🇷',
        'sped',
        'heil hitler',
        '422967413295022080>',
        'nigga',
        'chink',
        'banned for no reason',
        'n1gger',
        'niqqer',
        'a tard',
        'n1gga',
        'f4ggot',
        'n i g a',
        'n i g g e r',
        'n i b b a',
        '@GIVE ME NITRO PLS ❤️ | hungry',
        'nigger',
        'f4g',
        'u tard',
        'wetback',
        'n i g g a',
        '175 clay flynt',
        'join my server',
        'my other account',
        'give me nitro',
        'negger',
        'send this to as many discord servers as you can',
        'faggot',
        'dsof',
        'f@g',
        '175 Clay Flynt',
        'retard',
        'earape',
        'raping',
        'tag share',
        'i leave cs:go',
        'tag raw',
        'm!kiss',
        'nibber',
        'discord.gg',
        'https://'
      ],
}