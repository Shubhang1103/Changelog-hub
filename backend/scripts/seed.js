const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const ChangelogEntry = require('../src/models/ChangelogEntry');
const Reaction = require('../src/models/Reaction');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/changelog_hub';
    console.log(`[Seed] Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await ChangelogEntry.deleteMany({});
    await Reaction.deleteMany({});

    // 1. Create Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';

    console.log(`[Seed] Creating Admin User: ${adminEmail}...`);
    const admin = new User({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
      lastViewedChangelogDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    });
    await admin.save();

    // 2. Create Regular Demo User
    console.log('[Seed] Creating Demo User: user@example.com...');
    const demoUser = new User({
      name: 'Alex Developer',
      email: 'user@example.com',
      password: 'UserPass123!',
      role: 'user',
      isEmailVerified: true,
      lastViewedChangelogDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago so newer posts show unread!
    });
    await demoUser.save();

    // 3. Create Sample Changelog Entries
    console.log('[Seed] Seeding rich changelog entries...');

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const sampleEntries = [
      {
        title: 'AI-Powered Smart Search & Semantic Release Filters',
        slug: 'ai-powered-smart-search-and-semantic-filters',
        category: 'New',
        status: 'Published',
        publishedAt: new Date(now - 1 * oneDay), // Yesterday
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        contentMarkdown: `### 🌟 Lightning-Fast Semantic Search Is Here

Finding past releases and feature announcements just got 10x easier. We've introduced a **full-text fuzzy query engine** combined with fast category filtering so your users can discover exactly what they need in milliseconds.

#### Key Highlights:
- **Instant Debounced Querying**: Real-time filtering as you type with zero UI lag.
- **Categorical Deep-Linking**: Filter specifically by \`#New\`, \`#Improved\`, or \`#Fixed\` updates.
- **Highlight Matching**: Key matching phrases are highlighted directly in the release cards.

\`\`\`javascript
// Example: Querying the new search API
const response = await fetch('/api/v1/changelog?category=New&q=semantic');
const { data, pagination } = await response.json();
console.log(\`Found \${pagination.total} matching product updates!\`);
\`\`\`

> 💡 **Pro-Tip**: You can use the search bar above to instantly test this on the live changelog!`,
      },
      {
        title: 'Embeddable Slide-Over Widget & Headway-Style Notifications',
        slug: 'embeddable-slide-over-widget-notifications',
        category: 'New',
        status: 'Published',
        publishedAt: new Date(now - 3 * oneDay),
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        contentMarkdown: `### 🚀 Deliver Product Updates Directly Inside Your SaaS

You can now drop our standalone **Notification Drawer & Slide-over Widget** into any existing React, Vue, or Vanilla JS web application with just a few lines of code!

#### What’s Included:
1. **Unread Badge Synchronization**: Dynamic notification counter calculates exact unread updates relative to the user's last visited timestamp.
2. **Smooth Slide-Over Drawer**: Beautiful blurred backdrop, accessible keyboard shortcuts (\`ESC\` to close), and automatic read marking.
3. **One-Line Integration**:

\`\`\`html
<!-- Single script widget integration -->
<script 
  src="https://cdn.changeloghub.io/widget.v1.js" 
  data-hub-id="hub_live_897123"
  data-user-id="usr_current"
  data-position="bottom-right">
</script>
\`\`\`

Check out the interactive demo in the **Widget Simulator** tab!`,
      },
      {
        title: 'Publishing Studio Split-Screen Editor & Live Markdown Rendering',
        slug: 'publishing-studio-split-screen-editor',
        category: 'Improved',
        status: 'Published',
        publishedAt: new Date(now - 5 * oneDay),
        coverImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        contentMarkdown: `### 🎨 Supercharged Admin Markdown Studio

Writing beautiful product release notes should feel effortless. Our brand new split-screen editor gives you real-time previewing as you compose markdown.

#### New Studio Features:
- **Instant Live Preview**: Markdown is parsed and styled simultaneously on the right-hand panel.
- **Smart Slug Auto-Generation**: Automatically generates URL-friendly slugs from your title while allowing manual overrides.
- **Cover Image Uploads**: Directly upload images via Multer disk storage or link remote URLs.
- **Syntax Highlighting**: Pre-configured code highlighting for JavaScript, Python, JSON, Bash, and HTML.

| Feature | Old Studio | New Studio 2.0 |
| :--- | :---: | :---: |
| Split Preview | ❌ | ✅ Real-time |
| Local File Upload | ❌ | ✅ Fast Multer Storage |
| Draft / Publish State | ⚠️ Basic | ✅ Granular Timestamping |`,
      },
      {
        title: 'Patched Dual JWT Token Rotation & Session Theft Detection',
        slug: 'patched-dual-jwt-token-rotation-security',
        category: 'Fixed',
        status: 'Published',
        publishedAt: new Date(now - 8 * oneDay),
        coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        contentMarkdown: `### 🛡️ Hardened Token Security & Cookie Partitioning

We have completely upgraded our authentication pipeline to use strict **Dual JWT Token Rotation** with automatic reuse/theft detection.

#### Security Upgrades:
- **Short-Lived Access Tokens**: 15-minute access tokens passed in the \`Authorization\` header reduce blast radius.
- **HttpOnly Secure Refresh Cookies**: Long-lived 7-day refresh tokens are isolated from JavaScript and XSS vectors.
- **Strict Single-Use Token Invalidation**: If an old or expired refresh token hash is presented, the server immediately revokes all active user sessions to protect against token replay attacks.
- **Rate-Limiting Shields**: 5 requests per 15-minute window on all sensitive auth routes.`,
      },
      {
        title: 'Interactive Emoji Reactions & Community Feedback',
        slug: 'interactive-emoji-reactions-feedback',
        category: 'New',
        status: 'Published',
        publishedAt: new Date(now - 12 * oneDay),
        coverImage: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        contentMarkdown: `### ❤️ Celebrate Releases with Instant Emoji Reactions

Users can now share excitement, express gratitude, or vote on their favorite releases using the new **Emoji Reaction Bar**!

- **Supported Emojis**: ❤️ Love, 🎉 Celebration, and 🚀 Rocket!
- **Compound Uniqueness**: Users can react to multiple emoji types on an entry, but duplicate counts per user are strictly prevented at the database level.
- **Live Counter Updates**: See reaction counts increment instantly.`,
      },
      {
        title: 'Upcoming Feature: Multi-Tenancy & Custom Domain CNAME Support',
        slug: 'upcoming-multi-tenancy-custom-domain-support',
        category: 'Improved',
        status: 'Draft',
        publishedAt: null,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        contentMarkdown: `### 🌐 Sneak Peek: Custom Domains & Workspaces

We are building full support for white-labeled custom domains (e.g. \`updates.yourcompany.com\`) and organization-wide multi-tenancy.

#### Roadmap Checklist:
- [x] Schema & Tenant Isolation Layer
- [ ] Automated Let's Encrypt SSL Provisioning
- [ ] Team Roles (Viewer, Editor, Admin)
- [ ] Webhook Dispatchers for Slack & Discord

*Note: This entry is currently in **Draft** state and is only visible to logged-in Admins in the Studio dashboard.*`,
      },
    ];

    const createdEntries = [];
    for (const item of sampleEntries) {
      const entry = new ChangelogEntry(item);
      await entry.save();
      createdEntries.push(entry);
    }

    // 4. Seed Reactions for Published entries
    console.log('[Seed] Seeding sample emoji reactions...');
    const publishedList = createdEntries.filter((e) => e.status === 'Published');

    // Admin reacts
    if (publishedList[0]) {
      await Reaction.create({ user: admin._id, changelogEntry: publishedList[0]._id, emoji: '🚀' });
      await Reaction.create({ user: admin._id, changelogEntry: publishedList[0]._id, emoji: '🎉' });
    }
    if (publishedList[1]) {
      await Reaction.create({ user: admin._id, changelogEntry: publishedList[1]._id, emoji: '❤️' });
    }

    // Demo user reacts
    if (publishedList[0]) {
      await Reaction.create({ user: demoUser._id, changelogEntry: publishedList[0]._id, emoji: '❤️' });
    }
    if (publishedList[1]) {
      await Reaction.create({ user: demoUser._id, changelogEntry: publishedList[1]._id, emoji: '🚀' });
    }
    if (publishedList[2]) {
      await Reaction.create({ user: demoUser._id, changelogEntry: publishedList[2]._id, emoji: '🎉' });
    }

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Admin Account:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role:     admin`);
    console.log('------------------------------------------------------');
    console.log('Demo User Account:');
    console.log('  Email:    user@example.com');
    console.log('  Password: UserPass123!');
    console.log('  Role:     user');
    console.log('------------------------------------------------------');
    console.log(`Entries Seeded: ${createdEntries.length} (${publishedList.length} Published, ${createdEntries.length - publishedList.length} Draft)`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
