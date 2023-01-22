const { EmbedBuilder, SlashCommandBuilder, userMention } = require('discord.js');

const { randNum } = require('../shared_functions/rand.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chaddar')
		.setDescription('Detects specified user\'s percentage of chad.')
		.addUserOption(option => option
			.setName('user')
			.setDescription('Potential chad.')
			.setRequired(true)),
	async execute(interaction) {
		const chadness = randNum(0, 100);

		const chadEmbed = new EmbedBuilder()
			.setColor(0xF53BB4)
			.setTitle('Chad Meter')
			.setDescription('Look out for chads!')
			.addFields(
				{
					name: 'Ran On:',
					value: 
						`${ userMention(
								interaction.options.getUser('user').id) }`,
					inline: true
				},
				{ name: 'Status:', value: `${ chadness }% Chad`, inline: true },
			)

		await interaction.reply({ embeds: [chadEmbed] });
	},
};