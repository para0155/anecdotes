"use client";

import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
}

export default function MarkdownStory({ content }: Props) {
  return (
    <div className="markdown-story">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
