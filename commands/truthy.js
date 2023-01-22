const { SlashCommandBuilder } = require('discord.js');

const { randNum } = require('../shared_functions/rand.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('truthy')
		.setDescription('Was that the truth?!'),
	async execute(interaction) {
		const randTruthy = randNum(0, 1);

		await interaction.reply('That was probably '
							   + (randTruthy ? 'a lie' : 'the truth') + '!');
	},
};