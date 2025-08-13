import React from 'react'
import create from 'zustand'
import produce from 'immer'
import { Constants } from '../utils/constants'

// Track state changes for debugging
const log = (config) => (set, get, api) =>
  config(
    (args) => {
      set(args)
      if (Constants.DEBUG_VERBOSITY === 'verbose') console.debug('MapStore state', get())
    },
    get,
    api
  )

// Set method will be an immer proxy
const immer = (config) => (set, get, api) => config((fn) => set(produce(fn)), get, api)

// Create a store
const useMapStore = create(
  log(
    immer((set, get) => ({
      enabled: false,

      origin: {
        longitude: null,
        latitude: null,
      },
      setOrigin: (longitude, latitude) => {
        set((state) => {
          if (state.origin.longitude !== longitude) state.origin.longitude = longitude
          if (state.origin.latitude !== latitude) state.origin.latitude = latitude
        })
      },

      currentCoordinates: {
        longitude: null,
        latitude: null,
      },
      setCurrentCoordinates: (longitude, latitude) => {
        set((state) => {
          if (state.currentCoordinates.longitude !== longitude)
            state.currentCoordinates.longitude = longitude
          if (state.currentCoordinates.latitude !== latitude)
            state.currentCoordinates.latitude = latitude
        })
      },

      zoom: null,
      setZoom: (zoom) => {
        set((state) => {
          if (state.zoom !== zoom) state.zoom = zoom
        })
      },
      pitch: null,
      setPitch: (pitch) => {
        set((state) => {
          if (state.pitch !== pitch) state.pitch = pitch
        })
      },
      bearing: null,
      setBearing: (bearing) => {
        set((state) => {
          if (state.bearing !== bearing) state.bearing = bearing
        })
      },

      // Data sources e.g. mainBuilding, otherBuildings, parcel, parcelBoundary, etc.
      sources: {},
      addSourceToStore: (key, value) => {
        set((state) => {
          state.sources[key] = value
        })
        if (Constants.DEBUG_VERBOSITY === 'minimal') console.debug('MapStore state', get())
      },
      addSourcesToStore: (data) => {
        set((state) => {
          state.sources = {
            ...state.sources,
            ...data,
          }
        })
        if (Constants.DEBUG_VERBOSITY === 'minimal') console.debug('MapStore state', get())
      },
      setDirtyOnVisibilityChange: (value) => {
        set((state) => {
          state.dirty = value
        })
      },
      setActiveMode: (which) => {
        set((state) => {
          state.sources.mode = which
        })
      },
      selectAduModel: (id) => {
        set((state) => {
          if (state.sources.selectAduModel !== id) state.sources.selectedAduModel = id
          if (!id) state.sources.adu = null
        })
      },
      updateDebugMesh: (obj, anchor) => {
        set((state) => {
          state.sources.debugMesh = {
            obj,
            anchor,
          }
        })
      },

      layers: [],
      shadow: {
        enable: false,
        extrusions: [],
        models: [],
      },

      toggleShadows: (value) => {
        set((state) => {
          state.shadow.enable = !!value
        })
      },

      flashMessages: {
        enabled: false,
        queue: [],
        enable: () => {
          set((state) => {
            state.flashMessages.enabled = true
          })
        },
        pushToQueue: (msg, type) => {
          set((state) => {
            if (state.flashMessages.enabled && msg) {
              // Add to the end
              state.flashMessages.queue.push({
                message: msg,
                type: type,
              })
            }
          })
        },
        popFromQueue: () => {
          set((state) => {
            if (state.flashMessages.enabled && state.flashMessages.queue.length > 0) {
              // Remove first item
              state.flashMessages.queue.shift()
            }
          })
        },
      },

      reset: (stores) => {
        set((state) => {
          state.longitude = null
          state.latitude = null
          state.zoom = null
          state.sources = {}
        })
      },
    }))
  )
)

/**
 * Provide React hooks which manages the state of map.
 * @namespace MapStore
 * @author Sourabh Soni <https://prolincur.com>
 */
const MapStore = {
  /**
   * A store and a React hook, which manages the state of the map
   * @method
   */
  useStore: useMapStore,

  /**
   * A React hook, which return the reference to a variable stored in {@link MapStore}.
   * This hook ensures that React does not get re-render on change of value of the
   * variable.
   *
   * @property {func} transform Function which takes state and returns data
   *
   */
  useStoreVarRef: (transform) => {
    // Reference of variable with initial value
    const varRef = React.useRef(transform(useMapStore?.getState()))
    // Connect to the store on mount, disconnect on unmount, catch state-changes in a reference
    React.useEffect(
      () => useMapStore?.subscribe((value) => (varRef.current = value), transform),
      [transform]
    )

    return varRef
  },
}

export { MapStore }
