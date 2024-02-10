const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Tìm kênh "welcome" trong guild mà thành viên mới tham gia
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'welcome');
        if (!welcomeChannel) return;

        // Gửi tin nhắn chào mừng đến kênh
        try {
            await welcomeChannel.send(`Chào mừng ${member} đến với máy chủ!`);
        } catch (error) {
            console.error(error);
        }
    },
};
