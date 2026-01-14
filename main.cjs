process.on('warning', e => console.warn(e.stack));
const WebSocket = require('ws');
const mineflayer = require('mineflayer');
const axios = require('axios');
const { once, on } = require('events');
const nbt = require('prismarine-nbt');
const { removeAllListeners } = require('process');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const readline = require('readline');
const fs = require('fs');
const { Client, GatewayIntentBits, REST, MessageAttachment } = require('discord.js');
const { Routes } = require('discord-api-types/v9'); // Import Routes
const { clientId, guildId, token } = require('./config.json');
const https = require('https');
location = ""
const ahidQueue = [];
const priceQueue = [];
const finderQueue = [];
const bedQueue = [];
const lastPurchasedAhid = [];
const lastPurchasedPrice = [];
const lastPurchasedFinder = [];
const purchasedAhids = [];
const purchasedPrices = [];
const purchasedAhidsDC = [];
const purchasedPricesDC = [];
const idsToClaim = [];
const openedAhids = [];
let claimbreak = 0;
let ranit = false;
let buyingStateTimer;
let isBed;
let totalslots = 17;
let currentlisted = 0;
let timor;
let relistPrice;
let relistpercent;
let ihatemineflayer = false;
let priceToRelist;
let hourTimer;
let wsReceived;
let skip;
let escrow;
let purchase;
let receivedAsBed;
let curdelay;
let socket;
let topSpeeds;
let flips = 0;
let boughtflips = 0;
let totalPaid = 0;
let projProfit = 0;
let loginTime;
const agent = new https.Agent({
    rejectUnauthorized: false
});

const commands = [
    {
        name: 'captcha',
        description: 'Solve the captcha!',
        options: [
            {
                name: 'code',
                description: 'Captcha code beside correct letter',
                type: 3, // 3 represents string type
                required: true,
            },
        ],
    },
	{
		name: 'delay',
		description: 'Request a cofl delay status',
	},
	{
		name: 'speedlb',
		description: 'Request a buyspeed leaderboard status',
	},
	{
		name: 'profitlb',
		description: 'Request a profit leaderboard status',
	},
	{
		name: 'ping',
		description: 'Request a cofl ping status',
	}
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const rest = new REST({ version: '9' }).setToken(token);

client.once('ready', async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Register the commands globally or for a specific guild
        await rest.put(
            guildId
                ? Routes.applicationGuildCommands(clientId, guildId)
                : Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
	
    const { commandName, options, channel} = interaction;
	const allowedChannels = ['1191121755599806474', '1017631167022895114'];
	if (!allowedChannels.includes(channel.id)) {
        await interaction.reply({
            content: 'L bozo',
            ephemeral: true, // Make the reply ephemeral/private to the user
        });
        return;
    }
	if (commandName === 'captcha') {
		let captchaInput = options.getString('code');
		handleCommand('/cofl captcha ' + captchaInput)
		await interaction.reply({
			content: 'sent /cofl captcha ' + captchaInput,
			ephemeral: true,
		});
	} else if (commandName === 'delay') {
		handleCommand('/cofl delay');
		await interaction.reply({
			content: 'Requested cofl delay status',
			ephemeral: true,
		});
	} else if (commandName === 'speedlb') {
		handleCommand('/cofl buyspeedboard');
		await interaction.reply({
			content: 'Requested buy speed leaderboard',
			ephemeral: true,
		});
	} else if (commandName === 'profitlb') {
		handleCommand('/cofl leaderboard');
		await interaction.reply({
			content: 'Requested profit leaderboard',
			ephemeral: true,
		});
	} else if (commandName === 'ping') {
		handleCommand('/cofl ping');
		await interaction.reply({
			content: 'Requested cofl ping status',
			ephemeral: true,
		});
	}
});
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', (input) => {
	let lowercaseInput = input.toLowerCase()
    if ((lowercaseInput?.startsWith('/cofl') || lowercaseInput?.startsWith('/baf')) && lowercaseInput?.split(' ').length >= 2) {
        handleCommand(input)
        return
    } else {
		bot.chat(input);
	}
});

async function handleCommand(input) {
	let lowercaseInput = input.toLowerCase()
	if ((lowercaseInput?.startsWith('/cofl') || lowercaseInput?.startsWith('/baf')) && input?.split(' ').length >= 2) {
        let splits = input.split(' ')
        splits.shift() // remove /cofl
        let command = splits.shift()
		socket.send(JSON.stringify({ type: command, data: `"${splits.join(' ')}"` }))
	}
}

async function captcha(data) {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
            avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Captcha',
                color: 65280,
                description: `\`\`\`\n${data}\n\`\`\``,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function itemListed(ign,item,price) {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Item listed',
                color: `65280`,
                description: `${ign} listed ${item} for ${price}`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function itemSells(buyer,item,price) {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'item sold!',
                color: `65280`,
                description: `${buyer} bought ${item} for ${price}`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function itemBought(item,price,ahid,target,bed) {
    purse = await getPurse();
	let curtime = Math.floor(Date.now() / 1000);
	let isoCurtime = new Date(curtime * 1000).toISOString();
	totalPaid += parseInt(price.toString().replace(/,/g, ''), 10);
	projProfit += (parseInt(target.toString().replace(/,/g, ''), 10) - parseInt(price.toString().replace(/,/g, ''), 10));
    try {
		// set discord webhook
        await axios.post(" ", {
		"content": null,
		"embeds": [
			{
			"title": "Item Bought!",
			"color": `16738740`,
			"description": `${item} was bought for ${price}\n\n**Auction**: [Click](https://sky.coflnet.com/auction/${ahid})\n**Target**: ${addCommasToNumber(target)}\n**Bed?:** ${bed.toString()}`,
			"fields": [
				{
				"name": "Session Stats",
				"value": `**Purse**: ${addCommasToNumber(purse)}\n**Total Flips**: ${flips} **Flips Bought**: ${boughtflips}\n**Coins Spent**: ${addCommasToNumber(totalPaid)} **Projected Profit:** ${addCommasToNumber(projProfit)}\n**Logged On**: <t:${loginTime}:R>`
				}
			],
			"footer": {
				"text": "Current Account: " + bot.username
			},
			"timestamp": isoCurtime,
			"thumbnail": {
				"url": "https://media.discordapp.net/attachments/503603044588716044/1183032985939890196/Screenshot_20231206_015118_TikTok.gif?ex=6682aad3&is=66815953&hm=7ed4f4422a25190268a3d68b79002966516f3fad4bd3b61ef97f9930c945c832&"
			}
			}
		],
		"username": "MarketOrca",
		"avatar_url": "https://i.imgur.com/Zya0cbS.png",
		"attachments": []
		});
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function loggedOn() {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Logged on',
                color: `65280`,
                description: `${bot.username} has logged on!\n Logged in <t:${loginTime}:R>`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function sendLb(lb) {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Leaderboard',
                color: `65280`,
                description: `${lb}`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function sendPing(ping) {
    try {
        await axios.post("https://discord.com/api/webhooks/1191121780958568568/Z0AdfOZ-_X6jPxZ_L21hZKovBsC82qkcS-n8ldP5ay3NYjTSorMT2Durtd_zkyJCYQeD", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Ping',
                color: `65280`,
                description: `${ping}`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function sendDelay(delay) {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Delay Status',
                color: `65280`,
                description: `${delay}`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function connectionId(id) {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Cofl Connected',
                color: `65280`,
                description: `${bot.username} has connected with connection id: ${id}\n Logged in <t:${loginTime}:R>`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

async function partyInvited(msg) {
    try {
		// set discord webhook
        await axios.post(" ", {
            username: "MarketOrca",
			avatar_url: "https://i.imgur.com/Zya0cbS.png",
            content: "",
            embeds: [{
                title: 'Idiot partying you weewoo',
                color: `65280`,
                description: `${msg}`,
            }]
        });
    } catch (error) {
        console.error('Error posting to Discord:', error);
    }
}

function getPurse() {
    return new Promise((resolve, reject) => {
        try {
            let purseValue = 0; // Default to 0 or appropriate default value
            let scoreboard = bot.scoreboard.sidebar.items.map(item => item.displayName.getText(null).replace(item.name, ''));

            scoreboard.forEach(e => {
                if (e.includes('Purse:')) {
                    let purseString = e.substring(e.indexOf(':') + 1).trim();
                    purseValue = parseInt(purseString.replace(/\D/g, ''), 10); // Ensure parsing as decimal
                }
            });

            resolve(purseValue); // Resolve the promise with the found purse value
        } catch (error) {
            reject(error); // Reject the promise if any error occurs
        }
    });
}

async function getReady() {
    let getReady = new Promise(async (resolve, reject) => {
        bot.chat("/sbmenu")
        console.log("sbmenu opened")
        bot.once('windowOpen', async (window) => {
            console.log("check1")
            console.log("window",bot.currentWindow.title)
            console.log("item",bot.currentWindow.slots[48].nbt.value.display.value.Name.value)
            if (bot.currentWindow.title.includes("SkyBlock Menu") && bot.currentWindow.slots[48].nbt.value.display.value.Name.value.includes("Profile Management")) {
                console.log("bonk")
                bot.currentWindow.requiresConfirmation = false;
                bot.clickWindow(48,0,0)
                console.log("profile management opened")
                bot.once('windowOpen', async (window) => {
                    console.log("check2")
                    if (bot.currentWindow.title.includes("Profile Management")) {
                        bot.currentWindow.slots.every(async item => {
                            //console.log("here-1")
                            //console.log("a",item.displayName)
                            if (item == null) {return}
                            if (item.slot <= 9) {return}
                            if (item.slot >= 17) {return}
                            if (item.displayName == "Block of Emerald") {
                                console.log("here1")
                                let itemNbt = nbt.simplify(item.nbt)
                                let coop;
                                try { coop = itemNbt.display.Lore.find(line => line.includes("Co-op with")).replace(/§./g, "") } catch {}
                                if (coop) {
                                    // Regular expressions for the two formats
                                    const coopRegexPlayers = /Co-op with (\d+) players:/;
                                    const coopRegexSinglePlayer = /Co-op with (?:\[.*\]\s*)?([\w]+)/;

            
                                    // Check for multiple players format
                                    const matchPlayers = coop.match(coopRegexPlayers);
                                    if (matchPlayers) {
                                        const numberOfPlayers = parseInt(matchPlayers[1], 10);
                                        console.log("COOP", coop, "Number of players:", numberOfPlayers);
                                        totalslots = 14 + (numberOfPlayers*3)
                                        console.log("max ah slots set to",totalslots)
                                    } else {
                                        // Check for single player format
                                        const matchSinglePlayer = coop.match(coopRegexSinglePlayer);
                                        if (matchSinglePlayer) {
                                            const playerName = matchSinglePlayer[1];
                                            console.log("COOP with single player:", playerName);
                                            totalslots = 17;
                                            console.log("max ah slots set to",totalslots)
                                        } else {
                                            // If neither regex matches, log that the coop format is unrecognized
                                            console.log("Unrecognized COOP format:", coop);
                                        }
                                    }
                                } else {
                                    // If coop does not exist
                                    totalslots = 14;
                                    console.log("max ah slots set to",totalslots)
                                    console.log("No COOP information found");
                                }
                                await delay(500)
                                console.log("done")
                                await delay(500)
                                bot.chat('/ah')
                                await once(bot, 'windowOpen');
                                //console.log(bot.currentWindow.title,bot.currentWindow.slots[15].nbt.value.display.value.Name.value)
                                if ((bot.currentWindow.title.includes("Co-op Auction House") || bot.currentWindow.title.includes("Auction House")) && (bot.currentWindow.slots[15].nbt.value.display.value.Name.value.includes("Manage Auctions")) || bot.currentWindow.slots[15].nbt.value.display.value.Name.value.includes("Create Auction")) {
                                    bot.currentWindow.slots.every(async item => {
                                        if (item == null) {return}
                                        if (item.slot == 15) {
                                            console.log("here")
                                            console.log("value",bot.currentWindow.slots[15].nbt.value.display.value.Name.value)
                                            let itemNbt = nbt.simplify(item.nbt)
                                            let cleanedLoreLines = [];
                                            if (itemNbt.display && itemNbt.display.Lore) {
                                                cleanedLoreLines = itemNbt.display.Lore.map(line => line.replace(/§./g, ""));
                                                //cleanedLoreLines.forEach(cleanedLine => console.log("Cleaned Lore line:", cleanedLine));
                                            }
                                            let none, one, multiple;
                                            try { none = cleanedLoreLines.find(line => line.includes("Set your own items")); } catch {}
                                            try { one = cleanedLoreLines.find(line => line.includes("You own 1 auction")); } catch {}
                                            try { multiple = cleanedLoreLines.find(line => /You own \d+ auctions/.test(line)); } catch {}
                                            // console.log("none",none)
                                            // console.log("one",one)
                                            // console.log("multiple",multiple)
                                            if (none) {
                                                currentlisted = 0;
                                                console.log("current listed set to,",currentlisted)
                                            }
                                            if (one) {
                                                currentlisted = 1;
                                                console.log("current listed set to,",currentlisted)
                                            }
                                            if (multiple) {
                                                let match = multiple.match(/You own (\d+) auctions in/);
                                                if (match && match[1]) {
                                                    currentlisted = parseInt(match[1], 10);
                                                    console.log("current listed set to,",currentlisted)
                                                }
                                            }
                                            console.log("done2")
                                            await delay(500)
                                            let toclaim1, toclaim2
                                            try { toclaim1 = cleanedLoreLines.find(line => line.includes("Your auctions have 1 bid")); } catch {}
                                            try { toclaim2 = cleanedLoreLines.find(line => /Your auctions have \d+ bids/.test(line)); } catch {}
                                            if (toclaim1) {
                                                await delay(500)
                                                bot.currentWindow.requiresConfirmation = false;
                                                bot.clickWindow(15,0,0)
                                                await once(bot, 'windowOpen');
                                                await delay(500)
                                                bot.currentWindow.requiresConfirmation = false;
                                                bot.clickWindow(10,0,0)
                                                await once(bot, 'windowOpen');
                                                await delay(500)
                                                bot.currentWindow.requiresConfirmation = false;
                                                bot.clickWindow(31,0,0)
                                                console.log("claimed 1 already sold auction")
                                                currentlisted --;
                                                console.log("currentlisted updated to",currentlisted)
                                            }
                                            if (toclaim2) {
                                                let match = toclaim2.match(/Your auctions have (\d+) bids/);
                                                let bids = match && match[1] ? parseInt(match[1], 10) : 0;
                                                
                                                await delay(500);
                                                bot.currentWindow.requiresConfirmation = false;
                                                bot.clickWindow(15, 0, 0);
                                                await once(bot, 'windowOpen');
                                                await delay(500)

                                                const slotsToCheck = [21, 30, 39];

                                                slotsToCheck.forEach(slot => {
                                                    let item = bot.currentWindow.slots[slot];
                                                    if (item && item.nbt && item.nbt.value.display && item.nbt.value.display.value.Name) {
                                                        let itemName = item.nbt.value.display.value.Name.value;
                                                        if (itemName.includes("Claim All")) {
                                                            console.log(`Found 'Claim All' at slot ${slot}`);
                                                            // Perform your action here
                                                            bot.currentWindow.requiresConfirmation = false;
                                                            bot.clickWindow(slot, 0, 0);
                                                        }
                                                    }
                                                });
                                                // bot.currentWindow.requiresConfirmation = false;
                                                // bot.clickWindow(30, 0, 0);
                                                console.log("claimed multiple already sold auctions");
                                                currentlisted -= bids
                                                console.log("currentlisted updated to",currentlisted)
                                            }
                                            if (!toclaim1 || !toclaim2) {
                                                console.log("no previously sold auctions to claim, proceeeding...")
                                                bot.closeWindow(bot.currentWindow);
                                            }
                                            resolve("ready to start flipping, connecting to socket")
                                        }
                                    })
                                    
                                }
                                //resolve("Ready to scan (all filters set)")
                                //seller = itemNbt.display.Lore.find(line => line.includes("Seller:")).replace(/§./g, "")
                                //let price = itemNbt.display.Lore.findIndex((element) => element.includes("Buy it now: "))
                            }
                        })
                    }
                })
            }
            // console.log(`Opened - ${window.title}`)      
            // console.log("trying category")
            
        })
    })
    //console.log(bot.currentWindow.title)
    await getReady.then((message) => {console.log(message)})
    await delay(1000)
    connectWebsocket()
    console.log("SOCKET CONNETED, FLIPPING TIME :D")
    ranit = true;
}

function convertPriceStringToNumber(priceString) {
    const multiplier = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000,
    };

    // Use regular expression to extract the numeric part and unit
    const match = priceString.match(/(\d+(\.\d+)?)([KMB])?/i);
    if (!match) {
        throw new Error('Invalid price string format');
    }

    const numericPart = parseFloat(match[1]);
    const unit = match[3] ? match[3].toUpperCase() : '';

    if (multiplier.hasOwnProperty(unit)) {
        return numericPart * multiplier[unit];
    } else {
        return numericPart;
    }
}

function addCommasToNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function claimCheck() {
    if (bot.state == null && idsToClaim.length > 0) { 
        bot.state = "claiming"
        console.log("claiming start")
        viewauction = idsToClaim.shift()
        bot.chat(viewauction)
        await once(bot, 'windowOpen');
        if (bot.currentWindow.title == `{"italic":false,"extra":[{"text":"BIN Auction View"}],"text":""}`) {
            console.log("claim detected")
            bot.currentWindow.requiresConfirmation = false;
            bot.clickWindow(31,0,0)
            console.log("claim click")
            currentlisted--;
            console.log("currentlisted updated to",currentlisted)
            claimbreak = 0
            bot.state = null
        }
    }
    else if ((bot.state == "buying" || bot.state == "listing" || bot.state == "claiming") && idsToClaim.length > 0 && claimbreak < 10) {
        setTimeout(function() {
            claimCheck()
            console.log("claiming cycle",bot.state)
            claimbreak++
        }, 5000);
    }else {
        console.log("No sold ahids to claim.");
    }
}

async function openNextAhidFromQueue() {
    if (ahidQueue.length > 0) {
        // Clear any existing timer
        
        buyingStateTimer = new Date().getTime();

        setTimeout(() => {
            if (new Date().getTime() - buyingStateTimer > 10000 && bot.state == "buying") {
                skip = false;
                if (bot.currentWindow) {
                    bot.closeWindow(bot.currentWindow);
                }
                bot.state = null;
                openNextAhidFromQueue();
                console.log("Bot state issue detected, resetting state to null and closing window.");
            }
        }, 12000);

        let ahid = ahidQueue.shift();
        let price = priceQueue.shift();
        //const finder = finderQueue.shift();
        let bed = new Date(bedQueue.shift()).getTime();
        if (!openedAhids.includes(ahid)) {
            bot.state = "buying"
            console.log("Attempting to buy",ahid,"with target price of",price,"listed at",bed)
            //console.log('bed',bed)
            //isBed = ((new Date(bed).getTime()-1000) > new Date().getTime())
            // console.log("now",new Date().getTime())
            // console.log("bed",new Date(bed).getTime()-1000)
            // console.log("isbed",isBed)
            // if (new Date().getTime() - bed < 19000) { 
            //     isBed = true
            //     console.log("bed is true")
            // }
            // if (isBed == true) {
            //     console.log("sleeping for",new Date().getTime() - bed - 500,"ms")
            //     await delay (new Date().getTime() - bed - 500)
            // }
            // console.log("waiting 10 seconds before opening!")
            // await delay(5000)
            bot.chat(`/viewauction ${ahid}`);
            openedAhids.push(ahid)
            console.log("WS -> Viewauction:", new Date().getTime()-wsReceived, "ms");
            slot31ID = await waitForSlotType(bot)
            switch(slot31ID) {
                case 371: //nugget
                    console.log("Handling item with ID 371");
                    receivedAsBed = false
                    nuggetHandler(slot31ID)
                    break;
                case 355: //bed
                    console.log("Handling item with ID 355");
                    receivedAsBed = true
                    bedHandler(slot31ID,bed)
                    // Add your handling logic for this item ID here
                    break;
                case 392: // potato
                    console.log("Handling item with ID 392");
                    potatoHandler(slot31ID)
                    break;
                case 394: //poor
                    console.log("Handling item with ID 394");
                    poorHandler(slot31ID)
                    break;
                case 288: //feather
                    console.log("Handling item with ID 288")
                    featherHandler(slot31ID)
                    break;
                case undefined: //undefined
                    console.log("Handling undefined")
                    if (bot.currentWindow) {
                        bot.closeWindow(bot.currentWindow)
                    }
                    await delay(50)
                    bot.state = null
                    openNextAhidFromQueue()
                    break;
                case 1:
                    await delay(500)
                    console.log("running cleanup")
                    if (bot.currentWindow) {
                        bot.closeWindow(bot.currentWindow)
                    }
                    await delay(50)
                    bot.state = null
                    openNextAhidFromQueue()
                    break;
                default:
                    console.log("Item with ID",slot31ID,"not important ig");
                    break;
            }
            console.log("state is",bot.state)
            console.log("Opened ahid:", ahid);
            lastPurchasedAhid.length = 0; // Clear the list
            lastPurchasedAhid.push(ahid); // Add the latest opened ahid
            lastPurchasedPrice.length = 0; // Clear the list
            lastPurchasedPrice.push(price); // Add the latest opened price
            // lastPurchasedFinder.length = 0;
            // lastPurchasedFinder.push(finder);
        } else {
            console.log("Already opened auction with id", ahid, ". Skipping to next in queue.");
            openNextAhidFromQueue();
        }
    } else {
        console.log("No ahids in the queue.");
    }
}

const bot = mineflayer.createBot({
	// set minecraft username
    username: " ",
    auth: "microsoft",
    version: "1.8",
    host: "hypixel.net",
})

bot.on('login', async () => {
    let botSocket = bot._client.socket;
    console.log(`Logged in to ${botSocket.server ? botSocket.server : botSocket._host}`);
});

bot.once('spawn', async () => {
	loginTime = Math.floor(Date.now() / 1000)
	loggedOn()
    hourTimer = new Date().getTime() - 10000000
    bot.state = null
    await bot.waitForChunksToLoad()
    //connectWebsocket()
})

bot.on('scoreboardCreated', async (scoreboard, updated) => {
    await delay(2000)
    bot.chat("/locraw")
})

bot.on('message', async (jsonMsg) => {
    let rawText = jsonMsg.toString();
    if (rawText.includes("NarniaSkillFul")) {return}
    //console.log("rawtext",rawText)
    
	if (rawText.includes("Co-op >") && rawText.includes("delay")) {
		socket.send(JSON.stringify({ type: "delay", data: "" }))
	}
	if (rawText.includes("Co-op >") && rawText.includes("speed")) {
		socket.send(JSON.stringify({ type: "buyspeedboard", data: "" }))
	}
	if (rawText.includes("Co-op >") && rawText.includes("profit")) {
		socket.send(JSON.stringify({ type: "leaderboard", data: "" }))
	}
	if (rawText.includes("Co-op >") && rawText.includes("ping")) {
		socket.send(JSON.stringify({ type: "ping", data: "0" }))
	}
	if (rawText.includes("has invited")) {
		partyInvited(rawText)
	}
	if (rawText.includes("Putting coins in escrow...")) {
		console.log("WS -> Escrow at", new Date().getTime()-wsReceived, "ms");
	}
    if (rawText.includes(`{"server":"limbo"}`)) {
        await delay(2000)
        bot.chat("/l")
    }
    if (rawText.includes(`This auction belongs to another profile1`)) {
        currentlisted++;
    }
    if (rawText.includes(`"map":"Private Island"`)) {
        await delay(2000)
        console.log("Current location updated to island")
        location = "island"
        if (ranit == false){
            getReady()
        }
    }
    if (rawText.includes(`"map":"Dwarven Mines"`)) {
        await delay(2000)
        console.log("Current location updated to dwarven mines")
        location = "island"
        if (ranit == false){
            getReady()
        }
    }
    if (rawText.includes(`"map":"Hub"`)) {
        await delay(2000)
        console.log("Currently in hub, attempting to go to island!")
        location = "hub"
        bot.chat("/is")
    }
    if (rawText.includes(`"gametype":"PROTOTYPE"`)) {
        await delay(2000)
        console.log("Currently in lobby, attempting to go to skyblock!")
        location = "lobby"
        bot.chat("/skyblock")
    }
    if (rawText.includes(`"gametype":"MAIN"`)) {
        await delay(2000)
        console.log("Currently in lobby, attempting to go to skyblock!")
        location = "lobby"
        bot.chat("/skyblock")
    }
    if (rawText.includes(`"gametype":"BEDWARS"`)) {
        await delay(2000)
        console.log("Currently in lobby, attempting to go to skyblock!")
        location = "lobby"
        bot.chat("/skyblock")
    }
    if (rawText.includes(`"gametype":"SKYWARS"`)) {
        await delay(2000)
        console.log("Currently in lobby, attempting to go to skyblock!")
        location = "lobby"
        bot.chat("/skyblock")
    }
    if (rawText.includes(`"gametype":"WOOL_GAMES"`)) {
        await delay(2000)
        console.log("Currently in lobby, attempting to go to skyblock!")
        location = "lobby"
        bot.chat("/skyblock")
    }
    if (rawText.includes("You are AFK.")) {
        await delay(5000)
        bot.chat("/l")
        console.log("Warping to skyblock")
    }
    if (rawText.includes("You were kicked while joining that server!")) {
        await delay(5000)
        bot.chat("/play sb")
        console.log("Warping to skyblock")
    }
    if (rawText.includes("Cannot join SkyBlock")) {
        await delay(5000)
        bot.chat("/play sb")
        console.log("Warping to skyblock")
    }
    if (rawText.includes("Cannot send chat message")) {
        await delay(5000)
        console.log("Warping to lobby")
        bot.chat("/l")
    }
    if (rawText.includes("There was a problem joining SkyBlock, try again in a moment!")) {
        await delay(5000)
        console.log("Warping to lobby")
        bot.chat("/skyblock")
    }
    if (rawText.includes("Couldn't warp you! Try again later.")) {
        await delay(5000)
        bot.chat("/locraw")
        console.log("rechecking location bc warp failed")
    }
    //
    //failsafe msgs
    if (rawText.includes("You didn't participate in this auction!")) {
        bot.state = null
        openNextAhidFromQueue();
    } 
    if (/You purchased .+ for [\d,]+ coins!/.test(rawText)) {
        skip = false
        //purchase = true
		boughtflips += 1
        let lastOpenedAhid;
        let lastOpenedPrice;
        if (lastPurchasedAhid.length > 0) {
            if (!lastPurchasedFinder.toString().toLowerCase().includes("user")) {
            lastOpenedAhid = lastPurchasedAhid[lastPurchasedAhid.length - 1];
            console.log("Ahid purchased and added to list:", lastOpenedAhid);
            //ChatLib.chat(`Ahid purchased and added to list: ${lastOpenedAhid}`);
            purchasedAhids.push(lastOpenedAhid);
            console.log("Purchased AHIDs:", JSON.stringify(purchasedAhids));
            //ChatLib.chat(`Purchased AHIDs: ${JSON.stringify(purchasedAhids)}`);
            lastOpenedPrice = lastPurchasedPrice[lastPurchasedPrice.length - 1];
            console.log("Price added to ahid list:", lastOpenedPrice);
            //ChatLib.chat(`Price added to ahid list: ${lastOpenedPrice}`);
            purchasedPrices.push(lastOpenedPrice);
            console.log("Purchased Prices:", JSON.stringify(purchasedPrices));
            //ChatLib.chat(`Purchased Prices: ${JSON.stringify(purchasedPrices)}`);
            // setTimeout(function() {
            //     relistCheck()
            //     console.log(`starting relist check`);
            // }, 10000);
            }
            else if (lastPurchasedFinder.toString().toLowerCase().includes("user")) {
                // specialitems(lastPurchasedAhid[lastPurchasedAhid.length - 1])
            }
        }
        const regex = /You purchased (.+) for ([\d,]+) coins!/;
        const matches = rawText.match(regex);
    
        if (matches) {
            const itemName = matches[1];
            const price = matches[2];
            console.log("1")
            itemBought(itemName,price,lastPurchasedAhid,lastOpenedPrice,receivedAsBed)
            console.log("2")
        }
        hourTimer = new Date().getTime()
        if (!receivedAsBed) {
            bot.state = null
            openNextAhidFromQueue();
        }
    } 
    if (/Escrow refunded [\d,]+ coins for BIN Auction Buy!/.test(rawText)) {
        //escrow = true
        skip = false
        if (!receivedAsBed) {
            bot.state = null
            openNextAhidFromQueue();
        }
    } 
    if (/\[Auction\] \w+ bought .+ for [\d,]+ coins CLICK/.test(rawText)) {
        console.log("hey cutie");
        clickevent = jsonMsg.clickEvent.value;
        console.log(clickevent);
        idsToClaim.push(clickevent);
        claimCheck();
    
        const regex = /\[Auction\] (\w+) bought (.+) for ([\d,]+) coins CLICK/;
        const matches = rawText.match(regex);
    
        if (matches) {
            const buyerName = matches[1];
            const itemName = matches[2];
            const price = matches[3];
            itemSells(buyerName,itemName,price)
        }
    }
    if (/(\w+) created a BIN auction for (.+) at ([\d,]+) coins!/.test(rawText)) {
        // console.log("Item listed (message thing)");
       
        const regex = /(\w+) created a BIN auction for (.+) at ([\d,]+) coins!/;
        const matches = rawText.match(regex);
        
        if (matches) {
            console.log("Item listed (message thing)");
        
            const username = matches[1]; // Added capturing the username
            const itemName = matches[2];
            const price = matches[3].replace(/,/g, ''); // Remove commas from the price
            itemListed(username,itemName,addCommasToNumber(price))
            //console.log(`Username: ${username}, Item: ${itemName}, Price: ${price}`);
        }
    }
    if (rawText.includes("BIN Auction started")) {
        currentlisted++;
        console.log(`Current listed: ${currentlisted}`);
    } 
    if (rawText.includes("You don't have enough coins to afford this bid!")) {
        bot.state = null
        if (bot.currentWindow) {
            bot.closeWindow(bot.currentWindow)
        }
        openNextAhidFromQueue();
    } 
    if (rawText.includes("The auctioneer has closed this auction!")) {
        bot.state = null
        if (bot.currentWindow) {
            bot.closeWindow(bot.currentWindow)
        }
        openNextAhidFromQueue();
    }
    if (rawText.includes("This player doesn't have any active auctions!")) {
        bot.state = null
        openNextAhidFromQueue();
    } 
    if (rawText.includes("This auction wasn't found!")) {
       bot.state = null
       openNextAhidFromQueue();
    } 
    if (rawText.includes("There was an error grabbing this auction!")) {
        bot.state = null
        openNextAhidFromQueue();
    } 
    if (rawText.includes("Unknown command.")) {
        bot.state = null
        openNextAhidFromQueue();
    } 
    if (rawText.includes("You cannot view this auction!")) {
        bot.state = null
        openNextAhidFromQueue();
    } 
    if (rawText.includes('You may only use this command after 4s on the server!') && bot.state == "buying") {
        bot.state = null
        openNextAhidFromQueue();
    }  
    if (rawText.includes("Defense")){ return }
    if (rawText.includes("✎ Mana")) { return }
    console.log(jsonMsg.toAnsi())
});

async function connectWebsocket() {
    socket = new WebSocket("wss://sky.coflnet.com/modsocket?player=" + bot.username + "&version=1.5.6-Alpha&SId=RANDOM-secret-Id");    
    socket.onclose = (e) => {
        console.log('Connection closed. Reconnecting... ', 'warn')
        setTimeout(() => {
            connectWebsocket()
        }, 2000)
    }
    socket.onerror = (err) => {
        console.log('Connection error: ' + JSON.stringify(err), 'error')
        socket.close()
    }
    socket.onopen = (x) => {
        console.log("websocket connection opened")
    }
    socket.addEventListener('message', async function (event) {
        wsReceived = new Date().getTime();
        let message = JSON.parse(event.data)
        console.log(message)
		let data = JSON.parse(message.data)
		
		if (message.type === "flip") {
			flips += 1;
            let ahid = data.id;
            let relistPrice = data.target;
            let bedtime = data.auction.start;
            //let bedtime = new Date(match[4]).getTime();
            console.log("ahid:", ahid);
            console.log("relistPrice:", relistPrice);
            //console.log("finder:", finder); 
            console.log("starttime", bedtime);
            ahidQueue.push(ahid);
            priceQueue.push(relistPrice);
            //finderQueue.push(finder);
            bedQueue.push(bedtime);
            if (bot.state == null) {
                openNextAhidFromQueue();
                //console.log("WS -> Queue Call:", new Date().getTime()-wsReceived, "ms");
            }
		}
		
		if (message.type === "writeToChat") {
			let writeThis = data.text
			let writeThis2 = data.hover
			if (writeThis2 != null) {
				if (writeThis2.includes("conId")) {
					let match = writeThis2.match(/conId:\s*(.+)/);
					connectionId(match[1])
				}
			}
			if (writeThis.includes("delayed")) {
				let match = writeThis.match(/(\d+\.\d+s)/);
				if (match) {
					curdelay = match[1];
					sendDelay(curdelay)
				} else {
					curdelay = "You are currently not delayed at all :)";
					sendDelay(curdelay)
				}
			}
		}
		if (message.type === "execute") {
			if (message.data.includes("ping")) {
				let execData = message.data
				console.log(execData);
				let dataParts = execData.slice(1, -1).split(' ');
	
				dataParts.shift();
				dataParts.shift();
				
				dataParts = '"' + dataParts.join(' ') + '"';
				
				socket.send(JSON.stringify({ type: 'ping', data: dataParts}))
				console.log("sent " + dataParts);
			}
		}
		
		if (message.type === "chatMessage") {
			// Combine the text properties of each item in the data array into a single string
			let chatText = data.map(item => item.text).join('');
			if (chatText.includes("captcha")) {
				
				let lastOnClick = null;
				data.forEach(element => {
					// Count occurrences of '#' and '^' in element.text
					// Check if the element's text includes '#' or '^'
					if (element.text.includes('#') || element.text.includes('^')) {
						// Replace '/cofl', 'captcha', and whitespace characters globally in element.onClick
						lastOnClick = element.onClick.replace(/\/cofl|captcha|\s/g, '');
					}
    
					// Check if the element's text includes newline character '\n'
					if (element.text === '\n' && element.onClick !== null) {
						let paddingSpaces = ' '.repeat(6);
						// If lastOnClick is not null, prepend it to the element's text
						if (lastOnClick !== null) {
							element.text = `${lastOnClick} ${element.text}`;
						}
					}
				});
				newChatText = data.map(item => item.text).join('').replace(/[\uD83C\uDDE7\uD83C\uDDFE]/g, '').replace(/§./g, '');;
				captcha(newChatText);
			}
			
			if (chatText.includes("Your Ping to execute SkyCofl commands")) {
				chatText = chatText.replace(/§./g, '');
				chatText = chatText.replace(/\[Coflnet\]: /g, '');
				sendPing(chatText);
			}
			if (chatText.includes("Top players for this week")) {
				// Remove the first line which is assumed to be "[§1C§6oflnet§f]§7: Top players for this week:"
				chatText = chatText.substring(chatText.indexOf("\n") + 1);
				
				// Remove the last line which matches "You are rank: " followed by any characters and a newline
				chatText = chatText.replace(/You are rank: .*\n/, '');

				// Remove all occurrences of "§" followed by any single character (color codes)
				chatText = chatText.replace(/§./g, '');
				
				// Remove all occurrences of parentheses and the text inside them
				chatText = chatText.replace(/\(.*?\)/g, '');
				
				// Remove all URLs
				chatText = chatText.replace(/https?:\/\/[^\s]+/g, '');
				
				// Log the cleaned chat text
				console.log(chatText);
					
				// Send the cleaned leaderboard information
				sendLb(chatText);
			}
		}
    });
}

async function windowCleanup() {
    console.log("running check")
	if (bot.currentWindow) {
		if (bot.currentWindow.title.includes("Confirm Purchase")) {
			bot.clickWindow(11,0,0)
		}
	}
    await delay(175)
    if (bot.currentWindow) {
        bot.closeWindow(bot.currentWindow)
        console.log("opened window was closed, states are now reset and should be fixed?")
    } else {
        console.log("there was likely no issues (this should only be from bed call)")
    }
    await delay(175)
    bot.state = null
    openNextAhidFromQueue()
}

async function waitForSlotType(bot) {
    let counter = 0;
    // Wait for bot.currentWindow to be non-null and for slots[31] to exist and have a defined type
    while ((!bot.currentWindow || !bot.currentWindow.slots[31] || typeof bot.currentWindow.slots[31].type === 'undefined') && counter < 500) {
        await new Promise(resolve => setTimeout(resolve, 3)); // Using Promise for delay
        counter++;
    }

    if (bot.currentWindow && bot.currentWindow.slots[31] && typeof bot.currentWindow.slots[31].type !== 'undefined') {
        // If the condition is met, return the type of the item in slot 31
        if (new Date().getTime()-wsReceived < 15) {
            console.log("windows likely out of sync, running check in 5 seconds")
            return 1
        } else {
            console.log("WS -> Slot 31 Found:", new Date().getTime()-wsReceived, "ms");
            console.log("Slot 31 type found:", bot.currentWindow.slots[31].type);
            return bot.currentWindow.slots[31].type;
        }
    } else {
        // If the slot does not become available or does not have a type, log and return undefined
        console.log("Slot 31 type not found within the timeout period.");
        return undefined; // Indicate failure to find the slot type
    }
}

bot._client.on('packet', async (data, packetMeta) => {
    if (bot.state !== "buying") {return}
    
    if (packetMeta.name === 'open_window') {
        console.log("WS -> Open_Window Packet:", new Date().getTime()-wsReceived, "ms");
        if (data.windowTitle.toString().includes("Confirm Purchase") && !skip) {
            //console.log("confirm click")
            await bot.on("windowOpen", async window => {})
            bot.currentWindow.requiresConfirmation = false;
            bot.clickWindow(11,0,0)
			bot.clickWindow(11,0,0)
			console.log("WS -> First Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Second Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Third Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Fourth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Fifth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Sixth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Seventh Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Eighth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Ninth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Tenth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Eleventh Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Twelfth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Thirteenth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Fourteenth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(5)
			bot.clickWindow(11,0,0)
            console.log("WS -> Fifteenth Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(10)
			bot.clickWindow(11,0,0)
            console.log("WS -> Extra Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(10)
			bot.clickWindow(11,0,0)
            console.log("WS -> Extra Confirm Click:", new Date().getTime()-wsReceived, "ms");
			await delay(10)
			bot.clickWindow(11,0,0)
            console.log("WS -> Extra Confirm Click:", new Date().getTime()-wsReceived, "ms");
            bot.removeAllListeners('windowOpen')
            await delay(250)
            windowCleanup()
            // bot.state = null
        }
    }
});

async function nuggetHandler(slotType) {
    if (bot.state !== "buying") {return}
    //let slotType;
    if (bot.currentWindow) {
        if (bot.currentWindow.title.includes("BIN Auction View") && slotType === 371 && !skip) {
            //console.log("nugget WOWZRE")
            // bot.currentWindow.requiresConfirmation = false;
            // bot.clickWindow(31,0,0)
            //console.log("WS -> Nugget Click:", new Date().getTime()-wsReceived, "ms");
            //nugget = true
            //console.log("a")
            bot._client.write('window_click', {
                windowId: bot.currentWindow.id,
                slot: 31,
                mouseButton: 0,
                action: 1,
                mode: 0,
                item: {"blockId": 371}
            })
            console.log("click1")
            bot._client.write('window_click', {
                windowId: bot.currentWindow.id+1,
                slot: 11,
                mouseButton: 0,
                action: 1,
                mode: 0,
                item: {"blockId": 159}
            })
            console.log("click2")
            skip = true
            console.log("WS -> Nugget Click (skip):", new Date().getTime()-wsReceived, "ms");
        }
    } else {
        console.log("NUGGET window error, closing and resetting ):")
        if (bot.currentWindow) {
            bot.closeWindow(bot.currentWindow)
        }
        await delay(50)
        bot.state = null
        openNextAhidFromQueue()
    }
    
}

async function bedHandler(slotType,bedtime) {
    if (bot.state !== "buying") {return}
    if(bot.currentWindow) {
        if (bot.currentWindow.title.includes("BIN Auction View") && slotType === 355) {
            console.log("waiting",bedtime - new Date().getTime() + 17000,"ms")
            await delay(bedtime - new Date().getTime() + 17000)
            purchase = false
            escrow = false
            let bedItem;
            let potatoItem;
            let poorItem;
            let canceledItem;
            if (bot.currentWindow.slots[31].type) {
                bedItem = bot.currentWindow.slots[31].type === 355
                potatoItem = bot.currentWindow.slots[31].type === 392
                poorItem = bot.currentWindow.slots[31].type === 394
                canceledItem = bot.currentWindow.slots[31].type === 166
            } else {
                console.log("idk weird bed bug not sure dont rly care waiting and exiting")
                await delay(150)
                if (bot.currentWindow) {
                    bot.closeWindow(bot.currentWindow)
                }
                await delay(50)
                bot.state = null
                openNextAhidFromQueue()
            }
            let title = bot.currentWindow.title
            let totalclicks = 0;
    
            if (potatoItem) {
                console.log('Potato... Exiting');
                bot.closeWindow(bot.currentWindow)
                bot.state = null
                openNextAhidFromQueue();
                return;
            }
            if (poorItem) {
                console.log("Poor... Exiting")
                bot.closeWindow(bot.currentWindow)
                bot.state = null
                openNextAhidFromQueue();
                return;
            }
            if (canceledItem) {
                console.log("Canceled... Exiting")
                bot.closeWindow(bot.currentWindow)
                bot.state = null
                openNextAhidFromQueue();
                return;
            }
            
            while (title?.includes("BIN Auction View") && bedItem && !potatoItem && !poorItem && !canceledItem) {
                await delay (80)
                if (bot.currentWindow) {
                    bot.currentWindow.requiresConfirmation = false;
                }
                
                bot.clickWindow(31,0,0)
                totalclicks++
                title = bot.currentWindow?.title
                if (bot.currentWindow && bot.currentWindow.slots[31]) {
                    potatoItem = bot.currentWindow.slots[31].type === 392
                    poorItem = bot.currentWindow.slots[31].type === 394
                    canceledItem = bot.currentWindow.slots[31].type === 166
                    console.log("woohoo its true and checking")
                } else {
                    console.log("somehow this is false???", bot.currentWindow?.slots[31]?.type)
                }
                
                //bedItem = bot.currentWindow.slots[31]?.type === 355
    
                if (potatoItem) {
                    console.log('Potato... Exiting');
                    bot.closeWindow(bot.currentWindow)
                    bot.state = null
                    openNextAhidFromQueue();
                    return;
                }
                if (poorItem) {
                    console.log("Poor... Exiting")
                    bot.closeWindow(bot.currentWindow)
                    bot.state = null
                    openNextAhidFromQueue();
                    return;
                }
                if (canceledItem) {
                    console.log("Canceled... Exiting")
                    bot.closeWindow(bot.currentWindow)
                    bot.state = null
                    openNextAhidFromQueue();
                    return;
                }
                
            }
            console.log(`§f[§4TEST§f]: §l§6Clicked ${totalclicks} times on the bed.`);
            totalclicks = 0;
        }
    } else {
        console.log("Bed window error, closing and resetting ):")
        if (bot.currentWindow) {
            bot.closeWindow(bot.currentWindow)
        }
        await delay(50)
        bot.state = null
        openNextAhidFromQueue()
    }
}

async function potatoHandler(slotType) {
    if (bot.state !== "buying") {return}

    if (bot.currentWindow) {
        if (bot.currentWindow.title.includes("BIN Auction View") && slotType === 392) {
            console.log("WS -> Potato:", new Date().getTime()-wsReceived, "ms");
            console.log("Potato... Closing out")
            if (bot.currentWindow) {
                bot.closeWindow(bot.currentWindow)
            }
            bot.state = null
            openNextAhidFromQueue()
        }
    } else {
        // Race the once event against a timeout
        const result = await Promise.race([
            once(bot, 'windowOpen').then(() => 'windowOpened'), // Wait for window to open
            delay(200) // Set timeout for 200ms
        ]);

        // Check the result of the race
        if (result === 'windowOpened' && bot.currentWindow.title.includes("BIN Auction View") && slotType === 392) {
            console.log("WS -> Potato:", new Date().getTime()-wsReceived, "ms");
            console.log("Potato... Closing out");
            bot.closeWindow(bot.currentWindow);
            bot.state = null;
            openNextAhidFromQueue();
        } else if (result === 'timeout') {
            // Timeout occurred before window opened
            console.log("Timeout... No window opened (potato)");
            bot.state = null;
            openNextAhidFromQueue();
        }
    }
}

async function poorHandler(slotType) {
    if (bot.state !== "buying") {return}
    if (bot.currentWindow) {
        if (bot.currentWindow.title.includes("BIN Auction View") && slotType === 394) {
            console.log("WS -> Poor:", new Date().getTime()-wsReceived, "ms");
            console.log("Poor... Closing out")
            if (bot.currentWindow) {
                bot.closeWindow(bot.currentWindow)
            }
            bot.state = null
            openNextAhidFromQueue()
        }
    } else {
        // Race the once event against a timeout
        const result = await Promise.race([
            once(bot, 'windowOpen').then(() => 'windowOpened'), // Wait for window to open
            delay(200) // Set timeout for 200ms
        ]);

        // Check the result of the race
        if (result === 'windowOpened' && bot.currentWindow.title.includes("BIN Auction View") && slotType === 394) {
            console.log("WS -> Poor:", new Date().getTime()-wsReceived, "ms");
            console.log("Poor... Closing out");
            bot.closeWindow(bot.currentWindow);
            bot.state = null;
            openNextAhidFromQueue();
        } else if (result === 'timeout') {
            // Timeout occurred before window opened
            console.log("Timeout... No window opened (poor)");
            bot.state = null;
            openNextAhidFromQueue();
        }
    }
    
}

async function featherHandler(slotType) {
    if (bot.state !== "buying") {return}
    if (bot.currentWindow) {
        if (bot.currentWindow.title.includes("BIN Auction View") && slotType === 288) {
            console.log("WS -> Feather:", new Date().getTime()-wsReceived, "ms");
            console.log("Feather... Closing out")
            if (bot.currentWindow) {
                bot.closeWindow(bot.currentWindow)
            }
            bot.state = null
            openNextAhidFromQueue()
        }
    } else {
        // Race the once event against a timeout
        const result = await Promise.race([
            once(bot, 'windowOpen').then(() => 'windowOpened'), // Wait for window to open
            delay(200) // Set timeout for 200ms
        ]);

        // Check the result of the race
        if (result === 'windowOpened' && bot.currentWindow.title.includes("BIN Auction View") && slotType === 288) {
            console.log("WS -> Feather:", new Date().getTime()-wsReceived, "ms");
            console.log("Feather... Closing out");
            bot.closeWindow(bot.currentWindow);
            bot.state = null;
            openNextAhidFromQueue();
        } else if (result === 'timeout') {
            // Timeout occurred before window opened
            console.log("Timeout... No window opened (feather)");
            bot.state = null;
            openNextAhidFromQueue();
        }
    }
    
}

bot.on('windowOpen', async (window) => {
    if (bot.state == "listing") {
        // console.log("heybozo",wun)
        if (window.title.includes("BIN Auction View")) {
            //console.log("claim detected")
            bot.currentWindow.requiresConfirmation = false;
            bot.clickWindow(31,0,0)
            console.log("claim click (listing)")
        }
    }
})

client.login(token);