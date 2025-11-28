"use client"

import { useMemo } from "react"
import DOMPurify from "isomorphic-dompurify"

interface PostContentProps {
  content: string
  className?: string
}

export function PostContent({ content, className }: PostContentProps) {
  // Sanitize HTML content
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    })
  }, [content])

  return (
    <div
      className={`prose prose-gray dark:prose-invert max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}

