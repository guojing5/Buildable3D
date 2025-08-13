import React from 'react'
import PropTypes from 'prop-types'
import Loader from 'react-loader-spinner'

const Spinner = (props) => {
  const { enabled, height, width, type, color, style } = props
  const spinnerFill = {
    position: 'fixed',
    width: '100%',
    height: '100%',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    inset: 'auto',
    zIndex: 10000,
  }

  if (!enabled) return null

  return (
    <div style={{ ...spinnerFill, ...style }}>
      <Loader type={type} color={color} height={height} width={width} visible={true} />
    </div>
  )
}

Spinner.propTypes = {
  map: PropTypes.object,
  stores: PropTypes.object,
  color: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  type: PropTypes.oneOf(['TailSpin', 'Puff', 'Audio', 'BallTriangle']),
}

Spinner.defaultProps = {
  height: 50,
  width: 50,
  color: '#808080',
  type: 'TailSpin',
}

const DEFAULT_ID = 'nospinner'
const DEFAULT_ENABLED = false

class AppSpinner extends React.Component {
  static _defaultRef = null
  static _queueRef = []
  static setAnimating = (entry) => {
    // Maintain queue of spinner - support multiple
    const { enabled, id = DEFAULT_ID } = entry
    const existingIdx = AppSpinner._queueRef.map((item) => item.id).indexOf(id)
    if (enabled) {
      // Add to queue, if not already
      if (existingIdx < 0) AppSpinner._queueRef.push({ enabled, id })
      // Render latest
      AppSpinner._defaultRef?.updateState({ enabled, id })
    } else {
      // Remove from queue, if already
      if (existingIdx > -1) AppSpinner._queueRef.splice(existingIdx, 1)
      // Render last or stop the spinner
      const len = AppSpinner._queueRef.length
      const last =
        len > 0 ? AppSpinner._queueRef[len - 1] : { enabled: DEFAULT_ENABLED, id: DEFAULT_ID }
      AppSpinner._defaultRef?.updateState(last)
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      enabled: props.enabled,
      style: props.style || {},
    }
  }

  componentDidMount() {
    AppSpinner._defaultRef = this
  }

  componentWillUnmount() {
    AppSpinner._defaultRef = null
  }

  updateState = (entry) => {
    const { enabled } = entry
    this.setState({ enabled })
  }

  render() {
    const props = this.state
    return <Spinner {...props} />
  }
}

AppSpinner.propTypes = {
  /**
   * Whether to show spinner or not
   */
  enabled: PropTypes.bool,
  /**
   * Unique id of spinner
   */
  id: PropTypes.string,
}

AppSpinner.defaultProps = {
  enabled: DEFAULT_ENABLED,
  id: DEFAULT_ID,
}

/**
 * @param {object} entry - (enabled, tip, id)
 */
const setAnimateSpinner = (entry) => {
  AppSpinner.setAnimating(entry)
}

export { AppSpinner, setAnimateSpinner }
