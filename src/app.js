require('dotenv').config();

const express = require('express');
const cors = require('cors');
const salaryRoutes = require('./routes/salary.routes');
const companyRoutes = require('./routes/company.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,          // Vercel production URL
  'http://localhost:5173',            // Vite dev server
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) in development
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.sendStatus(200);
});

app.use(salaryRoutes);
app.use(companyRoutes);
app.use(errorHandler);

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Compensation intelligence backend listening on port ${port}`);
  });
}

module.exports = app;
