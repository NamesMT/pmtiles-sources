import type { AwsLiteS3 } from '@aws-lite/s3-types'
import { EtagMismatch } from 'pmtiles'
import { DynamicSource } from './dynamic'

/**
 * This source provide support for S3-compatible object storages.
 * 
 * This class is using `aws-lite` instead of the official `aws-sdk` for minimal overhead if you don't need complex AWS SDK features.
 */
export class ObjectStorageLiteSource extends DynamicSource {
  constructor(
    private liteS3: AwsLiteS3,
    private bucket: string,
    private pmtilesPath: string,
  ) {
    super(bucket + pmtilesPath, async ({
      offset,
      length,
      etag,
    }) => {
      const res = await this.liteS3.GetObject({
        Bucket: this.bucket,
        Key: this.pmtilesPath,
        Range: `bytes=${offset}-${offset + length - 1}`,

        // This workaround is needed because a aws-lite will throw if etag passed in but is `undefined`
        ...(etag ? { IfMatch: etag } : {}),
      })
        .catch((e) => {
          if (e instanceof Error && (e as Error).name === 'PreconditionFailed') {
            throw new EtagMismatch()
          }
          throw e
        })

      // Trying to extract ArrayBuffer from the response body
      const arrBuf = (((await res.Body?.transformToByteArray?.()) || res.Body) as any)?.buffer as ArrayBuffer

      if (!arrBuf)
        throw new Error('Failed to read response body')

      return {
        data: arrBuf,
        etag: res.ETag,
        expires: res.ExpiresString,
        cacheControl: res.CacheControl,
      }
    })
  }
}
