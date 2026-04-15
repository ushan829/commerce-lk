import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const { emailNotifications, publicProfile } = body

    const updateFields: any = {}
    if (typeof emailNotifications === 'boolean') {
      updateFields.emailNotifications = emailNotifications
    }
    if (typeof publicProfile === 'boolean') {
      updateFields.publicProfile = publicProfile
    }

    const user = await User.findByIdAndUpdate(
      (session.user as any).id,
      { $set: updateFields },
      { new: true }
    ).select('emailNotifications publicProfile')

    return NextResponse.json({ 
      success: true, 
      emailNotifications: user?.emailNotifications,
      publicProfile: user?.publicProfile
    })
  } catch (error) {
    console.error('[User Preferences PATCH]:', error)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
