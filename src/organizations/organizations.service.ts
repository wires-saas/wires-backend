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
      _id: createOrganizationDto.slug.toLowerCase().replace(/ /g, '-'),
      name: createOrganizationDto.name,
    });
  }

  create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const org = this.convertToEntity(createOrganizationDto);
    return new this.organizationModel(org).save();
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationModel
      .find()
      .populate(['adminContact', 'billingContact'])
      .exec();
  }

  async findOne(id: string): Promise<Organization> {
    return this.organizationModel
      .findById(id)
      .populate(['adminContact', 'billingContact'])
      .exec();
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationModel.findByIdAndUpdate(
      id,
      new Organization({
        ...updateOrganizationDto,
        slug: undefined, // For convenience, we don't allow updating the slug
      }),
      { returnOriginal: false },
    );
  }

  async remove(id: string) {
    return this.organizationModel.findByIdAndDelete(id).exec();
  }
}
