import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../src/context/ThemeContext'
import { motion } from 'framer-motion'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-6 h-6 text-gray-800 dark:text-yellow-400" />
            ) : (
                <Sun className="w-6 h-6 text-yellow-500" />
            )}
        </motion.button>
    )
}
