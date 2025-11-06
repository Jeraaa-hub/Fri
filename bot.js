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
  "💜 Hi there! It's time for your biweekly tasks. I'm here with you, let's tackle these together! 🌟",
  "📰 **Newsletters** — Take your time with this one. Your words matter and people appreciate your updates!",
  "📧 **Email Campaigns** — Home Actions On Target and Smartplan (if necessary). You've got this! Remember, you're helping people find their dream homes. 🏡",
  "🌐 **Website and Google Business Page Updates** (if necessary) — Keep things fresh! Even small updates make a big difference.",
  "📱 **Social Media Updates** (if necessary) — Share what you're proud of! Your content brightens someone's day. ✨",
  "🎉 **Hub Events** — Community matters, and so do you. These events bring people together!",
  "📊 **Bookkeeping** — I know this one can feel tedious, but you're doing great keeping everything organized. Almost done!",
  "🎊 That's all for this cycle! You have two weeks, but I know you'll do amazing. I believe in you! Remember, progress over perfection. 💜"
];

// Encouraging check-in messages (will randomly pick one)
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
  { date: '2025-01-01', theme: 'Happy New Year', topics: [
    'New Year, New Home: Why January is Perfect for House Hunting in NJ',
    'New Year\'s Resolutions for Homeowners: Property Goals for 2025',
    'Fresh Start: How to Prepare Your Home for Sale in the New Year',
    'January Market Trends: What NJ Homebuyers Need to Know',
    'New Year Home Maintenance Checklist for New Jersey Properties'
  ]},
  { date: '2025-01-02', theme: "Keith's Birthday", topics: [
    'Celebrating Milestones: Why Home is Where Life\'s Best Memories Are Made',
    'Gift Yourself a New Home: January Home Buying Advantages',
    'Party-Ready Homes: Properties Perfect for Entertaining in NJ',
    'Investment in Yourself: Real Estate as a Birthday Gift to Your Future',
    'New Jersey Homes with Entertainment Spaces Worth Celebrating'
  ]},
  { date: '2025-01-15', theme: 'Martin Luther King Jr. Day', topics: [
    'Building Communities: The Dream of Homeownership in New Jersey',
    'Equal Housing Opportunities: What Every NJ Homebuyer Should Know',
    'Community and Connection: Finding Your Perfect Neighborhood in NJ',
    'The Legacy of Home: Building Wealth Through Real Estate',
    'Diverse Communities in New Jersey: Where Everyone Belongs'
  ]},
  { date: '2025-01-24', theme: 'Black History Month Teaser', topics: [
    'Celebrating Black History Through Homeownership in New Jersey',
    'Historic Black Neighborhoods in NJ and Their Real Estate Legacy',
    'Breaking Barriers: Black Excellence in New Jersey Real Estate',
    'Building Generational Wealth Through Property Ownership',
    'February Preview: Honoring Black History and Homeownership'
  ]},
  { date: '2025-02-09', theme: 'Valentines Day', topics: [
    'Fall in Love with Your Dream Home This Valentine\'s Day',
    'Love Where You Live: Finding Your Perfect Match in NJ Real Estate',
    'Romantic Homes: Properties with Charm and Character in New Jersey',
    'Couples\' Guide to Buying Your First Home Together in NJ',
    'Valentine\'s Day Home Staging Tips to Make Buyers Fall in Love'
  ]},
  { date: '2025-02-23', theme: 'Black History Month', topics: [
    'Honoring Black History: Homeownership as a Path to Prosperity',
    'Historic Black-Owned Properties and Neighborhoods in New Jersey',
    'The Impact of Black Real Estate Professionals in NJ',
    'From Struggle to Success: Black Homeownership Stories in New Jersey',
    'Building Legacy: How Real Estate Creates Generational Wealth'
  ]},
  { date: '2025-03-08', theme: 'St. Patrick\'s Day / Daylight Saving / International Women\'s Day', topics: [
    'Luck of the Irish: Finding Your Pot of Gold in NJ Real Estate',
    'Spring Forward into Homeownership: Daylight Saving Market Boost',
    'Empowered Women in Real Estate: Celebrating Homeownership',
    'Green Homes: Eco-Friendly Properties in New Jersey',
    'March Market Momentum: Why Spring is Prime Time for NJ Buyers'
  ]},
  { date: '2025-03-22', theme: 'Good Friday / Easter Monday', topics: [
    'Spring Renewal: Fresh Starts in New Jersey Real Estate',
    'Easter Weekend Open Houses: Finding Your Perfect Home',
    'Springtime Curb Appeal: Preparing Your NJ Home for Sale',
    'Family-Friendly Homes Perfect for Easter Celebrations',
    'New Beginnings: Why Spring is the Season to Buy in New Jersey'
  ]},
  { date: '2025-04-05', theme: 'World Health Day', topics: [
    'Healthy Homes: Properties That Promote Wellness in New Jersey',
    'Home Features That Support Your Health and Well-Being',
    'Access to Healthcare: NJ Neighborhoods Near Top Medical Facilities',
    'Clean Air, Clean Living: Energy-Efficient Homes in New Jersey',
    'Mental Health and Your Home: Creating Peaceful Spaces'
  ]},
  { date: '2025-04-19', theme: 'Passover / Earth Day', topics: [
    'Freedom and Home: The Significance of Homeownership',
    'Earth Day: Sustainable and Eco-Friendly Homes in New Jersey',
    'Green Living: Energy-Efficient Properties That Save Money',
    'Spring Cleaning Your Home for the Earth (and for Sale!)',
    'NJ Homes Near Parks and Natural Spaces for Earth Lovers'
  ]},
  { date: '2025-05-03', theme: 'Cinco De Mayo / Mother\'s Day', topics: [
    'Celebrating Home: Properties Perfect for Family Gatherings',
    'Mother\'s Day Gift: Helping Mom Find Her Dream Home',
    'Homes with Heart: Properties That Bring Families Together in NJ',
    'Outdoor Spaces Perfect for Cinco de Mayo Celebrations',
    'Family-Focused Neighborhoods in New Jersey'
  ]},
  { date: '2025-05-17', theme: 'Armed Forces Day / Memorial Day', topics: [
    'Honoring Service: VA Loan Benefits for Military Families in NJ',
    'Homes for Heroes: Supporting Veterans in New Jersey Real Estate',
    'Memorial Day Weekend: Kickstart Your Home Search',
    'Properties Near Military Bases and Veterans Services in NJ',
    'Thank You for Your Service: Resources for Military Homebuyers'
  ]},
  { date: '2025-05-31', theme: 'Flag Day / Father\'s Day', topics: [
    'Dad\'s Dream Home: Finding Properties with Workshop Space',
    'Patriotic Pride: American-Made Home Features and Materials',
    'Father\'s Day: Homes with Garage Space and Man Caves in NJ',
    'Family Legacy: Why Homeownership Matters for Fathers',
    'Summer Home Buying: Flag Day Marks the Start of Prime Season'
  ]},
  { date: '2025-06-28', theme: 'Independence Day', topics: [
    'Declare Your Independence: First-Time Homebuyer Guide for NJ',
    'July 4th Celebrations: Homes with Outdoor Entertainment Spaces',
    'Freedom of Homeownership: Breaking Free from Renting',
    'Firework Views: Properties with Spectacular Outdoor Spaces',
    'Summer Market Sizzle: Why July is Hot for NJ Real Estate'
  ]},
  { date: '2025-07-26', theme: 'Parent\'s Day', topics: [
    'Homes for Growing Families: Best School Districts in New Jersey',
    'Parenting and Property: Creating the Perfect Family Home',
    'Multi-Generational Homes: Space for the Whole Family in NJ',
    'Safe Neighborhoods: Where to Raise Your Family in New Jersey',
    'Home Features Parents Love: Yards, Playrooms, and Storage'
  ]},
  { date: '2025-08-23', theme: 'Labor Day + Donna\'s Birthday', topics: [
    'Labor Day Market Shift: What NJ Buyers Need to Know',
    'Celebrating Hard Work: Your Labor Deserves a Dream Home',
    'End of Summer Home Deals: Labor Day Opportunities in NJ',
    'Birthday Wishes: Milestone Celebrations in Your New Home',
    'September Market Preview: Post-Labor Day Real Estate Trends'
  ]},
  { date: '2025-09-06', theme: 'Grandparents Day / Patriot Day', topics: [
    'Multi-Generational Living: Homes Perfect for Grandparents in NJ',
    'Honoring Grandparents: Creating Legacy Through Homeownership',
    'Remembering 9/11: Community and Home in New Jersey',
    'Properties Near Senior Services and Healthcare in NJ',
    'September Home Buying: Fall Market Advantages'
  ]},
  { date: '2025-09-20', theme: 'Native American Day / Fall', topics: [
    'Honoring Heritage: Historic Properties in New Jersey',
    'Fall in Love with These Autumn-Ready New Jersey Homes',
    'Cozy Up: Homes with Fireplaces and Fall Charm in NJ',
    'Autumn Home Maintenance: Preparing for Winter in New Jersey',
    'Fall Colors and Curb Appeal: Landscaping Tips for Sellers'
  ]},
  { date: '2025-10-04', theme: 'Indigenous People\'s Day', topics: [
    'Honoring Indigenous Heritage: Historic Lands in New Jersey',
    'Respecting the Land: Sustainable Homeownership Practices',
    'October Market: Why Fall is a Great Time to Buy in NJ',
    'Native American History and New Jersey Real Estate',
    'Building on Tradition: Community-Focused Neighborhoods'
  ]},
  { date: '2025-10-18', theme: 'Halloween', topics: [
    'Spooktacular Homes: Properties with Halloween Charm in NJ',
    'Not So Scary: First-Time Homebuyer Myths Debunked',
    'Historic Homes with Character (and Maybe Ghosts!) in New Jersey',
    'Trick or Treat Streets: Family-Friendly Neighborhoods in NJ',
    'Fall Curb Appeal: Making Your Home Stand Out This Season'
  ]},
  { date: '2025-11-01', theme: 'Fallback / Veteran\'s Day', topics: [
    'Fall Back into Homeownership: November Market Opportunities',
    'Honoring Veterans: VA Loans and Benefits in New Jersey',
    'Cozy Homes for Winter: Properties with Energy Efficiency',
    'Thank You for Your Service: Resources for Veteran Homebuyers',
    'Late Fall Market: Hidden Gems and Motivated Sellers in NJ'
  ]},
  { date: '2025-11-15', theme: 'Thanksgiving + Black Friday + Cyber Monday', topics: [
    'Grateful for Home: What We\'re Thankful for This Season',
    'Holiday Hosting: Homes Perfect for Thanksgiving Gatherings',
    'Black Friday Deals? How About a New Home in New Jersey!',
    'Cyber Monday: Search NJ Listings from Your Couch',
    'November Negotiations: End-of-Year Real Estate Opportunities'
  ]},
  { date: '2025-11-29', theme: 'Pearl Harbor Day', topics: [
    'Remembering Pearl Harbor: Honor and Homeownership',
    'December Market Preview: Year-End Real Estate in NJ',
    'Military Families: Finding Home After Service',
    'Historical Significance: Preserving Heritage Through Property',
    'End of Year Planning: Real Estate Goals for 2026'
  ]},
  { date: '2025-12-13', theme: 'Winter Solstice Day + Christmas', topics: [
    'Home for the Holidays: Christmas in Your New Jersey Home',
    'Winter Solstice: New Beginnings in Real Estate',
    'Holiday Home Staging: Making Your Property Festive for Buyers',
    'Gift of Home: Why December Can Be Great for Buying',
    'Cozy Winter Properties: Homes with Holiday Charm in NJ'
  ]},
  { date: '2025-12-27', theme: 'New Year', topics: [
    'Ringing in 2026: Setting Real Estate Goals for the New Year',
    'Year-End Market Wrap: 2025 NJ Real Estate Highlights',
    'New Year, New Home: Planning Your 2026 Home Purchase',
    'Reflecting on Home: Gratitude and Growth in Real Estate',
    'Starting Fresh: January 2026 Market Preview for New Jersey'
  ]}
];

// Track sent tasks to prevent duplicates
let lastBiweeklyTaskDate = null;
let lastSocialMediaDate = null;
let lastYearlyThemeDate = null;

// Function to send messages with delay
async function sendMessagesWithDelay(channel, messages, delay = 3000) {
  for (const message of messages) {
    await channel.send(message);
    if (messages.indexOf(message) < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Function to get newsletter theme for a specific date
function getNewsletterTheme(targetDate) {
  const target = new Date(targetDate);
  const themes = newsletterThemes2025;
  
  // Find the closest theme before or on the target date
  let closestTheme = null;
  let smallestDiff = Infinity;
  
  for (const theme of themes) {
    const themeDate = new Date(theme.date);
    const diff = target - themeDate;
    
    if (diff >= 0 && diff < smallestDiff) {
      smallestDiff = diff;
      closestTheme = theme;
    }
  }
  
  return closestTheme || themes[0];
}

// Function to send newsletter reminder
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
        `Just a heads up — your next newsletter is scheduled for **${formattedDate}**.`,
        `The theme for this one is: **${theme.theme}** 🎨`,
        ``,
        `Here are 5 article topic suggestions you can use:`,
        `1. ${theme.topics[0]}`,
        `2. ${theme.topics[1]}`,
        `3. ${theme.topics[2]}`,
        `4. ${theme.topics[3]}`,
        `5. ${theme.topics[4]}`,
        ``,
        `Remember, if you have active listings, prioritize those! Otherwise, these topics should work great. You've got this! 💜`
      ];
      
      console.log(`📬 Sending newsletter reminder for ${formattedDate}...`);
      await sendMessagesWithDelay(channel, messages, 2000);
    }
  } catch (error) {
    console.error('Error sending newsletter reminder:', error);
  }
}

// Function to send social media suggestions
async function sendSocialMediaSuggestions(client) {
  try {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    
    if (lastSocialMediaDate === dateKey) {
      return; // Already sent today
    }
    
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'socmed-posts📰');
    
    if (channel) {
      // Get current theme if any
      const theme = getNewsletterTheme(now);
      const isThemeWeek = Math.abs(new Date(theme.date) - now) < 7 * 24 * 60 * 60 * 1000;
      
      let topics = [
        'Spotlight a trending NJ neighborhood and what makes it special',
        'Share a home maintenance tip for the current season',
        'Post about current mortgage rates and what they mean for buyers',
        'Highlight a local NJ business or community event',
        'Share before/after staging photos (if available)',
        'Quick tip about home value: what adds value vs what doesn\'t',
        'Feature a property type (condos, townhouses, single-family)',
        'Share a client testimonial or success story',
        'Post about hidden costs of homeownership people should know',
        'Fun fact about New Jersey real estate or local history'
      ];
      
      if (isThemeWeek) {
        topics = [
          `Create a post connecting ${theme.theme} to homeownership`,
          'Share why this time of year is great for buying/selling in NJ',
          ...topics.slice(2, 9),
          `Behind-the-scenes of preparing for ${theme.theme}`
        ];
      }
      
      const messages = [
        `Hi Jeraaa! 📰`,
        `Here's your social media content suggestions for the next two weeks. Pick what resonates with you:`,
        ``,
        ...topics.map((topic, i) => `${i + 1}. ${topic}`),
        ``,
        `Mix and match these however you like. You're doing amazing work! 💜`
      ];
      
      console.log('📱 Sending social media suggestions...');
      await sendMessagesWithDelay(channel, messages, 2000);
      lastSocialMediaDate = dateKey;
    }
  } catch (error) {
    console.error('Error sending social media suggestions:', error);
  }
}

// Function to send email campaign suggestions
async function sendEmailCampaignSuggestions(client) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'emails💌');
    
    if (channel) {
      const now = new Date();
      const month = now.toLocaleDateString('en-US', { month: 'long' });
      
      const messages = [
        `Hi Jeraaa! 💌`,
        `Here are some professional email campaign topics for this period:`,
        ``,
        `**For Active Listings:**`,
        `• New listing announcement with full property details and virtual tour link`,
        `• Price adjustment alert (if applicable)`,
        `• Open house invitation with RSVP tracking`,
        `• Just sold announcement with success story`,
        ``,
        `**Monthly Neighborhood Update:**`,
        `• ${month} market stats for [specific NJ neighborhoods]`,
        `• Recent sales and how they compare to list price`,
        `• Average days on market trends`,
        `• Neighborhood spotlight: upcoming developments or improvements`,
        ``,
        `**Biweekly Trends:**`,
        `• Current mortgage rate trends and buyer opportunities`,
        `• Inventory levels: what's available in different price ranges`,
        `• Seasonal market insights for New Jersey`,
        `• Tips for buyers/sellers in the current market`,
        ``,
        `Keep it professional and focused on providing value. You've got this! 💜`
      ];
      
      console.log('📧 Sending email campaign suggestions...');
      await sendMessagesWithDelay(channel, messages, 2000);
    }
  } catch (error) {
    console.error('Error sending email suggestions:', error);
  }
}

// Function to send yearly newsletter themes
async function sendYearlyThemes(client, year) {
  try {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => ch.name === 'newsletters📬');
    
    if (channel) {
      const messages = [
        `Hi Jeraaa! 🎊`,
        `The year is almost ending! Here's your newsletter theme calendar for ${year}:`,
        ``
      ];
      
      // Add each theme with its date
      newsletterThemes2025.forEach(theme => {
        const themeDate = new Date(theme.date);
        themeDate.setFullYear(year);
        const formatted = themeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        messages.push(`📅 **${formatted}** — ${theme.theme}`);
      });
      
      messages.push(``);
      messages.push(`I'll remind you 5 days before each newsletter is due. You're going to do great! 💜`);
      
      console.log(`📅 Sending ${year} newsletter themes...`);
      await sendMessagesWithDelay(channel, messages, 1000);
    }
  } catch (error) {
    console.error('Error sending yearly themes:', error);
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
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
  }
  
  return nextDeadline - currentDay;
}

// Function to send biweekly tasks (only on 1st and 16th)
async function sendBiweeklyTasks(client) {
  try {
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    
    if (lastBiweeklyTaskDate === dateKey) {
      return; // Already sent today
    }
    
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const channel = guild.channels.cache.find(ch => 
      ch.name.toLowerCase().includes('biweekly') && 
      ch.name.toLowerCase().includes('task')
    );
    
    if (channel) {
      console.log('📋 Sending biweekly tasks...');
      await sendMessagesWithDelay(channel, biweeklyTasks, 3000);
      lastBiweeklyTaskDate = dateKey;
    }
  } catch (error) {
    console.error('Error sending biweekly tasks:', error);
  }
}

// Function to send random check-in
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
        `⏰ You have **${daysLeft} days** left in this cycle. You're doing great! 💜`
      ];
      
      console.log('💬 Sending check-in message to main chat...');
      await sendMessagesWithDelay(channel, messagesWithDeadline, 2000);
    }
  } catch (error) {
    console.error('Error sending check-in:', error);
  }
}

// Main scheduler - checks every hour
function scheduleAllTasks(client) {
  setInterval(async () => {
    const now = new Date();
    const day = now.getDate();
    const hour = now.getHours();
    const month = now.getMonth();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Biweekly tasks: 1st and 16th at 8 AM
    if ((day === 1 || day === 16) && hour === 8) {
      await sendBiweeklyTasks(client);
      await sendEmailCampaignSuggestions(client);
    }
    
    // Social media suggestions: every 2 weeks (1st and 16th at 9 AM)
    if ((day === 1 || day === 16) && hour === 9) {
      await sendSocialMediaSuggestions(client);
    }
    
    // Newsletter reminders: 5 days before each scheduled send
    // Check if we're 5 days before any newsletter date
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + 5);
    
    const upcomingNewsletters = [
      '2025-11-17', '2025-12-01', '2025-12-15', '2025-12-29',
      '2026-01-12', '2026-01-26', '2026-02-09', '2026-02-23',
      '2026-03-09', '2026-03-23', '2026-04-06', '2026-04-20',
      '2026-05-04', '2026-05-18', '2026-06-01', '2026-06-15',
      '2026-06-29', '2026-07-13', '2026-07-27', '2026-08-10',
      '2026-08-24', '2026-09-07', '2026-09-21', '2026-10-05',
      '2026-10-19', '2026-11-02', '2026-11-16', '2026-11-30',
      '2026-12-14', '2026-12-28'
    ];
    
    for (const newsletterDate of upcomingNewsletters) {
      const nlDate = new Date(newsletterDate);
      if (checkDate.toDateString() === nlDate.toDateString() && hour === 10) {
        await sendNewsletterReminder(client, newsletterDate);
      }
    }
    
    // Yearly theme list: Last Monday of December at 10 AM
    if (month === 11 && dayOfWeek === 1 && hour === 10) { // December = month 11
      const lastMonday = new Date(now.getFullYear(), 11, 31);
      while (lastMonday.getDay() !== 1) {
        lastMonday.setDate(lastMonday.getDate() - 1);
      }
      
      const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (now.getDate() === lastMonday.getDate() && lastYearlyThemeDate !== dateKey) {
        await sendYearlyThemes(client, now.getFullYear() + 1);
        lastYearlyThemeDate = dateKey;
      }
    }
    
  }, 3600000); // Check every hour
}

// Function to schedule random check-ins (every 3-5 days)
function scheduleRandomCheckIns(client) {
  function scheduleNextCheckIn() {
    const daysUntilNext = Math.floor(Math.random() * 3) + 3;
    const hoursUntilNext = Math.floor(Math.random() * 12) + 9;
    const minutesUntilNext = Math.floor(Math.random() * 60);
    
    const msUntilNext = (daysUntilNext * 24 * 60 * 60 * 1000) + 
                        (hoursUntilNext * 60 * 60 * 1000) + 
                        (minutesUntilNext * 60 * 1000);
    
    console.log(`💭 Next check-in scheduled in ${daysUntilNext} days, ${hoursUntilNext} hours, ${minutesUntilNext} minutes`);
    
    setTimeout(() => {
      sendCheckIn(client);
      scheduleNextCheckIn();
    }, msUntilNext);
  }
  
  scheduleNextCheckIn();
}

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log('🤖 Fri 💜 is ready to help Jeraaa!');
  
  // Start the main scheduler
  scheduleAllTasks(client);
  
  // Schedule random check-ins every 3-5 days
  scheduleRandomCheckIns(client);
  
  // Check immediately if we should send anything right now
  const now = new Date();
  const day = now.getDate();
  const hour = now.getHours();
  
  // If it's the 16th and between 8-11 AM, send tasks now
  if (day === 16 && hour >= 8 && hour <= 11) {
    setTimeout(() => {
      sendBiweeklyTasks(client);
      sendSocialMediaSuggestions(client);
      sendEmailCampaignSuggestions(client);
    }, 5000);
  }
});

client.on('messageCreate', async (message) => {
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
  
  // Manual newsletter topics trigger
  if (content.includes('newsletter topics') || content.includes('newsletter ideas')) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 5);
    await sendNewsletterReminder(client, nextDate.toISOString().split('T')[0]);
    return;
  }
  
  // Manual social media trigger
  if (content.includes('social media ideas') || content.includes('post ideas')) {
    await sendSocialMediaSuggestions(client);
    return;
  }
  
  // Manual email campaign trigger
  if (content.includes('email ideas') || content.includes('campaign ideas')) {
    await sendEmailCampaignSuggestions(client);
    return;
  }

  // Check for original real estate trigger words
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
