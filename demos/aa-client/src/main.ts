import { NarvalSdk } from '@narval/sdk'
import bodyParser from 'body-parser'
import express from 'express'
import ensureConfig from './config'
import { populateUsersWithCredentials } from './store'
import WalletProvider from './walletProvider'

const app = express()
const port = 3111

;(async () => {
  try {
    const config = await ensureConfig()
    const sdk = new NarvalSdk(config)
    const walletProvider = new WalletProvider(sdk)
    populateUsersWithCredentials()

    app.use(bodyParser.json())

    app.get('/', (req, res) => {
      console.log('Hello World!')
      res.send('Hello World!')
    })

    app.post('/signMessage', async (req, res) => {
      try {
        const { message, userId, walletId } = req.body
        await walletProvider.signMessage(userId, walletId, message)

        console.log('Signed message')
        res.json({ success: true })
      } catch (error) {
        res.status(500).send({ error: 'Failed to send', details: error })
      }
    })

    app.get('/entities', async (req, res) => {
      try {
        const entities = await walletProvider.getEntities()
        res.status(200).json(entities)
        return entities
      } catch (error) {
        res.status(500).send({ error: 'Failed to send', details: error })
      }
    })

    app.get('/policies', async (req, res) => {
      try {
        const policies = await walletProvider.getPolicies()
        res.status(200).json(policies)
        return policies
      } catch (error) {
        res.status(500).send({ error: 'Failed to send', details: error })
      }
    })

    app.post('/entities', async (req, res) => {
      try {
        const { id } = req.body
        await walletProvider.updateEntities(id)
        res.json({ success: true })
      } catch (error) {
        res.status(500).send({ error: 'Failed to create entity', details: error })
      }
    })

    app.post('/policies', async (req, res) => {
      try {
        const { id } = req.body
        await walletProvider.updatePolicies(id)
        res.json({ success: true })
      } catch (error) {
        res.status(500).send({ error: 'Failed to create policy', details: error })
      }
    })

    app.get('/wallets', async (req, res) => {
      try {
        const wallets = await walletProvider.getWallets()
        res.status(200).json(wallets)
        return wallets
      } catch (error) {
        res.status(500).send({ error: 'Failed to get wallets', details: error })
      }
    })

    app.post('/wallets', async (req, res) => {
      try {
        const { name, userId } = req.body
        if (!name || !userId) {
          throw new Error('Missing required fields')
        }
        const newWallet = walletProvider.generateWallet(name, userId)
        res.status(200).json(newWallet)
      } catch (error) {
        res.status(500).send({ error: 'Failed to generate wallet', details: error })
      }
    })

    app.put('/store/policies', async (req, res) => {
      try {
        const { policies } = req.body
        walletProvider.policyStore = policies

        console.log('Stored policies')
        res.status(200).json({ success: true })
      } catch (error) {
        res.status(500).send({ error: 'Failed to store policies', details: error })
      }
    })

    app.put('/store/entities', async (req, res) => {
      const { entities } = req.body
      walletProvider.entityStore = entities

      console.log('Stored entities')
      res.status(200).json({ success: true })
    })

    app.listen(port, () => {
      console.log(`Mock wallet provider API listening at http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start the server:', error)
    process.exit(1)
  }
})()
