import { Plugins } from '@capacitor/core'
const { BackgroundGeolocation, Modals } = Plugins

// To start listening for changes in the device's location, add a new watcher.
// You do this by calling 'addWatcher' with an options object and a callback. An
// ID is returned, which can be used to remove the watcher in the future. The
// callback will be called every time a new location is available. Watchers can
// not be paused, only removed. Multiple watchers may exist at the same time.
const watcher_id = BackgroundGeolocation.addWatcher(
  {
    // If the "backgroundMessage" option is defined, the watcher will
    // provide location updates whether the app is in the background or the
    // foreground. If it is not defined, location updates are only
    // guaranteed in the foreground. This is true on both platforms.

    // On Android, a notification must be shown to continue receiving
    // location updates in the background. This option specifies the text of
    // that notification.
    backgroundMessage: 'Cancel to prevent battery drain.',

    // The title of the notification mentioned above. Defaults to "Using
    // your location".
    backgroundTitle: 'Tracking You.',

    // Whether permissions should be requested from the user automatically,
    // if they are not already granted. Defaults to "true".
    requestPermissions: true,

    // If "true", stale locations may be delivered while the device
    // obtains a GPS fix. You are responsible for checking the "time"
    // property. If "false", locations are guaranteed to be up to date.
    // Defaults to "false".
    stale: false,

    // The minimum number of metres between subsequent locations. Defaults
    // to 0.
    distanceFilter: 50,
  },
  function callback(location, error) {
    if (error) {
      if (error.code === 'NOT_AUTHORIZED') {
        Modals.confirm({
          title: 'Location Required',
          message:
            'This app needs your location, ' +
            'but does not have permission.\n\n' +
            'Open settings now?',
        }).then(function ({ value }) {
          if (value) {
            // It can be useful to direct the user to their device's
            // settings when location permissions have been denied.
            // The plugin provides 'openSettings' to do exactly
            // this.
            BackgroundGeolocation.openSettings()
          }
        })
      }
      return console.error(error)
    }

    return console.log(location)
  }
)

// When a watcher is no longer needed, it should be removed by calling
// 'removeWatcher' with an object containing its ID.
BackgroundGeolocation.removeWatcher({
  id: watcher_id,
})

// // The location object.
// {
//     // Longitude in degrees.
//     longitude: 131.723423719132,
//     // Latitude in degrees.
//     latitude: -22.40106297456,
//     // Radius of horizontal uncertainty in metres, with 68% confidence.
//     accuracy: 11,
//     // Metres above sea level (or null).
//     altitude: 65,
//     // Vertical uncertainty in metres, with 68% confidence (or null).
//     altitudeAccuracy: 4,
//     // Deviation from true north in degrees (or null).
//     bearing: 159.60000610351562,
//     // True if the location was simulated by software, rather than GPS.
//     simulated: false,
//     // Speed in metres per second (or null).
//     speed: 23.51068878173828,
//     // Time the location was produced, in milliseconds since the unix epoch.
//     time: 1562731602000
// }

// If you just want the current location, try something like this. The longer
// the timeout, the more accurate the guess will be. I wouldn't go below about
// 100ms.
function guess_location(callback, timeout) {
  let last_location
  let id = Plugins.BackgroundGeolocation.addWatcher(
    {
      requestPermissions: false,
      stale: true,
    },
    function (location) {
      last_location = location || undefined
    }
  )

  setTimeout(function () {
    callback(last_location)
    Plugins.BackgroundGeolocation.removeWatcher({ id })
  }, timeout)
}
