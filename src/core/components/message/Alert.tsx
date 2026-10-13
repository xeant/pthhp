import { motion } from 'framer-motion'

type AlertProps = {
  message?: string | null
  type?: 'success' | 'info' | 'warning' | 'error' | string | null
}

const Alert = ({ message, type }: AlertProps) => {
  let bgColor
  switch (type) {
    case 'success':
      bgColor = 'bg-cyan-500 text-white'
      break
    case 'info':
      bgColor = 'bg-teal-500 text-white'
      break
    case 'warning':
      bgColor = 'bg-orange-500 text-white'
      break
    case 'error':
      bgColor = 'bg-red-500 text-white'
      break
    default:
      bgColor = 'bg-yellow-400 text-black'
  }
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
      <div className="py-2">
        <motion.div
          variants={parentVariants}
          viewport={{ once: false, amount: 0.3 }}
          className={`flex gap-2 items-center py-3 px-3 rounded-md text-sm ${bgColor}`}
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
          <motion.div>{message}</motion.div>
        </motion.div>
      </div>
    </>
  )
}
export default Alert
