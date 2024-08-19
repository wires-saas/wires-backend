import { MongoAbility } from '@casl/ability';
import { Action } from '../permissions/entities/action.entity';
import { accessibleBy } from '@casl/mongoose';
import { User } from '../../users/schemas/user.schema';
import { Organization } from '../../organizations/schemas/organization.schema';

export class CaslUtils {
  static getUserOrganizationsFromAbility(
    ability: MongoAbility,
    action: Action,
  ): Array<Organization['slug']> {
    // This CASL/Mongoose utility generate some complex pipeline stages like
    // { '$or': [ { organizations: { $in: [org1] } }, { organizations: { $in: [org2] } } ] }
    // We want to extract the org1, org2, etc. from the pipeline stage
    // Allowing for reusing and simplification
    const readableUsersPipeline: Record<string, any> = accessibleBy(
      ability,
      action,
    ).ofType(User);

    const allSlugs = readableUsersPipeline['$or'].reduce(
      (slugs: string[], orSubPart: { organizations: { $in: string[] } }) => {
        return [...slugs, ...orSubPart.organizations.$in];
      },
      [],
    );

    return [...new Set(allSlugs)] as string[];
  }
}
