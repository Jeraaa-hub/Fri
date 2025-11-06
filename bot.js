const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

// Create HTTP server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Fri 💜 is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Task tracking storage (in production, use a database)
const activeTasks = new Map(); // messageId -> { task, deadline, userId, channelId, completed: false }
let lastWeeklyReminderDate = null;

// Task lists for real estate triggers
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

// Biweekly tasks
const biweeklyTasks = [
  "💜 Hi there! It's time for your biweekly tasks. I'm here with you, let's tackle these together! 🌟",
  "**Newsletter**📰",
  "**Email Campaigns** — Home Actions On Target and Smartplan (if necessary)📧",
  "**Website and Google Business Page Updates** (if necessary)🌐",
  "**Social Media Updates** (if necessary)📱",
  "**Hub Events**🎉" ,
  "**Bookkeeping📊**" ,
  "🎊 That's all for this cycle! You have two weeks, but I know you'll do amazing. I believe in you! Remember, progress over perfection. 💜"
];

// Check-in messages for tasks
const taskCheckInMessages = [
  ["Hey Jeraaa! 👋", "Just checking in on your task.", "How's it going? Remember, progress over perfection! 💜"],
  ["Hi friend! 🌟", "Just wanted to see how you're doing with this task.", "No pressure! You're doing amazing. 💪"],
  ["Hello! ✨", "Friendly reminder about your task here!", "Take your time, you've got this! 💜"],
  ["Hey there! 💫", "How's this task coming along?", "Even small progress is still progress! Keep going! 🎉"],
  ["Hi Jeraaa! 🌸", "Just popping in to check on you.", "Remember, I believe in you! You're capable of great things! 💜✨"]
];

// Check-in messages
const checkInMessages = [
  ["Hey! 👋 Just checking in on you.", "How are the tasks coming along? Remember, you don't have to finish everything at once.", "You're doing better than you think! Take it one step at a time. 💜", "I'm here if you need me. You've got this! ✨"],
  ["Hi friend! 🌟", "Just a gentle reminder about your biweekly tasks.", "No pressure at all — just wanted to say I believe in you!", "You're capable of amazing things. Keep going! 💪💜"],
  ["Good day! ☀️", "Checking in to see how you're doing with your tasks.", "Remember: Progress, not perfection. Every little bit counts!", "You're not alone in this. I'm cheering for you! 🎉"],
  ["Hello! 🌸", "Just a friendly reminder that your deadline is coming up.", "But don't stress! You still have time, and you're doing great.", "Take a deep breath. You've got this! 💜✨"],
  ["Hey there! 💫", "How are your tasks going? No judgment here!", "Even if you haven't started everything, that's okay. Start small.", "I'm proud of you for showing up. That's what matters most! 💜"]
];

// Newsletter themes 2025
const newsletterThemes2025 = [
  { date: '2025-01-01', theme: 'Happy New Year', topics: ['New Year, New Home: Why January is Perfect for House Hunting in NJ', 'New Year\'s Resolutions for Homeowners: Property Goals for 2025', 'Fresh Start: How to Prepare Your Home for Sale in the New Year', 'January Market Trends: What NJ Homebuyers Need to Know', 'New Year Home Maintenance Checklist for New Jersey Properties']},
  { date: '2025-02-09', theme: 'Valentines Day', topics: ['Fall in Love with Your Dream Home This Valentine\'s Day', 'Love Where You Live: Finding Your Perfect Match in NJ Real Estate', 'Romantic Homes: Properties with Charm and Character in New Jersey', 'Couples\' Guide to Buying Your First Home Together in NJ', 'Valentine\'s Day Home Staging Tips to Make Buyers Fall in Love']},
  { date: '2025-07-04', theme: 'Independence Day', topics: ['Declare Your Independence: First-Time Homebuyer Guide for NJ', 'Freedom of Homeownership: Breaking Free from Renting', 'July 4th: Homes with Outdoor Entertainment Spaces', 'Summer Market: Why July is Hot for NJ Real Estate', 'Celebrating Independence and Homeownership']},
  { date: '2025-10-18', theme: 'Halloween', topics: ['Spooktacular Homes: Properties with Halloween Charm in NJ', 'Not So Scary: First-Time Homebuyer Myths Debunked', 'Historic Homes with Character in New Jersey', 'Trick or Treat Streets: Family-Friendly Neighborhoods', 'Fall Curb Appeal Tips']},
  { date: '2025-11-15', theme: 'Thanksgiving', topics: ['Grateful for Home: What We\'re Thankful for This Season', 'Holiday Hosting: Homes Perfect for Thanksgiving', 'November Negotiations: End-of-Year Opportunities', 'Creating Memories in Your New Home', 'Thanksgiving: A Time to Celebrate Home and Family']},
  { date: '2025-12-13', theme: 'Christmas', topics: ['Home for the Holidays: Christmas in Your New Jersey Home', 'Holiday Home Staging Tips', 'Gift of Home: Why December Can Be Great for Buying', 'Cozy Winter Properties in NJ', 'Celebrating the Season in Your Dream Home']}
];

// US Holidays
const usHolidays = [
  { date: '01-01', name: 'New Year\'s Day', emoji: '🎉', tip: 'New Year, New Home content - fresh starts and resolutions!' },
  { date: '02-14', name: 'Valentine\'s Day', emoji: '💕', tip: 'Fall in love with your dream home' },
  { date: '03-17', name: 'St. Patrick\'s Day', emoji: '🍀', tip: 'Lucky to find your dream home' },
  { date: '04-22', name: 'Earth Day', emoji: '🌍', tip: 'Eco-friendly homes and sustainable living' },
  { date: '05-11', name: 'Mother\'s Day', emoji: '💐', tip: 'Homes that moms will love' },
  { date: '06-15', name: 'Father\'s Day', emoji: '👨', tip: 'Dad\'s dream spaces - garages, workshops' },
  { date: '07-04', name: 'Independence Day', emoji: '🎆', tip: 'Freedom of homeownership' },
  { date: '09-01', name: 'Labor Day', emoji: '⚒️', tip: 'End of summer market shift' },
  { date: '10-31', name: 'Halloween', emoji: '🎃', tip: 'Family-friendly neighborhoods' },
  { date: '11-27', name: 'Thanksgiving', emoji: '🦃', tip: 'Dining spaces perfect for hosting' },
  { date: '12-25', name: 'Christmas', emoji: '🎅', tip: 'Holiday hosting spaces' }
];

let lastBiweeklyTaskDate = null;
let lastSocialMediaDate = null;
const WEBSITE_URL = 'https://thegroomesrealtygroup.kw.com/';
let previousWebsiteState = { blogs: [], listings: [], listingStatuses: {} };

async function sendMessagesWithDelay(channel, messages, delay = 3000) {
  for (const message of messages) {
    await channel.send(message);
    if (messages.indexOf(message) < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function generateAIPrompt(theme, type, style = 'cinematic') {
  const styleDescriptions = {
    realistic: 'photorealistic, high-resolution, natural lighting, professional photography',
    cinematic: 'cinematic lighting, dramatic composition, film-like quality, color graded',
    cartoon: 'playful illustration, vibrant colors, friendly cartoon style, approachable',
    minimalist: 'clean lines, minimal design, modern aesthetic, simple elegance',
    luxury: 'luxury real estate photography, high-end, sophisticated, premium quality'
  };
  const typeSpecs = {
    image: 'high-resolution image, detailed, sharp focus',
    video: 'smooth animation, dynamic camera movement, 30fps, professional video',
    gif: 'looping animation, smooth transitions, optimized for social media',
    '3d': '3D rendered, volumetric lighting, ray-traced, cinematic 3D animation'
  };
  const realEstateElements = ['beautiful architecture', 'well-maintained property', 'attractive curb appeal', 'professional real estate presentation'];
  return `${typeSpecs[type]}, ${theme} themed real estate content, ${styleDescriptions[style]}, ${realEstateElements.join(', ')}, trending on social media, engaging composition, perfect for Instagram and Facebook posts, New Jersey real estate, professional marketing material`;
}

// Random task check-in system
function scheduleRandomTaskCheckIns() {
  // Check every 6 hours for tasks that need check-ins
  setInterval(async () => {
    for (const [messageId, taskData] of activeTasks.entries()) {
      if (taskData.completed) continue;
      
      // Random chance (20%) to send a check-in
      if (Math.random() < 0.2) {
        try {
          const channel = await client.channels.fetch(taskData.channelId);
          const randomCheckIn = taskCheckInMessages[Math.floor(Math.random() * taskCheckInMessages.length)];
          
          await channel.send(`<@${taskData.userId}>`);
          await sendMessagesWithDelay(channel, randomCheckIn, 2000);
          
          // Reference the original task
          await channel.send(`📋 **Task:** ${taskData.task}\n⏰ **Deadline:** ${taskData.deadline}`);
        } catch (error) {
          console.error('Error sending task check-in:', error);
        }
      }
    }
  }, 6 * 60 * 60 * 1000); // Every 6 hours
}

// Weekly reminder for incomplete tasks
function scheduleWeeklyReminders() {
  setInterval(async () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Send every Monday at 9 AM (adjust as needed)
    if (dayOfWeek === 1 && now.getHours() === 9) {
      const lastReminderDate = lastWeeklyReminderDate ? new Date(lastWeeklyReminderDate) : null;
      if (lastReminderDate && now - lastReminderDate < 6 * 24 * 60 * 60 * 1000) {
        return; // Already sent this week
      }
      
      const incompleteTasks = [];
      for (const [messageId, taskData] of activeTasks.entries()) {
        if (!taskData.completed) {
          incompleteTasks.push(taskData);
        }
      }
      
      if (incompleteTasks.length > 0) {
        try {
          const channel = await client.channels.fetch(incompleteTasks[0].channelId);
          await channel.send(`Hi Jeraaa! 💜 It's Monday! Here's a reminder of your pending tasks:\n`);
          
          for (let i = 0; i < incompleteTasks.length; i++) {
            const task = incompleteTasks[i];
            await new Promise(resolve => setTimeout(resolve, 2000));
            await channel.send(`${i + 1}. **${task.task}** - Deadline: ${task.deadline}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          await channel.send(`\nYou've got this! Let's make this week amazing! 🌟💪`);
          
          lastWeeklyReminderDate = now.toISOString();
        } catch (error) {
          console.error('Error sending weekly reminder:', error);
        }
      }
    }
  }, 60 * 60 * 1000); // Check every hour
}

client.on('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log('🤖 Fri 💜 is ready to help Jeraaa!');
  
  // Start random task check-ins
  scheduleRandomTaskCheckIns();
  scheduleWeeklyReminders();
  
  const commands = [
    { name: 'tasks', description: 'Show your biweekly tasks' },
    { name: 'checkin', description: 'Get a motivational check-in' },
    { name: 'newsletter', description: 'Get newsletter topics' },
    { name: 'social', description: 'Get social media ideas' },
    { name: 'email', description: 'Get email campaign ideas' },
    { name: 'website', description: 'Check website updates' },
    { name: 'holidays', description: 'Show upcoming holidays' },
    { name: 'debug', description: 'Check if bot can read messages in this channel' },
    { name: 'newtask', description: 'Create a new task', options: [
      { name: 'task', type: 3, description: 'Task description', required: true },
      { name: 'deadline', type: 3, description: 'Deadline (e.g., "2 weeks", "November 15")', required: true }
    ]},
    { name: 'prompt', description: 'Generate AI prompts for images/videos', options: [
      { name: 'theme', type: 3, description: 'Theme (e.g., independence-day, halloween)', required: true },
      { name: 'type', type: 3, description: 'Type of content', required: true, choices: [
        { name: 'Image', value: 'image' },
        { name: 'Video', value: 'video' },
        { name: 'GIF', value: 'gif' },
        { name: '3D Animation', value: '3d' }
      ]},
      { name: 'style', type: 3, description: 'Visual style', required: false, choices: [
        { name: 'Realistic', value: 'realistic' },
        { name: 'Cinematic', value: 'cinematic' },
        { name: 'Cartoon/Playful', value: 'cartoon' },
        { name: 'Minimalist', value: 'minimalist' },
        { name: 'Luxury', value: 'luxury' }
      ]}
    ]},
    { name: 'resources', description: 'Get free design tool links' }
  ];
  
  try {
    const guild = client.guilds.cache.first();
    if (guild) {
      await guild.commands.set(commands);
      console.log('✅ Slash commands registered!');
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  
  try {
    if (interaction.commandName === 'newtask') {
      // Reply immediately to avoid timeout
      await interaction.reply({
        content: '⏳ Creating your task...',
        flags: 64 // This is the ephemeral flag
      });

      const task = interaction.options.getString('task');
      const deadline = interaction.options.getString('deadline');
      const userId = interaction.user.id;
      
      // Find the new-tasks channel
      const guild = interaction.guild;
      const newTasksChannel = guild.channels.cache.find(
        ch => ch.name.includes('new-tasks') || ch.name.includes('new-task')
      );
      
      if (!newTasksChannel) {
        await interaction.editReply({
          content: '❌ Could not find the new-tasks-📦 channel! Please make sure it exists.'
        });
        return;
      }
      
      // Send task to new-tasks channel
      const taskMessage = await newTasksChannel.send(
        `Hi Jeraaa! 💜 You have a new task:\n\n` +
        `📋 **Task:** ${task}\n` +
        `⏰ **Deadline:** ${deadline}\n\n` +
        `React with 👍 when you finish this task!`
      );
      
      // Store task data
      activeTasks.set(taskMessage.id, {
        task: task,
        deadline: deadline,
        userId: userId,
        channelId: newTasksChannel.id,
        completed: false,
        createdAt: new Date().toISOString()
      });
      
      await interaction.editReply({
        content: `✅ Task created successfully! Check <#${newTasksChannel.id}> 💜`
      });
    }
    
    else if (interaction.commandName === 'debug') {
      const channelName = interaction.channel.name || 'unknown';
      const isAIPromptsChannel = 
        channelName.includes('ai-prompts') || 
        channelName.includes('ai-prompt');
      
      const response = [
        `🔍 **Bot Debug Info** 💜\n`,
        `📍 **Current Channel:** ${channelName}`,
        `✅ **Is AI Prompts Channel?** ${isAIPromptsChannel ? 'YES ✅' : 'NO ❌'}`,
        `🤖 **Bot Status:** Online and listening`,
        `📨 **Can read messages?** ${interaction.guild.members.me.permissionsIn(interaction.channel).has('ViewChannel') ? 'YES ✅' : 'NO ❌'}`,
        `💬 **Can send messages?** ${interaction.guild.members.me.permissionsIn(interaction.channel).has('SendMessages') ? 'YES ✅' : 'NO ❌'}\n`,
        `💡 **Tip:** If "Is AI Prompts Channel?" is NO, the automatic prompt feature won't work here. Make sure you're in a channel with "ai-prompts" in the name!`
      ].join('\n');
      
      await interaction.reply(response);
    }
    
    else if (interaction.commandName === 'prompt') {
      const theme = interaction.options.getString('theme');
      const type = interaction.options.getString('type');
      const style = interaction.options.getString('style') || 'cinematic';
      const generatedPrompt = generateAIPrompt(theme, type, style);
      
      const response = [
        `🎨 **AI Prompt Generator** 💜\n`,
        `**Theme:** ${theme}`,
        `**Type:** ${type}`,
        `**Style:** ${style}\n`,
        `📋 **Your Custom Prompt:**`,
        `\`\`\`${generatedPrompt}\`\`\`\n`,
        `🔧 **Where to Use This:**`,
        `• **Midjourney** (Discord): Just paste this prompt!`,
        `• **DALL-E** (ChatGPT Plus): Use in ChatGPT's image generator`,
        `• **Leonardo.ai**: Paste in the prompt box`,
        `• **Runway ML**: For video generation\n`,
        `💡 **Pro Tips:**`,
        `• Add "--ar 16:9" for horizontal posts`,
        `• Add "--ar 9:16" for Instagram stories`,
        `• Add "--ar 1:1" for square posts\n`,
        `You've got this! 💜✨`
      ].join('\n');
      
      await interaction.reply(response);
    }
    
    else if (interaction.commandName === 'resources') {
      const response = [
        `🎨 **Free Design Resources** 💜\n`,
        `📸 **Free Stock Videos:**`,
        `• Pexels Videos - https://www.pexels.com/videos/`,
        `• Pixabay - https://pixabay.com/videos/\n`,
        `✨ **AI Image Generators:**`,
        `• Midjourney - https://midjourney.com (Discord-based!)`,
        `• Leonardo.ai - https://leonardo.ai (Free tier!)`,
        `• DALL-E - https://openai.com/dall-e (ChatGPT Plus)\n`,
        `🎬 **AI Video Generators:**`,
        `• Runway ML - https://runwayml.com`,
        `• Pika Labs - https://pika.art\n`,
        `🎭 **GIF Makers:**`,
        `• Canva - https://www.canva.com`,
        `• GIPHY Create - https://giphy.com/create/gifmaker\n`,
        `💡 **My Recommendation:** Start with Canva for basics, then use Leonardo.ai or Midjourney for AI!\n`,
        `You're going to create amazing content! 💜✨`
      ].join('\n');
      
      await interaction.reply(response);
    }
    
  } catch (error) {
    console.error('Error handling command:', error);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('❌ Something went wrong!');
      } else {
        await interaction.reply({ content: '❌ Something went wrong!', ephemeral: true });
      }
    } catch (e) {
      console.error('Error sending error message:', e);
    }
  }
});

// Handle reactions to task messages
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  
  // Handle partial reactions
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }
  
  // Check if this is a thumbs up on a tracked task
  if (reaction.emoji.name === '👍' && activeTasks.has(reaction.message.id)) {
    const taskData = activeTasks.get(reaction.message.id);
    
    if (!taskData.completed) {
      taskData.completed = true;
      activeTasks.set(reaction.message.id, taskData);
      
      const congratsMessages = [
        `🎉 Congrats on finishing your task, Jeraaa! 💜`,
        `I knew you could do it! Amazing work! ✨`,
        `You're absolutely crushing it! So proud of you! 🌟`
      ];
      
      const randomCongrats = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
      
      await reaction.message.channel.send(
        `${randomCongrats}\n\n` +
        `✅ **Completed:** ${taskData.task}\n\n` +
        `Keep up the incredible work! You're doing amazing things! 💪💜`
      );
    }
  }
});

client.on('messageCreate', async (message) => {
  console.log(`📨 Message received in channel: "${message.channel.name}" from ${message.author.tag}`);
  
  if (message.author.bot) {
    console.log('⏭️ Ignoring bot message');
    return;
  }
  
  const content = message.content.toLowerCase();
  console.log(`💬 Message content: "${content}"`);

  const channelName = message.channel.name || '';
  console.log(`🔍 Checking channel name: "${channelName}"`);
  
  const isAIPromptsChannel = 
    channelName.includes('ai-prompts') || 
    channelName.includes('ai-prompt');
  
  console.log(`✅ Is AI Prompts channel? ${isAIPromptsChannel}`);
  
  if (isAIPromptsChannel) {
    console.log('✨ AI Prompts channel detected! Processing message...');
    
    let type = 'image';
    let style = 'cinematic';
    let theme = 'real estate';
    
    if (content.includes('video') || content.includes('clip')) type = 'video';
    if (content.includes('gif') || content.includes('animated')) type = 'gif';
    if (content.includes('3d') || content.includes('animated')) type = '3d';
    
    console.log(`🎬 Detected type: ${type}`);
    
    if (content.includes('realistic') || content.includes('photo')) style = 'realistic';
    if (content.includes('cartoon') || content.includes('playful')) style = 'cartoon';
    if (content.includes('minimal')) style = 'minimalist';
    if (content.includes('luxury')) style = 'luxury';
    
    console.log(`🎨 Detected style: ${style}`);
    
    const holidayKeywords = {
      'independence': 'Independence Day', 
      'july 4': 'Independence Day',
      'fourth of july': 'Independence Day',
      'american flag': 'Independence Day',
      'flag': 'patriotic',
      'christmas': 'Christmas', 
      'xmas': 'Christmas',
      'halloween': 'Halloween',
      'thanksgiving': 'Thanksgiving',
      'valentine': 'Valentine\'s Day',
      'new year': 'New Year\'s',
      'mother': 'Mother\'s Day', 
      'father': 'Father\'s Day',
      'house': 'beautiful home',
      'home': 'beautiful home',
      'property': 'real estate property'
    };
    
    for (const [keyword, holidayTheme] of Object.entries(holidayKeywords)) {
      if (content.includes(keyword)) {
        theme = holidayTheme;
        break;
      }
    }
    
    console.log(`🎯 Detected theme: ${theme}`);
    
    const generatedPrompt = generateAIPrompt(theme, type, style);
    
    console.log(`📝 Generated prompt: ${generatedPrompt.substring(0, 100)}...`);
    
    try {
      await message.channel.send(`Hi Jeraaa! 🎨 I heard your vision!\n\n**What you asked for:** ${message.content}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await message.channel.send(`📋 **Your Custom AI Prompt:**\n\`\`\`${generatedPrompt}\`\`\``);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await message.channel.send(
        `🔧 **Where to Use:**\n` +
        `• **Midjourney**: /imagine [paste prompt]\n` +
        `• **DALL-E**: Paste in ChatGPT\n` +
        `• **Leonardo.ai**: Copy to prompt box\n\n` +
        `💡 **Tips:**\n` +
        `• Social posts: add "--ar 1:1"\n` +
        `• Stories: add "--ar 9:16"\n\n` +
        `Your vision is going to look AMAZING! 💜✨`
      );
      
      console.log('✅ AI Prompt sent successfully!');
    } catch (error) {
      console.error('❌ Error sending AI prompt:', error);
      try {
        await message.channel.send('❌ Oops! Something went wrong generating your prompt. Try again! 💜');
      } catch (e) {
        console.error('❌ Failed to send error message:', e);
      }
    }
    
    return;
  }

  for (const [trigger, tasks] of Object.entries(taskLists)) {
    if (content.includes(trigger)) {
      console.log(`🏠 Real estate trigger detected: ${trigger}`);
      const personalizedTasks = tasks.map(task => task.replace('<@USER_ID>', `<@${message.author.id}>`));
      await sendMessagesWithDelay(message.channel, personalizedTasks);
      break;
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
