import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Shield, 
  Fingerprint, 
  Lock, 
  Key, 
  Sparkles, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Fingerprint,
      title: "Fingerprint Authentication",
      description: "Unlock your vault instantly with your fingerprint. No more typing master passwords.",
    },
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description: "Your passwords are encrypted on your device before being stored on our servers.",
    },
    {
      icon: Key,
      title: "Password Generator",
      description: "Generate strong, unique passwords with customizable length and character options.",
    },
    {
      icon: Sparkles,
      title: "Smart Organization",
      description: "Organize your passwords into folders and mark favorites for quick access.",
    },
  ];

  const benefits = [
    "Free forever - no premium tiers",
    "End-to-end encryption",
    "Cross-device sync",
    "Secure password sharing",
    "Auto-fill support",
    "Offline access",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">SecureVault</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/auth">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg" />
          <div className="container mx-auto px-4 py-24 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="h-4 w-4" />
                Free & Secure Password Manager
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Your passwords,{" "}
                <span className="text-primary">protected</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                SecureVault keeps all your passwords safe with fingerprint authentication 
                and military-grade encryption. Free, open, and built for privacy.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild className="text-base" data-testid="button-get-started">
                  <a href="/auth">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-base" data-testid="button-learn-more">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="mt-16 md:mt-24 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center fingerprint-pulse">
                  <Fingerprint className="w-16 h-16 md:w-20 md:h-20 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full fingerprint-scan pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why choose SecureVault?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Everything you need to manage your passwords securely, with no compromises.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Everything you need, nothing you don't
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8">
                    We believe security shouldn't cost a fortune. SecureVault gives you 
                    all the features you need to stay safe online, completely free.
                  </p>
                  <ul className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                        <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">example.com</p>
                          <p className="text-xs text-muted-foreground">user@email.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                        <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">mybank.com</p>
                          <p className="text-xs text-muted-foreground">john.doe</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                        <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">social-app.io</p>
                          <p className="text-xs text-muted-foreground">@johndoe</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to secure your passwords?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust SecureVault to keep their digital life safe.
            </p>
            <Button size="lg" asChild className="text-base" data-testid="button-start-now">
              <a href="/auth">
                Start Now - It's Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Lock className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-medium">SecureVault</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your passwords, your privacy, your security.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
