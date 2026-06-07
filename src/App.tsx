import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from './hooks'
import { InputPhase } from './components/InputPhase'
import { SelectionPhase } from './components/SelectionPhase'
import { RevealPhase } from './components/RevealPhase'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut' as const,
}

function App() {
  const { state } = useAppContext()

  return (
    <div className="min-h-screen bg-gradient-warm pattern-dots">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl card-shadow-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl" aria-hidden="true">🎋</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold title-gradient">くじりん</h1>
                <p className="text-sm text-amber-700/70">Webで今すぐ引ける無料あみだくじ</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 md:p-8">
          <AnimatePresence mode="wait">
            {state.phase === 'input' && (
              <motion.div
                key="input"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <InputPhase />
              </motion.div>
            )}
            {state.phase === 'selection' && (
              <motion.div
                key="selection"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <SelectionPhase />
              </motion.div>
            )}
            {state.phase === 'reveal' && (
              <motion.div
                key="reveal"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <RevealPhase />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      </div>
    </div>
  )
}

export default App
