const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

async function purgeAllRSVPs() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const Event = mongoose.model('Event', new mongoose.Schema({ attendees: [mongoose.Schema.Types.ObjectId] }));
    const User = mongoose.model('User', new mongoose.Schema({ eventsAttending: [mongoose.Schema.Types.ObjectId] }));
    const RSVP = mongoose.model('RSVP', new mongoose.Schema({}));
    const Review = mongoose.model('Review', new mongoose.Schema({}));

    // 1. Clear RSVPs and Reviews
    const rsvpDel = await mongoose.connection.collection('rsvps').deleteMany({});
    const reviewDel = await mongoose.connection.collection('reviews').deleteMany({});
    console.log(`Deleted ${rsvpDel.deletedCount} RSVPs.`);
    console.log(`Deleted ${reviewDel.deletedCount} Reviews.`);

    // 2. Clear Attendees from all Events
    const eventUpd = await mongoose.connection.collection('events').updateMany(
      {},
      { $set: { attendees: [] } }
    );
    console.log(`Cleared attendees for ${eventUpd.modifiedCount} events.`);

    // 3. Clear Registered Events from all Users
    const userUpd = await mongoose.connection.collection('users').updateMany(
      {},
      { $set: { eventsAttending: [] } }
    );
    console.log(`Cleared eventsAttending for ${userUpd.modifiedCount} users.`);

    // 4. Remove stale virtual fields if they were física
    const physicalCleanup = await mongoose.connection.collection('events').updateMany(
      {},
      { $unset: { attendeeCount: '', spotsRemaining: '', isFullyBooked: '' } }
    );
    console.log(`Removed stale physical fields from ${physicalCleanup.modifiedCount} events.`);

    console.log('Purge Complete! Your database is now fresh.');
    process.exit(0);
  } catch (err) {
    console.error('Purge Failed:', err);
    process.exit(1);
  }
}

purgeAllRSVPs();
