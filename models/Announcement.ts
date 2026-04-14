import mongoose from 'mongoose'

const AnnouncementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'success', 'error'], 
    default: 'info' 
  },
  isActive: { type: Boolean, default: true },
  link: { type: String, default: '' },
  linkText: { type: String, default: '' },
  dismissible: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema)
