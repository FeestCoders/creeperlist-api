import BaseService from './base.service';
import ServerId from '../models/serverid.model';
import { compare, hash } from 'bcrypt';
import { ServeridInputError } from 'apollo-server-express';

const HASH_ROUNDS = 12;

class serveridService extends BaseService {

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
        editServeridReq.serverport = await hash(editserveridReq.server_name, HASH_ROUNDS);
        delete editserveridrReq.server_port;
        delete editserveridrReq.server_name;

        editServeridReq.server_country = editServeridReq.server_country || 'SERVERID';

        const serverid = await Serverid.query().insert(editServeridReq);

        return serverid;
    }

    async editserverid(id, editServeridReq) {
        if (!editServeridReq.server_name) {
            delete editServeridReq.server_name;
        }
        if (!editServeridReq.server_ip) {
            delete editServeridReq.server_ip;
        }

        if (editServeridReq.serverid) {
            const serverid = await this.findByServerid(editServeridReq.server_ip);

            if (serverid && serverid.id !== id) {
                throw new ServeridInputError('Server already exists!');
            }
        }

        await Serverid.query().findById(id).patch(editServeridReq);

        return this.findById(id);
    }

    async deleteserverid(id) {
        const serverid = await this.findById(id);

        await Serverid.query().deleteById(id);

        return serverid;
    }

    async changeServer_name(id, server_name, newServer_name) {
        const serverid = await this.findById(id);

        if (!await compare(server_name, serverid.server_name)) {
            return false;
        }

        newServer_name = await hash(newServer_name, HASH_ROUNDS);

        await Serverid.query().findById(id).patch({
            server_name: newServer_name
        });

        return true;
    }

    async findByServerid(serverid) {
        return Serverid.query().findOne('serverid', serverid);
    }

}

export const ServeridService = new serveridService(); //will complete later im lazy