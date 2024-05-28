import {Injectable} from "@nestjs/common";
import {BaseAbstractRepository} from "@app/shared";
import {UserComponent} from "@app/shared/entities/user-component.entity";
import {UserComponentsRepositoryInterface} from "@app/shared/interfaces/user-components.repository.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class UserComponentsRepository
    extends BaseAbstractRepository<UserComponent>
    implements UserComponentsRepositoryInterface
{
    constructor(
        @InjectRepository(UserComponent)
        private readonly userComponentEntity: Repository<UserComponent>,
    ) {
        super(userComponentEntity);
    }
}