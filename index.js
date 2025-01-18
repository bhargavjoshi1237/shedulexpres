const express = require('express');
const app = express();
const { Pool } = require('pg');

app.use(express.json());
const pool = new Pool({
  connectionString: "postgres://avnadmin:AVNS_dLko_ZaEi29LBRMxFmu@pg-35145654-bhargavjoshi1237-18a8.b.aivencloud.com:16691/defaultdb",
  ssl: {
    rejectUnauthorized: false
  }
});
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        dates VARCHAR PRIMARY KEY,
        time VARCHAR, NOT NULL,
        hrname VARCHAR(255) NOT NULL,
        description TEXT,
      );

      CREATE INDEX IF NOT EXISTS idx_bookings_dates 
      ON bookings(dates);
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDatabase();
// POST route handler
app.post('/addbydate', async (req, res) => {
  try {
    const { date, time, hrname, description } = req.body;

    // Input validation
    if (!date || !time || !hrname) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO bookings (dates, time, hrname, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;

    const values = [date, time, hrname, description];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: result.rows[0]
    });

  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get("/", (req,res) => {
  res.json("hello world")
})


app.get("/getbydate/:date", async (req, res) => {
  try {
    const date = req.params.date;
    const query = `
      SELECT * FROM bookings 
      WHERE date = ${date} 
      ORDER BY start_time`;
    
    const result = await pool.query(query, [date]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});