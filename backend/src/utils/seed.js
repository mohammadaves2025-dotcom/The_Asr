const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const logger = require('./logger');

const CATEGORIES = [
  { name: 'Human Rights', description: 'Civil liberties, legal rights, state accountability', color: '#c8392b', order: 1, isFeatured: true },
  { name: 'Minorities & Communities', description: 'Religious, ethnic, linguistic minority coverage', color: '#1d3557', order: 2, isFeatured: true },
  { name: 'Politics & Governance', description: 'Policy, elections, legislation, government actions', color: '#1a5c38', order: 3, isFeatured: true },
  { name: 'Ground Reports', description: 'Field journalism from affected communities', color: '#7c3aed', order: 4, isFeatured: true },
  { name: 'Opinion & Analysis', description: 'Editorials, expert commentary, op-eds', color: '#b45309', order: 5 },
  { name: 'Social Justice & Caste', description: 'Discrimination, exclusion, equity issues', color: '#0e7490', order: 6, isFeatured: true },
  { name: 'Gender & Rights', description: 'Women, gender-based violence', color: '#be123c', order: 7, isFeatured: true },
  { name: 'Law & Courts', description: 'Judiciary, landmark verdicts, legal reform', color: '#065f46', order: 8 },
  { name: 'International', description: 'Global human rights, diaspora, world affairs', color: '#1e3a5f', order: 9 },
  { name: 'Communal Watch', description: 'Communal violence tracking, hate crime reports', color: '#9a3412', order: 10 },
  { name: 'Economy & Labour', description: "Workers' rights, poverty, economic inequality", color: '#374151', order: 11 },
  { name: 'Education', description: 'Access, discrimination in institutions', color: '#4b5563', order: 12 },
  { name: 'Verified Reports', description: 'Fact-checked, evidence-backed investigations', color: '#065f46', order: 13 },
  { name: 'In Their Words', description: 'First-person testimonials from affected people', color: '#7c3aed', order: 14 },
];

const ADMIN_USER = {
  name: 'The Orbis Journal Admin',
  email: 'admin@theorbisjournal.com',
  password: 'Admin@12345',
  role: 'superadmin',
  isVerified: true,
  isActive: true,
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing
    await Category.deleteMany({});
    logger.info('Cleared categories');

    // Seed categories
    const categories = await Category.insertMany(CATEGORIES);
    logger.info(`Seeded ${categories.length} categories`);

    // Create admin if doesn't exist
    const existing = await User.findOne({ email: ADMIN_USER.email });
    if (!existing) {
      await User.create(ADMIN_USER);
      logger.info(`Admin user created: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
    } else {
      logger.info('Admin user already exists — skipping');
    }

    logger.info('✅ Seeding complete');
    process.exit(0);
  } catch (err) {
    logger.error(`Seed error: ${err.message}`);
    process.exit(1);
  }
};

seed();
