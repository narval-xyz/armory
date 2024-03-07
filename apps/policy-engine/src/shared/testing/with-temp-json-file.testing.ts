import { unlink, writeFile } from 'fs/promises'
import { v4 as uuid } from 'uuid'

/**
 * Executes a callback function with a temporary JSON file.
 *
 * The file is created with the provided data and deleted after the callback is
 * executed.
 *
 * @param data - The data to be written to the temporary JSON file.
 * @param thunk - The callback function to be executed with the path of the
 * temporary JSON file.
 */
export const withTempJsonFile = async (data: string, thunk: (path: string) => void | Promise<void>) => {
  const path = `./test-temp-data-store-${uuid()}.json`

  await writeFile(path, data, 'utf-8')

  try {
    await thunk(path)
  } finally {
    await unlink(path)
  }
}
