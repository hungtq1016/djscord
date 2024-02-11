const { Client, REST, Routes, GatewayIntentBits } = require('discord.js');
// const { clientId, token } = require('../config.json');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();
const token = process.env.DISCORD_TOKEN
const clientId = process.env.CLIENT_ID

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Tải lệnh từ các file
async function loadCommands() {
    const commands = [];
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    return commands;
}

// Đăng ký lệnh cho tất cả guilds
async function registerCommands(commands) {
    const rest = new REST().setToken(token);

    // Chờ bot sẵn sàng để lấy danh sách guildIds
    await client.login(token);
    const guildIds = client.guilds.cache.map(guild => guild.id);

    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Dùng Promise.all để đăng ký lệnh song song
    await Promise.all(guildIds.map(guildId => {
        return rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
            .then(() => console.log(`Successfully reloaded application (/) commands for guild ${guildId}.`))
            .catch(console.error);
    }));
}

(async () => {
    try {
        const commands = await loadCommands();
        await registerCommands(commands);
    } catch (error) {
        console.error(error);
    }
})();
