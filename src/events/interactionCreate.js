const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        switch (true) {
            case interaction.isChatInputCommand():
                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                    }
                }
                break;

            case interaction.isButton():
                if (interaction.customId.startsWith('view_')) {
                    const productId = interaction.customId.split('_')[1]; // Lấy ID sản phẩm từ customId của nút

                    try {
                        // Gọi API để lấy thông tin chi tiết sản phẩm dựa trên productId
                        const response = await axios.get(`https://xivapi.com/item/${productId}`);
                        const item = response.data; // Giả sử API trả về dữ liệu chi tiết sản phẩm

                        // Tạo embed mới với thông tin chi tiết sản phẩm
						const itemEmbed = new EmbedBuilder()
						.setColor('#0099ff') // Thiết lập màu sắc cho Embed
						.setTitle(item.Name) // Sử dụng tên item làm tiêu đề
                        .setImage(`https://xivapi.com${item.IconHD}`)
						.setDescription(item.Description) // Thêm mô tả item
						.setThumbnail(`https://xivapi.com${item.Icon}`) // Đặt hình ảnh thumbnail bằng cách sử dụng URL Icon
						.addFields(
							{ name: 'Item Level', value: item.LevelItem.toString(), inline: true },
							{ name: 'Category', value: item.ItemUICategory.Name, inline: true },
							{ name: 'Average Price', value: `${item.PriceMid} Gil`, inline: true },
							{ name: 'Max Stack Size', value: item.StackSize.toString(), inline: true }
						);

                        // Gửi embed với thông tin chi tiết sản phẩm
                        await interaction.reply({ embeds: [itemEmbed], ephemeral: true });
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({ content: 'Có lỗi xảy ra khi lấy thông tin chi tiết sản phẩm.', ephemeral: true });
                    }
                }
                else{
                    if (interaction.customId.startsWith('page_')) {
                        const page = interaction.customId.split('_')[1]
                        if (!interaction.deferred && !interaction.replied) {
                            await interaction.deferReply();
                        }
                        await global.sendProductEmbeds(interaction,page)
                    }
                  
                }
                break;

            // Bạn có thể thêm nhiều case khác ở đây để xử lý các loại tương tác khác

            default:
                console.log('Tương tác không được xử lý.');
        }
    },
};
