const { SlashCommandBuilder } = require('discord.js');
var EorzeaTime = require('eorzea-time');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		try {
			// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		var eorzeaTime = new EorzeaTime();
		console.log(eorzeaTime.toString());
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
		} catch (error) {
			console.log(error)
		}
	},
};