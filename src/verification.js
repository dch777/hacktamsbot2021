const { google } = require('googleapis');
const key = require('./config.json');
const scopes = 'https://www.googleapis.com/auth/spreadsheets';
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes);

process.env.GOOGLE_APPLICATION_CREDENTIALS = '../config.json';

function testfunction(message) {
    message.author.send('send verification test message')
};

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'notifications@hacktams.org',
        pass: key.epass
    }
});

module.exports = {
    name: 'verify',
    description: 'this is the verify command!',
    // assignRole(message, token, roles, tokens, server) {
    //     if (tokens.has(token)) {
    //         server.members.cache.get(tokens.get(token)).roles.add(roles.hacker);
    //         message.author.send("Welcome to the hackTAMS server");
    //         console.log('Verified: ' + message.author.username);
    //     }
    //     else {
    //         message.author.send("Verification Code Invalid");
    //     }
    // },
    execute(message, args, tokens) {
        // testfunction(message);
        
        jwt.authorize((err, res) => {
            const request = {
                spreadsheetId: '12GnU9CE3EftyUs8Uz_AQCWXGF09FKI-lwqh7YD3EDWc',
                ranges: ['A2:A', 'B2:B', 'C2:C', 'T2:T'],
                includeGridData: true,
                auth: jwt,
            };
            
            google.sheets('v4').spreadsheets.get(request).then((data) => {
                const cols = data.data.sheets[0].data;
                for (var i = 0; i < cols[2].rowData.length; i++)
                    if (cols[2].rowData[i].values[0].formattedValue.toLowerCase() == args[2].toLowerCase()) {
                        if (cols[0].rowData[i].values[0].formattedValue.toLowerCase() == args[0].toLowerCase() && 
                            cols[1].rowData[i].values[0].formattedValue.toLowerCase() == args[1].toLowerCase()) {

                            const temp = cols[3].rowData[i].values[0].formattedValue;
                            const verCode = temp.substring(temp.length-6);
                            tokens.set(verCode, message.author.id);
                            // console.log(temp.substring(temp.length-6));
                            // console.log(message.author.id);
                            //send eamil
                            const mes = 'Verification code for ' + message.author.username + ': ' + verCode + '\nDM Hacker Duck with your verification code to gain access to the hackTAMS server.\n\nIf this was not you, please contact dylanli@hacktams.org';
                            const mailOptions = {
                                // from: 'jamestheduck@hacktams.org',
                                from: 'notifications@hacktams.org',
                                to: args[2],
                                subject: 'hackTAMS Discord Verification',
                                text: mes,
                                replyTo: 'dylanli@hacktams.org'
                                // html: 'Embedded image: <img src="cid:somethingthatisunique"/>',
                                // attachments: [{
                                //     path: './directMessage/banner.png',
                                //     cid: 'somethingthatisunique'
                                // }]
                            }
                            transporter.sendMail(mailOptions, function(error, info) {
                                if (error) console.log(error);
                                else console.log('Mail sent to ' + args[2] + ' User: ' + message.author.username + ' Code: ' + verCode);
                            })
                            message.author.send('Please check your email for a verification code');
                        }
                        else
                            message.author.send('Incorrect name or email: Please verify you have entered the correct name and email');
                        break;
                    }
                if (i == cols[2].rowData.length)
                    message.author.send('Registration not found: Please verify you have entered the correct name and email in the following format\nFirstName LastName Email\nEx: `Hacker Duck hackerduck@hacktams.org`');
            });
        });
    }
}