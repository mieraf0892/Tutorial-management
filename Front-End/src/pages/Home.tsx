import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TutorialCard from "@/components/TutorialCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { tutorialsData } from "@/data/tutorials";
import { Code, Palette, TrendingUp, Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Web Development", icon: Code, count: 450 },
  { name: "Design", icon: Palette, count: 320 },
  { name: "Marketing", icon: TrendingUp, count: 180 },
  { name: "Data Science", icon: Database, count: 250 },
];

const Home = () => {
  const featuredTutorials = tutorialsData.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      {/* Categories Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Popular Categories
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose from thousands of tutorials across various disciplines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/tutorials?category=${category.name}`}
              className="group"
            >
              <div className="p-6 rounded-xl border bg-card hover-lift hover-glow cursor-pointer">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-all">
                  <category.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} tutorials
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tutorials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured Tutorials
              </h2>
              <p className="text-muted-foreground text-lg">
                Hand-picked tutorials from industry experts
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/tutorials">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} {...tutorial} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" asChild>
              <Link to="/tutorials">
                View All Tutorials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
<section className="py-20 container mx-auto px-4">
  <div className="relative overflow-hidden rounded-2xl bg-primary p-12 md:p-16 text-center">
    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
    <div className="relative z-10">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
        Ready to Start Learning?
      </h2>
      <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
        Join thousands of students already learning on TutorialHub. Start your journey today!
      </p>
      <Button
        size="lg"
        variant="secondary"
        asChild
        className="shadow-xl"
      >
        <Link to="/register">  {/* Changed from /tutorials to /register */}
          Get Started Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  </div>
</section>

      <Footer />
    </div>
  );
};

export default Home;
