// Migration utility to import existing data into CMS format

// import fs from 'fs/promises'
// import path from 'path'
import type { CSSProperties } from 'react'
import { createChapter, createCard } from './db'
import data from '../app/data/ode-islands.json'

interface OldCardData {
  text?: {
    title?: string
    subtitle?: string
    description?: string
  }
  cta?: {
    title: string
    url: string
  }
  ctaStart?: string
  image?: {
    url: string
    width: number
    height: number
  }
  video?: {
    type?: 'background' | 'immersive'
    url: string
    width: number
    height: number
    audio?: boolean
  }
  theme?: {
    mix?: CSSProperties['mixBlendMode']
    shadow?: boolean
    background?: string
    overlay?: string
    invert?: boolean
    title?: string
    subtitle?: string
    description?: string
    cta?: string
    ctaStart?: string
  }
}

export async function migrateExistingData(): Promise<void> {
  console.log('Starting data migration...')

  const chapterData = data as { [key: string]: OldCardData[] }
  
  for (const [chapterKey, cards] of Object.entries(chapterData)) {
    // Extract chapter number from key like "chapter-1"
    const chapterNumber = parseInt(chapterKey.replace('chapter-', ''))
    
    // Create chapter title based on first card or default
    const firstCard = cards[0]
    const chapterTitle = firstCard?.text?.title || `Chapter ${chapterNumber}`
    
    console.log(`Migrating ${chapterKey}: ${chapterTitle}`)
    
    // Create chapter
    const chapter = await createChapter({
      title: chapterTitle,
      description: firstCard?.text?.description,
      order: chapterNumber,
      published: true
    })
    
    // Create cards for this chapter
    for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
      const oldCard = cards[cardIndex]
      
      await createCard({
        chapterId: chapter.id,
        order: cardIndex,
        text: oldCard.text,
        cta: oldCard.cta,
        ctaStart: oldCard.ctaStart,
        image: oldCard.image,
        video: oldCard.video,
        theme: oldCard.theme
      })
    }
    
    console.log(`✓ Migrated ${cards.length} cards for ${chapterKey}`)
  }
  
  console.log('Migration completed!')
}

// CLI script to run migration
if (require.main === module) {
  migrateExistingData()
    .then(() => {
      console.log('Migration successful!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}
