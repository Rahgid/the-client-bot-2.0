const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { randNum } = require('../shared_functions/rand.js');

const https = require("https");
const cheerio = require("cheerio");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rhyme')
		.setDescription('Attempts to return a rhyme.')
		.addStringOption(option =>
			option.setName('word')
				.setDescription('A word you want to rhyme.')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();

		const options = {
			hostname: "rhymezone.com",
			port: 443,
			path: `/r/rhyme.cgi?Word=${interaction.options.getString('word')}&typeofrhyme=perfect&org1=syl&org2=l&org3=y`,
			method: "GET"
		}

		const req = https.request(options,
			async function(res) {
				console.log(`statusCode: ${res.statusCode}`);

				let rhymes = [];

				let rhymePromises = [];

				let rhymeParentPromise = new Promise((parentResolve, parentReject) => {
					res.on("data", async function (d) {
						let rhymePromise = new Promise((resolve, reject) => {
							const $ = cheerio.load(d);

							console.log("SGFKJDSFGKSJDFGKLJDSFLKGJFDSKLGJFSDLKGFDSJLGK");
							console.log($.html($(".r")));

							const htmlData = $.html($(".r")); // get elements with class "r"

							let reg = /(d=[^-][a-zA-Z_-]+)/g;
							let result;

							/*
								Using variables and setting the "lastNode" in this loop at the end while
								beforehand checking it against the "firstNode" that I set at the beginning
								of the loop, I can find a way to check if the lastNode is larger/more syllables
								than the firstNode of the next loop's iteration (mainly for when data is called
								again). This way, I can prevent "almost rhymes" from being displayed.
								There are also other ways to do this, but it is not yet implemented.
								I also may consider displaying them if no "perfect" rhymes are displayed.
							*/

							while ((result = reg.exec(htmlData)) !== null) {
								rhymes.push(result[0].substr(2));
							}

							resolve(rhymes);
						});

						let re = await rhymePromise;

						rhymePromise.then(function(rhymeArray) {
							rhymePromises.push(rhymePromise);
						}).catch(reason => {
							console.log("rejected promise: " + reason);
						});
					});

					let rhymePromiseLength = rhymePromises.length;
					let currRhymePromiseLength = rhymePromiseLength;

					setTimeout(() => {
						console.log("dfklsdfsdf")
						do {
							currRhymePromiseLength = rhymePromiseLength;
							setTimeout(() => console.log("testdfsdfdsf"), 0);
							console.log("this happened");
						} while (currRhymePromiseLength < rhymePromiseLength)

						parentResolve();
					}, 200);
				});

				rhymePromises.push(rhymeParentPromise);

				let re2 = await rhymeParentPromise;

				console.log("awaited2");

				Promise.all(rhymePromises).then(values => {
					let rhymeChoiceNum = randNum(0, rhymes.length);
					console.log(rhymeChoiceNum);
					let rhymeChoice = rhymes[rhymeChoiceNum]; // to-do: add check to see if rhyme exists & if there are results
					console.log(rhymeChoice);

					let quickMatch = /[_]+/g;

					rhymeChoice = rhymeChoice.replace(quickMatch, " ");

					if (rhymeChoice.length > 0) {
						const newEmbed = 
							new EmbedBuilder()
								.setColor(0xFF6A4A)
								.setTitle('Rhyme Request')
								.setDescription('Try rhyming a word!')
								.addFields(
									{ name: 'Result:', value: rhymeChoice, inline: true },
								)
								.setFooter({ text: `Rhyme for '${ interaction.options.getString('word') }'` });

						interaction.editReply({ embeds: [newEmbed] });
					} else {
						interaction.editReply("I can't rhyme that, man.");
					}
				}).catch(err => {
					console.log("rhyme promise parent error: " + err);
				});
			});

		req.on("error", error => {
			console.error(error);
		});

		req.end();


	},
};