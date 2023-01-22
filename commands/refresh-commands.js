const { SlashCommandBuilder } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { clientId, guildId, token, developerId } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('refresh')
		.setDescription('Registers application commands.'),
	async execute(interaction) {
		if (interaction.user.id != developerId) {
			await interaction.reply({
				content: "You don't have permissions to run this command!",
				ephemeral: true
			});
			return;
		}

		const commands = [];
		const commandsPath = path.join(__dirname, './');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			commands.push(command.data.toJSON());
		}

		const rest = new REST({ version: '10' }).setToken(token);

		rest.put(Routes.applicationCommands(clientId), { body: commands })
			.then(() => console.log('Successfully registered application commands.'))
			.catch(console.error);

		await interaction.reply({
			content: 'Registered commands.',
			ephemeral: true
		});
	},
};