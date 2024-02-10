const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Tải video từ YouTube và gửi lên kênh')
        .addStringOption(option =>
            option.setName('url')
            .setDescription('URL của video YouTube')
            .setRequired(true)
        ),
    async execute(interaction) {
        const url = interaction.options.getString('url');
        
        // Kiểm tra URL có hợp lệ hay không
        if (!ytdl.validateURL(url)) {
            await interaction.reply({ content: 'Vui lòng cung cấp một URL YouTube hợp lệ.', ephemeral: true });
            return;
        }

        await interaction.deferReply(); // Phản hồi tạm thời để có thêm thời gian xử lý

        const tempPath = path.join(__dirname, `temp_video.mp4`);

        try {
            const stream = ytdl(url, { quality: 'highestvideo' });
            const writer = stream.pipe(fs.createWriteStream(tempPath));

            writer.on('finish', async () => {
                const attachment = new AttachmentBuilder(tempPath);
                await interaction.followUp({ files: [attachment] }).then(() => {
                    // Xóa file sau khi đã gửi lên
                    fs.unlink(tempPath, (err) => {
                        if (err) {
                            console.error(`Không thể xóa file tạm: ${err}`);
                        } else {
                            console.log('File tạm đã được xóa thành công.');
                        }
                    });
                });
            });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'Có lỗi xảy ra trong quá trình tải video.', ephemeral: true });
        }
    },
};
