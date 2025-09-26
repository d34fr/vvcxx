module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    // Logs simples (optionnels)
    console.log(`[JOIN] ${member.user.tag} a rejoint ${member.guild.name}`);
  }
};
