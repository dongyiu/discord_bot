/* eslint-disable */
const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const db = require('../db/autoreact')
const perks = require('../settings/autoreact.json')
module.exports = class ar {
    
    constructor(options) {
        this.ar = options.ar
        this.userId = options.userId
    }

    checkPerks(roles) {
        if(this.getAr().length > this.getArAmount(roles)) return false
        return true
    }

    getArAmount(roles) {
        const allRoles = Object.keys(perks).filter(a => a!= 'default' && a != 'roles')
        let number = null
        allRoles.map(a => {
            if(roles.includes(a) && (perks[a] > number || number == null )) {
                number = perks[a]
            }
        })
        if(number == null && perks.roles.filter(a => roles.includes(a)).length) number = perks.default
        return number
    }

    getAr() {
        return this.ar.get(this.userId).autoreact
    }

    setAr(autoreact) {
        this.ar.get(this.userId).autoreact = autoreact
        this.editAr()
    }

    async editAr() {
        await db.updateOne({ userId : this.userId }, { $set : { autoreact : this.getAr() } })
    }

    checkCached() {
        return this.ar.get(this.userId)
    }

    async exist() {
        const foundUser = await db.findOne({ userId : this.userId })
        if(foundUser) return true
        return false
    }

    async cache() {
        let foundUser = await db.findOne({ userId : this.userId })
        if(!foundUser) {
            foundUser = new db({ userId : this.userId })
            await foundUser.save()
        }
        this.ar.set(this.userId, foundUser)
        return foundUser
    }


}
