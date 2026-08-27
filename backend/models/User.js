const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'User handle required'] },
  email: { type: String, required: [true, 'Email field mandatory'], unique: true, trim: true, lowercase: true },
  password: { 
    type: String, 
    required: [true, 'Cryptographic pass-phrase entity required'],
    validate: {
      validator: function(v) {
        // Skip validation if the password is already hashed (e.g. starts with $2a$ or $2b$)
        if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(v)) return true;
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(v);
      },
      message: 'Password must be minimum 8 characters, and should contain at least one letter, one number, and one symbol.'
    }
  },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  verificationCodeExpires: { type: Date, default: null }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);