import { motion } from 'framer-motion'

const Warning = props => {
  const parentVariants = {
    onscreen: {
      transition: { staggerChildren: 0.2 },
    },
    offscreen: {
      transition: { staggerChildren: 0.2, staggerDirection: -1 },
    },
  }
  const variants = {
    onscreen: {
      y: 0,
      opacity: [0, 1],
      transition: {
        duration: 0.4,
      },
    },
    offscreen: {
      y: 25,
      opacity: 0,
    },
  }
  return (
    <>
      <div className="py-5">
        <motion.div
          variants={parentVariants}
          viewport={{ once: false, amount: 0.3 }}
          className="flex gap-2 items-center text-rose-100 bg-rose-600 border border-rose-700 py-4 px-3 rounded-lg text-sm"
        >
          <motion.div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <motion.div>{props?.message}</motion.div>
        </motion.div>
      </div>
    </>
  )
}
export default Warning
