const axios = require('axios');
const cheerio = require('cheerio');
const validator = require('validator');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('instagram')
        .setDescription('Tải video từ Instagram và gửi lên kênh')
        .addStringOption(option =>
            option.setName('url')
            .setDescription('URL của video Instagram')
            .setRequired(true)
        ),
    async execute(interaction) {
        const url = interaction.options.getString('url');

        // Kiểm tra URL có hợp lệ hay không
        if (!validator.isURL(url)) {
            await interaction.reply({ content: 'Vui lòng cung cấp một URL hợp lệ.', ephemeral: true });
            return;
        }

        await interaction.deferReply(); // Phản hồi tạm thời để có thêm thời gian xử lý

        try {
            const videoLink = await getVideo(url);
            // Nếu tìm được videoLink, gửi nó đến người dùng
            if (videoLink) {
                const attachment = new AttachmentBuilder(videoLink, { name: 'video.mp4' });
                await interaction.followUp({ files: [attachment] });
            } else {
                // Nếu không tìm được videoLink, thông báo cho người dùng
                await interaction.followUp({ content: 'Không thể tìm thấy video hoặc video không thể truy cập.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'Có lỗi xảy ra trong quá trình tải video.', ephemeral: true });
        }
    },
};

const getVideo = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const videoLink = $('meta[property="og:video"]').attr('content');
        return videoLink;
    } catch (error) {
        console.error('Error fetching Instagram video:', error);
        return null;
    }
};
