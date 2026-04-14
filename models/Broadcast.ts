import mongoose from 'mongoose'

const BroadcastSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  htmlContent: { type: String },
  recipientType: { 
    type: String, 
    enum: ['all', 'verified', 'unverified'], 
    default: 'all' 
  },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  totalRecipients: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['sending', 'completed', 'failed'], 
    default: 'sending' 
  },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
}, { timestamps: true })

export default mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema)
