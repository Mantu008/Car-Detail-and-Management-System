const mongoose = require('mongoose');

const fuelEntrySchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    // Litres (or kWh for electric vehicles)
    fuelAmount: {
      type: Number,
      required: [true, 'Please provide the fuel amount'],
      min: [0.01, 'Fuel amount must be greater than 0'],
    },
    cost: {
      type: Number,
      required: [true, 'Please provide the cost'],
      min: [0, 'Cost cannot be negative'],
    },
    // Odometer reading in km at the time of refuelling
    odometer: {
      type: Number,
      required: [true, 'Please provide the odometer reading'],
      min: [0, 'Odometer reading cannot be negative'],
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'cng', 'electric'],
      default: 'petrol',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot be more than 200 characters'],
    },
  },
  { timestamps: true }
);

fuelEntrySchema.index({ car: 1, date: -1 });

module.exports = mongoose.model('FuelEntry', fuelEntrySchema);
