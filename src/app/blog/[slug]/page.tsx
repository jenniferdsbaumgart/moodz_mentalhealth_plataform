import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Clock, Eye, ArrowLeft, Calendar, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Metadata } from "next"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await db.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: {
        select: { id: true, name: true, image: true }
      },
      category: {
        select: { id: true, name: true, slug: true, color: true }
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    }
  })

  if (post) {
    // Increment view count
    await db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })
  }

  return post
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await db.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImage: true }
  })

  if (!post) {
    return { title: "Post não encontrado" }
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : undefined
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="min-h-screen">
      {/* Hero */}
      <div className="relative">
        {post.coverImage ? (
          <div className="h-[400px] relative">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        ) : (
          <div className="h-[200px] bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        <div className="container max-w-4xl mx-auto px-4">
          <div className={post.coverImage ? "-mt-32 relative z-10" : "pt-8"}>
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao blog
              </Link>
            </Button>

            <Badge
              variant="secondary"
              className="mb-4"
              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
            >
              {post.category.name}
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.image || ""} />
                  <AvatarFallback>
                    {post.author.name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <span>{post.author.name || "Autor"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.publishedAt!), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime || 5} min de leitura
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} visualizações
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 text-center">
          <h3 className="text-xl font-semibold mb-2">Gostou do conteúdo?</h3>
          <p className="text-muted-foreground mb-4">
            Junte-se à nossa comunidade e comece sua jornada de bem-estar mental.
          </p>
          <Button asChild>
            <Link href="/register">Criar conta gratuita</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
