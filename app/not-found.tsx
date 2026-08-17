'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[120px] leading-none md:text-[200px]">
        404
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="eyebrow">Page Not Found</motion.p>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for may have been moved, renamed, or is no longer available.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 flex gap-3">
        <Link href="/" className="btn-lux bg-foreground text-background"><Home className="h-4 w-4" /> Back Home</Link>
        <Link href="/shop" className="btn-lux border border-foreground"><ArrowLeft className="h-4 w-4" /> Shop Collection</Link>
      </motion.div>
    </div>
  );
}
