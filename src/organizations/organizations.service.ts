import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from './schemas/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  convertToEntity(createOrganizationDto: CreateOrganizationDto): Organization {
    return new Organization({
      slug: createOrganizationDto.slug,
      name: createOrganizationDto.name,
    });
  }

  create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const org = this.convertToEntity(createOrganizationDto);
    return new this.organizationModel(org).save();
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationModel.find().exec();
  }

  async findOne(id: string): Promise<Organization> {
    return this.organizationModel.findById(id).exec();
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationModel.findByIdAndUpdate(
      id,
      new Organization({
        name: updateOrganizationDto.name,
      }),
      { returnOriginal: false },
    );
  }

  async remove(id: string) {
    return this.organizationModel.findByIdAndDelete(id).exec();
  }
}
