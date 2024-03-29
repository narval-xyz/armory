'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import useStore from '../_hooks/useStore'
import { classNames } from '../_lib/utils'

const HealthcheckStatus = () => {
  const [status, setStatus] = useState({
    engineConnection: false,
    engineDataStore: false,
    entityDataUrl: false,
    policyDataUrl: false,
    entitySignatureUrl: false,
    policySignatureUrl: false,
    vaultConnection: false
  })
  const {
    engineUrl,
    engineClientId,
    engineClientSecret,
    entityDataStoreUrl,
    policyDataStoreUrl,
    entitySignatureUrl,
    policySignatureUrl,
    vaultUrl
  } = useStore()

  const checkPolicyDataConnection = async () => {
    try {
      await axios.get(policyDataStoreUrl)
      setStatus((prev) => ({ ...prev, policyDataUrl: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, policyDataUrl: false }))
    }
  }

  const checkPolicySignatureConnection = async () => {
    try {
      await axios.get(policySignatureUrl)
      setStatus((prev) => ({ ...prev, policySignatureUrl: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, policySignatureUrl: false }))
    }
  }

  const checkEntityDataConnection = async () => {
    try {
      await axios.get(entityDataStoreUrl)
      setStatus((prev) => ({ ...prev, entityDataUrl: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, entityDataUrl: false }))
    }
  }

  const checkEntitySignatureConnection = async () => {
    try {
      await axios.get(entitySignatureUrl)
      setStatus((prev) => ({ ...prev, entitySignatureUrl: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, entitySignatureUrl: false }))
    }
  }

  const checkEngineConnection = async () => {
    try {
      await axios.get(engineUrl)
      setStatus((prev) => ({ ...prev, engineConnection: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, engineConnection: false }))
    }
  }

  const checkEngineDataStore = async () => {
    try {
      await axios.post(`${engineUrl}/tenants/sync`, null, {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })
      setStatus((prev) => ({ ...prev, engineDataStore: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, engineDataStore: false }))
    }
  }

  const checkVaultConnection = async () => {
    try {
      await axios.get(vaultUrl)
      setStatus((prev) => ({ ...prev, vaultConnection: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, vaultConnection: false }))
    }
  }

  useEffect(() => {
    checkPolicyDataConnection()
    checkPolicySignatureConnection()
    checkEntityDataConnection()
    checkEntitySignatureConnection()
    checkEngineConnection()
    checkEngineDataStore()
    checkVaultConnection()
  }, [])

  return (
    <div className="flex flex-col gap-12">
      <div className="text-nv-2xl">Healthcheck Status</div>
      <div className="flex gap-24">
        <div className="flex flex-col gap-4">
          <div className="text-nv-xl">Data Store</div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Entity Data URL</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.entityDataUrl ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.entityDataUrl ? 'Connected' : 'Disconnected'}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Entity Signature URL</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.entitySignatureUrl ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.entitySignatureUrl ? 'Connected' : 'Disconnected'}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Policy Data URL</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.policyDataUrl ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.policyDataUrl ? 'Connected' : 'Disconnected'}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Policy Signature URL</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.policySignatureUrl ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.policySignatureUrl ? 'Connected' : 'Disconnected'}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-nv-xl">Policy Engine</div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Connection</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.engineConnection ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.engineConnection ? 'Connected' : 'Disconnected'}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Data Store</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.engineDataStore ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.engineDataStore ? 'Synced' : 'Unsynced'}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-nv-xl">Vault</div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Connection</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.vaultConnection ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.vaultConnection ? 'Connected' : 'Disconnected'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthcheckStatus
