import { MongoAbility } from '@casl/ability';
import { Action } from '../permissions/entities/action.entity';
import { accessibleBy } from '@casl/mongoose';
import { PipelineStage } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export class CaslUtils {
  static getUserOrganizationsPipelineStageFromAbility(
    ability: MongoAbility,
    action: Action,
    orgsToKeep?: string[],
  ): PipelineStage {
    // This CASL/Mongoose utility generate smth like this:
    // { '$or': [ { organizations: { $in: [org1, org2] } } ] }
    // We want to flatten it to ['org1', 'org2']
    const readableUsersPipeline = accessibleBy(ability, action).ofType(User);

    const filters: Array<Record<string, any>> = readableUsersPipeline[
      '$or'
    ] as Array<Record<string, any>>;

    const readableOrgs: string[] = filters.find(
      (filter) => !!filter.organizations,
    )?.organizations?.$in;

    if (orgsToKeep?.length > 0) {
      return {
        $match: {
          organizations: {
            $in: readableOrgs.filter((org) => orgsToKeep.includes(org)),
          },
        },
      };
    }

    return {
      $match: {
        organizations: {
          $in: readableOrgs,
        },
      },
    };
  }
}
