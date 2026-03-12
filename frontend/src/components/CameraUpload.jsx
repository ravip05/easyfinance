/**
 * components/CameraUpload.jsx
 *
 * unified document upload component
 * on native: shows camera + gallery + file picker buttons
 * on web: shows standard file input
 *
 * uses capacitor camera plugin on native platforms
 * 48px touch targets on all buttons for store compliance
 *
 * props:
 *   onCapture(file)  fn — called with a File object after capture
 *   accept           string — accepted file types (default: 'image/*,.pdf')
 *   label            string — button label for web (default: 'Upload Document')
 */
import { isNative } from '../utils/platform'

function base64ToBlob(base64, mimeType) {
  const bytes = atob(base64)
  const buffer = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i)
  return new Blob([buffer], { type: mimeType })
}

export default function CameraUpload({ onCapture, accept = 'image/*,.pdf', label = 'Upload Document' }) {
  async function handleNativeCapture(source) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
      const cameraSource = source === 'camera' ? CameraSource.Camera : CameraSource.Photos

      const image = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: cameraSource,
        quality: 85,
        allowEditing: false,
        width: 1920,
        correctOrientation: true,
      })

      const blob = base64ToBlob(image.base64String, `image/${image.format}`)
      const file = new File([blob], `doc_${Date.now()}.${image.format}`, {
        type: `image/${image.format}`,
      })
      onCapture?.(file)
    } catch (e) {
      if (e.message !== 'User cancelled photos app') {
        console.error('camera error:', e)
      }
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0]
    if (file) onCapture?.(file)
    e.target.value = '' // reset so same file can be re-selected
  }

  if (isNative) {
    return (
      <div className="upload-options" id="camera-upload">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleNativeCapture('camera')}
          style={{ minHeight: 48, minWidth: 48 }}
          id="upload-camera-btn"
        >
          📷 Take Photo
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleNativeCapture('gallery')}
          style={{ minHeight: 48, minWidth: 48 }}
          id="upload-gallery-btn"
        >
          🖼 Gallery
        </button>
        <label className="btn btn-ghost btn-sm" style={{ minHeight: 48, minWidth: 48, cursor: 'pointer' }}>
          📁 File
          <input type="file" accept={accept} hidden onChange={handleFileInput} />
        </label>
      </div>
    )
  }

  // web fallback: standard file input
  return (
    <label
      className="btn btn-primary btn-sm upload-btn"
      style={{ minHeight: 48, cursor: 'pointer' }}
      id="upload-file-btn"
    >
      📎 {label}
      <input type="file" accept={accept} hidden onChange={handleFileInput} />
    </label>
  )
}
