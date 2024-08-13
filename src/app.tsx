import { words } from './data'
import './app.css'
import { useCallback, useEffect, useRef, useState } from 'react'

const generateText = ({
  wordCount,
}: {
  wordCount: number
} = { wordCount: 20 }) => {
  return Array.from({ length: wordCount }, () => {
    const randomIndex = Math.floor(Math.random() * words.length)
    return words[randomIndex]
  }).join(' ')
}

function App() {
  const intervalRef = useRef<number>()
  const [countDown, setCountDown] = useState(50)
  const [input, setInput] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    function onKeyDown() {
      startTimer()
      document.removeEventListener('keydown', onKeyDown)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [text])

  const reset = useCallback(() => {
    setInput('')
    setText(generateText())
    setCountDown(50)
    clearTimer()
  }, [])

  useEffect(() => {
    setText(generateText())
    return reset
  }, [reset])

  function clearTimer() {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current)
    }
  }

  function startTimer() {
    const interval = setInterval(() => {
      setCountDown((prev) => {
        return prev - 1
      })
    }, 1000)
    intervalRef.current = interval
  }

  if (countDown <= 0) {
    clearTimer()
  }


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    const curIndex = value.length - 1
    if (countDown <= 0 || text[curIndex] === ' ' && value[curIndex] !== ' ') {
      return
    }
    if (value === text) {
      import('js-confetti')
        .then(({ default: JSConfetti }) => {
          new JSConfetti().addConfetti()
        })
      clearTimer()
    }
    setInput(value)
  }

  const words = text.split(' ')
  let index = 0

  return (
    <main>
      <header>
        <span>{countDown}</span>
        <button onClick={reset}>Reset</button>
      </header>

      <input
        onBlur={(evt) => {
          evt.target.focus()
        }}
        autoFocus
        type="text"
        value={input}
        onChange={input === text ? () => { } : handleChange}
      />
      <p>
        {words.map(word => {
          const letters = word.split('')
          const lettersJsx = letters.map((letter, i) => {
            const letterIndex = index + i
            const inputLetter = input[letterIndex]
            const isCursor = letterIndex === input.length
            return <Letter key={i} letter={letter} inputLetter={inputLetter} isCursor={isCursor} />
          })
          index += word.length + 1
          return (
            <span key={index}>
              {lettersJsx}
            </span>
          )
        })}
      </p>
      {input == null || input === '' && <p className='pulse'>Start typing to begin the timer</p>}
    </main>
  )
}

const getClassName = ({ letter, inputLetter }: { letter: string, inputLetter: string }) => {
  if (inputLetter == null) {
    return ''
  }
  if (inputLetter === letter) {
    return 'correct'
  }
  if (letter === ' ') {
    return 'incorrect-space'
  }
  return 'incorrect-letter'
}

function Letter({
  letter,
  inputLetter,
  isCursor
}: {
  letter: string
  inputLetter: string
  isCursor: boolean
}) {
  return (
    <span className={`letter ${getClassName({ letter, inputLetter })}`}>
      <>
        {letter}
        {isCursor && <span className="cursor" />}
      </>
    </span>
  )
}

export default App
