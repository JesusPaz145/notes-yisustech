'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [localContent, setLocalContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isFirstLoad, setIsFirstLoad] = useState(true)

    const { data: remoteNote, mutate } = useSWR(`/api/notes/${slug}`, fetcher, {
        refreshInterval: 2000, // Poll every 2 seconds
        revalidateOnFocus: true
    })

    // Update local content when remote content changes (if not typing)
    useEffect(() => {
        if (remoteNote && isFirstLoad) {
            setLocalContent(remoteNote.content || '')
            setIsFirstLoad(false)
        }
    }, [remoteNote, isFirstLoad])

    // Update local content if remote content changes and it's different (optional, might cause cursor jumps)
    useEffect(() => {
        if (remoteNote && !isSaving && remoteNote.content !== localContent && !isFirstLoad) {
            // Only update if the remote content is different and we are not currently saving
            // This is a simple conflict resolution: remote wins if we are idle
            setLocalContent(remoteNote.content || '')
        }
    }, [remoteNote?.content])

    const saveNote = useCallback(async (content: string) => {
        setIsSaving(true)
        try {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, content }),
            })
            mutate() // Refresh SWR data
        } catch (err) {
            console.error('Error saving note:', err)
        } finally {
            setIsSaving(false)
        }
    }, [slug, mutate])

    // Auto-save logic with debounce
    useEffect(() => {
        if (isFirstLoad) return

        const timeoutId = setTimeout(() => {
            if (localContent !== remoteNote?.content) {
                saveNote(localContent)
            }
        }, 1000)

        return () => clearTimeout(timeoutId)
    }, [localContent, saveNote, remoteNote?.content, isFirstLoad])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalContent(e.target.value)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl h-[80vh] flex flex-col"
        >
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                    <img src="/logo-jp.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-lg shadow-red-950/50" />
                    <h1 className="text-2xl font-bold gradient-text">Notes <span className="text-sm font-mono opacity-50 ml-2">/{slug}</span></h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {isSaving ? (
                        <div className="flex items-center gap-1 text-red-400">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Guardando...
                        </div>
                    ) : (
                        <span className="opacity-50 italic">
                            {remoteNote?.updatedAt ? `Sincronizado ${new Date(remoteNote.updatedAt).toLocaleTimeString()}` : 'Listo'}
                        </span>
                    )}
                </div>
            </div>

            <div className="relative glass grow flex flex-col overflow-hidden border-red-900/20 shadow-2xl shadow-red-950/20">
                <textarea
                    className="w-full h-full bg-transparent p-8 md:p-12 outline-none text-white text-xl font-light leading-relaxed resize-none selection:bg-red-500/30"
                    value={localContent}
                    onChange={handleChange}
                    placeholder="Comienza a escribir tu nota aquí..."
                    autoFocus
                />
            </div>

            <div className="mt-4 flex justify-between items-center px-4 text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                <div>{localContent.length} caracteres</div>
                <div className="text-red-900/40">YisusNotes &copy; 2025</div>
            </div>
        </motion.div>
    )
}
