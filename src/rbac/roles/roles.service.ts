import { Injectable } from '@nestjs/common';
import { RoleDto } from './dto/role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<Role>,
  ) {}

  async create(roleDto: RoleDto): Promise<Role> {
    const role = new Role({ ...roleDto });
    return new this.roleModel(role).save();
  }

  async update(id: string, roleDto: RoleDto): Promise<Role> {
    return this.roleModel.findByIdAndUpdate(
      id,
      new Role({
        ...roleDto,
      }),
      { returnOriginal: false },
    );
  }

  async findAll(): Promise<Role[]> {
    // By populating we exclude deleted/non-existent permissions
    return this.roleModel.find().populate('permissions').exec();
  }

  findOne(id: string) {
    return this.roleModel.findById(id).populate('permissions').exec();
  }

  remove(id: string) {
    return this.roleModel.findByIdAndDelete(id).exec();
  }
}
