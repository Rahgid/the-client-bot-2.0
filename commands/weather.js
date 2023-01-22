const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const fs = require('node:fs');
const https = require("https");

const { weatherKey } = require('../config.json');

function weatherNotCached(embed, url) {
	return new Promise((resolve, reject) => {
		https.get(`${url}`, (resp) => {
			let data = '';

			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				console.log("data was cached, calling weather func now.")
				resolve(weatherData(embed, data, /*cached=*/false));
			});
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	});
}

function weatherData(embed, data, cached=true) {
	console.log(JSON.parse(data));

	data = JSON.parse(data);

	if (Object.keys(data).length == 0) {
		embed.addFields(
			{ name: 'Result:', value: 'Sorry, no weather info found.', inline: true},
		);
	} else {
		if (data.hasOwnProperty('weather')) {
			if (data.weather.hasOwnProperty(0)) {
				if (data.weather[0].hasOwnProperty('main')) {
					if (data.weather[0].hasOwnProperty('description')) {
						embed.addFields(
							{ name: `Type`, value: `${ data.weather[0].main }`, inline: true },
							{ name: `Description`, value: `${ data.weather[0].description }`, inline: true },
						);

						embed.addFields(
							{ name: ' ', value: ' ' },
						);
					}
				}
			}
		}

		if (data.hasOwnProperty('main')) {
			let propertyCount = 0;

			if (data.main.hasOwnProperty('temp')) {
				embed.addFields(
					{ name: 'Temp', value: `${ data.main.temp }°F`, inline: true },
				);
				propertyCount++;
			}

			if (data.main.hasOwnProperty('feels_like')) {
				embed.addFields(
					{ name: 'Feels Like', value: `${ data.main.feels_like }°F`, inline: true },
				);
				propertyCount++;
			}

			if (data.main.hasOwnProperty('humidity')) {
				embed.addFields(
					{ name: 'Humidity', value: `${ data.main.humidity }%`, inline: true },
				);
				propertyCount++;
			}

			if (propertyCount > 0) {
				embed.addFields(
					{ name: ' ', value: ' ' },
				);
			}
		}

		if (data.hasOwnProperty('wind')) {
			let hasWind = false;

			if (data.wind.hasOwnProperty('speed')) {
				hasWind = true;
				embed.addFields(
					{ name: 'Wind Speed', value: `${ data.wind.speed } mph`, inline: true },
				);
			}

			if (data.wind.hasOwnProperty('deg')) {
				let windString = '';

				if (!hasWind)
					windString += 'Wind '

				embed.addFields(
					{ name: `${ windString }Direction`, value: `${ data.wind.deg }°`, inline: true },
				);

				hasWind = true;
			}

			if (data.wind.hasOwnProperty('gust')) {
				let windString = '';

				if (!hasWind)
					windString += 'Wind '

				embed.addFields(
					{ name: `${ windString }Gusts`, value: `${ data.wind.gust } mph gusts`, inline: true },
				);
				
				hasWind = true;
			}

			if (!hasWind) {
				embed.addFields(
					{ name: 'Wind', value: 'None'},
				);
			}

			embed.addFields(
				{ name: ' ', value: ' ' },
			);
		}

		if (data.hasOwnProperty('clouds')) {
			if (data.clouds.hasOwnProperty('all')) {
				embed.addFields(
					{ name: 'Cloudy', value: `${ data.clouds.all }%` },
				);
			}
		}

		if (data.hasOwnProperty('rain')) {
			let propertyCount = 0;

			if (data.rain.hasOwnProperty('1h')) {
				embed.addFields(
					{ name: 'Rain volume, last hour', value: `${ data.rain['1h'] }mm`, inline: true },
				);

				propertyCount++;
			}

			if (data.rain.hasOwnProperty('3h')) {
				embed.addFields(
					{ name: 'Rain volume, last 3 hours', value: `${ data.rain['3h'] }mm`, inline: true },
				);

				propertyCount++;
			}

			if (propertyCount > 0) {
				embed.addFields(
					{ name: ' ', value: ' ' },
				);
			}
		}

		if (data.hasOwnProperty('snow')) {
			let propertyCount = 0;

			if (data.snow.hasOwnProperty('1h')) {
				embed.addFields(
					{ name: 'Snow volume, last hour', value: `${ data.snow['1h'] }mm`, inline: true },
				);

				propertyCount++;
			}

			if (data.snow.hasOwnProperty('3h')) {
				embed.addFields(
					{ name: 'Snow volume, last 3 hours', value: `${ data.snow['3h'] }mm`, inline: true },
				);

				propertyCount++;
			}

			if (propertyCount > 0) {
				embed.addFields(
					{ name: ' ', value: ' ' },
				);
			}
		}

		if (data.hasOwnProperty('dt')) {
			if (data.hasOwnProperty('timezone')) {
				let time = data.dt + data.timezone;

				let date = new Date(time * 1000); // convert seconds to ms

				let month = date.getMonth() + 1; // returns num 0-11
				let day = date.getDate();
				let year = date.getFullYear();
				let hours = date.getHours();
				let minutes = "0" + date.getMinutes();
				let seconds = "0" + date.getSeconds();

				let str = month + '/' + day + '/' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

				embed.setFooter({ text: `Generated: ${ str }` });
			}

			if (!cached) {
				fs.writeFile("data/uw_weather.json", JSON.stringify(data), (err) => {
					if (err) {
						console.log(err);
						return;
					}

					console.log("Weather info cached.");
				});
			}
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weather')
		.setDescription('Gets UNLV\'s current weather information.'),
	async execute(interaction) {
		let url = "https://api.openweathermap.org/data/2.5/weather?lat=36.1075&lon=-115.1435&units=imperial&appid=" + weatherKey;

		let cached = false;
		let data = '';

		let weatherEmbed = new EmbedBuilder()
							.setColor(0xDB330D)
							.setTitle('UNLV Campus Weather');

		// first check old request from file
		fs.readFile("data/uw_weather.json", async function read(err, fileData) {
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

			let halfHourSeconds = 30 * 60;

			if (data.hasOwnProperty('dt')) {
				if (((parseInt(data.dt) + halfHourSeconds) * 1000) > (new Date().getTime())) {
					cached = true;

					console.log("weather cached = true");

					weatherData(weatherEmbed, JSON.stringify(data));
				} else { console.log("weather cached = false"); }
			} else { console.log("no property dt in uw_weather.json"); }

			if (!cached) {
				await weatherNotCached(weatherEmbed, url);
			}

			await interaction.reply({ embeds: [weatherEmbed] });
		});
	},
};