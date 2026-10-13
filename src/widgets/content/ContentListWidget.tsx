"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { getDocumentList } from "@/modules/document/actions/document.action"

interface ContentListWidgetProps {
  mid: string;
  count: number;
}

export default function ContentListWidget({ mid, count }: ContentListWidgetProps) {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const loadData = async () => {
      try {
        setLoading(true)
        const result = await getDocumentList(mid, 1, count)
        if (result.success && result.data) {
          setItems(result.data.documentList || [])
        }
      } catch (error) {
        console.error(`${mid} 로드 실패:`, error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [mid, count])

  if (!mounted) return <div className="h-[240px] w-full border-t border-slate-100 dark:border-dark-800" />

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="divide-y divide-dashed divide-slate-100 dark:divide-dark-800">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="h-[52px] w-full animate-pulse bg-white dark:bg-dark-900" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col divide-y divide-slate-100 dark:divide-dark-800"
          >
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/posts/${mid}/${item.slug}`}
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-1 py-3.5 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-dark-900/70"
              >
                {/* 1. Date / ID (Mono) */}
                <div className="flex-shrink-0 w-12 text-center">
                   <span className="text-[10px] font-mono font-bold text-slate-300 transition-colors leading-none group-hover:text-slate-600 dark:text-dark-500 dark:group-hover:text-dark-300">
                     {new Date(item.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                   </span>
                </div>


                {/* 3. Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {item.extraFieldData?.category && (
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none dark:text-dark-400">
                        {item.extraFieldData.category}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-sm leading-tight text-slate-800 transition-colors group-hover:text-slate-900 dark:text-dark-300 dark:group-hover:text-dark-100">
                    {item.title}
                  </div>
                </div>

                {/* 4. Action Indicator */}
                <div className="flex-shrink-0 pr-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-200 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-900 dark:text-dark-600 dark:group-hover:text-dark-200" />
                </div>
              </Link>
            ))}
          </motion.div>
        ) : (
          <div className="py-16 text-center border-b border-slate-100 dark:border-dark-800">
            <span className="text-[10px] font-mono font-bold text-slate-300 tracking-[0.4em] uppercase dark:text-dark-500">Status: Null</span>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
