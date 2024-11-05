import { EntitiesV, EntityVersion } from 'packages/policy-engine-shared/src/lib/schema/entity.schema.shared';
import { DataV1 } from './open-policy-agent.type.v1';
import { DataV2 } from './open-policy-agent.type.v2';
import { z } from 'zod';

type DataVersionMap = {
  '1': DataV1;
  '2': DataV2;
}
type DataMapType = {
  [V in EntityVersion]: z.ZodType<DataVersionMap[V]>
}

export const dataMap: DataMapType = {
  '1': DataV1,
  '2': DataV2
} as const;


export const getDataSchema = <Version extends EntityVersion>(version: Version): z.ZodType<DataVersionMap[Version]> => 
  dataMap[version];

export const Data = z.union([DataV1, DataV2]);
export type Data = DataV1 | DataV2;

type DataV<Version extends EntityVersion> = DataVersionMap[Version];

export type DataTransformer<Version extends EntityVersion> = (entities: EntitiesV<Version>) => DataV<Version>;

export type RequiredDataTransformer = Required<{
  [V in EntityVersion]: DataTransformer<V>
}>;
