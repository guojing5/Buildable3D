import React from 'react'
import { When } from 'react-if'

const useRefWhen = (initial) => {
  const ref = React.useRef(initial)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const setRef = (value) => {
    ref.current = value
    setIsLoaded(!!value)
  }
  const WhenRef = (props) => {
    const { children } = props
    const renderChildrenLazily = () => {
      return children
    }
    return <When condition={isLoaded}>{renderChildrenLazily()}</When>
  }
  return [
    {
      get: () => ref.current,
      set: (value) => setRef(value),
    },
    WhenRef,
  ]
}

export { useRefWhen }
