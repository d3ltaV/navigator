import { motion } from 'framer-motion'

export default function ComingSoon({ title }: { title: string }) {
    return (
        <div className="mx-auto max-w-4xl px-6 py-24">
            <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-semibold tracking-tight text-foreground"
            >
                {title}
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-3 text-muted-foreground"
            >
                This page is being rebuilt in React. Available on the current site at{' '}
                <a href={`http://localhost:3000${window.location.pathname}`} className="underline hover:text-navy">
                    localhost:3000{window.location.pathname}
                </a>
                .
            </motion.p>
        </div>
    )
}
