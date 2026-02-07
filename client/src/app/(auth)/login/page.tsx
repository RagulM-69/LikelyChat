"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { InteractiveBackground } from "@/components/ui/interactive-background";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                email,
                password
            });
            console.log("Login success:", res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            router.push("/channels");
        } catch (err: any) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || err.response?.data || "Invalid credentials. Please try again.";
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
            <InteractiveBackground />

            <Button
                variant="ghost"
                className="absolute top-8 left-8 z-20 text-gray-400 hover:text-white"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 rounded-3xl glass-card relative z-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Welcome Back
                    </h2>
                    <p className="text-gray-500 mt-2">Enter the portal to continue</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cosmic-400 focus:ring-1 focus:ring-cosmic-400 transition-all placeholder:text-gray-700"
                            placeholder="commander@nebula.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cosmic-400 focus:ring-1 focus:ring-cosmic-400 transition-all placeholder:text-gray-700"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-base font-bold tracking-wide bg-gradient-to-r from-cosmic-600 to-cosmic-500 hover:from-cosmic-500 hover:to-cosmic-400 border border-white/10 shadow-lg shadow-cosmic-900/50"
                        disabled={loading}
                    >
                        {loading ? "Initializing..." : "LOG IN"}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    First time traveler?{" "}
                    <Link href="/register" className="text-cosmic-400 hover:text-cosmic-300 hover:underline transition-colors">
                        Create an ID
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
