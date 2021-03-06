const Discord = require("discord.js");
const { prefix } = require("./config.json");
require("dotenv").config();
const ytdl = require("ytdl-core");
const youtubesearchapi = require("youtube-search-api");
const { DiscordTogether } = require("discord-together");
const client = new Discord.Client();
client.discordTogether = new DiscordTogether(client);

const queue = new Map();

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    play(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}yt`)) {
    youtube(message);
    return;
  } else if (message.content.startsWith(`${prefix}chess`)) {
    chess(message);
    return;
  } else if (message.content.startsWith(`${prefix}poker`)) {
    poker(message);
    return;
  } else if (message.content.startsWith(`${prefix}betrayal`)) {
    betrayal(message);
    return;
  } else if (message.content.startsWith(`${prefix}fishing`)) {
    fishing(message);
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});
async function youtube(message) {
  if (message.member.voice.channel) {
    invite = await client.discordTogether.createTogetherCode(
      message.member.voice.channel.id,
      "youtube"
    );
    return message.channel.send(`${invite.code}`);
  } else {
    return message.channel.send(
      "You need to be in a voice channel to play Youtube!"
    );
  }
}
async function chess(message) {
  if (message.member.voice.channel) {
    invite = await client.discordTogether.createTogetherCode(
      message.member.voice.channel.id,
      "chess"
    );
    return message.channel.send(`${invite.code}`);
  } else {
    return message.channel.send(
      "You need to be in a voice channel to play Chess!"
    );
  }
}
async function poker(message) {
  if (message.member.voice.channel) {
    invite = await client.discordTogether.createTogetherCode(
      message.member.voice.channel.id,
      "poker"
    );
    return message.channel.send(`${invite.code}`);
  } else {
    return message.channel.send(
      "You need to be in a voice channel to play Poker!"
    );
  }
}
async function betrayal(message) {
  if (message.member.voice.channel) {
    invite = await client.discordTogether.createTogetherCode(
      message.member.voice.channel.id,
      "betrayal"
    );
    return message.channel.send(`${invite.code}`);
  } else {
    return message.channel.send(
      "You need to be in a voice channel to play Betrayal!"
    );
  }
}
async function fishing(message) {
  if (message.member.voice.channel) {
    invite = await client.discordTogether.createTogetherCode(
      message.member.voice.channel.id,
      "fishing"
    );
    return message.channel.send(`${invite.code}`);
  } else {
    return message.channel.send(
      "You need to be in a voice channel to play Fishing!"
    );
  }
}
async function play(message, serverQueue) {
  const args = message.content.split(" ");
  console.log(message.client.user);
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play Music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }
  var keyword = "";
  for (i = 1; i < args.length; i++) {
    var keyword = keyword + " " + args[i];
  }

  const songData = await youtubesearchapi.GetListByKeyword(keyword, [false]);
  const songInfo = songData.items[0];
  const song = {
    title: songInfo.title,
    url: "https://www.youtube.com/watch?v=" + songInfo.id,
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );

  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(
    `Started playing: **${song.title}**`
  );
}

client.login(process.env.TOKEN);
