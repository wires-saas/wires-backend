import { TagRule, TagRuleOperator } from '../../tags/schemas/tag-rule.schema';
import {
  FilterMatchMode,
  TagFilter,
} from '../../tags/schemas/tag-filter.schema';

export class TagUtils {
  static ruleToMongoQuery = (rule: TagRule): Record<string, any> => {
    const query: Record<string, any> = { [rule.field]: {} };

    if (rule.filters.length === 1) {
      query[rule.field] = TagUtils.filterToMongoQuery(rule.filters[0]);
      return query;
    }

    if (rule.operator === TagRuleOperator.AND) {
      query[rule.field]['$and'] = rule.filters.map((filter) =>
        TagUtils.filterToMongoQuery(filter),
      );
    } else {
      query[rule.field]['$or'] = rule.filters.map((filter) =>
        TagUtils.filterToMongoQuery(filter),
      );
    }
    return query;
  };

  static filterToMongoQuery = (filter: TagFilter): Record<string, any> => {
    switch (filter.filterType) {
      case FilterMatchMode.EQUALS:
        return { $eq: filter.filterValue };
      case FilterMatchMode.NOT_EQUALS:
        return { $ne: filter.filterValue };
      case FilterMatchMode.CONTAINS:
        return { $regex: new RegExp(filter.filterValue as string, 'i') };
      case FilterMatchMode.NOT_CONTAINS:
        return {
          $not: { $regex: new RegExp(filter.filterValue as string, 'i') },
        };
      case FilterMatchMode.STARTS_WITH:
        return { $regex: new RegExp(`^${filter.filterValue}`, 'i') };
      case FilterMatchMode.ENDS_WITH:
        return { $regex: new RegExp(`${filter.filterValue}$`, 'i') };
      case FilterMatchMode.DATE_IS:
        // Special case for handling equality with day/month/year and not full timestamp
        return {
          $gte: filter.filterValue,
          $lt: (filter.filterValue as number) + 24 * 60 * 60 * 1000,
        };

      case FilterMatchMode.DATE_IS_NOT:
        return { $ne: filter.filterValue };
      /* Won't work as it will do an implicit $and
        return {
          $lt: filter.filterValue,
          $gte: (filter.filterValue as number) + 24 * 60 * 60 * 1000,
        }; */
      case FilterMatchMode.DATE_BEFORE:
        return { $lte: filter.filterValue };
      case FilterMatchMode.DATE_AFTER:
        return { $gte: filter.filterValue };
      case FilterMatchMode.GREATER_THAN:
        return { $gte: filter.filterValue };
      case FilterMatchMode.LESS_THAN:
        return { $lte: filter.filterValue };
      case FilterMatchMode.IN:
        return { $in: filter.filterValue };
      default:
        return {};
    }
  };
}
