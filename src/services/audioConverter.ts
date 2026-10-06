/**
 * Client-Side Audio Converter using Web Audio API
 * Decodes any browser-supported audio format (MP3, AAC, OGG, FLAC, M4A)
 * and encodes it into uncompressed 16-bit PCM WAV required by Windows AppEvents.
 */

export interface ConvertedAudioResult {
  dataUrl: string;
  blob: Blob;
  sizeBytes: number;
  sampleRate: number;
  channels: number;
  durationSeconds: number;
  wasConverted: boolean;
}

/**
 * Converts an audio File into an uncompressed 16-bit PCM WAV.
 */
export async function convertAudioToWav(file: File): Promise<ConvertedAudioResult> {
  const isAlreadyWav = file.type === 'audio/wav' || file.name.toLowerCase().endsWith('.wav')

  // If already WAV, we can still parse or return directly, but decoding guarantees valid PCM format
  const arrayBuffer = await file.arrayBuffer()

  // Use AudioContext to decode audio data
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.')
  }

  const audioCtx = new AudioCtx()
  let audioBuffer: AudioBuffer
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  } catch (err: any) {
    await audioCtx.close()
    throw new Error(`Failed to decode audio file "${file.name}": ${err?.message || 'Unsupported format'}`)
  }
  await audioCtx.close()

  // Encode AudioBuffer to 16-bit PCM WAV
  const wavBlob = audioBufferToWav(audioBuffer)
  const dataUrl = await blobToDataUrl(wavBlob)

  return {
    dataUrl,
    blob: wavBlob,
    sizeBytes: wavBlob.size,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
    durationSeconds: audioBuffer.duration,
    wasConverted: !isAlreadyWav,
  }
}

/**
 * Encodes an AudioBuffer into a RIFF WAVE Blob with 16-bit linear PCM format.
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = Math.min(2, buffer.numberOfChannels)
  const sampleRate = buffer.sampleRate
  const format = 1 // 1 = PCM
  const bitDepth = 16
  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  // Interleave channels
  const numSamples = buffer.length
  const dataLength = numSamples * blockAlign
  const bufferLength = 44 + dataLength
  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')

  // fmt subchunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true) // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true) // NumChannels
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true) // ByteRate
  view.setUint16(32, blockAlign, true) // BlockAlign
  view.setUint16(34, bitDepth, true) // BitsPerSample

  // data subchunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write PCM audio samples
  let offset = 44
  const channelData: Float32Array[] = []
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch))
  }

  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channelData[ch][i]
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample))
      // Scale to 16-bit signed integer [-32768, 32767]
      const intSample = sample < 0 ? sample * 32768 : sample * 32767
      view.setInt16(offset, intSample, true)
      offset += 2
    }
  }

  return new Blob([view], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
