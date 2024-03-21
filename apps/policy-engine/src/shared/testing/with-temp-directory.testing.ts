import { mkdir, rm } from 'fs/promises'
import { v4 as uuid } from 'uuid'

export const withTempDirectory = async (
  thunk: (path: string) => Promise<void>,
  option?: { cleanAfter: boolean }
): Promise<void> => {
  const cleanAfter = option?.cleanAfter ?? true
  const path = `/tmp/armory-temp-test-directory-${uuid()}`

  try {
    await mkdir(path)
    await thunk(path)
  } finally {
    if (cleanAfter) {
      await rm(path, { recursive: true })
    }
  }
}
