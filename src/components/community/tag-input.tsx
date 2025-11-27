"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { X, Plus, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
  className?: string
  availableTags?: Array<{ id: string; name: string; slug: string }>
}

export function TagInput({
  value,
  onChange,
  maxTags = 5,
  placeholder = "Adicionar tag...",
  className,
  availableTags = [],
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredTags = availableTags.filter(
    (tag) =>
      !value.includes(tag.name) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim()
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag])
      setInputValue("")
      setIsOpen(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Delay closing to allow for tag selection
    setTimeout(() => setIsOpen(false), 200)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      <Label htmlFor="tags">Tags (opcional)</Label>

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Hash className="h-3 w-3 mr-1" />
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTag(tag)}
                className="ml-1 h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input and Dropdown */}
      <div className="relative">
        <div className="flex items-center">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            id="tags"
            type="text"
            placeholder={value.length >= maxTags ? `Máximo de ${maxTags} tags` : placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={value.length >= maxTags}
            className="pl-10"
          />
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && filteredTags.length > 0 && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-auto">
            {filteredTags.slice(0, 5).map((tag) => (
              <Button
                key={tag.id}
                type="button"
                variant="ghost"
                className="w-full justify-start text-left px-3 py-2 h-auto"
                onClick={() => addTag(tag.name)}
              >
                <Hash className="h-3 w-3 mr-2" />
                {tag.name}
              </Button>
            ))}
          </div>
        )}

        {/* Add Custom Tag */}
        {inputValue.trim() && !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-left px-3 py-2 h-auto"
              onClick={() => addTag(inputValue)}
              disabled={value.length >= maxTags}
            >
              <Plus className="h-3 w-3 mr-2" />
              Criar tag &quot;{inputValue.trim()}&quot;
            </Button>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags} tags • Pressione Enter para adicionar
      </p>
    </div>
  )
}
