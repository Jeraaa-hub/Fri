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
      { name: 'deadline', type: 3, description: 'Deadline (e.g., "2 weeks", "3 days", "Nov 15")', required: true }
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
