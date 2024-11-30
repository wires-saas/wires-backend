import { PlanType } from './plan-type.entity';
import { Action } from '../../rbac/permissions/entities/action.entity';
import { Subject } from '../../rbac/permissions/entities/subject.entity';

const noRestrictions: Array<{ action: Action; subject: Subject }> = [
  { action: Action.Manage, subject: Subject.Organization },
  { action: Action.Manage, subject: Subject.Role },

  { action: Action.Manage, subject: Subject.User },
  { action: Action.Manage, subject: Subject.UserRole },
  { action: Action.Manage, subject: Subject.Billing },

  { action: Action.Manage, subject: Subject.Feed },
  { action: Action.Manage, subject: Subject.FeedRun },
  { action: Action.Manage, subject: Subject.Article },
  { action: Action.Manage, subject: Subject.Tag },

  { action: Action.Manage, subject: Subject.Block },
  { action: Action.Manage, subject: Subject.Template },
  { action: Action.Manage, subject: Subject.Folder },

  { action: Action.Manage, subject: Subject.Gpt },
  { action: Action.Manage, subject: Subject.GptRequest },

  { action: Action.Manage, subject: Subject.ContactsProvider },
  { action: Action.Manage, subject: Subject.EmailsProvider },
];

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

    { action: Action.Read, subject: Subject.Feed },
    { action: Action.Read, subject: Subject.FeedRun },
    { action: Action.Read, subject: Subject.Article },
    { action: Action.Read, subject: Subject.Tag },

    { action: Action.Read, subject: Subject.Block },
    { action: Action.Read, subject: Subject.Template },
    { action: Action.Read, subject: Subject.Folder },

    { action: Action.Read, subject: Subject.Gpt },
    { action: Action.Read, subject: Subject.GptRequest },

    { action: Action.Read, subject: Subject.ContactsProvider },
    { action: Action.Read, subject: Subject.EmailsProvider },
  ],
  [PlanType.BASIC]: [
    // Disabling fine-grained permissions, and AI-related permissions
    ...noRestrictions.map((p) => {
      if ([Subject.Role, Subject.Gpt, Subject.GptRequest].includes(p.subject)) {
        return { subject: p.subject, action: Action.Read };
      } else {
        return p;
      }
    }),
  ],
  [PlanType.EXTENDED]: [
    // Disabling fine-grained permissions
    ...noRestrictions.map((p) => {
      if ([Subject.Role].includes(p.subject)) {
        return { subject: p.subject, action: Action.Read };
      } else {
        return p;
      }
    }),
  ],
  [PlanType.CUSTOM]: [...noRestrictions],
};
