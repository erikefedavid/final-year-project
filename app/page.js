"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50"
      >
       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <motion.h1
              className="text-lg sm:text-xl font-bold shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              DocDigitize
            </motion.h1>
            <div className="flex items-center gap-1 sm:gap-3 min-w-0">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="px-2 sm:px-4">
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Log in</span>
                </Button>
              </Link>
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" className="px-2 sm:px-4">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </motion.div>
              </Link>
            </div>
            
          </div>
        </div>
      </motion.nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            AI-Powered Document Processing
          </motion.div>

          <motion.h1
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Scan. Extract.{" "}
            <span className="text-primary relative">
              Summarize.
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Turn your physical notes and documents into digital text with OCR,
            then get AI-powered summaries in seconds. Built for students.
          </motion.p>

          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="text-base px-8">
                  Start for Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="lg" className="text-base px-8">
                  Login
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three simple steps to digitize and understand your documents.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          {[
            {
              icon: Upload,
              title: "Upload",
              description:
                "Upload scanned images, PDFs, or Word documents. Drag and drop or browse files.",
              step: "01",
            },
            {
              icon: FileText,
              title: "Extract",
              description:
                "Our OCR engine reads and extracts text from your documents automatically.",
              step: "02",
            },
            {
              icon: Sparkles,
              title: "Summarize",
              description:
                "AI generates concise summaries, helping you study smarter and faster.",
              step: "03",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                <CardContent className="pt-8 pb-8 text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <item.icon className="h-6 w-6" />
                  </motion.div>
                  <div className="absolute top-4 right-4 text-4xl font-bold text-muted-foreground/20">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Why DocDigitize?</h2>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description:
                "Process documents in under 60 seconds. No waiting around.",
            },
            {
              icon: Shield,
              title: "Secure",
              description:
                "Your documents are encrypted and only accessible by you.",
            },
            {
              icon: Globe,
              title: "Works Anywhere",
              description:
                "Web-based. Works on any device with a browser. No installation needed.",
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-muted/50 transition-colors duration-300"
            >
              <motion.div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className="h-5 w-5" />
              </motion.div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
            <CardContent className="py-12 text-center relative">
              <h2 className="text-3xl font-bold mb-4">
                Ready to digitize your documents?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join students who are already saving hours on their study
                materials.
              </p>
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button size="lg" className="text-base px-8">
                    Get Started for Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <motion.footer
        className="border-t mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold">DocDigitize</p>
              <p className="text-sm text-muted-foreground">
                Built by David Erikefe-Dickson
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
               © 2026. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}