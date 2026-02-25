"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, Eye, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();

      if (data.success) {
        setDocuments(data.data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const recentDocuments = documents.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6 px-2 sm:px-0">
        <Skeleton className="h-8 w-48 sm:w-64" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 sm:h-32 w-full" />
          <Skeleton className="h-28 sm:h-32 w-full" />
        </div>

        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0 max-w-5xl mx-auto">

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
          Welcome back, {user?.name}!
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground">
          Here is an overview of your documents.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">
              {documents.length}
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Quick Upload
            </CardTitle>

            <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>

          <CardContent className="px-4">
            <Link href="/upload" className="block">
              <Button className="w-full  text-sm sm:text-base">
                <Plus className="h-4 w-2 lg:mr-2 shrink-0" />
                Upload New Document
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* Recent Documents */}
      <Card className="w-full">
        <CardHeader>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <CardTitle className="text-base sm:text-lg">
              Recent Documents
            </CardTitle>

            {documents.length > 0 && (
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="w-fit">
                  View All
                </Button>
              </Link>
            )}

          </div>

        </CardHeader>

        <CardContent>

          {recentDocuments.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-10 text-center px-4">

              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />

              <p className="text-sm sm:text-base text-muted-foreground">
                No documents yet
              </p>

              <p className="text-xs sm:text-sm text-muted-foreground">
                Upload your first document to get started
              </p>

              <Link href="/upload" className="mt-4">
                <Button variant="outline" size="sm">
                  Upload Document
                </Button>
              </Link>
            </div>
          ) : (

            <div className="space-y-2">

              {recentDocuments.map((doc) => (

                <Link
                  key={doc._id}
                  href={`/document/${doc._id}`}
                  className="
                    flex flex-col sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-2 sm:gap-3
                    p-3
                    rounded-lg
                    hover:bg-muted/50
                    transition-colors
                  "
                >

                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">

                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />

                    <div className="min-w-0">

                      <p className="
                        font-medium
                        text-sm
                        truncate
                        w-full
                        max-w-[180px]
                        sm:max-w-[250px]
                        md:max-w-[350px]
                      ">
                        {doc.originalName}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.createdAt)}
                      </p>

                    </div>

                  </div>

                  {/* Right */}
                  <div className=" md:flex items-center gap-2 self-start sm:self-auto">

                    <Badge
                      variant={
                        doc.status === "completed"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs sm:text-sm py-1"
                    >
                      {doc.status}
                    </Badge>

                    <Eye className="h-4 w-4 hidden md:block shrink-0 text-muted-foreground" />

                  </div>

                </Link>

              ))}

            </div>

          )}

        </CardContent>
      </Card>

    </div>
  );
}