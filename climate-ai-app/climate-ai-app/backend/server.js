require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const alertsRouter = require('./routes/alerts');
app.use('/api/alerts', alertsRouter);
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 