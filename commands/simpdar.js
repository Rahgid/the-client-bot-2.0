const { EmbedBuilder, SlashCommandBuilder, userMention } = require('discord.js');

const { randNum } = require('../shared_functions/rand.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('simpdar')
		.setDescription('Detects specified user\'s percentage of simp.')
		.addUserOption(option => option
			.setName('user')
			.setDescription('Potential simp.')
			.setRequired(true)),
	async execute(interaction) {
		const simpness = randNum(0, 100);

		const simpEmbed = new EmbedBuilder()
			.setColor(0xF53BB4)
			.setTitle('Simp Meter')
			.setDescription('Look out for simps!')
			.addFields(
				{
					name: 'Ran On:',
					value: 
						`${ userMention(
								interaction.options.getUser('user').id) }`,
					inline: true
				},
				{ name: 'Status:', value: `${ simpness }% Simp`, inline: true },
			)

		await interaction.reply({ embeds: [simpEmbed] });
	},
};