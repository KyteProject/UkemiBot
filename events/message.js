import Event from '../structures/Event.js';
import GoogleDrive from '../structures/GoogleDrive';

module.exports = class extends Event {
    constructor( ...args ) {
        super( ...args );
    }

    async run( message ) {
        if ( message.author.bot ) {
            return;
        }

        if ( message.guild && !message.guild.me ) {
            await message.guild.members.fetch( this.client.user );
        }

        if ( message.guild && !message.channel.id ) {
            return;
        }

        const prefix = new RegExp(
            `^<@!?${this.client.user.id}> |^${this.client.methods.util.regExpEsc( message.settings.prefix )}`
        ).exec( message.content );

        if ( prefix ) {
            const args = message.content
                    .slice( prefix[ 0 ].length )
                    .trim()
                    .split( / +/g ),
                cmd = this.client.commands.get( args.shift().toLowerCase() );

            if ( cmd ) {
                if ( cmd.guildOnly && !message.guild ) {
                    return message.channel.send( 'Please run this command in a guild.' );
                }

                // const level = this.client.permlevel( message );

                // message.author.permLevel = level;

                // if ( level < this.client.levelCache[ cmd.permLevel ] ) {
                //     return message.channel.send( 'Command level not met.' );
                // }

                while ( args[ 0 ] && args[ 0 ][ 0 ] === '-' ) {
                    message.flags.push( args.shift().slice( 1 ) );
                }
                await this.runCommand( message, cmd, args );
            }
        }

        if ( message.settings.resources.includes( message.channel.id ) ) {
            if ( !message.attachments.size && !message.embeds.length ) {
                message.delete();

                message.guild.channels
                    .get( message.settings.botLogChannel )
                    .send( ` deleted ${message.author.username}'s message in ${message.channel}.` );

                message
                    .reply(
                        '\n\n**__Resources only!__**\n\n Take a minute to think if what you\'re trying to send is actually a useful resource. If it\'s something that can be shared as a link, uploaded to the drive, or forwarded in an email then do so. Unless the image is a visual resource itself it is not helpful. Screenshot spam polutes the resources channels so please avoid it.\n\nFormat for posting a resource should be:\n\n**Description:** <something describing the resource>\n**Resource:** <URL/IMG/ATTACHMENT>'
                    )
                    .then( ( msg ) => {
                        setTimeout( () => {
                            msg.delete();
                        }, 20000 );
                    } );
            } else {
                GoogleDrive.uploadResource( message );
            }
        }
    }

    async runCommand( message, cmd, args ) {
        try {
            let msg;

            // const userPermLevel = this.client.config.permLevels.find( ( perm ) => perm.level === message.author.permLevel );

            // console.log(
            //     `\u001b[43;30m[${userPermLevel.name}]\u001b[49;39m \u001b[44m${message.author.username} (${message
            //         .author.id})\u001b[49m ran command ${cmd.name}`
            // );
            await cmd.run( message, args, message.author.permLevel, msg );
        } catch ( err ) {
            console.log( err );
        }
    }
};
