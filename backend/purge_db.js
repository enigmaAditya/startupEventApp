const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from the current folder (backend/)
dotenv.config({ path: path.join(__dirname, '.env') });

async function purgeAll() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Delete Attendee Users (the 29 ghost users)
    // We KEEP organizers and admins to ensure the app still has owners
    const userDel = await mongoose.connection.collection('users').deleteMany({
      role: { $nin: ['organizer', 'admin'] }
    });
    console.log(`Deleted ${userDel.deletedCount} Attendee users (the ghost accounts).`);

    // 2. Clear RSVPs and Reviews
    const rsvpDel = await mongoose.connection.collection('rsvps').deleteMany({});
    const reviewDel = await mongoose.connection.collection('reviews').deleteMany({});
    console.log(`Deleted ${rsvpDel.deletedCount} RSVPs.`);
    console.log(`Deleted ${reviewDel.deletedCount} Reviews.`);

    // 3. Clear Attendees array from all Events
    const eventUpd = await mongoose.connection.collection('events').updateMany(
      {},
      { $set: { attendees: [] } }
    );
    console.log(`Cleared attendees list for ${eventUpd.modifiedCount} events.`);

    // 4. Clear eventsAttending array from remaining Users (Admins/Organizers)
    const userClear = await mongoose.connection.collection('users').updateMany(
      {},
      { $set: { eventsAttending: [] } }
    );
    console.log(`Reset attending list for ${userClear.modifiedCount} remaining staff users.`);

    // 5. Remove stale virtual fields if they were physical
    const physicalCleanup = await mongoose.connection.collection('events').updateMany(
      {},
      { $unset: { attendeeCount: '', spotsRemaining: '', isFullyBooked: '' } }
    );
    console.log(`Removed stale physical fields from ${physicalCleanup.modifiedCount} events.`);

    console.log('\n--- PURGE COMPLETE ---');
    console.log('All ghost users and registrations are gone.');
    console.log('Organizers and Admins are kept safe.');
    process.exit(0);
  } catch (err) {
    console.error('Purge Failed:', err);
    process.exit(1);
  }
}

purgeAll();
