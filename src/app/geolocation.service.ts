import { Injectable } from '@angular/core'
import { Component } from '@angular/core'
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'

import { registerPlugin } from '@capacitor/core'

import { Device } from '@capacitor/device'
import { Geolocation, Position } from '@capacitor/geolocation'

import { BackgroundGeolocationPlugin, Location } from '@capacitor-community/background-geolocation'
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation')

import { db } from './firebase'
import { collection, doc, setDoc } from 'firebase/firestore/lite'

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  deviceId
  watcherId
  foreground = false

  constructor() {}

  start() {
    if (this.watcherId) {
      return console.warn('already started')
    }
    this.setupDeviceId()
    this.verifyPermissions()
    this.startTracking()
  }

  verifyPermissions() {
    Geolocation.checkPermissions()
      .then(v => {
        if (v.location == 'denied') {
          return alert('Location permission is required')
        }
      })
      .catch(error => {
        console.error('Geolocation.checkPermissions: ' + JSON.stringify(error))
      })
    // Geolocation.requestPermissions({ permissions: ['location'] })
  }

  setupDeviceId() {
    Device.getId()
      .then(data => {
        this.deviceId = data.identifier
        console.log('device id', this.deviceId)
      })
      .catch(err => console.error(err))
  }

  updateLocation(data: Data) {
    setDoc(doc(collection(db, 'locations'), this.deviceId), data)
      .then(v => {
        console.log('Updated: ' + this.deviceId, data)
      })
      .catch(error => {
        console.error(error)
      })
  }

  startTracking() {
    this.startBackgroundWatcher()
      .then(v => {
        console.log('started background watcher', { v })
      })
      .catch(error => {
        if (error.code == 'UNIMPLEMENTED') {
          console.warn('background watcher unimplemented, falling back to foreground watcher', {
            error,
          })
          this.foreground = true
          this.startForegroundWatcher()
            .then(v => {
              console.log('started foreground watcher', { v })
            })
            .catch(error => {
              console.error('foreground watcher: ' + JSON.stringify(error))
            })
        } else {
          console.error('background watcher: ' + JSON.stringify(error))
        }
      })
  }

  async startBackgroundWatcher() {
    const me = this
    this.watcherId = await BackgroundGeolocation.addWatcher(
      {
        // If the "backgroundMessage" option is defined, the watcher will
        // provide location updates whether the app is in the background or the
        // foreground. If it is not defined, location updates are only
        // guaranteed in the foreground. This is true on both platforms.

        // On Android, a notification must be shown to continue receiving
        // location updates in the background. This option specifies the text of
        // that notification.
        backgroundMessage: 'Sharing location.',

        // The title of the notification mentioned above. Defaults to "Using
        // your location".
        backgroundTitle: 'IGBO is running',

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
        console.log('BackgroundGeolocation update', { location, error })
        if (error) {
          if (error.code === 'NOT_AUTHORIZED') {
            if (
              window.confirm(
                'This app needs your location, but does not have permission.\n\n' +
                  'Open settings now?'
              )
            ) {
              BackgroundGeolocation.openSettings()
            }
          } else {
            console.error(error, { error })
          }
        } else if (!location) {
          console.warn('Location missing', { location })
        } else {
          me.handleBackgroundLocation(location)
        }
      }
    )
  }

  async removeBackgroundWatcher() {
    await BackgroundGeolocation.removeWatcher({
      id: this.watcherId,
    })
  }

  async handleBackgroundLocation(location: Location) {
    this.updateLocation(location)
  }

  // If you just want the current location, try something like this. The longer
  // the timeout, the more accurate the guess will be. I wouldn't go below about
  // 100ms.
  async getBackgroundLocation(callback, timeout) {
    let last_location
    let id = await BackgroundGeolocation.addWatcher(
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
      BackgroundGeolocation.removeWatcher({ id })
    }, timeout)
  }

  async startForegroundWatcher() {
    const me = this
    this.watcherId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      function callback(position: Position | null, error) {
        if (position) {
          me.updateLocation({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            accuracy: position.coords.accuracy,
            time: position.timestamp,
          })
        } else {
          console.error('Foreground location: ' + JSON.stringify(error))
        }
      }
    )
  }
}

interface Data {
  longitude: number
  latitude: number
  accuracy: number
  time: number | null
}
