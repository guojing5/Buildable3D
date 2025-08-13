import React from 'react'
import PropTypes from 'prop-types'
import { Provider as AlertProvider, useAlert } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'

const options = {
  position: 'bottom center',
  timeout: 5000,
  offset: '30px',
  transition: 'scale',
}

const FlashMessage = (props) => {
  const { stores, ...restProps } = props
  const enabled = stores?.useStore((state) => state.flashMessages.enabled)
  const enableFlashMessage = stores?.useStore((state) => state.flashMessages.enable)
  React.useEffect(() => {
    if (!enabled) {
      enableFlashMessage?.()
    }
  }, [enabled, enableFlashMessage])

  return (
    <AlertProvider template={AlertTemplate} {...options} {...restProps}>
      <AlertMessager stores={stores} />
    </AlertProvider>
  )
}

FlashMessage.propTypes = {
  stores: PropTypes.object,
}

FlashMessage.defaultProps = {
  stores: null,
}

const AlertMessager = (props) => {
  const { stores } = props
  const enabled = stores?.useStore((state) => state.flashMessages.enabled)
  const queue = stores?.useStore((state) => state.flashMessages.queue)
  const popFromQueue = stores?.useStore((state) => state.flashMessages.popFromQueue)
  const alert = useAlert()

  React.useEffect(() => {
    if (!enabled || !alert || !queue) return

    if (queue.length > 0) {
      const data = queue[0]
      if (data && data.message) {
        alert.show(data.message, {
          type: data.type || 'info',
          onOpen: () => {
            popFromQueue?.()
          },
          onClose: () => {},
        })
      }
    }
  }, [alert, enabled, popFromQueue, queue])
  return null
}

AlertMessager.propTypes = {
  stores: PropTypes.object,
}

AlertMessager.defaultProps = {
  stores: null,
}

export { FlashMessage }
