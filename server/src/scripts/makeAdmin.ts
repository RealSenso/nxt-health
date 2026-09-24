import { connect } from '../db.js';

const email = process.argv[2]?.trim().toLowerCase();
const uri = process.env.MONGODB_URI;
if (!email || !uri) {
  console.error('Usage: MONGODB_URI="..." npm run make-admin -- you@example.com');
  process.exit(1);
}
const { client, database } = await connect(uri, process.env.MONGODB_DB || 'nxt_health');
const result = await database.col('users').updateOne(
  { email },
  { $set: { role: 'admin', membership_status: 'active', membership_started_at: new Date().toISOString() } },
);
console.log(result.matchedCount ? `${email} is now an admin.` : `No user with email ${email} — sign up on the site first.`);
await client.close();
