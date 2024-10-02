/* eslint-disable no-console */
import 'dotenv/config'
import { SystemManager } from './data'

const main = async () => {
  const systemManagerArmory = await SystemManager.create()

  console.log('🏗️ Setting initial data')
  await systemManagerArmory.initializeEntities()

  console.log('🔒 Setting initial policies')
  await systemManagerArmory.initializePolicies()

  console.log('✅ Setup completed successfully')
}

main().catch(console.error)
