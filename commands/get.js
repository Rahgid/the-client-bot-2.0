const { EmbedBuilder, SlashCommandBuilder, userMention } = require('discord.js');

const { randNum } = require('../shared_functions/rand.js');

const fs = require('node:fs');
const https = require("https");

// Get
const GET_EMBED_COLOR = 0xB4D9C6;

// Animal
const animals = {
	'Bear': 'https://i.imgur.com/hmWKwqD.png',
	'Dog': 'https://i.imgur.com/j3lOK4E.png',
	'Cat': 'https://i.imgur.com/tlA3rHB.png?1',
	'Snake': 'https://i.imgur.com/9ALxj1e.jpg',
	'Lion': 'https://i.imgur.com/Rx3c0cQ.png',
	'Turtle': 'https://i.imgur.com/GJO5vA4.jpg',
	'Horse': 'https://i.imgur.com/mGvDC5w.jpg',
	'Elephant': 'https://i.imgur.com/IDC8usv.png',
	'Bunny': 'https://i.imgur.com/8iSywST.png',
	'Bengal Tiger': 'https://i.imgur.com/UpofVoe.png',
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get')
		.setDescription('General command for getting things.')
		.addSubcommand(subcommand => subcommand
			.setName('animal')
			.setDescription('Get someone\'s spirit animal!')
			.addUserOption(option => option
				.setName('user')
				.setDescription('Spirit animal source (default you)!')))
		.addSubcommand(subcommand => subcommand
			.setName('kanye')
			.setDescription('Get a random Kanye West quote!'))
		.addSubcommand(subcommand => subcommand
			.setName('pun')
			.setDescription('Get a random pun!')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'animal') {
			// Default user: requestor
			let user = interaction.options.getUser('user');
			user = user ? user : interaction.user;

			const animalEntries = Object.entries(animals);

			const randAnimal = randNum(0, animalEntries.length - 1);

			const animalEmbed = new EmbedBuilder()
				.setColor(GET_EMBED_COLOR)
				.setTitle('Spirit Animal')
				.setDescription('Find out someone\'s spirit animal!')
				.addFields(
					{ name: 'Ran On:', value: `${ userMention(user.id) }`, inline: true },
					{ name: 'Result:', value: `${ animalEntries[randAnimal][0] }!`, inline: true },
				)
				.setImage(`${ animalEntries[randAnimal][1] }`);

			await interaction.reply({ embeds: [animalEmbed] });
		} else if (interaction.options.getSubcommand() === 'kanye') {
			https.get(`https://api.kanye.rest/`, (resp) => {
				let data = '';

				resp.on('data', (chunk) => {
					data += chunk;
				});

				resp.on('end', () => {
					console.log(JSON.parse(data));

					data = JSON.parse(data);

					if (Object.keys(data).length == 0) {
						interaction.reply("Sorry, no quote found.");
					} else {
						const kanyeEmbed = new EmbedBuilder()
							.setColor(GET_EMBED_COLOR)
							.setTitle(' ')
							.setDescription(`${ data.quote }`)
							.setAuthor({ name: 'Kanye West', iconURL: 'https://i.imgur.com/HaLn7c9.png' });

						interaction.reply({ embeds: [kanyeEmbed] });
					}
				});
			}).on("error", (err) => {
				console.log("Error: " + err.message);
			});
		} else if (interaction.options.getSubcommand() === 'pun') {
			let data = "";
			let randChoice = 0;

			fs.readFile("data/puns.json", function read(err, fileData) {
				if (err) {
					console.log(err);
					return;
				}

				try {
					data = JSON.parse(fileData);
				} catch(err) {
					console.log(err);

					return;
				}

				if (!data.hasOwnProperty('puns')) {
					console.log("puns.json is missing 'puns' property :|");
					return;
				}

				randChoice = randNum(0, data.puns.length);
				console.log(data.puns.length);

				const punEmbed = new EmbedBuilder()
					.setColor(GET_EMBED_COLOR)
					.setTitle('Random Pun')
					.setDescription(`${ data.puns[randChoice] }`);

				interaction.reply({ embeds: [punEmbed] });
			});
		}
	},
};