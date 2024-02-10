const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const votedUsers = new Set();
const emoji = [
    ["697000880997793812", "697000745970696292"],
    ["977206161705152572", "977206162019737650"],
    ["1090001198221889627", "1090001288768520285"],
];

function createVotingRow() {
    let randNum = Math.floor(Math.random() * 3);
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('yes').setEmoji(emoji[randNum][0]).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('no').setEmoji(emoji[randNum][1]).setStyle(ButtonStyle.Secondary)
        );
}

function getResultMessage(results) {
    if (results.yes > results.no) return 'Kết quả: Có';
    return 'Kết quả: Không';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Tạo một cuộc bình chọn với các nút Có và Không')
        .addStringOption(option => option.setName('content').setDescription('Nhập nội dung cần lấy thông tin').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('Thời lượng của cuộc bình chọn (từ 1 phút đến 360 phút)').setRequired(false)),
    async execute(interaction) {
        const content = interaction.options.getString('content');
        let duration = interaction.options.getInteger('duration');

        if (!duration || duration < 1 || duration > 360) {
            duration = 5; // Đặt mặc định là 5 phút
        }

        const durationMs = duration * 60 * 1000;
        const endTime = new Date(Date.now() + durationMs);
        // Định dạng thời gian kết thúc
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const date = endTime.toLocaleDateString('vi-VN', dateOptions);
        const time = endTime.toLocaleTimeString('vi-VN', timeOptions);

        
        // Tạo Embed
        const embed = new EmbedBuilder()
            .setTitle('Cuộc Bình Chọn')
            .setDescription(content)
            .addFields({ name: 'Thời gian kết thúc', value: `Ngày: ${date}, Thời gian: ${time}.` })
            .setColor(0x00AE86); // Màu xanh lá

        var message = await interaction.reply({
            embeds: [embed],
            components: [createVotingRow()],
        });

        setTimeout(() => message.deletable && message.delete().catch(console.error), durationMs);

        const results = { yes: 0, no: 0 };
        const filter = i => ['yes', 'no'].includes(i.customId) && i.message.interaction.id === interaction.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: durationMs });

        collector.on('collect', async i => {
            if (votedUsers.has(i.user.id)) {
                return i.reply({ content: 'Bạn đã bình chọn và không thể bình chọn lại.', ephemeral: true });
            }
            results[i.customId]++;
            votedUsers.add(i.user.id);
            i.reply({ content: `Bạn đã chọn "${i.customId === 'yes' ? 'Có' : 'Không'}".`, ephemeral: true });
        });

       // Khi collector kết thúc
        collector.on('end', async () => {
            let resultEmbed = new EmbedBuilder(); // Tạo một Embed mới

            if (results.yes === 0 && results.no === 0) {
                // Trường hợp không ai bình chọn
                resultEmbed
                    .setColor(0xffff00) // Đặt màu vàng cho trường hợp này
                    .setTitle('Cuộc Bình Chọn Bị Hủy')
                    .setDescription('Không có phiếu bầu nào được ghi nhận. Cuộc bình chọn đã bị hủy.');
            } else {
                // Trường hợp có ít nhất một phiếu bầu
                const color = results.yes > results.no ? 0x00ff00 : 0xff0000
                resultEmbed
                    .setColor(color) // Đặt màu xanh lá cây cho trường hợp này
                    .setTitle('Kết Quả Cuộc Bình Chọn')
                    .setDescription(`Cuộc bình chọn cho: **${content}**`)
                    .addFields(
                        { name: 'Có', value: `${results.yes}`, inline: true },
                        { name: 'Không', value: `${results.no}`, inline: true }
                    )
                    .setFooter({ text: getResultMessage(results) }); // Sử dụng hàm getResultMessage để lấy tin nhắn kết quả
            }

            // Sử dụng followUp để gửi Embed
            await interaction.followUp({ embeds: [resultEmbed] });
        });

    }
};
