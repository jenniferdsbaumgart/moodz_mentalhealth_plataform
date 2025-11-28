"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReportDialog } from "./report-dialog"
import { Flag } from "lucide-react"

interface ReportButtonProps {
  postId?: string
  commentId?: string
  contentTitle?: string
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function ReportButton({
  postId,
  commentId,
  contentTitle,
  variant = "ghost",
  size = "sm",
  className
}: ReportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleClick = () => {
    setIsDialogOpen(true)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
      >
        <Flag className="h-4 w-4 mr-2" />
        Denunciar
      </Button>

      <ReportDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        postId={postId}
        commentId={commentId}
        contentTitle={contentTitle}
      />
    </>
  )
}

