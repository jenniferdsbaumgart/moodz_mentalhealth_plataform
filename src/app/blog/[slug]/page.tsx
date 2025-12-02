import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AuthorCard } from "@/components/blog/article/author-card"
import { RelatedPosts } from "@/components/blog/article/related-posts"
import { generateMetaDescription } from "@/lib/blog/utils"
import { db } from "@/lib/db"

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await db.blogPost.findFirst({
    where: {
      slug: params.slug,
      status: "PUBLISHED",
      publishedAt: { not: null },
    },
    include: {
      author: {
        select: { name: true }
      },
      category: {
        select: { name: true }
      },
      tags: {
        include: {
          tag: {
            select: { name: true }
          }
        }
      },
    },
  })

  if (!post) {
    return {
      title: "Post não encontrado",
    }
  }

  const title = post.title
  const description = post.excerpt || generateMetaDescription(post.content)
  const url = `https://moodz.com/blog/${post.slug}`

  return {
    title,
    description,
    keywords: post.tags.map(t => t.tag.name).join(", "),
    authors: [{ name: post.author.name }],
    creator: post.author.name,
    publisher: "Moodz",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Moodz",
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
      locale: "pt_BR",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: post.tags.map(t => t.tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
      creator: "@moodzapp",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-site-verification",
    },
  }
}

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Fetch post with all relations
  const data = await db.blogPost.findFirst({
    where: {
      slug: params.slug,
      status: "PUBLISHED",
      publishedAt: { not: null },
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true }
      },
      category: {
        select: { id: true, name: true, slug: true, color: true, icon: true }
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true }
          }
        }
      },
    },
  })

  if (!data) {
    notFound()
  }

  // Update view count
  await db.blogPost.update({
    where: { id: data.id },
    data: { viewCount: { increment: 1 } },
  })

  // Fetch related posts (same category, excluding current)
  const relatedPosts = await db.blogPost.findMany({
    where: {
      categoryId: data.categoryId,
      status: "PUBLISHED",
      publishedAt: { not: null },
      id: { not: data.id },
    },
    include: {
      author: {
        select: { id: true, name: true }
      },
      category: {
        select: { id: true, name: true, slug: true, color: true }
      },
    },
    orderBy: {
      publishedAt: "desc"
    },
    take: 3,
  })

  return (
    <article className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Início
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium truncate">
              {data.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Category Badge */}
          <div className="mb-4">
            <Link href={`/blog?category=${data.category.slug}`}>
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                style={{
                  backgroundColor: data.category.color + '20',
                  borderColor: data.category.color,
                  color: data.category.color
                }}
              >
                {data.category.name}
              </Badge>
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            {data.title}
          </h1>

          {/* Excerpt */}
          {data.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {data.excerpt}
            </p>
          )}

          {/* Author and Meta */}
          <AuthorCard
            author={data.author}
            publishedAt={data.publishedAt!}
            readingTime={data.readingTime}
            viewCount={data.viewCount}
          />
        </div>
      </header>

      {/* Cover Image */}
      {data.coverImage && (
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <img
              src={data.coverImage}
              alt={data.title}
              className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-blockquote:border-primary/20 prose-blockquote:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />

          {/* Tags */}
          {data.tags.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">
                  Tags:
                </span>
                {data.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1 bg-muted/50 rounded-full hover:bg-muted"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <>
              <Separator className="my-12" />
              <RelatedPosts posts={relatedPosts} />
            </>
          )}
        </div>
      </main>
    </article>
  )
}


