const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Original task lists for each real estate trigger
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

// Your biweekly personal tasks
const biweeklyTasks = [
  "💜 Hi there! It's time for your biweekly tasks. 🌟",
  "📰 **Newsletters**",
  "📧 **Email Campaigns** — Home Actions On Target and Smartplan (if necessary).",
  "🌐 **Website and Google Business Page Updates** (if necessary).",
  "📱 **Social Media Updates** (if necessary) ✨",
  "🎉 **Hub Events**",
  "📊 **Bookkeeping**",
  "🎊 That's all for this cycle! You have two weeks. 💜"
];

// Encouraging check-in messages (will randomly pick one)
const checkInMessages = [
  [
    "How are the tasks coming along? Remember, you don't have to finish everything at once.",
    "You're doing better than you think! Take it one step at a time. 💜",
    "Hi! You've got this! ✨"
  ],
  [
    "Hi friend! 🌟",
    "Just a gentle reminder about your biweekly tasks.",
    "No pressure at all — just wanted to say I believe in you!",
    "You're capable of amazing things. Keep going! 💪💜"
  ],
  [
    "Good day! ☀️",
    "Checking in to see how you're doing with your tasks.",
    "Remember: Progress, not perfection. Every little bit counts!",
    "You're not alone in this. I'm cheering for you! 🎉"
  ],
  [
    "Hello! 🌸",
    "Just a friendly reminder that your deadline is coming up.",
    "But don't stress! You still have time, and you're doing great.",
    "Take a deep breath. You've got this! 💜✨"
  ],
  [
    "Hey there! 💫",
    "How are your tasks going? No judgment here!",
    "Even if you haven't started everything, that's okay. Start small.",
    "I'm proud of you for showing up. That's what matters most! 💜"
  ]
];

// Function to send messages with delay
async function sendMessagesWithDelay(channel, messages, delay = 3000) {
  for (const message of messages) {
    await channel.send(message);
    if (messages.indexOf(message) < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Function to get days until next deadline
function getDaysUntilDeadline() {
  const now = new Date();
  const currentDay = now.getDate();
  
  let nextDeadline;
  if (currentDay < 16) {
    nextDeadline = 16;
  } else {
    // Next month, 1st day
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
  }
  
  return nextDeadline - currentDay;
}

// Function to send biweekly tasks (to biweekly-task channel)
async function sendBiweeklyTasks(client) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => 
      ch.name.toLowerCase().includes('biweekly') && 
      ch.name.toLowerCase().includes('task')
    );
    
    if (channel) {
      console.log('📋 Sending biweekly tasks...');
      await sendMessagesWithDelay(channel, biweeklyTasks, 3000);
    }
  } catch (error) {
    console.error('Error sending biweekly tasks:', error);
  }
}

// Function to send random check-in (to main chat channel)
async function sendCheckIn(client) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    // Look for main chat channel instead of biweekly-task channel
    const channel = guild.channels.cache.find(ch => 
      ch.name.toLowerCase().includes('chat') || 
      ch.name.toLowerCase().includes('general') ||
      ch.name.toLowerCase() === 'main'
    );
    
    if (channel) {
      const daysLeft = getDaysUntilDeadline();
      const randomMessages = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
      
      // Add days left info to the messages
      const messagesWithDeadline = [
        ...randomMessages,
        `⏰ You have **${daysLeft} days** left in this cycle. You're doing great! 💜`
      ];
      
      console.log('💬 Sending check-in message to main chat...');
      await sendMessagesWithDelay(channel, messagesWithDeadline, 2000);
    } else {
      console.log('⚠️ Main chat channel not found. Please create a channel with "chat", "general", or "main" in the name.');
    }
  } catch (error) {
    console.error('Error sending check-in:', error);
  }
}

// Function to schedule next task send (1st and 16th at 8 AM CST)
function scheduleTaskSend(client) {
  setInterval(() => {
    const now = new Date();
    
    // Convert to CST (UTC-6)
    const cstOffset = -6 * 60; // CST is UTC-6
    const cstTime = new Date(now.getTime() + (cstOffset * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
    
    const day = cstTime.getDate();
    const hour = cstTime.getHours();
    const minute = cstTime.getMinutes();
    
    // Send at 8:00 AM CST on 1st and 16th
    if ((day === 1 || day === 16) && hour === 8 && minute === 0) {
      sendBiweeklyTasks(client);
    }
  }, 60000); // Check every minute
}

// Function to schedule random check-ins (every 3-5 days)
function scheduleRandomCheckIns(client) {
  function scheduleNextCheckIn() {
    // Random days between 3-5 days
    const daysUntilNext = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5 days
    const hoursUntilNext = Math.floor(Math.random() * 12) + 9; // Between 9 AM and 9 PM
    const minutesUntilNext = Math.floor(Math.random() * 60);
    
    const msUntilNext = (daysUntilNext * 24 * 60 * 60 * 1000) + 
                        (hoursUntilNext * 60 * 60 * 1000) + 
                        (minutesUntilNext * 60 * 1000);
    
    console.log(`💭 Next check-in scheduled in ${daysUntilNext} days, ${hoursUntilNext} hours, ${minutesUntilNext} minutes`);
    
    setTimeout(() => {
      sendCheckIn(client);
      scheduleNextCheckIn(); // Schedule the next one
    }, msUntilNext);
  }
  
  scheduleNextCheckIn();
}

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log('🤖 Fri 💜 is ready to help Jeraaa!');
  
  // Send tasks immediately on first deploy (since it's the 5th and you want them now)
  setTimeout(() => {
    sendBiweeklyTasks(client);
  }, 5000); // Wait 5 seconds after bot starts
  
  // Schedule regular biweekly sends (1st and 16th at 8 AM CST)
  scheduleTaskSend(client);
  
  // Schedule random check-ins every 3-5 days
  scheduleRandomCheckIns(client);
});

client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Manual trigger for biweekly tasks
  if (content.includes('biweekly tasks') || content.includes('my tasks')) {
    await sendMessagesWithDelay(message.channel, biweeklyTasks, 3000);
    return;
  }
  
  // Manual check-in trigger
  if (content.includes('check in') || content.includes('how am i doing')) {
    const daysLeft = getDaysUntilDeadline();
    const randomMessages = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
    const messagesWithDeadline = [
      ...randomMessages,
      `⏰ You have **${daysLeft} days** left in this cycle. You're doing great! 💜`
    ];
    await sendMessagesWithDelay(message.channel, messagesWithDeadline, 2000);
    return;
  }

  // Check for original real estate trigger words
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

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);
