import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.email) {
      return NextResponse.json({ message: 'Invalid input data or missing email' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { email: data.email },
      data: {
        dispositif: data.dispositif || null,
        engagement: data.engagement || null,
        identification: data.identification || null,
        formation: data.formation || null,
        procedure: data.procedure || null,
        dispositifAlert: data.dispositifAlert || null,
        certifierISO: data.certifierISO || null,
        mepSystem: data.mepSystem || null,
        intention: data.intention || null,
      },
    });

    return NextResponse.json({ message: 'Data updated successfully', updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const userData = await db.user.findUnique({
      where: { email },
      select: {
        dispositif: true,
        engagement: true,
        identification: true,
        formation: true,
        procedure: true,
        dispositifAlert: true,
        certifierISO: true,
        mepSystem: true,
        intention: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, userData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}