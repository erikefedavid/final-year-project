"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="w-full min-w-0 overflow-hidden break-words">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 break-words">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3 mb-2 break-words">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mt-2 mb-1 break-words">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed break-words overflow-hidden">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1 overflow-hidden">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1 overflow-hidden">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed break-words">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary pl-4 italic my-2 overflow-hidden">
              {children}
            </blockquote>
          ),
          code: ({ inline, children, ...props }) =>
            inline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm break-all">
                {children}
              </code>
            ) : (
              <pre className="bg-muted rounded-md p-3 my-2 overflow-x-auto max-w-full">
                <code className="text-sm whitespace-pre-wrap break-words">
                  {children}
                </code>
              </pre>
            ),
          pre: ({ children }) => (
            <pre className="bg-muted rounded-md p-3 my-2 overflow-x-auto max-w-full whitespace-pre-wrap break-words">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline break-all"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto max-w-full my-2">
              <table className="min-w-0 border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-1.5 text-left font-semibold bg-muted">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-1.5 break-words">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ""}
              className="max-w-full h-auto rounded my-2"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}