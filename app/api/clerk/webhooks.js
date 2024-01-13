// pages/api/clerk/webhooks.js
import { getSession } from '@clerk/clerk-sdk-node';
import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { event, data } = req.body;

      if (event === 'user.updated' || event === 'user.created') {
        const clerkUser = await getSession(data.id);
        const { id, email, username } = clerkUser;

        // Sync user to MySQL database
        const query = 'INSERT INTO users (clerk_id, email, username) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), username = VALUES(username)';
        const values = [id, email, username];

        db.query(query, values, (error, results) => {
          if (error) {
            console.error('Error syncing user to MySQL:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
          console.log('User synced to MySQL:', results);
          return res.status(200).json({ message: 'User synced successfully' });
        });
      } else {
        return res.status(400).json({ error: 'Invalid event type' });
      }
    } catch (error) {
      console.error('Error handling Clerk webhook:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
