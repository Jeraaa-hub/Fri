const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

// Create a simple HTTP server to keep Render happy
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
  "💜 Hi there! It's time for your biweekly tasks. I'm here with you, let's tackle these together! 🌟",
  "📰 **Newsletters** — Take your time with this one. Your words matter and people appreciate your updates!",
  "📧 **Email Campaigns** — Home Actions On Target and Smartplan (if necessary). You've got this! Remember, you're helping people find their dream homes. 🏡",
  "🌐 **Website and Google Business Page Updates** (if necessary) — Keep things fresh! Even small updates make a big difference.",
  "📱 **Social Media Updates** (if necessary) — Share what you're proud of! Your content brightens someone's day. ✨",
  "🎉 **Hub Events** — Community matters, and so do you. These events bring people together!",
  "📊 **Bookkeeping** — I know this one can feel tedious, but you're doing great keeping everything organized. Almost done!",
  "🎊 That's all for this cycle! You have two weeks, but I know you'll do amazing. I believe in you! Remember, progress over perfection. 💜"
];

// Encouraging check-in messages
const checkInMessages = [
  [
    "Hey! 👋 Just checking in on you.",
    "How are the tasks coming along? Remember, you don't have to finish everything at once.",
    "You're doing better than you think! Take it one step at a time. 💜",
    "I'm here if you need me. You've got this! ✨"
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

// Newsletter themes with their 2025 dates
const newsletterThemes2025 = [
  { date: '2025-01-01', theme: 'Happy New Year', topics: ['New Year, New Home: Why January is Perfect for House Hunting in NJ', 'New Year\'s Resolutions for Homeowners: Property Goals for 2025', 'Fresh Start: How to Prepare Your Home for Sale in the New Year', 'January Market Trends: What NJ Homebuyers Need to Know', 'New Year Home Maintenance Checklist for New Jersey Properties']},
  { date: '2025-01-02', theme: "Keith's Birthday", topics: ['Celebrating Milestones: Why Home is Where Life\'s Best Memories Are Made', 'Gift Yourself a New Home: January Home Buying Advantages', 'Party-Ready Homes: Properties Perfect for Entertaining in NJ', 'Investment in Yourself: Real Estate as a Birthday Gift to Your Future', 'New Jersey Homes with Entertainment Spaces Worth Celebrating']},
  { date: '2025-01-15', theme: 'Martin Luther King Jr. Day', topics: ['Building Communities: The Dream of Homeownership in New Jersey', 'Equal Housing Opportunities: What Every NJ Homebuyer Should Know', 'Community and Connection: Finding Your Perfect Neighborhood in NJ', 'The Legacy of Home: Building Wealth Through Real Estate', 'Diverse Communities in New Jersey: Where Everyone Belongs']},
  { date: '2025-02-09', theme: 'Valentines Day', topics: ['Fall in Love with Your Dream Home This Valentine\'s Day', 'Love Where You Live: Finding Your Perfect Match in NJ Real Estate', 'Romantic Homes: Properties with Charm and Character in New Jersey', 'Couples\' Guide to Buying Your First Home Together in NJ', 'Valentine\'s Day Home Staging Tips to Make Buyers Fall in Love']},
  { date: '2025-03-08', theme: 'St. Patrick\'s Day / International Women\'s Day', topics: ['Luck of the Irish: Finding Your Pot of Gold in NJ Real Estate', 'Spring Forward into Homeownership', 'Empowered Women in Real Estate: Celebrating Homeownership', 'Green Homes: Eco-Friendly Properties in New Jersey', 'March Market Momentum: Why Spring is Prime Time for NJ Buyers']},
  { date: '2025-04-19', theme: 'Earth Day', topics: ['Earth Day: Sustainable and Eco-Friendly Homes in New Jersey', 'Green Living: Energy-Efficient Properties That Save Money', 'Spring Cleaning Your Home for the Earth', 'NJ Homes Near Parks and Natural Spaces', 'Building a Sustainable Future Through Smart Homeownership']},
  { date: '2025-05-03', theme: 'Mother\'s Day', topics: ['Mother\'s Day Gift: Helping Mom Find Her Dream Home', 'Homes with Heart: Properties That Bring Families Together in NJ', 'Family-Focused Neighborhoods in New Jersey', 'Creating Spaces Moms Will Love', 'Celebrating Home and Family This Mother\'s Day']},
  { date: '2025-06-15', theme: 'Father\'s Day', topics: ['Dad\'s Dream Home: Finding Properties with Workshop Space', 'Father\'s Day: Homes with Garage Space and Man Caves in NJ', 'Family Legacy: Why Homeownership Matters for Fathers', 'Outdoor Spaces Perfect for Dad', 'Investment in Family: Building Wealth Through Real Estate']},
  { date: '2025-07-04', theme: 'Independence Day', topics: ['Declare Your Independence: First-Time Homebuyer Guide for NJ', 'Freedom of Homeownership: Breaking Free from Renting', 'July 4th: Homes with Outdoor Entertainment Spaces', 'Summer Market: Why July is Hot for NJ Real Estate', 'Celebrating Independence and Homeownership']},
  { date: '2025-08-23', theme: 'Labor Day', topics: ['Labor Day Market Shift: What NJ Buyers Need to Know', 'Celebrating Hard Work: Your Labor Deserves a Dream Home', 'End of Summer Home Deals', 'September Market Preview: Post-Labor Day Trends', 'Honoring Hard Work Through Homeownership']},
  { date: '2025-10-18', theme: 'Halloween', topics: ['Spooktacular Homes: Properties with Halloween Charm in NJ', 'Not So Scary: First-Time Homebuyer Myths Debunked', 'Historic Homes with Character in New Jersey', 'Trick or Treat Streets: Family-Friendly Neighborhoods', 'Fall Curb Appeal Tips']},
  { date: '2025-11-15', theme: 'Thanksgiving', topics: ['Grateful for Home: What We\'re Thankful for This Season', 'Holiday Hosting: Homes Perfect for Thanksgiving', 'November Negotiations: End-of-Year Opportunities', 'Creating Memories in Your New Home', 'Thanksgiving: A Time to Celebrate Home and Family']},
  { date: '2025-12-13', theme: 'Christmas', topics: ['Home for the Holidays: Christmas in Your New Jersey Home', 'Holiday Home Staging Tips', 'Gift of Home: Why December Can Be Great for Buying', 'Cozy Winter Properties in NJ', 'Celebrating the Season in Your Dream Home']}
];

// US Holidays
const usHolidays = [
  { date: '01-01', name: 'New Year\'s Day', emoji: '🎉', tip: 'New Year, New Home content - fresh starts and resolutions!' },
  { date: '01-15', name: 'Martin Luther King Jr. Day', emoji: '✊', tip: 'Community and homeownership - equal housing opportunities' },
  { date: '02-14', name: 'Valentine\'s Day', emoji: '💕', tip: 'Fall in love with your dream home' },
  { date: '03-17', name: 'St. Patrick\'s Day', emoji: '🍀', tip: 'Lucky to find your dream home' },
  { date: '04-22', name: 'Earth Day', emoji: '🌍', tip: 'Eco-friendly homes and sustainable living' },
  { date: '05-11', name: 'Mother\'s Day', emoji: '💐', tip: 'Homes that moms will love' },
  { date: '05-26', name: 'Memorial Day', emoji: '🇺🇸', tip: 'VA loan info and military resources' },
  { date: '06-15', name: 'Father\'s Day', emoji: '👨', tip: 'Dad\'s dream spaces - garages, workshops' },
  { date: '07-04', name: 'Independence Day', emoji: '🎆', tip: 'Freedom of homeownership' },
  { date: '09-01', name: 'Labor Day', emoji: '⚒️', tip: 'End of summer market shift' },
  { date: '10-31', name: 'Halloween', emoji: '🎃', tip: 'Family-friendly neighborhoods' },
  { date: '11-11', name: 'Veterans Day', emoji: '🎖️', tip: 'VA loan benefits and resources' },
  { date: '11-27', name: 'Thanksgiving', emoji: '🦃', tip: 'Dining spaces perfect for hosting' },
  { date: '12-25', name: 'Christmas', emoji: '🎅', tip: 'Holiday hosting spaces' }
];

let lastBiweeklyTaskDate = null;
let lastSocialMediaDate = null;

const WEBSITE_URL = 'https://thegroomesrealtygroup.kw.com/';
let previousWebsiteState = {
  blogs: [],
  listings: [],
  listingStatuses: {}
};

async function sendMessagesWithDelay(channel, messages, delay = 3000) {
  for (const message of messages) {
    await channel.send(message);
    if (messages.indexOf(message) < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function getNewsletterTheme(targetDate) {
  const target = new Date(targetDate);
  let closestTheme = null;
  let smallestDiff = Infinity;
  
  for (const theme of newsletterThemes2025) {
    const themeDate = new Date(theme.date);
    const diff = target - themeDate;
    
    if (diff >= 0 && diff < smallestDiff) {
      smallestDiff = diff;
      closestTheme = theme;
    }
  }
  
  return closestTheme || newsletterThemes2025[0];
}

async function sendNewsletterReminder(client, newsletterDate) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'newsletters📬');
    
    if (channel) {
      const theme = getNewsletterTheme(newsletterDate);
      const formattedDate = new Date(newsletterDate).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      const messages = [
        `Hi Jeraaa! 📬`,
        `Your next newsletter is scheduled for **${formattedDate}**.`,
        `Theme: **${theme.theme}** 🎨`,
        ``,
        `Here are 5 article topic suggestions:`,
        `1. ${theme.topics[0]}`,
        `2. ${theme.topics[1]}`,
        `3. ${theme.topics[2]}`,
        `4. ${theme.topics[3]}`,
        `5. ${theme.topics[4]}`,
        ``,
        `You've got this! 💜`
      ];
      
      await sendMessagesWithDelay(channel, messages, 2000);
    }
  } catch (error) {
    console.error('Error sending newsletter reminder:', error);
  }
}

async function sendSocialMediaSuggestions(client) {
  try {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    
    if (lastSocialMediaDate === dateKey) return;
    
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'socmed-posts📰');
    
    if (channel) {
      const topics = [
        'Spotlight a trending NJ neighborhood',
        'Share a home maintenance tip',
        'Post about current mortgage rates',
        'Highlight a local NJ business',
        'Share staging tips',
        'Feature a property type',
        'Post a client testimonial',
        'Share hidden costs of homeownership',
        'Fun fact about NJ real estate'
      ];
      
      const messages = [
        `Hi Jeraaa! 📰`,
        `Here's your social media content suggestions:`,
        ``,
        ...topics.map((topic, i) => `${i + 1}. ${topic}`),
        ``,
        `You're doing amazing! 💜`
      ];
      
      await sendMessagesWithDelay(channel, messages, 2000);
      lastSocialMediaDate = dateKey;
    }
  } catch (error) {
    console.error('Error sending social media suggestions:', error);
  }
}

async function sendEmailCampaignSuggestions(client) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'emails💌');
    
    if (channel) {
      const messages = [
        `Hi Jeraaa! 💌`,
        `Email campaign topics for this period:`,
        ``,
        `**Active Listings:**`,
        `• New listing announcements`,
        `• Open house invitations`,
        `• Price updates`,
        ``,
        `**Market Updates:**`,
        `• Monthly NJ market stats`,
        `• Mortgage rate trends`,
        `• Seasonal insights`,
        ``,
        `You've got this! 💜`
      ];
      
      await sendMessagesWithDelay(channel, messages, 2000);
    }
  } catch (error) {
    console.error('Error sending email suggestions:', error);
  }
}

async function checkWebsiteUpdates(client) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'website🌍');
    if (!channel) return;
    
    const response = await fetch(WEBSITE_URL);
    const html = await response.text();
    
    const currentBlogs = [];
    const currentListings = [];
    const currentListingStatuses = {};
    
    const blogMatches = html.matchAll(/href="([^"]*\/blog\/[^"]*)"/g);
    for (const match of blogMatches) {
      currentBlogs.push(match[1]);
    }
    
    const listingMatches = html.matchAll(/href="([^"]*\/listing\/[^"]*)"/g);
    for (const match of listingMatches) {
      currentListings.push(match[1]);
      currentListingStatuses[match[1]] = 'active';
    }
    
    for (const blog of currentBlogs) {
      if (!previousWebsiteState.blogs.includes(blog)) {
        const fullUrl = blog.startsWith('http') ? blog : `${WEBSITE_URL}${blog.replace(/^\//, '')}`;
        await channel.send(`📝 **New blog added!**\n${fullUrl}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    for (const listing of currentListings) {
      if (!previousWebsiteState.listings.includes(listing)) {
        const fullUrl = listing.startsWith('http') ? listing : `${WEBSITE_URL}${listing.replace(/^\//, '')}`;
        await channel.send(`🏡 **New listing added!**\n${fullUrl}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    previousWebsiteState.blogs = currentBlogs;
    previousWebsiteState.listings = currentListings;
    previousWebsiteState.listingStatuses = currentListingStatuses;
    
  } catch (error) {
    console.error('Error checking website:', error);
  }
}

async function manualWebsiteCheck(client, channel) {
  try {
    await channel.send('🔍 Checking the website...');
    await checkWebsiteUpdates(client);
    await channel.send('✅ Website check complete! 💜');
  } catch (error) {
    await channel.send('❌ Sorry, I had trouble checking the website.');
    console.error('Error in manual check:', error);
  }
}

async function checkUpcomingHolidays(client) {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(now.getDate() + 3);
    
    const threeDaysStr = `${String(threeDaysLater.getMonth() + 1).padStart(2, '0')}-${String(threeDaysLater.getDate()).padStart(2, '0')}`;
    
    for (const holiday of usHolidays) {
      if (holiday.date === threeDaysStr) {
        const guild = client.guilds.cache.first();
        const channel = guild?.channels.cache.find(ch => ch.name === 'holidays🎉');
        
        if (channel) {
          const messages = [
            `Hi Jeraaa! ${holiday.emoji}`,
            `**${holiday.name}** is coming up!`,
            ``,
            `💡 ${holiday.tip}`,
            ``,
            `Great opportunity for content! 💜`
          ];
          await sendMessagesWithDelay(channel, messages, 2000);
        }
      }
    }
  } catch (error) {
    console.error('Error checking holidays:', error);
  }
}

function getDaysUntilDeadline() {
  const now = new Date();
  const currentDay = now.getDate();
  
  if (currentDay < 16) {
    return 16 - currentDay;
  } else {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
  }
}

async function sendBiweeklyTasks(client) {
  try {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    
    if (lastBiweeklyTaskDate === dateKey) return;
    
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => 
      ch.name.toLowerCase().includes('biweekly') && 
      ch.name.toLowerCase().includes('task')
    );
    
    if (channel) {
      await sendMessagesWithDelay(channel, biweeklyTasks, 3000);
      lastBiweeklyTaskDate = dateKey;
    }
  } catch (error) {
    console.error('Error sending biweekly tasks:', error);
  }
}

async function sendCheckIn(client) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'main-chat📱');
    
    if (channel) {
      const daysLeft = getDaysUntilDeadline();
      const randomMessages = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
      
      const messagesWithDeadline = [
        ...randomMessages,
        `⏰ You have **${daysLeft} days** left. You're doing great! 💜`
      ];
      
      await sendMessagesWithDelay(channel, messagesWithDeadline, 2000);
    }
  } catch (error) {
    console.error('Error sending check-in:', error);
  }
}

function scheduleAllTasks(client) {
  setInterval(async () => {
    const now = new Date();
    const day = now.getDate();
    const hour = now.getHours();
    
    if ((day === 1 || day === 16) && hour === 8) {
      await sendBiweeklyTasks(client);
      await sendEmailCampaignSuggestions(client);
    }
    
    if ((day === 1 || day === 16) && hour === 9) {
      await sendSocialMediaSuggestions(client);
    }
    
    if (hour % 2 === 0) {
      await checkWebsiteUpdates(client);
    }
    
    if (hour === 9) {
      await checkUpcomingHolidays(client);
    }
    
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + 5);
    
    const upcomingNewsletters = [
      '2025-11-17', '2025-12-01', '2025-12-15', '2025-12-29',
      '2026-01-12', '2026-01-26', '2026-02-09', '2026-02-23'
    ];
    
    for (const newsletterDate of upcomingNewsletters) {
      const nlDate = new Date(newsletterDate);
      if (checkDate.toDateString() === nlDate.toDateString() && hour === 10) {
        await sendNewsletterReminder(client, newsletterDate);
      }
    }
    
  }, 3600000);
}

function scheduleRandomCheckIns(client) {
  function scheduleNext() {
    const days = Math.floor(Math.random() * 3) + 3;
    const hours = Math.floor(Math.random() * 12) + 9;
    const ms = (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
    
    console.log(`💭 Next check-in in ${days} days, ${hours} hours`);
    
    setTimeout(() => {
      sendCheckIn(client);
      scheduleNext();
    }, ms);
  }
  
  scheduleNext();
}

client.on('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log('🤖 Fri 💜 is ready to help Jeraaa!');
  
  const commands = [
    { name: 'tasks', description: 'Show your biweekly tasks' },
    { name: 'checkin', description: 'Get a motivational check-in' },
    { name: 'newsletter', description: 'Get newsletter topics' },
    { name: 'social', description: 'Get social media ideas' },
    { name: 'email', description: 'Get email campaign ideas' },
    { name: 'website', description: 'Check website updates' },
    { name: 'holidays', description: 'Show upcoming holidays' }
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
  
  scheduleAllTasks(client);
  scheduleRandomCheckIns(client);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    await interaction.deferReply();

    if (interaction.commandName === 'tasks') {
      await sendMessagesWithDelay(interaction.channel, biweeklyTasks, 3000);
      await interaction.editReply('✅ Tasks posted above! 💜');
    }
    
    else if (interaction.commandName === 'checkin') {
      const daysLeft = getDaysUntilDeadline();
      const randomMessages = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
      const messagesWithDeadline = [
        ...randomMessages,
        `⏰ **${daysLeft} days** left. You're doing great! 💜`
      ];
      await sendMessagesWithDelay(interaction.channel, messagesWithDeadline, 2000);
      await interaction.editReply('✅ Check-in sent! 💜');
    }
    
    else if (interaction.commandName === 'newsletter') {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 5);
      await sendNewsletterReminder(client, nextDate.toISOString().split('T')[0]);
      await interaction.editReply('✅ Newsletter topics sent! 📬');
    }
    
    else if (interaction.commandName === 'social') {
      await sendSocialMediaSuggestions(client);
      await interaction.editReply('✅ Social media ideas sent! 📱');
    }
    
    else if (interaction.commandName === 'email') {
      await sendEmailCampaignSuggestions(client);
      await interaction.editReply('✅ Email ideas sent! 💌');
    }
    
    else if (interaction.commandName === 'website') {
      await manualWebsiteCheck(client, interaction.channel);
      await interaction.editReply('✅ Website check done! 🌍');
    }
    
    else if (interaction.commandName === 'holidays') {
      const now = new Date();
      const upcoming = [];
      
      for (const holiday of usHolidays) {
        const [month, day] = holiday.date.split('-').map(Number);
        const holidayDate = new Date(now.getFullYear(), month - 1, day);
        
        if (holidayDate < now) {
          holidayDate.setFullYear(now.getFullYear() + 1);
        }
        
        const daysUntil = Math.ceil((holidayDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 30) {
          upcoming.push({ ...holiday, daysUntil, fullDate: holidayDate });
        }
      }
      
      upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
      
      const messages = [
        'Hi Jeraaa! 🎉 Upcoming holidays:',
        ''
      ];
      
      upcoming.forEach(h => {
        const dateStr = h.fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        messages.push(`${h.emoji} **${h.name}** - ${dateStr} (${h.daysUntil} days)`);
        messages.push(`   💡 ${h.tip}`);
        messages.push('');
      });
      
      if (upcoming.length === 0) {
        messages.push('No holidays in the next 30 days! 💜');
      }
      
      await sendMessagesWithDelay(interaction.channel, messages, 1500);
      await interaction.editReply('✅ Holiday calendar sent! 🎉');
    }
    
  } catch (error) {
    console.error('Error handling command:', error);
    await interaction.editReply('❌ Something went wrong!');
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content.includes('biweekly tasks') || content.includes('my tasks')) {
    await sendMessagesWithDelay(message.channel, biweeklyTasks, 3000);
    return;
  }
  
  if (content.includes('check in') || content.includes('how am i doing')) {
    const daysLeft = getDaysUntilDeadline();
    const randomMessages = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
    const messagesWithDeadline = [
      ...randomMessages,
      `⏰ **${daysLeft} days** left. You're doing great! 💜`
    ];
    await sendMessagesWithDelay(message.channel, messagesWithDeadline, 2000);
    return;
  }
  
  if (content.includes('newsletter topics') || content.includes('newsletter ideas')) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 5);
    await sendNewsletterReminder(client, nextDate.toISOString().split('T')[0]);
    return;
  }
  
  if (content.includes('social media ideas') || content.includes('post ideas')) {
    await sendSocialMediaSuggestions(client);
    return;
  }
  
  if (content.includes('email ideas') || content.includes('campaign ideas')) {
    await sendEmailCampaignSuggestions(client);
    return;
  }
  
  if (content.includes('check website') || content.includes('website updates')) {
    await manualWebsiteCheck(client, message.channel);
    return;
  }
  
  if (content.includes('upcoming holidays') || content.includes('next holidays')) {
    const now = new Date();
    const upcoming = [];
    
    for (const holiday of usHolidays) {
      const [month, day] = holiday.date.split('-').map(Number);
      const holidayDate = new Date(now.getFullYear(), month - 1, day);
      
      if (holidayDate < now) {
        holidayDate.setFullYear(now.getFullYear() + 1);
      }
      
      const daysUntil = Math.ceil((holidayDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 30) {
        upcoming.push({ ...holiday, daysUntil, fullDate: holidayDate });
      }
    }
    
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    
    const messages = [
      'Hi Jeraaa! 🎉 Upcoming holidays:',
      ''
    ];
    
    upcoming.forEach(h => {
      const dateStr = h.fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      messages.push(`${h.emoji} **${h.name}** - ${dateStr} (${h.daysUntil} days)`);
      messages.push(`   💡 ${h.tip}`);
      messages.push('');
    });
    
    if (upcoming.length === 0) {
      messages.push('No holidays in the next 30 days! 💜');
    }
    
    await sendMessagesWithDelay(message.channel, messages, 1500);
    return;
  }

  for (const [trigger, tasks] of Object.entries(taskLists)) {
    if (content.includes(trigger)) {
      const personalizedTasks = tasks.map(task => 
        task.replace('<@USER_ID>', `<@${message.author.id}>`)
      );
      
      await sendMessagesWithDelay(message.channel, personalizedTasks);
      break;
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
