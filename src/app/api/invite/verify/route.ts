
import { NextResponse } from 'next/server';
import { Requests } from '@/services/requests';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json(
            { error: 'Token is required' },
            { status: 400 }
        );
    }

    try {
        const requests = new Requests('');
        const response = await requests.verifyInviteToken(token);

        return NextResponse.json({
            documentTitle: response.documentTitle,
            role: response.role,
            email: response.email,
            isValid: true
        });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 400 }
        );
    }
}