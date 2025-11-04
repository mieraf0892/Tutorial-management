import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, label: "Active Students", value: "50,000+" },
  { icon: Award, label: "Expert Instructors", value: "200+" },
  { icon: TrendingUp, label: "Completion Rate", value: "94%" },
  { icon: Target, label: "Success Stories", value: "10,000+" },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-gradient-soft py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About TutorialHub</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Empowering learners worldwide through expert-led online education
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          <section>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At TutorialHub, we believe that quality education should be accessible to everyone, anywhere. 
              Our mission is to provide world-class learning experiences through expertly crafted tutorials 
              that help individuals develop the skills they need to succeed in today's digital world.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="text-center hover-lift">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Why Choose Us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-3">Expert Instructors</h3>
                  <p className="text-muted-foreground">
                    Learn from industry professionals with years of real-world experience 
                    and a passion for teaching.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-3">Practical Learning</h3>
                  <p className="text-muted-foreground">
                    Every tutorial includes hands-on projects and exercises to reinforce 
                    your learning and build your portfolio.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-3">Flexible Schedule</h3>
                  <p className="text-muted-foreground">
                    Learn at your own pace with lifetime access to all course materials 
                    and regular content updates.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-3">Community Support</h3>
                  <p className="text-muted-foreground">
                    Join a thriving community of learners, get help when you need it, 
                    and network with peers worldwide.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="text-center">
            <div className="rounded-2xl bg-gradient-primary p-12">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Join Our Community Today
              </h2>
              <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
                Start your learning journey with thousands of students worldwide and 
                transform your career with expert-led tutorials.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
