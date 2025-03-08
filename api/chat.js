// api/chat.js
module.exports = async (req, res) => {
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.APIGUIJI}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
  
      if (!response.ok) {
        throw new Error('API request failed');
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };