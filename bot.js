const Discord = require('discord.js');
const bot = new Discord.Client();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'discord 27.03',
});

connection.connect(function (err) {
    if (err) {
    	console.log("[MYSQL] Не удалось подключиться к базе данных.")
    	process.exit(626);
    	return
    }
    console.log('[MYSQL] Вы успешно подключились к базе данных.')
    connection.query("SET SESSION wait_timeout = 604800");
    connection.query("SET NAMES utf8mb4");
});

bot.on('ready', () => {
    console.log("Бот был успешно запущен!");
});

const token = process.env.DJS_TOKEN
const logChannelID = "827551176589443102"

bot.on('message', async message => {
	if (message.content.startsWith("/score")) {
		message.delete()
		const args = message.content.slice(`/score`).split(/ +/);
		
		if (args.length < 3) return message.reply("вы неверно указали аргументы. /score <faction> <type> <get/set> <count> <reason>")

		let faction = args[1].toLowerCase()
		let type = args[2].toLowerCase()
		let action = args[3].toLowerCase()


		if (faction != "army" && faction != "lssd" && faction != "lspd" && faction != "fib" && faction != "gov" && faction != "saspa") return message.reply("вы указали неверный отдел.")
		if (type != "mp" && type != "gis") return message.reply("вы указали неверный тип.")
		if (action != "get" && action != "set") return message.reply("вы указали неверное действие.")

		if (action == "set") {
			if (args.length != 6) return message.reply("вы неверно указали аргументы. /score <faction> <type> <get/set> <count> <reason>")
			let count = args[4]
			let reason = args[5]
			let log_channel = message.guild.channels.cache.get(logChannelID)

			connection.query(`SELECT * FROM \`scores\` WHERE \`type\` = '${type}' AND \`name\` = '${faction}'`, async (error, answer) => {
				if (error) return console.log(error)

				let all_balls = parseInt(answer[0].balls) + parseInt(count) 

				connection.query(`UPDATE \`scores\` SET \`balls\` = \`balls\` + ${count} WHERE \`type\` = '${type}' AND \`name\` = '${faction}'`)
				message.reply(`вы успешно выдали \`${count}\` баллов для \`${faction.toUpperCase()}\`, тип \`${type.toUpperCase()}\`.`)
				const embed = new Discord.MessageEmbed()
		            .setColor(65425)
		            .setTitle(`**Отдел: ${faction.toUpperCase()}**🥇`)
		            .setTimestamp()
		            .setDescription(`Получает ${count} баллов. ☑️\n**Причина:**\n${reason}\n**Итого:**\n${all_balls.toString()} баллов.`)
				log_channel.send(embed)
			})	
		}
		else if (action == "get") {
			if (args.length != 4) return message.reply("вы неверно указали аргументы. /score <faction> <type> <get/set>")
			connection.query(`SELECT * FROM \`scores\` WHERE \`type\` = '${type}' AND \`name\` = '${faction}'`, async (error, answer) => {
				if (error) return console.log(error)
				if (answer.length == 0) return message.reply("данные не были найдены. Обратитесь к разработчику.")
					
				message.reply(`у \`${faction.toUpperCase()}\`, тип \`${type.toUpperCase()}\` - \`${answer[0].balls}\` баллов.`)
			})
		}
	}
})

bot.login(process.env.BOT_TOKEN)
