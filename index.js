const { Client, GatewayIntentBits } = require("discord.js");
const {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState
} = require("@discordjs/voice");


// ==============================
// غيّر الثلاثة هذولا فقط
// ==============================

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

// ==============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});


async function joinAFKChannel() {

    try {

        const guild = await client.guilds.fetch(GUILD_ID);
        const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);

        if (!channel) {
            console.log("❌ ما لقيت الروم.");
            return;
        }

        if (!channel.isVoiceBased()) {
            console.log("❌ هذا مو روم صوتي.");
            return;
        }

        console.log(`🔄 جاري الدخول إلى: ${channel.name}`);

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,

            selfMute: true,
            selfDeaf: true
        });


        await entersState(
            connection,
            VoiceConnectionStatus.Ready,
            30000
        );


        console.log(`✅ دخل الروم: ${channel.name}`);
        console.log("😴 البوت AFK الآن.");


        connection.on(
            VoiceConnectionStatus.Disconnected,
            async () => {
                    
                console.log("⚠️ انقطع الاتصال.");
                        
                try {

                    await Promise.race([

                        entersState(
                            connection,
                            VoiceConnectionStatus.Signalling,
                            5000
                        ),

                        entersState(
                            connection,
                            VoiceConnectionStatus.Connecting,
                            5000
                        )

                    ]);

                    console.log("🔄 جاري إعادة الاتصال...");

                } catch {

                    console.log("❌ فشل الاتصال، بحاول أدخل مرة ثانية.");

                    connection.destroy();

                    setTimeout(() => {
                        joinAFKChannel();
                    }, 5000);

                }
            }
        );


    } catch (error) {

        console.log("❌ صار خطأ:");
        console.error(error);

    }
}


client.once("ready", () => {

    console.log("");
    console.log("===============================");
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log("===============================");
    console.log("");

    joinAFKChannel();

});


client.login(TOKEN);
