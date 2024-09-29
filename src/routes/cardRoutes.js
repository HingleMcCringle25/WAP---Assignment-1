import { PrismaClient } from '@prisma/client';
import express from 'express';
import fs from 'fs';
import multer from 'multer';

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images'); //saves the images to the image folder
    },
    filename: (req, file, cb) => {
        //I got these next two lines from chatgpt for assigning date and random number to an image
        const uniqueName = `${Date.now()}-${Math.floor(Math.random() * 1000)}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

//create method
router.post('/create', upload.single('image'), async (req, res) => {
    const { name, serialNumber, atk, def, element, description, type, monsterType } = req.body;

//throw 400 error if required fields are missing(name, serial number, description, type, element, image)
    if (!name || !serialNumber || !description || !type || !element) {
        return res.status(400).json({error: 'Missing required fields.'});
    }
    try {
        const card = await prisma.card.create({
            data: {
                name,
                image: req.file.path,
                serialNumber,
                atk: atk ? parseInt(atk) : null,
                def: def ? parseInt(def) : null,
                element,
                description,
                type,
                monsterType,
            },
        });
        res.status(200).json({ message: 'Card created successfully', card });
//error for card creation
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the card.' });
    }
});

//get all cards
router.get('/all', async (req, res) => {
    try {
        const cards = await prisma.card.findMany();
        res.status(200).json(cards);
//get all error
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching cards.' });
    }
});

//read by ID
router.get('/read/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const card = await prisma.card.findUnique({
            where: { id: parseInt(id) },
        });
        if (card) {
            res.status(200).json(card);
        } else {
//throw 404 error if card doesnt exist in database
            res.status(404).json({ error: 'Card not found.' });
        }
//read error
    } catch (error) {
        res.status(500).json({ error: 'An error occurred.' });
    }
});

//update method
router.put('/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, serialNumber, atk, def, element, description, type, monsterType } = req.body;

//throw 400 error if required fields are missing in update
    if (!name || !serialNumber || !description || !type || !element) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
//update image path and assign new name
    const newImageName = req.file ? `${Date.now()}-${Math.floor(Math.random() * 1000)}-${req.file.originalname}` : undefined;

    try {
        const oldCard = await prisma.card.findUnique({
            where: { id: parseInt(id) },
        });

        if (!oldCard) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        const updatedCard = await prisma.card.update({
            where: { id: parseInt(id) },
            data: {
                name,
                image: newImageName ? `public/images/${newImageName}` : oldCard.image,  //chatgpt helped me with this line after googling did nothing
                serialNumber,
                atk: atk ? parseInt(atk) : undefined,
                def: def ? parseInt(def) : undefined,
                element,
                description,
                type,
                monsterType,
            },
        });

        if (newImageName) {
            fs.unlink(oldCard.image, (err) => {
                if (err) console.error('Error deleting old image:', err);
            });
        }

        res.status(200).json({ message: 'Card updated successfully', updatedCard });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the card.' });
    }
});

//delete method
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const card = await prisma.card.findUnique({
            where: { id: parseInt(id) },
        });
//throw 404 if deleting a card that doesnt exist
        if (!card) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        await prisma.card.delete({
            where: { id: parseInt(id) },
        });

        fs.unlink(card.image, (err) => {
            if (err) console.error('Error deleting image:', err);
        });

        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the card.' });
    }
});

export default router;


