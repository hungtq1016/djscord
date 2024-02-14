const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Final fantasy 14 recipe item.')
        .addStringOption(option =>
            option.setName('item')
            .setDescription('Tên của vật phẩm')
            .setRequired(true)
        ),
    async execute(interaction) {
        // let page = interaction.options.getInteger('page') ?? 1;
        // let limit = interaction.options.getInteger('limit') ?? 5;
        let item = interaction.options.getString('item') ?? '';
        fetchItem(interaction,item)
    },
};

const fetchItem = async(interaction,item) => {
    try {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const response = await axios.get(`https://xivapi.com/search?string=${item}&indexes=Recipe`);
        const data = response.data.Results;

        if (!data || data.length === 0) {
            await interaction.editReply({ content: 'Không tìm thấy sản phẩm.' });
            return;
        }

        const promises = data.map(item => {
            if (item.Name) {
                const embed = new EmbedBuilder()
                .setColor(randomHexColor())
                .setTitle(item.Name)
                .setDescription(`ID: ${item.ID}`)
                .setImage(`https://xivapi.com${item.Icon}`);

                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`view_${item.Url}`) // Sử dụng ID sản phẩm để tạo customId duy nhất
                        .setLabel('🔍')
                        .setStyle(ButtonStyle.Primary),
                );
                return interaction.followUp({ embeds: [embed], components: [row] });
            }else{
                return interaction.followUp(`ID: ${item.ID} không tồn tại`);
            }
        });
        
        const navigationRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`page_${response.data.Pagination.PagePrev}`) // Đảm bảo số trang không nhỏ hơn 1
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(response.data.Pagination.PagePrev === null),
            new ButtonBuilder()
                .setCustomId(`page_${response.data.Pagination.PageNext}`) // Chuyển đến trang tiếp theo
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(response.data.Pagination.PageNext === null)
                // Disable nút nếu đang ở trang cuối cùng không được xác định trong ví dụ này
        );

        // Đảm bảo tất cả các tin nhắn được gửi trước khi tiếp tục
        await Promise.all(promises);

        await interaction.followUp({ components: [navigationRow] });

    } catch (error) {
        console.error(error);
        // Sử dụng editReply hoặc followUp tùy thuộc vào trạng thái của interaction
        if (!interaction.deferred && !interaction.replied) {
            await interaction.editReply({ content: 'Có lỗi xảy ra khi lấy dữ liệu sản phẩm.' });
        } else {
            await interaction.followUp({ content: 'Có lỗi xảy ra khi lấy dữ liệu sản phẩm.', ephemeral: true });
        }
    }
}

function randomHexColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}