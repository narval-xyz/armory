'use client'

import { useEffect, useState } from 'react'
import useAuthServerApi from '../_hooks/useAuthServerApi'
import useDataStoreApi from '../_hooks/useDataStoreApi'
import useEngineApi from '../_hooks/useEngineApi'
import useVaultApi from '../_hooks/useVaultApi'
import { classNames } from '../_lib/utils'

const HealthcheckStatus = () => {
  const [status, setStatus] = useState({
    armoryConnection: false,
    engineConnection: false,
    vaultConnection: false,
    entityDataUrl: false,
    policyDataUrl: false
  })

  const { ping: pingArmory } = useAuthServerApi()
  const { ping: pingEngine } = useEngineApi()
  const { ping: pingVault } = useVaultApi()

  const { getEntityStore, getPolicyStore } = useDataStoreApi()

  const checkEntityDataConnection = async () => {
    try {
      await getEntityStore()
      setStatus((prev) => ({ ...prev, entityDataUrl: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, entityDataUrl: false }))
    }
  }

  const checkPolicyDataConnection = async () => {
    try {
      await getPolicyStore()
      setStatus((prev) => ({ ...prev, policyDataUrl: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, policyDataUrl: false }))
    }
  }

  const checkArmoryConnection = async () => {
    try {
      await pingArmory()
      setStatus((prev) => ({ ...prev, armoryConnection: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, armoryConnection: false }))
    }
  }

  const checkEngineConnection = async () => {
    try {
      await pingEngine()
      setStatus((prev) => ({ ...prev, engineConnection: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, engineConnection: false }))
    }
  }

  const checkVaultConnection = async () => {
    try {
      await pingVault()
      setStatus((prev) => ({ ...prev, vaultConnection: true }))
    } catch (e) {
      setStatus((prev) => ({ ...prev, vaultConnection: false }))
    }
  }

  useEffect(() => {
    checkEntityDataConnection()
    checkPolicyDataConnection()
    checkArmoryConnection()
    checkEngineConnection()
    checkVaultConnection()
  }, [])

  return (
    <div className="flex flex-col gap-12">
      <div className="text-nv-2xl">Healthcheck Status</div>
      <div className="flex gap-24">
        <div className="flex flex-col gap-4">
          <div className="text-nv-xl">Data Store</div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Entity Data</div>
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
            <div className="text-nv-md underline">Policy Data</div>
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
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-nv-xl">Auth Server</div>
          <div className="flex flex-col gap-2">
            <div className="text-nv-md underline">Connection</div>
            <div className="flex items-center gap-4">
              <div
                className={classNames(
                  'h-3 w-3 rounded-full',
                  status.armoryConnection ? 'bg-nv-green-500' : 'bg-nv-red-500'
                )}
              ></div>
              <div>{status.armoryConnection ? 'Connected' : 'Disconnected'}</div>
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
