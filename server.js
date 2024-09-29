import dotenv from 'dotenv';
import express from 'express';
import cardRoutes from './src/routes/cardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/public', express.static('public'));

//card route
app.use('/api/cards', cardRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});


