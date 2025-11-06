const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Task lists for each trigger
const taskLists = {
  'coming soon': [
    "Hi <@USER_ID>, here are your tasks for the Coming Soon listing! 🎉",
    "📋 **Gather all property details** — address, description, square footage, bed/bath count, and listing price.",
    "📸 **Request or collect professional photos** and/or short video clips to showcase the property.",
    "🎨 **Create a 'Coming Soon' post and/or reel** on Canva using the brand template. Make it eye-catching!",
    "✍️ **Write a caption** with teaser-style copy and branded hashtags to build excitement.",
    "✅ **Get post approval** from Donna and Keith before going live.",
    "🚀 **Once approved**, schedule or post on Facebook, Instagram, LinkedIn, and Google Business page.",
    "💾 **Save all assets** in the marketing folder (Desktop GRG Folder and Google Drive) so everything's organized!"
  ],
  
  'just listed': [
    "Hi <@USER_ID>, here are your tasks for the Just Listed property! 🏡",
    "✅ **Confirm listing details** and ensure the MLS is active and ready to go.",
    "📸 **Download or update photos and videos** from the photographer.",
    "🌐 **Create a standalone landing page** on the website and create a QR code that leads to that page.",
    "📍 **Add listing as product**, add a new update, and upload photos with watermark to Google Business Page.",
    "📰 **Create an article** and add to the upcoming newsletter if it corresponds with the timing.",
    "🎨 **Create 'Just Listed' posts/reels/stories** using Canva with the correct branding.",
    "✍️ **Write an engaging caption** highlighting key features and include the listing price, location, and hashtags.",
    "✅ **Get approval** from Donna and Keith before posting.",
    "🚀 **Once approved**, schedule or post to Facebook, Instagram, and LinkedIn.",
    "📬 **Create postcards** and have Donna or Keith mail them using KW Command (ask for approval first).",
    "🎯 **Get 200 leads** around the area from Cole Realty to expand your reach!"
  ],
  
  'open house': [
    "Hi <@USER_ID>, here are your tasks for the Open House! 🏠✨",
    "📅 **Confirm date, time, and location** with Donna and Keith. Usually Sunday, 12-3 PM.",
    "🎨 **Create Canva graphics** with the QR code (social media post, story, and reel) to promote the event.",
    "✍️ **Write a caption** inviting people to attend and include key details (date, time, location, agent info).",
    "✅ **Get approval** from Donna and Keith before posting anything.",
    "🚀 **Schedule or post** to Facebook, Instagram, LinkedIn, and Google Business page.",
    "💰 **Create paid ads** for the Open House (3 days for $12 — get approval first!).",
    "💌 **Prepare a follow-up 'Thank You for Coming' post** template for after the event.",
    "📝 **Ask Donna or Keith** for the Open House sign-up sheet and add attendees to KW Command Contacts."
  ],
  
  'under contract': [
    "Hi <@USER_ID>, here are your tasks for the Under Contract post! 🎊",
    "✅ **Confirm property address** and contract details (buyer or seller side, closing date, etc.).",
    "🎨 **Create Canva post/reel** using the brand's 'Under Contract' layout.",
    "✍️ **Write a caption** celebrating the milestone (mention multiple offers or quick sale if applicable!).",
    "✅ **Get approval** from Donna and Keith.",
    "🚀 **Once approved**, schedule or post on Facebook, Instagram, LinkedIn, and Google Business page."
  ],
  
  'just closed': [
    "Hi <@USER_ID>, here are your tasks for the Just Closed property! 🎉🔑",
    "💰 **Confirm final sale price** and client names (with permission for social media).",
    "🎨 **Create Canva post and reel** using the 'Just Sold/Closed' layout.",
    "✍️ **Write a caption** congratulating the client with a friendly, celebratory tone!",
    "✅ **Get approval** from Donna and Keith.",
    "🚀 **Once approved**, schedule or post to Facebook, Instagram, LinkedIn, and Google Business page.",
    "📊 **Update Pipeline and Simple Monthly Revenue Tracker** to keep everything current.",
    "✔️ **Move opportunity to closed** in KW Command (if not already updated).",
    "📝 **Update KW Contact** if there are any new details to add.",
    "🏡 **Update Past Client list** and set up a Home Anniversary Smartplan.",
    "📁 **Archive the opportunity** so your system stays organized!"
  ]
};

// Function to send messages with delay
async function sendMessagesWithDelay(channel, messages, delay = 3000) {
  for (const message of messages) {
    await channel.send(message);
    if (messages.indexOf(message) < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log('🤖 Fri 💜 is ready to help Jeraaa!');
});

client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Check for trigger words
  for (const [trigger, tasks] of Object.entries(taskLists)) {
    if (content.includes(trigger)) {
      // Replace USER_ID with the message author's ID
      const personalizedTasks = tasks.map(task => 
        task.replace('<@USER_ID>', `<@${message.author.id}>`)
      );
      
      await sendMessagesWithDelay(message.channel, personalizedTasks);
      break;
    }
  }
});

// Login to Discord - REPLACE WITH YOUR ACTUAL BOT TOKEN
   client.login(process.env.DISCORD_BOT_TOKEN);
