export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Validate email
    if (!data.email || !data.email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Submit to Airtable using server-side env variable
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Email': data.email || '',
            'Name': data.name || '',
            'Role': data.role || '',
            'Frustrations': data.frustrations || '',
            'Pricing': data.pricing || '',
            'Message': data.message || '',
            'Collaboration': data.collab || '',
            'Date': new Date().toISOString().split('T')[0]
          }
        })
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error('Airtable error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
