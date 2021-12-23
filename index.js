//-------------------ALL OF THE INTEGERS--------------------\\
const config = require("./config.json");
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const mysql = require("mysql");
var sql = {};
const fs = require('fs');

const SESSION_FILE_PATH = './session.json';
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}
const client = new Client({
    session: sessionData
});
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});
var con = mysql.createConnection({
    host: config.Sql["host"],
    user: config.Sql["user"],
    password: config.Sql["password"],
    database: config.Sql["database"]
});
//----------------------EVENTS-------------------------\\
var MyDateString;
var MyDate = new Date();
var MyDateString;
        MyDateString = MyDate.getFullYear()+ '-'
                 + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
                 + ('0' + MyDate.getDate()).slice(-2);
client.on('ready', () => {
    console.log("Ready To ROCK AND ROLL")
})
client.on('qr', qr => {    qrcode.generate(qr, {small: true});});
client.on('message', async message => {
    let messageArray = message.body.split(" ");
    let args = messageArray.slice(1);
    let args2 = messageArray.slice(2);
    if(message.from == `${config.Channels["GroupID"]}`){
        // staff talk
    const contact = await message.getContact();
    const name = contact.pushname
    const phone = contact.number
    if(message.body.startsWith(`חסימה`)){
            con.query(`SELECT * FROM whatsapp WHERE id = '${args[0]}'`, async (err,brows) => {
                if(brows.length >= 1){
                let chat = brows[0].chatid
                console.log(chat.getContact())
                message.reply(`משתמש פנייה זה נחסם.`)
            }else{
                message.reply(`מספר פנייה שגוי !`)
            }
        })
        }
    if(message.body.startsWith(`ענה`)){
        con.query(`SELECT * FROM whatsapp WHERE id = '${args[0]}' AND resolved = '0'`, async (err,brows) => {
            if(brows.length >= 1){
                if(message.type === 'chat'){
                client.sendMessage(`${brows[0].chatid}`, args2.join(" "))
                con.query(`UPDATE whatsapp SET messages = '${brows[0].messages} \n ${name} : ${args2.join(" ")}'`)
                }else{
                    message.forward(brows[0].chatid)
                }
            }else{
                message.reply(`מספר פנייה שגוי !`)
            }
        })
    }

    if(message.body.startsWith(`נעל`)){
        con.query(`SELECT * FROM whatsapp WHERE id = '${args[0]}' AND resolved = '0'`, async (err,brows) => {
            if(brows.length >= 1){
                message.reply(`הפנייה ננעלה.`)
                client.sendMessage(`${brows[0].chatid}`, `פנייתך טופלה. \n לפתיחה פנייה חדשה, יש לשלוח הודעה מחדש.`)
                con.query(`UPDATE whatsapp SET resolved = 1 WHERE id = '${args[0]}'`)
            }else{
                message.reply(`מספר פנייה שגוי !`)
            }
        })
    }

    if(message.body.startsWith(`עזרה`)){
        message.reply(` הסבר מערכת: \n כאשר ישלחו הודעה אל הבוט, הוא יחזיר הודעה ראשונית. ובינתיים יעביר לצוות את הפנייה החדשה שהתקבלה. \n לצוות ישנם 3 פקודות לשימוש: \n \n ענה <מספר פנייה> - מענה למספר הפנייה אשר נרשם. \n נעל <מספר פנייה> - נעילת הפנייה אשר נרשמה. \n שחזור <מספר פנייה> - שחזור צא'ט לפי מספר פנייה \n בנוסף, תוכלו להוסיף ולקבל מדיה, סרטונים וכולי אך שימו לב שצריך להוסיף כיתוב למדיה של "ענה מספר פנייה" \n בסוף יום ניתן לבדוק פניות לא נעולות בעזרת הפקודה "בדוק לא נעול", ויוחזר מספרי פניות שלא ננעלו. `)
    }

    if(message.body.startsWith(`שחזור`)){
        con.query(`SELECT * FROM whatsapp WHERE id = '${args[0]}'`, async (err,brows) => {
            if(brows.length >= 1){
                message.reply(`להלן ההודעות מפנייה מספר ${args[0]}: \n \n פרטים לגבי הפנייה: \n מספר פונה: ${brows[0].phonenumber} \n תאריך פנייה: ${brows[0].date} \n ${brows[0].messages}`)
            }else{
                message.reply(`מספר פנייה שגוי !`)
            }
        })
    }

    if(message.body.startsWith(`בדוק לא נעול`)){
        con.query(`SELECT * FROM whatsapp WHERE resolved = 0`, async (err,brows) => {
            if(brows.length >= 1){
                let info = ""
                for(let i =0; i < brows.length; i++){
                    info += `מספר פנייה: ${brows[i].id} - מספר טלפון: ${brows[i].phonenumber}, \n`
                }
                message.reply(`נמצאו כ: ${brows.length} מקרים לא מטופלים. \n הנה המידע לגביהם: \n ${info}`)
            }else{
                message.reply(`כל הפניות טופלו.`)
            }
        })
    }
}else{
       // client talk
       const contact = await message.getContact();
       const name = contact.pushname
       const phone = contact.number
       con.query(`SELECT * FROM whatsapp WHERE phonenumber = '${message.from.slice(0,12)}' AND resolved = 0`, async (err, rows) => {
           if(rows.length >= 1) {
               if(message.type === 'chat'){
                client.sendMessage(`${config.Channels["GroupID"]}`, `המשך טיפול פנייה מספר ${rows[0].id} \n` + message.body);
                con.query(`UPDATE whatsapp SET messages = '${rows[0].messages} \n ${name} : ${message.body}'`)
               }else{
                client.sendMessage(`${config.Channels["GroupID"]}`, `מדיה מפנייה מספר: ${rows[0].id}`)
                   message.forward(`972537801272-1634205395@g.us`)
               }
           }else{
               con.query(`INSERT INTO whatsapp (phonenumber, chatid, date, messages, resolved) VALUES ('${phone}', '${message.from}', '${MyDateString}', '${name}: ${message.body}', '0')`)
               con.query(`SELECT id FROM whatsapp WHERE id = LAST_INSERT_ID()`, async (err,rrows) => {
                if(message.type === 'chat'){
                   message.reply(`שלום רב, \n תודה לך על פנייתך לצוות מחשוב.\n מספר פנייתך: ${rrows[0].id} \n אנא פרט על סיבת הפנייה, \n במידה ויש ברשותך מדיה (תמונות) רלוונטיות לתקלה, יש לשלוח אותן בהודעות נפרדות. \n נציג מהצוות יצור איתך קשר בהקדם. \n \n  *שימו לב, אין לשלוח מדיה ופרטים העלולים להכיל מידע מסווג*`);
                   client.sendMessage(`${config.Channels["GroupID"]}`, `מספר פנייה ${rrows[0].id} \n ` + message.body);
                }else{
                    client.sendMessage(`${config.Channels["GroupID"]}`, `מדיה מפנייה מספר: ${rrows[0].id}`)
                   message.forward(`${config.Channels["GroupID"]}`)
                }
               })
           }
       })
}
});
//----------------------FUNCTIONS AND COOMANDS-------------------------\\
function getDate()
{
	var today = new Date();
	var date = today.getDate()+'.'+(today.getMonth()+1);
	var dtime = today.getHours() + ":" + today.getMinutes();
	var dateTime = date+' / '+dtime;
	return dateTime;
}

//-----------------------------TOKEN-----------------------------------\\
client.initialize();
//-----------------------------TOKEN-----------------------------------\\