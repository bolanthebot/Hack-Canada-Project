require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Parking = require('./models/Parking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hack-canada';
const DATA_FILE_PATH = path.join(__dirname, '../sources/green-p-parking-2019.json');

async function seedGreenPParking() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    const records = JSON.parse(rawData);

    if (!records.carparks || !Array.isArray(records.carparks)) {
        throw new Error('Invalid JSON format: Expected a "carparks" array.');
    }

    console.log(`Found ${records.carparks.length} Green P parking records. Inserting...`);

    let count = 0;
    
    // Clear old green_p spots in case the script is run multiple times
    await Parking.deleteMany({ source: 'green_p' });
    console.log('Cleared existing green p static spots');

    for (const item of records.carparks) {
        
        let capacity = 0;
        if (item.capacity) {
             capacity = parseInt(item.capacity.replace(/,/g, ''), 10);
             if (isNaN(capacity)) capacity = 0;
        }

        const parkingData = {
            location: {
                type: 'Point',
                coordinates: [parseFloat(item.lng), parseFloat(item.lat)]
            },
            status: 'available', // Defaults to available
            streetName: item.address,
            source: 'green_p',
            capacity,
            rate: item.rate,
            carparkType: item.carpark_type_str,
            paymentMethods: item.payment_methods || []
        };
        
        await Parking.create(parkingData);
        count++;
    }

    console.log(`Successfully seeded ${count} Green P parking records!`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedGreenPParking();
