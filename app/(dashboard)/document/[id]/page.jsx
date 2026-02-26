"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FlashcardViewer } from "@/components/documents/flashcard-viewer";
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

  const handleDownload = () => {
    const content = `Document: ${document.originalName}\nDate: ${new Date(document.createdAt).toLocaleDateString()}\nSummary Type: ${SUMMARY_TYPES[document.summaryType]?.label || "Detailed"}\n\n--- EXTRACTED TEXT ---\n\n${document.extractedText}\n\n--- AI SUMMARY ---\n\n${document.summary}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.originalName}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded!");
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
      const response = await fetch(`/api/documents/${params.id}/resummarize`, {
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
      const response = await fetch(`/api/documents/${params.id}/chat`, {
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
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{document.originalName}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {formatDate(document.createdAt)}
            </span>
            <Badge variant="secondary">
              {document.fileType.split("/").pop().toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatFileSize(document.fileSize)}
            </span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatProcessingTime(document.processingTime)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Original
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{document.originalName}</DialogTitle>
            </DialogHeader>
            <div className="overflow-auto">
              <img
                src={document.imageUrl}
                alt={document.originalName}
                className="w-full rounded"
              />
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>

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
                Are you sure you want to delete &quot;{document.originalName}&quot;?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Extracted Text</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(document.extractedText, "text")}
            >
              {copiedText ? (
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
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-96 overflow-y-auto rounded-md bg-muted/50 p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {document.extractedText || "No text extracted."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Summary</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(document.summary, "summary")}
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

            <div className="flex gap-1.5 flex-wrap pt-2">
              {Object.entries(SUMMARY_TYPES).map(([key, value]) => (
                <Button
                  key={key}
                  variant={selectedType === key ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleResummarize(key)}
                  disabled={isResummarizing}
                >
                  {isResummarizing && selectedType === key ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : null}
                  {value.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-96 overflow-y-auto rounded-md bg-muted/50 p-4">
              {isResummarizing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Regenerating summary...
                  </p>
                </div>
              ) : (
                <div className="text-sm">
                  {document.summary ? (
                    <MarkdownRenderer content={document.summary} />
                  ) : (
                    <p className="text-muted-foreground">No summary available.</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask About This Document
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions and get answers based only on this document.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto rounded-md bg-muted/50 p-4 mb-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Ask a question about your document
                </p>
                <p className="text-xs text-muted-foreground">
                  Example: &quot;What are the main topics covered?&quot;
                </p>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))
            )}

            {isChatLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChat} className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about this document..."
              disabled={isChatLoading}
            />
            <Button type="submit" size="icon" disabled={isChatLoading || !chatInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <FlashcardViewer documentId={params.id} />
    </motion.div>
  );
}