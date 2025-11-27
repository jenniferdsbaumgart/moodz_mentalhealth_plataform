"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { VoteButtons } from "@/components/community/vote-buttons"
import { PostActions } from "@/components/community/post-actions"
import { ShareButton } from "@/components/community/share-button"
import { PostContent } from "@/components/community/post-content"
import { CommentSection } from "@/components/community/comment-section"
import { usePost, useVotePost } from "@/hooks/use-posts"
import { POST_CATEGORIES } from "@/lib/constants/community"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowLeft,
  Eye,
  Pin,
  Lock,
  Loader2
} from "lucide-react"

export default function PostPage() {
  const params = useParams()
  const postId = params.id as string

  const { data: post, isLoading, error } = usePost(postId)
  const votePost = useVotePost()

  const handleVote = (id: string, value: 1 | -1) => {
    votePost.mutate({ postId: id, value })
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando post...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Post não encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              O post que você está procurando pode ter sido removido ou não existe.
            </p>
            <Button asChild>
              <Link href="/community">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a comunidade
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const categoryInfo = POST_CATEGORIES[post.category]
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ptBR
  })

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/community">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a comunidade
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Post Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: categoryInfo.color,
                        color: categoryInfo.color
                      }}
                    >
                      {categoryInfo.label}
                    </Badge>
                    {post.isPinned && (
                      <Badge variant="secondary">
                        <Pin className="h-3 w-3 mr-1" />
                        Fixado
                      </Badge>
                    )}
                    {post.isLocked && (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Travado
                      </Badge>
                    )}
                  </div>

                  <PostActions post={post} />
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
                  {post.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-3 mt-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback>
                      {post.author.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {post.isAnonymous ? "Anônimo" : (post.author.name || "Usuário")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Content */}
                <div className="mb-6">
                  <PostContent content={post.content} />
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map(({ tag }) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator className="mb-6" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <VoteButtons
                      postId={post.id}
                      currentVote={post.userVote?.value}
                      voteCount={post._count.votes}
                      onVote={handleVote}
                    />

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post._count.comments} comentários
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.viewCount} visualizações
                      </span>
                    </div>
                  </div>

                  <ShareButton
                    postId={post.id}
                    postTitle={post.title}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <CommentSection
              postId={post.id}
              postAuthorId={post.authorId}
              totalComments={post._count.comments}
              isLocked={post.isLocked}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            {!post.isAnonymous && (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold">Sobre o autor</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.author.image || ""} />
                      <AvatarFallback>
                        {post.author.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.author.name || "Usuário"}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {post.author.role?.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Info */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold">Categoria</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryInfo.color }}
                  />
                  <span className="font-medium">{categoryInfo.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {categoryInfo.description}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href={`/community?category=${post.category}`}>
                    Ver mais posts nesta categoria
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tags */}
            {post.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold">Tags relacionadas</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map(({ tag }) => (
                      <Button
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        asChild
                      >
                        <Link href={`/community?tagId=${tag.id}`}>
                          #{tag.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
