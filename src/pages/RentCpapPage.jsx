import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight, Calendar, User, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const featuredPost = {
    id: 1,
    title: "The Future of AI-Powered Diagnostics in Healthcare",
    excerpt: "Exploring how artificial intelligence is revolutionizing medical diagnosis and patient care, from early detection to personalized treatment plans.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop",
    category: "Innovation",
    author: "Dr. Sarah Chen",
    date: "March 15, 2026",
    readTime: "8 min read",
}

const blogPosts = [
    {
        id: 2,
        title: "Best Practices for Medical Equipment Maintenance",
        excerpt: "Learn how to extend the lifespan of your medical equipment with proper maintenance protocols and regular servicing schedules.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop",
        category: "Maintenance",
        author: "Michael Torres",
        date: "March 10, 2026",
        readTime: "5 min read",
    },
    {
        id: 3,
        title: "Understanding FDA Medical Device Regulations",
        excerpt: "A comprehensive guide to navigating FDA approval processes and compliance requirements for medical devices.",
        image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&h=400&fit=crop",
        category: "Compliance",
        author: "James Mitchell",
        date: "March 5, 2026",
        readTime: "10 min read",
    },
    {
        id: 4,
        title: "Telemedicine Equipment Essentials for 2026",
        excerpt: "Discover the must-have equipment for establishing or upgrading your telemedicine capabilities this year.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
        category: "Telemedicine",
        author: "Dr. Emily Park",
        date: "February 28, 2026",
        readTime: "6 min read",
    },
    {
        id: 5,
        title: "Sustainable Practices in Medical Equipment Manufacturing",
        excerpt: "How the medical equipment industry is embracing sustainability without compromising quality or safety standards.",
        image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop",
        category: "Sustainability",
        author: "Dr. Sarah Chen",
        date: "February 20, 2026",
        readTime: "7 min read",
    },
    {
        id: 6,
        title: "Training Staff on New Medical Technology",
        excerpt: "Effective strategies for onboarding your healthcare team when implementing new medical equipment and systems.",
        image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
        category: "Training",
        author: "Michael Torres",
        date: "February 15, 2026",
        readTime: "4 min read",
    },
]

const categories = ["All", "Innovation", "Maintenance", "Compliance", "Telemedicine", "Sustainability", "Training"]

export default function BlogPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-muted/30 py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog & Insights</h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Stay updated with the latest in medical technology and healthcare innovation
                        </p>
                    </div>
                </section>

                {/* Featured Post */}
                <section className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Link href={`/blog/${featuredPost.id}`} className="group block">
                            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                                <div className="overflow-hidden rounded-xl">
                                    <img
                                        src={featuredPost.image}
                                        alt={featuredPost.title}
                                        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div>
                                    <Badge variant="secondary">{featuredPost.category}</Badge>
                                    <h2 className="mt-4 text-2xl font-bold tracking-tight group-hover:text-accent sm:text-3xl">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                        {featuredPost.author}
                    </span>
                                        <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                                            {featuredPost.date}
                    </span>
                                        <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                                            {featuredPost.readTime}
                    </span>
                                    </div>
                                    <div className="mt-6">
                    <span className="inline-flex items-center font-medium text-foreground group-hover:text-accent">
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Categories */}
                <section className="border-b border-border">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                        category === "All"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Blog Posts Grid */}
                <section className="py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-xl font-semibold">Latest Articles</h2>
                        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {blogPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.id}`}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent hover:shadow-lg"
                                >
                                    <div className="overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <Badge variant="secondary" className="w-fit">{post.category}</Badge>
                                        <h3 className="mt-3 font-semibold leading-snug group-hover:text-accent">
                                            {post.title}
                                        </h3>
                                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{post.author}</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="bg-primary py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
                                Subscribe to Our Newsletter
                            </h2>
                            <p className="mt-4 text-primary-foreground/80">
                                Get the latest healthcare insights, product updates, and industry news delivered to your inbox.
                            </p>
                            <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-11 rounded-lg border-0 bg-primary-foreground px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-80"
                                />
                                <button
                                    type="submit"
                                    className="h-11 rounded-lg bg-foreground px-6 font-medium text-background transition-colors hover:bg-foreground/90"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
