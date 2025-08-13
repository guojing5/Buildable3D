/**
 * An utility class which help in query and change URL and its query parameter.
 *
 * @namespace UrlUtil
 * @author Sourabh Soni <https://prolincur.com>
 */
class UrlUtil {
  /**
   * Refresh the web page forcefully.
   * @memberof UrlUtil
   */
  static reloadPage = () => {
    window.location.reload()
  }

  static _getStorageKey(key) {
    if (!key) return
    return 'AA3DMAPVIEWER_' + key
  }

  /**
   * Save key and value to the {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage LocalStorage}
   * @param {string} key
   * @param {object|string} data
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage LocalStorage}
   */
  static saveToStorage(key, data) {
    key = UrlUtil._getStorageKey(key)
    const storage = window.localStorage
    if (data) storage?.setItem(key, JSON.stringify(data))
    else storage?.removeItem(key)
  }

  /**
   * Restore data from the {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage LocalStorage}
   * @param {string} key
   * @returns object
   */
  static restoreFromStorage(key) {
    key = UrlUtil._getStorageKey(key)
    const storage = window.localStorage
    const data = storage?.getItem(key)
    if (data) return JSON.parse(data)
    return null
  }
}

export { UrlUtil }
