import { getTime, subHours } from 'date-fns'

const getTimestamps = () => {
  const now = new Date()

  return {
    twenty_hours_ago: getTime(subHours(now, 20)),
    eleven_hours_ago: getTime(subHours(now, 11)),
    ten_hours_ago: getTime(subHours(now, 10)),
    nine_hours_ago: getTime(subHours(now, 9))
  }
}

export const getOkTransfers = () => {
  const timestamps = getTimestamps()

  return [
    {
      amount: '3000000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.twenty_hours_ago
    },
    {
      amount: '2000000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.twenty_hours_ago
    },
    {
      amount: '1500000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.twenty_hours_ago
    },
    {
      amount: '1000000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.twenty_hours_ago
    }
  ]
}

export const getNotOkTransfers = () => {
  const timestamps = getTimestamps()

  return [
    {
      amount: '3000000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.eleven_hours_ago
    },
    {
      amount: '2000000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.eleven_hours_ago
    },
    {
      amount: '1500000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.eleven_hours_ago
    },
    {
      amount: '1000000000',
      from: 'eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
      to: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
      chainId: 137,
      token: 'eip155:137/slip44/966',
      rates: {
        'fiat:usd': '0.99',
        'fiat:eur': '1.10'
      },
      initiatedBy: 'matt@narval.xyz',
      timestamp: timestamps.eleven_hours_ago
    }
  ]
}
