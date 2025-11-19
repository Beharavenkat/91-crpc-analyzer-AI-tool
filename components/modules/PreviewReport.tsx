// components/modules/Case-management.tsx

"use client";

import { useState } from "react";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Loader2 } from "lucide-react";

interface CaseManagementProps {
  caseItem: {
    case_id: string;
  };
}

export function PreviewReport({ caseItem }: CaseManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reportHtml, setReportHtml] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePreviewReport = async (case_id: string) => {
    setIsLoading(true);
    setReportHtml(""); // Clear previous report

    try {
      const response = await fetch('https://n8n.bestplanettechnology.com/webhook/ai_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      const markdownString = result[0].report;

      if (!markdownString || typeof markdownString !== 'string') {
        throw new Error("API response did not contain a valid 'report' string.");
      }

      // 1. Parse markdown to HTML
      const rawHtml = await marked.parse(markdownString);

      // 2. Sanitize the HTML to prevent XSS attacks. This is crucial!
      const sanitizedHtml = DOMPurify.sanitize(rawHtml);

      setReportHtml(sanitizedHtml);
      setIsModalOpen(true); // Open the modal now that we have content

    } catch (error) {
      console.error("Failed to load report:", error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Button
        onClick={() => handlePreviewReport(caseItem.case_id)}
        disabled={isLoading}
        className="h-8 px-3 text-xs"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-2" />
            Preview Report
          </>
        )}
      </Button>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>AI Generated Report for {caseItem.case_id}</DialogTitle>
        </DialogHeader>
        <div className="prose max-h-[70vh] overflow-y-auto p-4 border rounded-md">
            {/* The 'markdown-body' class applies the GitHub styling */}
            <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
