"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { FileText, Trash2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    window.document.title = "My Documents | DocDigitize";
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      if (data.success) setDocuments(data.data.documents);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(documents.filter((doc) => doc._id !== id));
        toast.success("Document deleted");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold">My Documents</h2>
            <p className="text-sm text-muted-foreground">
              {documents.length} documents
            </p>
          </div>

          <Link href="/upload">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No documents yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">

                    <Link
                      href={`/document/${doc._id}`}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <FileText className="h-6 w-6 text-primary shrink-0" />

                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate break-words">
                          {doc.originalName}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          <Clock className="h-3 w-3" />
                          {formatDate(doc.createdAt)}
                          <Badge
                            variant={
                              doc.status === "completed"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Document
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this document?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(doc._id)}
                            disabled={deletingId === doc._id}
                            className="bg-destructive text-destructive-foreground"
                          >
                            {deletingId === doc._id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
}