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
                    const prefix = interaction.customId.split('_')[1]; // Lấy ID sản phẩm từ customId của nút

                    try {
                        const url = `https://xivapi.com${prefix}`
                        const isRecipe = findWord('recipe', url.toLowerCase())
                        // Gọi API để lấy thông tin chi tiết sản phẩm dựa trên url
                        const response = await axios.get(url);
                        const item = response.data; // Giả sử API trả về dữ liệu chi tiết sản phẩm
                        if (isRecipe) {
                            function convertRecipe(recipe) {
                                const convertedRecipe = {
                                    Name: recipe.Name,
                                    Url: recipe.Url,
                                    Icon:recipe.Icon,
                                    Materials: filterObject(recipe),
                                    CanHq:recipe.CanHq,
                                    ClassJob:recipe.ClassJob
                                };
                            
                                return convertedRecipe;
                            }
                            
                            function filterObject(obj) {
                                const filteredProperties  = [];
                            
                                // Loop through the properties dynamically and push them into the array
                                for (let i = 0; i < 10; i++) {
                                    if (obj[`ItemIngredient${i}`]) {
                                        const sub = obj[`ItemIngredientRecipe${i}`] == null ? [] : obj[`ItemIngredientRecipe${i}`][0]
                                        const {CanHq,Url,ClassJob} = sub
                                        const amount = obj[`AmountIngredient${i}`]
                                        const { Name, Icon} = obj[`ItemIngredient${i}`];
                                        filteredProperties.push({ Name, Url, Icon,Amount:amount,Materials:filterObject(sub),CanHq,ClassJob });
                                    }
                                }
                            
                                return filteredProperties .length > 0 ? filteredProperties  : [];
                            }
                            
                            // Convert the recipe
                            const convertedRecipe = convertRecipe(item);

                            async function createEmbedsAndSend(interaction, material, parentName = '') {
                                if (!interaction.deferred && !interaction.replied) {
                                    await interaction.deferReply({ ephemeral: true });
                                }
                                // Create an embed for the current material
                                const embed = new EmbedBuilder()
                                    .setColor('#0099ff')
                                    .setTitle(`${parentName ? `${parentName} -> ` : ''}${material.Name}`)
                                    .setURL(`https://xivapi.com${material.Url}`)
                                    .setDescription(`Amount: ${material.Amount}`)
                                    .setImage(`https://xivapi.com${material.Icon}`)
                                    .setFooter({ text: material.Name});

                                // Add fields for material properties if they exist
                                if (material.CanHq) {
                                    embed.addFields({ name: 'High Quality', value: String(Boolean(material.CanHq)), inline: true });
                                }
                            
                                if (material.ClassJob && material.ClassJob.Abbreviation) {
                                    embed.addFields({ name: 'Class/Job', value: material.ClassJob.Abbreviation + ' / ' + material.ClassJob.NameEnglish, inline: true });
                                    embed.setThumbnail('https://xivapi.com'+ material.ClassJob?.Icon);

                                }
                            
                                // Send the embed to the channel
                                interaction.followUp({ embeds: [embed], ephemeral: true });
                            
                                // Recursively create embeds for nested materials, if any
                                if (material.Materials && material.Materials.length > 0) {
                                    material.Materials.forEach(nestedMaterial => {
                                        createEmbedsAndSend(interaction, nestedMaterial, material.Name);
                                    });
                                }
                            }
                            await createEmbedsAndSend(interaction, convertedRecipe);

                        }else{
                            // Tạo embed mới với thông tin chi tiết sản phẩm
                            const itemEmbed = new EmbedBuilder()
                            .setColor('#0099ff') // Thiết lập màu sắc cho Embed
                            .setTitle(item.Name) // Sử dụng tên item làm tiêu đề
                            .setImage(`https://xivapi.com${item.IconHD}`)
                            .setDescription(item.Description) // Thêm mô tả item
                            .setThumbnail(`https://xivapi.com${item.Icon}`) // Đặt hình ảnh thumbnail bằng cách sử dụng URL Icon
                            .setDescription(item.Description_en || 'Item Description')
                            .addFields({
                                "name": "Level",
                                "value": "DEVELOPING",
                                "inline": true
                            })
                            await interaction.reply({ embeds: [itemEmbed], ephemeral: true });
                        }
                        

                        // Gửi embed với thông tin chi tiết sản phẩm
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

function findWord(word, str) {
    return RegExp('\\b'+ word +'\\b').test(str)
}