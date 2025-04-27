import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.email || data.score === undefined) {
      return NextResponse.json(
        { message: 'Invalid input data or missing email/score' }, 
        { status: 400 }
      );
    }

    const validatedScore = Math.max(0, data.score);

    const updatedUser = await db.user.update({
      where: { email: data.email },
      data: {
        score: validatedScore
      },
    });

    return NextResponse.json(
      { message: 'Score updated successfully', updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const userData = await db.user.findUnique({
      where: { email },
      select: {
        score: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const validatedScore = userData.score !== null ? Math.max(0, userData.score) : null;

    if (validatedScore === null) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No previous exam score found. First exam attempt.' 
        },
        { status: 200 }
      );
    } else if (validatedScore < 7) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Score is not sufficient (must be greater than 7).' 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, userData: { score: validatedScore } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching score:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}