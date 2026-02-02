import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import SparkMD5 from 'spark-md5'

const CREATE_DIRECT_UPLOAD = gql`
  mutation CreateDirectUpload($filename: String!, $contentType: String!, $byteSize: Int!, $checksum: String!) {
    createDirectUpload(filename: $filename, contentType: $contentType, byteSize: $byteSize, checksum: $checksum) {
      directUpload {
        signedId
        url
        headers
      }
      errors {
        field
        message
        code
      }
    }
  }
`

interface DirectUploadResult {
  signedId: string
  url: string
  headers: string
}

interface UploadProgress {
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  signedId?: string
}

export function useDirectUpload() {
  const { mutate: createDirectUpload } = useMutation(CREATE_DIRECT_UPLOAD)
  const uploading = ref(false)

  // Compute MD5 checksum as required by ActiveStorage
  async function computeChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const spark = new SparkMD5.ArrayBuffer()
    spark.append(buffer)
    const hash = spark.end(true) // Get raw binary hash
    return btoa(hash)
  }

  async function uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ signedId: string } | { error: string }> {
    uploading.value = true

    try {
      // Compute checksum using proper MD5
      const checksum = await computeChecksum(file)

      // Get presigned URL
      const result = await createDirectUpload({
        filename: file.name,
        contentType: file.type,
        byteSize: file.size,
        checksum,
      })

      const response = result?.data?.createDirectUpload

      if (response?.errors?.length) {
        return { error: response.errors[0].message }
      }

      if (!response?.directUpload) {
        return { error: 'Failed to get upload URL' }
      }

      const { signedId, url, headers } = response.directUpload as DirectUploadResult

      // Parse headers
      const uploadHeaders: Record<string, string> = {}
      if (headers) {
        try {
          const parsed = JSON.parse(headers)
          Object.assign(uploadHeaders, parsed)
        } catch {
          // Headers might be in different format
        }
      }

      // Upload file directly to storage
      await uploadToStorage(file, url, uploadHeaders, onProgress)

      return { signedId }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      return { error: message }
    } finally {
      uploading.value = false
    }
  }

  async function uploadToStorage(
    file: File,
    url: string,
    headers: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('PUT', url)
      
      // Set headers from presigned URL (includes Content-MD5, Content-Type)
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value)
      }
      // Only set Content-Type if not already in headers
      if (!headers['Content-Type']) {
        xhr.setRequestHeader('Content-Type', file.type)
      }

      xhr.send(file)
    })
  }

  async function uploadFiles(
    files: File[],
    onFileProgress?: (fileId: string, progress: UploadProgress) => void
  ): Promise<string[]> {
    const signedIds: string[] = []

    for (const file of files) {
      const fileId = crypto.randomUUID()
      
      onFileProgress?.(fileId, {
        id: fileId,
        progress: 0,
        status: 'uploading',
      })

      const result = await uploadFile(file, (progress) => {
        onFileProgress?.(fileId, {
          id: fileId,
          progress,
          status: 'uploading',
        })
      })

      if ('error' in result) {
        onFileProgress?.(fileId, {
          id: fileId,
          progress: 0,
          status: 'error',
          error: result.error,
        })
      } else {
        signedIds.push(result.signedId)
        onFileProgress?.(fileId, {
          id: fileId,
          progress: 100,
          status: 'completed',
          signedId: result.signedId,
        })
      }
    }

    return signedIds
  }

  return {
    uploading,
    uploadFile,
    uploadFiles,
  }
}
