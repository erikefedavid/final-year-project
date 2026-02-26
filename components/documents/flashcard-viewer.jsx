"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw, Loader2, GraduationCap } from "lucide-react";

export function FlashcardViewer({ documentId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateFlashcards = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/documents/${documentId}/flashcards`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setFlashcards(data.data.flashcards);
        setIsGenerated(true);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev < flashcards.length - 1 ? prev + 1 : 0
      );
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev > 0 ? prev - 1 : flashcards.length - 1
      );
    }, 200);
  };

  if (!isGenerated) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Study Flashcards</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate flashcards from this document to help you study.
          </p>
          <Button onClick={generateFlashcards} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4 mr-2" />
                Generate Flashcards
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Flashcards
          </h3>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>

        <div
          className="cursor-pointer mb-4"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? "back" : "front"}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`min-h-[200px] rounded-lg p-6 flex flex-col items-center justify-center text-center ${
                isFlipped
                  ? "bg-primary/10 border-2 border-primary/20"
                  : "bg-muted border-2 border-muted"
              }`}
            >
              <p className="text-xs text-muted-foreground mb-2">
                {isFlipped ? "ANSWER" : "QUESTION"}
              </p>
              <p className="text-lg font-medium">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Click to {isFlipped ? "see question" : "reveal answer"}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={prevCard}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={generateFlashcards}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={nextCard}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}