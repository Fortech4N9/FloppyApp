import {Injectable} from "@nestjs/common";
import {BaseAbstractRepository} from "@app/shared";
import {ComponentsRepositoryInterface} from "@app/shared/interfaces/components.repository.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {Component} from "@app/shared/entities/component.entity";
import {Repository} from "typeorm";

@Injectable()
export class ComponentsRepository
    extends BaseAbstractRepository<Component>
    implements ComponentsRepositoryInterface
{
    constructor(@InjectRepository(Component) private readonly componentEntity: Repository<Component>) {
        super(componentEntity);
    }
}