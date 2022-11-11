/* eslint-disable */
const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const users = require('../db/users')
const shop = require('../settings/currency').shop
module.exports = class currency {
    
    constructor(options) {
        this.userId = options?.userId

    }

    getItemValue(item, amount) {
        const foundItem = shop[item]
        if(!foundItem) throw new Error('Invalid item')
        return shop[item] * Number(amount)
    }

    async addInv(item, amount) {
        amount = Number(amount)
        const user = await this.findOrCreate()
        let foundItem = user.inventory.find(a => a.name.toLowerCase() == item)
        if(foundItem) {
            user.inventory.pull(foundItem)
            foundItem.amount = Number(foundItem.amount) + Number(amount)
            user.inventory.push(foundItem)
        }
        else {
            user.inventory.push({ name : item, amount })
        }
        await user.save()
        return user
    }

    async getInv() {
        const user = await this.findOrCreate()
        return user.inventory
    }

    async getLb() {
        const data = await users.find().sort({ coins : -1 }).limit(10)
        return data
    }

    async findOrCreate() {
        const userId = this.userId
        let foundUser = await users.findOne({ userId })
        if(!foundUser) {
            foundUser = new users({ userId })
            await foundUser.save()
        }
        return foundUser;
    }

    async getBalance() {
        const user = await this.findOrCreate()
        return user.coins
    }

    async addCoins(amount) {
        const user = await this.findOrCreate()
        user.coins = user.coins + amount
        await user.save()
        return user.coins
    }

    async removeCoins(amount) {
        const user = await this.findOrCreate()
        user.coins = user.coins - amount
        await user.save()
        return user.coins
    }

}