"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ClientCard from "@/components/ClientCard";
import Footer from "@/components/Footer";

type ChapterData = {
  [key: string]: CardData[];
};

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;

  const [interacted, setInteracted] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [chapterData, setChapterData] = useState<ChapterData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get cards for current chapter
  const chapterNumber = chapterId.replace("chapter-", "");
  const cards: CardData[] = chapterData[`chapter-${chapterNumber}`] || [];

  // Load data based on environment
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check environment
        const isDevelopment = process.env.NODE_ENV === 'development' ||
                             window.location.hostname.includes('git-development') ||
                             window.location.search.includes('dev=true');

        let data;
        if (isDevelopment) {
          try {
            // Try to load development data
            const response = await fetch('/data/ode-islands.dev.json');
            if (response.ok) {
              data = await response.json();
              console.log('🚀 Loaded development data');
            } else {
              throw new Error('Dev data not found');
            }
          } catch (error) {
            // Fallback to production data
            const response = await fetch('/data/ode-islands.json');
            data = await response.json();
            console.log('📱 Loaded production data (fallback)');
          }
        } else {
          // Production - load production data
          const response = await fetch('/data/ode-islands.json');
          data = await response.json();
          console.log('📱 Loaded production data');
        }

        setChapterData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load chapter data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Redirect to chapter 1 if invalid chapter
  useEffect(() => {
    if (!loading && cards.length === 0 && chapterNumber !== "1") {
      router.push("/chapter-1");
    }
  }, [loading, cards.length, chapterNumber, router]);

  const scrollToCard = useCallback((cardIndex: number) => {
    if (containerRef.current) {
      // Use CSS custom property for consistent height calculation
      const cardHeight = containerRef.current.clientHeight;
      containerRef.current.scrollTo({
        top: cardIndex * cardHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const onPrev = useCallback(() => {
    const newIndex = Math.max(0, index - 1);
    setIndex(newIndex);
    scrollToCard(newIndex);
  }, [index, scrollToCard]);

  const onNext = useCallback(() => {
    if (!interacted) {
      setInteracted(true);
    }
    const newIndex = Math.min(cards.length - 1, index + 1);
    setIndex(newIndex);
    scrollToCard(newIndex);
  }, [interacted, index, cards.length, scrollToCard]);

  const onFirst = useCallback(() => {
    setIndex(0);
    scrollToCard(0);
  }, [scrollToCard]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only allow keyboard navigation after interaction
      if (!interacted) return;
      
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        onPrev();
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        onNext();
      } else if (event.key === "Home") {
        onFirst();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onFirst, interacted]);

  // Handle scroll events to update current card
  useEffect(() => {
    const handleScroll = () => {
      // Only handle scroll events after interaction
      if (!interacted || !containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const cardHeight = containerRef.current.clientHeight;
      const newCardIndex = Math.round(scrollTop / cardHeight);
      if (
        newCardIndex !== index &&
        newCardIndex >= 0 &&
        newCardIndex < cards.length
      ) {
        setIndex(newCardIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [index, cards.length, interacted]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading experience...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p>Chapter not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* <ChapterNav
        currentChapter={parseInt(chapterNumber)}
        totalChapters={availableChapters.length}
        availableChapters={availableChapters}
      /> */}
      <div
        ref={containerRef}
        className={`scroll-container w-full h-full snap-y snap-mandatory scrollbar-hide ${
          interacted ? "overflow-y-auto" : "overflow-y-hidden"
        }`}
        style={{
          WebkitOverflowScrolling: interacted ? 'touch' : 'auto',
          overscrollBehavior: 'none',
          touchAction: interacted ? 'pan-y' : 'none',
        }}
        onTouchMove={interacted ? undefined : (e) => e.preventDefault()}
        onWheel={interacted ? undefined : (e) => e.preventDefault()}
      >
        {cards.map((card, cardIndex) => (
          <div key={cardIndex} className="snap-start w-full">
            <ClientCard data={card} active={cardIndex === index} />
          </div>
        ))}
      </div>
      <Footer
        index={index}
        currentCard={cards[index]}
        totalCards={cards.length}
        interacted={interacted}
        onFirst={onFirst}
        onNext={onNext}
      />
    </div>
  );
}
