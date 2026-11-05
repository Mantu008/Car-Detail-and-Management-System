const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    // Confirmed TOTP secret (only set once the user has verified a code)
    twoFactorSecret: { type: String, default: '' },
    // Secret generated during setup, waiting for the first valid code
    twoFactorPendingSecret: { type: String, default: '' },
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorBackupCodes: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Hash the password only when it was actually changed.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never leak secrets when a user document is serialised.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.twoFactorSecret;
    delete ret.twoFactorPendingSecret;
    delete ret.twoFactorBackupCodes;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
