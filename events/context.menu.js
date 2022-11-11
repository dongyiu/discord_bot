const client = require("../trade");
client.on('interactionCreate', async (interaction) => {
    if (interaction.isUserContextMenu()) {
        await interaction.deferReply({ ephemeral: true });
        const user = interaction.user.id
        if(client.shutup.has(user)) {
            client.shutup.delete(user)
            await interaction.editReply('done.')
        }
        else {
            client.shutup.set(user)
            await interaction.editReply(`${user} has been silenced !`)
        }
    }
})

