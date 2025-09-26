module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    // Logs simples (optionnels)
    console.log(`[LEAVE] ${member.user?.tag || member.id} a quitté ${member.guild.name}`);
  }
};
