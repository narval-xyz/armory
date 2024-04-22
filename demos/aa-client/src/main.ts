import bodyParser from 'body-parser'
import express from 'express'
import default_sdk from './NarvalSdk'
import WalletProvider from './walletProvider'

const app = express()
const port = 3111
const sdk = default_sdk
const walletProvider = new WalletProvider(sdk)

app.use(bodyParser.json())

app.get('/', (req, res) => {
  console.log('Hello World!')
  res.send('Hello World!')
})

app.post('/signMessage', async (req, res) => {
  try {
    const { message, userId, walletId } = req.body
    await walletProvider.signMessage(userId, walletId)

    console.log('Signed message')
    res.json({ success: true })
  } catch (error) {
    res.status(500).send({ error: 'Failed to send', details: error })
  }
})

app.get('/entities', async (req, res) => {
  try {
    return walletProvider.getEntities()
  } catch (error) {
    res.status(500).send({ error: 'Failed to send', details: error })
  }
})

app.get('/policies', async (req, res) => {
  try {
    return walletProvider.getPolicies()
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

app.post('/wallets/generate', async (req, res) => {
  try {
    const { eoa } = req.body
    const newWallet = await walletProvider.generate4337Wallet()
    res.json(newWallet)
  } catch (error) {
    res.status(500).send({ error: 'Failed to generate wallet', details: error })
  }
})

app.listen(port, () => {
  console.log(`Mock wallet provider API listening at http://localhost:${port}`)
})
