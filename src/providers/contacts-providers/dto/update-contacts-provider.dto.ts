import { PartialType } from '@nestjs/swagger';
import { CreateContactsProviderDto } from './create-contacts-provider.dto';

export class UpdateContactsProviderDto extends PartialType(CreateContactsProviderDto) {}
