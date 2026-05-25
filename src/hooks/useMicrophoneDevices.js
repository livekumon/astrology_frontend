import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'jyotish-selected-microphone'
export const DEFAULT_MIC_ID = 'default'

function readStoredDeviceId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_MIC_ID
  } catch {
    return DEFAULT_MIC_ID
  }
}

function writeStoredDeviceId(deviceId) {
  try {
    localStorage.setItem(STORAGE_KEY, deviceId)
  } catch {
    // ignore storage failures
  }
}

export function buildAudioConstraints(device) {
  if (!device?.deviceId || device.deviceId === DEFAULT_MIC_ID) {
    return { audio: true }
  }

  const audio = { deviceId: { exact: device.deviceId } }
  if (device.groupId) {
    audio.groupId = { exact: device.groupId }
  }
  return { audio }
}

export function useMicrophoneDevices() {
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState(readStoredDeviceId)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [activeMicLabel, setActiveMicLabel] = useState('')
  const streamRef = useRef(null)

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.enumerateDevices &&
    !!navigator.mediaDevices?.getUserMedia

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setActiveMicLabel('')
  }, [])

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return []
    }

    const listed = await navigator.mediaDevices.enumerateDevices()
    const microphones = listed.filter(
      (device) => device.kind === 'audioinput' && device.deviceId,
    )
    setDevices(microphones)
    return microphones
  }, [])

  const getSelectedDevice = useCallback(
    (deviceId = selectedDeviceId) => {
      if (!deviceId || deviceId === DEFAULT_MIC_ID) {
        return { deviceId: DEFAULT_MIC_ID, groupId: '', label: '' }
      }

      return (
        devices.find((device) => device.deviceId === deviceId) || {
          deviceId,
          groupId: '',
          label: '',
        }
      )
    },
    [devices, selectedDeviceId],
  )

  const openSelectedMic = useCallback(
    async (deviceId = selectedDeviceId) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.')
      }

      releaseStream()

      const device = getSelectedDevice(deviceId)
      let stream

      try {
        stream = await navigator.mediaDevices.getUserMedia(buildAudioConstraints(device))
      } catch (error) {
        if (device.deviceId !== DEFAULT_MIC_ID) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        } else {
          throw error
        }
      }

      streamRef.current = stream
      setPermissionGranted(true)

      const [track] = stream.getAudioTracks()
      setActiveMicLabel(track?.label || device.label || '')

      await refreshDevices()
      return stream
    },
    [getSelectedDevice, refreshDevices, releaseStream, selectedDeviceId],
  )

  const requestAccess = useCallback(
    async (deviceId = selectedDeviceId) => openSelectedMic(deviceId),
    [openSelectedMic, selectedDeviceId],
  )

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const microphones = await refreshDevices()
      if (cancelled) return

      if (
        selectedDeviceId !== DEFAULT_MIC_ID &&
        microphones.length > 0 &&
        !microphones.some((device) => device.deviceId === selectedDeviceId)
      ) {
        setSelectedDeviceId(DEFAULT_MIC_ID)
        writeStoredDeviceId(DEFAULT_MIC_ID)
      }
    })()

    if (!navigator.mediaDevices?.addEventListener) {
      return () => {
        cancelled = true
      }
    }

    const handleDeviceChange = async () => {
      const microphones = await refreshDevices()
      if (
        selectedDeviceId !== DEFAULT_MIC_ID &&
        microphones.length > 0 &&
        !microphones.some((device) => device.deviceId === selectedDeviceId)
      ) {
        setSelectedDeviceId(DEFAULT_MIC_ID)
        writeStoredDeviceId(DEFAULT_MIC_ID)
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      cancelled = true
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [refreshDevices, selectedDeviceId])

  useEffect(() => releaseStream, [releaseStream])

  const selectDevice = useCallback(
    async (deviceId) => {
      setSelectedDeviceId(deviceId)
      writeStoredDeviceId(deviceId)

      try {
        await openSelectedMic(deviceId)
      } catch {
        // Permission may be requested when the user starts voice input.
      }
    },
    [openSelectedMic],
  )

  return {
    devices,
    selectedDeviceId,
    selectDevice,
    requestAccess,
    permissionGranted,
    isSupported,
    refreshDevices,
    openSelectedMic,
    releaseStream,
    getMicStream: () => streamRef.current,
    activeMicLabel,
    getSelectedDevice,
  }
}
