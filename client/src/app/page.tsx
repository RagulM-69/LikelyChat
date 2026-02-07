"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Zap, Shield, Users, Globe, ArrowRight } from "lucide-react";
import { InteractiveBackground } from "@/components/ui/interactive-background";

import { ShoshinshaMark } from "@/components/ui/logo";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen text-white overflow-hidden relative selection:bg-cosmic-500/30">
      <InteractiveBackground />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 glass border-b border-white/5 mx-4 mt-4 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-green-500 neon-text-glow flex items-center gap-3"
        >
          <ShoshinshaMark className="w-8 h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          ENDHA AALUNGA NEENGA?
        </motion.div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5" onClick={() => router.push('/login')}>Login</Button>
          <Button
            className="bg-cosmic-600 hover:bg-cosmic-500 text-white border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300"
            onClick={() => router.push('/register')}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cosmic-600/20 blur-[120px] rounded-full pointer-events-none"
        />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
        >
          CONNECT BEYOND <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple neon-text-glow">LIMITS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
        >
          A next-generation communication platform built for the stars.
          Experience ultra-low latency voice, video, and chat in a universe of your own.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-full bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105"
            onClick={() => router.push('/register')}
          >
            Launch App <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md"
          >
            Explore Features
          </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {[
          { icon: Zap, title: "Warp Speed", desc: "Real-time delivery faster than light." },
          { icon: Shield, title: "Void Secure", desc: "Encryption that even black holes can't break." },
          { icon: Users, title: "Galactic Groups", desc: "Communities with infinite scalability." },
          { icon: Globe, title: "Universal Access", desc: "Connect from any quadrant in the galaxy." },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl glass-card hover:bg-cosmic-800/50 transition-all duration-500 group border border-white/5 hover:border-cosmic-500/30"
          >
            <div className="w-14 h-14 rounded-xl bg-cosmic-900/50 flex items-center justify-center mb-6 border border-white/10 group-hover:border-cosmic-500/50 transition-colors">
              <feature.icon className="w-7 h-7 text-cosmic-400 group-hover:text-neon-blue transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cosmic-200 transition-colors">{feature.title}</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
