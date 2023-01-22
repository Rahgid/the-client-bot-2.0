const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { clientId, token, developerId } = require('../config.json');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(token);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Deletes a specific global command.')
		.addStringOption(option =>
			option.setName('command_id')
				.setDescription('The global command to delete.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ADMINISTRATOR),
	async execute(interaction) {
		if (interaction.user.id != developerId) {
			await interaction.reply({
				content: "You don't have permissions to run this command!",
				ephemeral: true
			});
			return;
		}
		
		const str = interaction.options.getString('command_id');
		console.log(parseInt(str));
		await interaction.reply({ content: 'Trying to delete command id ' + str + '...', ephemeral: true });

		rest.delete(Routes.applicationCommand(clientId, str))
			.then(() => {
					console.log('Successfully deleted application command')
					interaction.followUp({ content: 'Deleted command ' + str, ephemeral: true })
				})
			.catch(console.error);
	},
};