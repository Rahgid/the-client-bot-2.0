const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('beep')
		.setDescription('beep boop!!!!!!'),
	async execute(interaction) {
		await interaction.reply('boop!');
	},
};