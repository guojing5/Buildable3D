import React from 'react'
import PropTypes from 'prop-types'
import '../../utils/three-wrapper'
import { Map } from '../../components/mapbox/map.component'

/**
 * Renders a PopupFeature on Mapbox
 * @component PopupFeature
 * @param {Props} props - React component properties
 * @author Sourabh Soni <https://prolincur.com>
 */
const PopupFeature = (props) => {
  const { map } = props
  const doneRef = React.useRef(false)
  const popupRef = React.useRef(null)

  const getHtml = (feature) => {
    const props = feature.properties
    const list = []
    Object.keys(props).forEach((key) => {
      list.push('<li>' + key + ' : ' + props[key] + '</li>')
    })
    return '<div><strong><ul>' + list.join('') + '</ul></strong></div>'
  }

  const onSelect = (e) => {
    const feature = e.detail
    if (feature && feature.state && feature.state.select) {
      popupRef.current?.remove()
      const coords = map.tb?.getFeatureCenter(feature, null, 0)
      popupRef.current = new Map.MapboxGl.Popup({ offset: 0 })
        .setLngLat(coords)
        .setHTML(getHtml(feature))
        .addTo(map)
    }
  }

  React.useLayoutEffect(() => {
    if (doneRef.current || !map) return

    Map.onStyleLoad({ current: map }, doneRef, () => {
      map.on('SelectedFeatureChange', onSelect)
    })
  })

  return null
}

PopupFeature.propTypes = {
  /**
   * Instance of a map
   */
  map: PropTypes.object,
}

PopupFeature.defaultProps = {}

export { PopupFeature }
