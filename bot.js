const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const http = require('http');
const url = require('url');

// Webhook secret for security
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key-here';

// Create HTTP server for Render AND webhooks
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Fri 💜 is running!');
    return;
  }
  
  if (parsedUrl.pathname === '/webhook/social-media' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (data.secret !== WEBHOOK_SECRET) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }
        await handleSocialMediaWebhook(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Webhook received!' }));
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }
  
  if (parsedUrl.pathname === '/webhook/google-business' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (data.secret !== WEBHOOK_SECRET) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }
        await handleGoogleBusinessWebhook(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Webhook received!' }));
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
  console.log(`📡 Webhook endpoints ready!`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const activeTasks = new Map();
let lastWeeklyReminderDate = null;
const taskGroups = new Map();

// EXPANDED Holiday & Awareness Days List
const allHolidays = [
  // January
  { date: '01-01', name: 'New Year\'s Day', emoji: '🎉', tip: 'New Year, New Home content - fresh starts and resolutions!', category: 'Major Holiday' },
  { date: '01-06', name: 'National Bean Day', emoji: '🫘', tip: 'Fun, light-hearted content about cozy homes', category: 'Food Day' },
  { date: '01-13', name: 'National Sticker Day', emoji: '✨', tip: 'Behind-the-scenes of creating marketing materials', category: 'Fun Day' },
  { date: '01-17', name: 'Martin Luther King Jr. Day', emoji: '✊', tip: 'Community and equality - highlighting diverse neighborhoods', category: 'Federal Holiday' },
  { date: '01-20', name: 'National Cheese Lovers Day', emoji: '🧀', tip: 'Homes with gourmet kitchens for cheese boards', category: 'Food Day' },
  { date: '01-24', name: 'National Compliment Day', emoji: '💕', tip: 'Thank your clients with appreciation posts', category: 'Awareness Day' },
  
  // February
  { date: '02-02', name: 'Groundhog Day', emoji: '🦫', tip: 'Spring market predictions for real estate', category: 'Fun Holiday' },
  { date: '02-07', name: 'National Send a Card Day', emoji: '💌', tip: 'Promote your handwritten notes to clients', category: 'Awareness Day' },
  { date: '02-11', name: 'National Make a Friend Day', emoji: '👋', tip: 'Networking and community building content', category: 'Awareness Day' },
  { date: '02-14', name: 'Valentine\'s Day', emoji: '💕', tip: 'Fall in love with your dream home', category: 'Major Holiday' },
  { date: '02-17', name: 'Random Acts of Kindness Day', emoji: '❤️', tip: 'Share stories of helping clients achieve their dreams', category: 'Awareness Day' },
  { date: '02-22', name: 'National Margarita Day', emoji: '🍹', tip: 'Homes with outdoor entertaining spaces', category: 'Food Day' },
  { date: '02-27', name: 'National Strawberry Day', emoji: '🍓', tip: 'Homes with gardens or farm markets nearby', category: 'Food Day' },
  
  // March
  { date: '03-03', name: 'National Employee Appreciation Day', emoji: '🙌', tip: 'Thank your team and partners', category: 'Awareness Day' },
  { date: '03-08', name: 'International Women\'s Day', emoji: '👩', tip: 'Highlight women in real estate and homeownership', category: 'Awareness Day' },
  { date: '03-12', name: 'National Girl Scout Day', emoji: '🍪', tip: 'Community involvement and local activities', category: 'Awareness Day' },
  { date: '03-17', name: 'St. Patrick\'s Day', emoji: '🍀', tip: 'Lucky to find your dream home', category: 'Major Holiday' },
  { date: '03-20', name: 'First Day of Spring', emoji: '🌸', tip: 'Spring home refresh and curb appeal tips', category: 'Season' },
  { date: '03-26', name: 'National Spinach Day', emoji: '🥬', tip: 'Healthy homes with great kitchens', category: 'Food Day' },
  
  // April
  { date: '04-01', name: 'April Fools\' Day', emoji: '😜', tip: 'Fun, playful real estate content', category: 'Fun Holiday' },
  { date: '04-07', name: 'National Beer Day', emoji: '🍺', tip: 'Homes near breweries or with home bars', category: 'Food Day' },
  { date: '04-11', name: 'National Pet Day', emoji: '🐾', tip: 'Pet-friendly homes and yards', category: 'Awareness Day' },
  { date: '04-22', name: 'Earth Day', emoji: '🌍', tip: 'Eco-friendly homes and sustainable living', category: 'Awareness Day' },
  { date: '04-23', name: 'National Picnic Day', emoji: '🧺', tip: 'Homes with beautiful outdoor spaces', category: 'Food Day' },
  { date: '04-26', name: 'National Kids & Pets Day', emoji: '👶🐕', tip: 'Family-friendly neighborhoods with parks', category: 'Awareness Day' },
  { date: '04-30', name: 'National Adopt a Shelter Pet Day', emoji: '🐶', tip: 'Homes with fenced yards for pets', category: 'Awareness Day' },
  
  // May - Mental Health Awareness Month
  { date: '05-01', name: 'Mental Health Awareness Month Begins', emoji: '💚', tip: 'Creating peaceful, healthy home environments', category: 'Awareness Month' },
  { date: '05-04', name: 'Star Wars Day', emoji: '⭐', tip: 'May the Fourth be with you - fun themed content', category: 'Fun Day' },
  { date: '05-05', name: 'Cinco de Mayo', emoji: '🌮', tip: 'Homes with great entertaining spaces', category: 'Cultural Holiday' },
  { date: '05-11', name: 'Mother\'s Day', emoji: '💐', tip: 'Homes that moms will love', category: 'Major Holiday' },
  { date: '05-15', name: 'National Pizza Day', emoji: '🍕', tip: 'Kitchen spaces perfect for pizza nights', category: 'Food Day' },
  { date: '05-23', name: 'National Meditation Day', emoji: '🧘', tip: 'Peaceful home spaces and zen gardens', category: 'Awareness Day' },
  { date: '05-26', name: 'Memorial Day', emoji: '🇺🇸', tip: 'Honor veterans, community events', category: 'Federal Holiday' },
  { date: '05-31', name: 'National Macaroon Day', emoji: '🧁', tip: 'Sweet homes and cozy kitchens', category: 'Food Day' },
  
  // June - Pride Month
  { date: '06-01', name: 'Pride Month Begins', emoji: '🏳️‍🌈', tip: 'Celebrate diversity and inclusive communities', category: 'Awareness Month' },
  { date: '06-05', name: 'National Donut Day', emoji: '🍩', tip: 'Local coffee shops near your listings', category: 'Food Day' },
  { date: '06-08', name: 'National Best Friends Day', emoji: '👯', tip: 'Homes perfect for hosting friends', category: 'Awareness Day' },
  { date: '06-15', name: 'Father\'s Day', emoji: '👨', tip: 'Dad\'s dream spaces - garages, workshops', category: 'Major Holiday' },
  { date: '06-19', name: 'Juneteenth', emoji: '✊🏿', tip: 'Celebrate freedom and community', category: 'Federal Holiday' },
  { date: '06-20', name: 'First Day of Summer', emoji: '☀️', tip: 'Summer outdoor living spaces', category: 'Season' },
  { date: '06-21', name: 'International Yoga Day', emoji: '🧘‍♀️', tip: 'Homes with workout spaces or yoga rooms', category: 'Awareness Day' },
  { date: '06-27', name: 'National Sunglasses Day', emoji: '😎', tip: 'Homes with great natural light', category: 'Fun Day' },
  
  // July
  { date: '07-04', name: 'Independence Day', emoji: '🎆', tip: 'Freedom of homeownership', category: 'Major Holiday' },
  { date: '07-07', name: 'World Chocolate Day', emoji: '🍫', tip: 'Sweet homes and cozy spaces', category: 'Food Day' },
  { date: '07-12', name: 'National Simplicity Day', emoji: '🌿', tip: 'Minimalist home designs', category: 'Awareness Day' },
  { date: '07-17', name: 'National Ice Cream Day', emoji: '🍦', tip: 'Homes near ice cream shops', category: 'Food Day' },
  { date: '07-24', name: 'National Tequila Day', emoji: '🍹', tip: 'Outdoor entertaining spaces', category: 'Food Day' },
  { date: '07-30', name: 'International Day of Friendship', emoji: '🤝', tip: 'Community and neighborhood connections', category: 'Awareness Day' },
  
  // August
  { date: '08-08', name: 'International Cat Day', emoji: '🐱', tip: 'Homes with cozy nooks for cats', category: 'Awareness Day' },
  { date: '08-10', name: 'National Lazy Day', emoji: '😴', tip: 'Relaxing home spaces', category: 'Fun Day' },
  { date: '08-13', name: 'National Prosecco Day', emoji: '🥂', tip: 'Luxury homes with wine cellars', category: 'Food Day' },
  { date: '08-15', name: 'National Relaxation Day', emoji: '🛀', tip: 'Spa bathrooms and peaceful retreats', category: 'Awareness Day' },
  { date: '08-19', name: 'National Aviation Day', emoji: '✈️', tip: 'Homes near airports or travel-friendly locations', category: 'Awareness Day' },
  { date: '08-26', name: 'National Dog Day', emoji: '🐕', tip: 'Homes with yards perfect for dogs', category: 'Awareness Day' },
  
  // September
  { date: '09-01', name: 'Labor Day', emoji: '⚒️', tip: 'End of summer market shift', category: 'Federal Holiday' },
  { date: '09-13', name: 'National Peanut Day', emoji: '🥜', tip: 'Fun kitchen and snack spaces', category: 'Food Day' },
  { date: '09-19', name: 'International Talk Like a Pirate Day', emoji: '🏴‍☠️', tip: 'Fun, quirky content', category: 'Fun Day' },
  { date: '09-22', name: 'First Day of Fall', emoji: '🍂', tip: 'Fall home decor and cozy vibes', category: 'Season' },
  { date: '09-27', name: 'National Crush a Can Day', emoji: '♻️', tip: 'Sustainability and eco-friendly homes', category: 'Awareness Day' },
  
  // October - Breast Cancer Awareness Month
  { date: '10-01', name: 'Breast Cancer Awareness Month Begins', emoji: '🎀', tip: 'Support awareness with pink-themed content', category: 'Awareness Month' },
  { date: '10-04', name: 'National Taco Day', emoji: '🌮', tip: 'Homes near great restaurants', category: 'Food Day' },
  { date: '10-10', name: 'World Mental Health Day', emoji: '💚', tip: 'Creating peaceful home environments', category: 'Awareness Day' },
  { date: '10-13', name: 'National No Bra Day', emoji: '💜', tip: 'Comfort at home content (keep it tasteful!)', category: 'Awareness Day' },
  { date: '10-16', name: 'National Boss\'s Day', emoji: '👔', tip: 'Thank your broker or team leads', category: 'Awareness Day' },
  { date: '10-31', name: 'Halloween', emoji: '🎃', tip: 'Family-friendly neighborhoods', category: 'Major Holiday' },
  
  // November - Movember (Men's Health Month)
  { date: '11-01', name: 'Movember Begins (Men\'s Health)', emoji: '👨‍⚕️', tip: 'Healthy living spaces for men', category: 'Awareness Month' },
  { date: '11-01', name: 'National Authors\' Day', emoji: '📚', tip: 'Homes with reading nooks and libraries', category: 'Awareness Day' },
  { date: '11-03', name: 'National Sandwich Day', emoji: '🥪', tip: 'Kitchen spaces perfect for meal prep', category: 'Food Day' },
  { date: '11-11', name: 'Veterans Day', emoji: '🎖️', tip: 'Honor veterans in your community', category: 'Federal Holiday' },
  { date: '11-13', name: 'World Kindness Day', emoji: '💝', tip: 'Kindness in real estate transactions', category: 'Awareness Day' },
  { date: '11-27', name: 'Thanksgiving', emoji: '🦃', tip: 'Dining spaces perfect for hosting', category: 'Major Holiday' },
  { date: '11-28', name: 'Small Business Saturday', emoji: '🛍️', tip: 'Support local businesses near your listings', category: 'Awareness Day' },
  
  // December
  { date: '12-03', name: 'National Roof Over Your Head Day', emoji: '🏠', tip: 'Perfect day to celebrate homeownership!', category: 'Real Estate Day' },
  { date: '12-04', name: 'National Cookie Day', emoji: '🍪', tip: 'Cozy kitchens for holiday baking', category: 'Food Day' },
  { date: '12-10', name: 'Human Rights Day', emoji: '✊', tip: 'Fair housing and equality', category: 'Awareness Day' },
  { date: '12-21', name: 'First Day of Winter', emoji: '❄️', tip: 'Cozy winter home features', category: 'Season' },
  { date: '12-24', name: 'Christmas Eve', emoji: '🎄', tip: 'Holiday home tours', category: 'Major Holiday' },
  { date: '12-25', name: 'Christmas', emoji: '🎅', tip: 'Holiday hosting spaces', category: 'Major Holiday' },
  { date: '12-31', name: 'New Year\'s Eve', emoji: '🥳', tip: 'Year in review and goals for next year', category: 'Major Holiday' }
];

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
  "**Hub Events**🎉",
  "**Bookkeeping📊**",
  "🎊 That's all for this cycle! You have two weeks, but I know you'll do amazing. I believe in you! Remember, progress over perfection. 💜"
];

// Newsletter themes 2025
const newsletterThemes2025 = [
  { date: '2025-01-01', theme: 'Happy New Year', topics: ['New Year, New Home: Why January is Perfect for House Hunting in NJ', 'New Year\'s Resolutions for Homeowners: Property Goals for 2025']},
  { date: '2025-02-09', theme: 'Valentines Day', topics: ['Fall in Love with Your Dream Home This Valentine\'s Day', 'Love Where You Live: Finding Your Perfect Match in NJ Real Estate']},
  { date: '2025-07-04', theme: 'Independence Day', topics: ['Declare Your Independence: First-Time Homebuyer Guide for NJ', 'Freedom of Homeownership: Breaking Free from Renting']},
  { date: '2025-10-18', theme: 'Halloween', topics: ['Spooktacular Homes: Properties with Halloween Charm in NJ', 'Not So Scary: First-Time Homebuyer Myths Debunked']},
  { date: '2025-11-15', theme: 'Thanksgiving', topics: ['Grateful for Home: What We\'re Thankful for This Season', 'Holiday Hosting: Homes Perfect for Thanksgiving']},
  { date: '2025-12-13', theme: 'Christmas', topics: ['Home for the Holidays: Christmas in Your New Jersey Home', 'Holiday Home Staging Tips']}
];

// Check-in messages
const taskCheckInMessages = [
  ["Hey Jeraaa! 👋", "Just checking in on your task.", "How's it going? Remember, progress over perfection! 💜"],
  ["Hi friend! 🌟", "Just wanted to see how you're doing with this task.", "No pressure! You're doing amazing. 💪"],
  ["Hello! ✨", "Friendly reminder about your task here!", "Take your time, you've got this! 💜"]
];

let lastWeeklyReminder Date = null;
let lastHolidayReminderDate = {};
let lastNewsletterReminderDate = null;

async function sendMessagesWithDelay(channel, messages, delay = 3000) {
  const sentMessageIds = [];
  for (const message of messages) {
    const sentMsg = await channel.send(message);
    sentMessageIds.push(sentMsg.id);
    if (messages.indexOf(message) < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return sentMessageIds;
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

// Handle Social Media Webhooks
async function handleSocialMediaWebhook(data) {
  try {
    console.log('📱 Received social media webhook:', data);
    
    const guild = client.guilds.cache.first();
    if (!guild) {
      console.error('❌ No guild found');
      return;
    }
    
    const socmedChannel = guild.channels.cache.find(
      ch => ch.name.includes('socmed-posts') || ch.name.includes('socmed-post')
    );
    
    if (!socmedChannel) {
      console.error('❌ Could not find socmed-posts channel');
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTimestamp();
    
    const platformEmojis = {
      'facebook': '📘',
      'linkedin': '💼',
      'instagram': '📸'
    };
    
    const platform = data.platform?.toLowerCase() || 'social media';
    const emoji = platformEmojis[platform] || '📱';
    
    if (data.type === 'new_post') {
      embed.setTitle(`${emoji} New Post on ${data.account_name || 'Social Media'}!`)
        .setDescription(data.post_text || 'A new post has been published!')
        .addFields({ name: '🔗 View Post', value: data.post_url || 'No link available' });
      
      if (data.image_url) {
        embed.setImage(data.image_url);
      }
      
      await socmedChannel.send({
        content: `Hey Jeraaa! 💜 **${data.account_name || 'Your page'}** has a new post!`,
        embeds: [embed]
      });
    } 
    else if (data.type === 'new_review') {
      embed.setTitle(`⭐ New Review on ${data.account_name || 'Social Media'}!`)
        .setDescription(data.review_text || 'A new review has been posted!')
        .addFields(
          { name: '⭐ Rating', value: `${data.rating || 'N/A'} stars`, inline: true },
          { name: '👤 Reviewer', value: data.reviewer_name || 'Anonymous', inline: true }
        );
      
      if (data.review_url) {
        embed.addFields({ name: '🔗 View Review', value: data.review_url });
      }
      
      await socmedChannel.send({
        content: `Hey Jeraaa! 🌟 **${data.account_name || 'Your page'}** received a new review!`,
        embeds: [embed]
      });
    }
    
    console.log('✅ Social media notification sent successfully');
  } catch (error) {
    console.error('❌ Error handling social media webhook:', error);
  }
}

// Handle Google Business Webhooks
async function handleGoogleBusinessWebhook(data) {
  try {
    console.log('🌍 Received Google Business webhook:', data);
    
    const guild = client.guilds.cache.first();
    if (!guild) {
      console.error('❌ No guild found');
      return;
    }
    
    const websiteChannel = guild.channels.cache.find(
      ch => ch.name.includes('website') || ch.name.includes('web-site')
    );
    
    if (!websiteChannel) {
      console.error('❌ Could not find website channel');
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor('#4285F4')
      .setTimestamp();
    
    if (data.type === 'new_review') {
      embed.setTitle('⭐ New Google Review!')
        .setDescription(data.review_text || 'The Groomes Realty Group received a new review!')
        .addFields(
          { name: '⭐ Rating', value: `${data.rating || 'N/A'} stars`, inline: true },
          { name: '👤 Reviewer', value: data.reviewer_name || 'Anonymous', inline: true }
        );
      
      if (data.review_url) {
        embed.addFields({ name: '🔗 View Review', value: data.review_url });
      }
      
      await websiteChannel.send({
        content: 'Hey Jeraaa! 🌟 The Groomes Realty Group received a new review on Google Business Page!',
        embeds: [embed]
      });
    }
    else if (data.type === 'new_product') {
      embed.setTitle('🏡 New Product Added!')
        .setDescription(data.product_name || 'A new product has been added to Google Business Page!')
        .addFields(
          { name: '📍 Details', value: data.product_description || 'Check it out on the page!' }
        );
      
      if (data.product_url) {
        embed.addFields({ name: '🔗 View Product', value: data.product_url });
      }
      
      if (data.image_url) {
        embed.setImage(data.image_url);
      }
      
      await websiteChannel.send({
        content: 'Hey Jeraaa! 🏡 A new product was added to The Groomes Realty Group Google Business Page!',
        embeds: [embed]
      });
    }
    else if (data.type === 'new_update') {
      embed.setTitle('📢 New Google Business Update!')
        .setDescription(data.update_text || 'A new update has been posted to Google Business Page!');
      
      if (data.update_url) {
        embed.addFields({ name: '🔗 View Update', value: data.update_url });
      }
      
      if (data.image_url) {
        embed.setImage(data.image_url);
      }
      
      await websiteChannel.send({
        content: 'Hey Jeraaa! 📢 A new update has been posted to The Groomes Realty Group Google Business Page!',
        embeds: [embed]
      });
    }
    
    console.log('✅ Google Business notification sent successfully');
  } catch (error) {
    console.error('❌ Error handling Google Business webhook:', error);
  }
}

// Get next upcoming holidays (within 30 days)
function getUpcomingHolidays(limit = 10) {
  const now = new Date();
  const upcoming = [];
  
  for (const holiday of allHolidays) {
    const [month, day] = holiday.date.split('-');
    const holidayDate = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day));
    
    // If holiday already passed this year, check next year
    if (holidayDate < now) {
      holidayDate.setFullYear(now.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((holidayDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil >= 0 && daysUntil <= 30) {
      upcoming.push({
        ...holiday,
        daysUntil,
        dateObj: holidayDate
      });
    }
  }
  
  // Sort by days until
  upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  
  return upcoming.slice(0, limit);
}

// Get next newsletter
function getNextNewsletter() {
  const now = new Date();
  
  for (const newsletter of newsletterThemes2025) {
    const newsletterDate = new Date(newsletter.date);
    
    if (newsletterDate > now) {
      const daysUntil = Math.ceil((newsletterDate - now) / (1000 * 60 * 60 * 24));
      return {
        ...newsletter,
        daysUntil,
        dateObj: newsletterDate
      };
    }
  }
  
  return null;
}

// Random task check-in system
function scheduleRandomTaskCheckIns() {
  setInterval(async () => {
    for (const [messageId, taskData] of activeTasks.entries()) {
      if (taskData.completed) continue;
      
      if (Math.random() < 0.2) {
        try {
          const channel = await client.channels.fetch(taskData.channelId);
          const randomCheckIn = taskCheckInMessages[Math.floor(Math.random() * taskCheckInMessages.length)];
          
          await channel.send(`<@${taskData.userId}>`);
          await sendMessagesWithDelay(channel, randomCheckIn, 2000);
          
          await channel.send(`📋 **Task:** ${taskData.task}\n⏰ **Deadline:** ${taskData.deadline}`);
        } catch (error) {
          console.error('Error sending task check-in:', error);
        }
      }
    }
  }, 6 * 60 * 60 * 1000);
}

// Weekly reminder for incomplete tasks
function scheduleWeeklyReminders() {
  setInterval(async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    if (dayOfWeek === 1 && now.getHours() === 9) {
      const lastReminderDate = lastWeeklyReminderDate ? new Date(lastWeeklyReminderDate) : null;
      if (lastReminderDate && now - lastReminderDate < 6 * 24 * 60 * 60 * 1000) {
        return;
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
  }, 60 * 60 * 1000);
}

// Holiday reminders (5 days before)
function scheduleHolidayReminders() {
  setInterval(async () => {
    const now = new Date();
    
    for (const holiday of allHolidays) {
      const [holidayMonth, holidayDay] = holiday.date.split('-');
      const holidayDate = new Date(now.getFullYear(), parseInt(holidayMonth) - 1, parseInt(holidayDay));
      
      const daysUntil = Math.ceil((holidayDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 5) {
        const lastReminder = lastHolidayReminderDate[holiday.name];
        if (lastReminder && (now - new Date(lastReminder)) < 24 * 60 * 60 * 1000) {
          continue;
        }
        
        try {
          const guild = client.guilds.cache.first();
          const holidaysChannel = guild.channels.cache.find(ch => ch.name.includes('holidays') || ch.name.includes('holiday'));
          
          if (holidaysChannel) {
            await holidaysChannel.send(
              `Hi Jeraaa! ${holiday.emoji}\n\n` +
              `**${holiday.name}** is coming up in **5 days**!\n\n` +
              `📂 **Category:** ${holiday.category}\n` +
              `💡 **Content Idea:** ${holiday.tip}\n\n` +
              `Start creating your social media posts now! 🎨✨`
            );
            
            lastHolidayReminderDate[holiday.name] = now.toISOString();
            console.log(`✅ Sent ${holiday.name} reminder`);
          }
        } catch (error) {
          console.error('Error sending holiday reminder:', error);
        }
      }
    }
  }, 6 * 60 * 60 * 1000);
}

// Newsletter reminders (7 days before)
function scheduleNewsletterReminders() {
  setInterval(async () => {
    const now = new Date();
    
    for (const newsletter of newsletterThemes2025) {
      const newsletterDate = new Date(newsletter.date);
      const daysUntil = Math.ceil((newsletterDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 7) {
        const lastReminder = lastNewsletterReminderDate;
        if (lastReminder && (now - new Date(lastReminder)) < 24 * 60 * 60 * 1000) {
          continue;
        }
        
        try {
          const guild = client.guilds.cache.first();
          const newslettersChannel = guild.channels.cache.find(ch => ch.name.includes('newsletters') || ch.name.includes('newsletter'));
          
          if (newslettersChannel) {
            const topicsList = newsletter.topics.map((topic, idx) => `${idx + 1}. ${topic}`).join('\n');
            
            await newslettersChannel.send(
              `Hi Jeraaa! 📰\n\n` +
              `Your next **newsletter** is coming up in **7 days**!\n\n` +
              `🎨 **Theme:** ${newsletter.theme}\n` +
              `📅 **Due Date:** ${newsletterDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n` +
              `📋 **Topic Ideas:**\n${topicsList}\n\n` +
              `Start working on it now! You've got this! 💜✨`
            );
            
            lastNewsletterReminderDate = now.toISOString();
            console.log(`✅ Sent newsletter reminder for ${newsletter.theme}`);
          }
        } catch (error) {
          console.error('Error sending newsletter reminder:', error);
        }
      }
    }
  }, 6 * 60 * 60 * 1000);
}

client.on('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  console.log('🤖 Fri 💜 is ready to help Jeraaa!');
  console.log('📡 Webhook endpoints ready for social media updates!');
  
  scheduleRandomTaskCheckIns();
  scheduleWeeklyReminders();
  scheduleHolidayReminders();
  scheduleNewsletterReminders();
  
  const commands = [
    { name: 'tasks', description: 'Show your biweekly tasks' },
    { name: 'checkin', description: 'Get a motivational check-in' },
    { name: 'newsletter', description: 'Get newsletter topics' },
    { name: 'social', description: 'Get social media ideas' },
    { name: 'email', description: 'Get email campaign ideas' },
    { name: 'website', description: 'Check website updates' },
    { name: 'holidays', description: 'Show upcoming holidays' },
    { name: 'nextholiday', description: 'Show the next upcoming holiday' },
    { name: 'nextnewsletter', description: 'Show the next newsletter deadline' },
    { name: 'allholidays', description: 'Show all holidays in the next 30 days' },
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
    { name: 'resources', description: 'Get free design tool links' },
    { name: 'testwebhook', description: 'Test webhook functionality (admin only)' }
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
    if (interaction.commandName === 'nextholiday') {
      const upcoming = getUpcomingHolidays(1);
      
      if (upcoming.length === 0) {
        await interaction.reply('No upcoming holidays found in the next 30 days! 🎉');
        return;
      }
      
      const holiday = upcoming[0];
      const dateStr = holiday.dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      const response = [
        `${holiday.emoji} **Next Holiday: ${holiday.name}** ${holiday.emoji}\n`,
        `📅 **Date:** ${dateStr}`,
        `⏰ **Days Until:** ${holiday.daysUntil} days`,
        `📂 **Category:** ${holiday.category}`,
        `💡 **Content Idea:** ${holiday.tip}\n`,
        `Start planning your content now! 💜✨`
      ].join('\n');
      
      await interaction.reply(response);
    }
    
    else if (interaction.commandName === 'nextnewsletter') {
      const newsletter = getNextNewsletter();
      
      if (!newsletter) {
        await interaction.reply('No upcoming newsletters found! 📰');
        return;
      }
      
      const dateStr = newsletter.dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const topicsList = newsletter.topics.map((topic, idx) => `${idx + 1}. ${topic}`).join('\n');
      
      const response = [
        `📰 **Next Newsletter: ${newsletter.theme}** 📰\n`,
        `📅 **Due Date:** ${dateStr}`,
        `⏰ **Days Until:** ${newsletter.daysUntil} days\n`,
        `📋 **Topic Ideas:**`,
        `${topicsList}\n`,
        `Start working on it! You've got this! 💜✨`
      ].join('\n');
      
      await interaction.reply(response);
    }
    
    else if (interaction.commandName === 'allholidays') {
      const upcoming = getUpcomingHolidays(15);
      
      if (upcoming.length === 0) {
        await interaction.reply('No upcoming holidays found in the next 30 days! 🎉');
        return;
      }
      
      let response = `🎉 **Upcoming Holidays & Awareness Days** (Next 30 Days) 🎉\n\n`;
      
      for (const holiday of upcoming) {
        const dateStr = holiday.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        response += `${holiday.emoji} **${holiday.name}** - ${dateStr} (${holiday.daysUntil} days)\n`;
        response += `   💡 ${holiday.tip}\n\n`;
      }
      
      response += `Use /nextholiday to see more details! 💜`;
      
      await interaction.reply(response);
    }
    
    else if (interaction.commandName === 'testwebhook') {
      await interaction.reply({
        content: '🧪 Testing webhook system...',
        flags: 64
      });
      
      await handleSocialMediaWebhook({
        secret: WEBHOOK_SECRET,
        platform: 'facebook',
        type: 'new_post',
        account_name: 'Donna Groomes Realtor',
        post_text: 'This is a test post! Check out this amazing property! 🏡',
        post_url: 'https://facebook.com/test-post'
      });
      
      await handleGoogleBusinessWebhook({
        secret: WEBHOOK_SECRET,
        type: 'new_review',
        rating: '5',
        reviewer_name: 'Test Reviewer',
        review_text: 'Amazing service! Highly recommend!',
        review_url: 'https://google.com/test-review'
      });
      
      await interaction.editReply({
        content: '✅ Test webhooks sent! Check your channels! 💜'
      });
    }
    
    else if (interaction.commandName === 'newtask') {
      await interaction.reply({
        content: '⏳ Creating your task...',
        flags: 64
      });

      const task = interaction.options.getString('task');
      const deadline = interaction.options.getString('deadline');
      const userId = interaction.user.id;
      
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
      
      const taskMessage = await newTasksChannel.send(
        `Hi Jeraaa! 💜 You have a new task:\n\n` +
        `📋 **Task:** ${task}\n` +
        `⏰ **Deadline:** ${deadline}\n\n` +
        `React with 👍 when you finish this task!`
      );
      
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
        await interaction.reply({ content: '❌ Something went wrong!', flags: 64 });
      }
    } catch (e) {
      console.error('Error sending error message:', e);
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }
  
  if (reaction.emoji.name === '👍') {
    const messageId = reaction.message.id;
    const channelName = reaction.message.channel.name || '';
    
    console.log(`👍 Thumbs up detected on message ID: ${messageId} in channel: ${channelName}`);
    
    for (const [groupKey, groupData] of taskGroups.entries()) {
      if (groupData.taskMessageIds.includes(messageId)) {
        groupData.completedIds.add(messageId);
        
        console.log(`✅ Marked task as complete. Progress: ${groupData.completedIds.size}/${groupData.taskMessageIds.length}`);
        
        if (groupData.completedIds.size === groupData.taskMessageIds.length) {
          console.log(`🎉 ALL TASKS COMPLETED for: ${groupData.title}`);
          
          const mainChatChannel = reaction.message.guild.channels.cache.find(
            ch => ch.name.includes('main-chat')
          );
          
          if (mainChatChannel) {
            const channelEmojis = {
              'coming-soon': '🔜',
              'just-listed': '⬆️',
              'open-house': '🪧',
              'under-contract': '🔁',
              'just-closed': '⬇️',
              'biweekly-task': '🗒️'
            };
            
            const emoji = Object.entries(channelEmojis).find(([key]) => channelName.includes(key))?.[1] || '✅';
            
            if (channelName.includes('biweekly-task')) {
              const now = new Date();
              const nextReset = new Date(now);
              nextReset.setDate(now.getDate() + 14);
              const resetDateStr = nextReset.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
              
              await mainChatChannel.send(
                `🎊 Congratulations, Jeraaa! You've completed all your biweekly tasks!\n\n` +
                `Your next cycle will start again on **${resetDateStr}**.\n\n` +
                `Excellent work staying organized and on schedule! 📅✨`
              );
            } else {
              await mainChatChannel.send(
                `🎉 Congratulations, Jeraaa! You've completed all tasks for:\n\n` +
                `${emoji} **${groupData.title}**\n\n` +
                `Great work staying on top of your marketing! 💼✨`
              );
            }
            
            console.log('✅ Congratulatory message sent to main-chat!');
            taskGroups.delete(groupKey);
          }
        }
        break;
      }
    }
    
    if (activeTasks.has(messageId)) {
      const taskData = activeTasks.get(messageId);
      
      if (!taskData.completed) {
        taskData.completed = true;
        activeTasks.set(messageId, taskData);
        
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
    if (content.includes('3d')) type = '3d';
    
    if (content.includes('realistic') || content.includes('photo')) style = 'realistic';
    if (content.includes('cartoon') || content.includes('playful')) style = 'cartoon';
    if (content.includes('minimal')) style = 'minimalist';
    if (content.includes('luxury')) style = 'luxury';
    
    const holidayKeywords = {
      'independence': 'Independence Day', 
      'july 4': 'Independence Day',
      'fourth of july': 'Independence Day',
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
    
    const generatedPrompt = generateAIPrompt(theme, type, style);
    
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

  // Check for biweekly tasks trigger
  if (channelName.includes('biweekly-task') && content.includes('biweekly')) {
    console.log('📅 Biweekly tasks trigger detected!');
    
    const personalizedTasks = biweeklyTasks.map(task => task.replace('<@USER_ID>', `<@${message.author.id}>`));
    const sentMessageIds = await sendMessagesWithDelay(message.channel, personalizedTasks);
    
    const taskMessageIds = sentMessageIds.slice(1, -1);
    const groupKey = `${message.channel.id}-${Date.now()}`;
    
    taskGroups.set(groupKey, {
      title: 'Biweekly Tasks',
      taskMessageIds: taskMessageIds,
      completedIds: new Set(),
      channelId: message.channel.id,
      userId: message.author.id
    });
    
    console.log(`✅ Created biweekly task group with ${taskMessageIds.length} tasks`);
    return;
  }

  // Check for real estate trigger words in their respective channels
  const channelTriggerMap = {
    'coming-soon': 'coming soon',
    'just-listed': 'just listed',
    'open-house': 'open house',
    'under-contract': 'under contract',
    'just-closed': 'just closed'
  };
  
  for (const [channelKey, trigger] of Object.entries(channelTriggerMap)) {
    if (channelName.includes(channelKey) && content.includes(trigger)) {
      console.log(`🏠 Real estate trigger detected: ${trigger} in correct channel: ${channelName}`);
      
      const taskTitle = message.content;
      
      const tasks = taskLists[trigger];
      const personalizedTasks = tasks.map(task => task.replace('<@USER_ID>', `<@${message.author.id}>`));
      const sentMessageIds = await sendMessagesWithDelay(message.channel, personalizedTasks);
      
      const taskMessageIds = sentMessageIds.slice(1, -1);
      const groupKey = `${message.channel.id}-${Date.now()}`;
      
      taskGroups.set(groupKey, {
        title: taskTitle,
        taskMessageIds: taskMessageIds,
        completedIds: new Set(),
        channelId: message.channel.id,
        userId: message.author.id
      });
      
      console.log(`✅ Created task group for "${taskTitle}" with ${taskMessageIds.length} tasks`);
      break;
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
