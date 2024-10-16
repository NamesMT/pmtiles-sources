import type { RangeResponse, Source } from 'pmtiles'

export class DynamicSource implements Source {
  constructor(
    public key: string,
    private bytesGetter: (
      { offset, length, signal, etag }: { offset: number, length: number, signal?: AbortSignal, etag?: string }
    ) => Promise<RangeResponse>,
  ) {
  }

  getKey() {
    return this.key
  }

  async getBytes(
    offset: number,
    length: number,
    signal?: AbortSignal,
    etag?: string,
  ): Promise<RangeResponse> {
    return this.bytesGetter({ offset, length, signal, etag })
  }
}
