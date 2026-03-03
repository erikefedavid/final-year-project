"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FlashcardViewer } from "@/components/documents/flashcard-viewer";
import { fetchWithTimeout } from "@/lib/fetch-wrapper";
import { SafeImage } from "@/components/shared/safe-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Copy,
  Download,
  Trash2,
  Eye,
  FileText,
  Clock,
  Check,
  Send,
  Loader2,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SUMMARY_TYPES } from "@/lib/constants";
import Link from "next/link";

export default function DocumentViewPage() {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedType, setSelectedType] = useState("detailed");
  const [isResummarizing, setIsResummarizing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const chatEndRef = useRef(null);
  const params = useParams();
  const router = useRouter();

    useEffect(() => {
    if (document) {
      window.document.title = `${document.originalName} | DocDigitize`;
    }
  }, [document]);

  useEffect(() => {
    fetchDocument();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setDocument(data.data.document);
        setSelectedType(data.data.document.summaryType || "detailed");
      } else {
        setError(data.error || "Document not found");
      }
    } catch (err) {
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, type) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");

    if (type === "text") {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } else {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleDownload = (format) => {
    if (format === "txt") {
      downloadAsTxt();
    } else {
      downloadAsDocx();
    }
  };
        const cleanMarkdown = (text) => {
      if (!text) return "";

      return text
        .replace(/#{1,6}\s?/g, "")        // Remove headings #
        .replace(/\*\*(.*?)\*\*/g, "$1")  // Remove bold **
        .replace(/\*(.*?)\*/g, "$1")      // Remove italic *
        .replace(/-\s/g, "• ")            // Replace dash bullets with dot
        .replace(/`(.*?)`/g, "$1")        // Remove inline code `
        .trim();
    };
      const downloadAsTxt = () => {
        const cleanSummary = cleanMarkdown(document.summary);

        const blob = new Blob([cleanSummary], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `${document.originalName}_${selectedType}_summary.txt`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success("Downloading AI summary as TXT!");
      };

      const downloadAsDocx = async () => {
        try {
          const { Document: DocxDocument, Packer, Paragraph } = await import("docx");
          const { saveAs } = await import("file-saver");

          const cleanSummary = cleanMarkdown(document.summary);

          const paragraphs = cleanSummary.split("\n").map(
            (line) => new Paragraph(line)
          );

          const doc = new DocxDocument({
            sections: [{ children: paragraphs }],
          });

          const blob = await Packer.toBlob(doc);
          saveAs(blob, `${document.originalName}_${selectedType}_summary.docx`);

          toast.success("AI summary downloaded as DOCX!");
        } catch (error) {
          toast.error("Failed to download summary.");
        }
      };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Document deleted successfully");
        router.push("/documents");
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResummarize = async (type) => {
    setSelectedType(type);
    setIsResummarizing(true);

    try {
      const response = await fetchWithTimeout(`/api/documents/${params.id}/resummarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryType: type }),
      });

      const data = await response.json();

      if (data.success) {
        setDocument((prev) => ({
          ...prev,
          summary: data.data.summary,
          summaryType: data.data.summaryType,
        }));
        toast.success("Summary regenerated!");
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Failed to regenerate summary");
    } finally {
      setIsResummarizing(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();

    if (!chatInput.trim()) return;

    const question = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsChatLoading(true);

    try {
      const response = await fetchWithTimeout(`/api/documents/${params.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (data.success) {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.data.answer },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't answer that question." },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatProcessingTime = (ms) => {
    if (ms < 1000) return ms + "ms";
    return (ms / 1000).toFixed(1) + "s";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">{error || "Document not found"}</p>
        <Link href="/documents" className="mt-4">
          <Button variant="outline">Back to Documents</Button>
        </Link>
      </div>
    );
  }

  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full px-4 sm:px-6 lg:px-8 overflow-x-hidden"
  >
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold break-words">
            {document.originalName}
          </h2>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>{formatDate(document.createdAt)}</span>

            <Badge variant="secondary">
              {document.fileType.split("/").pop().toUpperCase()}
            </Badge>

            <span>{formatFileSize(document.fileSize)}</span>

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatProcessingTime(document.processingTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Original
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="break-words">
                {document.originalName}
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-auto">
              {document.fileType.startsWith("image/") ? (
                <SafeImage
                  src={document.imageUrl}
                  alt={document.originalName}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded"
                />
              ) : document.fileType === "application/pdf" ? (
                <iframe
                  src={document.imageUrl}
                  className="w-full h-[70vh] rounded"
                />
              ) : (
                <div className="flex items-center justify-center h-[300px] bg-muted rounded">
                  <p className="text-muted-foreground">
                    Preview not available for this file type.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Download */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleDownload("txt")}>
              Download as .TXT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("docx")}>
              Download as .DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>

      {/* Text + Summary Grid */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Extracted Text */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Extracted Text</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleCopy(document.extractedText, "text")}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </CardHeader>

          <CardContent>
            <div className="h-64 sm:h-80 lg:h-96 overflow-y-auto rounded-md bg-muted/50 p-4">
              <p className="text-sm whitespace-pre-wrap break-words">
                {document.extractedText}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
         <CardHeader className="space-y-4">

          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>
              AI Summary ({SUMMARY_TYPES[selectedType]?.label})
            </CardTitle>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(document.summary || "", "summary")}
            >
              {copiedSummary ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            {Object.entries(SUMMARY_TYPES).map(([key, value]) => (
              <Button
                key={key}
                variant={selectedType === key ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => handleResummarize(key)}
              >
                {value.label}
              </Button>
            ))}
          </div>

        </CardHeader>

          <CardContent>
            <div className="h-64 sm:h-80 lg:h-96 overflow-y-auto rounded-md bg-muted/50 p-4">
              <MarkdownRenderer content={document.summary} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Chat Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask About This Document
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-48 sm:h-64 overflow-y-auto bg-muted/50 rounded-md p-4 mb-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div className="inline-block max-w-[85%] px-4 py-2 rounded-lg bg-muted text-sm break-words">
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleChat} className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Flashcards */}
      {document.extractedText && (
        <FlashcardViewer documentId={params.id} />
      )}

    </div>
  </motion.div>
);
}