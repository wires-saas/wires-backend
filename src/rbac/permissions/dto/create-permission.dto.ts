import { Action } from '../entities/action.entity';
import { Subject } from '../entities/subject.entity';

export class CreatePermissionDto {
  action: Action;
  subject: Subject;
}
