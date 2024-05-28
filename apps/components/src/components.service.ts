import {Inject, Injectable} from '@nestjs/common';
import {
  Component,
  ComponentsRepositoryInterface,
  UserComponentsRepositoryInterface,
  UserEntity
} from "@app/shared";
import {ClientProxy} from "@nestjs/microservices";
import {firstValueFrom} from "rxjs";
import {ComponentDto} from "./dtos/Component.dto";

@Injectable()
export class ComponentsService {
  constructor(
      @Inject('ComponentsRepositoryInterface')
      private readonly componentsRepository: ComponentsRepositoryInterface,
      @Inject('UserComponentsRepositoryInterface')
      private readonly userComponentsRepository: UserComponentsRepositoryInterface,
      @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {
  }

  private async getUser(id: number) {
    const ob$ = this.authService.send<UserEntity>
    (
        { cmd: 'get-user' },
        { id },
    );

    return await firstValueFrom(ob$)
        .catch((err) => console.error(err));
  }

  async getUserProfile(userId: number) {
    const user = await this.getUser(userId);
    if (user){
      const userComponents = await this.userComponentsRepository.findWithRelations({
        where: [ {user}, {user:user} ],
        relations: ['component'],
        order: { sortOrder: 'ASC' },
      });
      return userComponents.map((uc) => uc.component);
    }
    return null;
  }

  async setProfile(userId: number, components: ComponentDto[]) {
    const user = await this.getUser(userId);
    if (user){
      const existingUserComponents = await this.userComponentsRepository.findWithRelations({
        where: [ {user}, {user:user} ]
      });
      if (existingUserComponents.length > 0) {
        await Promise.all(existingUserComponents.map(uc => this.userComponentsRepository.remove(uc)));

      }

      for (let i = 0; i < components.length; i++) {
        const component = await this.componentsRepository.findOneById(components[i].id);
        if (component) {
          const userComponent = this.userComponentsRepository.create({
            user: user,
            component,
            sortOrder: i + 1,
          });
          await this.userComponentsRepository.save(userComponent);
        }
      }
    }
  }

  async getUnusedComponents(userId: number):Promise<Component[]>{
    const usedComponents = await this.getUserProfile(userId);
    const allComponents = await this.componentsRepository.findAll();

    return allComponents.filter(
        (component) => !usedComponents.some((uc) => uc.id === component.id),
    );
  }
}
