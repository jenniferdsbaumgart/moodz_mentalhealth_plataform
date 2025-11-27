"use client"

import { PostCategory } from "@prisma/client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { POST_CATEGORIES } from "@/lib/constants/community"

interface CategoryTabsProps {
  value: PostCategory | "all"
  onValueChange: (value: PostCategory | "all") => void
  counts?: Record<PostCategory | "all", number>
}

export function CategoryTabs({ value, onValueChange, counts }: CategoryTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
        <TabsTrigger
          value="all"
          className="text-xs py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium">Todos</span>
            {counts?.all && counts.all > 0 && (
              <Badge variant="secondary" className="text-xs h-4 px-1">
                {counts.all}
              </Badge>
            )}
          </div>
        </TabsTrigger>

        {Object.entries(POST_CATEGORIES).map(([category, config]) => (
          <TabsTrigger
            key={category}
            value={category}
            className="text-xs py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-medium">{config.label}</span>
              {counts?.[category as PostCategory] && counts[category as PostCategory] > 0 && (
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  {counts[category as PostCategory]}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
