import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization } from './schemas/organization.schema';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { accessibleBy } from '@casl/mongoose';
import { MongoAbility } from '@casl/ability';
import { Action } from '../rbac/permissions/entities/action.entity';

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
      address: {
        street: '',
        city: '',
        zip: '',
        country: createOrganizationDto.country || '',
      },
    });
  }

  create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const org = this.convertToEntity(createOrganizationDto);
    return new this.organizationModel(org).save();
  }

  async findAll(ability: MongoAbility): Promise<Organization[]> {
    return this.organizationModel
      .find(accessibleBy(ability, 'read').ofType(Organization))
      .exec();
  }

  async findOne(id: string): Promise<Organization> {
    return this.organizationModel
      .findById(id)
      .exec()
      .then((res) => {
        if (!res) {
          throw new NotFoundException(`Organization with id ${id} not found`);
        } else {
          return res;
        }
      });
  }

  async findOneWithAbility(
    id: string,
    ability: MongoAbility,
  ): Promise<Organization> {
    return this.organizationModel
      .findOne({
        $and: [
          accessibleBy(ability, Action.Read).ofType(Organization),
          { _id: id },
        ],
      })
      .exec()
      .then((res) => {
        if (!res) {
          throw new NotFoundException(`Organization with id ${id} not found`);
        } else {
          return res;
        }
      });
  }

  async update(
    ability: MongoAbility,
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationModel
      .findOneAndUpdate(
        {
          $and: [
            { _id: id },
            accessibleBy(ability, 'update').ofType(Organization),
          ],
        },
        new Organization({
          ...updateOrganizationDto,
          slug: undefined, // For convenience, we don't allow updating the slug
        }),
        { returnOriginal: false },
      )
      .then((res) => {
        if (!res) {
          throw new NotFoundException(`Organization with id ${id} not found`);
          // Maybe we should return a 401 here if user has access to the organization but not to update it..
        } else {
          return res;
        }
      });
  }

  async remove(ability: MongoAbility, id: string) {
    return this.organizationModel
      .findByIdAndDelete(
        id,
        accessibleBy(ability, 'delete').ofType(Organization),
      )
      .exec();
  }
}
