import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { slug, content } = await request.json()

        if (!slug || !content) {
            return NextResponse.json({ error: 'Slug and content are required' }, { status: 400 })
        }

        const note = await prisma.note.upsert({
            where: { slug },
            update: { content },
            create: { slug, content },
        })

        return NextResponse.json(note)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
    }
}
