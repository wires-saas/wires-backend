import { PlanType } from './plan-type.entity';
import { Action } from '../../rbac/permissions/entities/action.entity';
import { Subject } from '../../rbac/permissions/entities/subject.entity';

export const PlanTypePermissions: Record<
  PlanType,
  Array<{ action: Action; subject: Subject }>
> = {
  [PlanType.FREE]: [
    { action: Action.Manage, subject: Subject.Organization },
    { action: Action.Read, subject: Subject.Role },

    { action: Action.Manage, subject: Subject.User },
    { action: Action.Manage, subject: Subject.UserRole },
    { action: Action.Manage, subject: Subject.Billing },

    { action: Action.Manage, subject: Subject.Feed },
    { action: Action.Manage, subject: Subject.FeedRun },
    { action: Action.Manage, subject: Subject.Article },
    { action: Action.Manage, subject: Subject.Tag },

    { action: Action.Manage, subject: Subject.Block },
    { action: Action.Manage, subject: Subject.Folder },

    { action: Action.Manage, subject: Subject.Gpt },
    { action: Action.Manage, subject: Subject.GptRequest },
  ],
  [PlanType.BASIC]: [],
  [PlanType.EXTENDED]: [],
  [PlanType.CUSTOM]: [{ action: Action.Manage, subject: Subject.Role }],
};
