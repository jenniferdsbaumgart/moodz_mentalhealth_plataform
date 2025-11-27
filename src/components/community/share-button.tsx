"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share2, Link, Facebook, Twitter, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
  postId: string
  postTitle: string
  className?: string
}

export function ShareButton({ postId, postTitle, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const postUrl = `${window.location.origin}/community/${postId}`
  const shareText = `Confira este post: "${postTitle}"`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast.success("Link copiado para a área de transferência!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Erro ao copiar link")
    }
  }

  const handleShare = (platform: string) => {
    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")
  }

  // Check if Web Share API is available
  const hasNativeShare = typeof navigator !== "undefined" && "share" in navigator

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: postTitle,
        text: shareText,
        url: postUrl,
      })
    } catch {
      // User cancelled or error occurred, fallback to copy link
      handleCopyLink()
    }
  }

  if (hasNativeShare) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Compartilhar
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Link copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copiar link
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("facebook")}>
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("twitter")}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link className="h-4 w-4 mr-2" />
          Copiar link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
