const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const { randNum } = require('../shared_functions/rand.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a die.')
		.addIntegerOption(option =>
			option.setName('sides')
				  .setDescription('Number of sides on the die (default 6).')
				  .setMinValue(2)),
	async execute(interaction) {
		let sides = interaction.options.getInteger('sides');
		sides = sides ? sides : 6;

		const dieEmbed = 
					new EmbedBuilder()
						.setColor(0xBBBBFF)
						.setTitle('Roll a Die')
						.setDescription('Try rolling a die!')
						.addFields(
							{ name: 'Result:', value: `${ randNum(1, sides) }`, inline: true },
						)
						.setFooter({ text: `Roll result of a die with ${ sides } sides...` });

		await interaction.reply({ embeds: [dieEmbed] });
	},
};