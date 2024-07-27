import { MongoAbility } from '@casl/ability';
import { Action } from '../permissions/entities/action.entity';
import { Organization } from '../../organizations/schemas/organization.schema';
import { accessibleBy } from '@casl/mongoose';

interface SlugQuery {
  _id: string;
}

interface OrQuery {
  $or: Array<SlugQuery>;
}

export class CaslUtils {
  static abilityToOrganizationSlugs(
    ability: MongoAbility,
    action: Action,
  ): string[] {
    const orQuery: OrQuery = accessibleBy(ability, action).ofType(
      Organization,
    ) as any as OrQuery;

    return orQuery['$or'].map((slugQuery: SlugQuery) => {
      return slugQuery['_id'];
    });
  }
}
