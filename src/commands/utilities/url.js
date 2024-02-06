const { SlashCommandBuilder } = require('discord.js');
const validator = require('validator');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('url') // Đặt tên cho câu lệnh
    .setDescription('Lấy thông tin từ một URL') // Đặt mô tả cho câu lệnh
    .addStringOption(option => 
        option.setName('url') // Đặt tên cho tùy chọn
        .setDescription('Nhập URL cần lấy thông tin') // Đặt mô tả cho tùy chọn
        .setRequired(true) // Đặt tùy chọn này là bắt buộc
    ),
		async execute(interaction) {
			if (!interaction.isCommand()) return;

		if (interaction.commandName === 'url') {
			const url = interaction.options.getString('url');
			if (!validator.isURL(url)) {
				await interaction.reply({ content: 'URL không hợp lệ!', ephemeral: true });
				return;
			}
			console.log(url)
			await interaction.reply(url);
		}
	},
};