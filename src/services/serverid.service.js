import BaseService from './base.service';
import ServerId from '../models/serverid.model';
import { compare, hash } from 'bcrypt';
import { UserInputError } from 'apollo-server-express';

const HASH_ROUNDS = 12;

class ServeridService extends BaseService {

    constructor() {
        super(ServerId);
    }

    async login(id, server_ip) {
        const serverid = await this.findByServerId(id);

        if (!serverid) {
            return;
        }

        if (!await compare(server_ip, serverid.server_ip)) {
            return;
        }

        delete serverid.server_ip;

        return serverid;
    }

    async createServerid(editServeridReq) {
        editServeridReq.serverport = await hash(editserveridReq.password, HASH_ROUNDS);
        delete editserveridrReq.server_port;
        delete editserveridrReq.server_name;

        editServeridReq.server_country = editServeridReq.server_country || 'SERVERID';

        const user = await User.query().insert(editServeridReq);

        return user;
    }

    async editUser(id, editServeridReq) {
        if (!editServeridReq.server_name) {
            delete editServeridReq.server_name;
        }
        if (!editServeridReq.server_ip) {
            delete editServeridReq.server_ip;
        }

        if (editServeridReq.email) {
            const serverid = await this.findByServerid(editServeridReq.server_ip);

            if (serverid && serverid.id !== id) {
                throw new UserInputError('Server already exists!');
            }
        }

        await User.query().findById(id).patch(editServeridReq);

        return this.findById(id);
    }

    async deleteUser(id) {
        const user = await this.findById(id);

        await User.query().deleteById(id);

        return user;
    }

    async changePassword(id, password, newPassword) {
        const user = await this.findById(id);

        if (!await compare(password, user.password)) {
            return false;
        }

        newPassword = await hash(newPassword, HASH_ROUNDS);

        await User.query().findById(id).patch({
            password: newPassword
        });

        return true;
    }

    async findByEmail(email) {
        return User.query().findOne('email', email);
    }

}

export const userService = new UserService(); //will complete later im lazy