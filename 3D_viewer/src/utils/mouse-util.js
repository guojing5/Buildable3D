import THREE from './three-wrapper'
import { debounce } from './debounce'
import { DragUpdate } from './drag-update'

const COLORS = {}

class MouseUtil {
  static applySettings(model, map, options) {
    if (!model) return
    const { hover, select, enableDragging, onClick } = options
    const { enable: enableHovering, color: hoverColor, opacity: hoverOpacity } = hover
    const { enable: es, color: selectColor, opacity: selectOpacity } = select

    const enableSelecting = enableDragging || es || false // also, when dragging is enabled

    const onMouseOver = (e) => {
      if (!enableHovering) {
        // No hover permitted
        map.getCanvasContainer().style.cursor = 'default'
        return
      }
      if (e.detail.selected) return

      if (e.detail.boundingBox?.material) {
        if (hoverColor) e.detail.boundingBox.material.color = new THREE.Color(hoverColor)
        if (hoverOpacity) e.detail.boundingBox.material.opacity = hoverOpacity
        e.detail.boundingBox.material.needsUpdate = true
      } else {
        if (hoverColor) MouseUtil._applyTemporaryColor(e.detail, '_preHoverColor', hoverColor)
        if (hoverOpacity)
          MouseUtil._applyTemporaryOpacity(e.detail, '_preHoverOpacity', hoverOpacity)
      }
    }

    const onMouseOut = (e) => {
      // Force disable of tooltip when hover out
      if (e.detail.tooltip) e.detail.tooltip.visible = false

      if (!enableHovering || e.detail?.selected) return

      if (e.detail.boundingBox?.material) {
        // e.detail.boundingBox.material.color = new THREE.Color(hoverColor)
        // e.detail.boundingBox.material.needsUpdate = true
      } else {
        if (hoverColor) MouseUtil._revertTemporaryColor(e.detail, '_preHoverColor')
        if (hoverOpacity) MouseUtil._revertTemporaryOpacity(e.detail, '_preHoverOpacity')
      }
    }

    const onSelectedChange = (e) => {
      if (!enableSelecting) {
        // No selection is permitted
        map.getCanvasContainer().style.cursor = 'default'
        // Still publish the click event on unselect
        onClick({
          type: 'click',
          event: e,
        })
        return
      }

      if (selectColor || selectOpacity) {
        if (e.detail.selected) {
          // Select
          if (e.detail.boundingBox?.material) {
            if (selectColor) e.detail.boundingBox.material.color = new THREE.Color(selectColor)
            if (selectOpacity) e.detail.boundingBox.material.opacity = selectOpacity
            e.detail.boundingBox.material.needsUpdate = true
          } else {
            if (selectColor)
              MouseUtil._applyTemporaryColor(e.detail, '_preSelectColor', selectColor)
            if (selectOpacity)
              MouseUtil._applyTemporaryOpacity(e.detail, '_preSelectOpacity', selectOpacity)
          }
        } else {
          // De-select
          if (e.detail.boundingBox?.material) {
            // e.detail.boundingBox.material.color = new THREE.Color(hoverColor)
            // e.detail.boundingBox.material.needsUpdate = true
          } else {
            if (selectColor) MouseUtil._revertTemporaryColor(e.detail, '_preSelectColor')
            if (selectOpacity) MouseUtil._revertTemporaryOpacity(e.detail, '_preSelectOpacity')
          }
        }
      } else {
        map.getCanvasContainer().style.cursor = 'default'
      }

      if (e.detail.selected) {
        onClick({
          type: 'select',
          event: e,
        })
      } else {
        onClick({
          type: 'deselect',
          event: e,
        })
      }
    }

    const onDragging = (e) => {
      if (!enableDragging || e.detail?.draggedAction !== 'translate' || !e.detail?.draggedObject) {
        // No other movement (e.g. Z-axis) is allowed
        map.getCanvasContainer().style.cursor = 'default'
        return
      }

      DragUpdate.performConstraintXYDragging(
        e.detail.draggedObject,
        {
          longitude: e.detail.finalCoords[0],
          latitude: e.detail.finalCoords[1],
        },
        true,
        true
      )
    }

    const onDraggingEnd = (e) => {
      if (!enableDragging || e.detail?.draggedAction !== 'translate' || !e.detail?.draggedObject) {
        return
      }
      DragUpdate.reshapeOnXYDragging(e.detail.draggedObject, {
        longitude: e.detail.draggedObject.coordinates[0],
        latitude: e.detail.draggedObject.coordinates[1],
      })
    }

    model.addEventListener('ObjectMouseOver', onMouseOver, false)
    model.addEventListener('ObjectMouseOut', onMouseOut, false)
    model.addEventListener('SelectedChange', onSelectedChange, false)
    model.addEventListener('ObjectDraggingCustom', onDragging, false)
    model.addEventListener('ObjectDragged', onDraggingEnd, false)

    return () => {
      try {
        model.removeEventListener('ObjectMouseOver', onMouseOver)
        model.removeEventListener('ObjectMouseOut', onMouseOut)
        model.removeEventListener('SelectedChange', onSelectedChange)
        model.removeEventListener('ObjectDraggingCustom', onDragging)
        model.removeEventListener('ObjectDragged', onDraggingEnd)
      } catch (err) {
        console.error(err)
      }
    }
  }

  static _applyTemporaryColor(object, key, tempColor) {
    let hasChanged = false
    object?.traverse((c) => {
      if (c.material) {
        if (!c.userData) c.userData = {}
        if (!c.userData[key]) {
          c.userData[key] = c.material.color
        }
        const color = COLORS[tempColor] || new THREE.Color(tempColor)
        COLORS[tempColor] = color
        if (c.material.color !== color) {
          c.material.color = color
          c.material.needsUpdate = true
          hasChanged = true
        }
      }
    })
    return hasChanged
  }

  static _revertTemporaryColor(object, key) {
    object?.traverse((c) => {
      if (c.material && c.userData?.[key] && c.material.color !== c.userData[key]) {
        c.material.color = c.userData[key]
        c.material.needsUpdate = true
      }
    })
  }

  static _applyTemporaryOpacity(object, key, tempOpacity) {
    let hasChanged = false
    object?.traverse((c) => {
      if (c.material) {
        if (!c.userData) c.userData = {}
        if (!c.userData[key]) {
          c.userData[key] = c.material.opacity
        }

        if (c.material.opacity !== tempOpacity) {
          c.material.opacity = tempOpacity
          c.material.needsUpdate = true
          hasChanged = true
        }
      }
    })
    return hasChanged
  }

  static _revertTemporaryOpacity(object, key) {
    object?.traverse((c) => {
      if (c.material && c.userData?.[key] && c.material.opacity !== c.userData[key]) {
        c.material.opacity = c.userData[key]
        c.material.needsUpdate = true
      }
    })
  }

  static _ON_CLICKED_SO_FAR = []
  static debounceOnClick(type, callback, delay) {
    if (type === 'debug') return
    MouseUtil._ON_CLICKED_SO_FAR.push(type)
    debounce(() => {
      if (MouseUtil._ON_CLICKED_SO_FAR.length === 0) return

      const parcelIdx = MouseUtil._ON_CLICKED_SO_FAR.indexOf('parcel')
      const hasParcel = parcelIdx > -1
      if (hasParcel) MouseUtil._ON_CLICKED_SO_FAR.splice(parcelIdx, 1)
      const buildableIdx = MouseUtil._ON_CLICKED_SO_FAR.indexOf('buildable')
      const hasBuidable = buildableIdx > -1
      if (hasBuidable) MouseUtil._ON_CLICKED_SO_FAR.splice(buildableIdx, 1)

      let filtered = MouseUtil._ON_CLICKED_SO_FAR[0]
      if (!filtered && hasBuidable) filtered = 'buildable'
      if (!filtered && hasParcel) filtered = 'parcel'
      MouseUtil._ON_CLICKED_SO_FAR = []

      if (filtered) callback(filtered)
    }, delay)()
  }
}

export { MouseUtil }
