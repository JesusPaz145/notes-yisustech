import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = await params

        const note = await prisma.note.findUnique({
            where: { slug },
        })

        if (!note) {
            return NextResponse.json({ slug, content: '', updatedAt: new Date() })
        }

        return NextResponse.json(note)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
    }
}
